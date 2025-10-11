export function logout(role) {
  const currentRole = (role || localStorage.getItem("activeRole") || "").toLowerCase();
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

    console.log("Volunteer logout: all data cleared");
  }

  if (currentRole === "organization") {
    localStorage.removeItem("orgToken");
    localStorage.removeItem("orgId");
    localStorage.removeItem("orgUser");
    console.log("Organization logout: all data cleared");
  }

  console.log("Remaining localStorage keys:", { ...localStorage });
}
