import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  skip: (req) => process.env.NODE_ENV === "test" || req.method === "OPTIONS",
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please slow down and try again later.",
  },
  skip: (req) => process.env.NODE_ENV === "test" || req.method === "OPTIONS",
});
