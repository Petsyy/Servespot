import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome to the volunteer dashboard",
    user: req.user, // includes id + role from token
  });
});

export default router;
