import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VolSidebar from "@/components/layout/sidebars/VolSidebar";
import MetricCard from "@/components/volunteer-dashboard/metrics/MetricCard";
import TaskCard from "@/components/volunteer-dashboard/opportunities/TaskCard";
import Notifications from "@/components/volunteer-dashboard/notifications/Notifications";
import ProgressCard from "@/components/volunteer-dashboard/metrics/ProgressCard";
import RecentBadges from "@/components/volunteer-dashboard/community/RecentBadges";
import TopVolunteers from "@/components/volunteer-dashboard/community/TopVolunteers";
import {
  getVolunteerOverview,
  getVolunteerTasks,
  getVolunteerNotifications,
  getVolunteerProgress,
  getVolunteerBadges,
  getTopVolunteers,
} from "@/services/api";

export default function VolunteerDashboard() {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [progress, setProgress] = useState(null);
  const [badges, setBadges] = useState([]);
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // ✅ tab state

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
        if (tasksRes.status === "fulfilled")
          setTasks(tasksRes.value.data || []);
        if (notifRes.status === "fulfilled")
          setNotifications(notifRes.value.data || []);
        if (progRes.status === "fulfilled") setProgress(progRes.value.data);
        if (badgesRes.status === "fulfilled")
          setBadges(badgesRes.value.data || []);
        if (topRes.status === "fulfilled") setTop(topRes.value.data || []);
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

  // ✅ Filter tasks by tab
  const activeTasks = tasks.filter((t) => t.status === "active" || t.status === "in progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <VolSidebar />

      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{overview?.firstName ? `, ${overview.firstName}` : ""}!
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
            {/* Tabs Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Progress</h2>
            </div>

            {/* ✅ Tabs */}
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

            {/* ✅ Tab Content Card (fixed width like original) */}
            <div className="rounded-xl border border-gray-200 p-4 bg-white mt-2 space-y-4">
              {activeTab === "active" && (
                <>
                  {!loading && activeTasks.length === 0 && (
                    <p className="text-sm text-gray-500">No active tasks yet.</p>
                  )}
                  {loading && <div className="h-24 bg-gray-100 rounded animate-pulse" />}
                  {activeTasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      title={t.title}
                      orgName={t.organizationName}
                      dateLabel={t.dateLabel}
                      location={t.location}
                      duration={t.duration}
                      points={t.points}
                      status={t.status}
                    />
                  ))}
                </>
              )}

              {activeTab === "completed" && (
                <>
                  {!loading && completedTasks.length === 0 && (
                    <p className="text-sm text-gray-500">No completed tasks yet.</p>
                  )}
                  {loading && <div className="h-24 bg-gray-100 rounded animate-pulse" />}
                  {completedTasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      title={t.title}
                      orgName={t.organizationName}
                      dateLabel={t.dateLabel}
                      duration={t.duration}
                      points={t.points}
                      status={t.status}
                    />
                  ))}
                </>
              )}

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
                        <p className="text-sm font-medium text-gray-700">{b.name}</p>
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
    </div>
  );
}
