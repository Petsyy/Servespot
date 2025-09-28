import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import FormInput from "../../../components/ui/FormInput";
import { Building2 } from "lucide-react";
import { toast } from "react-toastify";

export default function OrgAccountStep({ formData, updateField, onNext }) {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.orgName.trim()) e.orgName = "Organization name is required";
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
    <div className="w-full max-w-lg">
      {/* Heading outside the card */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create Organization Account
        </h2>
        <p className="text-gray-600">
          Join our network to connect with passionate volunteers
        </p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleNext}
        className="bg-white rounded-xl shadow p-6 space-y-4"
      >
        <div className="w-12 h-12 mx-auto -mt-1 mb-2 rounded-full bg-green-100 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-green-600" />
        </div>

        <FormInput
          label="Organization Name"
          placeholder="Enter your organization name"
          value={formData.orgName}
          onChange={(v) => updateField("orgName", v)}
          error={errors.orgName}
        />

        <FormInput
          label="Email Address"
          type="email"
          placeholder="Enter organization email"
          value={formData.email}
          onChange={(v) => updateField("email", v)}
          error={errors.email}
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="Create a password (min. 8 characters)"
          value={formData.password}
          onChange={(v) => updateField("password", v)}
          error={errors.password}
        />

        <FormInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(v) => updateField("confirmPassword", v)}
          error={errors.confirmPassword}
        />

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
