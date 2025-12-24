import { createClient } from "redis";
import ENV from "../config/env.js";

const redisClient = createClient({
  url: ENV.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

await redisClient.connect();

export default redisClient;
