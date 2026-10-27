import { repositories } from "../container.js";
import Admin from "./admin.model.js";
import Organization from "../organizations/organization.model.js";
import Volunteer from "../volunteers/volunteer.model.js";
import Opportunity from "../opportunities/opportunity.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  emitToVolunteer,
  broadcastToAdmins,
  emitToOrganization,
} from "../../realtime/socketGateway.js";
import { sendNotification } from "../../utils/sendNotification.js";

export class AdminService {
  constructor({
    admins = repositories.admins,
    volunteers = repositories.volunteers,
    organizations = repositories.organizations,
    opportunities = repositories.opportunities,
    notifications = repositories.notifications,
  } = {}) {
    this.admins = admins;
    this.volunteers = volunteers;
    this.organizations = organizations;
    this.opportunities = opportunities;
    this.notifications = notifications;
  }

  findByEmail(email) {
    return this.admins.findOne({ email });
  }

  activeAdmins() {
    return this.admins.active();
  }

  getProfile(id) {
    return this.admins.findById(id, { select: "name email role" });
  }

  async getDashboardData() {
    const [
      totalVolunteers,
      totalOrganizations,
      activeOpportunities,
      completedOpportunities,
      opportunities,
    ] = await Promise.all([
      this.volunteers.count(),
      this.organizations.count(),
      this.opportunities.count({ status: { $in: ["Open", "In Progress"] } }),
      this.opportunities.count({ status: "Completed" }),
      this.opportunities.find({}, { lean: true }),
    ]);

    // Group by day of week
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekData = dayNames.map((day) => ({
      day,
      hours: 0,
      tasks: 0,
    }));

    opportunities.forEach((opp) => {
      if (opp.createdAt) {
        const dayIndex = new Date(opp.createdAt).getDay();
        weekData[dayIndex].hours += (Number(opp.volunteersNeeded) || 0) * 2; // rough hour estimate
        weekData[dayIndex].tasks += 1;
      }
    });

    const weeklyActivity = weekData;
    const weeklyTasks = weekData.map((d) => ({
      day: d.day,
      completed: d.tasks,
    }));

    return {
      totalVolunteers,
      totalOrganizations,
      activeOpportunities,
      completedOpportunities,
      weeklyActivity,
      weeklyTasks,
    };
  }

  async getReportsData() {
    const orgAggregateModel = this.organizations?.model || this.organizations;
    const oppAggregateModel = this.opportunities?.model || this.opportunities;
    const volAggregateModel = this.volunteers?.model || this.volunteers;

    const topVolunteerPromise = this.volunteers.findOne(
      {},
      {
        sort: { completedTasks: -1 },
        select: "fullName completedTasks",
        lean: true,
      },
    );

    const topOrganizationPromise = orgAggregateModel.aggregate([
      {
        $lookup: {
          from: "opportunities",
          localField: "_id",
          foreignField: "organization",
          as: "opportunities",
        },
      },
      {
        $project: {
          orgName: 1,
          opportunitiesPosted: { $size: "$opportunities" },
        },
      },
      { $sort: { opportunitiesPosted: -1 } },
      { $limit: 1 },
    ]);

    const totalVolunteerHoursPromise = oppAggregateModel.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: null,
          totalHours: { $sum: { $multiply: ["$volunteersNeeded", 2] } },
        },
      },
    ]);

    const monthlySignupsPromise = Promise.all([
      volAggregateModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            volunteers: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
      orgAggregateModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            organizations: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
    ]);

    const tasksByCategoryPromise = oppAggregateModel.aggregate([
      { $unwind: "$skills" },
      {
        $group: {
          _id: "$skills",
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
      { $limit: 6 },
    ]);

    const recentActivitiesPromise = Promise.all([
      this.volunteers.find(
        {},
        {
          select: "fullName createdAt",
          sort: { createdAt: -1 },
          limit: 5,
          lean: true,
        },
      ),
      this.organizations.find(
        {},
        {
          select: "orgName createdAt",
          sort: { createdAt: -1 },
          limit: 5,
          lean: true,
        },
      ),
    ]);

    const [
      topVolunteer,
      topOrganization,
      totalVolunteerHours,
      monthlySignups,
      tasksByCategory,
      recentActivities,
    ] = await Promise.all([
      topVolunteerPromise,
      topOrganizationPromise,
      totalVolunteerHoursPromise,
      monthlySignupsPromise,
      tasksByCategoryPromise,
      recentActivitiesPromise,
    ]);

    // Combine monthly data
    const monthlyData = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 0; i < 12; i++) {
      const volunteerData = monthlySignups[0]?.find(
        (item) => item._id.month === i + 1,
      );
      const orgData = monthlySignups[1]?.find(
        (item) => item._id.month === i + 1,
      );

      monthlyData.push({
        month: monthNames[i],
        volunteers: volunteerData?.volunteers || 0,
        organizations: orgData?.organizations || 0,
      });
    }

    const colors = [
      "#7C3AED",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#3B82F6",
      "#8B5CF6",
    ];
    const tasksWithColors = tasksByCategory.map((task, index) => ({
      ...task,
      name: task._id,
      color: colors[index % colors.length],
    }));

    const activities = [
      ...recentActivities[0].map((vol) => ({
        id: vol._id,
        name: vol.fullName,
        role: "Volunteer",
        activity: "Joined ServeSpot",
        date: new Date(vol.createdAt).toLocaleDateString(),
      })),
      ...recentActivities[1].map((org) => ({
        id: org._id,
        name: org.orgName,
        role: "Organization",
        activity: "Registered organization",
        date: new Date(org.createdAt).toLocaleDateString(),
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    return {
      topVolunteer: topVolunteer
        ? {
            name: topVolunteer.fullName,
            tasksCompleted: topVolunteer.completedTasks,
          }
        : null,
      topOrganization:
        topOrganization.length > 0
          ? {
              name: topOrganization[0].orgName,
              opportunitiesPosted: topOrganization[0].opportunitiesPosted,
            }
          : null,
      totalVolunteerHours:
        totalVolunteerHours.length > 0 ? totalVolunteerHours[0].totalHours : 0,
      monthlySignups: monthlyData,
      tasksByCategory: tasksWithColors,
      recentActivities: activities,
    };
  }

  getNotifications(adminId, limit = 50) {
    return this.notifications.find(
      { user: adminId, userModel: "Admin" },
      { sort: { createdAt: -1 }, limit },
    );
  }

  markNotificationsRead(adminId) {
    return this.notifications.markAllRead(adminId, "Admin");
  }

  async login({ email, password }) {
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      const err = new Error("Invalid email or password");
      err.status = 400;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      const err = new Error("Invalid email or password");
      err.status = 400;
      throw err;
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    };
  }

  async getAllOrganizations() {
    return Organization.find()
      .select("orgName email orgType city status createdAt document")
      .sort({ createdAt: -1 });
  }

  async updateOrganizationStatus(id, { status, reason, actor = "Admin" }) {
    if (!["active", "suspended", "pending"].includes(status)) {
      const err = new Error("Invalid status value");
      err.status = 400;
      throw err;
    }

    const organization = await Organization.findById(id);
    if (!organization) {
      const err = new Error("Organization not found");
      err.status = 404;
      throw err;
    }

    organization.status = status;
    organization.suspensionReason =
      status === "suspended" ? reason || "No reason provided" : null;
    organization.suspensionDate = status === "suspended" ? new Date() : null;
    organization.suspendedBy = status === "suspended" ? actor : null;

    await organization.save();

    if (status === "suspended") {
      await Opportunity.updateMany(
        { organization: id, status: { $in: ["Open", "In Progress"] } },
        { status: "Suspended" }
      );
      emitToOrganization(id, "suspended", { reason });
    } else if (status === "active") {
      await Opportunity.updateMany(
        { organization: id, status: "Suspended" },
        { status: "Open" }
      );
      emitToOrganization(id, "reactivated", {});
    }

    const notifTitle =
      status === "suspended"
        ? "Account Suspended"
        : status === "active"
        ? "Account Reactivated"
        : "Account Pending Verification";

    const notifMsg =
      status === "suspended"
        ? `Your organization account has been suspended. ${reason ? `Reason: ${reason}` : ""}`
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
      channel: "email",
    });

    broadcastToAdmins("organizationStatusUpdated", {
      orgId: id,
      status,
    });

    try {
      const admins = await Admin.find({ status: "active" });
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
      console.error("Failed to notify admins of org status change:", e);
    }

    return organization;
  }

  async getAllVolunteers() {
    return Volunteer.find().select(
      "fullName email status badges completedTasks createdAt"
    );
  }

  async updateVolunteerStatus(id, { status, reason, actor = "Admin" }) {
    if (!["active", "suspended", "pending"].includes(status)) {
      const err = new Error("Invalid status value");
      err.status = 400;
      throw err;
    }

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      const err = new Error("Volunteer not found");
      err.status = 404;
      throw err;
    }

    volunteer.status = status;
    volunteer.suspensionReason =
      status === "suspended" ? reason || "No reason provided" : null;
    volunteer.suspensionDate = status === "suspended" ? new Date() : null;

    await volunteer.save();

    if (status === "suspended") {
      emitToVolunteer(id, "suspended", { reason: volunteer.suspensionReason });
    } else if (status === "active") {
      emitToVolunteer(id, "reactivated", {});
    }

    const notifTitle =
      status === "suspended"
        ? "Account Suspended"
        : status === "active"
        ? "Account Reactivated"
        : "Account Pending Review";

    const notifMsg =
      status === "suspended"
        ? `Your volunteer account has been suspended. ${reason ? `Reason: ${reason}` : ""}`
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

    broadcastToAdmins("volunteerStatusUpdated", {
      userId: id,
      status,
    });

    try {
      const admins = await Admin.find({ status: "active" });
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
      console.error("Failed to notify admins of volunteer status change:", e);
    }

    return volunteer;
  }

  async notifyAdminsOfNewRegistration(userType, userData) {
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
  }
}

export const adminService = new AdminService();
