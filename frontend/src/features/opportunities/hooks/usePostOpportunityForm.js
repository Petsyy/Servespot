import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useCreateOpportunity } from "@/features/opportunities/hooks/useOpportunities";
import {
  opportunitySchema,
  opportunityDefaultValues,
} from "@/features/opportunities/schemas/opportunity.schema";
import { getCookie } from "@/shared/utils/cookies";

export function usePostOpportunityForm({ onSuccess } = {}) {
  const orgId = getCookie("orgId");
  const createMutation = useCreateOpportunity(orgId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: opportunityDefaultValues,
    mode: "onTouched",
  });

  const formValues = watch();
  const selectedSkills = formValues.skills || [];
  const selectedFile = formValues.file;

  const imagePreview = useMemo(() => {
    return selectedFile && selectedFile.type?.startsWith("image/")
      ? URL.createObjectURL(selectedFile)
      : null;
  }, [selectedFile]);

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
    if (!orgId) {
      toast.error("Organization not found. Please log in again.");
      return;
    }

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
    formData.append("organization", orgId);

    createMutation.mutate(formData, {
      onSuccess: (res) => {
        onSuccess?.(res?.data?.opportunity || res?.data);
      },
    });
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: createMutation.isPending,
    formValues,
    selectedSkills,
    imagePreview,
    handleCheckboxChange,
    handleFileChange,
  };
}

