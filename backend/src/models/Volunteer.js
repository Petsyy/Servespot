import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthdate: { type: Date },
    gender: { type: String },
    contactNumber: { type: String },
    city: { type: String },
    address: { type: String },
    skills: [String],
    interests: [String],
    availability: { type: String },
    bio: { type: String },
    otpCode: String,
    otpExpire: Date,

    // Badge & Points System
    points: { type: Number, default: 0 }, // Total points earned by volunteer
    completedTasks: { type: Number, default: 0 }, // Total completed opportunities
    badges: [
      {
        name: { type: String },
        description: { type: String },
        icon: { type: String }, // could store emoji or image path
        earnedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Volunteer", volunteerSchema);
