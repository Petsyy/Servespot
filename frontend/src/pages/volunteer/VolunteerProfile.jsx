import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Mail,
  User,
  Phone,
  MapPin,
  Home,
  Calendar,
  Tags,
  ShieldCheck,
  Check,
  X,
  Pencil,
  BadgeInfo,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getVolunteerProfile, updateVolunteerProfile } from "@/services/volunteer.api";
import { normalizeSkills } from "@/utils/skills";
import VolSidebar from "@/components/layout/sidebars/VolSidebar";
import VolunteerNavbar from "@/components/layout/navbars/VolunteerNavbar";

export default function VolunteerProfile() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState({
    fullName: "",
    email: "",
    birthdate: "",
    gender: "",
    contactNumber: "",
    city: "",
    address: "",
    skills: [],
    interests: [],
    availability: "",
    bio: "",
  });

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch volunteer data
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getVolunteerProfile();
        setMe({
          ...data,
          birthdate: data.birthdate ? data.birthdate.slice(0, 10) : "",
          skills: data.skills || [],
          interests: data.interests || [],
        });
      } catch {
        toast.error("Failed to load profile.");
      }
    })();
  }, []);

  const initials = useMemo(() => {
    const n = me.fullName?.trim();
    return n
      ? n
          .split(" ")
          .slice(0, 2)
          .map((s) => s[0])
          .join("")
          .toUpperCase()
      : "VA";
  }, [me.fullName]);

  const handleChange = (name, value) =>
    setMe((prev) => ({ ...prev, [name]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...me,
        skills: normalizeSkills(
          typeof me.skills === "string" ? me.skills.split(",") : me.skills
        ),
        interests:
          typeof me.interests === "string"
            ? me.interests.split(",")
            : me.interests,
      };
      await updateVolunteerProfile(payload);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar with responsive controls */}
      <VolSidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar with sidebar toggle */}
        <VolunteerNavbar 
          onToggleSidebar={toggleSidebar}
        />

        {/* 📜 Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* 🔹 Header */}
            <div className="flex flex-wrap items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Volunteer Profile
                  </h1>
                  <p className="text-gray-600 text-sm">
                    View and update your personal details, preferences, and
                    skills.
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

            {/* 🔹 Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5 mb-8 shadow-sm">
              {/* Avatar */}
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-2xl font-bold shadow-sm">
                {initials}
              </div>

              {/* Info Section */}
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  {me.fullName || "—"}
                </h2>
                <p className="text-sm text-gray-600">Volunteer</p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-3 text-gray-700 text-sm mt-1">
                  {me.city && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} className="text-blue-600" />
                      <span>{me.city}</span>
                    </div>
                  )}
                  {me.contactNumber && (
                    <div className="flex items-center gap-1">
                      <Phone size={16} className="text-blue-600" />
                      <span>{me.contactNumber}</span>
                    </div>
                  )}
                  {me.email && (
                    <div className="flex items-center gap-1">
                      <Mail size={16} className="text-blue-600" />
                      <span>{me.email}</span>
                    </div>
                  )}
                </div>

                {(me.skills?.length > 0 || me.interests?.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...(me.skills || []), ...(me.interests || [])]
                      .slice(0, 6)
                      .map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-full bg-blue-50 border border-blue-100 text-blue-700"
                        >
                          {item}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* 🔹 Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN (About & Preferences) */}
              <div className="lg:col-span-1 space-y-6">
                <Section
                  title="About & Preferences"
                  icon={<BadgeInfo size={18} />}
                >
                  <Area
                    label="Bio"
                    value={me.bio}
                    editable={isEditing}
                    onChange={(v) => handleChange("bio", v)}
                  />
                  <TagInput
                    label="Skills"
                    icon={<Tags size={16} />}
                    value={me.skills}
                    editable={isEditing}
                    onChange={(arr) => handleChange("skills", arr)}
                  />
                  <TagInput
                    label="Interests"
                    icon={<Tags size={16} />}
                    value={me.interests}
                    editable={isEditing}
                    onChange={(arr) => handleChange("interests", arr)}
                  />
                  <Field
                    label="Availability"
                    value={me.availability}
                    editable={isEditing}
                    onChange={(v) => handleChange("availability", v)}
                    placeholder="Weekdays / Weekends / Flexible"
                  />
                </Section>
              </div>

              {/* RIGHT COLUMN (Personal Info) */}
              <div className="lg:col-span-2">
                <Section
                  title="Personal Information"
                  icon={<ShieldCheck size={18} />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field
                      label="Full Name"
                      icon={<User size={16} />}
                      value={me.fullName}
                      editable={isEditing}
                      onChange={(v) => handleChange("fullName", v)}
                    />
                    <Field
                      label="Email"
                      icon={<Mail size={16} />}
                      value={me.email}
                      editable={false}
                    />
                    <Field
                      label="Birthdate"
                      icon={<Calendar size={16} />}
                      type="date"
                      value={me.birthdate}
                      editable={isEditing}
                      onChange={(v) => handleChange("birthdate", v)}
                    />
                    <Field
                      label="Gender"
                      value={me.gender}
                      editable={isEditing}
                      onChange={(v) => handleChange("gender", v)}
                      placeholder="Male / Female / Other"
                    />
                    <Field
                      label="Contact Number"
                      icon={<Phone size={16} />}
                      value={me.contactNumber}
                      editable={isEditing}
                      onChange={(v) => handleChange("contactNumber", v)}
                    />
                    <Field
                      label="City"
                      icon={<MapPin size={16} />}
                      value={me.city}
                      editable={isEditing}
                      onChange={(v) => handleChange("city", v)}
                    />
                    <Field
                      label="Address"
                      icon={<Home size={16} />}
                      value={me.address}
                      editable={isEditing}
                      onChange={(v) => handleChange("address", v)}
                      className="md:col-span-2"
                    />
                  </div>
                </Section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* 🔹 Reusable components */
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
  placeholder = "",
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
          placeholder={placeholder}
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

function Area({ label, value, onChange, editable }) {
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

function TagInput({ label, icon, value = [], onChange, editable }) {
  const [text, setText] = useState(value.join(", "));

  useEffect(() => setText(value.join(", ")), [value]);

  const toArray = (s) =>
    s
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
        {icon}
        {label}
      </label>
      {editable ? (
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(toArray(e.target.value));
          }}
          placeholder="Separate with commas"
          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {value.length ? (
            value.map((t, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100"
              >
                {t}
              </span>
            ))
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </div>
      )}
    </div>
  );
}