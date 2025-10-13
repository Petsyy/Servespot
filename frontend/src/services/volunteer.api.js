/* -------------------------------------------
   VOLUNTEER PROFILE
-------------------------------------------- */
import API from "@/services/api";

// Get volunteer profile
export const getVolunteerProfile = () => API.get("/volunteer/me");

// Update volunteer profile
export const updateVolunteerProfile = (data) =>
  API.put("/volunteer/me", data, {
    headers: { "Content-Type": "application/json" },
  });

// Get all public opportunities (for volunteers to browse)
export const getAllOpportunities = () => API.get("/opportunities/all");

// Volunteer sign-up for an opportunity
export const signupForOpportunity = (id) =>
  API.post(`/opportunities/${id}/signup`);

/* -------------------------------------------
   VOLUNTEER DASHBOARD DATA
-------------------------------------------- */
// Badges & Points
export const getVolunteerOverview = () => API.get("/volunteer/me");

export const getVolunteerTasks = () => API.get("/volunteer/me/tasks");
export const getVolunteerNotifications = () =>
  API.get("/volunteer/me/notifications");
export const getVolunteerProgress = () => API.get("/volunteer/me/progress");
export const getVolunteerBadges = () => API.get("/volunteer/me/badges?limit=6");
export const getTopVolunteers = () => API.get("/volunteer/top?limit=3");
