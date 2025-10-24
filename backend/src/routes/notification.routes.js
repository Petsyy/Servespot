import express from "express";
import { getNotifications, getVolunteerNotifications, markAsRead, getAdminNotifications, markAllAdminNotificationsRead } from "../controllers/notification.controller.js";
import { protect, protectAdmin } from "../middlewares/auth.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js"
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markAsRead);

router.get("/volunteer", verifyToken, getVolunteerNotifications)

// Admin
router.get("/admin", protectAdmin, getAdminNotifications);
router.patch("/admin/mark-all-read", protectAdmin, markAllAdminNotificationsRead);

// Mark all notifications as read for the current logged-in user
router.patch("/mark-all-read", protect, async (req, res) => {
  try {
    const { id, role } = req.user;

    if (!id || !role) {
      return res.status(400).json({ success: false, message: "Missing user info" });
    }

    const userModel = role === "organization" ? "Organization" : "Volunteer";

    const result = await Notification.updateMany(
      { user: id, userModel, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error("❌ Error marking notifications read:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


export default router;