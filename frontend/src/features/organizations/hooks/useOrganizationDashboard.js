import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getOpportunities,
  getOrgStats,
  getOrgNotifications,
  getOrganizationProfile,
  markOrgNotificationsRead,
} from "@/features/organizations/services/organization.api";
import { socket, registerUserSocket } from "@/shared/utils/socket";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";
import { getCookie } from "@/shared/utils/cookies";

export function useOrganizationDashboard(explicitOrgId) {
  const orgId = explicitOrgId || getCookie("orgId");

  const profileQuery = useQuery({
    queryKey: queryKeys.organizations.profile(orgId),
    queryFn: async () => {
      const res = await getOrganizationProfile(orgId);
      return res?.data || null;
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 5,
  });

  const opportunitiesQuery = useQuery({
    queryKey: queryKeys.organizations.opportunities(orgId),
    queryFn: async () => {
      const res = await getOpportunities(orgId);
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 2,
  });

  const statsQuery = useQuery({
    queryKey: queryKeys.organizations.stats(orgId),
    queryFn: async () => {
      const res = await getOrgStats(orgId);
      return res?.data || {};
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 2,
  });

  const notificationsQuery = useQuery({
    queryKey: queryKeys.organizations.notifications(orgId),
    queryFn: async () => {
      const res = await getOrgNotifications(orgId);
      const raw = Array.isArray(res?.data) ? res.data : [];
      return raw
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!orgId) return;

    registerUserSocket(orgId, "organization");

    const handleNewNotif = (notif) => {
      toast.info(`${notif.title}: ${notif.message}`, { autoClose: 5000 });
      queryClient.setQueryData(
        queryKeys.organizations.notifications(orgId),
        (old = []) => [notif, ...old].slice(0, 3)
      );
    };

    const handleSuspended = (data) => {
      const reason = data?.reason || "No reason provided.";
      console.warn(`Account suspended. Reason: ${reason}`);
      localStorage.clear();
      window.location.href = "/suspended";
    };

    const handleReactivated = () => {
      toast.success("Your organization account has been reactivated!", {
        autoClose: 5000,
      });
      localStorage.setItem("justReactivated", "true");
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    };

    socket.on("newNotification", handleNewNotif);
    socket.on("suspended", handleSuspended);
    socket.on("reactivated", handleReactivated);

    return () => {
      socket.off("newNotification", handleNewNotif);
      socket.off("suspended", handleSuspended);
      socket.off("reactivated", handleReactivated);
    };
  }, [orgId]);

  const markReadMutation = useMutation({
    mutationFn: (notificationId) => {
      queryClient.setQueryData(
        queryKeys.organizations.notifications(orgId),
        (old = []) =>
          old.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      return Promise.resolve();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markOrgNotificationsRead(orgId),
    onSuccess: () => {
      queryClient.setQueryData(
        queryKeys.organizations.notifications(orgId),
        (old = []) => old.map((n) => ({ ...n, isRead: true }))
      );
      toast.success("All notifications marked as read");
    },
    onError: (err) => {
      console.error("Failed to mark notifications as read:", err);
      toast.error("Failed to mark notifications as read");
    },
  });

  const org = profileQuery.data;
  const orgName = org?.orgName || getCookie("orgName") || "Organization";
  const canPost = org?.status === "active";
  const isLoading =
    profileQuery.isLoading ||
    opportunitiesQuery.isLoading ||
    statsQuery.isLoading;

  return {
    org,
    orgName,
    opportunities: opportunitiesQuery.data || [],
    stats: statsQuery.data || {},
    notifications: notificationsQuery.data || [],
    canPost,
    isLoading,
    markNotificationRead: (id) => markReadMutation.mutate(id),
    markAllNotificationsRead: () => markAllReadMutation.mutate(),
    refetch: () => {
      profileQuery.refetch();
      opportunitiesQuery.refetch();
      statsQuery.refetch();
      notificationsQuery.refetch();
    },
  };
}

export default useOrganizationDashboard;
