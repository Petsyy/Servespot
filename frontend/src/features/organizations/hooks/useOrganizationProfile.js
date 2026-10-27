import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getOrganizationById,
  updateOrganization,
} from "@/features/organizations/services/organization.api";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";
import { getCookie, setCookie } from "@/shared/utils/cookies";

export function useOrganizationProfile(explicitOrgId) {
  const orgId = explicitOrgId || getCookie("orgId");

  const profileQuery = useQuery({
    queryKey: queryKeys.organizations.profile(orgId),
    queryFn: async () => {
      const res = await getOrganizationById(orgId);
      return res?.data || {};
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateOrganization(orgId, payload),
    onSuccess: (res) => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      const name = res?.data?.organization?.name || res?.data?.orgName;
      if (name) {
        setCookie("orgName", name);
      }
    },
    onError: (err) => {
      console.error("Organization profile update failed:", err);
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    },
  });

  return {
    organization: profileQuery.data || null,
    isLoading: profileQuery.isLoading,
    isSaving: updateMutation.isPending,
    updateProfile: (payload) => updateMutation.mutateAsync(payload),
    refetch: () => profileQuery.refetch(),
  };
}

export default useOrganizationProfile;

