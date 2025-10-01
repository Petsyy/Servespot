import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const signupVolunteer = (formData) =>
  API.post("/auth/volunteer/signup", formData);
export const signupOrganization = (formData) =>
  API.post("/auth/organization/signup", formData);

export const loginVolunteer = (formData) =>
  API.post("/auth/volunteer/login", formData);

export const loginOrganization = (formData) =>
  API.post("/auth/organization/login", formData);

// Add token automatically to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
