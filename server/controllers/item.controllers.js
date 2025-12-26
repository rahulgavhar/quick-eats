import Item from "../models/item.model.js";
import RestaurantProfile from "../models/restaurantProfile.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
    try {
        const { name, description, price, foodType, category } = req.body;
        let imageUrl = null;
        if (req.file) {
            // Upload image to Cloudinary
            imageUrl = await uploadToCloudinary(req.file.path, 'item_images');
        }

        const restaurant = await RestaurantProfile.findOne({ owner: req.user._id });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found for the user' });
        }

        // Extract the actual ID from the document
        const restaurantId = restaurant._id;

        // Create new Item
        const item = new Item({
            name,
            description,
            price,
            restaurantId,
            foodType,
            category,
            image: imageUrl,
        });
        await item.save();
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

        const { name, description, price, foodType, category } = req.body;

        if(!name || !description || !price || !foodType || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if(req.file) {
            // Upload new image to Cloudinary
            const imageUrl = await uploadToCloudinary(req.file.path, 'item_images');
            req.body.image = imageUrl;
        }


        const item = await Item.findByIdandUpdate(itemId, {
            name,
            description,
            price,
            foodType,
            category,
            image: req.body.image
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
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getItemsByOwner = async (req, res) => {
    try {
        const restaurant = await RestaurantProfile.findOne({ owner: req.user._id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found for the user' });
        }
        const items = await Item.find({ restaurantId: restaurant._id });
        res.status(200).json({ items });
    } catch (error) {
        console.error('Error fetching items:', error);
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
