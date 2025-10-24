// src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
});

export const registerUserSocket = (userId, role) => {
  if (!userId || !role) return;
  if (!socket.connected) socket.connect();

  socket.off("connect_error");

  if (role === "volunteer") socket.emit("registerVolunteer", userId);
  if (role === "organization") socket.emit("registerOrganization", userId);
  if (role === "admin") socket.emit("registerAdmin", userId);

  socket.on("connect", () => {
    console.log(" Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("Socket disconnected:", reason);
  });

  console.log(`📡 Registered ${role} socket: ${userId}`);
};
