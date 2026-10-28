import { describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { getSession, resetPassword, registerVolunteer, registerOrganization, checkEmailAvailability } from "../modules/auth/auth.controller.js";
import { setAuthCookie, setAdminCookie, clearAuthCookies } from "../utils/authCookies.js";

const JWT_SECRET = process.env.JWT_SECRET || "servespot-jwt-secret-test-key";
process.env.JWT_SECRET = JWT_SECRET;

const createMockRes = () => {
  const res = {
    statusCode: null,
    body: null,
    cookies: {},
    clearedCookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    cookie(name, val, options) {
      this.cookies[name] = { val, options };
      return this;
    },
    clearCookie(name, options) {
      this.clearedCookies.push({ name, options });
      delete this.cookies[name];
      return this;
    },
  };
  return res;
};

describe("Auth Cookies Management", () => {
  it("setAuthCookie sets authToken and clears adminToken", () => {
    const res = createMockRes();
    setAuthCookie(res, "test-token-123");

    assert.equal(res.cookies.authToken.val, "test-token-123");
    assert.ok(res.clearedCookies.some((c) => c.name === "adminToken"));
  });

  it("setAdminCookie sets adminToken and clears authToken", () => {
    const res = createMockRes();
    setAdminCookie(res, "admin-token-456");

    assert.equal(res.cookies.adminToken.val, "admin-token-456");
    assert.ok(res.clearedCookies.some((c) => c.name === "authToken"));
  });

  it("clearAuthCookies clears both authToken and adminToken", () => {
    const res = createMockRes();
    clearAuthCookies(res);

    assert.ok(res.clearedCookies.some((c) => c.name === "authToken"));
    assert.ok(res.clearedCookies.some((c) => c.name === "adminToken"));
  });
});

describe("Session Verification (getSession)", () => {
  it("returns 401 when no session cookies exist", () => {
    const req = { headers: {} };
    const res = createMockRes();

    getSession(req, res);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.authenticated, false);
  });

  it("returns volunteer session with email and role", () => {
    const token = jwt.sign(
      { id: "vol-99", role: "volunteer", email: "volunteer@example.com" },
      JWT_SECRET
    );
    const req = { headers: { cookie: `authToken=${token}` } };
    const res = createMockRes();

    getSession(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.authenticated, true);
    assert.equal(res.body.user.id, "vol-99");
    assert.equal(res.body.user.role, "volunteer");
    assert.equal(res.body.user.email, "volunteer@example.com");
  });

  it("safely falls back to authToken when adminToken is invalid or expired", () => {
    const validVolToken = jwt.sign(
      { id: "vol-88", role: "volunteer", email: "vol88@example.com" },
      JWT_SECRET
    );
    const expiredAdminToken = "invalid-or-expired-token";
    const req = {
      headers: {
        cookie: `adminToken=${expiredAdminToken}; authToken=${validVolToken}`,
      },
    };
    const res = createMockRes();

    getSession(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.authenticated, true);
    assert.equal(res.body.user.id, "vol-88");
    assert.equal(res.body.user.role, "volunteer");
    assert.equal(res.body.user.email, "vol88@example.com");
  });

  it("authenticates session via Authorization Bearer token when cookies are blocked", () => {
    const bearerToken = jwt.sign(
      { id: "vol-77", role: "volunteer", email: "bearer-vol@example.com" },
      JWT_SECRET
    );
    const req = {
      headers: {
        authorization: `Bearer ${bearerToken}`,
      },
    };
    const res = createMockRes();

    getSession(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.authenticated, true);
    assert.equal(res.body.user.id, "vol-77");
    assert.equal(res.body.user.role, "volunteer");
    assert.equal(res.body.user.email, "bearer-vol@example.com");
  });
});

describe("Password Reset Security", () => {
  it("rejects password reset when resetToken is missing", async () => {
    const req = {
      body: {
        email: "target@example.com",
        role: "volunteer",
        newPassword: "NewSecurePassword123!",
      },
    };
    const res = createMockRes();

    await resetPassword(req, res);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /reset token is required/i);
  });

  it("rejects password reset when resetToken is invalid", async () => {
    const req = {
      body: {
        email: "target@example.com",
        role: "volunteer",
        newPassword: "NewSecurePassword123!",
        resetToken: "fake-unauthorized-token",
      },
    };
    const res = createMockRes();

    await resetPassword(req, res);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /invalid or expired reset token/i);
  });

  it("rejects password reset when newPassword is less than 8 characters", async () => {
    const token = jwt.sign(
      { id: "vol-123", role: "volunteer", purpose: "pwd_reset" },
      JWT_SECRET
    );
    const req = {
      body: {
        email: "target@example.com",
        role: "volunteer",
        newPassword: "short",
        resetToken: token,
      },
    };
    const res = createMockRes();

    await resetPassword(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /at least 8 characters/i);
  });

  it("rejects password reset when token purpose is not pwd_reset", async () => {
    const authLoginToken = jwt.sign(
      { id: "vol-123", role: "volunteer" },
      JWT_SECRET
    );
    const req = {
      body: {
        email: "target@example.com",
        role: "volunteer",
        newPassword: "NewSecurePassword123!",
        resetToken: authLoginToken,
      },
    };
    const res = createMockRes();

    await resetPassword(req, res);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /invalid reset token/i);
  });
});

describe("Registration Server-side Validation", () => {
  it("registerVolunteer rejects short password (< 8 chars)", async () => {
    const req = {
      body: {
        fullName: "Test Volunteer",
        email: "test@example.com",
        password: "123",
        birthdate: "2000-01-01",
      },
    };
    const res = createMockRes();

    await registerVolunteer(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /at least 8 characters/i);
  });

  it("registerOrganization rejects missing or short password", async () => {
    const req = {
      body: {
        orgName: "Test Org",
        email: "org@example.com",
        password: "",
      },
    };
    const res = createMockRes();

    await registerOrganization(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /at least 8 characters/i);
  });

  it("registerVolunteer rejects missing first name", async () => {
    const req = {
      body: {
        firstName: "",
        lastName: "Doe",
        email: "test@example.com",
        password: "ValidPassword123!",
        birthdate: "2000-01-01",
      },
    };
    const res = createMockRes();

    await registerVolunteer(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /first name is required/i);
  });

  it("registerVolunteer rejects missing last name", async () => {
    const req = {
      body: {
        firstName: "Jane",
        lastName: "",
        email: "test@example.com",
        password: "ValidPassword123!",
        birthdate: "2000-01-01",
      },
    };
    const res = createMockRes();

    await registerVolunteer(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /last name is required/i);
  });
});

describe("Email Availability Check (checkEmailAvailability)", () => {
  it("rejects missing or empty email with 400", async () => {
    const req = { query: {} };
    const res = createMockRes();

    await checkEmailAvailability(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.available, false);
    assert.match(res.body.message, /valid email is required/i);
  });

  it("handles whitespace-only email with 400", async () => {
    const req = { query: { email: "   " } };
    const res = createMockRes();

    await checkEmailAvailability(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.available, false);
  });
});
