import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/services/queryClient";
import App from "./App";
import { AuthProvider } from "@/shared/context/AuthContext";
import { socket, registerUserSocket } from "@/shared/utils/socket";
import { getCookie } from "@/shared/utils/cookies";
import { SOCKET_ENABLED } from "@/shared/utils/runtime";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

let isSocketBound = false;

function GlobalSocketHandler() {
  useEffect(() => {
    if (!SOCKET_ENABLED) {
      return;
    }

    const role = getCookie("role");
    const volunteerId = getCookie("volunteerId");
    const orgId = getCookie("orgId");

    // Always ensure socket is connected
    if (!socket.connected) socket.connect();

    // Register role-specific socket
    if (role === "volunteer" && volunteerId) {
      registerUserSocket(volunteerId, "volunteer");
    } else if (role === "organization" && orgId) {
      registerUserSocket(orgId, "organization");
    }

    // Only bind global listeners once
    if (!isSocketBound) {
      isSocketBound = true;

      socket.on("connect", () => {
        console.log("Global socket connected:", socket.id);
      });

      socket.on("disconnect", (reason) => {
        console.warn("Global socket disconnected:", reason);
      });

      socket.on("newNotification", (notif) => {
        console.log("Global notification received:", notif);
        toast.info(`${notif.title}: ${notif.message}`, {
          position: "top-right",
          autoClose: 4000,
        });
      });
    }
  }, []);

  return (
    <>
      <App />
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <GlobalSocketHandler />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
