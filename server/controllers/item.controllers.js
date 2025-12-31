import Item from "../models/item.model.js";
import RestaurantProfile from "../models/restaurantProfile.model.js";
import mongoose from "mongoose";

export const addItem = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    if (!restaurantId) {
      return res
        .status(400)
        .json({ message: "Restaurant ID is required in params" });
    }
    const { name, image, description, price, foodType, category } = req.body;

    if (!name || !description || !price || !foodType || !category) {
      return res.status(400).json({ message: "All fields are required" });
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

    res.status(201).json({ message: "Item added successfully", item });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const { name, image, description, price, foodType, category } = req.body;

    if (!name || !description || !price || !foodType || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        description,
        price,
        foodType,
        category,
        image,
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    console.error("Error editing item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const item = await Item.findByIdAndDelete(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    await RestaurantProfile.findOneAndUpdate(
      { restaurantId: item.restaurantId },
      { $pull: { items: item._id } }
    );
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getItemsByRestaurant = async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const skip = (page - 1) * limit;
    const items = await Item.find({ restaurantId })
      .limit(limit)
      .skip(skip)
      .lean();

    const totalItems = await Item.countDocuments({ restaurantId });
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching items by restaurant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    const items = await Item.find({ category });
    res.status(200).json({ items });
  } catch (error) {
    console.error("Error fetching items by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAllItemsOfRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    if (!restaurantId) {
      return res
        .status(400)
        .json({ message: "Restaurant ID is required in params" });
    }

    const restaurantProfile = await RestaurantProfile.findOne({ restaurantId });
    if (!restaurantProfile) {
      return res.status(404).json({ message: "Restaurant profile not found" });
    }
    if (req.userId.toString() !== restaurantProfile.owner.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }
    await Item.deleteMany({ restaurantId });
    res
      .status(200)
      .json({ message: "All items of the restaurant deleted successfully" });
  } catch (error) {
    console.error("Error deleting all items of restaurant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getItemsBySearch = async (req, res) => {
  try {
    const { name, category, restaurants: restaurantIds } = req.body;

    if (!name && !category) {
      return res.status(400).json({
        message: "At least name or category is required",
      });
    }

    if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      return res.status(400).json({
        message: "Restaurants array is required",
      });
    }

    const restaurantObjectIds = restaurantIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (restaurantObjectIds.length === 0) {
      return res.status(400).json({
        message: "No valid restaurant IDs provided",
      });
    }

    const query = {
      restaurantId: { $in: restaurantObjectIds },
    };

    if (category) {
      query.category = category;
    }

    if (name) {
      query.$text = { $search: name };
    }

    const projection = name ? { score: { $meta: "textScore" } } : {};

    const sort = name ? { score: { $meta: "textScore" } } : {};

    const items = await Item.find(query, projection).sort(sort).limit(20);

    return res.status(200).json({ items });
  } catch (error) {
    console.error("Error searching items:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSamplesForRestaurant = async (req, res) => {
  try {
    const { restaurants, lastFetched: lastItemId, size = 6 } = req.body;

    // 1. Validate restaurants array
    if (!Array.isArray(restaurants) || restaurants.length === 0) {
      return res.status(400).json({ message: "Restaurants array is required" });
    }

    // 2. Convert restaurant IDs to ObjectId
    const restaurantObjectIds = restaurants
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (restaurantObjectIds.length === 0) {
      return res.status(400).json({ message: "No valid restaurant IDs provided" });
    }

    // 3. Build query
    const query = {
      restaurantId: { $in: restaurantObjectIds },
    };

    // 4. Apply cursor if provided
    if (lastItemId && mongoose.Types.ObjectId.isValid(lastItemId)) {
      query._id = { $gt: new mongoose.Types.ObjectId(lastItemId) };
    }

    // 5. Fetch next batch
    const items = await Item.find(query)
      .sort({ _id: 1 })
      .limit(size);

    return res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
