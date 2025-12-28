import Item from "../models/item.model.js";
import RestaurantProfile from "../models/restaurantProfile.model.js";

export const addItem = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;
        if(!restaurantId) {
            return res.status(400).json({ message: 'Restaurant ID is required in params' });
        }
        const { name, image, description, price, foodType, category } = req.body;
        
        if(!name || !description || !price || !foodType || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create new Item
        const item = new Item({
            name,
            description,
            price,
            restaurantId,
            foodType,
            category,
            image,
        });
        await item.save();

        await RestaurantProfile.findOneAndUpdate(
            { restaurantId },
            { $push: { items: item._id } }
        );

        res.status(201).json({ message: 'Item added successfully', item });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const editItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        if(!itemId) {
            return res.status(400).json({ message: 'Item ID is required' });
        }

        const { name, image, description, price, foodType, category } = req.body;

        if(!name || !description || !price || !foodType || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }


        const item = await Item.findByIdAndUpdate(itemId, {
            name,
            description,
            price,
            foodType,
            category,
            image
        }, { new: true });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item updated successfully', item });
    } catch (error) {
        console.error('Error editing item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        if(!itemId) {
            return res.status(400).json({ message: 'Item ID is required' });
        }

        const item = await Item.findByIdAndDelete(itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        await RestaurantProfile.findOneAndUpdate(
            { restaurantId: item.restaurantId },
            { $pull: { items: item._id } }
        );
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getItemsByRestaurant = async (req, res) => {
    try {
        const restaurantId = req.query.restaurantId;
        if(!restaurantId) {
            return res.status(400).json({ message: 'Restaurant ID is required' });
        }
        const items = await Item.find({ restaurantId });
        res.status(200).json({ items });
    } catch (error) {
        console.error('Error fetching items by restaurant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getItemsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        if(!category) {
            return res.status(400).json({ message: 'Category is required' });
        }
        const items = await Item.find({ category });
        res.status(200).json({ items });
    } catch (error) {
        console.error('Error fetching items by category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteAllItemsOfRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;
        if(!restaurantId) {
            return res.status(400).json({ message: 'Restaurant ID is required in params' });
        }

        const restaurantProfile = await RestaurantProfile.findOne({ restaurantId });
        if (!restaurantProfile) {
            return res.status(404).json({ message: 'Restaurant profile not found' });
        }
        if(req.userId.toString() !== restaurantProfile.owner.toString()) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }
        await Item.deleteMany({ restaurantId });
        res.status(200).json({ message: 'All items of the restaurant deleted successfully' });
    } catch (error) {
        console.error('Error deleting all items of restaurant:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};