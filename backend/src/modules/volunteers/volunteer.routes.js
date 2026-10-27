import express from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import {
  getMyTasks,
  getMyProfile,
  updateMyProfile,
  getMyBadges,
  getMyOpportunities,
  getMyProgress,
  getTopVolunteers,
  getVolunteerLeaderboard,
} from "./volunteer.controller.js";

const router = express.Router();
const isVolunteer = requireRole("volunteer");

// Protected volunteer routes (Role: volunteer)
router.get("/me", isVolunteer, getMyProfile);
router.put("/me", isVolunteer, updateMyProfile);
router.get("/me/tasks", isVolunteer, getMyTasks);
router.get("/me/badges", isVolunteer, getMyBadges);
router.get("/me/progress", isVolunteer, getMyProgress);

// Simple dashboard check route
router.get("/dashboard", isVolunteer, (req, res) => {
  res.json({
    message: "Welcome to the volunteer dashboard",
    user: req.user,
  });
});

// Public leaderboard routes
router.get("/leaderboard", getVolunteerLeaderboard);
router.get("/top", getTopVolunteers);

export default router;
