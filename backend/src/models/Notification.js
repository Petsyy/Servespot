import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel", // can be Volunteer or Organization
      required: true,
    },
    userModel: {
      type: String,
      required: true,
      enum: ["Volunteer", "Organization", "Admin"],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["reminder", "update", "completion"], default: "update" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
