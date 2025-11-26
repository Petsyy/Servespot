import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    orgName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactPerson: { type: String },
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
    orgType: { type: String },
    description: { type: String },
    otpCode: String,
    otpExpire: Date,

    //r Newly added fields for verification
    document: {
      type: String, // File path or URL of the uploaded verification document
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending", // Automatically set to pending until admin approval
    },

    suspensionReason: { type: String, default: null },
    suspensionDate: { type: Date, default: null },
    suspendedBy: { type: String, default: null }, // admin email/name
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
