import { createContext, useContext, useEffect } from "react";
import { socket, registerUserSocket } from "@/utils/socket";
import { toast } from "react-toastify";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    const role = localStorage.getItem("role");
    const volunteerId = localStorage.getItem("volunteerId");
    const organizationId = localStorage.getItem("organizationId");

    // Register correct role
    if (role === "volunteer" && volunteerId) {
      registerUserSocket(volunteerId, "volunteer");
    } else if (role === "organization" && organizationId) {
      registerUserSocket(organizationId, "organization");
    }

    // Avoid duplicate listeners
    socket.off("newNotification").on("newNotification", (notif) => {
      console.log("📢 New notification (global):", notif);
      toast.info(`🔔 ${notif.title}: ${notif.message}`, {
        position: "top-right",
        autoClose: 4000,
      });
    });

    return () => socket.off("newNotification");
  }, []);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
