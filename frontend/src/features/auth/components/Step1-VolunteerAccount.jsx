import React from "react";
import FormInput from "@/shared/components/ui/FormInput";
import { User, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useVolunteerAccountForm } from "@/features/auth/hooks/useVolunteerAccountForm";

export default function VolunteerAccount({ formData, updateField, onNext }) {
  const {
    register,
    handleSubmit,
    errors,
    isCheckingEmail,
    showPassword,
    toggleShowPassword,
    showConfirmPassword,
    toggleShowConfirmPassword,
    passwordCriteria,
  } = useVolunteerAccountForm({ formData, updateField, onNext });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Create Volunteer Account
        </h2>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          Set up your personal details and credentials to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormInput
            label="First Name"
            placeholder="e.g. Maria"
            error={errors.firstName?.message}
            {...register("firstName")}
          />

          <FormInput
            label="Last Name"
            placeholder="e.g. Santos"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        {/* Middle Name (Optional) */}
        <FormInput
          label="Middle Name (Optional)"
          placeholder="e.g. Cruz (optional)"
          error={errors.middleName?.message}
          {...register("middleName")}
        />

        {/* Email Address */}
        <FormInput
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password field with toggle */}
        <FormInput
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a secure password"
          rightElement={
            <button
              type="button"
              onClick={toggleShowPassword}
              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Password Checklist */}
        {passwordCriteria.hasValue && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1.5 animate-fadeInUp">
            <span className="font-semibold text-gray-700 block mb-1">
              Password requirements:
            </span>
            <div className="flex items-center gap-2">
              {passwordCriteria.startsWithCapital ? (
                <CheckCircle2 className="text-emerald-600 w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="text-gray-300 w-4 h-4 flex-shrink-0" />
              )}
              <span className={passwordCriteria.startsWithCapital ? "text-emerald-700 font-medium" : "text-gray-500"}>
                Starts with a capital letter
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordCriteria.hasMinLength ? (
                <CheckCircle2 className="text-emerald-600 w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="text-gray-300 w-4 h-4 flex-shrink-0" />
              )}
              <span className={passwordCriteria.hasMinLength ? "text-emerald-700 font-medium" : "text-gray-500"}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordCriteria.specialCharRegex ? (
                <CheckCircle2 className="text-emerald-600 w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="text-gray-300 w-4 h-4 flex-shrink-0" />
              )}
              <span className={passwordCriteria.specialCharRegex ? "text-emerald-700 font-medium" : "text-gray-500"}>
                Contains at least one special character
              </span>
            </div>
          </div>
        )}

        {/* Confirm password */}
        <FormInput
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Repeat your password"
          rightElement={
            <button
              type="button"
              onClick={toggleShowConfirmPassword}
              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {/* Next Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isCheckingEmail}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCheckingEmail ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Checking email...</span>
              </>
            ) : (
              "Continue to Profile Setup"
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center pt-2">
          By continuing, you agree to ServeSpot’s Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}
