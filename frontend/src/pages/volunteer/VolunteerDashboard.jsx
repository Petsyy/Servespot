import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, UploadCloud, Calendar, Clock, MapPin } from "lucide-react";
import VolSidebar from "@/components/layout/sidebars/VolSidebar";
import MetricCard from "@/components/volunteer-dashboard/metrics/MetricCard";
import Notifications from "@/components/volunteer-dashboard/notifications/Notifications";
import ProgressCard from "@/components/volunteer-dashboard/metrics/ProgressCard";
import RecentBadges from "@/components/volunteer-dashboard/community/RecentBadges";
import TopVolunteers from "@/components/volunteer-dashboard/community/TopVolunteers";
import ProofUploadModal from "@/components/volunteer-dashboard/opportunities/ProofUploadModal";
import {
  getVolunteerOverview,
  getVolunteerTasks,
  getVolunteerNotifications,
  getVolunteerProgress,
  getVolunteerBadges,
  getTopVolunteers,
  getOpportunityById,
} from "@/services/api";

export default function VolunteerDashboard() {
  const navigate = useNavigate();

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
        if (notifRes.status === "fulfilled")
          setNotifications(notifRes.value.data || []);
        if (progRes.status === "fulfilled") setProgress(progRes.value.data);
        if (badgesRes.status === "fulfilled")
          setBadges(badgesRes.value.data || []);
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
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // ✅ Handle Submit Proof
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
      <VolSidebar />

      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{overview?.firstName ? `, ${overview.firstName}` : ""}
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
                    <p className="text-sm text-gray-500">
                      No active tasks yet.
                    </p>
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

              {/* ✅ Completed Tasks */}
              {activeTab === "completed" && (
                <>
                  {!loading && tasks.completed.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No completed tasks yet.
                    </p>
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

              {/* Badges */}
              {activeTab === "badges" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Badges & Points
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {badges.map((b) => (
                      <div
                        key={b._id}
                        className="flex flex-col items-center justify-center border border-gray-200 rounded-lg p-3"
                      >
                        <img
                          src={b.iconUrl}
                          alt={b.name}
                          className="w-12 h-12 object-contain mb-2"
                        />
                        <p className="text-sm font-medium text-gray-700">
                          {b.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Total Points:{" "}
                    <span className="font-semibold text-blue-600">
                      {overview?.points || 0}
                    </span>
                  </p>
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
            <Notifications items={notifications} loading={loading} />
            <ProgressCard progress={progress} loading={loading} />
            <RecentBadges badges={badges} loading={loading} />
            <TopVolunteers items={top} loading={loading} />
          </div>
        </div>
      </main>

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
