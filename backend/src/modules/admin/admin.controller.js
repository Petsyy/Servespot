import { adminService } from "./admin.service.js";
import { setAdminCookie } from "../../utils/authCookies.js";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, admin } = await adminService.login({ email, password });
    setAdminCookie(res, token);

    res.status(200).json({
      message: "Login successful",
      token,
      admin,
    });
  } catch (err) {
    if (err.status !== 400) {
      console.error("Login error:", err);
    }
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

export const getAllOrganizations = async (_req, res) => {
  try {
    const organizations = await adminService.getAllOrganizations();
    res.status(200).json(organizations);
  } catch (err) {
    console.error("Error fetching organizations:", err);
    res.status(500).json({ message: "Error fetching organizations" });
  }
};

export const updateOrganizationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const actor = req.user?.email || "Admin";

    const organization = await adminService.updateOrganizationStatus(id, {
      status,
      reason,
      actor,
    });

    res.status(200).json({
      message:
        status === "suspended"
          ? "Organization suspended successfully."
          : status === "active"
          ? "Organization reactivated successfully."
          : "Organization set to pending.",
      organization,
    });
  } catch (err) {
    console.error("Error updating organization status:", err);
    res.status(err.status || 500).json({ message: err.message || "Failed to update organization status" });
  }
};

export const getAllVolunteers = async (_req, res) => {
  try {
    const volunteers = await adminService.getAllVolunteers();
    res.status(200).json(volunteers);
  } catch (err) {
    console.error("Error fetching volunteers:", err);
    res.status(500).json({ message: "Failed to fetch volunteers" });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const actor = req.user?.email || "Admin";

    const volunteer = await adminService.updateVolunteerStatus(id, {
      status,
      reason,
      actor,
    });

    res.status(200).json({
      message:
        status === "suspended"
          ? "Volunteer suspended successfully."
          : status === "active"
          ? "Volunteer reactivated successfully."
          : "Volunteer set to pending.",
      volunteer,
    });
  } catch (err) {
    console.error("Error updating volunteer status:", err);
    res.status(err.status || 500).json({ message: err.message || "Failed to update status" });
  }
};

export const notifyAdminsOfNewRegistration = async (userType, userData) => {
  return adminService.notifyAdminsOfNewRegistration(userType, userData);
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await adminService.getProfile(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ data: admin });
  } catch (err) {
    console.error("Error fetching admin profile:", err);
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
};

export const getDashboardData = async (_req, res) => {
  try {
    const dashboardData = await adminService.getDashboardData();
    res.json(dashboardData);
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

export const getReportsData = async (_req, res) => {
  try {
    const reportsData = await adminService.getReportsData();
    res.json(reportsData);
  } catch (err) {
    console.error("Error loading reports data:", err);
    res.status(500).json({ message: "Failed to load reports data" });
  }
};

export const getAdminNotifications = async (req, res) => {
  try {
    const { adminId } = req.params;
    if (req.user?.id && String(req.user.id) !== String(adminId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const notifications = await adminService.getNotifications(adminId);
    res.json({ data: notifications });
  } catch (err) {
    console.error("Error fetching admin notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markAdminNotificationsRead = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (req.user?.id && String(req.user.id) !== String(adminId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await adminService.markNotificationsRead(adminId);
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking admin notifications as read:", err);
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};
