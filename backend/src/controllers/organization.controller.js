import mongoose from "mongoose"
import Organization from "../models/organization.model.js";

//  GET organization profile by ID
export const getOrganizationById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid organization ID" });
  }
  const org = await Organization.findById(id);
  if (!org) return res.status(404).json({ message: "Organization not found" });
  res.json(org);
};

// UPDATE organization profile
export const updateOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!org)
      return res.status(404).json({ message: "Organization not found" });

    res.json({ message: "Profile updated successfully", org });
  } catch (err) {
    console.error("updateOrganization error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};
