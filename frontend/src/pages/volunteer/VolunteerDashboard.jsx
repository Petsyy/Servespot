import React, { useEffect, useState } from "react";
import VolSidebar from "@/components/layout/VolSidebar";
import MetricCard from "@/components/volDashboard/MetricCard";
import TaskCard from "@/components/volDashboard/TaskCard";
import Notifications from "@/components/volDashboard/Notifications";
import ProgressCard from "@/components/volDashboard/ProgressCard";
import RecentBadges from "@/components/volDashboard/RecentBadges";
import TopVolunteers from "@/components/volDashboard/TopVolunteers";
import {
  getVolunteerOverview,
  getVolunteerTasks,
  getVolunteerNotifications,
  getVolunteerProgress,
  getVolunteerBadges,
  getTopVolunteers,
} from "@/services/api";

export default function VolDashboard() {
  const [overview, setOverview] = useState(null);          // {points, hours, badgesCount}
  const [tasks, setTasks] = useState([]);                  // active tasks
  const [notifications, setNotifications] = useState([]);  // list
  const [progress, setProgress] = useState(null);          // {levelLabel, current, target}
  const [badges, setBadges] = useState([]);                // small grid
  const [top, setTop] = useState([]);                      // leaderboard
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [
          ovrRes,
          tasksRes,
          notifRes,
          progRes,
          badgesRes,
          topRes,
        ] = await Promise.allSettled([
          getVolunteerOverview(),
          getVolunteerTasks(),
          getVolunteerNotifications(),
          getVolunteerProgress(),
          getVolunteerBadges(),
          getTopVolunteers(),
        ]);

        if (!mounted) return;

        if (ovrRes.status === "fulfilled") setOverview(ovrRes.value.data);
        if (tasksRes.status === "fulfilled") setTasks(tasksRes.value.data || []);
        if (notifRes.status === "fulfilled") setNotifications(notifRes.value.data || []);
        if (progRes.status === "fulfilled") setProgress(progRes.value.data);
        if (badgesRes.status === "fulfilled") setBadges(badgesRes.value.data || []);
        if (topRes.status === "fulfilled") setTop(topRes.value.data || []);
      } catch (e) {
        // soft fail: UI shows empty states
        console.error("Volunteer dashboard load failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
          {/* Removed “+ Browse New Opportunities” button per your request */}
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
          {/* Left: Active Tasks */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Active Tasks</h2>
              {/* “View All” button matches screenshot */}
              <button className="text-blue-600 text-sm hover:underline">View All</button>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 space-y-4 bg-white">
              {!loading && tasks.length === 0 && (
                <p className="text-sm text-gray-500">No active tasks yet.</p>
              )}
              {loading && (
                <div className="h-24 bg-gray-100 rounded animate-pulse" />
              )}
              {tasks.map((t) => (
                <TaskCard key={t._id}
                  title={t.title}
                  orgName={t.organizationName}
                  dateLabel={t.dateLabel}         // e.g., “Tomorrow, 2:00 PM”
                  location={t.location}
                  duration={t.duration}           // “3 hours”
                  points={t.points}               // number
                  status={t.status}               // “Upcoming” | “In Progress”
                />
              ))}
            </div>

            {/* Recent Activity placeholder — same visual style as screenshot */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <ul className="divide-y divide-gray-100">
                {/* No hardcoded items — backend will fill later */}
              </ul>
            </div>
          </div>

          {/* Right column */}
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
