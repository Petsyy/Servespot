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
  },
  { timestamps: true }
);

export default mongoose.model("Volunteer", volunteerSchema);
