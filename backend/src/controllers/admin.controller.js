import Admin from "../models/Admin.js";
import Organization from "../models/Organization.js";
import Volunteer from "../models/Volunteer.js";
import Opportunity from "../models/Opportunity.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  emitToVolunteer,
  broadcastToAdmins,
  emitToOrganization,
} from "../../server.js";
import { sendNotification } from "../utils/sendNotification.js";

/* =====================================================
ADMIN AUTHENTICATION
===================================================== */
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
ORGANIZATION MANAGEMENT
===================================================== */
export const getAllOrganizations = async (_req, res) => {
  try {
    const organizations = await Organization.find()
      .select("orgName email orgType city status createdAt document")
      .sort({ createdAt: -1 });
    res.status(200).json(organizations);
  } catch (err) {
    console.error("❌ Error fetching organizations:", err);
    res.status(500).json({ message: "Error fetching organizations" });
  }
};

// Suspend / Reactivate / Set Pending
export const updateOrganizationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["active", "suspended", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const organization = await Organization.findById(id);
    if (!organization)
      return res.status(404).json({ message: "Organization not found" });

    // --- update fields ---
    organization.status = status;
    organization.suspensionReason =
      status === "suspended" ? reason || "No reason provided" : null;
    organization.suspensionDate = status === "suspended" ? new Date() : null;
    organization.suspendedBy =
      status === "suspended" ? req.user?.email || "Admin" : null;

    await organization.save();

    // --- cascade effects ---
    if (status === "suspended") {
      await Opportunity.updateMany(
        { organization: id, status: { $in: ["Open", "In Progress"] } },
        { status: "Suspended" }
      );
    } else if (status === "active") {
      await Opportunity.updateMany(
        { organization: id, status: "Suspended" },
        { status: "Open" }
      );
    }

    // --- Emit real-time Socket event ---
    if (status === "suspended") {
      emitToOrganization(id, "suspended", { reason });
    } else if (status === "active") {
      emitToOrganization(id, "reactivated", {});
    }
    if (status === "suspended") {
      emitToOrganization(id, "suspended", { reason });
    }

    // --- Create in-app & email notification ---
    const notifTitle =
      status === "suspended"
        ? "Account Suspended"
        : status === "active"
          ? "Account Reactivated"
          : "Account Pending Verification";

    const notifMsg =
      status === "suspended"
        ? `Your organization account has been suspended. ${
            reason ? `Reason: ${reason}` : ""
          }`
        : status === "active"
          ? "Your ServeSpot account has been reactivated. You may now continue your activities."
          : "Your organization account status has been set to pending. Please wait for admin review.";

    await sendNotification({
      userId: organization._id,
      userModel: "Organization",
      email: organization.email,
      title: notifTitle,
      message: notifMsg,
      type: "update",
      channel: "email", // or "dbOnly" depending on your helper’s options
    });

    // --- Notify all admins for real-time updates ---
    broadcastToAdmins("organizationStatusUpdated", {
      orgId: id,
      status,
    });

    // --- Create in-app notification for admins about org status change ---
    try {
      const admins = await Admin.find({ status: "active" });
      const actor = req.user?.email || "Admin";
      const adminTitle =
        status === "active"
          ? "Organization verified"
          : status === "suspended"
            ? "Organization suspended"
            : "Organization Status Updated";
      const adminMessage =
        status === "active"
          ? `${organization.orgName} was approved successfully.`
          : status === "suspended"
            ? `${organization.orgName} was suspended by ${actor}.`
            : `${organization.orgName} status set to pending by ${actor}.`;
      const adminType =
        status === "active"
          ? "organization_verification"
          : status === "suspended"
            ? "organization_suspension"
            : "update";

      for (const admin of admins) {
        await sendNotification({
          userId: admin._id,
          userModel: "Admin",
          title: adminTitle,
          message: adminMessage,
          type: adminType,
          channel: "inApp",
          link: "/admin/organizations",
        });
      }
    } catch (e) {
      console.error("❌ Failed to notify admins of org status change:", e);
    }

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
    console.error("❌ Error updating organization status:", err);
    res.status(500).json({ message: "Failed to update organization status" });
  }
};

/* =====================================================
VOLUNTEER MANAGEMENT
===================================================== */
export const getAllVolunteers = async (_req, res) => {
  try {
    const volunteers = await Volunteer.find().select(
      "fullName email status badges completedTasks createdAt"
    );
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

    if (!["active", "suspended", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const volunteer = await Volunteer.findById(id);
    if (!volunteer)
      return res.status(404).json({ message: "Volunteer not found" });

    volunteer.status = status;
    volunteer.suspensionReason =
      status === "suspended" ? reason || "No reason provided" : null;
    volunteer.suspensionDate = status === "suspended" ? new Date() : null;

    await volunteer.save();

    // --- Emit socket events ---
    if (status === "suspended") {
      emitToVolunteer(id, "suspended", { reason: volunteer.suspensionReason });
    } else if (status === "active") {
      emitToVolunteer(id, "reactivated", {});
    }
    if (status === "suspended") {
      emitToVolunteer(id, "suspended", { reason: volunteer.suspensionReason });
    }

    // --- Create in-app + email notification ---
    const notifTitle =
      status === "suspended"
        ? "Account Suspended"
        : status === "active"
          ? "Account Reactivated"
          : "Account Pending Review";

    const notifMsg =
      status === "suspended"
        ? `Your volunteer account has been suspended. ${
            reason ? `Reason: ${reason}` : ""
          }`
        : status === "active"
          ? "Your volunteer account has been reactivated. You may now access ServeSpot again."
          : "Your account is pending review by admin. Please wait for updates.";

    await sendNotification({
      userId: volunteer._id,
      userModel: "Volunteer",
      email: volunteer.email,
      title: notifTitle,
      message: notifMsg,
      type: "update",
    });

    // --- Notify admins (auto-refresh) ---
    broadcastToAdmins("volunteerStatusUpdated", {
      userId: id,
      status,
    });

    // --- Create in-app notification for admins about volunteer status change ---
    try {
      const admins = await Admin.find({ status: "active" });
      const actor = req.user?.email || "Admin";
      const adminTitle =
        status === "active"
          ? "Volunteer reactivated"
          : status === "suspended"
            ? "Volunteer suspended"
            : "Volunteer Pending Review";
      const adminMessage =
        status === "active"
          ? `${volunteer.fullName} was reactivated by ${actor}.`
          : status === "suspended"
            ? `${volunteer.fullName} was suspended by ${actor}.`
            : `${volunteer.fullName} status set to pending by ${actor}.`;
      const adminType =
        status === "active"
          ? "volunteer_reactivation"
          : status === "suspended"
            ? "volunteer_suspension"
            : "update";

      for (const admin of admins) {
        await sendNotification({
          userId: admin._id,
          userModel: "Admin",
          title: adminTitle,
          message: adminMessage,
          type: adminType,
          channel: "inApp",
          link: "/admin/volunteers",
        });
      }
    } catch (e) {
      console.error(
        "❌ Failed to notify admins of volunteer status change:",
        e
      );
    }

    res.status(200).json({
      message:
        status === "suspended"
          ? "Volunteer suspended successfully."
          : status === "active"
            ? "Volunteer reactivated successfully."
            : "Volunteer set to pending.",
      volunteer,
    });
  } catch (error) {
    console.error("Error updating volunteer status:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

// Helper function to notify admins about new registrations
export const notifyAdminsOfNewRegistration = async (userType, userData) => {
  try {
    // Get all admins
    const admins = await Admin.find({ status: "active" });

    for (const admin of admins) {
      await sendNotification({
        userId: admin._id,
        userModel: "Admin",
        title: `New ${userType} Registration`,
        message: `A new ${userType.toLowerCase()} "${userData.name || userData.orgName}" has registered and needs verification.`,
        type:
          userType === "Organization"
            ? "organization_verification"
            : "user_registration",
        channel: "inApp",
        link:
          userType === "Organization"
            ? "/admin/organizations"
            : "/admin/volunteers",
      });
    }
  } catch (err) {
    console.error("❌ Error notifying admins:", err);
  }
};
