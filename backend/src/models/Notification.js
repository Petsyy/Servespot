// src/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel",
      required: true,
    },
    userModel: {
      type: String,
      required: true,
      enum: ["Volunteer", "Organization", "Admin"],
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: [
        "status",
        "reminder",
        "update",
        "completion",
        "system",
        "email",
        "user_registration",
        "organization_verification",
        "report",
        // Organization Events
        "organization_signup",
        "organization_suspension", 
        "organization_reactivation",
        "organization_deleted",
        "opportunity_posted",
        // Volunteer Events
        "volunteer_signup",
        "volunteer_suspension",
        "volunteer_reactivation", 
        "volunteer_completion",
        // Legacy/alternative names
        "org_signup",
        "org_verification",
        "org_suspension",
        "org_reactivation", 
        "org_deleted",
        "new_opportunity",
        "opportunity_created",
        "vol_signup",
        "vol_suspension",
        "vol_reactivation",
        "vol_completion"
      ],
      default: "update",
    },

    channel: {
      type: String,
      enum: ["inApp", "email", "both"],
      default: "both",
    },

    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
