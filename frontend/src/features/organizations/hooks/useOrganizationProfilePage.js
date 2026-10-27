import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSession } from "@/shared/services/api";
import { getCookie, setCookie } from "@/shared/utils/cookies";
import { useOrganizationProfile } from "./useOrganizationProfile";

const INITIAL_ORG_STATE = {
  orgName: "",
  email: "",
  contactPerson: "",
  contactNumber: "",
  region: "",
  regionCode: "",
  province: "",
  provinceCode: "",
  city: "",
  cityCode: "",
  barangay: "",
  barangayCode: "",
  orgType: "",
  description: "",
};

export function useOrganizationProfilePage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [orgId, setOrgId] = useState(() => getCookie("orgId") || "");
  const [org, setOrg] = useState(INITIAL_ORG_STATE);

  const { organization, isLoading, isSaving, updateProfile } = useOrganizationProfile(orgId);

  // Check completion
  const checkProfileCompletion = useCallback((data) => {
    if (!data) return true;
    const isIncomplete =
      !data.orgName ||
      !data.contactPerson ||
      !data.contactNumber ||
      !data.orgType;
    setProfileIncomplete(isIncomplete);
    return isIncomplete;
  }, []);

  // Verify auth session
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getSession();
        if (!active) return;
        if (res.data?.user?.role !== "organization") {
          navigate("/organization/login");
          return;
        }

        const id = res.data?.user?.id;
        if (!id) {
          navigate("/organization/login");
          return;
        }

        setOrgId(id);
        setCookie("orgId", id);
      } catch {
        if (active) navigate("/organization/login");
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Sync loaded profile into editable state
  useEffect(() => {
    if (!organization || Object.keys(organization).length === 0) return;

    setOrg((prev) => ({
      ...prev,
      ...organization,
    }));

    const incomplete = checkProfileCompletion(organization);
    if (incomplete) {
      setIsEditing(true);
      toast.info("Please complete your organization profile to continue.", {
        toastId: "org-incomplete-notice",
        autoClose: 5000,
      });
    }
  }, [organization, checkProfileCompletion]);

  const handleChange = useCallback((name, value) => {
    setOrg((prev) => {
      const next = { ...prev, [name]: value };
      if (["orgName", "contactPerson", "contactNumber", "orgType"].includes(name)) {
        checkProfileCompletion(next);
      }
      return next;
    });
  }, [checkProfileCompletion]);

  const handleLocationChange = useCallback((locationUpdates) => {
    setOrg((prev) => ({
      ...prev,
      ...locationUpdates,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!org.orgName || !org.contactPerson || !org.contactNumber) {
      toast.error(
        "Please fill in all required fields: Organization Name, Contact Person, and Contact Number"
      );
      return;
    }

    try {
      await updateProfile(org);
      setIsEditing(false);
      checkProfileCompletion(org);
    } catch {
      // Toast handled by useOrganizationProfile
    }
  }, [org, updateProfile, checkProfileCompletion]);

  return {
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
    closeSidebar: () => setSidebarOpen(false),
    isEditing,
    setIsEditing,
    saving: isSaving,
    loading: isLoading,
    profileIncomplete,
    org,
    handleChange,
    handleLocationChange,
    handleSave,
  };
}

export default useOrganizationProfilePage;

