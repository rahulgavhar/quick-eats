import Restaurant from "../models/restaurant.model.js";
import RestaurantProfile from "../models/restaurantProfile.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import redisClientRestaurant from "../utils/redisClientRestaurant.js";
import ENV from "../config/env.js";


export const createRestaurant = async (req, res) => {
    try {
        const { name, address, city, state, lon, lat, phoneNumber, email } = req.body;
        let imageUrl = null;

        if(req.file) {
            // Upload image to Cloudinary
            imageUrl = await uploadToCloudinary(req.file.path, 'restaurant_images');
        }
        // Create Restaurant
        const restaurant = new Restaurant({
            name,
            city,
            state,
            location: {
                type: "Point",
                coordinates: [parseFloat(lon), parseFloat(lat)],
            },
        });

        const savedRestaurant = await restaurant.save();

        // Create Restaurant Profile
        const restaurantProfile = new RestaurantProfile({
            restaurantId: savedRestaurant._id,
            address,
            image: imageUrl,
            phone: phoneNumber,
            email,
            owner: req.user._id, // Assuming req.user contains the authenticated user
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

        const { name, address, city, state, lon, lat, phoneNumber, email } = req.body;
        let imageUrl = null;
        if(req.file) {
            // Upload new image to Cloudinary
            imageUrl = await uploadToCloudinary(req.file.path, 'restaurant_images');
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
            phone: phoneNumber,
            email,
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

        if(!restaurantId) {
            return res.status(400).json({ message: "Invalid restaurant ID" });
        }

        const restaurant = await Restaurant.findById({_id:restaurantId});
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        const restaurantProfile = await RestaurantProfile.findOne({ restaurantId: restaurant._id });
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
        const ownerId = req.user._id;
        const restaurantProfile = await RestaurantProfile.findOne({ owner: ownerId });
        if (!restaurantProfile) {
            return res.status(404).json({ message: "Restaurant profile not found for this owner" });
        }
        const restaurant = await Restaurant.findById(restaurantProfile.restaurantId);
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

        if(!restaurantId) {
            return res.status(400).json({ message: "Invalid restaurant ID" });
        }

        const restaurant = await Restaurant.findByIdAndDelete(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        await RestaurantProfile.findOneAndDelete({ restaurantId: restaurant._id });
        res.status(200).json({ message: "Restaurant deleted successfully" });
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const listRestaurantsInCity = async (req, res) => {
    try {
        const { city } = req.params;

        if(!city || typeof city !== 'string') {
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

        if(!state || typeof state !== 'string') {
            return res.status(400).json({ message: "Invalid state parameter" });
        }

        const restaurants = await Restaurant.find({ state: state });
        res.status(200).json({ restaurants });
    } catch (error) {
        console.error("Error listing restaurants:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const BUCKET_SIZE = 0.003;      // ~330m
const BUCKET_PRECISION = 3;
const OFFSETS = [-1, 0, 1];

export const listRestaurantsNearLocation = async (req, res) => {
  try {
    const { lon, lat, distance = 5000, city = "any", state = "any" } = req.query;

    const longitude = parseFloat(lon);
    const latitude = parseFloat(lat);
    const radius = Math.min(parseInt(distance, 10), 5000);

    if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    /* ---------- MULTI-BUCKET CACHE KEYS ---------- */
    const keys = [];
    for (const dLat of OFFSETS) {
      for (const dLon of OFFSETS) {
        const latKey = (latitude + dLat * BUCKET_SIZE).toFixed(BUCKET_PRECISION);
        const lonKey = (longitude + dLon * BUCKET_SIZE).toFixed(BUCKET_PRECISION);
        keys.push(`nearby:${state}:${city}:${latKey}:${lonKey}:${radius}`);
      }
    }

    /* ---------- REDIS MGET ---------- */
    const cached = await redisClientRestaurant.mGet(keys);
    const merged = [];
    for (const val of cached) if (val) merged.push(...JSON.parse(val));

    if (merged.length) {
      const unique = Array.from(
        new Map(merged.map(r => [String(r._id), r])).values()
      );
      return res.json({ source: "cache", restaurants: unique });
    }

    /* ---------- MONGODB QUERY ---------- */
    const query = {
      isOpen: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius,
        },
      },
    };

    if (city !== "any") query.city = city;
    if (state !== "any") query.state = state;

    const restaurants = await Restaurant.find(query).limit(50).lean();

      /* ---------- DYNAMIC TTL ---------- */
      /* shorter TTL during peak hours and for smaller radius */

    let ttl = 60;
    if (radius <= 2000) ttl = 120;

    const hour = new Date().getHours();
    if ((hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 22)) ttl = 30;

    const centerLat = latitude.toFixed(BUCKET_PRECISION);
    const centerLon = longitude.toFixed(BUCKET_PRECISION);
    const centerKey = `nearby:${state}:${city}:${centerLat}:${centerLon}:${radius}`;

    const hits = await redisClientRestaurant.incr(`freq:${centerKey}`);
    await redisClientRestaurant.expire(`freq:${centerKey}`, 300);
    if (hits > 30) ttl = Math.max(ttl, 150);

    /* ---------- CACHE CENTER BUCKET ---------- */
    await redisClientRestaurant.setEx(centerKey, ttl, JSON.stringify(restaurants));

    return res.json({ source: "db", ttl, restaurants });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
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