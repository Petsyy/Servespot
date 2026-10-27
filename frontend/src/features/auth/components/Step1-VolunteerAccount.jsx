import React from "react";
import Button from "@/shared/components/ui/Button";
import FormInput from "@/shared/components/ui/FormInput";
import { Users, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
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
    <div className="w-auto max-w-lg">
      <div className="text-center mb-6">
        <span className="text-gray-600">Step 1 of 2</span>
        <h2 className="text-2xl font-bold text-gray-900">
          Create Volunteer Account
        </h2>
        <p className="text-gray-600">
          Let's get started with your basic information
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-4"
        noValidate
      >
        <div className="w-12 h-12 mx-auto -mt-1 mb-2 rounded-full bg-green-100 flex items-center justify-center">
          <Users className="w-6 h-6 text-green-600" />
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="First Name"
            placeholder="Enter first name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />

          <FormInput
            label="Last Name"
            placeholder="Enter last name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        {/* Middle Name (Optional) */}
        <FormInput
          label="Middle Name (Optional)"
          placeholder="Enter middle name (optional)"
          error={errors.middleName?.message}
          {...register("middleName")}
        />

        {/* Email */}
        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password field with toggle */}
        <div className="relative">
          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
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

        {/* Confirm password */}
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
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isCheckingEmail}
        >
          {isCheckingEmail ? "Checking..." : "Next"}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}
