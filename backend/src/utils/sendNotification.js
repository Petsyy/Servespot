import Notification from "../models/Notification.js";
import Admin from "../models/Admin.js";
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

    // Send in-app via socket based on role
    const mapByModel = {
      Volunteer: global.onlineVolunteers,
      Organization: global.onlineOrganizations,
      Admin: global.onlineAdmins,
    };
    const socketMap = mapByModel[userModel];
    const socketId = socketMap?.get(userId.toString());
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

// Send a notification to ALL admins (creates per-admin records)
export const sendAdminNotification = async ({ title, message, type = "update" }) => {
  try {
    const admins = await Admin.find({}, "_id email").lean();
    const created = [];
    for (const admin of admins) {
      const notif = await Notification.create({
        user: admin._id,
        userModel: "Admin",
        title,
        message,
        type,
      });
      created.push(notif);
      const socketId = global.onlineAdmins?.get(admin._id.toString());
      if (socketId) io.to(socketId).emit("newNotification", notif);
      // Optional: email admins as well (commented to avoid noise)
      // await sendEmail({ to: admin.email, subject: title, html: `<p>${message}</p>` });
    }
    return created;
  } catch (err) {
    console.error("❌ Admin notification error:", err);
    return [];
  }
};
