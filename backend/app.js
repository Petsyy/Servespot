import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { connectDB } from "./src/config/db.js";

// EXPRESS APP SETUP
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// LOAD MODELS
import "./src/models/volunteer.model.js";
import "./src/models/opportunity.model.js";
import "./src/models/organization.model.js";
import "./src/models/admin.model.js";
import "./src/models/notification.model.js";

// UPLOADS DIRECTORY
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOADS_DIR));

// ROUTES
import adminRoutes from "./src/routes/admin.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import volunteerRoutes from "./src/routes/volunteer.routes.js";
import organizationRoutes from "./src/routes/organization.routes.js";
import opportunityRoutes from "./src/routes/opportunity.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import testRoutes from "./src/tests/test.routes.js";

app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// GLOBAL ERROR HANDLER
app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    message: "Server error",
    error: err.message || String(err),
  });
});

export default app;
