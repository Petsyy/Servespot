import React from "react";
import MetricCard from "@/features/volunteers/components/MetricCard";

export default function VolunteerDashboardHeader({
  volunteerName = "Volunteer",
  overview,
  loading = false,
}) {
  return (
    <>
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back,{" "}
            <span className="text-emerald-700 font-semibold">{volunteerName}!</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Track your verified service impact, active tasks, and community recognition.
          </p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Points"
          value={overview?.points}
          icon="trending"
          accent="emerald"
          subtext="Community impact points"
          loading={loading}
        />
        <MetricCard
          title="Hours Contributed"
          value={overview?.hours}
          icon="timer"
          accent="sky"
          subtext="Verified hours served"
          loading={loading}
        />
        <MetricCard
          title="Badges Earned"
          value={overview?.badgesCount}
          icon="badge"
          accent="amber"
          subtext="Milestones unlocked"
          loading={loading}
        />
      </div>
    </>
  );
}
