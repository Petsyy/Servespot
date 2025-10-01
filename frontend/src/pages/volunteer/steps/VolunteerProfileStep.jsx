import { useState } from "react";
import Button from "../../../components/ui/Button";
import FormInput from "../../../components/ui/FormInput";
import CheckboxGroup from "../../../components/ui/CheckboxGroup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { signupVolunteer } from "../../../services/api";

const skillsOptions = [
  "Tutoring",
  "First Aid",
  "Translation",
  "Marketing",
  "Graphic Design",
  "Cooking",
  "Photography",
  "Fundraising",
];
const interestsOptions = [
  "Environment",
  "Disaster Relief",
  "Children & Youth",
  "Health & Wellness",
  "Education",
  "Elderly Care",
  "Animal Welfare",
  "Community Development",
];

export default function ProfileStep({
  formData,
  updateField,
  onPrev,
  onSubmit,
}) {
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Only validate the 4 required fields
  const validateForm = () => {
    let newErrors = {};

    if (!formData.skills || formData.skills.length === 0) {
      newErrors.skills = "Please select at least one skill";
    }

    if (!formData.interests || formData.interests.length === 0) {
      newErrors.interests = "Please select at least one interest";
    }

    if (!formData.availability) {
      newErrors.availability = "Availability is required";
    }

    if (!formData.bio || formData.bio.trim() === "") {
      newErrors.bio = "Bio & Motivation is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckboxChange = (field, value) => {
    updateField(
      field,
      formData[field].includes(value)
        ? formData[field].filter((v) => v !== value)
        : [...formData[field], value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please complete the required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await signupVolunteer(formData);
      toast.success(
        <div>
          <span className="text-sm text-black">
            Volunteer profile completed successfully!
          </span>
        </div>
      );

      setTimeout(() => {
        navigate("/volunteer/login");
        if (onSubmit) onSubmit();
      }, 1500);
    } catch (error) {
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
    <div className="w-full max-w-3xl">
      <div className="text-center mb-6">
        <span className="text-gray-600"> Step 2 of 2</span>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Complete Volunteer Profile
        </h2>
        <p className="text-gray-600">
          Tell us more about yourself so we can match you with the right
          opportunities.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 w-full max-w-3xl space-y-4"
      >
        <h2 className="text-xl font-bold text-center mb-4">
          Complete Your Profile
        </h2>

        {/* Skills */}
        <div>
          <CheckboxGroup
            label="Skills & Expertise"
            options={skillsOptions}
            selected={formData.skills}
            onChange={(val) => handleCheckboxChange("skills", val)}
          />
          {errors.skills && (
            <p className="text-red-500 text-sm">{errors.skills}</p>
          )}
        </div>

        {/* Interests */}
        <div>
          <CheckboxGroup
            label="Interests & Causes"
            options={interestsOptions}
            selected={formData.interests}
            onChange={(val) => handleCheckboxChange("interests", val)}
          />
          {errors.interests && (
            <p className="text-red-500 text-sm">{errors.interests}</p>
          )}
        </div>

        {/* Availability */}
        <div>
          <FormInput
            label="Availability"
            type="select"
            options={["Weekdays", "Weekends", "Evenings"]}
            value={formData.availability}
            onChange={(val) => updateField("availability", val)}
          />
          {errors.availability && (
            <p className="text-red-500 text-sm">{errors.availability}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <FormInput
            label="Bio & Motivation"
            type="textarea"
            placeholder="Tell us about yourself and why you want to volunteer"
            value={formData.bio}
            onChange={(val) => updateField("bio", val)}
          />
          {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
        </div>

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
