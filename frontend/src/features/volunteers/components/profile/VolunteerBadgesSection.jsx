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
} from "lucide-react";

export const ALL_BADGES = [
  {
    name: "First Step",
    description: "Completed your first volunteering task!",
    icon: <Star className="w-5 h-5" />,
    milestone: 1,
    gradient: "from-yellow-400 to-yellow-600",
    bgGradient: "from-yellow-50 to-amber-50",
    iconColor: "text-yellow-400",
  },
  {
    name: "Active Helper",
    description: "Completed 2 volunteering tasks",
    icon: <Zap className="w-5 h-5" />,
    milestone: 2,
    gradient: "from-orange-400 to-orange-600",
    bgGradient: "from-orange-50 to-amber-50",
    iconColor: "text-orange-500",
  },
  {
    name: "Helping Hand",
    description: "Completed 3 volunteering tasks",
    icon: <Award className="w-5 h-5" />,
    milestone: 3,
    gradient: "from-blue-400 to-blue-600",
    bgGradient: "from-blue-50 to-cyan-50",
    iconColor: "text-blue-500",
  },
  {
    name: "Community Hero",
    description: "Completed 4 volunteering tasks",
    icon: <Trophy className="w-5 h-5" />,
    milestone: 4,
    gradient: "from-green-400 to-green-600",
    bgGradient: "from-green-50 to-emerald-50",
    iconColor: "text-green-500",
  },
  {
    name: "Neighborhood Legend",
    description: "Completed 5 volunteering tasks",
    icon: <Flame className="w-5 h-5" />,
    milestone: 5,
    gradient: "from-pink-400 to-pink-600",
    bgGradient: "from-pink-50 to-rose-50",
    iconColor: "text-pink-500",
  },
  {
    name: "Volunteer Champion",
    description: "Completed 6 volunteering tasks",
    icon: <Crown className="w-5 h-5" />,
    milestone: 6,
    gradient: "from-purple-400 to-purple-600",
    bgGradient: "from-purple-50 to-violet-50",
    iconColor: "text-purple-500",
  },
  {
    name: "Volunteer Master",
    description: "Completed 7 volunteering tasks",
    icon: <Medal className="w-5 h-5" />,
    milestone: 7,
    gradient: "from-indigo-400 to-indigo-600",
    bgGradient: "from-indigo-50 to-blue-50",
    iconColor: "text-indigo-500",
  },
  {
    name: "Volunteer Legend",
    description: "Completed 8 volunteering tasks",
    icon: <Sparkles className="w-5 h-5" />,
    milestone: 8,
    gradient: "from-yellow-400 to-yellow-600",
    bgGradient: "from-amber-50 to-yellow-50",
    iconColor: "text-yellow-500",
  },
];

function BadgeCard({ badge, earned }) {
  return (
    <div
      className={`relative p-3 rounded-lg border transition-all duration-200 ${
        earned
          ? `border-transparent bg-gradient-to-br ${badge.bgGradient} shadow-sm`
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
            earned ? `bg-gradient-to-br ${badge.gradient} shadow` : "bg-gray-200"
          }`}
        >
          <div className={earned ? "text-white" : badge.iconColor}>
            {badge.icon}
          </div>
          {earned && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center border border-white">
              <span className="text-white text-[8px] font-bold">✓</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold text-xs truncate ${
              earned ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {badge.name}
          </h4>
          <p className="text-xs text-gray-500 truncate">{badge.description}</p>
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
    <section className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-green-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <Trophy size={16} className="text-green-700" />
        <h3 className="font-semibold text-gray-900 text-sm">Badges & Achievements</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Overview */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">{points}</div>
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
              {badgesData?.level?.icon && (
                <span className="text-lg">{badgesData.level.icon}</span>
              )}
              <span className="text-base font-bold text-amber-600">
                {badgesData?.level?.level || "Beginner"}
              </span>
            </div>
            {badgesData?.nextMilestone && (
              <div className="text-xs text-gray-600">
                {typeof badgesData.nextMilestone === "object"
                  ? badgesData.nextMilestone.message ||
                    `Next: ${badgesData.nextMilestone.next || 0} tasks`
                  : `Next: ${badgesData.nextMilestone} tasks`}
              </div>
            )}
          </div>
        </div>

        {/* Next Badge Progress */}
        {nextBadge && (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${nextBadge.gradient}`}
              >
                <div className="text-white">{nextBadge.icon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  Next: {nextBadge.name}
                </h4>
                <p className="text-xs text-gray-600">
                  {Math.max(nextBadge.milestone - completedTasks, 0)} more tasks
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-700"
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
            <h4 className="font-semibold text-gray-800 text-sm">Earned Badges</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {earnedBadges.length}/{ALL_BADGES.length}
            </span>
          </div>

          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {earnedBadges.map((badge, index) => (
                <BadgeCard key={index} badge={badge} earned={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Trophy size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">No badges earned yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Complete tasks to earn your first badge!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

