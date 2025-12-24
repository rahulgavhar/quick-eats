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
    const user = await User.findById(userId).select(
      "-password -otp -isOtpVerified -otpExpiry -otpRequests -otpRequestsResetTime"
    );

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

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180
    ) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const lat = latitude.toFixed(3);
    const lon = longitude.toFixed(3);
    const cacheKey = `${lat}:${lon}`;

    try {
      const cachedCity = await redisClient.get(cacheKey);
      if (cachedCity) {
        return res.status(200).json({
          city: cachedCity,
          cached: true,
        });
      }
    } catch (err) {
      console.error("Redis unavailable, skipping cache");
    }

    /* Validate API key */
    const geoApiKey = ENV.GEO_API_KEY;
    if (!geoApiKey) {
      return res.status(500).json({ message: "Geocoding API key missing" });
    }

    /* Call Geoapify */
    const geoApiUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${geoApiKey}`;

    const response = await axios.get(geoApiUrl, { timeout: 5000 });
    const data = response.data;

    if (!data?.results?.length) {
      return res.status(404).json({ message: "City not found" });
    }

    const result = data.results[0];
    const city =
      result.city ||
      result.town ||
      result.village ||
      result.county ||
      "Unknown";

    /* Cache the result in Redis */
    try {
      await redisClient.setEx(cacheKey, 3600, city); // Cache for 1 hour
    } catch (err) {
      console.error("Failed to write to Redis");
    }

    return res.status(200).json({
      city,
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
