import API from "@/services/api";
import ENDPOINTS from "@/services/endpoints";

export const getVolunteerProfile = () => API.get(ENDPOINTS.volunteer.me);

export const updateVolunteerProfile = (data) =>
  API.put(ENDPOINTS.volunteer.me, data, {
    headers: { "Content-Type": "application/json" },
  });

export const getAllOpportunities = () => API.get(ENDPOINTS.opportunities.root);

export const signupForOpportunity = (id) =>
  API.post(ENDPOINTS.opportunities.signup(id));

export const getVolunteerOverview = () => API.get(ENDPOINTS.volunteer.me);

export const getVolunteerTasks = () => API.get(ENDPOINTS.volunteer.tasks);

export const getVolunteerProgress = () => API.get(ENDPOINTS.volunteer.progress);

export const getVolunteerBadges = () => API.get(ENDPOINTS.volunteer.badges, {
  params: { limit: 6 },
});

export const getTopVolunteers = () => API.get(ENDPOINTS.volunteer.top, {
  params: { limit: 3 },
});

export const getVolunteerNotifications = () =>
  API.get(ENDPOINTS.notifications.volunteer);
  
export const markVolunteerNotificationsRead = () =>
  API.put(ENDPOINTS.notifications.volunteerReadAll);
