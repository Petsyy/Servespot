import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getVolunteerProfile,
  getVolunteerNotifications,
  markVolunteerNotificationsRead,
} from "@/features/volunteers/services/volunteer.api";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";
import { socket } from "@/shared/utils/socket";
import { logout } from "@/shared/utils/logout";
import { getCookie } from "@/shared/utils/cookies";

export function useVolunteerNavbar() {
  const navigate = useNavigate();
  const volunteerId = getCookie("volunteerId");

  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  // Fetch volunteer profile
  const { data: profile } = useQuery({
    queryKey: queryKeys.volunteers.profile(volunteerId),
    queryFn: async () => {
      const res = await getVolunteerProfile();
      return res.data?.data || res.data || null;
    },
    enabled: Boolean(volunteerId),
  });

  const volunteerName = useMemo(() => {
    if (profile?.fullName) return profile.fullName;
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    }
    return getCookie("volunteerName") || "Volunteer";
  }, [profile]);

  const volunteerEmail = profile?.email || "volunteer@servespot.com";

  // Fetch volunteer notifications
  const { data: notifications = [], isLoading: loadingNotif } = useQuery({
    queryKey: queryKeys.volunteers.notifications(volunteerId),
    queryFn: async () => {
      if (!volunteerId) return [];
      const res = await getVolunteerNotifications(volunteerId);
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      return list;
    },
    enabled: Boolean(volunteerId),
    refetchInterval: 30000,
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  useEffect(() => {
    if (!volunteerId || !socket) return;

    socket.emit("registerVolunteer", volunteerId);

    const handleNewNotif = (notif) => {
      queryClient.setQueryData(
        queryKeys.volunteers.notifications(volunteerId),
        (old = []) => {
          const exists = old.some((n) => n._id === notif._id);
          if (exists) return old;
          return [notif, ...old].slice(0, 50);
        }
      );
    };

    socket.on("newNotification", handleNewNotif);
    return () => socket.off("newNotification", handleNewNotif);
  }, [volunteerId]);

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: markVolunteerNotificationsRead,
    onSuccess: (response) => {
      queryClient.setQueryData(
        queryKeys.volunteers.notifications(volunteerId),
        (old = []) => old.map((n) => ({ ...n, isRead: true }))
      );
      const updatedCount = response?.data?.updatedCount || 0;
      if (updatedCount > 0) {
        toast.success(
          `Marked ${updatedCount} notification${updatedCount === 1 ? "" : "s"} as read`
        );
      } else {
        toast.info("All notifications were already read");
      }
    },
    onError: () => {
      toast.error("Failed to mark notifications as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.volunteers.notifications(volunteerId),
      });
    },
  });

  const initials = useMemo(() => {
    return volunteerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "V";
  }, [volunteerName]);

  const handleLogout = () => {
    logout("volunteer");
    navigate("/role/login");
  };

  return {
    volunteerName,
    volunteerEmail,
    initials,
    notifications,
    unreadCount,
    loadingNotif,
    openNotif,
    setOpenNotif,
    openProfile,
    setOpenProfile,
    markAllRead: () => markAllReadMutation.mutate(),
    isMarkingRead: markAllReadMutation.isPending,
    handleLogout,
  };
}

export default useVolunteerNavbar;

