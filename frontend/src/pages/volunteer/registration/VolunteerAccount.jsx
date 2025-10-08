import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../components/ui/Button";
import FormInput from "../../../components/ui/FormInput";
import { Users, Eye, EyeOff } from "lucide-react";

export default function AccountStep({ formData, updateField, onNext }) {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      e.email = "Valid email is required";
    if (formData.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        <div>
          <span className="text-sm text-black">
            Let's complete your profile to get started.
          </span>
        </div>
      );
      onNext();
    }, 1500);
  };

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
        onSubmit={handleNext}
        className="bg-white rounded-xl shadow p-6 space-y-4"
      >
        <div className="w-12 h-12 mx-auto -mt-1 mb-2 rounded-full bg-green-100 flex items-center justify-center">
          <Users className="w-6 h-6 text-green-600" />
        </div>

        <FormInput
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(val) => updateField("fullName", val)}
          error={errors.fullName}
        />

        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(val) => updateField("email", val)}
          error={errors.email}
        />

        {/* Password with toggle */}
        <div className="relative">
          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password (min. 8 characters)"
            value={formData.password}
            onChange={(val) => updateField("password", val)}
            error={errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[35px] text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Confirm password with toggle */}
        <div className="relative">
          <FormInput
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(val) => updateField("confirmPassword", val)}
            error={errors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[35px] text-gray-500 hover:text-gray-700"
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
          loading={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </form>
    </div>
  );
}
