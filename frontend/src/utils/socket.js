import { io } from "socket.io-client";
import { SOCKET_ENABLED, SOCKET_URL } from "@/utils/runtime";

const noopSocket = {
  connected: false,
  id: null,
  connect() {
    return this;
  },
  disconnect() {
    return this;
  },
  on() {
    return this;
  },
  off() {
    return this;
  },
  emit() {
    return this;
  },
};

export const socket = SOCKET_ENABLED
  ? io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
    })
  : noopSocket;

export const registerUserSocket = (userId, role) => {
  if (!SOCKET_ENABLED || !userId || !role) return;
  if (!socket.connected) socket.connect();

  socket.off("connect_error");

  if (role === "volunteer") socket.emit("registerVolunteer", userId);
  if (role === "organization") socket.emit("registerOrganization", userId);
  if (role === "admin") socket.emit("registerAdmin", userId);

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("Socket disconnected:", reason);
  });

  console.log(`Registered ${role} socket: ${userId}`);
};
