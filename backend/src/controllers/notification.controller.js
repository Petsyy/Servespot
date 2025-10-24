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
    
    // Clean up old notifications (older than 90 days) before fetching
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    await Notification.deleteMany({
      user: userId,
      userModel: "Volunteer",
      createdAt: { $lt: ninetyDaysAgo }
    });
    
    const notifs = await Notification.find({ 
      user: userId,
      userModel: "Volunteer"
    })
      .sort({ createdAt: -1 })
      .limit(100) // Increased limit to 100 most recent notifications
      .lean();
      
    res.json(notifs);
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    res.status(500).json({ message: "Failed to load notifications" });
  }
};