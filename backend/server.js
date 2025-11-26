import "./loadEnv.js";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { sendEmail } from "./src/utils/sendEmail.js";
import { sendNotification } from "./src/utils/sendNotification.js";


// ⚡ SOCKET.IO SERVER
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


// SOCKET HELPERS

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


//  START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
