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
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back,{" "}
            <span className="text-green-700 font-semibold">{volunteerName}!</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Ready to make a difference today?
          </p>
        </div>
      </div>

      {/* Top Metrics Cards */}
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
    </>
  );
}

