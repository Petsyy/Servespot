import express from "express";
import { verifyToken, protect } from "../middlewares/auth.middleware.js";
import {
  getMyTasks,
  getMyProfile,
  updateMyProfile,
  getMyBadges,
  getMyOpportunities,
  getMyProgress,
  getTopVolunteers,
  getVolunteerLeaderboard,
} from "../controllers/volunteer.controller.js";

const router = express.Router();

// Get volunteer profile
router.get("/me", verifyToken, getMyProfile);

// Update volunteer profile
router.put("/me", verifyToken, updateMyProfile);

// Get volunteer’s tasks
router.get("/me/tasks", verifyToken, getMyTasks);

//  NEW: Get volunteer badges & points
router.get("/me/badges", verifyToken, getMyBadges);

// Get volunteer leaderboard
router.get("/leaderboard", getVolunteerLeaderboard);

// Simple dashboard check route
router.get("/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome to the volunteer dashboard",
    user: req.user,
  });
});

//  NEW: Progress widget data (level progress, rank, totals)
router.get("/me/progress", verifyToken, getMyProgress);

//  NEW: Top volunteers leaderboard
router.get("/top", getTopVolunteers);

export default router;
