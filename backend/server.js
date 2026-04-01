import "./loadEnv.js";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { sendEmail } from "./src/utils/sendEmail.js";
import { sendNotification } from "./src/utils/sendNotification.js";
import {
  setSocketServer,
  ensureSocketMaps,
  emitToVolunteer,
  emitToOrganization,
  broadcastToAdmins,
} from "./src/realtime/socketGateway.js";


// ⚡ SOCKET.IO SERVER
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});
setSocketServer(io);
ensureSocketMaps();

// --- Track connected clients ---
global.onlineVolunteers = global.onlineVolunteers || new Map();
global.onlineOrganizations = global.onlineOrganizations || new Map();
global.onlineAdmins = global.onlineAdmins || new Map();

// --- Utility: Remove disconnected sockets ---
function cleanSocket(map, socketId) {
  for (const [id, sId] of map.entries()) {
    if (sId === socketId) map.delete(id);
  }
}

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // --- REGISTER VOLUNTEER ---
  socket.on("registerVolunteer", (volunteerId) => {
    if (!volunteerId) return console.warn("Missing volunteerId for registerVolunteer");

    // cleanup old sockets
    cleanSocket(global.onlineVolunteers, socket.id);
    global.onlineVolunteers.set(volunteerId, socket.id);

    // join that volunteer’s private room
    socket.join(`volunteer_${volunteerId}`);
    console.log(`Volunteer ${volunteerId} joined room volunteer_${volunteerId}`);
  });

  // --- REGISTER ORGANIZATION ---
  socket.on("registerOrganization", (orgId) => {
    if (!orgId) return console.warn("Missing orgId for registerOrganization");

    cleanSocket(global.onlineOrganizations, socket.id);
    global.onlineOrganizations.set(orgId, socket.id);

    socket.join(`organization_${orgId}`);
    console.log(`Organization ${orgId} joined room organization_${orgId}`);
  });

  // --- REGISTER ADMIN ---
  socket.on("registerAdmin", (adminId) => {
    if (!adminId) return console.warn("Missing adminId for registerAdmin");

    cleanSocket(global.onlineAdmins, socket.id);
    global.onlineAdmins.set(adminId, socket.id);

    socket.join(`admin_${adminId}`);
    console.log(`Admin ${adminId} joined room admin_${adminId}`);
  });

  // --- DISCONNECT ---
  socket.on("disconnect", () => {
    cleanSocket(global.onlineVolunteers, socket.id);
    cleanSocket(global.onlineOrganizations, socket.id);
    cleanSocket(global.onlineAdmins, socket.id);
    console.log("❌ Socket disconnected:", socket.id);
  });
});
//  START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
