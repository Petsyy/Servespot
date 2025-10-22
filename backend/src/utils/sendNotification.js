import Notification from "../models/Notification.js";
import { io } from "../../server.js";
import { sendEmail } from "./sendEmail.js"; // ✅ correct file

export const sendNotification = async ({
  userId,
  userModel,
  email,
  title,
  message,
  type,
}) => {
  try {
    const notif = await Notification.create({
      user: userId,
      userModel,
      title,
      message,
      type,
    });

    // Send in-app via socket
    const socketId = global.onlineVolunteers?.get(userId.toString());
    if (socketId) io.to(socketId).emit("newNotification", notif);
    // Send email
    if (email) {
      await sendEmail({
        to: email,
        subject: title,
        html: `<p>${message}</p><br/><p>From: ServeSpot</p>`,
      });
    }

    return notif;
  } catch (err) {
    console.error("❌ Notification error:", err);
  }
};
