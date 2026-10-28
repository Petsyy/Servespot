import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import AdminSidebar from "@/shared/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/shared/components/layout/navbars/AdminNavbar";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import { getSession } from "@/shared/services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { setCookie } from "@/shared/utils/cookies";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TanStack Query integration
  const { stats, chartData, isLoading: loading } = useAdminDashboard();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // SESSION VALIDATION VIA COOKIE-AUTH BACKEND
  useEffect(() => {
    (async () => {
      try {
        const res = await getSession();
        if (res.data?.user?.role !== "admin") {
          navigate("/admin/login");
          return;
        }

        if (res.data?.user?.id) {
          setCookie("adminId", res.data.user.id);
        }
      } catch {
        navigate("/admin/login");
      }
    })();
  }, [navigate]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 border border-gray-200/80 rounded-xl shadow-lg text-xs">
          <p className="font-bold text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const WeeklyTasksTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 border border-gray-200/80 rounded-xl shadow-lg text-xs">
          <p className="font-bold text-gray-900 mb-1">{label}</p>
          <p className="font-semibold text-emerald-600">
            Tasks Completed: {payload[0]?.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatStat = (value) => {
    if (loading) return "…";
    if (!stats || value === undefined || value === null) return "0";
    return value.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1.5 border border-emerald-100">
                <LayoutGrid size={12} className="text-emerald-600" />
                <span>Executive Command</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Platform Operations Dashboard
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time operational overview, network engagement metrics, and completed initiatives.
              </p>
            </div>

            {/* Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Total Volunteers
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      {formatStat(stats?.totalVolunteers)}
                    </h3>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-2">
                      Live Community
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100/60">
                    <Users size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Total Organizations
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      {formatStat(stats?.totalOrganizations)}
                    </h3>
                    <span className="text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md inline-block mt-2">
                      Civic Partners
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100/60">
                    <Building2 size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Active Opportunities
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      {formatStat(stats?.activeOpportunities)}
                    </h3>
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-2">
                      Open & In-Progress
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100/60">
                    <ClipboardList size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Completed Initiatives
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      {formatStat(stats?.completedOpportunities)}
                    </h3>
                    <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-2">
                      Verified Impact
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100/60">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Weekly Activity Line Chart */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">
                      Weekly Participation Dynamics
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Hours logged vs. Tasks completed</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Current Week
                  </span>
                </div>

                <div className="w-full h-72">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      Loading activity metrics…
                    </div>
                  ) : !chartData?.weeklyActivity ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      No activity logs recorded for this period.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.weeklyActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="day" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                        <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                        <Line
                          type="monotone"
                          dataKey="hours"
                          stroke="#0284c7"
                          strokeWidth={2.5}
                          name="Volunteer Hours"
                          dot={{ fill: "#0284c7", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="tasks"
                          stroke="#059669"
                          strokeWidth={2.5}
                          name="Tasks Completed"
                          dot={{ fill: "#059669", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Weekly Tasks Bar Chart */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">
                      Daily Completion Velocity
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Daily breakdown of micro-volunteering outputs</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Daily Progress
                  </span>
                </div>

                <div className="w-full h-72">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      Loading completion data…
                    </div>
                  ) : !chartData?.weeklyTasks ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      No tasks completed in this window.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.weeklyTasks}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="day" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                        <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<WeeklyTasksTooltip />} />
                        <Bar
                          dataKey="completed"
                          fill="#059669"
                          radius={[6, 6, 0, 0]}
                          name="Tasks Completed"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Platform Insights */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">
                  Platform Operational Insights
                </h2>
                <span className="text-xs text-gray-400 font-medium">System Telemetry</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50/60 border border-gray-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900">Volunteer Community</span>
                    <Users size={15} className="text-emerald-600" />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {loading
                      ? "Analyzing roster…"
                      : `${stats?.totalVolunteers?.toLocaleString() || 0} registered volunteers actively participating across community initiatives.`}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/60 border border-gray-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900">Organization Network</span>
                    <Building2 size={15} className="text-sky-600" />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {loading
                      ? "Analyzing network…"
                      : `${stats?.totalOrganizations?.toLocaleString() || 0} organizations verified and authorized to publish micro-volunteering programs.`}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/60 border border-gray-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900">Delivered Impact</span>
                    <CheckCircle2 size={15} className="text-teal-600" />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {loading
                      ? "Aggregating outputs…"
                      : `${stats?.completedOpportunities?.toLocaleString() || 0} completed volunteer opportunities verified by community organizers.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
