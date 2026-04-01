function getSocketServer() {
  return global.__io || null;
}

export function ensureSocketMaps() {
  global.onlineVolunteers = global.onlineVolunteers || new Map();
  global.onlineOrganizations = global.onlineOrganizations || new Map();
  global.onlineAdmins = global.onlineAdmins || new Map();
}

export function setSocketServer(io) {
  global.__io = io;
  ensureSocketMaps();
}

function getSocketIdForUser(userModel, userId) {
  const id = String(userId);
  if (userModel === "Volunteer") {
    return global.onlineVolunteers?.get(id);
  }
  if (userModel === "Organization") {
    return global.onlineOrganizations?.get(id);
  }
  if (userModel === "Admin") {
    return global.onlineAdmins?.get(id);
  }
  return undefined;
}

export function emitToVolunteer(volunteerId, event, payload) {
  const io = getSocketServer();
  const socketId = global.onlineVolunteers?.get(String(volunteerId));
  if (io && socketId) {
    io.to(socketId).emit(event, payload);
  }
}

export function emitToOrganization(orgId, event, payload) {
  const io = getSocketServer();
  const socketId = global.onlineOrganizations?.get(String(orgId));
  if (io && socketId) {
    io.to(socketId).emit(event, payload);
  }
}

export function broadcastToAdmins(event, payload) {
  const io = getSocketServer();
  if (!io || !global.onlineAdmins) return;
  for (const socketId of global.onlineAdmins.values()) {
    io.to(socketId).emit(event, payload);
  }
}

export function emitToUser(userModel, userId, event, payload) {
  const io = getSocketServer();
  const socketId = getSocketIdForUser(userModel, userId);
  if (io && socketId) {
    io.to(socketId).emit(event, payload);
  }
}

export function emitToVolunteerRoom(volunteerId, event, payload) {
  const io = getSocketServer();
  if (io) {
    io.to(`volunteer_${volunteerId}`).emit(event, payload);
  }
}
