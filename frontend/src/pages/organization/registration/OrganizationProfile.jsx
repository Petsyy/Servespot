import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { signupOrganization } from "@/services/api";

const ORG_TYPES = [
  "NGO",
  "School",
  "Community Group",
  "Company",
  "Religious Organization",
  "Government Unit",
];

export default function OrganizationProfileStep({
  formData,
  updateField,
  onPrev,
  onSubmit,
}) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!formData.contactPerson.trim())
      e.contactPerson = "Contact person is required";
    if (!formData.contactNumber.trim())
      e.contactNumber = "Contact number is required";
    if (!formData.city.trim()) e.city = "City is required";
    if (!formData.orgType) e.orgType = "Organization type is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  setIsSubmitting(true);

  try {
    // Call backend signup API
    const res = await signupOrganization(formData);

    // Store session data for auto-login
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("orgId", res.data.orgId);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    toast.success(
      <div>
        <span className="text-sm text-black">
          Organization profile completed successfully!
        </span>
      </div>
    );

    // Redirect directly to dashboard after signup
    setTimeout(() => {
      navigate("/organization/dashboard");
      if (onSubmit) onSubmit();
    }, 1200);
  } catch (error) {
    console.error("Signup failed:", error);
    toast.error(
      <div>
        <span className="text-sm text-black">
          {error.response?.data?.message || "Signup failed. Try again."}
        </span>
      </div>
    );
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="w-2xl max-w-3xl">
      {/* Heading */}
      <div className="text-center mb-6">
        <span className="text-gray-600">Step 2 of 2</span>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Complete Organization Profile
        </h2>
        <p className="text-gray-600">
          Help volunteers learn about your organization and mission
        </p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 md:p-8 space-y-5"
      >
        <div className="w-12 h-12 mx-auto -mt-1 mb-2 rounded-full bg-green-100 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-green-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Contact Person Name"
            type="text"
            placeholder="Enter the main contact person’s name"
            value={formData.contactPerson}
            onChange={(v) => updateField("contactPerson", v)}
            error={errors.contactPerson}
          />

          <FormInput
            label="Contact Number"
            type="number"
            placeholder="Enter your organization's phone number"
            value={formData.contactNumber}
            onChange={(v) => updateField("contactNumber", v)}
            error={errors.contactNumber}
          />

          <FormInput
            label="City"
            type="text"
            placeholder="Enter your city"
            value={formData.city}
            onChange={(v) => updateField("city", v)}
            error={errors.city}
          />

          <FormInput
            label="Address"
            type="text"
            placeholder="Enter your address (optional)"
            value={formData.address}
            onChange={(v) => updateField("address", v)}
          />

          <FormInput
            label="Organization Type"
            type="select"
            options={ORG_TYPES}
            value={formData.orgType}
            onChange={(v) => updateField("orgType", v)}
            error={errors.orgType}
          />
        </div>

        <FormInput
          label="Organization Description / Mission"
          type="textarea"
          placeholder="Describe your organization's mission and activities (optional)"
          value={formData.description}
          onChange={(v) => updateField("description", v)}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrev}>
            Back
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
