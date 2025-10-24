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
import {
  getVolunteerProfile,
  updateVolunteerProfile,
  getVolunteerBadges,
} from "@/services/volunteer.api";
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
  const [badgesData, setBadgesData] = useState({
    badges: [],
    points: 0,
    completedTasks: 0,
    level: { level: "Beginner", color: "gray", icon: "🌱" },
    nextMilestone: null,
    volunteerName: "",
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
        const [profileRes, badgesRes] = await Promise.all([
          getVolunteerProfile(),
          getVolunteerBadges(),
        ]);
        
        const profileData = profileRes.data;
        setMe({
          ...profileData,
          birthdate: profileData.birthdate ? profileData.birthdate.slice(0, 10) : "",
          skills: profileData.skills || [],
          interests: profileData.interests || [],
        });

        const badgesData = badgesRes.data;
        setBadgesData({
          badges: badgesData.badges || [],
          points: badgesData.points || 0,
          completedTasks: badgesData.completedTasks || 0,
          level: badgesData.level || { level: "Beginner", color: "gray", icon: "🌱" },
          nextMilestone: badgesData.nextMilestone || null,
          volunteerName: badgesData.volunteerName || "",
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
        skills:
          typeof me.skills === "string" ? me.skills.split(",") : me.skills,
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 text-2xl font-bold shadow-md">
                  {initials}
                </div>

                {/* Info Section */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                        <User size={20} className="text-blue-600" />
                        {me.fullName || "—"}
                      </h2>
                      <p className="text-sm text-gray-600 mb-3">Volunteer Member</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-700 text-sm mb-3">
                        {me.city && (
                          <div className="flex items-center gap-1">
                            <MapPin size={16} className="text-blue-600" />
                            <span>{me.city}</span>
                          </div>
                        )}
                        {me.contactNumber && me.contactNumber.trim() && (
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
                        <div className="flex flex-wrap gap-2">
                          {[...(me.skills || []), ...(me.interests || [])]
                            .slice(0, 8)
                            .map((item, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 text-xs rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium"
                              >
                                {item}
                              </span>
                            ))}
                          {[...(me.skills || []), ...(me.interests || [])].length > 8 && (
                            <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              +{[...(me.skills || []), ...(me.interests || [])].length - 8} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔹 Three-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN (About & Preferences) */}
              <div className="lg:col-span-4 space-y-6">
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

              {/* MIDDLE COLUMN (Personal Info) */}
              <div className="lg:col-span-4">
                <Section
                  title="Personal Information"
                  icon={<ShieldCheck size={18} />}
                >
                  <div className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
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
                    />
                  </div>
                </Section>
              </div>

              {/* RIGHT COLUMN (Badges & Achievements) */}
              <div className="lg:col-span-4">
                <Section
                  title="Badges & Achievements"
                  icon={<BadgeInfo size={18} />}
                >
                  <div className="space-y-5">
                    {/* Stats Overview */}
                    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 rounded-xl border border-gray-100">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{badgesData.points}</div>
                          <div className="text-xs text-gray-600 font-medium">Points</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">{badgesData.completedTasks}</div>
                          <div className="text-xs text-gray-600 font-medium">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">{badgesData.badges.length}</div>
                          <div className="text-xs text-gray-600 font-medium">Badges</div>
                        </div>
                      </div>
                    </div>

                    {/* Level Display */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-gray-100">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Current Level</div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          {badgesData.level?.icon && <span className="text-xl">{badgesData.level.icon}</span>}
                          <span className="text-xl font-bold text-orange-600">
                            {badgesData.level?.level || badgesData.level || "Beginner"}
                          </span>
                        </div>
                        {badgesData.nextMilestone && typeof badgesData.nextMilestone === 'object' && (
                          <div className="text-xs text-gray-600 leading-relaxed">
                            {badgesData.nextMilestone.message || `Next: ${badgesData.nextMilestone.next || 0} tasks`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badges Grid */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 text-sm">Earned Badges</h4>
                      {badgesData.badges.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {badgesData.badges.map((badge, index) => (
                            <BadgeCard key={index} badge={badge} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <BadgeInfo size={32} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm font-medium">No badges earned yet</p>
                          <p className="text-xs text-gray-400 mt-1">Complete opportunities to earn your first badge!</p>
                        </div>
                      )}
                    </div>
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

function BadgeCard({ badge }) {
  const getBadgeColor = (badgeName) => {
    const colors = {
      "First Steps": "from-green-400 to-green-600",
      "Community Helper": "from-blue-400 to-blue-600", 
      "Dedicated Volunteer": "from-purple-400 to-purple-600",
      "Volunteer Champion": "from-yellow-400 to-yellow-600",
      "Community Leader": "from-red-400 to-red-600",
      "Volunteer Hero": "from-indigo-400 to-indigo-600",
      "Volunteer Legend": "from-pink-400 to-pink-600",
      "Volunteer Master": "from-orange-400 to-orange-600",
      "Volunteer Guru": "from-teal-400 to-teal-600",
      "Volunteer Icon": "from-cyan-400 to-cyan-600",
    };
    return colors[badgeName] || "from-gray-400 to-gray-600";
  };

  const getBadgeIcon = (badgeName) => {
    const icons = {
      "First Steps": "🌱",
      "Community Helper": "🤝",
      "Dedicated Volunteer": "💪",
      "Volunteer Champion": "🏆",
      "Community Leader": "👑",
      "Volunteer Hero": "🦸",
      "Volunteer Legend": "⭐",
      "Volunteer Master": "🎯",
      "Volunteer Guru": "🧙",
      "Volunteer Icon": "💎",
    };
    return icons[badgeName] || "🏅";
  };

  return (
    <div className="group relative">
      <div className={`bg-gradient-to-br ${getBadgeColor(badge.name)} p-3 rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}>
        <div className="text-center">
          <div className="text-xl mb-1">{getBadgeIcon(badge.name)}</div>
          <h3 className="font-semibold text-xs mb-1 truncate leading-tight">{badge.name}</h3>
          <p className="text-xs opacity-90 line-clamp-2 leading-tight">{badge.description}</p>
          <div className="mt-1 text-xs opacity-75">
            {new Date(badge.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}