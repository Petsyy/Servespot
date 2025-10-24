import API from "@/services/api";
import axios from "axios";

// Create new opportunity (Organization only)
export const createOpportunity = (data) => {
  const formData =
    data instanceof FormData
      ? data
      : (() => {
          const fd = new FormData();
          fd.append("title", data.title);
          fd.append("description", data.description);
          fd.append("date", data.date);
          fd.append("duration", data.duration);
          fd.append("location", data.location);
          fd.append("volunteersNeeded", data.volunteersNeeded);
          fd.append("organization", localStorage.getItem("orgId") || "");
          (data.skills || []).forEach((skill) => fd.append("skills[]", skill));
          if (data.file) fd.append("file", data.file);
          return fd;
        })();

  return API.post("/opportunities", formData,);
};

// Mark entire opportunity completed (organization)
export const markOpportunityCompleted = async (oppId) => {
  return axios.patch(
    `http://localhost:5000/api/opportunities/${oppId}/complete`
  );
};

// Update opportunity
export const updateOpportunity = (id, formData) =>
  API.put(`/opportunities/${id}`, formData);

// Organiation Dashboard
export const getOrgStats = (orgId) =>
  API.get(`/opportunities/organization/${orgId}/stats`);


export const getOrgActivity = (orgId) =>
  API.get(`/opportunities/organization/${orgId}/activity`);

export const getOpportunityVolunteers = (id) =>
  API.get(`/opportunities/${id}/volunteers`);

// Get opportunities posted by a specific organization
export const getOpportunities = (orgId) =>
  API.get(`/opportunities/organization/${orgId}`);

// Delete a specific opportunity
export const deleteOpportunity = (id) => API.delete(`/opportunities/${id}`);

export const getOrganizationProfile = (orgId) =>
  API.get(`/organization/${orgId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("orgToken")}` },
  });

  // Update volunteer status (approve / reject / complete)
export const updateVolunteerStatus = (oppId, volunteerId, status) =>
  API.put(`/organization/volunteers/${oppId}/${volunteerId}/status`, { status });

// ORGANIZATION PROFILE
export const getOrganizationById = (id) => API.get(`/organization/${id}`);
export const updateOrganization = (id, data) =>
  API.put(`/organization/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });

// ✅ Mark all organization notifications as read
export const markOrgNotificationsRead = (orgId) =>
  API.put(`/notifications/organization/${orgId}/read-all`);

// Email Notifcation Tab
export const getOrgNotifications = (orgId) =>
  API.get(`/notifications/organization/${orgId}`);

