import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  const notifs = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 });
  res.json(notifs);
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  await Notification.findByIdAndUpdate(id, { isRead: true });
  res.json({ success: true });
};

export const getVolunteerNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    const notifs = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(notifs);
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

// ===============================
// Admin notifications
// ===============================
export const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const notifs = await Notification.find({ user: adminId, userModel: "Admin" })
      .sort({ createdAt: -1 })
      .lean();
    res.json(notifs);
  } catch (err) {
    console.error("Failed to fetch admin notifications:", err);
    res.status(500).json({ message: "Failed to load admin notifications" });
  }
};

export const markAllAdminNotificationsRead = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const result = await Notification.updateMany(
      { user: adminId, userModel: "Admin", isRead: false },
      { $set: { isRead: true } }
    );
    res.json({
      success: true,
      updatedCount: result.modifiedCount || result.nModified || 0,
    });
  } catch (err) {
    console.error("❌ Error marking admin notifications read:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};