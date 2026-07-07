import mongoose from "mongoose";
import ENV from "./env.js";

// Set DNS servers explicitly to resolve Atlas SRV records
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
