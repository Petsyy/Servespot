import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building,
  Activity,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import AdminSidebar from "@/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/components/layout/navbars/AdminNavbar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Sample chart data
  const chartData = {
    volunteerGrowth: [
      { month: "Jan", volunteers: 45 },
      { month: "Feb", volunteers: 52 },
      { month: "Mar", volunteers: 48 },
      { month: "Apr", volunteers: 61 },
      { month: "May", volunteers: 67 },
      { month: "Jun", volunteers: 72 },
      { month: "Jul", volunteers: 85 },
      { month: "Aug", volunteers: 78 },
      { month: "Sep", volunteers: 92 },
      { month: "Oct", volunteers: 104 },
      { month: "Nov", volunteers: 118 },
      { month: "Dec", volunteers: 128 },
    ],
    opportunityStatus: [
      { name: "Open", value: 156, color: "#10b981" },
      { name: "In Progress", value: 89, color: "#f59e0b" },
      { name: "Completed", value: 211, color: "#3b82f6" },
    ],
  };

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
    // Simulate fetching admin data
    const fetchAdminData = async () => {
      try {
        const mockStats = {
          totalVolunteers: 1284,
          totalOrganizations: 156,
          activeOpportunities: 245, // Open + In Progress
          completedOpportunities: 2341,
        };
        setStats(mockStats);
      } catch (err) {
        console.error("❌ Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const StatCard = ({ icon: Icon, title, value, trend, color, bgColor }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? "..." : value?.toLocaleString()}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`w-4 h-4 ${trend.color} mr-1`} />
              <span className={`text-xs font-medium ${trend.color}`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

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

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            Opportunities: {payload[0].value}
          </p>
          <p className="text-sm text-gray-600">
            {((payload[0].value / 456) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              title="Total Volunteers"
              value={stats.totalVolunteers}
              trend={{ value: "↑ 12% from last month", color: "text-green-600" }}
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <StatCard
              icon={Building}
              title="Total Organizations"
              value={stats.totalOrganizations}
              trend={{ value: "↑ 8% from last month", color: "text-green-600" }}
              color="text-indigo-600"
              bgColor="bg-indigo-100"
            />
            <StatCard
              icon={Activity}
              title="Active Opportunities"
              value={stats.activeOpportunities}
              trend={{ value: "↑ 15% from last month", color: "text-green-600" }}
              color="text-yellow-600"
              bgColor="bg-yellow-100"
            />
            <StatCard
              icon={CheckCircle}
              title="Completed Opportunities"
              value={stats.completedOpportunities}
              trend={{ value: "↑ 18% from last month", color: "text-green-600" }}
              color="text-green-600"
              bgColor="bg-green-100"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Volunteer Growth Chart - Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Volunteer Signups Over Time
                </h2>
                <span className="text-sm text-gray-500">Monthly Growth</span>
              </div>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.volunteerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="month" 
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="volunteers" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="New Volunteers"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Total new volunteers this year: {chartData.volunteerGrowth.reduce((sum, month) => sum + month.volunteers, 0)}
                </p>
              </div>
            </div>

            {/* Opportunity Status Breakdown - Pie Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Opportunities by Status
                </h2>
                <span className="text-sm text-gray-500">Current Distribution</span>
              </div>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.opportunityStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {chartData.opportunityStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                {chartData.opportunityStatus.map((status, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">
                        {status.value}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{status.name}</p>
                  </div>
                ))}
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
                  <h3 className="font-medium text-gray-900">Volunteer Engagement</h3>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  1,284 registered volunteers with steady 12% monthly growth.
                </p>
              </div>
              
              <div className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Organization Activity</h3>
                  <Building className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-600">
                  156 total organizations actively posting opportunities.
                </p>
              </div>
              
              <div className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Task Completion</h3>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  2,341 opportunities completed with 18% monthly increase.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}