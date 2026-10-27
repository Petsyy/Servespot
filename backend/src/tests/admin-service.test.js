import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AdminService } from "../modules/admin/admin.service.js";

describe("AdminService", () => {
  it("aggregates dashboard metrics and computes weekly activity", async () => {
    const fakeVolunteers = { count: async () => 15 };
    const fakeOrganizations = { count: async () => 4 };
    const fakeOpportunities = {
      count: async (filter) => {
        if (filter.status === "Completed") return 8;
        return 5;
      },
      find: async () => [
        {
          createdAt: new Date("2026-10-25T10:00:00Z"), // Sunday (day 0)
          volunteersNeeded: 3,
        },
        {
          createdAt: new Date("2026-10-26T12:00:00Z"), // Monday (day 1)
          volunteersNeeded: 2,
        },
      ],
    };

    const service = new AdminService({
      volunteers: fakeVolunteers,
      organizations: fakeOrganizations,
      opportunities: fakeOpportunities,
      admins: {},
      notifications: {},
    });

    const result = await service.getDashboardData();

    assert.equal(result.totalVolunteers, 15);
    assert.equal(result.totalOrganizations, 4);
    assert.equal(result.activeOpportunities, 5);
    assert.equal(result.completedOpportunities, 8);
    assert.equal(Array.isArray(result.weeklyActivity), true);
    assert.equal(result.weeklyActivity.length, 7);
    assert.equal(result.weeklyTasks.length, 7);

    // Sun: volunteersNeeded 3 * 2 = 6 hours, 1 task
    assert.equal(result.weeklyActivity[0].hours, 6);
    assert.equal(result.weeklyActivity[0].tasks, 1);
    assert.equal(result.weeklyTasks[0].completed, 1);

    // Mon: volunteersNeeded 2 * 2 = 4 hours, 1 task
    assert.equal(result.weeklyActivity[1].hours, 4);
    assert.equal(result.weeklyActivity[1].tasks, 1);
    assert.equal(result.weeklyTasks[1].completed, 1);
  });

  it("fetches admin profile with proper projection", async () => {
    let capturedId = null;
    let capturedOptions = null;
    const fakeAdmins = {
      findById: async (id, options) => {
        capturedId = id;
        capturedOptions = options;
        return { _id: id, name: "Super Admin", email: "admin@test.com", role: "admin" };
      },
    };

    const service = new AdminService({
      admins: fakeAdmins,
      volunteers: {},
      organizations: {},
      opportunities: {},
      notifications: {},
    });

    const profile = await service.getProfile("admin-99");

    assert.equal(capturedId, "admin-99");
    assert.deepEqual(capturedOptions, { select: "name email role" });
    assert.equal(profile.name, "Super Admin");
  });

  it("fetches notifications and marks them as read", async () => {
    const calls = [];
    const fakeNotifications = {
      find: async (...args) => {
        calls.push(["find", ...args]);
        return [{ _id: "notif-1", title: "Test" }];
      },
      markAllRead: async (...args) => {
        calls.push(["markAllRead", ...args]);
        return { modifiedCount: 3 };
      },
    };

    const service = new AdminService({
      admins: {},
      volunteers: {},
      organizations: {},
      opportunities: {},
      notifications: fakeNotifications,
    });

    const notifs = await service.getNotifications("admin-1", 20);
    assert.equal(notifs.length, 1);
    assert.deepEqual(calls[0], [
      "find",
      { user: "admin-1", userModel: "Admin" },
      { sort: { createdAt: -1 }, limit: 20 },
    ]);

    const readResult = await service.markNotificationsRead("admin-1");
    assert.equal(readResult.modifiedCount, 3);
    assert.deepEqual(calls[1], ["markAllRead", "admin-1", "Admin"]);
  });
});
