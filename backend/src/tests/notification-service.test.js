import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NotificationService } from "../modules/notifications/notification.service.js";

describe("NotificationService", () => {
  it("cleans volunteer notifications before returning the bounded recent list", async () => {
    const calls = [];
    const service = new NotificationService({
      removeOlderThan: async (...args) => calls.push(["remove", ...args]),
      find: async (...args) => { calls.push(["find", ...args]); return [{ title: "Recent" }]; },
    });

    const result = await service.listVolunteer("volunteer-1");

    assert.deepEqual(result, [{ title: "Recent" }]);
    assert.equal(calls[0][0], "remove");
    assert.deepEqual(calls[0].slice(1, 3), ["volunteer-1", "Volunteer"]);
    assert.deepEqual(calls[1], ["find", { user: "volunteer-1", userModel: "Volunteer" }, { sort: { createdAt: -1 }, limit: 100, lean: true }]);
  });
});
