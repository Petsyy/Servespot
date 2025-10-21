import Admin from "../models/Admin.js";
import Organization from "../models/Organization.js";
import Volunteer from "../models/Volunteer.js";
import Opportunity from "../models/Opportunity.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { io } from "../../server.js";

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
      admin: { name: admin.name, email: admin.email },
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

    // Real-time Socket.IO events
    const socketId = global.onlineVolunteers.get(id);
    if (socketId) {
      if (status === "suspended") {
        io.to(socketId).emit("suspended", {
          reason: volunteer.suspensionReason,
        });
      } else if (status === "active") {
        io.to(socketId).emit("reactivated");
      }
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
