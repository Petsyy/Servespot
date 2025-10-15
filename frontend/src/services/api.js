import axios from "axios";

// Axio Configuration
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach Bearer token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTHENTICATION

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

// Forgot Password
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const verifyOtp = (data) => API.post("/auth/verify-otp", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);

// Organization Confirmation
export const confirmVolunteerCompletion = async (oppId, volunteerId) => {
  return axios.patch(
    `http://localhost:5000/api/opportunities/${oppId}/confirm/${volunteerId}`
  );
};


// Shared by organization and volunteer
export const getOpportunityById = (id) => API.get(`/opportunities/view/${id}`);

/* -------------------------------------------
   ORGANIZATION → MANAGE VOLUNTEERS
-------------------------------------------- */

// Get all volunteers under this organization’s opportunities
export const getOrgVolunteers = () =>
  API.get("/org/volunteers", {
    headers: { Authorization: `Bearer ${localStorage.getItem("orgToken")}` },
  });
  

// Update volunteer status (Approve / Reject / Completed)
export const updateVolunteerStatus = (id, opportunityId, status) =>
  API.put(
    `/org/volunteers/${id}/status`,
    { opportunityId, status },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("orgToken")}` },
    }
  );

export default API;
