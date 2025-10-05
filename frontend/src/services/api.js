import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// --- Auth ---
export const signupVolunteer = (formData) =>
  API.post("/auth/volunteer/signup", formData);

export const signupOrganization = (formData) =>
  API.post("/auth/organization/signup", formData);

export const loginVolunteer = (formData) =>
  API.post("/auth/volunteer/login", formData);

export const loginOrganization = (formData) =>
  API.post("/auth/organization/login", formData);

// --- Opportunities ---
export const createOpportunity = (data) => {
  let fd;
  // Detect if already FormData (like from PostOpportunity)
  if (data instanceof FormData) {
    fd = data;
  } else {
    // Otherwise build from plain object
    fd = new FormData();
    fd.append("title", data.title);
    fd.append("description", data.description);
    fd.append("date", data.date);
    fd.append("duration", data.duration);
    fd.append("location", data.location);
    fd.append("volunteersNeeded", data.volunteersNeeded);
    fd.append("organization", localStorage.getItem("orgId") || "");
    (data.skills || []).forEach((s) => fd.append("skills[]", s));
    if (data.file) fd.append("file", data.file);
  }

  return API.post("/opportunities", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// --- Organization Data ---
export const getOpportunities = (orgId) => API.get(`/opportunities/${orgId}`); // should be plural (matches your backend)
export const getOrgStats = (orgId) => API.get(`/opportunities/${orgId}/stats`);
export const getOrgNotifications = (orgId) =>
  API.get(`/opportunities/${orgId}/notifications`);
export const getOrgActivity = (orgId) =>
  API.get(`/opportunities/${orgId}/activity`);
export const deleteOpportunity = (id) =>
  API.delete(`/opportunities/opportunities/${id}`); // matches backend route

// --- Volunteer Data ---
export const getVolunteerOverview = () => API.get("/volunteer/me/overview");
export const getVolunteerTasks = () => API.get("/volunteer/me/tasks?limit=5");
export const getVolunteerNotifications = () =>
  API.get("/volunteer/me/notifications");
export const getVolunteerProgress = () => API.get("/volunteer/me/progress");
export const getVolunteerBadges = () => API.get("/volunteer/me/badges?limit=6");
export const getTopVolunteers = () => API.get("/volunteer/top?limit=3");
export const getAllOpportunities = () => API.get("/opportunities/all");

// --- Token Middleware ---
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
