import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Mail,
  User,
  Phone,
  MapPin,
  Home,
  FileText,
  Check,
  X,
  Pencil,
  AlertCircle,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  getOrganizationById,
  updateOrganization,
} from "@/services/organization.api";
import OrgSidebar from "@/components/layout/sidebars/OrgSidebar";
import OrganizationNavbar from "@/components/layout/navbars/OrganizationNavbar";

const ORG_TYPES = [
  { value: "Non-profit", label: "Non-profit" },
  { value: "NGO", label: "NGO" },
  { value: "School / University", label: "School / University" },
  { value: "Company", label: "Company" },
  { value: "Government", label: "Government" },
  { value: "Community Group", label: "Community Group" },
  { value: "Other", label: "Other" },
];

export default function OrganizationProfile() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  const orgId = localStorage.getItem("orgId");

  const [org, setOrg] = useState({
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
    address: "",
    orgType: "",
    description: "",
  });

  // Location states
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Check if profile is incomplete
  const checkProfileCompletion = (orgData) => {
    const requiredFields = [
      "orgName",
      "contactPerson",
      "contactNumber",
      "orgType",
    ];
    const isIncomplete =
      requiredFields.some((field) => !orgData[field]) ||
      !orgData.orgName ||
      !orgData.contactPerson ||
      !orgData.contactNumber;
    setProfileIncomplete(isIncomplete);
    return isIncomplete;
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const res = await axios.get("https://psgc.gitlab.io/api/regions.json");
        const formatted = res.data.map((r) => ({
          code: r.code || r.regionCode,
          name: r.name || r.regionName,
        }));
        setRegions(formatted);
      } catch (error) {
        console.error("Error fetching regions:", error);
        toast.error("Failed to load regions.");
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  // Load organization data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getOrganizationById(orgId);
        const orgData = res.data || {};
        setOrg(orgData);

        checkProfileCompletion(orgData);

        if (checkProfileCompletion(orgData)) {
          setIsEditing(true);
          toast.info("Please complete your organization profile to continue.", {
            autoClose: false,
            closeOnClick: false,
          });
        }
      } catch (err) {
        console.error("❌ Failed to load organization profile:", err);
        toast.error("Failed to load organization profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [orgId]);

  useEffect(() => {
    const hydrateLocations = async () => {
      if (!org.orgName || loadingRegions) return;

      try {
        if (org.region && !org.regionCode) {
          const matchedRegion = regions.find((r) => r.name === org.region);
          if (matchedRegion) {
            setOrg((prev) => ({ ...prev, regionCode: matchedRegion.code }));

            // Fetch provinces for this region
            setLoadingProvinces(true);
            try {
              const res = await axios.get(
                `https://psgc.gitlab.io/api/regions/${matchedRegion.code}/provinces.json`
              );
              const formatted = res.data.map((p) => ({
                code: p.code || p.provinceCode,
                name: p.name || p.provinceName,
              }));
              setProvinces(formatted);

              // If we have province name but no code, find the matching province
              if (org.province && !org.provinceCode) {
                const matchedProvince = formatted.find(
                  (p) => p.name === org.province
                );
                if (matchedProvince) {
                  setOrg((prev) => ({
                    ...prev,
                    provinceCode: matchedProvince.code,
                  }));

                  // Fetch cities for this province
                  setLoadingCities(true);
                  try {
                    const cityRes = await axios.get(
                      `https://psgc.gitlab.io/api/provinces/${matchedProvince.code}/cities-municipalities.json`
                    );
                    const cityFormatted = cityRes.data.map((c) => ({
                      code: c.code || c.cityCode || c.municipalityCode,
                      name: c.name || c.cityName || c.municipalityName,
                    }));
                    setCities(cityFormatted);

                    // If we have city name but no code, find the matching city
                    if (org.city && !org.cityCode) {
                      const matchedCity = cityFormatted.find(
                        (c) => c.name === org.city
                      );
                      if (matchedCity) {
                        setOrg((prev) => ({
                          ...prev,
                          cityCode: matchedCity.code,
                        }));

                        // Fetch barangays for this city
                        setLoadingBarangays(true);
                        try {
                          const brgyRes = await axios.get(
                            `https://psgc.gitlab.io/api/cities-municipalities/${matchedCity.code}/barangays.json`
                          );
                          const brgyFormatted = brgyRes.data.map((b) => ({
                            code: b.code || b.barangayCode,
                            name: b.name || b.barangayName,
                          }));
                          setBarangays(brgyFormatted);

                          // If we have barangay name but no code, find the matching barangay
                          if (org.barangay && !org.barangayCode) {
                            const matchedBarangay = brgyFormatted.find(
                              (b) => b.name === org.barangay
                            );
                            if (matchedBarangay) {
                              setOrg((prev) => ({
                                ...prev,
                                barangayCode: matchedBarangay.code,
                              }));
                            }
                          }
                        } catch (error) {
                          console.error("Error fetching barangays:", error);
                        } finally {
                          setLoadingBarangays(false);
                        }
                      }
                    }
                  } catch (error) {
                    console.error("Error fetching cities:", error);
                  } finally {
                    setLoadingCities(false);
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching provinces:", error);
            } finally {
              setLoadingProvinces(false);
            }
          }
        }
      } catch (err) {
        console.error("Hydrate locations failed:", err);
      }
    };

    if (regions.length > 0 && org.orgName) {
      hydrateLocations();
    }
  }, [org, regions, loadingRegions]);

  const initials = useMemo(() => {
    const n = org.orgName?.trim();
    if (!n) return "OR";
    const parts = n.split(" ");
    return (parts[0]?.[0] + (parts[1]?.[0] || "")).toUpperCase();
  }, [org.orgName]);

  const handleChange = (name, value) => {
    setOrg((prev) => ({ ...prev, [name]: value }));

    // Re-check profile completion when important fields change
    if (
      ["orgName", "contactPerson", "contactNumber", "orgType"].includes(name)
    ) {
      setTimeout(() => checkProfileCompletion({ ...org, [name]: value }), 100);
    }
  };

  // Handle region change
  const handleRegionChange = async (regionCode) => {
    if (!regionCode) return;

    const regionData = regions.find((r) => r.code === regionCode);
    if (!regionData) return;

    // Update both display name and code
    setOrg((prev) => ({
      ...prev,
      region: regionData.name,
      regionCode: regionData.code,
      province: "",
      provinceCode: "",
      city: "",
      cityCode: "",
      barangay: "",
      barangayCode: "",
    }));

    setProvinces([]);
    setCities([]);
    setBarangays([]);

    setLoadingProvinces(true);
    try {
      const res = await axios.get(
        `https://psgc.gitlab.io/api/regions/${regionData.code}/provinces.json`
      );
      const formatted = res.data.map((p) => ({
        code: p.code || p.provinceCode,
        name: p.name || p.provinceName,
      }));
      setProvinces(formatted);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      toast.error("Failed to load provinces.");
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Handle province change
  const handleProvinceChange = async (provinceCode) => {
    if (!provinceCode) return;

    const provinceData = provinces.find((p) => p.code === provinceCode);
    if (!provinceData) return;

    setOrg((prev) => ({
      ...prev,
      province: provinceData.name,
      provinceCode: provinceData.code,
      city: "",
      cityCode: "",
      barangay: "",
      barangayCode: "",
    }));

    setCities([]);
    setBarangays([]);

    setLoadingCities(true);
    try {
      const res = await axios.get(
        `https://psgc.gitlab.io/api/provinces/${provinceData.code}/cities-municipalities.json`
      );
      const formatted = res.data.map((c) => ({
        code: c.code || c.cityCode || c.municipalityCode,
        name: c.name || c.cityName || c.municipalityName,
      }));
      setCities(formatted);
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to load cities.");
    } finally {
      setLoadingCities(false);
    }
  };

  // Handle city/municipality change
  const handleCityChange = async (cityCode) => {
    if (!cityCode) return;

    const cityData = cities.find((c) => c.code === cityCode);
    if (!cityData) return;

    setOrg((prev) => ({
      ...prev,
      city: cityData.name,
      cityCode: cityData.code,
      barangay: "",
      barangayCode: "",
    }));

    setBarangays([]);

    setLoadingBarangays(true);
    try {
      const res = await axios.get(
        `https://psgc.gitlab.io/api/cities-municipalities/${cityData.code}/barangays.json`
      );
      const formatted = res.data.map((b) => ({
        code: b.code || b.barangayCode,
        name: b.name || b.barangayName,
      }));
      setBarangays(formatted);
    } catch (error) {
      console.error("Error fetching barangays:", error);
      toast.error("Failed to load barangays.");
    } finally {
      setLoadingBarangays(false);
    }
  };

  // Handle barangay change
  const handleBarangayChange = (barangayCode) => {
    if (!barangayCode) return;

    const barangayData = barangays.find((b) => b.code === barangayCode);
    if (!barangayData) return;

    setOrg((prev) => ({
      ...prev,
      barangay: barangayData.name,
      barangayCode: barangayData.code,
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!org.orgName || !org.contactPerson || !org.contactNumber) {
      toast.error(
        "Please fill in all required fields: Organization Name, Contact Person, and Contact Number"
      );
      return;
    }

    try {
      setSaving(true);
      await updateOrganization(orgId, org);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setProfileIncomplete(false);
    } catch (err) {
      console.error("❌ Update failed:", err);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetupProfile = () => {
    setIsEditing(true);
    toast.info("Please complete your organization profile setup.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Organization Sidebar */}
      <OrgSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Organization Navbar */}
        <OrganizationNavbar onToggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* 🔹 Header */}
            <div className="flex flex-wrap items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Organization Profile
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Manage your organization's information and public details.
                  </p>
                </div>
              </div>

              {profileIncomplete && !isEditing ? (
                <button
                  onClick={handleSetupProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shadow-sm hover:shadow-md"
                >
                  <Plus size={18} /> Setup Profile
                </button>
              ) : !isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm hover:shadow-md"
                >
                  <Pencil size={18} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 shadow-sm hover:shadow-md transition"
                  >
                    <Check size={18} /> {saving ? "Saving..." : "Save Profile"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      if (profileIncomplete) {
                        toast.info(
                          "Please complete your profile setup to access all features."
                        );
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    <X size={18} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {/* 🔹 Profile Setup Alert */}
            {profileIncomplete && (
              <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-orange-500" size={24} />
                  <div>
                    <h3 className="font-semibold text-orange-800">
                      Profile Setup Required
                    </h3>
                    <p className="text-orange-700 text-sm">
                      Please complete your organization profile to access all
                      features. Required fields: Organization Name, Contact
                      Person, and Contact Number.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 🔹 Organization Profile Card */}
            <div className="bg-white rounded-xl border border-green-200 p-6 flex items-center gap-5 mb-8 shadow-sm hover:shadow-md transition-shadow">
              {/* Logo / Avatar */}
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-2xl font-bold shadow-md">
                {initials}
              </div>

              {/* Info Section */}
              <div className="flex flex-col gap-1">
                {/* Company Name */}
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 size={18} className="text-green-600" />
                  {org.orgName || "No organization name set"}
                </h2>
                <p className="text-sm text-gray-600">
                  {org.orgType || "Organization type not specified"}
                </p>

                {/* Info Row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-3 text-gray-700 text-sm">
                  {org.city ? (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} className="text-green-600" />
                      <span>{org.city}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={16} />
                      <span>Location not set</span>
                    </div>
                  )}

                  {org.contactPerson ? (
                    <div className="flex items-center gap-1">
                      <User size={16} className="text-green-600" />
                      <span>{org.contactPerson}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500">
                      <User size={16} />
                      <span>Contact person not set</span>
                    </div>
                  )}

                  {org.email ? (
                    <div className="flex items-center gap-1">
                      <Mail size={16} className="text-green-600" />
                      <span>{org.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Mail size={16} />
                      <span>Email not set</span>
                    </div>
                  )}
                </div>

                {/* Profile Status */}
                {profileIncomplete && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      <AlertCircle size={12} />
                      Setup Incomplete
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 🔹 Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT: About Section */}
              <div className="lg:col-span-1 space-y-6">
                <Section
                  title="About Organization"
                  icon={<FileText size={18} />}
                >
                  <TextArea
                    label="Description"
                    name="description"
                    value={org.description}
                    editable={isEditing}
                    onChange={(v) => handleChange("description", v)}
                    placeholder="Tell us about your organization..."
                  />
                  <SelectField
                    label="Organization Type *"
                    name="orgType"
                    value={org.orgType}
                    editable={isEditing}
                    options={ORG_TYPES}
                    onChange={(v) => handleChange("orgType", v)}
                    required={profileIncomplete}
                  />
                </Section>
              </div>

              {/* RIGHT: Contact Info */}
              <div className="lg:col-span-2">
                <Section title="Contact Information" icon={<User size={18} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field
                      label="Organization Name *"
                      icon={<Building2 size={16} />}
                      value={org.orgName}
                      editable={isEditing}
                      onChange={(v) => handleChange("orgName", v)}
                      placeholder="Enter organization name"
                      required={profileIncomplete}
                    />
                    <Field
                      label="Email"
                      icon={<Mail size={16} />}
                      value={org.email}
                      editable={false}
                    />
                    <Field
                      label="Contact Person *"
                      icon={<User size={16} />}
                      value={org.contactPerson}
                      editable={isEditing}
                      onChange={(v) => handleChange("contactPerson", v)}
                      placeholder="Full name of contact person"
                      required={profileIncomplete}
                    />
                    <Field
                      label="Contact Number *"
                      icon={<Phone size={16} />}
                      value={org.contactNumber}
                      editable={isEditing}
                      onChange={(v) => handleChange("contactNumber", v)}
                      placeholder="Phone number"
                      required={profileIncomplete}
                    />
                    <SelectField
                      label="Region"
                      value={org.regionCode}
                      editable={isEditing}
                      options={regions.map((r) => ({
                        value: r.code,
                        label: r.name,
                      }))}
                      onChange={handleRegionChange}
                      loading={loadingRegions}
                    />
                    <SelectField
                      label="Province"
                      value={org.provinceCode}
                      editable={isEditing}
                      options={provinces.map((p) => ({
                        value: p.code,
                        label: p.name,
                      }))}
                      onChange={handleProvinceChange}
                      loading={loadingProvinces}
                      disabled={!org.regionCode}
                    />
                    <SelectField
                      label="City"
                      value={org.cityCode}
                      editable={isEditing}
                      options={cities.map((c) => ({
                        value: c.code,
                        label: c.name,
                      }))}
                      onChange={handleCityChange}
                      loading={loadingCities}
                      disabled={!org.provinceCode}
                    />
                    <SelectField
                      label="Barangay"
                      value={org.barangayCode}
                      editable={isEditing}
                      options={barangays.map((b) => ({
                        value: b.code,
                        label: b.name,
                      }))}
                      onChange={handleBarangayChange}
                      loading={loadingBarangays}
                      disabled={!org.cityCode}
                    />
                    <Field
                      label="Address"
                      icon={<Home size={16} />}
                      value={org.address}
                      editable={isEditing}
                      onChange={(v) => handleChange("address", v)}
                      className="md:col-span-2"
                      placeholder="Street address"
                    />
                  </div>

                  {/* Required Fields Note */}
                  {isEditing && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Fields marked with * are required
                        to complete your profile setup.
                      </p>
                    </div>
                  )}
                </Section>
              </div>
            </div>

            {loading && (
              <div className="mt-6 text-sm text-gray-500">Loading profile…</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* 🔹 Components */
function Section({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-green-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3 border-b border-green-200 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  editable,
  type = "text",
  className = "",
  placeholder = "",
  required = false,
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {editable ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
          placeholder={placeholder}
        />
      ) : (
        <div className="w-full h-10 px-3 flex items-center rounded-lg bg-gray-50 border border-green-200 text-gray-800">
          {value || <span className="text-gray-500">Not set</span>}
        </div>
      )}
    </div>
  );
}

function TextArea({ label, value, onChange, editable, placeholder = "" }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      {editable ? (
        <textarea
          rows={4}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 transition"
          placeholder={placeholder}
        />
      ) : (
        <div className="rounded-lg bg-gray-50 border border-green-200 p-3 text-gray-800 min-h-[84px]">
          {value || <span className="text-gray-500">Not set</span>}
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  editable,
  options,
  loading,
  disabled,
  required = false,
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {editable ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            {loading ? "Loading..." : "Select..."}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="w-full h-10 px-3 flex items-center rounded-lg bg-gray-50 border border-green-200 text-gray-800">
          {value ? (
            options.find((o) => o.value === value)?.label || value
          ) : (
            <span className="text-gray-500">Not set</span>
          )}
        </div>
      )}
    </div>
  );
}
