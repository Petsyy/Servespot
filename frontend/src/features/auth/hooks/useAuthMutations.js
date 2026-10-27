import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  loginVolunteer,
  loginOrganization,
  sendOtp,
  verifyOtp,
  resetPassword,
} from "@/shared/services/api";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";

/**
 * Hook for Volunteer / Organization login mutation
 */
export function useLoginMutation(role = "Volunteer") {
  return useMutation({
    mutationFn: async (credentials) => {
      const isVolunteer = role.toLowerCase() === "volunteer";
      const res = isVolunteer
        ? await loginVolunteer(credentials)
        : await loginOrganization(credentials);
      return res?.data;
    },
    onSuccess: () => {
      toast.success(`${role} login successful!`);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
    },
    onError: (err) => {
      console.error("Login failed:", err);
      const msg = err?.response?.data?.message || err?.message || "Login failed";
      toast.error(msg);
    },
  });
}

/**
 * Hook for sending OTP in password reset
 */
export function useSendOtpMutation() {
  return useMutation({
    mutationFn: async ({ email, role }) => {
      const res = await sendOtp({ email, role });
      return res?.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`OTP sent to ${variables.email}`);
    },
    onError: (err) => {
      console.error("Failed to send OTP:", err);
      const msg = err?.response?.data?.message || "Failed to send OTP";
      toast.error(msg);
    },
  });
}

/**
 * Hook for verifying OTP in password reset
 */
export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: async ({ email, role, otp }) => {
      const res = await verifyOtp({ email, role, otp });
      return res?.data;
    },
    onSuccess: () => {
      toast.success("OTP verified!");
    },
    onError: (err) => {
      console.error("Failed to verify OTP:", err);
      const msg = err?.response?.data?.message || "Failed to verify OTP";
      toast.error(msg);
    },
  });
}

/**
 * Hook for resetting password
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async ({ email, role, newPassword, resetToken }) => {
      const res = await resetPassword({ email, role, newPassword, resetToken });
      return res?.data;
    },
    onSuccess: () => {
      toast.success("Password reset successfully!");
    },
    onError: (err) => {
      console.error("Failed to reset password:", err);
      const msg = err?.response?.data?.message || "Password reset failed";
      toast.error(msg);
    },
  });
}

