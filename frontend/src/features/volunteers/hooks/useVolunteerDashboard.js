import { useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getVolunteerOverview,
  getVolunteerTasks,
  getVolunteerNotifications,
  getVolunteerProgress,
  getVolunteerBadges,
  getTopVolunteers,
  markVolunteerNotificationsRead,
} from "@/features/volunteers/services/volunteer.api";
import { socket, registerUserSocket } from "@/shared/utils/socket";
import { showNewBadgeAlert } from "@/shared/utils/badgeAlerts";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";
import { getCookie } from "@/shared/utils/cookies";

export function useVolunteerDashboard() {
  const volunteerId = getCookie("volunteerId");

  // 1. Overview query
  const overviewQuery = useQuery({
    queryKey: queryKeys.volunteers.overview(volunteerId),
    queryFn: async () => {
      const res = await getVolunteerOverview();
      return res?.data || {};
    },
    enabled: Boolean(volunteerId),
    staleTime: 1000 * 60 * 2,
  });

  // 2. Tasks query
  const tasksQuery = useQuery({
    queryKey: queryKeys.volunteers.tasks(volunteerId),
    queryFn: async () => {
      const res = await getVolunteerTasks();
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: Boolean(volunteerId),
    staleTime: 1000 * 60 * 2,
  });

  // 3. Progress query
  const progressQuery = useQuery({
    queryKey: queryKeys.volunteers.progress(volunteerId),
    queryFn: async () => {
      const res = await getVolunteerProgress();
      return res?.data || null;
    },
    enabled: Boolean(volunteerId),
    staleTime: 1000 * 60 * 2,
  });

  // 4. Badges query (refetches every 30s instead of 10s busy-loop)
  const badgesQuery = useQuery({
    queryKey: queryKeys.volunteers.badges(volunteerId),
    queryFn: async () => {
      const res = await getVolunteerBadges();
      const data = res?.data;
      if (Array.isArray(data?.badges)) return data.badges;
      if (Array.isArray(data)) return data;
      return [];
    },
    enabled: Boolean(volunteerId),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });

  // 5. Top volunteers query
  const topVolunteersQuery = useQuery({
    queryKey: queryKeys.volunteers.top(),
    queryFn: async () => {
      const res = await getTopVolunteers();
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // 6. Notifications query
  const notificationsQuery = useQuery({
    queryKey: queryKeys.volunteers.notifications(volunteerId),
    queryFn: async () => {
      const res = await getVolunteerNotifications();
      const raw = Array.isArray(res?.data) ? res.data : [];
      // Deduplicate by _id and sort by date descending
      const unique = raw.reduce((acc, current) => {
        const idx = acc.findIndex((item) => item._id === current._id);
        if (idx === -1) {
          acc.push(current);
        } else if (new Date(current.createdAt) > new Date(acc[idx].createdAt)) {
          acc[idx] = current;
        }
        return acc;
      }, []);
      return unique
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50);
    },
    enabled: Boolean(volunteerId),
    staleTime: 1000 * 30,
  });

  // Categorize tasks
  const { allTasks, activeTasks, completedTasks } = useMemo(() => {
    const list = Array.isArray(tasksQuery.data) ? tasksQuery.data : [];
    return {
      allTasks: list,
      activeTasks: list.filter(
        (t) => t.status === "Open" || t.status === "In Progress"
      ),
      completedTasks: list.filter((t) => t.status === "Completed"),
    };
  }, [tasksQuery.data]);

  // Normalized badges list (guaranteed array even if cached data was an object)
  const badgesList = useMemo(() => {
    const raw = badgesQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.badges)) return raw.badges;
    return [];
  }, [badgesQuery.data]);

  // Check for new badges and alert user
  useEffect(() => {
    if (!Array.isArray(badgesList) || badgesList.length === 0) return;

    localStorage.setItem("earnedBadges", JSON.stringify(badgesList));
    const shownBadgeIds = JSON.parse(
      localStorage.getItem("shownBadgeIds") || "[]"
    );

    const newBadges = badgesList.filter((badge) => {
      const badgeId = badge?._id || badge?.id || badge?.name;
      return badgeId && !shownBadgeIds.includes(badgeId);
    });

    const firstLoad = sessionStorage.getItem("firstDashboardLoad");
    const justReactivated = localStorage.getItem("justReactivated");

    if (!firstLoad || justReactivated) {
      sessionStorage.setItem("firstDashboardLoad", "true");
      if (newBadges.length > 0) {
        const updatedIds = [
          ...shownBadgeIds,
          ...newBadges.map((b) => b?._id || b?.id || b?.name).filter(Boolean),
        ];
        localStorage.setItem("shownBadgeIds", JSON.stringify(updatedIds));
      }
      localStorage.removeItem("justReactivated");
      return;
    }

    if (newBadges.length > 0) {
      const updatedShownBadgeIds = [
        ...shownBadgeIds,
        ...newBadges.map((badge) => badge?._id || badge?.id || badge?.name).filter(Boolean),
      ];
      localStorage.setItem(
        "shownBadgeIds",
        JSON.stringify(updatedShownBadgeIds)
      );
      newBadges.forEach((badge) => showNewBadgeAlert(badge));
    }
  }, [badgesList]);

  // Real-time WebSocket sync
  useEffect(() => {
    if (!volunteerId) return;
    registerUserSocket(volunteerId, "volunteer");

    const handleNewNotif = (notif) => {
      if (!window._shownNotifs) window._shownNotifs = new Set();
      if (window._shownNotifs.has(notif._id)) return;
      window._shownNotifs.add(notif._id);

      toast.info(`${notif.title}: ${notif.message}`, { autoClose: 4000 });
      queryClient.setQueryData(
        queryKeys.volunteers.notifications(volunteerId),
        (old = []) => {
          if (old.some((n) => n._id === notif._id)) return old;
          return [notif, ...old].slice(0, 50);
        }
      );
    };

    const handleSuspended = (data) => {
      console.warn("Account suspended. Reason:", data?.reason);
      localStorage.clear();
      window.location.href = "/suspended";
    };

    const handleReactivated = () => {
      toast.success("✅ Your account has been reactivated!", {
        autoClose: 5000,
      });
      localStorage.setItem("justReactivated", "true");
      queryClient.invalidateQueries({ queryKey: queryKeys.volunteers.all });
    };

    socket.on("newNotification", handleNewNotif);
    socket.on("suspended", handleSuspended);
    socket.on("reactivated", handleReactivated);

    return () => {
      socket.off("newNotification", handleNewNotif);
      socket.off("suspended", handleSuspended);
      socket.off("reactivated", handleReactivated);
    };
  }, [volunteerId]);

  // Notification marking mutation
  const markReadMutation = useMutation({
    mutationFn: (notificationId) => {
      queryClient.setQueryData(
        queryKeys.volunteers.notifications(volunteerId),
        (old = []) =>
          old.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      return Promise.resolve();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markVolunteerNotificationsRead(),
    onSuccess: () => {
      queryClient.setQueryData(
        queryKeys.volunteers.notifications(volunteerId),
        (old = []) => old.map((n) => ({ ...n, isRead: true }))
      );
      toast.success("All notifications marked as read");
    },
    onError: (err) => {
      console.error("Failed to mark notifications read:", err);
      toast.error("Failed to mark notifications as read");
    },
  });

  const isLoading =
    overviewQuery.isLoading ||
    tasksQuery.isLoading ||
    progressQuery.isLoading ||
    badgesQuery.isLoading;

  return {
    overview: overviewQuery.data || null,
    tasks: {
      all: allTasks,
      active: activeTasks,
      completed: completedTasks,
    },
    progress: progressQuery.data || null,
    badges: badgesList,
    topVolunteers: topVolunteersQuery.data || [],
    notifications: notificationsQuery.data || [],
    isLoading,
    markNotificationRead: (id) => markReadMutation.mutate(id),
    markAllNotificationsRead: () => markAllReadMutation.mutate(),
    refetch: () => {
      overviewQuery.refetch();
      tasksQuery.refetch();
      progressQuery.refetch();
      badgesQuery.refetch();
      notificationsQuery.refetch();
    },
  };
}

export default useVolunteerDashboard;

