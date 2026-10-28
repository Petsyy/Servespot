import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signupVolunteer, loginVolunteer } from "@/shared/services/api";
import { useAuth } from "@/shared/context/AuthContext";
import { useLocationSelector } from "@/shared/hooks/useLocationSelector";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { validateVolunteerProfile } from "@/features/volunteers/utils/volunteerValidation";
import { MAX_SELECTION } from "@/features/volunteers/constants/volunteerOptions";

export function useVolunteerProfileStep({
  formData,
  updateField,
  onPrev,
  onSubmit,
}) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] =
    useState(false);

  const availabilityDropdownRef = useClickOutside(() => {
    setShowAvailabilityDropdown(false);
  });

  const location = useLocationSelector({ formData, updateField });

  const handleCheckboxChange = (field, value) => {
    const current = Array.isArray(formData[field]) ? formData[field] : [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    if (updated.length <= MAX_SELECTION) {
      updateField(field, updated);
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    } else {
      toast.warning(`You can only select up to ${MAX_SELECTION} ${field}.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } =
      validateVolunteerProfile(formData);
    if (!isValid) {
      setErrors(validationErrors);
      toast.error("Please complete the required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const signupPayload = {
        ...formData,
        contactNumber: formData.contact,
      };

      await signupVolunteer(signupPayload);

      const loginRes = await loginVolunteer({
        email: formData.email,
        password: formData.password,
      });

      const token = loginRes.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        setCookie("authToken", token);
      }

      const user = loginRes.data?.user;
      if (user) {
        login(user, "volunteer", token);
      }

      const welcomeName = user?.firstName || user?.fullName || "Volunteer";
      toast.success(`Welcome, ${welcomeName}! Profile created successfully.`);

      navigate("/volunteer/homepage");
      if (onSubmit) onSubmit();
    } catch (err) {
      console.error("Signup error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Signup failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    errors,
    isSubmitting,
    location,
    showAvailabilityDropdown,
    setShowAvailabilityDropdown,
    availabilityDropdownRef,
    handleCheckboxChange,
    handleSubmit,
    onPrev,
  };
}

export default useVolunteerProfileStep;
