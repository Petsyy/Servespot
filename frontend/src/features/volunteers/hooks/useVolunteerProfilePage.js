import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSession } from "@/shared/services/api";
import { setCookie } from "@/shared/utils/cookies";
import { useVolunteerProfile } from "./useVolunteerProfile";

const INITIAL_VOLUNTEER_STATE = {
  fullName: "",
  email: "",
  birthdate: "",
  gender: "",
  contactNumber: "",
  region: "",
  regionCode: "",
  province: "",
  provinceCode: "",
  city: "",
  cityCode: "",
  barangay: "",
  barangayCode: "",
  skills: [],
  interests: [],
  availability: "",
  bio: "",
};

export function useVolunteerProfilePage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [me, setMe] = useState(INITIAL_VOLUNTEER_STATE);

  const {
    profile,
    badgesData,
    isLoading,
    isSaving,
    updateProfile,
  } = useVolunteerProfile();

  // Check profile completion
  const checkProfileCompletion = useCallback((profileData) => {
    if (!profileData) return true;
    const isIncomplete =
      !profileData.fullName ||
      !profileData.contactNumber ||
      !profileData.birthdate;
    setProfileIncomplete(isIncomplete);
    return isIncomplete;
  }, []);

  // Auth session check
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getSession();
        if (!active) return;
        if (res.data?.user?.role !== "volunteer") {
          navigate("/volunteer/login");
          return;
        }

        if (res.data?.user?.id) {
          setCookie("volunteerId", res.data.user.id);
        }
      } catch {
        if (active) navigate("/volunteer/login");
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Sync loaded profile into editable state
  useEffect(() => {
    if (!profile || Object.keys(profile).length === 0) return;

    const formatted = {
      ...profile,
      birthdate: profile.birthdate ? profile.birthdate.slice(0, 10) : "",
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      interests: Array.isArray(profile.interests) ? profile.interests : [],
    };

    setMe((prev) => ({
      ...prev,
      ...formatted,
    }));

    const incomplete = checkProfileCompletion(formatted);
    if (incomplete) {
      setIsEditing(true);
      toast.info("Please complete your volunteer profile to continue.", {
        toastId: "vol-incomplete-notice",
        autoClose: 5000,
      });
    }
  }, [profile, checkProfileCompletion]);

  const handleChange = useCallback((name, value) => {
    setMe((prev) => {
      const next = { ...prev, [name]: value };
      if (["fullName", "contactNumber", "birthdate"].includes(name)) {
        checkProfileCompletion(next);
      }
      return next;
    });
  }, [checkProfileCompletion]);

  const handleLocationChange = useCallback((locationUpdates) => {
    setMe((prev) => ({
      ...prev,
      ...locationUpdates,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!me.fullName || !me.contactNumber || !me.birthdate) {
      toast.error(
        "Please fill in all required fields: Full Name, Contact Number, and Birthdate"
      );
      return;
    }

    try {
      const payload = {
        ...me,
        skills: typeof me.skills === "string" ? me.skills.split(",").map((s) => s.trim()).filter(Boolean) : me.skills,
        interests: typeof me.interests === "string" ? me.interests.split(",").map((s) => s.trim()).filter(Boolean) : me.interests,
      };

      await updateProfile(payload);
      setIsEditing(false);
      checkProfileCompletion(payload);
    } catch {
      // Toast handled by useVolunteerProfile
    }
  }, [me, updateProfile, checkProfileCompletion]);

  return {
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
    closeSidebar: () => setSidebarOpen(false),
    isEditing,
    setIsEditing,
    saving: isSaving,
    loading: isLoading,
    profileIncomplete,
    me,
    badgesData,
    handleChange,
    handleLocationChange,
    handleSave,
  };
}

export default useVolunteerProfilePage;

