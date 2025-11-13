import React, { useEffect, useState } from "react";
import { Star, Zap, Award, Trophy, Flame, Crown, Medal, Sparkles } from "lucide-react";
import { getVolunteerOverview } from "@/services/volunteer.api";
import VolunteerSidebar from "@/components/layout/sidebars/VolunteerSidebar";
import VolunteerNavbar from "@/components/layout/navbars/VolunteerNavbar";

export default function VolunteerBadges() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const ALL_BADGES = [
    {
      name: "First Step",
      description: "Completed your first volunteering task!",
      icon: <Star className="w-6 h-6" />,
      milestone: 1,
      gradient: "from-yellow-400 to-yellow-600",
      bgGradient: "from-yellow-50 to-amber-50",
      iconColor: "text-yellow-400"
    },
    {
      name: "Active Helper",
      description: "Completed 2 volunteering tasks",
      icon: <Zap className="w-6 h-6" />,
      milestone: 2,
      gradient: "from-orange-400 to-orange-600",
      bgGradient: "from-orange-50 to-amber-50",
      iconColor: "text-orange-500"
    },
    {
      name: "Helping Hand",
      description: "Completed 3 volunteering tasks",
      icon: <Award className="w-6 h-6" />,
      milestone: 3,
      gradient: "from-blue-400 to-blue-600",
      bgGradient: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-500"
    },
    {
      name: "Community Hero",
      description: "Completed 4 volunteering tasks",
      icon: <Trophy className="w-6 h-6" />,
      milestone: 4,
      gradient: "from-green-400 to-green-600",
      bgGradient: "from-green-50 to-emerald-50",
      iconColor: "text-green-500"
    },
    {
      name: "Neighborhood Legend",
      description: "Completed 5 volunteering tasks",
      icon: <Flame className="w-6 h-6" />,
      milestone: 5,
      gradient: "from-pink-400 to-pink-600",
      bgGradient: "from-pink-50 to-rose-50",
      iconColor: "text-pink-500"
    },
    {
      name: "Volunteer Champion",
      description: "Completed 6 volunteering tasks",
      icon: <Crown className="w-6 h-6" />,
      milestone: 6,
      gradient: "from-purple-400 to-purple-600",
      bgGradient: "from-purple-50 to-violet-50",
      iconColor: "text-purple-500"
    },
    {
      name: "Volunteer Master",
      description: "Completed 7 volunteering tasks",
      icon: <Medal className="w-6 h-6" />,
      milestone: 7,
      gradient: "from-indigo-400 to-indigo-600",
      bgGradient: "from-indigo-50 to-blue-50",
      iconColor: "text-indigo-500"
    },
    {
      name: "Volunteer Legend",
      description: "Completed 8 volunteering tasks",
      icon: <Sparkles className="w-6 h-6" />,
      milestone: 8,
      gradient: "from-yellow-400 to-yellow-600",
      bgGradient: "from-amber-50 to-yellow-50",
      iconColor: "text-yellow-500"
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getVolunteerOverview();
        if (res?.data) {
          setVolunteer(res.data);
          localStorage.setItem("volunteerOverview", JSON.stringify(res.data));
        }
      } catch (err) {
        console.error("Failed to fetch volunteer info:", err);
        const cached = localStorage.getItem("volunteerOverview");
        if (cached) {
          try {
            setVolunteer(JSON.parse(cached));
          } catch {
            console.warn("Corrupted volunteer cache");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completed = volunteer?.completedTasks || 0;
  const earnedNames = (volunteer?.badges || []).map((b) => b.name);
  const earnedBadges = ALL_BADGES.filter(badge => earnedNames.includes(badge.name));
  const lockedBadges = ALL_BADGES.filter(badge => !earnedNames.includes(badge.name));

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <VolunteerSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 flex flex-col min-w-0">
          <VolunteerNavbar onToggleSidebar={toggleSidebar} />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600 text-sm">Loading your achievements...</p>
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

        <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow mb-4">
                <span className="text-2xl">🏅</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Your Rewards & Badges
              </h1>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Earn badges as you complete more tasks and make a difference.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard 
                label="Points" 
                value={volunteer?.points || 0} 
                gradient="from-blue-500 to-cyan-500"
              />
              <StatCard 
                label="Tasks Done" 
                value={completed} 
                gradient="from-green-500 to-emerald-500"
              />
              <StatCard 
                label="Badges" 
                value={earnedNames.length} 
                gradient="from-purple-500 to-pink-500"
              />
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Your Progress</h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {completed}/{ALL_BADGES.length} milestones
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-700"
                  style={{ width: `${(completed / ALL_BADGES.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 text-center">
                {ALL_BADGES.length - earnedNames.length} more to unlock all badges
              </p>
            </div>

            {/* Badges Grid */}
            <div className="space-y-8">
              {/* Earned Badges Section */}
              {earnedBadges.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-green-400 to-emerald-600 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900">Earned Badges</h2>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
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

              {/* Locked Badges Section */}
              {lockedBadges.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Badges</h2>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
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

// Compact Stat Card Component
function StatCard({ label, value, gradient }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
      <p className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1`}>
        {value}
      </p>
      <p className="text-xs font-medium text-gray-600">{label}</p>
    </div>
  );
}

// Fixed Badge Card Component with visible icons
function BadgeCard({ badge, earned, completed }) {
  const progress = Math.min((completed / badge.milestone) * 100, 100);
  
  return (
    <div className={`
      relative p-4 rounded-lg border transition-all duration-300
      ${earned 
        ? `border-transparent bg-gradient-to-br ${badge.bgGradient} shadow-sm` 
        : 'border-gray-200 bg-white'
      }
    `}>
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Badge Icon - Fixed to show icon color properly */}
        <div className={`
          flex items-center justify-center w-14 h-14 rounded-xl transition-all relative
          ${earned 
            ? `bg-gradient-to-br ${badge.gradient} shadow` 
            : 'bg-gray-200'
          }
        `}>
          <div className={`
            ${earned ? 'text-white' : badge.iconColor}
          `}>
            {badge.icon}
          </div>
          {earned && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white">
              <span className="text-white text-[10px] font-bold">✓</span>
            </div>
          )}
        </div>

        {/* Badge Content */}
        <div className="space-y-2 w-full">
          <h3 className={`
            font-semibold text-sm transition-colors
            ${earned ? 'text-gray-900' : 'text-gray-500'}
          `}>
            {badge.name}
          </h3>
          <p className="text-xs text-gray-500 leading-tight">
            {badge.description}
          </p>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`
                  h-1.5 rounded-full transition-all duration-700
                  ${earned ? `bg-gradient-to-r ${badge.gradient}` : 'bg-gray-300'}
                `}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className={`
              text-xs font-medium
              ${earned ? 'text-green-600' : 'text-gray-500'}
            `}>
              {!earned && completed < badge.milestone
                ? `${badge.milestone - completed} to go`
                : earned
                ? "Unlocked"
                : "Ready!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}