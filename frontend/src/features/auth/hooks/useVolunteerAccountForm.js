import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { checkEmailAvailability } from "@/shared/services/api";
import { volunteerAccountSchema } from "@/features/auth/schemas/volunteerRegistration.schema";

export function useVolunteerAccountForm({ formData, updateField, onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(volunteerAccountSchema),
    defaultValues: {
      firstName: formData.firstName || "",
      middleName: formData.middleName || "",
      lastName: formData.lastName || "",
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
    setIsCheckingEmail(true);
    try {
      const res = await checkEmailAvailability(data.email);
      if (res.data?.available === false) {
        setError("email", {
          type: "manual",
          message: "This email is already registered. Please log in or use a different email.",
        });
        return;
      }
    } catch (err) {
      console.warn("Could not check email availability:", err);
    } finally {
      setIsCheckingEmail(false);
    }

    // Persist to parent signup state
    Object.entries(data).forEach(([key, val]) => {
      updateField(key, val);
    });

    toast.success("Let's complete your profile to get started.");
    onNext();
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isCheckingEmail,
    showPassword,
    toggleShowPassword: () => setShowPassword((prev) => !prev),
    showConfirmPassword,
    toggleShowConfirmPassword: () => setShowConfirmPassword((prev) => !prev),
    passwordCriteria,
  };
}

