import { createContext, useContext, useEffect } from "react";
import { socket, registerUserSocket } from "@/shared/utils/socket";
import { getCookie } from "@/shared/utils/cookies";
import { toast } from "react-toastify";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    const role = getCookie("role");
    const volunteerId = getCookie("volunteerId");
    const orgId = getCookie("orgId");

    // Register correct role
    if (role === "volunteer" && volunteerId) {
      registerUserSocket(volunteerId, "volunteer");
    } else if (role === "organization" && orgId) {
      registerUserSocket(orgId, "organization");
    }

    // Avoid duplicate listeners
    socket.off("newNotification").on("newNotification", (notif) => {
      console.log(" New notification (global):", notif);
      toast.info(` ${notif.title}: ${notif.message}`, {
        position: "top-right",
        autoClose: 4000,
      });
    });

    return () => socket.off("newNotification");
  }, []);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
