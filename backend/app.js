import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import mongoose from "mongoose";
import { connectDB, getLastDbError } from "./src/config/db.js";
import { UPLOADS_DIR } from "./src/config/paths.js";
import { generalLimiter } from "./src/middlewares/rateLimit.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const normalizeOrigin = (value) => value?.trim().replace(/\/+$/, "");

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || "").split(","),
  "http://localhost:5173",
].map(normalizeOrigin).filter(Boolean);

export const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  try {
    const url = new URL(normalizedOrigin);
    // Allow local development on localhost or 127.0.0.1 on any port
    if (
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    ) {
      return true;
    }

    // Allow legitimate Servespot production & preview Vercel domains
    return (
      url.protocol === "https:" &&
      /^servespot(\.vercel\.app|(-[a-z0-9]+)*-petsyys-projects\.vercel\.app)$/.test(
        url.hostname
      )
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle malformed JSON payloads before hitting route handlers.
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }
  return next(err);
});

if (process.env.MONGO_URI) {
  connectDB().catch((error) => {
    console.error("MongoDB boot error:", error.message);
  });
} else {
  console.warn(
    "MONGO_URI is not set. Database-backed routes will fail until it is configured."
  );
}

import "./src/modules/volunteers/volunteer.model.js";
import "./src/modules/opportunities/opportunity.model.js";
import "./src/modules/organizations/organization.model.js";
import "./src/modules/admin/admin.model.js";
import "./src/modules/notifications/notification.model.js";

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOADS_DIR));

import adminRoutes from "./src/modules/admin/admin.routes.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import volunteerRoutes from "./src/modules/volunteers/volunteer.routes.js";
import organizationRoutes from "./src/modules/organizations/organization.routes.js";
import opportunityRoutes from "./src/modules/opportunities/opportunity.routes.js";
import notificationRoutes from "./src/modules/notifications/notification.routes.js";
import testRoutes from "./src/tests/test.routes.js";

app.use("/api", generalLimiter);

app.use(async (_req, _res, next) => {
  if (process.env.MONGO_URI && mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.warn("Serverless DB connection pending/failed:", err.message);
    }
  }
  next();
});

app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", async (_req, res) => {
  if (process.env.MONGO_URI && mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch {
      // Caught inside connectDB, lastDbError is stored
    }
  }

  res.json({
    ok: true,
    mongoUriConfigured: Boolean(process.env.MONGO_URI),
    dbReadyState: mongoose.connection.readyState,
    lastDbError: getLastDbError(),
  });
});

app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err);
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }
  res.status(500).json({
    message: "Server error",
    error: err.message || String(err),
  });
});

export default app;
