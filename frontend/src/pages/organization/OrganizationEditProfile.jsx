import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
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
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getOrganizationById, updateOrganization } from "@/services/organization.api";

const ORG_TYPES = [
  "Non-profit",
  "NGO",
  "School / University",
  "Company",
  "Government",
  "Community Group",
  "Other",
];

export default function OrganizationEditProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const orgId = localStorage.getItem("orgId");

  const [org, setOrg] = useState({
    orgName: "",
    email: "",
    contactPerson: "",
    contactNumber: "",
    city: "",
    address: "",
    orgType: "",
    description: "",
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getOrganizationById(orgId);
        setOrg(res.data || {});
      } catch (err) {
        console.error("❌ Failed to load organization profile:", err);
        toast.error("Failed to load organization profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [orgId]);

  const initials = useMemo(() => {
    const n = org.orgName?.trim();
    if (!n) return "OR";
    const parts = n.split(" ");
    return (parts[0]?.[0] + (parts[1]?.[0] || "")).toUpperCase();
  }, [org.orgName]);

  const handleChange = (name, value) =>
    setOrg((prev) => ({ ...prev, [name]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateOrganization(orgId, org);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 🔹 Header */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/organization/dashboard")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Organization Profile
              </h1>
              <p className="text-gray-600 text-sm">
                Manage your organization’s information and public details.
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Pencil size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
              >
                <Check size={18} /> {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X size={18} /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* 🔹 Organization Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5 mb-8 shadow-sm">
          {/* Logo / Avatar */}
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-2xl font-bold shadow-sm">
            {initials}
          </div>

          {/* Info Section */}
          <div className="flex flex-col gap-1">
            {/* Company Name */}
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              {org.orgName || "—"}
            </h2>
            <p className="text-sm text-gray-600">
              {org.orgType || "Organization"}
            </p>

            {/* Info Row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-3 text-gray-700 text-sm">
              {org.city && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-blue-600" />
                  <span>{org.city}</span>
                </div>
              )}
              {org.contactPerson && (
                <div className="flex items-center gap-1">
                  <User size={16} className="text-blue-600" />
                  <span>{org.contactPerson}</span>
                </div>
              )}
              {org.email && (
                <div className="flex items-center gap-1">
                  <Mail size={16} className="text-blue-600" />
                  <span>{org.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔹 Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: About Section */}
          <div className="lg:col-span-1 space-y-6">
            <Section title="About Organization" icon={<FileText size={18} />}>
              <TextArea
                label="Description"
                name="description"
                value={org.description}
                editable={isEditing}
                onChange={(v) => handleChange("description", v)}
              />
              <SelectField
                label="Organization Type"
                name="orgType"
                value={org.orgType}
                editable={isEditing}
                options={ORG_TYPES}
                onChange={(v) => handleChange("orgType", v)}
              />
            </Section>
          </div>

          {/* RIGHT: Contact Info */}
          <div className="lg:col-span-2">
            <Section title="Contact Information" icon={<User size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field
                  label="Organization Name"
                  icon={<Building2 size={16} />}
                  value={org.orgName}
                  editable={isEditing}
                  onChange={(v) => handleChange("orgName", v)}
                />
                <Field
                  label="Email"
                  icon={<Mail size={16} />}
                  value={org.email}
                  editable={false}
                />
                <Field
                  label="Contact Person"
                  icon={<User size={16} />}
                  value={org.contactPerson}
                  editable={isEditing}
                  onChange={(v) => handleChange("contactPerson", v)}
                />
                <Field
                  label="Contact Number"
                  icon={<Phone size={16} />}
                  value={org.contactNumber}
                  editable={isEditing}
                  onChange={(v) => handleChange("contactNumber", v)}
                />
                <Field
                  label="City"
                  icon={<MapPin size={16} />}
                  value={org.city}
                  editable={isEditing}
                  onChange={(v) => handleChange("city", v)}
                />
                <Field
                  label="Address"
                  icon={<Home size={16} />}
                  value={org.address}
                  editable={isEditing}
                  onChange={(v) => handleChange("address", v)}
                  className="md:col-span-2"
                />
              </div>
            </Section>
          </div>
        </div>

        {loading && (
          <div className="mt-6 text-sm text-gray-500">Loading profile…</div>
        )}
      </div>
    </div>
  );
}

/* 🔹 Components */
function Section({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-blue-50 px-5 py-3 border-b border-gray-200 flex items-center gap-2">
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
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
        {icon}
        {label}
      </label>
      {editable ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <div className="w-full h-10 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-gray-800">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

function TextArea({ label, value, onChange, editable }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      {editable ? (
        <textarea
          rows={4}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3"
        />
      ) : (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-gray-800 min-h-[84px]">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, editable, options }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      {editable ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="" disabled>
            Select...
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <div className="w-full h-10 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-gray-800">
          {value || "—"}
        </div>
      )}
    </div>
  );
}
