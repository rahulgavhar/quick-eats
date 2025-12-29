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

/* Naive Approach Summary:
1. Input Validation: Validate longitude, latitude, and radius.
2. Caching: Check Redis cache for existing results using a key based on rounded coordinates and radius.
3. Database Query: If no cache, use MongoDB geospatial query to find open restaurants within the radius.
4. Dynamic Cache Expiry: Set cache expiry based on radius and peak hours.
5. Response: Return restaurant list, indicating if data was from cache.
*/
export const listRestaurantsNearLocation1 = async (req, res) => {
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

  const cacheKey = `restaurants:${latitude.toFixed(2)}:${longitude.toFixed(
    2
  )}:${radiusMeters}`;

  try {
    const cached = await redisClientRestaurant.get(cacheKey);
    if (cached !== null) {
      return res.json({
        restaurants: JSON.parse(cached),
        cached: true,
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
          $centerSphere: [[longitude, latitude], radiusRadians],
        },
      },
    })
      .select("_id")
      .lean();

    const now = new Date();
    const istHour = (now.getUTCHours() + 5.5) % 24;

    let ttl = radiusMeters <= 2000 ? 180 : 120;

    const isPeak =
      (istHour >= 11 && istHour <= 14) || (istHour >= 18 && istHour <= 22);

    if (isPeak) ttl = 60;

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
      cached: false,
    });
  } catch (err) {
    console.error("Database query error:", err);
    return res.status(500).json({
      error: "Unable to fetch restaurants",
      code: "DB_ERROR",
    });
  }
};

/* Enhanced Approach Summary:
1. Bucketization: Divide the area into buckets (~1000m).
2. Bucket Caching: Cache each bucket's restaurant data separately.
3. Frequency Tracking: Track access frequency of each bucket to adjust cache expiry.
4. Selective Fetching: Only fetch buckets intersecting the search circle.
5. Final Filtering: Filter restaurants by exact distance after aggregating from buckets.
*/
export const listRestaurantsNearLocation2 = async (req, res) => {
  const BUCKET_SIZE_DEG = 0.010;
  const EARTH_RADIUS_M = 6371000; // meters
  const MAX_BUCKET_RADIUS = 12; // safety cap
  const CONCURRENCY = 20; // limit parallel redis/mongo fetches

  // Helpers
  const toRad = (x) => (x * Math.PI) / 180;
  const metersToDegrees = (meters) => (meters / EARTH_RADIUS_M) * (180 / Math.PI);
  const bucketCoord = (value) => Math.floor(value / BUCKET_SIZE_DEG) * BUCKET_SIZE_DEG;

  const haversineMeters = (lat1, lon1, lat2, lon2) => {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Validate & parse input
  try {
    const { lon, lat, radius = 5000, page = 1, limit = 8 } = req.query;
    const longitude = parseFloat(lon);
    const latitude = parseFloat(lat);
    const radiusMeters = Math.min(Number(radius) || 0, 5000);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(limit) || 8, 1), 50);

    if (isNaN(longitude) || longitude < -180 || longitude > 180)
      return res.status(400).json({ error: "Invalid longitude" });
    if (isNaN(latitude) || latitude < -90 || latitude > 90)
      return res.status(400).json({ error: "Invalid latitude" });
    if (isNaN(radiusMeters) || radiusMeters <= 0)
      return res.status(400).json({ error: "Radius must be positive" });

    // TTL tuning
    let baseTTL = radiusMeters <= 2000 ? 180 : 120;
    const hour = new Date().getHours();
    if ((hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 22)) baseTTL = 60;

    // Bucketing math
    const radiusDeg = metersToDegrees(radiusMeters);
    let bucketRadius = Math.ceil(radiusDeg / BUCKET_SIZE_DEG);
    bucketRadius = Math.min(bucketRadius, MAX_BUCKET_RADIUS);
    const baseLat = bucketCoord(latitude);
    const baseLon = bucketCoord(longitude);

    // Build list of candidate buckets
    const bucketCoords = [];
    for (let i = -bucketRadius; i <= bucketRadius; i++) {
      for (let j = -bucketRadius; j <= bucketRadius; j++) {
        const bLat = baseLat + i * BUCKET_SIZE_DEG;
        const bLon = baseLon + j * BUCKET_SIZE_DEG;
        const bucketCenterLat = bLat + BUCKET_SIZE_DEG / 2;
        const bucketCenterLon = bLon + BUCKET_SIZE_DEG / 2;

        // compute center-to-query distance and bucket half-diagonal (center->corner)
        const distToCenter = haversineMeters(latitude, longitude, bucketCenterLat, bucketCenterLon);
        const cornerDist = haversineMeters(bucketCenterLat, bucketCenterLon, bLat, bLon);

        // include if circle intersects bucket (center distance <= radius + cornerDist)
        if (distToCenter <= radiusMeters + cornerDist) {
          bucketCoords.push({ bLat, bLon });
        }
      }
    }

    // Controlled concurrency fetcher for buckets
    async function fetchBucket(bLat, bLon) {
      const bucketKey = `bucket:${BUCKET_SIZE_DEG}:${bLat.toFixed(3)}:${bLon.toFixed(3)}`;
      const freqKey = `freq:${bLat.toFixed(3)}:${bLon.toFixed(3)}`;

      try {
        const raw = await redisClientRestaurant.get(bucketKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
            // fallback to refetch if cache corrupted
          } catch (e) {
            // corrupted cache, fall through to DB fetch
            console.warn("Corrupted bucket cache, refetching:", bucketKey);
          }
        }

        // Query DB: only fetch minimal fields needed
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
        })
          .select({ _id: 1, location: 1 })
          .lean();

        // Atomically increment frequency + set TTL (multi)
        try {
          await redisClientRestaurant.multi()
            .incr(freqKey)
            .expire(freqKey, 300)
            .exec();
        } catch (e) {
          // best-effort: don't fail the whole request because of redis multi failing
          console.warn("Redis freq multi failed:", e);
        }

        // Compute adaptive TTL
        let ttl = baseTTL;
        try {
          const hits = Number(await redisClientRestaurant.get(freqKey)) || 0;
          if (hits > 20) ttl = Math.max(ttl, 240);
          if (hits > 50) ttl = Math.max(ttl, 360);
        } catch (e) {
          // ignore read errors, keep base ttl
        }

        // Cache minimal doc set
        try {
          await redisClientRestaurant.setEx(bucketKey, ttl, JSON.stringify(docs));
        } catch (e) {
          console.warn("Redis setEx failed for", bucketKey, e);
        }

        return docs || [];
      } catch (err) {
        console.error("Bucket fetch error:", err);
        return [];
      }
    }

    // Batch the bucket fetches with concurrency limit
    const resultsMap = new Map();
    for (let k = 0; k < bucketCoords.length; k += CONCURRENCY) {
      const slice = bucketCoords.slice(k, k + CONCURRENCY);
      const promises = slice.map(({ bLat, bLon }) => fetchBucket(bLat, bLon));
      const arrays = await Promise.all(promises);
      for (const arr of arrays) {
        if (!Array.isArray(arr)) continue;
        for (const doc of arr) {
          if (!doc || !doc._id) continue;
          resultsMap.set(String(doc._id), doc);
        }
      }
    }

    // Final precise distance filter
    const final = [];
    for (const r of resultsMap.values()) {
      const coords = r.location && r.location.coordinates;
      if (!coords || coords.length < 2) continue;
      const d = haversineMeters(latitude, longitude, coords[1], coords[0]);
      if (d <= radiusMeters) {
        // keep original document shape, but attach distance for convenience
        r._distanceMeters = Math.round(d);
        final.push(r);
      }
    }

    // Sort by distance
    final.sort((a, b) => (a._distanceMeters || 0) - (b._distanceMeters || 0));

    // Apply pagination
    const totalRestaurants = final.length;
    const totalPages = Math.ceil(totalRestaurants / pageLimit);
    const skip = (pageNum - 1) * pageLimit;
    const paginatedRestaurants = final.slice(skip, skip + pageLimit);

    return res.json({ 
      restaurants: paginatedRestaurants,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRestaurants,
        restaurantsPerPage: pageLimit,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error("listRestaurantsNearLocation2 error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
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
