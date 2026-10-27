import { repositories } from "../container.js";

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
}

export const adminService = new AdminService();
