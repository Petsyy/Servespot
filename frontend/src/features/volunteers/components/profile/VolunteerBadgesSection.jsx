import React from "react";
import {
  Trophy,
  Star,
  Zap,
  Award,
  Flame,
  Crown,
  Medal,
  Sparkles,
  Check,
} from "lucide-react";

export const ALL_BADGES = [
  {
    name: "First Step",
    description: "Completed your first volunteering task!",
    icon: <Star className="w-4 h-4" />,
    milestone: 1,
    bgGradient: "bg-amber-50/70 border-amber-200/80",
    iconColor: "text-amber-500",
    pillColor: "bg-amber-100 text-amber-800",
  },
  {
    name: "Active Helper",
    description: "Completed 2 volunteering tasks",
    icon: <Zap className="w-4 h-4" />,
    milestone: 2,
    bgGradient: "bg-emerald-50/70 border-emerald-200/80",
    iconColor: "text-emerald-600",
    pillColor: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "Helping Hand",
    description: "Completed 3 volunteering tasks",
    icon: <Award className="w-4 h-4" />,
    milestone: 3,
    bgGradient: "bg-sky-50/70 border-sky-200/80",
    iconColor: "text-sky-600",
    pillColor: "bg-sky-100 text-sky-800",
  },
  {
    name: "Community Hero",
    description: "Completed 4 volunteering tasks",
    icon: <Trophy className="w-4 h-4" />,
    milestone: 4,
    bgGradient: "bg-amber-50/90 border-amber-300",
    iconColor: "text-amber-600",
    pillColor: "bg-amber-200/80 text-amber-900",
  },
  {
    name: "Neighborhood Legend",
    description: "Completed 5 volunteering tasks",
    icon: <Flame className="w-4 h-4" />,
    milestone: 5,
    bgGradient: "bg-rose-50/70 border-rose-200/80",
    iconColor: "text-rose-600",
    pillColor: "bg-rose-100 text-rose-800",
  },
  {
    name: "Volunteer Champion",
    description: "Completed 6 volunteering tasks",
    icon: <Crown className="w-4 h-4" />,
    milestone: 6,
    bgGradient: "bg-purple-50/70 border-purple-200/80",
    iconColor: "text-purple-600",
    pillColor: "bg-purple-100 text-purple-800",
  },
  {
    name: "Volunteer Master",
    description: "Completed 7 volunteering tasks",
    icon: <Medal className="w-4 h-4" />,
    milestone: 7,
    bgGradient: "bg-indigo-50/70 border-indigo-200/80",
    iconColor: "text-indigo-600",
    pillColor: "bg-indigo-100 text-indigo-800",
  },
  {
    name: "Volunteer Legend",
    description: "Completed 8 volunteering tasks",
    icon: <Sparkles className="w-4 h-4" />,
    milestone: 8,
    bgGradient: "bg-amber-100/60 border-amber-300",
    iconColor: "text-amber-600",
    pillColor: "bg-amber-200 text-amber-900",
  },
];

function BadgeCard({ badge, earned }) {
  return (
    <div
      className={`relative p-3 rounded-xl border transition-all duration-200 ${
        earned
          ? `${badge.bgGradient} shadow-xs`
          : "border-gray-200/80 bg-gray-50/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative ${
            earned ? "bg-white shadow-xs border border-gray-100" : "bg-gray-100 text-gray-400"
          }`}
        >
          <div className={earned ? badge.iconColor : "text-gray-400"}>
            {badge.icon}
          </div>
          {earned && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center border border-white">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`font-bold text-xs truncate ${
              earned ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {badge.name}
          </h4>
          <p className="text-[11px] text-gray-500 truncate">{badge.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function VolunteerBadgesSection({ badgesData }) {
  const completedTasks = badgesData?.completedTasks || 0;
  const points = badgesData?.points || 0;
  const rawBadges = Array.isArray(badgesData?.badges) ? badgesData.badges : [];
  const earnedNames = rawBadges.map((b) => (typeof b === "string" ? b : b.name));

  const earnedBadges = ALL_BADGES.filter((badge) => earnedNames.includes(badge.name));
  const nextBadge = ALL_BADGES.find((badge) => !earnedNames.includes(badge.name));

  return (
    <section className="rounded-2xl border border-gray-200/80 overflow-hidden bg-white shadow-xs">
      <div className="bg-slate-50/80 px-5 py-3.5 border-b border-gray-200/80 flex items-center gap-2">
        <Trophy size={16} className="text-emerald-700" />
        <h3 className="font-bold text-gray-900 text-sm">Badges & Achievements</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Stats Overview */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-gray-200/80">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-extrabold text-emerald-700">{points}</div>
              <div className="text-xs text-gray-500 font-semibold mt-0.5">Points</div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-sky-700">{completedTasks}</div>
              <div className="text-xs text-gray-500 font-semibold mt-0.5">Tasks</div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-amber-700">{earnedBadges.length}</div>
              <div className="text-xs text-gray-500 font-semibold mt-0.5">Badges</div>
            </div>
          </div>
        </div>

        {/* Level Display */}
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 text-center">
          <div className="text-xs font-semibold text-amber-800 mb-1">Current Level</div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-base font-extrabold text-amber-900">
              {badgesData?.level?.level || "Beginner"}
            </span>
          </div>
          {badgesData?.nextMilestone && (
            <div className="text-xs text-amber-700 font-medium">
              {typeof badgesData.nextMilestone === "object"
                ? badgesData.nextMilestone.message ||
                  `Next: ${badgesData.nextMilestone.next || 0} tasks`
                : `Next: ${badgesData.nextMilestone} tasks`}
            </div>
          )}
        </div>

        {/* Next Badge Progress */}
        {nextBadge && (
          <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200 shadow-xs">
                <div className={nextBadge.iconColor}>{nextBadge.icon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-gray-900 truncate">
                  Next: {nextBadge.name}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {Math.max(nextBadge.milestone - completedTasks, 0)} more tasks needed
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-emerald-600 transition-all duration-500"
                style={{
                  width: `${Math.min((completedTasks / nextBadge.milestone) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Badges Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900 text-sm">Earned Badges</h4>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              {earnedBadges.length} of {ALL_BADGES.length}
            </span>
          </div>

          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {earnedBadges.map((badge, index) => (
                <BadgeCard key={index} badge={badge} earned={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <Trophy size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">No badges earned yet</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Complete tasks to earn your first milestone badge!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
