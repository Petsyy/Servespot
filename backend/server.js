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

const app = express();

// --- middleware ---
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- connect DB ---
connectDB();

// --- models ---
import "./src/models/Volunteer.js";
import "./src/models/Opportunity.js";
import "./src/models/Organization.js";
import "./src/models/Admin.js";
import "./src/models/Notification.js";

// --- uploads dir ---
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOADS_DIR));

// --- routes ---
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

// --- health check ---
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- test endpoints ---
app.get("/api/test-notif", async (req, res) => {
  try {
    const testVolunteerId = "68f86f7e7177cde6079a5aca";
    const testVolunteerEmail = "peterarenasdiaz16@gmail.com";

    const notif = await sendNotification({
      userId: testVolunteerId,
      userModel: "Volunteer",
      email: testVolunteerEmail,
      title: "📢 Test Notification",
      message: "This is a test reminder from ServeSpot!",
      type: "reminder",
    });

    res.json({ success: true, notif });
  } catch (err) {
    console.error("❌ Notification test failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "ezmarket1604@gmail.com",
      subject: "📨 ServeSpot Test Email",
      html: `
        <h2 style="color:#2563eb;">ServeSpot Email Test</h2>
        <p>This is a test email from your ServeSpot backend. 🎉</p>
        <p>If you received this, your SMTP setup works perfectly!</p>
      `,
    });
    res.json({ success: true, message: "✅ Email sent successfully!" });
  } catch (error) {
    console.error("❌ Email test error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- global error handler ---
app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    message: "Server error",
    error: err.message || String(err),
  });
});

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// Track connected users
global.onlineVolunteers = new Map();
global.onlineOrganizations = new Map();
global.onlineAdmins = new Map(); // ✅ NEW

// Helper: remove stale socket IDs
function cleanSocket(map, socketId) {
  for (const [id, sId] of map.entries()) {
    if (sId === socketId) map.delete(id);
  }
}

// --- SOCKET CONNECTION HANDLERS ---
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Volunteer registration
  socket.on("registerVolunteer", (volunteerId) => {
    if (!volunteerId) return;
    cleanSocket(global.onlineVolunteers, socket.id);
    global.onlineVolunteers.set(volunteerId, socket.id);
    console.log(`✅ Volunteer ${volunteerId} registered -> ${socket.id}`);
  });

  // Organization registration
  socket.on("registerOrganization", (orgId) => {
    if (!orgId) return;
    cleanSocket(global.onlineOrganizations, socket.id);
    global.onlineOrganizations.set(orgId, socket.id);
    console.log(`🏢 Organization ${orgId} registered -> ${socket.id}`);
  });

  // Admin registration
  socket.on("registerAdmin", (adminId) => {
    if (!adminId) return;
    cleanSocket(global.onlineAdmins, socket.id);
    global.onlineAdmins.set(adminId, socket.id);
    console.log(`🧑‍💼 Admin ${adminId} registered -> ${socket.id}`);
  });

  socket.on("disconnect", () => {
    cleanSocket(global.onlineVolunteers, socket.id);
    cleanSocket(global.onlineOrganizations, socket.id);
    cleanSocket(global.onlineAdmins, socket.id);
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* --- Safe emitter with retry (volunteers) --- */
export function emitToVolunteer(volunteerId, event, payload) {
  const socketId = global.onlineVolunteers.get(volunteerId);
  if (socketId) {
    io.to(socketId).emit(event, payload);
    console.log(`📢 Sent "${event}" to volunteer ${volunteerId}`);
  } else {
    console.log(`⚠️ Volunteer ${volunteerId} not online, retrying...`);
    setTimeout(() => {
      const retryId = global.onlineVolunteers.get(volunteerId);
      if (retryId) {
        io.to(retryId).emit(event, payload);
        console.log(`✅ Retry success for volunteer ${volunteerId}`);
      }
    }, 1000);
  }
}

export function emitToOrganization(orgId, event, payload) {
  const socketId = global.onlineOrganizations.get(orgId);
  if (socketId) {
    io.to(socketId).emit(event, payload);
    console.log(`📢 Emitted "${event}" to organization ${orgId}`);
  } else {
    console.log(`⚠️ Organization ${orgId} not online`);
  }
}

/* --- Broadcast helpers for real-time admin refresh --- */
export function broadcastToAdmins(event, payload) {
  for (const [adminId, socketId] of global.onlineAdmins.entries()) {
    io.to(socketId).emit(event, payload);
  }
  console.log(`📡 Broadcasted "${event}" to all admins`);
}

/* --- Start server --- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
