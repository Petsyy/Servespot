import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import axios from "axios";
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
    updateField("region", regionCode);
    updateField("province", "");
    updateField("city", "");
    updateField("barangay", "");
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
    updateField("province", provinceCode);
    updateField("city", "");
    updateField("barangay", "");
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
    updateField("city", cityCode);
    updateField("barangay", "");
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
    const e = {};
    if (!formData.contactPerson.trim())
      e.contactPerson = "Contact person is required";
    if (!formData.contactNumber.trim()) {
      e.contactNumber = "Contact number is required";
    } else if (!/^09\d{9}$/.test(formData.contactNumber)) {
      e.contactNumber = "Contact number must start with 09 and be 11 digits";
    }
    if (!formData.region) e.region = "Region is required";
    if (!formData.province) e.province = "Province is required";
    if (!formData.city) e.city = "City/Municipality is required";
    if (!formData.barangay) e.barangay = "Barangay is required";
    if (!formData.orgType) e.orgType = "Organization type is required";
    setErrors(e);
    return Object.keys(e).length === 0;
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

      const { token, orgId, user } = res.data;

      // Save session data for organization dashboard
      localStorage.setItem("orgId", orgId);
      localStorage.setItem("orgToken", token);
      localStorage.setItem("token", token);
      localStorage.setItem("activeRole", "organization");
      localStorage.setItem("user", JSON.stringify(user));

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
            type="text"
            placeholder="Enter your organization's phone number"
            value={formData.contactNumber}
            onChange={(val) => {
              // Allow only numbers and limit to exactly 11 digits
              if (/^\d{0,11}$/.test(val)) {
                updateField("contactNumber", val);
              }
            }}
            error={errors.contactNumber}
          />

          <FormInput
            label="Region"
            type="select"
            options={regions.map((r) => ({ value: r.code, label: r.name }))}
            value={formData.region}
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

          <FormInput
            label="City/Municipality"
            type="select"
            options={cities.map((c) => ({ value: c.code, label: c.name }))}
            value={formData.city}
            onChange={handleCityChange}
            error={errors.city}
            loading={loadingCities}
            placeholder="Select your city/municipality"
            disabled={!formData.province}
          />

          <FormInput
            label="Barangay"
            type="select"
            options={barangays.map((b) => ({ value: b.code, label: b.name }))}
            value={formData.barangay}
            onChange={(v) => updateField("barangay", v)}
            error={errors.barangay}
            loading={loadingBarangays}
            placeholder="Select your barangay"
            disabled={!formData.city}
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

        <FormInput
          label="Upload Verification Document"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.docx" // only allowed types
          onChange={(file) => updateField("document", file)}
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
