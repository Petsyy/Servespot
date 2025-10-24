import express from "express";
import {
  loginAdmin,
  getAllOrganizations,
  updateOrganizationStatus,
  getAllVolunteers,
  updateVolunteerStatus,
} from "../controllers/admin.controller.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";
import Volunteer from "../models/Volunteer.js";
import Organization from "../models/Organization.js";
import Opportunity from "../models/Opportunity.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const totalVolunteers = await Volunteer.countDocuments();
    const totalOrganizations = await Organization.countDocuments();
    const activeOpportunities = await Opportunity.countDocuments({
      status: { $in: ["Open", "In Progress"] },
    });
    const completedOpportunities = await Opportunity.countDocuments({
      status: "Completed",
    });

    // Simulate weekly data (replace with aggregation if you have timestamps)
    const weeklyActivity = [
      { day: "Mon", hours: 6, tasks: 4 },
      { day: "Tue", hours: 8, tasks: 6 },
      { day: "Wed", hours: 4, tasks: 3 },
      { day: "Thu", hours: 7, tasks: 5 },
      { day: "Fri", hours: 5, tasks: 2 },
      { day: "Sat", hours: 9, tasks: 7 },
      { day: "Sun", hours: 4, tasks: 3 },
    ];

    const weeklyTasks = [
      { day: "Mon", completed: 5 },
      { day: "Tue", completed: 7 },
      { day: "Wed", completed: 3 },
      { day: "Thu", completed: 6 },
      { day: "Fri", completed: 4 },
      { day: "Sat", completed: 8 },
      { day: "Sun", completed: 2 },
    ];

    res.json({
      totalVolunteers,
      totalOrganizations,
      activeOpportunities,
      completedOpportunities,
      weeklyActivity,
      weeklyTasks,
    });
  } catch (err) {
    console.error("❌ Error loading admin dashboard:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

// Reports endpoint for comprehensive analytics
router.get("/reports", async (req, res) => {
  try {
    // Top performers
    const topVolunteer = await Volunteer.findOne()
      .sort({ completedTasks: -1 })
      .select("fullName completedTasks")
      .lean();

    const topOrganization = await Organization.aggregate([
      {
        $lookup: {
          from: "opportunities",
          localField: "_id",
          foreignField: "organization",
          as: "opportunities"
        }
      },
      {
        $project: {
          orgName: 1,
          opportunitiesPosted: { $size: "$opportunities" }
        }
      },
      { $sort: { opportunitiesPosted: -1 } },
      { $limit: 1 }
    ]);

    // Total volunteer hours (estimated from completed tasks)
    const totalVolunteerHours = await Opportunity.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: null,
          totalHours: { $sum: { $multiply: ["$volunteersNeeded", 2] } } // Estimate 2 hours per task
        }
      }
    ]);

    // Monthly signups data
    const monthlySignups = await Promise.all([
      Volunteer.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            volunteers: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }
      ]),
      Organization.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            organizations: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }
      ])
    ]);

    // Combine monthly data
    const monthlyData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 0; i < 12; i++) {
      const volunteerData = monthlySignups[0].find(item => item._id.month === i + 1);
      const orgData = monthlySignups[1].find(item => item._id.month === i + 1);
      
      monthlyData.push({
        month: monthNames[i],
        volunteers: volunteerData?.volunteers || 0,
        organizations: orgData?.organizations || 0
      });
    }

    // Tasks by category (using skills as categories)
    const tasksByCategory = await Opportunity.aggregate([
      { $unwind: "$skills" },
      {
        $group: {
          _id: "$skills",
          value: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 6 }
    ]);

    // Add colors to categories
    const colors = ["#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"];
    const tasksWithColors = tasksByCategory.map((task, index) => ({
      ...task,
      name: task._id,
      color: colors[index % colors.length]
    }));

    // Recent activities
    const recentActivities = await Promise.all([
      Volunteer.find()
        .select("fullName createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Organization.find()
        .select("orgName createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const activities = [
      ...recentActivities[0].map(vol => ({
        id: vol._id,
        name: vol.fullName,
        role: "Volunteer",
        activity: "Joined ServeSpot",
        date: new Date(vol.createdAt).toLocaleDateString()
      })),
      ...recentActivities[1].map(org => ({
        id: org._id,
        name: org.orgName,
        role: "Organization",
        activity: "Registered organization",
        date: new Date(org.createdAt).toLocaleDateString()
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({
      topVolunteer: topVolunteer ? {
        name: topVolunteer.fullName,
        tasksCompleted: topVolunteer.completedTasks
      } : null,
      topOrganization: topOrganization.length > 0 ? {
        name: topOrganization[0].orgName,
        opportunitiesPosted: topOrganization[0].opportunitiesPosted
      } : null,
      totalVolunteerHours: totalVolunteerHours.length > 0 ? totalVolunteerHours[0].totalHours : 0,
      monthlySignups: monthlyData,
      tasksByCategory: tasksWithColors,
      recentActivities: activities
    });
  } catch (err) {
    console.error("❌ Error loading reports data:", err);
    res.status(500).json({ message: "Failed to load reports data" });
  }
});

/* =====================================================
   ADMIN AUTH
===================================================== */
router.post("/login", loginAdmin);

/* =====================================================
    ADMIN DASHBOARD (Example Protected)
===================================================== */
router.get("/dashboard", protectAdmin, (req, res) => {
  res.status(200).json({ message: "Welcome to the Admin Dashboard" });
});

/* =====================================================
   ORGANIZATION MANAGEMENT
===================================================== */
router.get("/organizations", protectAdmin, getAllOrganizations);
router.put("/organizations/:id/status", protectAdmin, updateOrganizationStatus);

/* =====================================================
    VOLUNTEER MANAGEMENT
===================================================== */
router.get("/volunteers", protectAdmin, getAllVolunteers);
router.put("/volunteers/:id/status", protectAdmin, updateVolunteerStatus);

/* =====================================================
    ADMIN NOTIFICATIONS
===================================================== */
router.get("/:adminId/notifications", async (req, res) => {
  try {
    const { adminId } = req.params;
    const notifications = await Notification.find({ 
      user: adminId, 
      userModel: "Admin" 
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json({ data: notifications });
  } catch (err) {
    console.error("❌ Error fetching admin notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

router.put("/:adminId/notifications/read", async (req, res) => {
  try {
    const { adminId } = req.params;
    await Notification.updateMany(
      { user: adminId, userModel: "Admin", isRead: false },
      { isRead: true }
    );
    
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("❌ Error marking admin notifications as read:", err);
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
});

// Test route to create sample admin notifications
router.post("/:adminId/notifications/test", async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Create sample notifications
    const sampleNotifications = [
      {
        user: adminId,
        userModel: "Admin",
        title: "New Organization Registration",
        message: "Socia organization has registered and needs verification.",
        type: "organization_verification",
        channel: "inApp",
        link: "/admin/organizations"
      },
      {
        user: adminId,
        userModel: "Admin",
        title: "New Volunteer Registration",
        message: "Peter Arenas has registered and needs verification.",
        type: "user_registration",
        channel: "inApp",
        link: "/admin/volunteers"
      },
      {
        user: adminId,
        userModel: "Admin",
        title: "System Update Available",
        message: "A new system update is available. Please review the changelog.",
        type: "system",
        channel: "inApp",
        link: "/admin/settings"
      },
      {
        user: adminId,
        userModel: "Admin",
        title: "Monthly Report Generated",
        message: "The monthly analytics report has been generated and is ready for review.",
        type: "report",
        channel: "inApp",
        link: "/admin/reports"
      }
    ];

    const createdNotifications = await Notification.insertMany(sampleNotifications);
    
    res.json({ 
      message: "Test notifications created successfully",
      notifications: createdNotifications
    });
  } catch (err) {
    console.error("❌ Error creating test notifications:", err);
    res.status(500).json({ message: "Failed to create test notifications" });
  }
});

export default router;
