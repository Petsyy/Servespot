import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, default: "", trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    birthdate: { type: Date },
    gender: { type: String },
    contactNumber: { type: String },
    region: { type: String },
    regionCode: { type: String },
    province: { type: String },
    provinceCode: { type: String },
    city: { type: String },
    cityCode: { type: String },
    barangay: { type: String },
    barangayCode: { type: String },
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

volunteerSchema.pre("save", function (next) {
  if (this.firstName || this.lastName) {
    this.fullName = [this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
  } else if (this.fullName) {
    const parts = this.fullName.trim().split(/\s+/);
    this.firstName = parts[0] || "";
    this.lastName = parts.slice(1).join(" ") || "";
  }
  next();
});

export default mongoose.model("Volunteer", volunteerSchema);
