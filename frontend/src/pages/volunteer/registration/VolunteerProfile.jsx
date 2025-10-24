import { useState } from "react";
import Button from "../../../components/ui/Button";
import FormInput from "../../../components/ui/FormInput";
import CheckboxGroup from "../../../components/ui/CheckboxGroup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { signupVolunteer, loginVolunteer } from "../../../services/api";
import { Users } from "lucide-react";
import { skillsOptions } from "@/constants/skills";
import { normalizeSkills } from "@/utils/skills";

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

  const validateForm = () => {
    let newErrors = {};
    if (!formData.birthdate) newErrors.birthdate = "Birthdate is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.city || formData.city.trim() === "")
      newErrors.city = "City is required";
    if (!formData.address || formData.address.trim() === "")
      newErrors.address = "Address is required";
    if (!formData.skills || formData.skills.length === 0)
      newErrors.skills = "Please select at least one skill";
    if (!formData.interests || formData.interests.length === 0)
      newErrors.interests = "Please select at least one interest";
    if (!formData.availability)
      newErrors.availability = "Availability is required";
    if (!formData.bio || formData.bio.trim() === "")
      newErrors.bio = "Bio & Motivation is required";

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
    // Normalize skills before submitting
    const payload = { ...formData, skills: normalizeSkills(formData.skills) };

    // 1️Sign up first
    await signupVolunteer(payload);

    // Automatically log in using same credentials
    const loginRes = await loginVolunteer({
      email: formData.email,
      password: formData.password,
    });

    // Save token and volunteer ID to localStorage
    localStorage.setItem("token", loginRes.data.token);
    localStorage.setItem("volunteerId", loginRes.data.user.id);

    // fixed: reference correct field from backend
    toast.success(
      <div>
        <span className="text-sm text-black">
          Welcome, {loginRes.data.user.fullName || "Volunteer"}!
        </span>
      </div>
    );

    // 4️Redirect to volunteer homepage
    setTimeout(() => {
      navigate("/volunteer/homepage");
      if (onSubmit) onSubmit();
    }, 1500);
  } catch (error) {
    console.error("Signup/Login error:", error);
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
      {/* Header */}
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

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 w-full space-y-4"
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
        </div>

        {/* Birthdate + Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormInput
              label="Birthdate"
              type="date"
              value={formData.birthdate}
              onChange={(val) => updateField("birthdate", val)}
            />
            {errors.birthdate && (
              <p className="text-red-500 text-sm">{errors.birthdate}</p>
            )}
          </div>
          <div>
            <FormInput
              label="Gender"
              type="select"
              options={["Male", "Female", "Other"]}
              value={formData.gender}
              onChange={(val) => updateField("gender", val)}
            />
            {errors.gender && (
              <p className="text-red-500 text-sm">{errors.gender}</p>
            )}
          </div>
        </div>

        {/* City + Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormInput
              label="City"
              type="text"
              placeholder="Enter your city"
              value={formData.city}
              onChange={(val) => updateField("city", val)}
            />
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
          </div>
          <div>
            <FormInput
              label="Address"
              type="text"
              placeholder="Enter your address"
              value={formData.address}
              onChange={(val) => updateField("address", val)}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>
        </div>

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
            options={["Weekdays", "Weekends"]}
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

        {/* Buttons */}
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
