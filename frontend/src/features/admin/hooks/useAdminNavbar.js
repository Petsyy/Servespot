import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAdminProfile,
  getAdminNotifications,
  markAdminNotificationsRead,
} from "@/features/admin/services/admin.api";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";
import { logout } from "@/shared/utils/logout";
import { getCookie, removeCookie } from "@/shared/utils/cookies";

export function useAdminNavbar() {
  const navigate = useNavigate();
  const adminId = getCookie("adminId");

  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const { data: profile } = useQuery({
    queryKey: queryKeys.admin.profile(adminId),
    queryFn: async () => {
      const res = await getAdminProfile(adminId);
      return res.data?.data || null;
    },
    enabled: Boolean(adminId),
  });

  const adminName = profile?.name || "Admin";
  const adminEmail = profile?.email || "admin@servespot.com";

  const { data: notifications = [], isLoading: loadingNotif } = useQuery({
    queryKey: queryKeys.admin.notifications(adminId),
    queryFn: async () => {
      const res = await getAdminNotifications(adminId);
      return res.data?.data || [];
    },
    enabled: Boolean(adminId),
    refetchInterval: 30000,
  });

  const computedCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => markAdminNotificationsRead(adminId),
    onSuccess: () => {
      queryClient.setQueryData(
        queryKeys.admin.notifications(adminId),
        (old) => (old || []).map((n) => ({ ...n, isRead: true }))
      );
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark notifications as read");
    },
    onSettled: () => {
      setOpenNotif(false);
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.notifications(adminId),
      });
    },
  });

  const initials = useMemo(() => {
    return adminName
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [adminName]);

  const handleLogout = () => {
    logout("admin");
    removeCookie("adminId");
    navigate("/admin/login");
  };

  return {
    adminName,
    adminEmail,
    initials,
    notifications,
    loadingNotif,
    computedCount,
    openNotif,
    setOpenNotif,
    openProfile,
    setOpenProfile,
    markAllRead: () => markAllReadMutation.mutate(),
    isMarkingRead: markAllReadMutation.isPending,
    handleLogout,
  };
}

export default useAdminNavbar;
