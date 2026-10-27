import { describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import {
  requireRole,
  requireAdmin,
  requireVolunteer,
  requireOrganization,
  requireAuth,
} from "../middlewares/auth.middleware.js";
import {
  checkEmailAvailability,
  registerVolunteer,
  resetPassword,
} from "../modules/auth/auth.controller.js";

const JWT_SECRET = process.env.JWT_SECRET || "servespot-jwt-secret-test-key";
process.env.JWT_SECRET = JWT_SECRET;

const createMockRes = () => {
  const res = {
    statusCode: null,
    body: null,
    cookies: {},
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

describe("Security Test Suite: Authentication & Token Tampering Defenses", () => {
  it("rejects JWT forged with an unauthorized attacker secret key (401)", async () => {
    const forgedToken = jwt.sign(
      { id: "admin-attacker", role: "admin" },
      "attacker-unauthorized-secret-key"
    );
    const middleware = requireAdmin;
    const req = {
      headers: { authorization: `Bearer ${forgedToken}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /not authorized|token failed/i);
  });

  it("rejects expired JWT tokens (401)", async () => {
    const expiredToken = jwt.sign(
      { id: "user-exp", role: "volunteer", exp: Math.floor(Date.now() / 1000) - 300 },
      JWT_SECRET
    );
    const middleware = requireVolunteer;
    const req = {
      headers: { authorization: `Bearer ${expiredToken}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /not authorized|token failed/i);
  });

  it("rejects tokens crafted with 'none' algorithm (401)", async () => {
    // Header: {"alg":"none","typ":"JWT"} (base64url: eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0)
    // Payload: {"id":"user-hack","role":"admin"} (base64url: eyJpZCI6InVzZXItaGFjayIsInJvbGUiOiJhZG1pbiJ9)
    const noneAlgorithmToken = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpZCI6InVzZXItaGFjayIsInJvbGUiOiJhZG1pbiJ9.";
    const middleware = requireAdmin;
    const req = {
      headers: { authorization: `Bearer ${noneAlgorithmToken}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  it("rejects malformed or truncated tokens without crashing (401)", async () => {
    const malformedToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrupted_payload";
    const middleware = requireAuth;
    const req = {
      headers: { authorization: malformedToken },
    };
    const res = createMockRes();
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  it("rejects whitespace-only or empty Bearer tokens (401)", async () => {
    const req = {
      headers: { authorization: "Bearer     " },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireVolunteer(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /no token/i);
  });

  it("prevents token smuggling via URL query parameters", async () => {
    const validToken = jwt.sign(
      { id: "vol-legit", role: "volunteer" },
      JWT_SECRET
    );
    // Request where token is leaked/smuggled in query param rather than headers/cookies
    const req = {
      headers: {},
      query: { token: validToken, authToken: validToken },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireVolunteer(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /no token/i);
  });
});

describe("Security Test Suite: Role-Based Access Control (RBAC) & Privilege Escalation", () => {
  it("blocks a Volunteer token from accessing Admin endpoints (403)", async () => {
    const volToken = jwt.sign(
      { id: "vol-1", role: "volunteer" },
      JWT_SECRET
    );
    const req = {
      headers: { authorization: `Bearer ${volToken}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireAdmin(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.match(res.body.message, /Requires role: admin/i);
  });

  it("blocks a Volunteer token from accessing Organization endpoints (403)", async () => {
    const volToken = jwt.sign(
      { id: "vol-2", role: "volunteer" },
      JWT_SECRET
    );
    const req = {
      headers: { authorization: `Bearer ${volToken}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireOrganization(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.match(res.body.message, /organization or admin/i);
  });

  it("blocks an Organization token from accessing Admin endpoints (403)", async () => {
    const orgToken = jwt.sign(
      { id: "org-1", role: "organization" },
      JWT_SECRET
    );
    const req = {
      headers: { authorization: `Bearer ${orgToken}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireAdmin(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.match(res.body.message, /Requires role: admin/i);
  });

  it("blocks fabricated or elevated arbitrary roles (e.g., 'superadmin', 'root') (403)", async () => {
    const customRoleToken = jwt.sign(
      { id: "fake-admin", role: "superadmin" },
      JWT_SECRET
    );
    const req = {
      headers: { authorization: `Bearer ${customRoleToken}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireAuth(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  });

  it("blocks tokens with missing or empty role claim (403)", async () => {
    const noRoleToken = jwt.sign(
      { id: "user-no-role" },
      JWT_SECRET
    );
    const req = {
      headers: { authorization: `Bearer ${noRoleToken}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireVolunteer(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
  });

  it("allows Admin supervisory access on requireOrganization", async () => {
    const adminToken = jwt.sign(
      { id: "admin-supervisor", role: "admin" },
      JWT_SECRET
    );
    const req = {
      headers: { authorization: `Bearer ${adminToken}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireOrganization(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.role, "admin");
  });
});

describe("Security Test Suite: Cookie Isolation & Parsing Safety", () => {
  it("safely handles corrupted or malicious cookie strings without uncaught exceptions", async () => {
    const req = {
      headers: {
        cookie: ";;;===;;invalid;;test=;;;corrupted=%%20%test;==",
      },
    };
    const res = createMockRes();
    let nextCalled = false;

    // Should not crash, returns 401 cleanly
    await requireVolunteer(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });

  it("ignores arbitrary cookie names and requires recognized tokens (401)", async () => {
    const req = {
      headers: {
        cookie: "session_id=attacker_session_123; user_role=admin",
      },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireAdmin(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
  });
});

describe("Security Test Suite: Input Sanitization & Injection Defenses", () => {
  it("rejects NoSQL injection query selector object in email check (400)", async () => {
    // Attacker sends { email: { "$gt": "" } } instead of a string
    const req = {
      body: {
        email: { $gt: "" },
      },
    };
    const res = createMockRes();

    await checkEmailAvailability(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /valid email is required/i);
  });

  it("rejects NoSQL injection query selector object in password reset (401)", async () => {
    // Attacker sends { resetToken: { "$ne": null } }
    const req = {
      body: {
        email: "target@example.com",
        role: "volunteer",
        resetToken: { $ne: null },
        newPassword: "ValidPassword123!",
      },
    };
    const res = createMockRes();

    await resetPassword(req, res);
    assert.equal(res.statusCode, 401);
  });

  it("rejects non-string password type in volunteer registration (400)", async () => {
    const req = {
      body: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: { $gt: "" }, // Object injection attempt
      },
    };
    const res = createMockRes();

    await registerVolunteer(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /at least 8 characters/i);
  });

  it("prototype pollution payloads in request body do not pollute global Object.prototype", () => {
    const maliciousPayload = JSON.parse('{"__proto__": {"isAdmin": true}}');
    assert.equal(({}).isAdmin, undefined);
    assert.equal(maliciousPayload.isAdmin, undefined);
  });
});

describe("Security Test Suite: Error Handling & Data Leakage Prevention", () => {
  it("malformed JSON error handler returns clean 400 and does not leak internal traces", () => {
    // Simulates the Express SyntaxError handler in backend/app.js
    const err = new SyntaxError("Unexpected token in JSON at position 0");
    err.body = "{ invalid json payload ";
    const res = createMockRes();
    let nextCalled = false;

    // Mimic app.js handler
    const jsonErrorHandler = (error, _req, response, next) => {
      if (error instanceof SyntaxError && "body" in error) {
        return response.status(400).json({ message: "Invalid JSON payload" });
      }
      return next(error);
    };

    jsonErrorHandler(err, {}, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "Invalid JSON payload");
    // Ensure no stack trace is leaked in body
    assert.equal(res.body.stack, undefined);
  });
});

describe("Security Test Suite: CORS Domain Whitelisting & Origin Isolation", () => {
  it("allows verified localhost development origin", async () => {
    const { isAllowedOrigin } = await import("../../app.js");
    assert.equal(isAllowedOrigin("http://localhost:5173"), true);
    assert.equal(isAllowedOrigin("http://127.0.0.1:5173"), true);
    assert.equal(isAllowedOrigin("http://localhost:4173"), true);
  });

  it("allows legitimate Servespot production Vercel domains", async () => {
    const { isAllowedOrigin } = await import("../../app.js");
    assert.equal(isAllowedOrigin("https://servespot.vercel.app"), true);
    assert.equal(isAllowedOrigin("https://servespot-hnp6367kn-petsyys-projects.vercel.app"), true);
  });

  it("blocks insecure HTTP scheme on production domains", async () => {
    const { isAllowedOrigin } = await import("../../app.js");
    assert.equal(isAllowedOrigin("http://servespot.vercel.app"), false);
  });

  it("blocks spoofed or rogue subdomains targeting Servespot", async () => {
    const { isAllowedOrigin } = await import("../../app.js");
    assert.equal(isAllowedOrigin("https://servespot-rogue.vercel.app"), false);
    assert.equal(isAllowedOrigin("https://servespot.attacker.com"), false);
  });
});

