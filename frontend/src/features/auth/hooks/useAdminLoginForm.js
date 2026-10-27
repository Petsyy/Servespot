import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { loginAdmin } from "@/features/admin/services/admin.api";
import { loginSchema, loginDefaultValues } from "@/features/auth/schemas/login.schema";
import { setCookie, clearClientSessionCookies } from "@/shared/utils/cookies";

export function useAdminLoginForm() {
  const navigate = useNavigate();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (credentials) => loginAdmin(credentials),
  });

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
      clearClientSessionCookies();
      localStorage.clear();

      const response = await mutateAsync({
        email: formData.email.trim(),
        password: formData.password,
      });

      const adminData =
        response.data?.admin ||
        response.data?.data?.admin ||
        response.admin ||
        response.data?.user;

      if (!adminData) {
        throw new Error("Invalid login response from server");
      }

      setCookie("role", "admin");
      const adminId = adminData._id || adminData.id;
      if (adminId) {
        setCookie("adminId", adminId);
      }

      toast.success("Admin login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      let errorMessage = "Login failed! Please check your credentials.";
      if (error.response?.data) {
        const serverError = error.response.data;
        errorMessage = serverError?.message || serverError?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: isSubmitting || isPending,
    reset,
  };
}

