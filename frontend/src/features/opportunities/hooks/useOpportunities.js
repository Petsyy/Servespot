import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllOpportunities,
  signupForOpportunity,
} from "@/features/volunteers/services/volunteer.api";
import {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityVolunteers,
  markOpportunityCompleted,
} from "@/features/organizations/services/organization.api";
import {
  getOpportunityById,
  submitOpportunityProof,
  reviewOpportunityProof,
} from "@/shared/services/api";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";
import { getCookie } from "@/shared/utils/cookies";

// Hook: Fetch all opportunities for volunteer browsing with automatic caching
export function useAllOpportunities() {
  const query = useQuery({
    queryKey: queryKeys.opportunities.list(),
    queryFn: async () => {
      const res = await getAllOpportunities();
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const opportunities = query.data || [];

  const uniqueLocations = useMemo(() => {
    return [
      ...new Set(
        opportunities
          .map((o) => o?.location)
          .filter(Boolean)
          .map((loc) => loc.toString().trim())
      ),
    ].sort();
  }, [opportunities]);

  const uniqueSkills = useMemo(() => {
    return [
      ...new Set(
        opportunities
          .flatMap((o) => (Array.isArray(o?.skills) ? o.skills : []))
          .filter(Boolean)
          .map((skill) => skill.toString().trim())
      ),
    ].sort();
  }, [opportunities]);

  return {
    ...query,
    opportunities,
    uniqueLocations,
    uniqueSkills,
  };
}

// Hook: Fetch opportunities for an organization
export function useOrganizationOpportunities(orgId) {
  const query = useQuery({
    queryKey: queryKeys.organizations.opportunities(orgId),
    queryFn: async () => {
      if (!orgId) return [];
      const res = await getOpportunities(orgId);
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 2,
  });

  return {
    ...query,
    opportunities: query.data || [],
  };
}

// Hook: Fetch single opportunity detail
export function useOpportunityDetail(id) {
  return useQuery({
    queryKey: queryKeys.opportunities.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const res = await getOpportunityById(id);
      return res?.data || null;
    },
    enabled: Boolean(id),
  });
}

// Hook: Fetch volunteers signed up for an opportunity
export function useOpportunityVolunteers(opportunityId) {
  return useQuery({
    queryKey: queryKeys.opportunities.volunteers(opportunityId),
    queryFn: async () => {
      if (!opportunityId) return [];
      const res = await getOpportunityVolunteers(opportunityId);
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: Boolean(opportunityId),
  });
}

// Hook: Delete opportunity mutation
export function useDeleteOpportunity(orgId) {
  return useMutation({
    mutationFn: (id) => deleteOpportunity(id),
    onSuccess: (_, deletedId) => {
      toast.success("Opportunity removed successfully!");
      if (orgId) {
        queryClient.setQueryData(
          queryKeys.organizations.opportunities(orgId),
          (old = []) => old.filter((opp) => opp._id !== deletedId)
        );
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
    },
    onError: (err) => {
      console.error("Failed to delete opportunity:", err);
      toast.error(
        err.response?.data?.message || "Failed to remove opportunity"
      );
    },
  });
}

// Hook: Update opportunity mutation
export function useUpdateOpportunity(orgId) {
  return useMutation({
    mutationFn: ({ id, formData }) => updateOpportunity(id, formData),
    onSuccess: (response, variables) => {
      toast.success("Opportunity updated successfully!");
      const updated = response?.data?.opportunity || response?.data;
      if (updated && orgId) {
        queryClient.setQueryData(
          queryKeys.organizations.opportunities(orgId),
          (old = []) =>
            old.map((opp) => (opp._id === variables.id ? { ...opp, ...updated } : opp))
        );
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.opportunities.detail(variables.id),
      });
    },
    onError: (err) => {
      console.error("Failed to update opportunity:", err);
      toast.error(
        err.response?.data?.message || "Failed to update opportunity"
      );
    },
  });
}

// Hook: Create opportunity mutation
export function useCreateOpportunity(orgId) {
  return useMutation({
    mutationFn: (data) => createOpportunity(data),
    onSuccess: (response) => {
      toast.success("Opportunity created successfully!");
      const created = response?.data?.opportunity;
      if (created && orgId) {
        queryClient.setQueryData(
          queryKeys.organizations.opportunities(orgId),
          (old = []) => [created, ...old]
        );
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.dashboard(orgId),
      });
    },
    onError: (err) => {
      console.error("Failed to create opportunity:", err);
      toast.error(
        err.response?.data?.message || "Failed to create opportunity"
      );
    },
  });
}

// Hook: Volunteer signup mutation
export function useSignupOpportunity() {
  return useMutation({
    mutationFn: (id) => signupForOpportunity(id),
    onSuccess: () => {
      toast.success("Signed up successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      const volunteerId = getCookie("volunteerId");
      if (volunteerId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.volunteers.tasks(volunteerId),
        });
      }
    },
    onError: (err) => {
      console.error("Failed to sign up for opportunity:", err);
      toast.error(
        err.response?.data?.message || "Failed to sign up for opportunity"
      );
    },
  });
}

// Hook: Complete opportunity mutation
export function useCompleteOpportunity() {
  return useMutation({
    mutationFn: (oppId) => markOpportunityCompleted(oppId),
    onSuccess: () => {
      toast.success("Opportunity marked as completed!");
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
    },
    onError: (err) => {
      console.error("Failed to complete opportunity:", err);
      toast.error(
        err.response?.data?.message || "Failed to mark opportunity as completed"
      );
    },
  });
}

// Hook: Review opportunity proof mutation
export function useReviewOpportunityProof(opportunityId) {
  return useMutation({
    mutationFn: ({ volunteerId, action }) =>
      reviewOpportunityProof(opportunityId, volunteerId, action),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Review updated successfully!");
      if (opportunityId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.opportunities.detail(opportunityId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
    },
    onError: (err) => {
      console.error("Failed to review proof:", err);
      toast.error(
        err?.response?.data?.message || "Failed to update review status"
      );
    },
  });
}

// Hook: Submit opportunity proof mutation
export function useSubmitOpportunityProof() {
  return useMutation({
    mutationFn: ({ opportunityId, formData }) =>
      submitOpportunityProof(opportunityId, formData),
    onSuccess: (res, variables) => {
      toast.success(res?.data?.message || "Proof submitted successfully!");
      if (variables?.opportunityId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.opportunities.detail(variables.opportunityId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      const volunteerId = getCookie("volunteerId");
      if (volunteerId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.volunteers.tasks(volunteerId),
        });
      }
    },
    onError: (err) => {
      console.error("Failed to submit proof:", err);
      toast.error(
        err?.response?.data?.message || "Failed to submit proof. Please try again."
      );
    },
  });
}
