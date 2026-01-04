import User from "../models/user.model.js";
import axios from "axios";
import ENV from "../config/env.js";
import redisClient from "../utils/redisClient.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // exclude password field, otp, and other sensitive info
    const user = await User.findById(userId)
      .select(
        "-password -otp -isOtpVerified -otpExpiry -otpRequests -otpRequestsResetTime"
      )
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserCity = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    /* 1. Input validation */
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    /* 2. Normalize coordinates for cache key */
    const lat = latitude.toFixed(2);
    const lon = longitude.toFixed(2);
    const cacheKey = `geo:${lat}:${lon}`;

    /* 3. Try Redis read (blocking, but failure-tolerant) */
    try {
      const cachedData = await redisClient.hGetAll(cacheKey);

      if (cachedData?.city && cachedData?.state) {
        return res.status(200).json({
          city: cachedData.city,
          state: cachedData.state,
          cached: true,
        });
      }
    } catch (err) {
      console.error("Redis read failed, continuing without cache");
    }

    /* 4. Validate API key */
    const geoApiKey = ENV.GEO_API_KEY;
    if (!geoApiKey) {
      return res.status(500).json({ message: "Geocoding API key missing" });
    }

    /* 5. Call Geoapify */
    const geoApiUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${geoApiKey}`;

    const response = await axios.get(geoApiUrl, { timeout: 5000 });
    const data = response.data;

    if (!data?.results?.length) {
      return res.status(404).json({ message: "City not found" });
    }

    /* 6. Extract city/state safely */
    const result = data.results[0];
    const city =
      result.city ||
      result.town ||
      result.village ||
      result.county ||
      "Unknown";

    const state = result.state || "Unknown";

    /* 7. Async Redis write (non-blocking) */
    (async () => {
      try {
        await redisClient
          .multi()
          .hSet(cacheKey, { city, state })
          .expire(cacheKey, 3600)
          .exec();
      } catch (err) {
        console.error("Redis write failed");
      }
    })();

    /* 8. Respond immediately */
    return res.status(200).json({
      city,
      state,
      cached: false,
    });
  } catch (error) {
    if (error.response) {
      return res.status(502).json({
        message: "Geocoding service error",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name, email, mobile, countryCode, role } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (mobile) updateData.mobile = mobile;
    if (countryCode) updateData.countryCode = countryCode;
    if (role) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select(
      "-password -otp -isOtpVerified -otpExpiry -otpRequests -otpRequestsResetTime"
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // If role was updated, refresh the token with new role
    if (role) {
      const genToken = (await import("../utils/token.js")).default;
      const newToken = genToken(updatedUser._id, updatedUser.role);
      
      res.cookie("token", newToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUserLocation = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { location } = req.body;

    if (
      !location ||
      typeof location.lat !== "number" ||
      typeof location.lon !== "number"
    ) {
      return res.status(400).json({ message: "Invalid location data" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          location: {
            type: "Point",
            coordinates: [location.lon, location.lat],
          },
        },
      },
      { new: true, runValidators: true }
    )
      .select(
        "-password -otp -isOtpVerified -otpExpiry -otpRequests -otpRequestsResetTime"
      )
      .lean();
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("[updateUserLocation] Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};