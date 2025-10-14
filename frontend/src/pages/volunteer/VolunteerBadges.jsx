import React, { useEffect, useState } from "react";
import { Award, Star, Trophy, Zap, Crown, Flame } from "lucide-react";
import { getVolunteerOverview } from "@/services/volunteer.api";
import VolSidebar from "@/components/layout/sidebars/VolSidebar";
import VolunteerNavbar from "@/components/layout/navbars/VolunteerNavbar";

export default function VolunteerBadges() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const ALL_BADGES = [
    {
      name: "First Step",
      description: "Completed your first volunteering task!",
      icon: <Star className="text-yellow-400 w-8 h-8" />,
      milestone: 1,
      gradient: "from-yellow-400 to-yellow-600",
    },
    {
      name: "Active Helper",
      description: "Completed 3 volunteering tasks — consistency matters!",
      icon: <Zap className="text-orange-500 w-8 h-8" />,
      milestone: 3,
      gradient: "from-orange-400 to-orange-600",
    },
    {
      name: "Helping Hand",
      description: "Completed 5 volunteering tasks — you're making an impact!",
      icon: <Award className="text-blue-500 w-8 h-8" />,
      milestone: 5,
      gradient: "from-blue-400 to-blue-600",
    },
    {
      name: "Community Hero",
      description: "Completed 10 volunteering tasks — outstanding dedication!",
      icon: <Trophy className="text-green-500 w-8 h-8" />,
      milestone: 10,
      gradient: "from-green-400 to-green-600",
    },
    {
      name: "Neighborhood Legend",
      description: "Completed 20 volunteering tasks — inspiring passion!",
      icon: <Flame className="text-pink-500 w-8 h-8" />,
      milestone: 20,
      gradient: "from-pink-400 to-pink-600",
    },
    {
      name: "Volunteer Champion",
      description: "Completed 30 volunteering tasks — a true force for good!",
      icon: <Crown className="text-purple-500 w-8 h-8" />,
      milestone: 30,
      gradient: "from-purple-400 to-purple-600",
    },
  ];

  useEffect(() => {
    // Try loading cached data first
    const cached = localStorage.getItem("volunteerOverview");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setVolunteer(parsed);
        setLoading(false); // Immediately show cached data
      } catch {
        console.warn("Corrupted volunteer cache, refetching...");
      }
    }

    // Fetch fresh data in background
    const fetchData = async () => {
      try {
        const res = await getVolunteerOverview();
        if (res?.data) {
          setVolunteer(res.data);
          localStorage.setItem("volunteerOverview", JSON.stringify(res.data));
        }
      } catch (err) {
        console.error("Failed to fetch volunteer info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completed = volunteer?.completedTasks || 0;
  const earnedNames = (volunteer?.badges || []).map((b) => b.name);

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

        <main className="flex-1 px-8 py-10 overflow-y-auto animate-fadeInUp">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10 transition-opacity duration-300">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex justify-center items-center gap-2">
                🏅 Your Rewards & Badges
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Earn badges as you complete more tasks! Each milestone recognizes your growth and dedication as a volunteer.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12">
              <Stat label="Points" value={volunteer?.points || 0} color="text-blue-600" />
              <Stat label="Tasks Completed" value={completed} color="text-amber-500" />
              <Stat label="Badges Earned" value={earnedNames.length} color="text-green-600" />
            </div>

            {/* All Badges Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {ALL_BADGES.map((badge, index) => {
                const earned = earnedNames.includes(badge.name);
                const locked = completed < badge.milestone;

                return (
                  <div
                    key={index}
                    className={`relative p-6 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                      earned ? "bg-gradient-to-br from-green-50 to-white" : "bg-white"
                    } animate-fadeInDelay`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative flex flex-col items-center text-center">
                      <div
                        className={`mb-3 flex items-center justify-center w-16 h-16 rounded-full ${
                          earned ? `bg-gradient-to-br ${badge.gradient}` : "bg-gray-200"
                        }`}
                      >
                        {badge.icon}
                      </div>

                      <h3 className={`font-bold text-lg ${earned ? "text-gray-900" : "text-gray-500"}`}>
                        {badge.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 max-w-xs">{badge.description}</p>

                      {/* Milestone Progress */}
                      <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            earned ? `bg-gradient-to-r ${badge.gradient}` : "bg-gray-300"
                          }`}
                          style={{
                            width: `${Math.min((completed / badge.milestone) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        {locked
                          ? `Complete ${badge.milestone} task${badge.milestone > 1 ? "s" : ""} to unlock`
                          : earned
                          ? "Unlocked 🎉"
                          : "Almost there!"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Simple stat card component
function Stat({ label, value, color }) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl px-8 py-5 flex flex-col items-center w-full sm:w-60 animate-fadeInUp">
      <span className={`text-4xl font-bold ${color}`}>{value}</span>
      <span className="text-gray-600 font-medium">{label}</span>
    </div>
  );
}