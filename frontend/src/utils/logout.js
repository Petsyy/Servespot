export function logout(role) {
  const currentRole = (
    role ||
    localStorage.getItem("activeRole") ||
    ""
  ).toLowerCase();

  localStorage.removeItem("token");
  localStorage.removeItem("activeRole");

  if (currentRole === "volunteer") {
    const volunteerId = localStorage.getItem("volunteerId");
    if (volunteerId) {
      localStorage.removeItem(`joinedTasks_${volunteerId}`);
    }

    localStorage.removeItem("volToken");
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
    localStorage.removeItem("orgToken");
    localStorage.removeItem("orgId");
    localStorage.removeItem("orgUser");
  }
}
