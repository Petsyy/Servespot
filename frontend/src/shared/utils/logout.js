import { logoutSession } from "@/shared/services/api";
import { clearClientSessionCookies, getCookie, removeCookie } from "@/shared/utils/cookies";

export function logout(role) {
  const currentRole = (role || "").toLowerCase();

  // Clear client cookies
  if (!currentRole) {
    clearClientSessionCookies();
  } else {
    removeCookie("role");
    if (currentRole === "volunteer") {
      removeCookie("volunteerId");
      removeCookie("volunteerName");
    } else if (currentRole === "organization") {
      removeCookie("orgId");
      removeCookie("orgName");
    } else if (currentRole === "admin") {
      removeCookie("adminId");
    }
  }

  // Clear role-specific storage
  if (currentRole === "volunteer") {
    const volunteerId = getCookie("volunteerId") || localStorage.getItem("volunteerId");
    if (volunteerId) {
      localStorage.removeItem(`joinedTasks_${volunteerId}`);
    }

    localStorage.removeItem("volunteerId");
    localStorage.removeItem("volunteerName");
    localStorage.removeItem("volUser");
    localStorage.removeItem("earnedBadges");
    localStorage.removeItem("earnedBadgeNames");
    // DO NOT remove shownBadgeIds — permanent badge history
    sessionStorage.removeItem("firstDashboardLoad");
    sessionStorage.removeItem("hasVisitedDashboard");
    sessionStorage.removeItem("hasShownBadgePopup");

    console.log("Volunteer logout: all data cleared except shownBadgeIds");
  } else if (currentRole === "organization") {
    localStorage.removeItem("orgId");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("orgName");
    localStorage.removeItem("orgUser");
    localStorage.removeItem("user");
  } else if (currentRole === "admin") {
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUser");
  }

  localStorage.removeItem("role");
  localStorage.removeItem("activeRole");

  // Best effort cookie cleanup from server.
  logoutSession().catch(() => {});
}
