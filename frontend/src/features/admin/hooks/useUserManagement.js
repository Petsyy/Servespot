import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllOrganizations,
  getAllVolunteers,
  updateOrganizationStatus,
  updateVolunteerStatus,
} from "@/features/admin/services/admin.api";
import { socket, registerUserSocket } from "@/shared/utils/socket";
import { queryClient } from "@/shared/services/queryClient";
import {
  confirmVerification,
  confirmSuspension,
  confirmReactivation,
} from "@/shared/utils/swalAlerts";

export function useUserManagement(adminId) {
  const [loadingUserId, setLoadingUserId] = useState(null);

  // 1. Organizations Query
  const orgsQuery = useQuery({
    queryKey: ["admin", "users", "organizations"],
    queryFn: async () => {
      const res = await getAllOrganizations();
      const raw = Array.isArray(res?.data)
        ? res.data
        : res?.data?.organizations || [];
      return raw.map((o) => ({ ...o, role: "organization" }));
    },
    staleTime: 1000 * 60 * 2,
  });

  // 2. Volunteers Query
  const volsQuery = useQuery({
    queryKey: ["admin", "users", "volunteers"],
    queryFn: async () => {
      const res = await getAllVolunteers();
      const raw = Array.isArray(res?.data)
        ? res.data
        : res?.data?.volunteers || [];
      return raw.map((v) => ({ ...v, role: "volunteer" }));
    },
    staleTime: 1000 * 60 * 2,
  });

  // WebSocket sync for status updates
  useEffect(() => {
    if (!adminId) return;

    registerUserSocket(adminId, "admin");

    const handleVolunteerStatus = ({ userId, status }) => {
      queryClient.setQueryData(["admin", "users", "volunteers"], (old = []) =>
        old.map((v) => (v._id === userId ? { ...v, status } : v))
      );
      const toastId = `vol-status-${userId}-${status}`;
      if (!toast.isActive(toastId)) {
        toast.info(`Volunteer status updated: ${status}`, { toastId });
      }
    };

    const handleOrgStatus = ({ orgId, status }) => {
      queryClient.setQueryData(["admin", "users", "organizations"], (old = []) =>
        old.map((o) => (o._id === orgId ? { ...o, status } : o))
      );
    };

    socket.on("volunteerStatusUpdated", handleVolunteerStatus);
    socket.on("organizationStatusUpdated", handleOrgStatus);

    return () => {
      socket.off("volunteerStatusUpdated", handleVolunteerStatus);
      socket.off("organizationStatusUpdated", handleOrgStatus);
    };
  }, [adminId]);

  // Mutations
  const verifyOrgMutation = useMutation({
    mutationFn: async (user) => {
      setLoadingUserId(user._id);
      await updateOrganizationStatus(user._id, "active");
      return user;
    },
    onSuccess: (user) => {
      toast.success(`${user.orgName} has been verified successfully!`);
      queryClient.setQueryData(["admin", "users", "organizations"], (old = []) =>
        old.map((o) => (o._id === user._id ? { ...o, status: "active" } : o))
      );
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to verify organization");
    },
    onSettled: () => {
      setLoadingUserId(null);
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (user) => {
      setLoadingUserId(user._id);
      if (user.role === "organization") {
        await updateOrganizationStatus(user._id, "suspended");
      } else {
        await updateVolunteerStatus(user._id, "suspended");
      }
      return user;
    },
    onSuccess: (user) => {
      const name = user.orgName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.fullName;
      toast.info(`${name} has been suspended.`);
      if (user.role === "organization") {
        queryClient.setQueryData(["admin", "users", "organizations"], (old = []) =>
          old.map((o) => (o._id === user._id ? { ...o, status: "suspended" } : o))
        );
      } else {
        queryClient.setQueryData(["admin", "users", "volunteers"], (old = []) =>
          old.map((v) => (v._id === user._id ? { ...v, status: "suspended" } : v))
        );
      }
    },
    onError: (err, user) => {
      console.error(err);
      toast.error(`Failed to suspend ${user.role}`);
    },
    onSettled: () => {
      setLoadingUserId(null);
    },
  });

  const reactivateUserMutation = useMutation({
    mutationFn: async (user) => {
      setLoadingUserId(user._id);
      if (user.role === "organization") {
        await updateOrganizationStatus(user._id, "active");
      } else {
        await updateVolunteerStatus(user._id, "active");
      }
      return user;
    },
    onSuccess: (user) => {
      const name = user.orgName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.fullName;
      toast.success(`${name} has been reactivated successfully!`);
      if (user.role === "organization") {
        queryClient.setQueryData(["admin", "users", "organizations"], (old = []) =>
          old.map((o) => (o._id === user._id ? { ...o, status: "active" } : o))
        );
      } else {
        queryClient.setQueryData(["admin", "users", "volunteers"], (old = []) =>
          old.map((v) => (v._id === user._id ? { ...v, status: "active" } : v))
        );
      }
    },
    onError: (err, user) => {
      console.error(err);
      toast.error(`Failed to reactivate ${user.role}`);
    },
    onSettled: () => {
      setLoadingUserId(null);
    },
  });

  const handleVerifyOrganization = async (user) => {
    if (loadingUserId) return;
    const confirmed = await confirmVerification(user.orgName);
    if (!confirmed) return;
    verifyOrgMutation.mutate(user);
  };

  const handleSuspendUser = async (user) => {
    if (loadingUserId) return;
    const userType = user.role === "organization" ? "Organization" : "Volunteer";
    const userName = user.orgName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.fullName;
    const confirmed = await confirmSuspension(userType, userName);
    if (!confirmed) return;
    suspendUserMutation.mutate(user);
  };

  const handleReactivateUser = async (user) => {
    if (loadingUserId) return;
    const userType = user.role === "organization" ? "Organization" : "Volunteer";
    const userName = user.orgName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.fullName;
    const confirmed = await confirmReactivation(userType, userName);
    if (!confirmed) return;
    reactivateUserMutation.mutate(user);
  };

  const organizations = orgsQuery.data || [];
  const volunteers = volsQuery.data || [];
  const allUsers = [...volunteers, ...organizations];

  return {
    organizations,
    volunteers,
    allUsers,
    isLoading: orgsQuery.isLoading || volsQuery.isLoading,
    loadingUserId,
    handleVerifyOrganization,
    handleSuspendUser,
    handleReactivateUser,
    refetch: () => {
      orgsQuery.refetch();
      volsQuery.refetch();
    },
  };
}

export default useUserManagement;

