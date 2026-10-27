import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { buildFileUrl } from "@/shared/utils/fileUrl";
import {
  useOpportunityDetail,
  useUpdateOpportunity,
} from "@/features/opportunities/hooks/useOpportunities";
import {
  opportunitySchema,
  opportunityDefaultValues,
} from "@/features/opportunities/schemas/opportunity.schema";
import { getCookie } from "@/shared/utils/cookies";

export function useEditOpportunityForm({ opportunityId, onUpdated } = {}) {
  const orgId = getCookie("orgId");
  const { data: opportunity, isLoading: isFetching } = useOpportunityDetail(opportunityId);
  const updateMutation = useUpdateOpportunity(orgId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: opportunityDefaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (opportunity) {
      reset({
        title: opportunity.title || "",
        description: opportunity.description || "",
        date: opportunity.date
          ? new Date(opportunity.date).toISOString().split("T")[0]
          : "",
        duration: opportunity.duration || "",
        location: opportunity.location || "",
        skills: opportunity.skills || [],
        volunteersNeeded: opportunity.volunteersNeeded || 1,
        file: null,
      });
    }
  }, [opportunity, reset]);

  const formValues = watch();
  const selectedSkills = formValues.skills || [];
  const selectedFile = formValues.file;

  const imagePreview = useMemo(() => {
    if (selectedFile && selectedFile.type?.startsWith("image/")) {
      return URL.createObjectURL(selectedFile);
    }
    if (opportunity?.fileUrl) {
      return buildFileUrl(opportunity.fileUrl);
    }
    return null;
  }, [selectedFile, opportunity?.fileUrl]);

  const handleCheckboxChange = (skill) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setValue("skills", updated, { shouldValidate: true, shouldDirty: true });
  };

  const handleFileChange = (file) => {
    setValue("file", file, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "skills") {
        (value || []).forEach((s) => formData.append("skills[]", s));
      } else if (key === "file") {
        if (value) formData.append("file", value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    updateMutation.mutate(
      { id: opportunityId, formData },
      {
        onSuccess: (res) => {
          onUpdated?.(res?.data?.opportunity || res?.data);
        },
      }
    );
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: updateMutation.isPending,
    isFetching,
    formValues,
    selectedSkills,
    imagePreview,
    handleCheckboxChange,
    handleFileChange,
  };
}

