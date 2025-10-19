import API from "@/services/api";

// Admin Auth
export const loginAdmin = (formData) =>
  API.post("/admin/login", formData); // Admin login API

// Admin Routes
export const getAdminDashboard = () =>
  API.get("/admin/dashboard", {
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
  });
