import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    orgName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
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

    document: {
      type: String,
      default: null,
    },
    documentPublicId: {
      type: String,
      default: null,
    },
    documentResourceType: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    
    suspensionReason: { type: String, default: null },
    suspensionDate: { type: Date, default: null },
    suspendedBy: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Organization", organizationSchema);
