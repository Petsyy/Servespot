import express from "express";
import { verifyToken, protect } from "../middlewares/auth.middleware.js";
import { getMyTasks, getMyProfile, updateMyProfile } from "../controllers/volunteer.controller.js";

const router = express.Router();

// Get volunteer profile
router.get("/me", verifyToken, getMyProfile);

// Update volunteer profile
router.put("/me", verifyToken, updateMyProfile);

// Get volunteer’s tasks
router.get("/me/tasks", verifyToken, getMyTasks);

// Simple dashboard check route
router.get("/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome to the volunteer dashboard",
    user: req.user,
  });
});

export default router;
