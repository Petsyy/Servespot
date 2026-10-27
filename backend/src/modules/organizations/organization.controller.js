import { organizationRepository } from "./organization.repository.js";
import { OrganizationService } from "./organization.service.js";

const organizationService = new OrganizationService(organizationRepository);

export const getOrganizationById = async (req, res) => {
  const { id } = req.params;
  const result = await organizationService.getById(id);
  if (result.invalidId) {
    return res.status(400).json({ message: "Invalid organization ID" });
  }
  const org = result.organization;
  if (!org) return res.status(404).json({ message: "Organization not found" });
  res.json(org);
};

export const updateOrganization = async (req, res) => {
  try {
    const org = await organizationService.update(req.params.id, req.body);
    if (!org)
      return res.status(404).json({ message: "Organization not found" });

    res.json({ message: "Profile updated successfully", org });
  } catch (err) {
    console.error("updateOrganization error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};
