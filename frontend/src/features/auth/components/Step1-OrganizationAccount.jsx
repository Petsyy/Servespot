import React from "react";
import FormInput from "@/shared/components/ui/FormInput";
import { Building2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useOrganizationAccountForm } from "@/features/auth/hooks/useOrganizationAccountForm";

export default function OrganizationAccountStep({
  formData,
  updateField,
  onNext,
}) {
  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    showPassword,
    toggleShowPassword,
    showConfirmPassword,
    toggleShowConfirmPassword,
    passwordCriteria,
  } = useOrganizationAccountForm({ formData, updateField, onNext });

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Create Organization Account
        </h2>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          Set up your organization's administrative access and credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormInput
          label="Organization Name"
          placeholder="e.g. Red Cross Youth Chapter"
          error={errors.orgName?.message}
          {...register("orgName")}
        />

        <FormInput
          label="Email Address"
          type="email"
          placeholder="org@example.org"
          error={errors.email?.message}
          {...register("email")}
        />

        <FormInput
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a password (min. 8 characters)"
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

        <FormInput
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Repeat password"
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

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Checking organization...</span>
              </>
            ) : (
              "Continue to Profile Setup"
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center pt-2">
          By registering your organization, you agree to ServeSpot’s Community Terms & Organization Code of Conduct.
        </p>
      </form>
    </div>
  );
}
