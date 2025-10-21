import API from "@/services/api";

// -------------------------------
// Admin Authentication
// -------------------------------
export const loginAdmin = (formData) => API.post("/admin/login", formData);

// -------------------------------
//  Admin Dashboard
// -------------------------------
export const getAdminDashboard = () =>
  API.get("/admin/dashboard", {
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
  });

// Get all organizations
export const getAllOrganizations = () =>
  API.get("/admin/organizations", {
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
  });

// Update organization status
export const updateOrganizationStatus = (id, status, data = {}) =>
  API.put(
    `/admin/organizations/${id}/status`,
    { status, ...data },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }
  );

// Get all volunteers
export const getAllVolunteers = () =>
  API.get("/admin/volunteers", {
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
  });

// ✅ Update volunteer status (supports reason)
export const updateVolunteerStatus = (id, status, data = {}) =>
  API.put(
    `/admin/volunteers/${id}/status`,
    { status, ...data },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }
  );
