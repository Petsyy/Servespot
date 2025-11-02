import { useState } from "react";
import Button from "../../../components/ui/Button";
import FormInput from "../../../components/ui/FormInput";
import CheckboxGroup from "../../../components/ui/CheckboxGroup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { signupVolunteer, loginVolunteer } from "../../../services/api";
import { Users } from "lucide-react";

const skillsOptions = [
  "Event Organizing",
  "Community Outreach",
  "Public Speaking",
  "Teaching & Tutoring",
  "Health Assistance",
  "Disaster Response",
  "Environmental Cleanup",
  "Graphic Design",
  "Social Media Management",
  "Cooking & Meal Prep",
  "First Aid & CPR",
  "Construction & Repair",
  "Child Care",
  "Gardening",
  "Translation & Interpretation",
  "Photography & Documentation",
  "Data Entry & Tech Support",
];

const interestsOptions = [
  "Environmental Conservation",
  "Disaster Relief",
  "Health & Wellness",
  "Education & Literacy",
  "Child & Youth Development",
  "Animal Welfare",
  "Community Development",
  "Arts & Culture",
  "Human Rights",
  "Mental Health Advocacy",
  "Public Safety & Awareness",
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

  // limit how many skills/interests can be selected
  const MAX_SELECTION = 5;

  const validateForm = () => {
    let newErrors = {};

    // Birthdate validation
    if (!formData.birthdate) newErrors.birthdate = "Birthdate is required";
    else {
      const bd = new Date(formData.birthdate);
      if (Number.isNaN(bd.getTime())) {
        newErrors.birthdate = "Please provide a valid birthdate";
      } else {
        const today = new Date();
        let age = today.getFullYear() - bd.getFullYear();
        const m = today.getMonth() - bd.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age -= 1;
        if (age < 18)
          newErrors.birthdate = "You must be 18 or older to sign up";
      }
    }

    // Gender (removed "Other" option)
    if (!formData.gender) newErrors.gender = "Gender is required";

    // City and Address
    if (!formData.city || formData.city.trim() === "")
      newErrors.city = "City is required";
    if (!formData.address || formData.address.trim() === "")
      newErrors.address = "Address is required";

    if (!formData.contact) {
      newErrors.contact = "Contact number is required";
    } else if (!/^09\d{9}$/.test(formData.contact)) {
      newErrors.contact = "Contact number must start with 09 and be 11 digits";
    }

    // Skills limit
    if (!formData.skills || formData.skills.length === 0)
      newErrors.skills = "Please select at least one skill";
    else if (formData.skills.length > MAX_SELECTION)
      newErrors.skills = `You can select up to ${MAX_SELECTION} skills only`;

    // Interests limit
    if (!formData.interests || formData.interests.length === 0)
      newErrors.interests = "Please select at least one interest";
    else if (formData.interests.length > MAX_SELECTION)
      newErrors.interests = `You can select up to ${MAX_SELECTION} interests only`;

    // Availability required
    if (!formData.availability)
      newErrors.availability = "Availability is required";

    // Bio (optional — no validation)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckboxChange = (field, value) => {
    const updated = formData[field].includes(value)
      ? formData[field].filter((v) => v !== value)
      : [...formData[field], value];

    if (updated.length <= 5) {
      updateField(field, updated);
    } else {
      toast.warning(`You can only select up to ${MAX_SELECTION} ${field}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please complete the required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const signupData = {
        ...formData,
        contactNumber: formData.contact,
      };
      await signupVolunteer(signupData);

      const loginRes = await loginVolunteer({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("volToken", loginRes.data.token);
      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("volunteerId", loginRes.data.user.id);
      localStorage.setItem("volUser", JSON.stringify(loginRes.data.user));
      localStorage.setItem("activeRole", "volunteer");

      const volunteerName = loginRes.data.user?.fullName || "Volunteer";
      localStorage.setItem("volunteerName", volunteerName);

      const { registerUserSocket } = await import("@/utils/socket");
      registerUserSocket(loginRes.data.user.id, "volunteer");

      toast.success(
        <div>
          <span className="text-sm text-black">Welcome, {volunteerName}!</span>
        </div>
      );

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
        className="bg-white rounded-xl shadow p-6 w-full space-y-4"
      >
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
              options={["Male", "Female"]}
              value={formData.gender}
              onChange={(val) => updateField("gender", val)}
            />
            {errors.gender && (
              <p className="text-red-500 text-sm">{errors.gender}</p>
            )}
          </div>
        </div>

        {/* Contact Number */}
        <div>
          <FormInput
            label="Contact Number"
            type="text"
            value={formData.contact}
            onChange={(val) => {
              // Allow only numbers and limit to exactly 11 digits
              if (/^\d{0,11}$/.test(val)) {
                updateField("contact", val);
              }
            }}
          />
          {errors.contact && (
            <p className="text-red-500 text-sm">{errors.contact}</p>
          )}
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
              error={errors.city}
            />
          </div>
          <div>
            <FormInput
              label="Address"
              type="text"
              placeholder="Enter your address"
              value={formData.address}
              onChange={(val) => updateField("address", val)}
              error={errors.address}
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <CheckboxGroup
            label={`Skills & Expertise (max ${MAX_SELECTION})`}
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
            label={`Interests & Causes (max ${MAX_SELECTION})`}
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
            options={[
              "Monday, Tuesday, Wednesday, Thursday, Friday",
              "Saturday, Sunday",
            ]}
            value={formData.availability}
            onChange={(val) => updateField("availability", val)}
            error={errors.availability}
          />
        </div>

        {/* Bio (optional) */}
        <div>
          <FormInput
            label="Bio & Motivation (Optional)"
            type="textarea"
            placeholder="Tell us about yourself (optional)"
            value={formData.bio}
            onChange={(val) => updateField("bio", val)}
          />
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
