import API from "@/services/api";
import ENDPOINTS from "@/services/endpoints";

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

  return API.post(ENDPOINTS.opportunities.root, formData);
};

export const markOpportunityCompleted = async (oppId) => {
  return API.patch(ENDPOINTS.opportunities.complete(oppId));
};

export const updateOpportunity = (id, formData) =>
  API.put(ENDPOINTS.opportunities.byId(id), formData);

// Organiation Dashboard
export const getOrgStats = (orgId) =>
  API.get(ENDPOINTS.opportunities.organizationStats(orgId));

export const getOrgActivity = (orgId) =>
  API.get(ENDPOINTS.opportunities.organizationActivity(orgId));

export const getOpportunityVolunteers = (id) =>
  API.get(ENDPOINTS.opportunities.volunteers(id));

export const getOpportunities = (orgId) =>
  API.get(ENDPOINTS.opportunities.byOrganization(orgId));


export const deleteOpportunity = (id) =>
  API.delete(ENDPOINTS.opportunities.byId(id));

export const getOrganizationProfile = (orgId) =>
  API.get(ENDPOINTS.organization.byId(orgId));

export const updateVolunteerStatus = (oppId, volunteerId, status) =>
  API.put(ENDPOINTS.organization.volunteerStatus(oppId, volunteerId), {
    status,
  });

export const getOrganizationById = (id) =>
  API.get(ENDPOINTS.organization.byId(id));
export const updateOrganization = (id, data) =>
  API.put(ENDPOINTS.organization.byId(id), data, {
    headers: { "Content-Type": "application/json" },
  });

export const markOrgNotificationsRead = (orgId) =>
  API.put(ENDPOINTS.notifications.organizationReadAll(orgId));

export const getOrgNotifications = (orgId) =>
  API.get(ENDPOINTS.notifications.organization(orgId));
