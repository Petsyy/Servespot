import React from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import FormInput from "@/shared/components/ui/FormInput";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

export default function LoginForm({ role = "Volunteer", icon: Icon }) {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    showPassword,
    toggleShowPassword,
  } = useLoginForm(role);

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="text-left sm:text-center mb-7">
        {Icon && (
          <div className="w-12 h-12 sm:mx-auto flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100 shadow-xs">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {role} Sign In
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
          Enter your credentials to access your {role.toLowerCase()} dashboard
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <FormInput
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          icon={<Mail className="w-4 h-4 text-gray-400" />}
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password */}
        <FormInput
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          icon={<Lock className="w-4 h-4 text-gray-400" />}
          rightElement={
            <button
              type="button"
              onClick={toggleShowPassword}
              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Ergonomic Helper Row: Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 hover:text-gray-900 transition-colors group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="font-normal group-hover:text-gray-800">Remember me</span>
          </label>
          <Link
            to={`/${role.toLowerCase()}/forgot-password`}
            className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              `Sign In as ${role}`
            )}
          </button>
        </div>

        {/* Sign Up Footer */}
        <div className="pt-4 text-center border-t border-gray-100 mt-6">
          <p className="text-sm text-gray-500">
            Don’t have a {role.toLowerCase()} account?{" "}
            <Link
              to={`/${role.toLowerCase()}/signup`}
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
