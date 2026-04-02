const ENDPOINTS = {
  auth: {
    volunteerSignup: "/auth/volunteer/signup",
    volunteerLogin: "/auth/volunteer/login",
    organizationSignup: "/auth/organization/signup",
    organizationLogin: "/auth/organization/login",
    sendOtp: "/auth/send-otp",
    verifyOtp: "/auth/verify-otp",
    resetPassword: "/auth/reset-password",
  },
  admin: {
    login: "/admin/login",
    dashboard: "/admin/dashboard",
    organizations: "/admin/organizations",
    volunteers: "/admin/volunteers",
    profile: (adminId) => `/admin/profile/${adminId}`,
    notifications: (adminId) => `/admin/${adminId}/notifications`,
    markNotificationsRead: (adminId) => `/admin/${adminId}/notifications/read`,
    organizationStatus: (id) => `/admin/organizations/${id}/status`,
    volunteerStatus: (id) => `/admin/volunteers/${id}/status`,
  },
  volunteer: {
    me: "/volunteer/me",
    tasks: "/volunteer/me/tasks",
    progress: "/volunteer/me/progress",
    badges: "/volunteer/me/badges",
    top: "/volunteer/top",
  },
  organization: {
    byId: (id) => `/organization/${id}`,
    volunteerStatus: (oppId, volunteerId) =>
      `/organization/volunteers/${oppId}/${volunteerId}/status`,
  },
  opportunities: {
    root: "/opportunities",
    byId: (id) => `/opportunities/${id}`,
    byOrganization: (orgId) => `/opportunities/organizations/${orgId}`,
    organizationStats: (orgId) => `/opportunities/organizations/${orgId}/stats`,
    organizationActivity: (orgId) =>
      `/opportunities/organizations/${orgId}/activity`,
    organizationNotifications: (orgId) =>
      `/opportunities/organizations/${orgId}/notifications`,
    volunteers: (id) => `/opportunities/${id}/volunteers`,
    signup: (id) => `/opportunities/${id}/signup`,
    confirmVolunteer: (oppId, volunteerId) =>
      `/opportunities/${oppId}/confirm/${volunteerId}`,
    complete: (id) => `/opportunities/${id}/complete`,
    proof: (id) => `/opportunities/${id}/proof`,
    reviewProof: (opportunityId, volunteerId) =>
      `/opportunities/${opportunityId}/proof/${volunteerId}/review`,
  },
  notifications: {
    volunteer: "/notifications/volunteer",
    volunteerReadAll: "/notifications/volunteer/read-all",
    organization: (orgId) => `/notifications/organization/${orgId}`,
    organizationReadAll: (orgId) =>
      `/notifications/organization/${orgId}/read-all`,
  },
};

export default ENDPOINTS;
