import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building,
  CheckCircle,
  Building2,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import AdminSidebar from "@/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/components/layout/navbars/AdminNavbar";
import { getAdminDashboard } from "@/services/admin.api";
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // SESSION & TOKEN VALIDATION
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const activeRole = localStorage.getItem("activeRole");

    if (!adminToken || activeRole !== "admin") {
      console.warn("Admin access required — redirecting to login");
      navigate("/admin/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await getAdminDashboard();
        const data = res.data;

        setStats({
          totalVolunteers: data.totalVolunteers,
          totalOrganizations: data.totalOrganizations,
          activeOpportunities: data.activeOpportunities,
          completedOpportunities: data.completedOpportunities,
        });

        setChartData({
          weeklyActivity: data.weeklyActivity,
          weeklyTasks: data.weeklyTasks,
        });
      } catch (error) {
        console.error("❌ Error fetching dashboard:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-green-600">
            Tasks Completed: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Helper function to format numbers with loading state
  const formatStat = (value) => {
    if (loading) return "...";
    if (!stats || value === undefined || value === null) return "0";
    return value.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Overview of platform performance and engagement
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow-sm rounded-xl p-5 flex items-center justify-between border-l-4 border-green-500 hover:shadow-md transition-all duration-200">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Volunteers
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {formatStat(stats?.totalVolunteers)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? "Loading..." : "Live count"}
                </p>
              </div>
              <Users className="h-10 w-10 text-green-600" />
            </div>

            <div className="bg-white shadow-sm rounded-xl p-5 flex items-center justify-between border-l-4 border-indigo-500 hover:shadow-md transition-all duration-200">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Organizations
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {formatStat(stats?.totalOrganizations)}
                </h3>
                <p className="text-xs text-green-600 mt-1">
                  {loading
                    ? "..."
                    : stats
                      ? "↑ 8% from last month"
                      : "No data available"}
                </p>
              </div>
              <Building2 className="h-10 w-10 text-indigo-600" />
            </div>

            <div className="bg-white shadow-sm rounded-xl p-5 flex items-center justify-between border-l-4 border-yellow-500 hover:shadow-md transition-all duration-200">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Active Opportunities
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {formatStat(stats?.activeOpportunities)}
                </h3>
                <p className="text-xs text-green-600 mt-1">
                  {loading
                    ? "..."
                    : stats
                      ? "↑ 15% from last month"
                      : "No data available"}
                </p>
              </div>
              <ClipboardList className="h-10 w-10 text-yellow-600" />
            </div>

            <div className="bg-white shadow-sm rounded-xl p-5 flex items-center justify-between border-l-4 border-green-500 hover:shadow-md transition-all duration-200">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Completed Opportunities
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {formatStat(stats?.completedOpportunities)}
                </h3>
                <p className="text-xs text-green-600 mt-1">
                  {loading
                    ? "..."
                    : stats
                      ? "↑ 18% from last month"
                      : "No data available"}
                </p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Weekly Volunteer Activity - Line Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Weekly Volunteer Activity
                </h2>
                <span className="text-sm text-gray-500">Hours & Tasks</span>
              </div>
              <div className="w-full h-80">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-gray-500">Loading chart data...</div>
                  </div>
                ) : !chartData?.weeklyActivity ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-gray-500 text-center">
                      <p>No chart data available</p>
                      <p className="text-sm mt-2">
                        Connect to your data source to display analytics
                      </p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="hours"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Volunteer Hours"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="tasks"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Tasks Completed"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {loading
                    ? "Loading..."
                    : chartData?.weeklyActivity
                      ? `Total hours this week: ${chartData.weeklyActivity.reduce((sum, d) => sum + d.hours, 0)}`
                      : "Connect data source to see totals"}
                </p>
              </div>
            </div>

            {/* Tasks Completed This Week - Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tasks Completed This Week
                </h2>
                <span className="text-sm text-gray-500">Daily Progress</span>
              </div>
              <div className="w-full h-80">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-gray-500">Loading chart data...</div>
                  </div>
                ) : !chartData?.weeklyTasks ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-gray-500 text-center">
                      <p>No chart data available</p>
                      <p className="text-sm mt-2">
                        Connect to your data source to display analytics
                      </p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.weeklyTasks}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip content={<WeeklyTasksTooltip />} />
                      <Bar
                        dataKey="completed"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        name="Tasks Completed"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {loading
                    ? "Calculating..."
                    : chartData?.weeklyTasks
                      ? `Total tasks completed this week: ${chartData.weeklyTasks.reduce((sum, day) => sum + day.completed, 0)}`
                      : "Connect data source to see totals"}
                </p>
              </div>
            </div>
          </div>

          {/* Platform Insights */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Platform Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    Volunteer Engagement
                  </h3>
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  {loading
                    ? "Loading insights..."
                    : stats
                      ? `${stats.totalVolunteers?.toLocaleString()} registered volunteers on the platform.`
                      : "No volunteer data available"}
                </p>
              </div>

              <div className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    Organization Activity
                  </h3>
                  <Building className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  {loading
                    ? "Loading insights..."
                    : stats
                      ? `${stats.totalOrganizations?.toLocaleString()} total organizations actively posting opportunities.`
                      : "No organization data available"}
                </p>
              </div>

              <div className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Task Completion</h3>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  {loading
                    ? "Loading insights..."
                    : stats
                      ? `${stats.completedOpportunities?.toLocaleString()} opportunities completed with 18% monthly increase.`
                      : "No completion data available"}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
