import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getVolunteerProfile,
  updateVolunteerProfile,
  getVolunteerBadges,
} from "@/features/volunteers/services/volunteer.api";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";
import { getCookie, setCookie } from "@/shared/utils/cookies";

export function useVolunteerProfile() {
  const volunteerId = getCookie("volunteerId");

  const profileQuery = useQuery({
    queryKey: queryKeys.volunteers.profile(volunteerId),
    queryFn: async () => {
      const res = await getVolunteerProfile();
      return res?.data || {};
    },
    enabled: Boolean(volunteerId),
    staleTime: 1000 * 60 * 5,
  });

  const badgesQuery = useQuery({
    queryKey: queryKeys.volunteers.badges(volunteerId),
    queryFn: async () => {
      const res = await getVolunteerBadges();
      const data = res?.data || {};
      return {
        badges: Array.isArray(data.badges)
          ? data.badges
          : Array.isArray(data)
          ? data
          : [],
        points: data.points || 0,
        completedTasks: data.completedTasks || 0,
        level: data.level || { level: "Beginner", color: "gray", icon: "🌱" },
        nextMilestone: data.nextMilestone || null,
        volunteerName: data.volunteerName || "",
      };
    },
    enabled: Boolean(volunteerId),
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateVolunteerProfile(payload),
    onSuccess: (res) => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.volunteers.all });
      if (res?.data?.user?.fullName) {
        setCookie("volunteerName", res.data.user.fullName);
      }
    },
    onError: (err) => {
      console.error("Profile update failed:", err);
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    },
  });

  const badgesData = badgesQuery.data || {
    badges: [],
    points: 0,
    completedTasks: 0,
    level: { level: "Beginner", color: "gray", icon: "🌱" },
    nextMilestone: null,
    volunteerName: "",
  };

  return {
    profile: profileQuery.data || null,
    badges: badgesData.badges,
    badgesData,
    isLoading: profileQuery.isLoading || badgesQuery.isLoading,
    isSaving: updateMutation.isPending,
    updateProfile: (payload) => updateMutation.mutateAsync(payload),
    refetch: () => {
      profileQuery.refetch();
      badgesQuery.refetch();
    },
  };
}

export default useVolunteerProfile;
