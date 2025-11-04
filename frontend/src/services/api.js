import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach Bearer token if present
API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const orgToken = localStorage.getItem("orgToken");
  const userToken = localStorage.getItem("token");

  // Prioritize whichever user is active
  const token = adminToken || orgToken || userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Global response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";

    // Suspended account (from backend protect middleware)
    if (status === 403 && message.toLowerCase().includes("suspended")) {
      const reason = error.response?.data?.reason || "No reason provided";

      // Clear all stored sessions
      localStorage.removeItem("token");
      localStorage.removeItem("orgToken");
      localStorage.removeItem("adminToken");

      // Redirect to suspended page after short delay
      setTimeout(() => {
        window.location.href = "/suspended";
      }, 2000);
    }

    // Token invalid or expired
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("orgToken");
      localStorage.removeItem("adminToken");

      toast.warning("Session expired. Please log in again.");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

//
// -----------------------------
// Volunteer Auth
// -----------------------------
export const signupVolunteer = (formData) =>
  API.post("/auth/volunteer/signup", formData);
export const loginVolunteer = (formData) =>
  API.post("/auth/volunteer/login", formData);

//
// -----------------------------
// Organization Auth
// -----------------------------
export const signupOrganization = (formData) =>
  API.post("/auth/organization/signup", formData);
export const loginOrganization = (formData) =>
  API.post("/auth/organization/login", formData);

//
// -----------------------------
// Forgot Password
// -----------------------------
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const verifyOtp = (data) => API.post("/auth/verify-otp", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);

//
// -----------------------------
// Organization Confirmation
// -----------------------------
export const confirmVolunteerCompletion = async (oppId, volunteerId) => {
  return axios.patch(
    `http://localhost:5000/api/opportunities/${oppId}/confirm/${volunteerId}`
  );
};

//
// -----------------------------
// Shared (Organization + Volunteer)
// -----------------------------
export const getOpportunityById = (id) => API.get(`/opportunities/view/${id}`);



export default API;
