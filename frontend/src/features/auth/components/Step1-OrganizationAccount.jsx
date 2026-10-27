import React from "react";
import Button from "@/shared/components/ui/Button";
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
    <div className="w-auto max-w-lg">
      {/* Heading */}
      <div className="text-center mb-6">
        <span className="text-gray-600">Step 1 of 2</span>
        <h2 className="text-2xl font-bold text-gray-900">
          Create Organization Account
        </h2>
        <p className="text-gray-600">
          Join our network to connect with passionate volunteers
        </p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-4"
        noValidate
      >
        <div className="w-12 h-12 mx-auto -mt-1 mb-2 rounded-full bg-green-100 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-green-600" />
        </div>

        <FormInput
          label="Organization Name"
          placeholder="Enter your organization name"
          error={errors.orgName?.message}
          {...register("orgName")}
        />

        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter organization email"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password with toggle */}
        <div className="relative">
          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password (min. 8 characters)"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-[35px] text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password Checklist */}
        {passwordCriteria.hasValue && (
          <div className="text-sm mt-1 space-y-1 ml-1">
            <div className="flex items-center gap-1">
              {passwordCriteria.startsWithCapital ? (
                <CheckCircle2 className="text-green-600 w-4 h-4" />
              ) : (
                <XCircle className="text-red-500 w-4 h-4" />
              )}
              <span>Starts with a capital letter</span>
            </div>
            <div className="flex items-center gap-1">
              {passwordCriteria.hasMinLength ? (
                <CheckCircle2 className="text-green-600 w-4 h-4" />
              ) : (
                <XCircle className="text-red-500 w-4 h-4" />
              )}
              <span>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-1">
              {passwordCriteria.specialCharRegex ? (
                <CheckCircle2 className="text-green-600 w-4 h-4" />
              ) : (
                <XCircle className="text-red-500 w-4 h-4" />
              )}
              <span>Contains a special character</span>
            </div>
          </div>
        )}

        {/* Confirm Password with toggle */}
        <div className="relative">
          <FormInput
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={toggleShowConfirmPassword}
            className="absolute right-3 top-[35px] text-gray-500 hover:text-gray-700"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}
