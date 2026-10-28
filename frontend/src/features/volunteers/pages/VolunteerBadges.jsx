import React, { useState } from "react";
import { Star, Zap, Award, Trophy, Flame, Crown, Medal, Sparkles, Check } from "lucide-react";
import { useVolunteerOverview } from "@/features/volunteers/hooks/useVolunteerOverview";
import VolunteerSidebar from "@/shared/components/layout/sidebars/VolunteerSidebar";
import VolunteerNavbar from "@/shared/components/layout/navbars/VolunteerNavbar";

const ALL_BADGES = [
  {
    name: "First Step",
    description: "Completed your first volunteering task!",
    icon: <Star className="w-6 h-6" />,
    milestone: 1,
    bgGradient: "bg-amber-50/70 border-amber-200/80",
    iconColor: "text-amber-500",
    pillColor: "bg-amber-100 text-amber-800",
  },
  {
    name: "Active Helper",
    description: "Completed 2 volunteering tasks",
    icon: <Zap className="w-6 h-6" />,
    milestone: 2,
    bgGradient: "bg-emerald-50/70 border-emerald-200/80",
    iconColor: "text-emerald-600",
    pillColor: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "Helping Hand",
    description: "Completed 3 volunteering tasks",
    icon: <Award className="w-6 h-6" />,
    milestone: 3,
    bgGradient: "bg-sky-50/70 border-sky-200/80",
    iconColor: "text-sky-600",
    pillColor: "bg-sky-100 text-sky-800",
  },
  {
    name: "Community Hero",
    description: "Completed 4 volunteering tasks",
    icon: <Trophy className="w-6 h-6" />,
    milestone: 4,
    bgGradient: "bg-amber-50/90 border-amber-300",
    iconColor: "text-amber-600",
    pillColor: "bg-amber-200/80 text-amber-900",
  },
  {
    name: "Neighborhood Legend",
    description: "Completed 5 volunteering tasks",
    icon: <Flame className="w-6 h-6" />,
    milestone: 5,
    bgGradient: "bg-rose-50/70 border-rose-200/80",
    iconColor: "text-rose-600",
    pillColor: "bg-rose-100 text-rose-800",
  },
  {
    name: "Volunteer Champion",
    description: "Completed 6 volunteering tasks",
    icon: <Crown className="w-6 h-6" />,
    milestone: 6,
    bgGradient: "bg-purple-50/70 border-purple-200/80",
    iconColor: "text-purple-600",
    pillColor: "bg-purple-100 text-purple-800",
  },
  {
    name: "Volunteer Master",
    description: "Completed 7 volunteering tasks",
    icon: <Medal className="w-6 h-6" />,
    milestone: 7,
    bgGradient: "bg-indigo-50/70 border-indigo-200/80",
    iconColor: "text-indigo-600",
    pillColor: "bg-indigo-100 text-indigo-800",
  },
  {
    name: "Volunteer Legend",
    description: "Completed 8 volunteering tasks",
    icon: <Sparkles className="w-6 h-6" />,
    milestone: 8,
    bgGradient: "bg-amber-100/60 border-amber-300",
    iconColor: "text-amber-600",
    pillColor: "bg-amber-200 text-amber-900",
  },
];

export default function VolunteerBadges() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: volunteer, isLoading: loading } = useVolunteerOverview();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const completed = volunteer?.completedTasks || 0;
  const earnedNames = (volunteer?.badges || []).map((b) => (typeof b === "string" ? b : b.name));
  const earnedBadges = ALL_BADGES.filter((badge) => earnedNames.includes(badge.name));
  const lockedBadges = ALL_BADGES.filter((badge) => !earnedNames.includes(badge.name));

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <VolunteerSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 flex flex-col min-w-0">
          <VolunteerNavbar onToggleSidebar={toggleSidebar} />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-emerald-600 border-t-transparent" />
              <p className="text-gray-500 text-sm font-medium">Loading your achievements...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VolunteerSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <VolunteerNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Your Rewards & Badges
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Earn verifiable milestone badges as you complete tasks and make a positive difference in your community.
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Total Points"
                value={volunteer?.points || 0}
                icon={<Sparkles className="w-5 h-5 text-emerald-600" />}
                iconBg="bg-emerald-50 border-emerald-100"
              />
              <StatCard
                label="Completed Tasks"
                value={completed}
                icon={<Award className="w-5 h-5 text-sky-600" />}
                iconBg="bg-sky-50 border-sky-100"
              />
              <StatCard
                label="Badges Earned"
                value={earnedBadges.length}
                icon={<Trophy className="w-5 h-5 text-amber-600" />}
                iconBg="bg-amber-50 border-amber-100"
              />
            </div>

            {/* Progress Overview Card */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Milestone Progress</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ALL_BADGES.length - earnedBadges.length === 0
                      ? "All milestones completed! You've unlocked every badge."
                      : `${ALL_BADGES.length - earnedBadges.length} more milestones to unlock all badges`}
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                  {earnedBadges.length} of {ALL_BADGES.length} Unlocked
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${(earnedBadges.length / ALL_BADGES.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Badges Sections */}
            <div className="space-y-8">
              {/* Earned Badges Section */}
              {earnedBadges.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Earned Badges</h2>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {earnedBadges.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {earnedBadges.map((badge, index) => (
                      <BadgeCard key={index} badge={badge} earned={true} completed={completed} />
                    ))}
                  </div>
                </section>
              )}

              {/* Locked / Upcoming Badges Section */}
              {lockedBadges.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Upcoming Badges</h2>
                    <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {lockedBadges.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {lockedBadges.map((badge, index) => (
                      <BadgeCard key={index} badge={badge} earned={false} completed={completed} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, iconBg }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

function BadgeCard({ badge, earned, completed }) {
  const progress = Math.min((completed / badge.milestone) * 100, 100);

  return (
    <div
      className={`relative p-5 rounded-2xl border shadow-xs transition-all duration-200 flex flex-col items-center text-center justify-between ${
        earned
          ? `${badge.bgGradient} hover:shadow-md`
          : "border-gray-200/80 bg-white"
      }`}
    >
      <div className="flex flex-col items-center w-full">
        {/* Badge Icon */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 shadow-xs relative ${
            earned ? "bg-white border border-gray-100" : "bg-gray-50 border border-gray-200 text-gray-400"
          }`}
        >
          <div className={earned ? badge.iconColor : "text-gray-400"}>{badge.icon}</div>
          {earned && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xs border-2 border-white">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Badge Name & Description */}
        <h3 className={`font-bold text-sm mb-1 ${earned ? "text-gray-900" : "text-gray-700"}`}>
          {badge.name}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {badge.description}
        </p>
      </div>

      {/* Progress & Milestone Footer */}
      <div className="w-full pt-3 border-t border-black/5 mt-auto">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${earned ? badge.pillColor : "bg-gray-100 text-gray-600"}`}>
            Milestone {badge.milestone}
          </span>
          <span className={`font-semibold text-[11px] ${earned ? "text-emerald-700" : "text-gray-500"}`}>
            {earned ? "Unlocked" : `${Math.max(badge.milestone - completed, 0)} to go`}
          </span>
        </div>

        {!earned && (
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
