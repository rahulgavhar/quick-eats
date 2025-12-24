import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const locationRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each user to 5 requests per windowMs
  keyGenerator: (req) => {
    return req.user?.id ?? ipKeyGenerator(req);
  },
  message: {
    message: "Too many requests from this user. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max requests per IP
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
  keyGenerator: (req) => {
    return ipKeyGenerator(req);
  },
  standardHeaders: true, // return rate limit info in headers
  legacyHeaders: false,
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: "Too many password reset attempts. Please try again later.",
  },
  keyGenerator: (req) => {
    return ipKeyGenerator(req);
  },
  standardHeaders: true,
  legacyHeaders: false,
});
