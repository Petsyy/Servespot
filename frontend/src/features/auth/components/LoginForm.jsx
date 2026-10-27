import React from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/shared/components/ui/Button";
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
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-6">
        {Icon && (
          <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-green-100 mb-3">
            <Icon className="w-6 h-6 text-green-600" />
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600">
          Sign in to your {role.toLowerCase()} account
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-5"
        noValidate
      >
        <div className="flex flex-col items-center text-center mb-4">
          <h3 className="font-semibold text-lg">{role} Login</h3>
          <p className="text-gray-500 text-sm">
            Enter your credentials to access your {role.toLowerCase()} dashboard
          </p>
        </div>

        {/* Email */}
        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          icon={<Mail className="w-4 h-4 text-gray-400" />}
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password */}
        <div className="relative">
          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            icon={<Lock className="w-4 h-4 text-gray-400" />}
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-[35px] text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>

        {/* Links */}
        <div className="flex justify-center text-sm">
          <Link
            to={`/${role.toLowerCase()}/forgot-password`}
            className="text-green-600 hover:underline flex"
          >
            Forgot password?
          </Link>
        </div>

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link
            to={`/${role.toLowerCase()}/signup`}
            className="text-green-600 hover:underline"
          >
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}
