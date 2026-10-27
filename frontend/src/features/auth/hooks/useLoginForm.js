import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/features/auth/hooks/useAuthMutations";
import { loginSchema, loginDefaultValues } from "@/features/auth/schemas/login.schema";
import { registerUserSocket } from "@/shared/utils/socket";
import { setCookie, clearClientSessionCookies } from "@/shared/utils/cookies";
import { useAuth } from "@/shared/context/AuthContext";

export function useLoginForm(role = "Volunteer") {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation(role);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
    mode: "onTouched",
  });

  const onSubmit = async (formData) => {
    try {
      // Clear previous session credentials
      clearClientSessionCookies();
      localStorage.clear();

      const data = await loginMutation.mutateAsync(formData);

      if (role.toLowerCase() === "volunteer") {
        const userId = data.user?.id || data.user?._id;
        setCookie("role", "volunteer");
        setCookie("volunteerId", userId);

        const volunteerName = data.user?.fullName || "Volunteer";
        setCookie("volunteerName", volunteerName);

        registerUserSocket(userId, "volunteer");
        login(data.user, "volunteer");
        navigate("/volunteer/homepage");
      } else {
        const orgId = data.organization?._id || data.orgId;
        setCookie("role", "organization");
        setCookie("orgId", orgId);

        const orgName =
          data.organization?.name ||
          data.user?.orgName ||
          data.user?.name ||
          "Organization";
        setCookie("orgName", orgName);

        registerUserSocket(orgId, "organization");
        login(data.organization || data.user, "organization");
        navigate("/organization/homepage");
      }
    } catch (err) {
      console.error("Login submission error:", err);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isSubmitting || loginMutation.isPending,
    showPassword,
    toggleShowPassword: () => setShowPassword((prev) => !prev),
    reset,
  };
}

