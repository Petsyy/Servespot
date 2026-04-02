import { logoutSession } from "@/services/api";

export function logout(role) {
  const currentRole = (role || "").toLowerCase();

  localStorage.removeItem("activeRole");

  if (currentRole === "volunteer") {
    const volunteerId = localStorage.getItem("volunteerId");
    if (volunteerId) {
      localStorage.removeItem(`joinedTasks_${volunteerId}`);
    }

    localStorage.removeItem("volunteerId");
    localStorage.removeItem("volUser");
    localStorage.removeItem("earnedBadges");
    localStorage.removeItem("earnedBadgeNames");
    // DO NOT remove shownBadgeIds — we want it permanent
    sessionStorage.removeItem("firstDashboardLoad");
    sessionStorage.removeItem("hasVisitedDashboard");
    sessionStorage.removeItem("hasShownBadgePopup");

    console.log("Volunteer logout: all data cleared except shownBadgeIds");
  }

  if (currentRole === "organization") {
    localStorage.removeItem("orgId");
    localStorage.removeItem("orgUser");
  }

  // Best effort cookie cleanup from server.
  logoutSession().catch(() => {});
}
