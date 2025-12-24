import dotenv from "dotenv";
dotenv.config();

const APP_KEYS =
  [
    "MONGO_URI",
    "JWT_SECRET",
    "CLIENT_URL",
    "OTP_EMAIL",
    "OTP_EMAIL_PASSWORD",
    "GEO_API_KEY",
    "REDIS_URL",
    "REDIS_RESTAURANT_URL",
  ];

/* 1. Validate required app keys */
for (const key of APP_KEYS) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

/* 2. Dynamically map app env */
const appEnv = Object.fromEntries(
  APP_KEYS.map((key) => [key, process.env[key]])
);

/* 3. Normalize platform envs */
const ENV = Object.freeze({
  // Default envs
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // App envs
  ...appEnv,
});

export default ENV;