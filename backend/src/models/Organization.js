import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    orgName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactPerson: { type: String },
    contactNumber: { type: String },
    city: { type: String },
    address: { type: String },
    orgType: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
