import Restaurant from "../models/restaurant.model.js";
import RestaurantProfile from "../models/restaurantProfile.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import redisClientRestaurant from "../utils/redisClientRestaurant.js";
import ENV from "../config/env.js";
import axios from "axios";

export const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      longitude,
      latitude,
      phone,
      email,
      cuisine,
    } = req.body;
    let imageUrl = null;

    if (req.file) {
      // Upload image to Cloudinary
      imageUrl = await uploadToCloudinary(req.file.path, "restaurant_images");
    }

    // Create Restaurant
    const restaurant = new Restaurant({
      name,
      city,
      state,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    const savedRestaurant = await restaurant.save();

    // Create Restaurant Profile
    const restaurantProfile = new RestaurantProfile({
      restaurantId: savedRestaurant._id,
      address,
      image: imageUrl,
      phone,
      email,
      owner: req.userId,
      cuisine,
    });
    await restaurantProfile.save();

    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant: savedRestaurant,
      profile: restaurantProfile,
    });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const {
      name,
      address,
      city,
      state,
      longitude: lon,
      latitude: lat,
      phone,
      email,
      cuisine,
    } = req.body;
    let imageUrl = null;
    if (req.file) {
      // Upload new image to Cloudinary
      imageUrl = await uploadToCloudinary(req.file.path, "restaurant_images");
    }

    // Update Restaurant
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      {
        name,
        city,
        state,
        location: {
          type: "Point",
          coordinates: [parseFloat(lon), parseFloat(lat)],
        },
      },
      { new: true }
    );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    // Update Restaurant Profile
    const profileUpdates = {
      address,
      phone,
      email,
      cuisine,
    };
    if (imageUrl) {
      profileUpdates.image = imageUrl;
    }
    const restaurantProfile = await RestaurantProfile.findOneAndUpdate(
      { restaurantId: restaurant._id },
      profileUpdates,
      { new: true }
    );
    res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
      profile: restaurantProfile,
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { shouldPopulate } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findOne({ _id: restaurantId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    let restaurantProfile;

    if (!shouldPopulate) {
      restaurantProfile = await RestaurantProfile.findOne({
        restaurantId: restaurant._id,
      }).lean();
    } else {
      restaurantProfile = await RestaurantProfile.findOne({
        restaurantId: restaurant._id,
      }).populate({
        path: "items",
        model: "Item",
        options: { lean: true },
      });
    }

    res.status(200).json({
      restaurant,
      profile: restaurantProfile,
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOwnerRestaurant = async (req, res) => {
  try {
    const ownerId = req.userId;
    const restaurantProfile = await RestaurantProfile.findOne({
      owner: ownerId,
    });
    if (!restaurantProfile) {
      return res
        .status(200)
        .json({ code: 404, message: "Owner has no restaurant" });
    }
    const restaurant = await Restaurant.findById(
      restaurantProfile.restaurantId
    );

    res.status(200).json({
      restaurant,
      profile: restaurantProfile,
    });
  } catch (error) {
    console.error("Error fetching owner's restaurant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findByIdAndDelete(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    await Item.deleteMany({ restaurantId });
    await RestaurantProfile.findOneAndDelete({ restaurantId });
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listRestaurantsInCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city || typeof city !== "string") {
      return res.status(400).json({ message: "Invalid city parameter" });
    }

    const restaurants = await Restaurant.find({ city: city });
    res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Error listing restaurants:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listRestaurantsInState = async (req, res) => {
  try {
    const { state } = req.params;

    if (!state || typeof state !== "string") {
      return res.status(400).json({ message: "Invalid state parameter" });
    }

    const restaurants = await Restaurant.find({ state: state });
    res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Error listing restaurants:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listRestaurantsNearLocation = async (req, res) => {
  const EARTH_RADIUS_M = 6378137; // WGS84 is correct

  const { lon, lat, radius = 5000 } = req.query;
  const longitude = Number(lon);
  const latitude = Number(lat);
  const radiusMeters = Math.min(Number(radius), 5000);

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: "Invalid longitude" });
  }
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return res.status(400).json({ error: "Invalid latitude" });
  }
  if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
    return res.status(400).json({ error: "Radius must be positive number" });
  }

  const cacheKey = `restaurants:${latitude.toFixed(2)}:${longitude.toFixed(2)}:${radiusMeters}`;

  try {
    const cached = await redisClientRestaurant.get(cacheKey);
    if (cached !== null) {
      return res.json({ 
        restaurants: JSON.parse(cached),
        cached: true
      });
    }
  } catch (err) {
    console.error("Cache read error:", err.message);
  }

  try {
    const radiusRadians = radiusMeters / EARTH_RADIUS_M;

    const restaurants = await Restaurant.find({
      isOpen: true,
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusRadians]
        }
      }
    })
      .select('+_id')
      .lean();

    const hour = new Date().getHours();
    let ttl = 120;
    
    if (radiusMeters <= 2000) ttl = 180;
    if ((hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 22)) {
      ttl = 60;
    }

    try {
      await redisClientRestaurant.setEx(
        cacheKey, 
        Math.min(ttl, 300),
        JSON.stringify(restaurants)
      );
    } catch (err) {
      console.error("Cache write error:", err.message);
    }

    return res.json({ 
      restaurants,
      cached: false
    });
    
  } catch (err) {
    console.error("Database query error:", err);
    return res.status(500).json({ 
      error: "Unable to fetch restaurants",
      code: "DB_ERROR"
    });
  }
};

export const getAddressFromCoordinates = async (req, res) => {
  try {
    const { lon, lat } = req.query;

    const longitude = parseFloat(lon);
    const latitude = parseFloat(lat);
    if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const geoApiKey = ENV.GEO_API_KEY;
    if (!geoApiKey) {
      return res.status(500).json({ message: "Geocoding API key missing" });
    }
    const geoApiUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${geoApiKey}`;

    const response = await axios.get(geoApiUrl, { timeout: 5000 });
    const data = response.data;
    if (data?.results?.length === 0) {
      return res.status(404).json({ message: "Address not found" });
    }
    const result = data.results[0];
    const address = result.formatted;
    return res.status(200).json({ address });
  } catch (error) {
    console.error("Error fetching address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
