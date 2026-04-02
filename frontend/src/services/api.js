import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "@/utils/runtime";
import ENDPOINTS from "@/services/endpoints";

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const clearStoredSession = () => {
  localStorage.removeItem("activeRole");
  localStorage.removeItem("adminId");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("orgId");
  localStorage.removeItem("orgUser");
  localStorage.removeItem("orgName");
  localStorage.removeItem("organizationId");
  localStorage.removeItem("volunteerId");
  localStorage.removeItem("volUser");
  localStorage.removeItem("volunteerName");
};

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";

    // Suspended account (from backend protect middleware)
    if (status === 403 && message.toLowerCase().includes("suspended")) {
      const reason = error.response?.data?.reason || "No reason provided";

      clearStoredSession();

      setTimeout(() => {
        window.location.href = "/suspended";
      }, 2000);
    }

    if (status === 401) {
      clearStoredSession();

      toast.warning("Session expired. Please log in again.");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export const signupVolunteer = (formData) =>
  API.post(ENDPOINTS.auth.volunteerSignup, formData);
export const loginVolunteer = (formData) =>
  API.post(ENDPOINTS.auth.volunteerLogin, formData);

export const signupOrganization = (formData) =>
  API.post(ENDPOINTS.auth.organizationSignup, formData);
export const loginOrganization = (formData) =>
  API.post(ENDPOINTS.auth.organizationLogin, formData);

export const sendOtp = (data) => API.post(ENDPOINTS.auth.sendOtp, data);
export const verifyOtp = (data) => API.post(ENDPOINTS.auth.verifyOtp, data);
export const resetPassword = (data) =>
  API.post(ENDPOINTS.auth.resetPassword, data);
export const logoutSession = () => API.post("/auth/logout");
export const getSession = () => API.get("/auth/session");

export const confirmVolunteerCompletion = async (oppId, volunteerId) => {
  return API.patch(
    ENDPOINTS.opportunities.confirmVolunteer(oppId, volunteerId),
  );
};

export const getOpportunityById = (id) =>
  API.get(ENDPOINTS.opportunities.byId(id));
export const submitOpportunityProof = (id, formData) =>
  API.post(ENDPOINTS.opportunities.proof(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const reviewOpportunityProof = (opportunityId, volunteerId, action) =>
  API.patch(ENDPOINTS.opportunities.reviewProof(opportunityId, volunteerId), {
    action,
  });

export default API;
