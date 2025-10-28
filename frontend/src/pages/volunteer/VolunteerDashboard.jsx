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
  X,
  Users,
} from "lucide-react";
import VolSidebar from "@/components/layout/sidebars/VolSidebar";
import VolunteerNavbar from "@/components/layout/navbars/VolunteerNavbar";
import MetricCard from "@/components/volunteer-dashboard/metrics/MetricCard";
import Notifications from "@/components/volunteer-dashboard/notifications/Notifications";
import ProgressCard from "@/components/volunteer-dashboard/metrics/ProgressCard";
// import RecentBadges from "@/components/volunteer-dashboard/community/RecentBadges";
// import TopVolunteers from "@/components/volunteer-dashboard/community/TopVolunteers";
import ProofUploadModal from "@/components/volunteer-dashboard/opportunities/ProofUploadModal";
import { getOpportunityById } from "@/services/api";
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
  const [viewModal, setViewModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const [viewProofModal, setViewProofModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);

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
      console.log(
        `📖 Before: ${prev.length} notifications, After: ${updated.length} notifications`
      );
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
    if (!volunteerId) return;

    // Register volunteer socket once
    registerUserSocket(volunteerId, role);

    // --- 🔔 Notification listener ---
    socket.off("newNotification").on("newNotification", (notif) => {
      if (!window._shownNotifs) window._shownNotifs = new Set();
      if (window._shownNotifs.has(notif._id)) return;
      window._shownNotifs.add(notif._id);

      toast.info(`${notif.title}: ${notif.message}`, { autoClose: 4000 });

      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === notif._id);
        if (exists) return prev;

        const updated = [notif, ...prev]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 50);

        return updated;
      });
    });

    // --- Suspension listener (no toast, just redirect) ---
    socket.off("suspended").on("suspended", (data) => {
      const reason = data.reason || "No reason provided.";
      console.warn(`Account suspended. Reason: ${reason}`);
      localStorage.clear();
      window.location.href = "/suspended";
    });

    // --- Reactivation listener ---
    socket.off("reactivated").on("reactivated", () => {
      toast.success("✅ Your account has been reactivated!", {
        autoClose: 5000,
      });
      localStorage.setItem("justReactivated", "true");
    });

    // --- Reconnect listener ---
    socket.off("connect").on("connect", () => {
      console.log("🔄 Socket reconnected, refreshing dashboard...");
      if (volunteerId) registerUserSocket(volunteerId, role);
    });

    // Cleanup
    return () => {
      socket.off("newNotification");
      socket.off("suspended");
      socket.off("reactivated");
      socket.off("connect");
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
            const existingIndex = acc.findIndex(
              (item) => item._id === current._id
            );
            if (existingIndex === -1) {
              acc.push(current);
            } else {
              // Keep the more recent version if duplicate
              if (
                new Date(current.createdAt) >
                new Date(acc[existingIndex].createdAt)
              ) {
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

  const handleViewOpportunity = async (taskId) => {
    try {
      const res = await getOpportunityById(taskId);
      setSelectedOpportunity(res.data);
      setViewModal(true);
    } catch (err) {
      toast.error("Failed to load opportunity details.");
    }
  };

  const handleViewProof = (proofPath) => {
    if (!proofPath) {
      toast.info("No proof uploaded for this task yet.");
      return;
    }
    setSelectedProof(proofPath);
    setViewProofModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <VolSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <VolunteerNavbar
          onToggleSidebar={toggleSidebar}
          notifCount={notifications.filter((n) => !n.isRead).length}
          notifications={notifications}
        />

        <main className="flex-1 p-4 sm:p-6">
          {/* Header - Improved alignment */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back,{" "}
                <span className="text-green-700 font-semibold">
                  {volunteerName}!
                </span>
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Ready to make a difference today?
              </p>
            </div>
          </div>

          {/* Top metrics - Improved grid alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <MetricCard
              title="Total Points"
              value={overview?.points}
              gradient="from-green-500 to-emerald-500"
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
              gradient="from-amber-400 to-orange-400"
              icon="badge"
              loading={loading}
            />
          </div>

          {/* Main grid - Improved responsive layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Tabs - Improved alignment */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex space-x-1 p-2 border-b border-gray-200 bg-gray-50">
                  {[
                    { id: "active", label: "Active Tasks" },
                    { id: "completed", label: "Completed Tasks" },
                    { id: "badges", label: "Badges & Points" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-white text-green-600 shadow-sm border border-gray-200"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 sm:p-6">
                  {/* ✅ Active Tasks */}
                  {activeTab === "active" && (
                    <div className="space-y-4">
                      {!loading && tasks.active.length === 0 && (
                        <div className="flex items-start gap-3 p-4 border border-green-100 bg-green-50 rounded-xl">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <Info size={18} className="text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                              You haven't joined any active opportunities yet
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Join an opportunity from the{" "}
                              <span className="font-medium text-green-600">
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
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all bg-white relative overflow-hidden"
                        >
                          {/* Gradient Accent Bar */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {t.title}
                            </h3>
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full self-start sm:self-auto ${
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

                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-4">
                            {t.date && (
                              <span className="flex items-center gap-2">
                                <Calendar
                                  size={16}
                                  className="text-green-600"
                                />
                                {new Date(t.date).toLocaleDateString()}
                              </span>
                            )}
                            {t.duration && (
                              <span className="flex items-center gap-2">
                                <Clock size={16} className="text-green-600" />
                                {t.duration}
                              </span>
                            )}
                            {t.location && (
                              <span className="flex items-center gap-2">
                                <MapPin size={16} className="text-green-600" />
                                {t.location}
                              </span>
                            )}
                            <span className="flex items-center gap-2">
                              <Users size={16} className="text-green-600" />
                              {t.volunteers?.length || 0} / {t.volunteersNeeded || 1} volunteers
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleViewOpportunity(t._id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition flex-1 sm:flex-none justify-center"
                            >
                              <Eye size={16} /> View
                            </button>
                            <button
                              onClick={() => handleSubmitProof(t._id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition flex-1 sm:flex-none justify-center"
                            >
                              <UploadCloud size={16} /> Submit Proof
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Completed Tasks */}
                  {activeTab === "completed" && (
                    <div className="space-y-4">
                      {!loading && tasks.completed.length === 0 && (
                        <div className="flex items-start gap-3 p-4 border border-amber-100 bg-amber-50 rounded-xl">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <Trophy size={18} className="text-amber-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                              You haven't completed any tasks yet
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Keep going! Once you finish your first activity,
                              it will appear here with your earned points and
                              badges.
                            </p>
                            {/* <button
                              onClick={() => {
                                if (t.proofFile) {
                                  setSelectedProof(t.proofFile);
                                  setViewProofModal(true);
                                } else {
                                  toast.info(
                                    "No proof uploaded for this task yet."
                                  );
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition w-full justify-center sm:w-auto"
                            >
                              <Eye size={16} /> View Proof
                            </button> */}
                          </div>
                        </div>
                      )}
                      {loading && (
                        <div className="h-24 bg-gray-100 rounded animate-pulse" />
                      )}

                      {tasks.completed.map((t) => (
                        <div
                          key={t._id}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all bg-white"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {t.title}
                            </h3>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 self-start sm:self-auto">
                              Completed
                            </span>
                          </div>

                          <p className="text-sm text-gray-700 mb-3">
                            <span className="font-medium">Organization:</span>{" "}
                            {t.organization?.orgName || "Community Partner"}
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-4 font-medium">
                            {t.date && (
                              <span className="flex items-center gap-2">
                                <Calendar
                                  size={16}
                                  className="text-green-600"
                                />
                                {new Date(t.date).toLocaleDateString()}
                              </span>
                            )}
                            {t.duration && (
                              <span className="flex items-center gap-2">
                                <Clock size={16} className="text-green-600" />
                                {t.duration}
                              </span>
                            )}
                            {t.location && (
                              <span className="flex items-center gap-2">
                                <MapPin size={16} className="text-green-600" />
                                {t.location}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              const volunteerId =
                                localStorage.getItem("volunteerId");
                              const proof =
                                t.completionProofs?.find(
                                  (p) =>
                                    p.volunteer?._id === volunteerId ||
                                    p.volunteer === volunteerId
                                )?.fileUrl || null;

                              if (!proof) {
                                toast.info(
                                  "No proof uploaded for this task yet."
                                );
                              } else {
                                handleViewProof(proof);
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition w-full justify-center sm:w-auto"
                          >
                            <Eye size={16} /> View Proof
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 🏅 Badges & Points Tab */}
                  {activeTab === "badges" && (
                    <div className="space-y-6">
                      <div className="text-center sm:text-left">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 justify-center sm:justify-start">
                          <Medal size={22} className="text-green-600" />
                          Your Achievements
                        </h3>
                      </div>

                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 text-center shadow-md">
                          <p className="text-sm opacity-90">Total Points</p>
                          <p className="text-3xl font-bold mt-1">
                            {overview?.points || 0}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl p-4 text-center shadow-md">
                          <p className="text-sm opacity-90">Completed Tasks</p>
                          <p className="text-3xl font-bold mt-1">
                            {overview?.completedTasks || 0}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl p-4 text-center shadow-md">
                          <p className="text-sm opacity-90">Badges Earned</p>
                          <p className="text-3xl font-bold mt-1">
                            {overview?.badgesCount || badges?.length || 0}
                          </p>
                        </div>
                      </div>

                      {/* Earned Badges Section */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 justify-center sm:justify-start">
                          <Award size={22} className="text-amber-500" />
                          Earned Badges
                        </h4>

                        {badges.length === 0 ? (
                          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                            <p className="text-gray-600 italic">
                              You haven't earned any badges yet.
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Complete more volunteering opportunities to earn
                              your first one!
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {badges.map((b) => (
                              <div
                                key={b._id || b.name}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition text-center"
                              >
                                <div className="text-3xl mb-2">
                                  {b.icon || "🏅"}
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {b.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
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
              </div>
            </div>

            {/* Right Column - Sidebar widgets */}
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

              <ProgressCard progress={progress} loading={loading} />
              {/* <RecentBadges badges={badges} loading={loading} /> */}
              {/* <TopVolunteers items={top} loading={loading} /> */}
            </div>
          </div>
        </main>
      </div>

      {/* Proof Modal */}
      {showProofModal && (
        <ProofUploadModal
          opportunityId={selectedTaskId}
          onClose={() => setShowProofModal(false)}
          onProofSubmitted={() => setProofStatus("Pending")}
        />
      )}

      {/* Enhanced View Opportunity Modal */}
      {viewModal && selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Calendar size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Opportunity Details
                      </h2>
                      <p className="text-green-100 text-sm mt-1">
                        {selectedOpportunity.organization?.orgName ||
                          "Community Partner"}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewModal(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {/* Title and Status */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {selectedOpportunity.title}
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <Clock size={14} />
                  Active Opportunity
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedOpportunity.date && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedOpportunity.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {selectedOpportunity.duration && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Duration
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedOpportunity.duration}
                      </p>
                    </div>
                  </div>
                )}

                {selectedOpportunity.location && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Location
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedOpportunity.location}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Users size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Volunteers</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOpportunity.volunteers?.length || 0} / {selectedOpportunity.volunteersNeeded || 1}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info size={18} className="text-gray-600" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    Description
                  </h4>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedOpportunity.description ||
                      "No description available."}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setViewModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 rounded-lg font-medium shadow hover:shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <X size={16} />
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Enhanced & Aligned View Proof Modal */}
      {viewProofModal && selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Eye size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Proof Submission
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    View your submitted evidence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewProofModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Proof Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-dashed border-gray-300 shadow-inner">
                {selectedProof.endsWith(".pdf") ? (
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* PDF Header */}
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-3">
                        <span className="text-3xl">📄</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        PDF Document
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your submitted PDF proof
                      </p>
                    </div>

                    {/* PDF Viewer */}
                    <div className="w-full bg-white rounded-xl border border-gray-300 shadow-lg overflow-hidden">
                      <iframe
                        src={`http://localhost:5000${selectedProof}`}
                        title="Proof PDF"
                        className="w-full h-[500px]"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Image Header */}
                    <div className="flex flex-col items-center">
                      <p className="text-lg font-semibold text-gray-900">
                        Image Proof
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your submitted image evidence
                      </p>
                    </div>

                    {/* Image Display */}
                    <div className="flex justify-center w-full">
                      <div className="relative rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg bg-white max-w-2xl">
                        <img
                          src={`http://localhost:5000${selectedProof}`}
                          alt="Proof submission"
                          className="max-h-[500px] w-auto object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/api/placeholder/600/400";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Proof Info Section */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Info size={14} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-green-900">
                        Proof Status:
                      </p>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Verified
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      This proof has been successfully submitted and verified by
                      the organization. Your contribution has been recorded and
                      points have been awarded.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>Submitted on {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex gap-3">
                {!selectedProof.endsWith(".pdf") && (
                  <a
                    href={`http://localhost:5000${selectedProof}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg font-medium shadow hover:shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Open Original
                  </a>
                )}
                <button
                  onClick={() => setViewProofModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 rounded-lg font-medium shadow hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <X size={16} />
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
