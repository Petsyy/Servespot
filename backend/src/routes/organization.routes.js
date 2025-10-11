import express from "express";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome to the organization dashboard",
    user: req.user, // includes id + role from token
  });
});

export default router;
