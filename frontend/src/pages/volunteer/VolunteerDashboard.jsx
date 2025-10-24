import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { showNewBadgeAlert } from "@/utils/badgeAlerts";
import { io } from "socket.io-client";
import {
  Eye,
  UploadCloud,
  Calendar,
  Clock,
  MapPin,
  Medal,
  Award,
  Info,
  Trophy,
} from "lucide-react";
import VolSidebar from "@/components/layout/sidebars/VolSidebar";
import VolunteerNavbar from "@/components/layout/navbars/VolunteerNavbar";
import MetricCard from "@/components/volunteer-dashboard/metrics/MetricCard";
import Notifications from "@/components/volunteer-dashboard/notifications/Notifications";
import ProgressCard from "@/components/volunteer-dashboard/metrics/ProgressCard";
import RecentBadges from "@/components/volunteer-dashboard/community/RecentBadges";
import TopVolunteers from "@/components/volunteer-dashboard/community/TopVolunteers";
import ProofUploadModal from "@/components/volunteer-dashboard/opportunities/ProofUploadModal";
import getOpportunityById from "@/services/api";
import { socket, registerUserSocket } from "@/utils/socket";
import {
  getVolunteerOverview,
  getVolunteerTasks,
  getVolunteerNotifications,
  getVolunteerProgress,
  getVolunteerBadges,
  getTopVolunteers,
} from "@/services/volunteer.api";

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [overview, setOverview] = useState(null);
  const [tasks, setTasks] = useState({ all: [], active: [], completed: [] });
  const [notifications, setNotifications] = useState([]);
  const [progress, setProgress] = useState(null);
  const [badges, setBadges] = useState([]);
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [proofStatus, setProofStatus] = useState(null);

  // Add volunteer name state
  const [volunteerName, setVolunteerName] = useState(
    localStorage.getItem("volunteerName") || "Volunteer"
  );

  // Clean up old notifications (older than 30 days for dashboard)
  const cleanupOldNotifications = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    setNotifications((prev) => 
      prev.filter((n) => new Date(n.createdAt) > thirtyDaysAgo)
    );
  };

  // Mark notification as read
  const markNotificationRead = (notificationId) => {
    console.log(`📖 Marking notification as read: ${notificationId}`);
    setNotifications((prev) => {
      const updated = prev.map((n) => 
        n._id === notificationId ? { ...n, isRead: true } : n
      );
      console.log(`📖 Before: ${prev.length} notifications, After: ${updated.length} notifications`);
      return updated;
    });
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // ✅ Validate session and ensure volunteer context
  useEffect(() => {
    const volToken = localStorage.getItem("volToken");
    const activeRole = localStorage.getItem("activeRole");

    if (!volToken) {
      console.warn("No volunteer token found — redirecting to login");
      navigate("/volunteer/login");
      return;
    }

    if (activeRole !== "volunteer") {
      console.warn("Restoring volunteer session context...");
      localStorage.setItem("token", volToken);
      localStorage.setItem("activeRole", "volunteer");
    }

    localStorage.setItem("token", volToken);
  }, [navigate]);

  useEffect(() => {
    const volunteerId = localStorage.getItem("volunteerId");
    const role = "volunteer";
    if (volunteerId) registerUserSocket(volunteerId, role);

    socket.on("newNotification", (notif) => {
      toast.info(`🔔 ${notif.title}: ${notif.message}`, { autoClose: 5000 });
      
      setNotifications((prev) => {
        // Check if notification already exists to prevent duplicates
        const exists = prev.some(n => n._id === notif._id);
        if (exists) {
          return prev;
        }
        
        // Add new notification and limit to 50 for dashboard
        const updated = [notif, ...prev]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 50);
        
        return updated;
      });
    });

    return () => socket.off("newNotification");
  }, []);

  useEffect(() => {
  socket.on("connect", () => {
    console.log("Socket reconnected, refreshing dashboard...");
    const volunteerId = localStorage.getItem("volunteerId");
    if (volunteerId) registerUserSocket(volunteerId, "volunteer");
  });
  return () => socket.off("connect");
}, []);


  // Unified socket setup for volunteer notifications & suspension/reactivation
  useEffect(() => {
    const volunteerId = localStorage.getItem("volunteerId");
    const role = "volunteer";
    if (!volunteerId) return;

    // Register this volunteer socket
    registerUserSocket(volunteerId, role);

    // Notification listener
    socket.on("newNotification", (notif) => {
      toast.info(`${notif.title}: ${notif.message}`, { autoClose: 5000 });
      
      setNotifications((prev) => {
        // Check if notification already exists to prevent duplicates
        const exists = prev.some(n => n._id === notif._id);
        if (exists) {
          return prev;
        }
        
        // Add new notification and limit to 50 for dashboard
        const updated = [notif, ...prev]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 50);
        
        return updated;
      });
    });

    // Suspension listener
    socket.on("suspended", (data) => {
      const reason = data.reason || "No reason provided.";
      toast.error(` Your account has been suspended.\nReason: ${reason}`, {
        autoClose: 6000,
      });

      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/suspended";
      }, 3000);
    });

    // Reactivation listener
    socket.on("reactivated", () => {
      toast.success("✅ Your account has been reactivated!", {
        autoClose: 5000,
      });
      localStorage.setItem("justReactivated", "true");
    });

    return () => {
      socket.off("newNotification");
      socket.off("suspended");
      socket.off("reactivated");
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Fetch all volunteer dashboard data
        const [ovrRes, tasksRes, notifRes, progRes, badgesRes, topRes] =
          await Promise.allSettled([
            getVolunteerOverview(),
            getVolunteerTasks(),
            getVolunteerNotifications(),
            getVolunteerProgress(),
            getVolunteerBadges(),
            getTopVolunteers(),
          ]);

        if (!mounted) return;

        if (ovrRes.status === "fulfilled") setOverview(ovrRes.value.data);
        if (notifRes.status === "fulfilled") {
          const notifs = notifRes.value.data || [];
          
          // Deduplicate notifications by ID and limit to 20 for dashboard
          const uniqueNotifs = notifs.reduce((acc, current) => {
            const existingIndex = acc.findIndex(item => item._id === current._id);
            if (existingIndex === -1) {
              acc.push(current);
            } else {
              // Keep the more recent version if duplicate
              if (new Date(current.createdAt) > new Date(acc[existingIndex].createdAt)) {
                acc[existingIndex] = current;
              }
            }
            return acc;
          }, []);
          
          // Sort by creation date (newest first) and limit to 50
          const sortedNotifs = uniqueNotifs
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 50);
          
          setNotifications(sortedNotifs);
          console.log(`Dashboard: Loaded ${sortedNotifs.length} notifications`);
        }
        if (progRes.status === "fulfilled") setProgress(progRes.value.data);

        // Badge Handling + New Badge Popup (final, persistent version)
        if (badgesRes.status === "fulfilled") {
          const data = badgesRes.value.data;
          let normalized = [];

          if (Array.isArray(data?.badges)) normalized = data.badges;
          else if (Array.isArray(data)) normalized = data;
          else normalized = [];

          setBadges(normalized);
          localStorage.setItem("earnedBadges", JSON.stringify(normalized));

          const shownBadgeIds = JSON.parse(
            localStorage.getItem("shownBadgeIds") || "[]"
          );

          const newBadges = normalized.filter((badge) => {
            const badgeId = badge._id || badge.id || badge.name;
            return !shownBadgeIds.includes(badgeId);
          });

          const firstLoad = sessionStorage.getItem("firstDashboardLoad");
          const justReactivated = localStorage.getItem("justReactivated");
          if (!firstLoad || justReactivated) {
            sessionStorage.setItem("firstDashboardLoad", "true");

            // Mark all badges as shown but skip showing confetti
            if (newBadges.length > 0) {
              const updatedIds = [
                ...shownBadgeIds,
                ...newBadges.map((b) => b._id || b.id || b.name),
              ];
              localStorage.setItem("shownBadgeIds", JSON.stringify(updatedIds));
            }

            // Remove the reactivation flag
            localStorage.removeItem("justReactivated");
            return; // skip confetti & sounds
          }

          // Only trigger if new badges appear during active session
          if (newBadges.length > 0) {
            const updatedShownBadgeIds = [
              ...shownBadgeIds,
              ...newBadges.map((badge) => badge._id || badge.id || badge.name),
            ];
            localStorage.setItem(
              "shownBadgeIds",
              JSON.stringify(updatedShownBadgeIds)
            );
            newBadges.forEach((badge) => showNewBadgeAlert(badge));
          }
        }

        if (topRes.status === "fulfilled") setTop(topRes.value.data || []);

        // Filter tasks by backend status
        if (tasksRes.status === "fulfilled") {
          const allTasks = tasksRes.value.data || [];
          const active = allTasks.filter(
            (t) => t.status === "Open" || t.status === "In Progress"
          );
          const completed = allTasks.filter((t) => t.status === "Completed");
          setTasks({ all: allTasks, active, completed });
        }
      } catch (e) {
        console.error("Volunteer dashboard load failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Auto-check for new badges every 10 seconds
    const badgeInterval = setInterval(async () => {
      try {
        const res = await getVolunteerBadges();
        const latest = res.data?.badges || res.data || [];

        const shownBadgeIds = JSON.parse(
          localStorage.getItem("shownBadgeIds") || "[]"
        );

        // Find new badges
        const newBadges = latest.filter((badge) => {
          const badgeId = badge._id || badge.id || badge.name;
          return !shownBadgeIds.includes(badgeId);
        });

        if (newBadges.length > 0) {
          // Update storage FIRST
          const updatedShownBadgeIds = [
            ...shownBadgeIds,
            ...newBadges.map((badge) => badge._id || badge.id || badge.name),
          ];
          localStorage.setItem(
            "shownBadgeIds",
            JSON.stringify(updatedShownBadgeIds)
          );

          // Then show alerts
          newBadges.forEach((b) => showNewBadgeAlert(b));
        }

        // Always update UI
        setBadges(latest);
        localStorage.setItem("earnedBadges", JSON.stringify(latest));
      } catch (err) {
        console.warn("Badge auto-check failed:", err);
      }
    }, 10000);

    // Set up periodic cleanup every 30 minutes (less aggressive)
    const cleanupInterval = setInterval(() => {
      cleanupOldNotifications();
    }, 1800000); // 30 minutes

    return () => {
      mounted = false;
      clearInterval(badgeInterval);
      clearInterval(cleanupInterval);
    };
  }, [navigate]);

  // Handle Submit Proof
  const handleSubmitProof = async (taskId) => {
    setSelectedTaskId(taskId);
    setShowProofModal(true);

    try {
      const res = await getOpportunityById(taskId);
      const volunteerId = localStorage.getItem("volunteerId");

      if (res.data?.completionProofs && volunteerId) {
        const proof = res.data.completionProofs.find(
          (p) =>
            p.volunteer._id === volunteerId ||
            p.volunteer.toString() === volunteerId
        );
        setProofStatus(proof ? proof.status : null);
      }
    } catch (err) {
      console.warn("Failed to fetch proof status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <VolSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col">
        <VolunteerNavbar
          onToggleSidebar={toggleSidebar}
          notifCount={notifications.filter((n) => !n.isRead).length}
          notifications={notifications}
        />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back,{" "}
                <span className="text-green-700 font-semibold">
                  {volunteerName}
                </span>
                !
              </h1>
              <p className="text-gray-600">Ready to make a difference today?</p>
            </div>
          </div>

          {/* Top metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <MetricCard
              title="Total Points"
              value={overview?.points}
              gradient="from-indigo-500 to-blue-500"
              icon="trending"
              loading={loading}
            />
            <MetricCard
              title="Hours Contributed"
              value={overview?.hours}
              gradient="from-green-400 to-teal-400"
              icon="timer"
              loading={loading}
            />
            <MetricCard
              title="Badges Earned"
              value={overview?.badgesCount}
              gradient="from-orange-400 to-amber-400"
              icon="badge"
              loading={loading}
            />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
            <div className="xl:col-span-2 space-y-4">
              {/* Tabs */}
              <div className="flex space-x-2 border-b border-gray-200">
                {[
                  { id: "active", label: "Active Tasks" },
                  { id: "completed", label: "Completed Tasks" },
                  { id: "badges", label: "Badges & Points" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                      activeTab === tab.id
                        ? "bg-white border-x border-t border-gray-200 text-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-white mt-2 space-y-4">
                {/* ✅ Active Tasks */}
                {activeTab === "active" && (
                  <>
                    {!loading && tasks.active.length === 0 && (
                      <div className="flex items-start gap-3 p-5 border border-blue-100 bg-blue-50/40 rounded-xl shadow-sm">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Info size={18} className="text-blue-600" />
                          </div>
                        </div>

                        {/* Message */}
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-gray-800">
                            You haven’t joined any active opportunities yet
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Join an opportunity from the{" "}
                            <span className="font-medium text-blue-600">
                              Browse
                            </span>{" "}
                            page to see it here.
                          </p>
                        </div>
                      </div>
                    )}
                    {loading && (
                      <div className="h-24 bg-gray-100 rounded animate-pulse" />
                    )}

                    {tasks.active.map((t) => (
                      <div
                        key={t._id}
                        className="border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {t.title}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              t.status === "Open"
                                ? "bg-green-100 text-green-700"
                                : t.status === "In Progress"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          <span className="font-medium">Organization:</span>{" "}
                          {t.organization?.orgName || "Community Partner"}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 text-sm text-gray-600 mb-4">
                          {t.date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={16} className="text-blue-600" />{" "}
                              {new Date(t.date).toLocaleDateString()}
                            </span>
                          )}
                          {t.duration && (
                            <span className="flex items-center gap-1">
                              <Clock size={16} className="text-blue-600" />{" "}
                              {t.duration}
                            </span>
                          )}
                          {t.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={16} className="text-blue-600" />{" "}
                              {t.location}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            onClick={() =>
                              navigate(`/volunteer/opportunity/${t._id}`)
                            }
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition"
                          >
                            <Eye size={16} /> View
                          </button>
                          <button
                            onClick={() => handleSubmitProof(t._id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-md transition"
                          >
                            <UploadCloud size={16} /> Submit Proof
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {/* Completed Tasks */}
                {activeTab === "completed" && (
                  <>
                    {!loading && tasks.completed.length === 0 && (
                      <div className="flex items-start gap-3 p-5 border border-yellow-100 bg-yellow-50/50 rounded-xl shadow-sm">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Trophy size={18} className="text-yellow-600" />
                          </div>
                        </div>

                        {/* Message */}
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-gray-800">
                            You haven’t completed any tasks yet
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Keep going! Once you finish your first activity, it
                            will appear here with your earned points and badges.
                          </p>
                        </div>
                      </div>
                    )}
                    {loading && (
                      <div className="h-24 bg-gray-100 rounded animate-pulse" />
                    )}

                    {tasks.completed.map((t) => (
                      <div
                        key={t._id}
                        className="border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {t.title}
                          </h3>
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            Completed
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          <span className="font-medium">Organization:</span>{" "}
                          {t.organization?.orgName || "Community Partner"}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-6 text-sm text-gray-600 mb-4 font-semibold">
                          {t.date && (
                            <span className="flex items-center gap-1">
                              <Calendar size={16} className="text-blue-600" />{" "}
                              {new Date(t.date).toLocaleDateString()}
                            </span>
                          )}
                          {t.duration && (
                            <span className="flex items-center gap-1">
                              <Clock size={16} className="text-blue-600" />{" "}
                              {t.duration}
                            </span>
                          )}
                          {t.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={16} className="text-blue-600" />{" "}
                              {t.location}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            navigate(`/volunteer/opportunity/${t._id}`)
                          }
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition"
                        >
                          <Eye size={16} /> View Proof
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {/* 🏅 Badges & Points Tab */}
                {activeTab === "badges" && (
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Medal size={22} className="text-blue-600" />
                        Your Achievements
                      </h3>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-2xl p-5 shadow-md text-center">
                        <p className="text-sm opacity-90">Total Points</p>
                        <p className="text-4xl font-extrabold mt-1">
                          {overview?.points || 0}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-2xl p-5 shadow-md text-center">
                        <p className="text-sm opacity-90">Completed Tasks</p>
                        <p className="text-4xl font-extrabold mt-1">
                          {overview?.completedTasks || 0}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl p-5 shadow-md text-center">
                        <p className="text-sm opacity-90">Badges Earned</p>
                        <p className="text-4xl font-extrabold mt-1">
                          {overview?.badgesCount || badges?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Earned Badges Section */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Award size={22} className="text-amber-500" />
                        Earned Badges
                      </h4>

                      {badges.length === 0 ? (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                          <p className="text-gray-600 italic">
                            You haven’t earned any badges yet.
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Complete more volunteering opportunities to earn
                            your first one!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                          {badges.map((b) => (
                            <div
                              key={b._id || b.name}
                              className="flex flex-col items-center justify-center p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
                            >
                              <div className="text-4xl mb-2">
                                {b.icon || "🏅"}
                              </div>
                              <p className="font-semibold text-gray-900 text-center">
                                {b.name}
                              </p>
                              <p className="text-xs text-gray-600 text-center mt-1">
                                {b.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <ul className="divide-y divide-gray-100"></ul>
              </div>
            </div>

            {/* Sidebar widgets */}
            <div className="space-y-6">
              <Notifications
                items={notifications}
                loading={loading}
                onMarkAllRead={() => {
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true }))
                  );
                }}
                onMarkRead={markNotificationRead}
                maxItems={3}
              />
              {/* Debug: Log what we're passing to Notifications (remove in production) */}
              {/* {console.log(`📊 Dashboard passing to Notifications:`, {
                notificationsCount: notifications.length,
                maxItems: 3,
                notifications: notifications.slice(0, 5).map(n => ({ id: n._id, title: n.title }))
              })} */}

              <ProgressCard progress={progress} loading={loading} />
              <RecentBadges badges={badges} loading={loading} />
              <TopVolunteers items={top} loading={loading} />
            </div>
          </div>
        </main>
      </div>

      {/* ✅ Proof Modal */}
      {showProofModal && (
        <ProofUploadModal
          opportunityId={selectedTaskId}
          onClose={() => setShowProofModal(false)}
          onProofSubmitted={() => setProofStatus("Pending")}
        />
      )}
    </div>
  );
}
