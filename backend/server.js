import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./src/config/db.js";

dotenv.config();

const app = express();

// --- existing middleware ---
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// --- your models ---
import "./src/models/Volunteer.js";
import "./src/models/Opportunity.js";
import "./src/models/Organization.js";
import "./src/models/Admin.js";

// --- uploads dir ---
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOADS_DIR));

// --- your routes ---
import adminRoutes from "./src/routes/admin.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import volunteerRoutes from "./src/routes/volunteer.routes.js";
import organizationRoutes from "./src/routes/organization.routes.js";
import opportunityRoutes from "./src/routes/opportunity.routes.js";
import orgVolunteerRoutes from "./src/routes/manage.routes.js";

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/org/volunteers", orgVolunteerRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    message: "Server error",
    error: err.message || String(err),
  });
});


// SOCKET.IO SETUP
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// Track connected volunteers
global.onlineVolunteers = new Map();

io.on("connection", (socket) => {
  console.log("Volunteer connected:", socket.id);

  socket.on("registerVolunteer", (volunteerId) => {
    global.onlineVolunteers.set(volunteerId, socket.id);
    console.log(`Registered volunteer ${volunteerId} on socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [id, sId] of global.onlineVolunteers.entries()) {
      if (sId === socket.id) {
        global.onlineVolunteers.delete(id);
        break;
      }
    }
    console.log("Volunteer disconnected:", socket.id);
  });
});

// --- start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
