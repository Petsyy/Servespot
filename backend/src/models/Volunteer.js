import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthdate: { type: Date },
    gender: { type: String },
    contactNumber: { type: String },
    region: { type: String },
    province: { type: String },
    city: { type: String },
    barangay: { type: String },
    address: { type: String },
    skills: [String],
    interests: [String],
    availability: [String],
    bio: { type: String },
    otpCode: String,
    otpExpire: Date,

    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "active",
    },

    // Badge & Points System
    points: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    badges: [
      {
        name: { type: String },
        description: { type: String },
        icon: { type: String },
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    suspensionReason: { type: String, default: null },
    suspensionDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Volunteer", volunteerSchema);
