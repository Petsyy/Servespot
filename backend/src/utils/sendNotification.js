import Notification from "../models/notification.model.js";
import { io } from "../../server.js";
import { sendEmail } from "./sendEmail.js";

/**
 * Create a notification, emit via socket, and optionally send email
 *
 * @param {Object} p
 * @param {string|ObjectId} p.userId     
 * @param {"Volunteer"|"Organization"|"Admin"} p.userModel
 * @param {string} p.title
 * @param {string} p.message
 * @param {"status"|"reminder"|"update"|"completion"|"system"} [p.type="update"]
 * @param {"inApp"|"email"|"both"} [p.channel="both"]
 * @param {string} [p.email]                     - recipient email (required if channel includes email)
 * @param {string} [p.link]                      
 */
export const sendNotification = async ({
  userId,
  userModel,
  title,
  message,
  type = "update",
  channel = "both",
  email,
  link,
}) => {
  try {
    const baseData = {
      user: userId,
      userModel,
      title,
      message,
      type,
      channel,
      link,
    };

    let notif = null;
    if (channel === "inApp" || channel === "both") {
      notif = await Notification.create(baseData);

      // Emit via socket
      const idStr = String(userId);
      let socketMap;
      if (userModel === "Volunteer") {
        socketMap = global.onlineVolunteers;
      } else if (userModel === "Organization") {
        socketMap = global.onlineOrganizations;
      } else if (userModel === "Admin") {
        socketMap = global.onlineAdmins;
      }

      const socketId = socketMap?.get(idStr);
      if (socketId) io.to(socketId).emit("newNotification", notif);
    }

    // Send email and also store a DB copy for the Email tab
    if ((channel === "email" || channel === "both") && email) {
      const linkHtml = link
        ? `<p><a href="${process.env.CLIENT_URL || ""}${link}">Open in ServeSpot</a></p>`
        : "";

      // Actual email send
      await sendEmail({
        to: email,
        subject: title,
        html: `
          <h3>${title}</h3>
          <p>${message}</p>
          ${linkHtml}
          <br/>
          <p style="color:#64748b;">This is an automated message from ServeSpot.</p>
        `,
      });

      // Separate “email” type record for the Email tab
      await Notification.create({
        user: userId,
        userModel,
        title: `${title}`,
        message,
        type: "email",
        channel: "email",
        link,
        isRead: true,
      });
    }

    return notif;
  } catch (err) {
    console.error("Notification error:", err);
    return null;
  }
};
