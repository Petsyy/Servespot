import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { checkEmailAvailability } from "@/shared/services/api";
import { organizationAccountSchema } from "@/features/auth/schemas/organizationRegistration.schema";

export function useOrganizationAccountForm({ formData, updateField, onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(organizationAccountSchema),
    defaultValues: {
      orgName: formData.orgName || "",
      email: formData.email || "",
      password: formData.password || "",
      confirmPassword: formData.confirmPassword || "",
    },
    mode: "onTouched",
  });

  const watchedPassword = watch("password") || "";

  const passwordCriteria = useMemo(() => {
    return {
      hasValue: watchedPassword.length > 0,
      hasMinLength: watchedPassword.length >= 8,
      startsWithCapital: /^[A-Z]/.test(watchedPassword),
      specialCharRegex: /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword),
    };
  }, [watchedPassword]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await checkEmailAvailability(data.email);
      if (res.data?.available === false) {
        setError("email", {
          type: "manual",
          message: "This email is already registered. Please log in or use a different email.",
        });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Could not check email availability:", err);
    }

    // Persist to parent signup state
    Object.entries(data).forEach(([key, val]) => {
      updateField(key, val);
    });

    setIsLoading(false);
    toast.success("Let's complete your profile to get started.");
    onNext();
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    showPassword,
    toggleShowPassword: () => setShowPassword((prev) => !prev),
    showConfirmPassword,
    toggleShowConfirmPassword: () => setShowConfirmPassword((prev) => !prev),
    passwordCriteria,
  };
}

