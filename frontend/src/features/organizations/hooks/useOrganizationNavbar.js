import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getOrganizationProfile,
  getOrgNotifications,
  markOrgNotificationsRead,
} from "@/features/organizations/services/organization.api";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";
import { socket, registerUserSocket } from "@/shared/utils/socket";
import { logout } from "@/shared/utils/logout";
import { getCookie } from "@/shared/utils/cookies";

export function useOrganizationNavbar() {
  const navigate = useNavigate();
  const orgId = getCookie("orgId");

  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  // Fetch organization profile
  const { data: profile } = useQuery({
    queryKey: queryKeys.organizations.profile(orgId),
    queryFn: async () => {
      if (!orgId) return null;
      const res = await getOrganizationProfile(orgId);
      return res?.data?.data || res?.data || null;
    },
    enabled: Boolean(orgId),
  });

  const organizationName =
    profile?.orgName ||
    profile?.name ||
    getCookie("orgName") ||
    "Organization";

  const organizationEmail = profile?.email || "organization@servespot.com";

  const { data: notifications = [], isLoading: loadingNotif } = useQuery({
    queryKey: queryKeys.organizations.notifications(orgId),
    queryFn: async () => {
      if (!orgId) return [];
      const res = await getOrgNotifications(orgId);
      const list = Array.isArray(res?.data) ? res.data : [];
      return list
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50);
    },
    enabled: Boolean(orgId),
    refetchInterval: 30000,
  });

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  useEffect(() => {
    if (!orgId || !socket) return;

    registerUserSocket(orgId, "organization");

    const handleNewNotif = (notif) => {
      queryClient.setQueryData(
        queryKeys.organizations.notifications(orgId),
        (old = []) => {
          const exists = old.some((n) => n._id === notif._id);
          if (exists) return old;
          return [notif, ...old].slice(0, 50);
        }
      );
    };

    socket.on("newNotification", handleNewNotif);
    return () => socket.off("newNotification", handleNewNotif);
  }, [orgId]);

  const markAllReadMutation = useMutation({
    mutationFn: () => markOrgNotificationsRead(orgId),
    onSuccess: (response) => {
      queryClient.setQueryData(
        queryKeys.organizations.notifications(orgId),
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
        queryKey: queryKeys.organizations.notifications(orgId),
      });
    },
  });

  const initials = useMemo(() => {
    return organizationName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "O";
  }, [organizationName]);

  const handleLogout = () => {
    logout("organization");
    navigate("/role/login");
  };

  return {
    organizationName,
    organizationEmail,
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

export default useOrganizationNavbar;

