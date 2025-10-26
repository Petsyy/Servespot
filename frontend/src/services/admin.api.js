import API from "@/services/api";

// -------------------------------
// Admin Authentication
// -------------------------------
export const loginAdmin = (formData) => API.post("/admin/login", formData);

// -------------------------------
//  Admin Dashboard
// -------------------------------
// Fetch Admin Dashboard statistics
export const getAdminDashboard = () =>
  API.get("/admin/dashboard", {
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
  });

  // Fetch the name of the admin in navbar
export const getAdminProfile = async (adminId) => {
  return API.get(`/admin/profile/${adminId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
  });
};

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

export const getAdminNotifications = async (adminId) => {
  try {
    const response = await API.get(`/admin/${adminId}/notifications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    throw error;
  }
};

export const markAdminNotificationsRead = (adminId) => {
  return API.put(
    `/admin/${adminId}/notifications/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }
  );
};
