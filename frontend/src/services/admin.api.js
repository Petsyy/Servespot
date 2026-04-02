import API from "@/services/api";
import ENDPOINTS from "@/services/endpoints";

export const loginAdmin = (formData) => API.post(ENDPOINTS.admin.login, formData);

export const getAdminDashboard = () => API.get(ENDPOINTS.admin.dashboard);

export const getAdminProfile = async (adminId) => {
  return API.get(ENDPOINTS.admin.profile(adminId));
};

export const getAllOrganizations = () => API.get(ENDPOINTS.admin.organizations);

export const updateOrganizationStatus = (id, status, data = {}) =>
  API.put(ENDPOINTS.admin.organizationStatus(id), { status, ...data });

export const getAllVolunteers = () => API.get(ENDPOINTS.admin.volunteers);

export const updateVolunteerStatus = (id, status, data = {}) =>
  API.put(ENDPOINTS.admin.volunteerStatus(id), { status, ...data });

export const getAdminNotifications = async (adminId) => {
  try {
    const response = await API.get(ENDPOINTS.admin.notifications(adminId));
    return response;
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    throw error;
  }
};

export const markAdminNotificationsRead = (adminId) => {
  return API.put(ENDPOINTS.admin.markNotificationsRead(adminId), {});
};
