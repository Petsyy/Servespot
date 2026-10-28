import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import axios from "axios";
import FormInput from "@/shared/components/ui/FormInput";
import { signupOrganization } from "@/shared/services/api";

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

  // Location states
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Fetch regions on mount with caching
  useEffect(() => {
    const fetchRegions = async () => {
      const cacheKey = 'psgc_regions';
      const cacheTimeKey = 'psgc_regions_time';
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);

      if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < cacheExpiry) {
        setRegions(JSON.parse(cachedData));
        setLoadingRegions(false);
        return;
      }

      try {
        const response = await axios.get("https://psgc.gitlab.io/api/regions/");
        setRegions(response.data);
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
      } catch (error) {
        console.error("Error fetching regions:", error);
        toast.error("Failed to load regions. Please try again.");
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  // Fetch provinces when region is selected with caching
  const handleRegionChange = async (regionCode) => {
    const regionData = regions.find(r => r.code === regionCode);
    updateField("region", regionData ? regionData.name : "");
    updateField("regionCode", regionCode);
    updateField("province", "");
    updateField("provinceCode", "");
    updateField("city", "");
    updateField("cityCode", "");
    updateField("barangay", "");
    updateField("barangayCode", "");
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    if (regionCode) {
      const cacheKey = `psgc_provinces_${regionCode}`;
      const cacheTimeKey = `psgc_provinces_${regionCode}_time`;
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);

      if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < cacheExpiry) {
        setProvinces(JSON.parse(cachedData));
        return;
      }

      setLoadingProvinces(true);
      try {
        const response = await axios.get(`https://psgc.gitlab.io/api/provinces/?region=${regionCode}`);
        setProvinces(response.data);
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast.error("Failed to load provinces. Please try again.");
      } finally {
        setLoadingProvinces(false);
      }
    }
  };

  // Fetch cities when province is selected with caching
  const handleProvinceChange = async (provinceCode) => {
    const provinceData = provinces.find(p => p.code === provinceCode);
    updateField("province", provinceData ? provinceData.name : "");
    updateField("provinceCode", provinceCode);
    updateField("city", "");
    updateField("cityCode", "");
    updateField("barangay", "");
    updateField("barangayCode", "");
    setCities([]);
    setBarangays([]);
    if (provinceCode) {
      const cacheKey = `psgc_cities_${provinceCode}`;
      const cacheTimeKey = `psgc_cities_${provinceCode}_time`;
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);

      if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < cacheExpiry) {
        setCities(JSON.parse(cachedData));
        return;
      }

      setLoadingCities(true);
      try {
        const response = await axios.get(`https://psgc.gitlab.io/api/cities-municipalities/?province=${provinceCode}`);
        setCities(response.data);
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
      } catch (error) {
        console.error("Error fetching cities:", error);
        toast.error("Failed to load cities. Please try again.");
      } finally {
        setLoadingCities(false);
      }
    }
  };

  // Fetch barangays when city is selected with caching
  const handleCityChange = async (cityCode) => {
    const cityData = cities.find(c => c.code === cityCode);
    updateField("city", cityData ? cityData.name : "");
    updateField("cityCode", cityCode);
    updateField("barangay", "");
    updateField("barangayCode", "");
    setBarangays([]);
    if (cityCode) {
      const cacheKey = `psgc_barangays_${cityCode}`;
      const cacheTimeKey = `psgc_barangays_${cityCode}_time`;
      const cacheExpiry = 60 * 60 * 1000; // 1 hour for barangays (shorter due to large data)

      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);

      if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime)) < cacheExpiry) {
        setBarangays(JSON.parse(cachedData));
        return;
      }

      setLoadingBarangays(true);
      try {
        const response = await axios.get(`https://psgc.gitlab.io/api/barangays/?city-municipality=${cityCode}`);
        setBarangays(response.data);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(response.data));
          localStorage.setItem(cacheTimeKey, Date.now().toString());
        } catch (storageError) {
          // If storage quota exceeded, clear old barangay caches and try again
          if (storageError.name === 'QuotaExceededError') {
            console.warn("Storage quota exceeded, clearing old barangay caches");
            // Clear all barangay caches older than 30 minutes
            const keys = Object.keys(localStorage);
            const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
            keys.forEach(key => {
              if (key.startsWith('psgc_barangays_') && key.endsWith('_time')) {
                const time = parseInt(localStorage.getItem(key));
                if (time < thirtyMinutesAgo) {
                  const dataKey = key.replace('_time', '');
                  localStorage.removeItem(dataKey);
                  localStorage.removeItem(key);
                }
              }
            });
            // Try again after cleanup
            try {
              localStorage.setItem(cacheKey, JSON.stringify(response.data));
              localStorage.setItem(cacheTimeKey, Date.now().toString());
            } catch (retryError) {
              console.warn("Storage still full after cleanup, skipping cache for this request");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching barangays:", error);
        toast.error("Failed to load barangays. Please try again.");
      } finally {
        setLoadingBarangays(false);
      }
    }
  };

  const validate = () => {
    const result = organizationProfileSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    }
    const e = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field && !e[field]) {
        e[field] = issue.message;
      }
    });
    setErrors(e);
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // 1Call backend signup API
      const form = new FormData();
      for (const key in formData) {
        form.append(key, formData[key]);
      }
      const res = await signupOrganization(form);

      const { orgId, user, token } = res.data;

      if (token) {
        localStorage.setItem("token", token);
        setCookie("authToken", token);
      }

      // Save session data for organization dashboard
      setCookie("orgId", orgId);
      setCookie("role", "organization");
      if (user?.orgName || user?.name) {
        setCookie("orgName", user.orgName || user.name);
      }

      // Notify and redirect
      toast.success(
        <div>
          <span className="text-sm text-black">
            Welcome, {user.orgName || "Organization"}! Profile completed
            successfully.
          </span>
        </div>
      );

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
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-100">
          <Building2 className="w-3.5 h-3.5" />
          <span>Step 2 of 2 • Organization Profile</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Complete Organization Profile
        </h2>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          Help volunteers learn about your organization's mission and operations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Contact & Type */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
            1. Contact & Classification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Contact Person Name"
              type="text"
              placeholder="e.g. Juan Dela Cruz"
              value={formData.contactPerson}
              onChange={(v) => updateField("contactPerson", v)}
              error={errors.contactPerson}
            />

            <FormInput
              label="Contact Number"
              type="text"
              placeholder="e.g. 09171234567"
              value={formData.contactNumber}
              onChange={(val) => {
                if (/^\d{0,11}$/.test(val)) {
                  updateField("contactNumber", val);
                }
              }}
              error={errors.contactNumber}
            />
          </div>

          <FormInput
            label="Organization Type"
            type="select"
            options={ORG_TYPES}
            value={formData.orgType}
            onChange={(v) => updateField("orgType", v)}
            error={errors.orgType}
          />
        </div>

        {/* Section 2: Location */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
            2. Headquarters Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Region"
              type="select"
              options={regions.map((r) => ({ value: r.code, label: r.name }))}
              value={formData.regionCode}
              onChange={handleRegionChange}
              error={errors.region}
              loading={loadingRegions}
              placeholder="Select your region"
            />

            <FormInput
              label="Province"
              type="select"
              options={provinces.map((p) => ({ value: p.code, label: p.name }))}
              value={formData.province}
              onChange={handleProvinceChange}
              error={errors.province}
              loading={loadingProvinces}
              placeholder="Select your province"
              disabled={!formData.region}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="City / Municipality"
              type="select"
              options={cities.map((c) => ({ value: c.code, label: c.name }))}
              value={formData.cityCode}
              onChange={handleCityChange}
              error={errors.city}
              loading={loadingCities}
              placeholder="Select your city/municipality"
              disabled={!formData.provinceCode}
            />

            <FormInput
              label="Barangay"
              type="select"
              options={barangays.map((b) => ({ value: b.code, label: b.name }))}
              value={formData.barangayCode}
              onChange={(v) => {
                const barangayData = barangays.find(b => b.code === v);
                updateField("barangay", barangayData ? barangayData.name : "");
                updateField("barangayCode", v);
              }}
              error={errors.barangay}
              loading={loadingBarangays}
              placeholder="Select your barangay"
              disabled={!formData.cityCode}
            />
          </div>

          <FormInput
            label="Address / Street (Optional)"
            type="text"
            placeholder="e.g. Unit 401, Building Name, Street"
            value={formData.address}
            onChange={(v) => updateField("address", v)}
          />
        </div>

        {/* Section 3: Mission & Verification */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
            3. Mission & Verification
          </h3>

          <FormInput
            label="Organization Description / Mission"
            type="textarea"
            placeholder="Describe your organization's mission, causes, and activities..."
            value={formData.description}
            onChange={(v) => updateField("description", v)}
          />

          <FormInput
            label="Upload Verification Document (SEC, DTI, or Certificate)"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.docx"
            onChange={(file) => updateField("document", file)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onPrev}
            disabled={isSubmitting}
            className="py-3 px-5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 transition-all duration-150 cursor-pointer"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Completing registration...</span>
              </>
            ) : (
              "Complete Registration"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
