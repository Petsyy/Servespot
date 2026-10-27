import { useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAdminNotifications,
  markAdminNotificationsRead,
} from "@/features/admin/services/admin.api";
import {
  getVolunteerNotifications,
  markVolunteerNotificationsRead,
} from "@/features/volunteers/services/volunteer.api";
import {
  getOrgNotifications,
  markOrgNotificationsRead,
} from "@/features/organizations/services/organization.api";
import { socket, registerUserSocket } from "@/shared/utils/socket";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";

export function useRoleNotifications({ role, userId }) {
  const queryKey = useMemo(() => {
    if (role === "admin") return queryKeys.admin.notifications(userId);
    if (role === "volunteer") return queryKeys.volunteers.notifications(userId);
    return queryKeys.organizations.notifications(userId);
  }, [role, userId]);

  const queryFn = async () => {
    if (!userId) return [];
    let res;
    if (role === "admin") res = await getAdminNotifications(userId);
    else if (role === "volunteer") res = await getVolunteerNotifications(userId);
    else res = await getOrgNotifications(userId);

    const raw = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.data?.notifications)
      ? res.data.notifications
      : Array.isArray(res?.data?.data)
      ? res.data.data
      : [];

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

    return unique.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: Boolean(userId),
    staleTime: 1000 * 30, // 30 seconds
  });

  const items = query.data || [];

  // WebSocket sync
  useEffect(() => {
    if (!userId) return;

    registerUserSocket(userId, role);

    const handleNewNotif = (notif) => {
      const targetModel =
        role === "admin"
          ? "Admin"
          : role === "volunteer"
          ? "Volunteer"
          : "Organization";

      if (
        (notif?.userModel === targetModel || !notif?.userModel) &&
        (!notif?.user || String(notif.user) === String(userId))
      ) {
        queryClient.setQueryData(queryKey, (old = []) => {
          if (old.some((n) => n._id === notif._id)) return old;
          return [notif, ...old];
        });

        toast.info(`${notif.title}: ${notif.message}`, {
          autoClose: 5000,
        });
      }
    };

    socket.on("newNotification", handleNewNotif);
    return () => socket.off("newNotification", handleNewNotif);
  }, [userId, role, queryKey]);

  // Mark all as read mutation
  const markAllMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      if (role === "admin") await markAdminNotificationsRead(userId);
      else if (role === "volunteer") await markVolunteerNotificationsRead(userId);
      else await markOrgNotificationsRead(userId);
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, (old = []) =>
        old.map((n) => ({ ...n, isRead: true }))
      );
      toast.success("All notifications marked as read.");
    },
    onError: (err) => {
      console.error("Failed to mark notifications read:", err);
      toast.error("Failed to mark notifications as read.");
    },
  });

  // Mark single as read mutation
  const markSingleMutation = useMutation({
    mutationFn: async (notificationId) => {
      queryClient.setQueryData(queryKey, (old = []) =>
        old.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      return Promise.resolve();
    },
  });

  const inAppList = useMemo(
    () => items.filter((n) => n.type !== "email"),
    [items]
  );

  const emailList = useMemo(
    () => items.filter((n) => n.type === "email"),
    [items]
  );

  return {
    items,
    inAppList,
    emailList,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    markAllAsRead: () => markAllMutation.mutate(),
    markAsRead: (id) => markSingleMutation.mutate(id),
    isMarkingAllRead: markAllMutation.isPending,
  };
}

export default useRoleNotifications;

