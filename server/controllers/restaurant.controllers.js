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
  const BUCKET_SIZE_DEG = 0.005; // Approx. 500m
  const EARTH_RADIUS_M = 6371000; // meters

  // Helper functions
  const bucketCoord = (value) =>
    Math.floor(value / BUCKET_SIZE_DEG) * BUCKET_SIZE_DEG;
  const metersToDegrees = (meters) =>
    (meters / EARTH_RADIUS_M) * (180 / Math.PI);
  const toRad = (x) => (x * Math.PI) / 180;
  const haversineMeters = (lat1, lon1, lat2, lon2) => {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Input validation
  const { lon, lat, radius = 5000 } = req.query;
  const longitude = parseFloat(lon);
  const latitude = parseFloat(lat);
  const radiusMeters = Math.min(+radius, 5000);

  if (isNaN(longitude) || longitude < -180 || longitude > 180)
    return res.status(400).json({ error: "Invalid longitude" });
  if (isNaN(latitude) || latitude < -90 || latitude > 90)
    return res.status(400).json({ error: "Invalid latitude" });
  if (isNaN(radiusMeters) || radiusMeters <= 0)
    return res.status(400).json({ error: "Radius must be positive" });

  const radiusDeg = metersToDegrees(radiusMeters);
  const bucketRadius = Math.ceil(radiusDeg / BUCKET_SIZE_DEG);
  const baseLat = bucketCoord(latitude);
  const baseLon = bucketCoord(longitude);

  let baseTTL = radiusMeters <= 2000 ? 180 : 120;
  const hour = new Date().getHours();
  if ((hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 22)) baseTTL = 60;

  const results = new Map();
  const bucketPromises = [];

  // Function to fetch bucket with error handling
  async function fetchBucket(bLat, bLon) {
    const latIndex = Math.floor(bLat / BUCKET_SIZE_DEG);
    const lonIndex = Math.floor(bLon / BUCKET_SIZE_DEG);

    const bucketKey = `bucket:${latIndex}:${lonIndex}`;
    const freqKey = `freq:${latIndex}:${lonIndex}`;

    try {
      let bucketData = await redisClientRestaurant.get(bucketKey);
      if (!bucketData) {
        const docs = await Restaurant.find({
          isOpen: true,
          location: {
            $geoWithin: {
              $box: [
                [bLon, bLat],
                [bLon + BUCKET_SIZE_DEG, bLat + BUCKET_SIZE_DEG],
              ],
            },
          },
        }).lean();

        const hits = await redisClientRestaurant.incr(freqKey);
        await redisClientRestaurant.expire(freqKey, 300);

        let ttl = baseTTL;
        if (hits > 20) ttl = Math.max(ttl, 240);
        if (hits > 50) ttl = Math.max(ttl, 360);
        
        const MAX_TTL = 300; // 5 min
        ttl = Math.min(ttl, MAX_TTL);

        await redisClientRestaurant.setEx(bucketKey, ttl, JSON.stringify(docs));
        bucketData = docs;
      } else {
        bucketData = JSON.parse(bucketData);
      }
      return bucketData;
    } catch (err) {
      console.error("Bucket fetch error:", err);
      return [];
    }
  }

  // Iterate over buckets intersecting circle
  for (let i = -bucketRadius; i <= bucketRadius; i++) {
    for (let j = -bucketRadius; j <= bucketRadius; j++) {
      const bLat = baseLat + i * BUCKET_SIZE_DEG;
      const bLon = baseLon + j * BUCKET_SIZE_DEG;
      const bucketCenterLat = bLat + BUCKET_SIZE_DEG / 2;
      const bucketCenterLon = bLon + BUCKET_SIZE_DEG / 2;
      const distToCenter = haversineMeters(
        latitude,
        longitude,
        bucketCenterLat,
        bucketCenterLon
      );

      if (distToCenter - BUCKET_SIZE_DEG * 111000 <= radiusMeters) {
        bucketPromises.push(fetchBucket(bLat, bLon));
      }
    }
  }

  const bucketDataArray = await Promise.all(bucketPromises);
  for (const bucketData of bucketDataArray) {
    for (const r of bucketData) results.set(String(r._id), r);
  }

  // Final filtering by exact distance
  const final = [];
  for (const r of results.values()) {
    const d = haversineMeters(
      latitude,
      longitude,
      r.location.coordinates[1],
      r.location.coordinates[0]
    );
    if (d <= radiusMeters) final.push(r);
  }

  res.json({ restaurants: final });
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
