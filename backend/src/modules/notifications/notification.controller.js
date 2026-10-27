import { notificationRepository } from "./notification.repository.js";
import { NotificationService } from "./notification.service.js";

const notificationService = new NotificationService(notificationRepository);

export const getNotifications = async (req, res) => {
  const notifs = await notificationService.list(req.user.id);
  res.json(notifs);
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  await notificationService.markRead(id);
  res.json({ success: true });
};

export const getVolunteerNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;

    const notifs = await notificationService.listVolunteer(userId);

    res.json(notifs);
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const organizationId = req.params.orgId;
    const result = await notificationService.markAllRead(
      organizationId || req.user?.id,
      organizationId ? "Organization" : "Volunteer",
    );
    res.json({
      success: true,
      message: organizationId
        ? "All organization notifications marked as read"
        : "All volunteer notifications marked as read",
      updatedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getOrganizationNotifications = async (req, res) => {
  try {
    res.json(await notificationService.list(req.params.orgId, "Organization"));
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load organization notifications" });
  }
};
