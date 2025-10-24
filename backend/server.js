import "./loadEnv.js";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./src/config/db.js";
import { sendEmail } from "./src/utils/sendEmail.js";
import { sendNotification } from "./src/utils/sendNotification.js";

// =============================
// 🔧 EXPRESS APP SETUP
// =============================
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

// =============================
// 🧩 LOAD MODELS
// =============================
import "./src/models/Volunteer.js";
import "./src/models/Opportunity.js";
import "./src/models/Organization.js";
import "./src/models/Admin.js";
import "./src/models/Notification.js";

// =============================
// 📁 UPLOADS DIRECTORY
// =============================
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOADS_DIR));

// =============================
// 🧭 ROUTES
// =============================
import adminRoutes from "./src/routes/admin.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import volunteerRoutes from "./src/routes/volunteer.routes.js";
import organizationRoutes from "./src/routes/organization.routes.js";
import opportunityRoutes from "./src/routes/opportunity.routes.js";
import orgVolunteerRoutes from "./src/routes/manage.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/org/volunteers", orgVolunteerRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// (Removed) Test routes

// =============================
// ⚠️ GLOBAL ERROR HANDLER
// =============================
app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    message: "Server error",
    error: err.message || String(err),
  });
});

// =============================
// ⚡ SOCKET.IO SERVER
// =============================
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// --- Track connected clients ---
global.onlineVolunteers = new Map();
global.onlineOrganizations = new Map();
global.onlineAdmins = new Map();

// --- Utility: Remove disconnected sockets ---
function cleanSocket(map, socketId) {
  for (const [id, sId] of map.entries()) {
    if (sId === socketId) map.delete(id);
  }
}

// --- SOCKET CONNECTION HANDLER ---
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Register volunteer
  socket.on("registerVolunteer", (volunteerId) => {
    if (!volunteerId) return;
    cleanSocket(global.onlineVolunteers, socket.id);
    global.onlineVolunteers.set(volunteerId, socket.id);
    console.log(`Volunteer socket registered: ${volunteerId}`);
  });

  // Register organization
  socket.on("registerOrganization", (orgId) => {
    if (!orgId) return;
    cleanSocket(global.onlineOrganizations, socket.id);
    global.onlineOrganizations.set(orgId, socket.id);
    console.log(`Organization socket registered: ${orgId}`);
  });

  // Register admin
  socket.on("registerAdmin", (adminId) => {
    if (!adminId) return;
    cleanSocket(global.onlineAdmins, socket.id);
    global.onlineAdmins.set(adminId, socket.id);
    console.log(`Admin socket registered: ${adminId}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    cleanSocket(global.onlineVolunteers, socket.id);
    cleanSocket(global.onlineOrganizations, socket.id);
    cleanSocket(global.onlineAdmins, socket.id);
    console.log("Socket disconnected:", socket.id);
  });
});

// =============================
// 🚀 SOCKET HELPERS
// =============================
export function emitToVolunteer(volunteerId, event, payload) {
  const socketId = global.onlineVolunteers.get(volunteerId);
  if (socketId) {
    io.to(socketId).emit(event, payload);
    console.log(`Sent "${event}" to volunteer ${volunteerId}`);
  } else {
    console.log(`Volunteer ${volunteerId} not online`);
  }
}

export function emitToOrganization(orgId, event, payload) {
  const socketId = global.onlineOrganizations.get(orgId);
  if (socketId) {
    io.to(socketId).emit(event, payload);
    console.log(`Sent "${event}" to organization ${orgId}`);
  } else {
    console.log(`Organization ${orgId} not online`);
  }
}

export function broadcastToAdmins(event, payload) {
  for (const [adminId, socketId] of global.onlineAdmins.entries()) {
    io.to(socketId).emit(event, payload);
  }
  console.log(`Broadcasted "${event}" to all admins`);
}

// =============================
//  START SERVER
// =============================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
