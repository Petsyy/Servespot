// src/routes/notification.routes.js
import express from "express";
import {
  getNotifications,
  getVolunteerNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";
import { protect, verifyToken } from "../middlewares/auth.middleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// General Notifications Routes
router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markAsRead);

// Volunteer Notifications
router.get("/volunteer", verifyToken, getVolunteerNotifications);

// Mark all volunteer notifications as read
router.put("/volunteer/read-all", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await Notification.updateMany(
      { user: userId, userModel: "Volunteer", isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: "All volunteer notifications marked as read",
      updatedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error("❌ Error marking volunteer notifications read:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Organization Notifications

// Get notifications for a specific organization
router.get("/organization/:orgId", async (req, res) => {
  try {
    const { orgId } = req.params;
    const notifs = await Notification.find({
      user: orgId,
      userModel: "Organization",
    }).sort({ createdAt: -1 });

    res.json(notifs);
  } catch (err) {
    console.error("❌ Error fetching org notifications:", err);
    res.status(500).json({ message: "Failed to load organization notifications" });
  }
});

// Mark all organization notifications as read
router.put("/organization/:orgId/read-all", async (req, res) => {
  try {
    const { orgId } = req.params;
    const result = await Notification.updateMany(
      { user: orgId, userModel: "Organization", isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: "All organization notifications marked as read",
      updatedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error("❌ Error marking organization notifications read:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

