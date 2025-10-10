import axios from "axios";

/* -------------------------------------------
   Axios Instance Configuration
-------------------------------------------- */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach Bearer token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* -------------------------------------------
   AUTHENTICATION
-------------------------------------------- */
// Volunteer Auth
export const signupVolunteer = (formData) =>
  API.post("/auth/volunteer/signup", formData);
export const loginVolunteer = (formData) =>
  API.post("/auth/volunteer/login", formData);

// Organization Auth
export const signupOrganization = (formData) =>
  API.post("/auth/organization/signup", formData);
export const loginOrganization = (formData) =>
  API.post("/auth/organization/login", formData);

/* -------------------------------------------
   PASSWORD RECOVERY (Forgot Password)
-------------------------------------------- */
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const verifyOtp = (data) => API.post("/auth/verify-otp", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);

/* -------------------------------------------
   OPPORTUNITIES
-------------------------------------------- */
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

  return API.post("/opportunities", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Get all public opportunities (for volunteers to browse)
export const getAllOpportunities = () => API.get("/opportunities/all");

// Get opportunities posted by a specific organization
export const getOpportunities = (orgId) =>
  API.get(`/opportunities/organization/${orgId}`);

// Delete a specific opportunity
export const deleteOpportunity = (id) => API.delete(`/opportunities/${id}`);

/* -------------------------------------------
   ORGANIZATION DASHBOARD DATA
-------------------------------------------- */
export const getOrgStats = (orgId) =>
  API.get(`/opportunities/organization/${orgId}/stats`);
export const getOrgNotifications = (orgId) =>
  API.get(`/opportunities/organization/${orgId}/notifications`);
export const getOrgActivity = (orgId) =>
  API.get(`/opportunities/organization/${orgId}/activity`);
export const getOpportunityById = (id) => API.get(`/opportunities/view/${id}`);
export const getOpportunityVolunteers = (id) =>
  API.get(`/opportunities/${id}/volunteers`);
export const confirmVolunteerCompletion = async (oppId, volunteerId) => {
  return axios.patch(
    `http://localhost:5000/api/opportunities/${oppId}/confirm/${volunteerId}`
  );
};
// Mark entire opportunity completed (organization)
export const markOpportunityCompleted = async (oppId) => {
  return axios.patch(
    `http://localhost:5000/api/opportunities/${oppId}/complete`
  );
};

/* -------------------------------------------
   VOLUNTEER DASHBOARD DATA
-------------------------------------------- */
export const getVolunteerOverview = () => API.get("/volunteer/me/overview");
export const getVolunteerTasks = () => API.get("/volunteer/me/tasks");
export const getVolunteerNotifications = () =>
  API.get("/volunteer/me/notifications");
export const getVolunteerProgress = () => API.get("/volunteer/me/progress");
export const getVolunteerBadges = () => API.get("/volunteer/me/badges?limit=6");
export const getTopVolunteers = () => API.get("/volunteer/top?limit=3");

// Volunteer sign-up for an opportunity
// Volunteer sign-up for an opportunity
export const signupForOpportunity = (id) =>
  API.post(`/opportunities/${id}/signup`);

/* -------------------------------------------
   EXPORT
-------------------------------------------- */
export default API;
