import { createClient } from "redis";
import ENV from "../config/env.js";

const redisClientRestaurant = createClient({
  url: ENV.REDIS_RESTAURANT_URL,
});

redisClientRestaurant.on("error", (err) => {
  console.error("Redis error:", err);
});

await redisClientRestaurant.connect();

export default redisClientRestaurant;
