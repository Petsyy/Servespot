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
  Star,
  Zap,
  Award,
  Trophy,
  Flame,
  Crown,
  Medal,
  Sparkles,
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
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
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
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  <Pencil size={16} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm"
                  >
                    <Check size={16} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {/* 🔹 Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-2xl font-bold shadow-md">
                  {initials}
                </div>

                {/* Info Section */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                        <User size={18} className="text-green-600" />
                        {me.fullName || "—"}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-700 text-sm mb-3">
                        {me.city && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-green-600" />
                            <span className="text-sm">{me.city}</span>
                          </div>
                        )}
                        {me.contactNumber && me.contactNumber.trim() && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} className="text-green-600" />
                            <span className="text-sm">{me.contactNumber}</span>
                          </div>
                        )}
                        {me.email && (
                          <div className="flex items-center gap-1">
                            <Mail size={14} className="text-green-600" />
                            <span className="text-sm">{me.email}</span>
                          </div>
                        )}
                      </div>

                      {(me.skills?.length > 0 || me.interests?.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                          {[...(me.skills || []), ...(me.interests || [])]
                            .slice(0, 6)
                            .map((item, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs rounded-full bg-green-50 border border-green-100 text-green-700 font-medium"
                              >
                                {item}
                              </span>
                            ))}
                          {[...(me.skills || []), ...(me.interests || [])].length > 6 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              +{[...(me.skills || []), ...(me.interests || [])].length - 6} more
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
                  icon={<BadgeInfo size={16} />}
                >
                  <Area
                    label="Bio"
                    value={me.bio}
                    editable={isEditing}
                    onChange={(v) => handleChange("bio", v)}
                  />
                  <TagInput
                    label="Skills"
                    icon={<Tags size={14} />}
                    value={me.skills}
                    editable={isEditing}
                    onChange={(arr) => handleChange("skills", arr)}
                  />
                  <TagInput
                    label="Interests"
                    icon={<Tags size={14} />}
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
                  icon={<ShieldCheck size={16} />}
                >
                  <div className="space-y-4">
                    <Field
                      label="Full Name"
                      icon={<User size={14} />}
                      value={me.fullName}
                      editable={isEditing}
                      onChange={(v) => handleChange("fullName", v)}
                    />
                    <Field
                      label="Email"
                      icon={<Mail size={14} />}
                      value={me.email}
                      editable={false}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Birthdate"
                        icon={<Calendar size={14} />}
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
                      icon={<Phone size={14} />}
                      value={me.contactNumber}
                      editable={isEditing}
                      onChange={(v) => handleChange("contactNumber", v)}
                    />
                    <Field
                      label="City"
                      icon={<MapPin size={14} />}
                      value={me.city}
                      editable={isEditing}
                      onChange={(v) => handleChange("city", v)}
                    />
                    <Field
                      label="Address"
                      icon={<Home size={14} />}
                      value={me.address}
                      editable={isEditing}
                      onChange={(v) => handleChange("address", v)}
                    />
                  </div>
                </Section>
              </div>

              {/* RIGHT COLUMN (Enhanced Badges & Achievements) */}
              <div className="lg:col-span-4">
                <EnhancedBadgesSection badgesData={badgesData} completedTasks={badgesData.completedTasks} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Enhanced Badges & Achievements Section
function EnhancedBadgesSection({ badgesData, completedTasks }) {
  const ALL_BADGES = [
    {
      name: "First Step",
      description: "Completed your first volunteering task!",
      icon: <Star className="w-5 h-5" />,
      milestone: 1,
      gradient: "from-yellow-400 to-yellow-600",
      bgGradient: "from-yellow-50 to-amber-50",
      iconColor: "text-yellow-400"
    },
    {
      name: "Active Helper",
      description: "Completed 2 volunteering tasks",
      icon: <Zap className="w-5 h-5" />,
      milestone: 2,
      gradient: "from-orange-400 to-orange-600",
      bgGradient: "from-orange-50 to-amber-50",
      iconColor: "text-orange-500"
    },
    {
      name: "Helping Hand",
      description: "Completed 3 volunteering tasks",
      icon: <Award className="w-5 h-5" />,
      milestone: 3,
      gradient: "from-blue-400 to-blue-600",
      bgGradient: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-500"
    },
    {
      name: "Community Hero",
      description: "Completed 4 volunteering tasks",
      icon: <Trophy className="w-5 h-5" />,
      milestone: 4,
      gradient: "from-green-400 to-green-600",
      bgGradient: "from-green-50 to-emerald-50",
      iconColor: "text-green-500"
    },
    {
      name: "Neighborhood Legend",
      description: "Completed 5 volunteering tasks",
      icon: <Flame className="w-5 h-5" />,
      milestone: 5,
      gradient: "from-pink-400 to-pink-600",
      bgGradient: "from-pink-50 to-rose-50",
      iconColor: "text-pink-500"
    },
    {
      name: "Volunteer Champion",
      description: "Completed 6 volunteering tasks",
      icon: <Crown className="w-5 h-5" />,
      milestone: 6,
      gradient: "from-purple-400 to-purple-600",
      bgGradient: "from-purple-50 to-violet-50",
      iconColor: "text-purple-500"
    },
    {
      name: "Volunteer Master",
      description: "Completed 7 volunteering tasks",
      icon: <Medal className="w-5 h-5" />,
      milestone: 7,
      gradient: "from-indigo-400 to-indigo-600",
      bgGradient: "from-indigo-50 to-blue-50",
      iconColor: "text-indigo-500"
    },
    {
      name: "Volunteer Legend",
      description: "Completed 8 volunteering tasks",
      icon: <Sparkles className="w-5 h-5" />,
      milestone: 8,
      gradient: "from-yellow-400 to-yellow-600",
      bgGradient: "from-amber-50 to-yellow-50",
      iconColor: "text-yellow-500"
    },
  ];

  const earnedNames = badgesData.badges.map(b => b.name);
  const earnedBadges = ALL_BADGES.filter(badge => earnedNames.includes(badge.name));
  const nextBadge = ALL_BADGES.find(badge => !earnedNames.includes(badge.name));

  return (
    <Section
      title="Badges & Achievements"
      icon={<Trophy size={16} />}
    >
      <div className="space-y-4">
        {/* Stats Overview */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{badgesData.points}</div>
              <div className="text-xs text-gray-600 font-medium">Points</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{completedTasks}</div>
              <div className="text-xs text-gray-600 font-medium">Tasks</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{earnedBadges.length}</div>
              <div className="text-xs text-gray-600 font-medium">Badges</div>
            </div>
          </div>
        </div>

        {/* Level Display */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100">
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-700 mb-1">Current Level</div>
            <div className="flex items-center justify-center gap-2 mb-1">
              {badgesData.level?.icon && <span className="text-lg">{badgesData.level.icon}</span>}
              <span className="text-base font-bold text-amber-600">
                {badgesData.level?.level || "Beginner"}
              </span>
            </div>
            {badgesData.nextMilestone && (
              <div className="text-xs text-gray-600">
                {typeof badgesData.nextMilestone === 'object' 
                  ? badgesData.nextMilestone.message || `Next: ${badgesData.nextMilestone.next || 0} tasks`
                  : `Next: ${badgesData.nextMilestone} tasks`
                }
              </div>
            )}
          </div>
        </div>

        {/* Next Badge Progress */}
        {nextBadge && (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${nextBadge.gradient}`}>
                <div className="text-white">
                  {nextBadge.icon}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900">Next: {nextBadge.name}</h4>
                <p className="text-xs text-gray-600">{nextBadge.milestone - completedTasks} more tasks</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-700"
                style={{ width: `${Math.min((completedTasks / nextBadge.milestone) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Badges Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800 text-sm">Earned Badges</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {earnedBadges.length}/{ALL_BADGES.length}
            </span>
          </div>
          
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {earnedBadges.map((badge, index) => (
                <EnhancedBadgeCard key={index} badge={badge} earned={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Trophy size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">No badges earned yet</p>
              <p className="text-xs text-gray-400 mt-1">Complete tasks to earn your first badge!</p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// Enhanced Badge Card Component
function EnhancedBadgeCard({ badge, earned }) {
  return (
    <div className={`
      relative p-3 rounded-lg border transition-all duration-200
      ${earned 
        ? `border-transparent bg-gradient-to-br ${badge.bgGradient} shadow-sm` 
        : 'border-gray-200 bg-gray-50'
      }
    `}>
      <div className="flex items-center gap-3">
        {/* Badge Icon */}
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-lg transition-all
          ${earned 
            ? `bg-gradient-to-br ${badge.gradient} shadow` 
            : 'bg-gray-200'
          }
        `}>
          <div className={earned ? 'text-white' : badge.iconColor}>
            {badge.icon}
          </div>
          {earned && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center border border-white">
              <span className="text-white text-[8px] font-bold">✓</span>
            </div>
          )}
        </div>

        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold text-xs transition-colors truncate
            ${earned ? 'text-gray-900' : 'text-gray-500'}
          `}>
            {badge.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {badge.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Reusable components */
function Section({ title, icon, children }) {
  return (
    <section className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="bg-green-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
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
          className="w-full h-9 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
        />
      ) : (
        <div className="w-full h-9 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-sm">
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
          rows={3}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 p-3 text-sm"
        />
      ) : (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-gray-800 min-h-[72px] text-sm">
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
          className="w-full h-9 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
        />
      ) : (
        <div className="flex flex-wrap gap-1">
          {value.length ? (
            value.map((t, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-100"
              >
                {t}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">—</span>
          )}
        </div>
      )}
    </div>
  );
}