import { describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { requireRole } from "../middlewares/auth.middleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "servespot-jwt-secret-test-key";
process.env.JWT_SECRET = JWT_SECRET;

const createMockRes = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

describe("Role-based middleware (requireRole)", () => {
  it("rejects requests without any token with 401", async () => {
    const middleware = requireRole("volunteer");
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /no token/i);
  });

  it("rejects users whose role is not in allowedRoles with 403", async () => {
    const token = jwt.sign(
      { id: "vol-1", role: "volunteer" },
      JWT_SECRET
    );
    const middleware = requireRole("organization", "admin");
    const req = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.match(res.body.message, /Access denied/i);
    assert.match(res.body.message, /organization or admin/i);
  });

  it("allows users when their role matches one of allowedRoles", async () => {
    const orgToken = jwt.sign(
      { id: "org-1", role: "organization" },
      JWT_SECRET
    );
    const middleware = requireRole("organization", "admin");
    const req = {
      headers: { authorization: `Bearer ${orgToken}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, "org-1");
    assert.equal(req.user.role, "organization");
  });

  it("extracts token from role-specific cookies", async () => {
    const adminToken = jwt.sign(
      { id: "admin-1", role: "admin" },
      JWT_SECRET
    );
    const middleware = requireRole("admin");
    const req = {
      headers: {
        cookie: `adminToken=${adminToken}`,
      },
    };
    const res = createMockRes();
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, "admin-1");
    assert.equal(req.user.role, "admin");
  });

  it("passes immediately if req.user is already populated with allowed role", async () => {
    const middleware = requireRole("volunteer");
    const req = {
      user: { id: "vol-123", role: "volunteer" },
      headers: {},
    };
    const res = createMockRes();
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
  });
});
