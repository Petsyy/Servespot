// src/main.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import App from "./App";
import { socket, registerUserSocket } from "@/utils/socket";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

let isSocketBound = false;

function GlobalSocketHandler() {
  const location = useLocation();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const volunteerId = localStorage.getItem("volunteerId");
    const organizationId = localStorage.getItem("organizationId");

    // 🔌 Always ensure socket is connected
    if (!socket.connected) socket.connect();

    // 🧠 Register role-specific socket
    if (role === "volunteer" && volunteerId) {
      registerUserSocket(volunteerId, "volunteer");
    } else if (role === "organization" && organizationId) {
      registerUserSocket(organizationId, "organization");
    }

    // 🔔 Only bind global listeners once
    if (!isSocketBound) {
      isSocketBound = true;

      socket.on("connect", () => {
        console.log("✅ Global socket connected:", socket.id);
      });

      socket.on("disconnect", (reason) => {
        console.warn("⚠️ Global socket disconnected:", reason);
      });

      socket.on("newNotification", (notif) => {
        console.log("📩 Global notification received:", notif);
        toast.info(`🔔 ${notif.title}: ${notif.message}`, {
          position: "top-right",
          autoClose: 4000,
        });
      });
    }

    // 🔄 Auto refresh page on route change
    if (!window._lastPath) {
      window._lastPath = location.pathname;
    } else if (window._lastPath !== location.pathname) {
      console.log("🔁 Route changed → forcing reload:", location.pathname);
      window._lastPath = location.pathname;
      window.location.reload(); // full page reload
    }
  }, [location.pathname]);

  return (
    <>
      <App />
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GlobalSocketHandler />
  </BrowserRouter>
);
