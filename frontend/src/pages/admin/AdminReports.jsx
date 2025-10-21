import React, { useState } from "react";
import {
  Users,
  Building2,
  Trophy,
  Clock,
  FileText,
  FileDown,
  Table,
  ChevronDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminSidebar from "@/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/components/layout/navbars/AdminNavbar";

export default function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Monthly Signups Data
  const monthlySignups = [
    { month: "Jan", volunteers: 50, organizations: 8 },
    { month: "Feb", volunteers: 80, organizations: 12 },
    { month: "Mar", volunteers: 120, organizations: 15 },
    { month: "Apr", volunteers: 160, organizations: 18 },
    { month: "May", volunteers: 200, organizations: 22 },
    { month: "Jun", volunteers: 230, organizations: 25 },
    { month: "Jul", volunteers: 260, organizations: 28 },
    { month: "Aug", volunteers: 310, organizations: 30 },
    { month: "Sep", volunteers: 340, organizations: 32 },
    { month: "Oct", volunteers: 380, organizations: 35 },
    { month: "Nov", volunteers: 420, organizations: 38 },
    { month: "Dec", volunteers: 480, organizations: 40 },
  ];

  // Tasks by Category Data
  const tasksByCategory = [
    { name: "Environmental", value: 45, color: "#10B981" },
    { name: "Education", value: 32, color: "#3B82F6" },
    { name: "Healthcare", value: 28, color: "#EF4444" },
    { name: "Community", value: 38, color: "#F59E0B" },
    { name: "Elderly Care", value: 25, color: "#8B5CF6" },
    { name: "Animal Welfare", value: 18, color: "#EC4899" },
  ];

  const recentActivities = [
    { id: 1, name: "Juan Dela Cruz", role: "Volunteer", activity: "Completed 3 tasks", date: "2025-09-18" },
    { id: 2, name: "Helping Hands Org", role: "Organization", activity: "Posted 2 new opportunities", date: "2025-09-15" },
    { id: 3, name: "Maria Lopez", role: "Volunteer", activity: "Earned 1 new badge", date: "2025-09-12" },
    { id: 4, name: "Community Builders", role: "Organization", activity: "Verified organization", date: "2025-09-10" },
    { id: 5, name: "Carlos Santos", role: "Volunteer", activity: "Reached 50 hours milestone", date: "2025-09-08" },
  ];

  const handleExport = (format) => {
    console.log(`Exporting as ${format}`);
    setExportOpen(false);
  };

  const SignupsTooltip = ({ active, payload, label }) => {
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
      const total = tasksByCategory.reduce((sum, category) => sum + category.value, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            Tasks: {payload[0].value}
          </p>
          <p className="text-sm text-gray-600">
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifCount={3}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
                <p className="text-gray-500 text-sm">
                  Analyze ServeSpot's yearly trends and generate exportable reports.
                </p>
              </div>

              {/* Export dropdown */}
              <div className="relative">
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-4 w-4" />
                </button>
                {exportOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleExport("PDF")}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b"
                    >
                      <FileText className="h-4 w-4" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport("CSV")}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b"
                    >
                      <Table className="h-4 w-4" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport("Excel")}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FileDown className="h-4 w-4" />
                      Export as Excel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-all">
                <p className="text-sm text-gray-500 font-medium">Top Volunteer</p>
                <h3 className="text-lg font-bold text-gray-800">Juan Dela Cruz</h3>
                <p className="text-xs text-gray-500 mt-1">15 tasks completed</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-all">
                <p className="text-sm text-gray-500 font-medium">Top Organization</p>
                <h3 className="text-lg font-bold text-gray-800">Helping Hands Org</h3>
                <p className="text-xs text-gray-500 mt-1">8 opportunities posted</p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all">
                <p className="text-sm text-gray-500 font-medium">Total Volunteer Hours</p>
                <h3 className="text-lg font-bold text-gray-800">4,920 hrs</h3>
                <p className="text-xs text-green-600 mt-1">↑ 20% from last quarter</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Signups - Bar Chart */}
              <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-all">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Monthly Signups of Volunteer and Organizations
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlySignups}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<SignupsTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="volunteers" 
                      fill="#7C3AED" 
                      name="Volunteers" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="organizations" 
                      fill="#10B981" 
                      name="Organizations" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tasks by Category - Pie Chart */}
              <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-all">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Tasks by Category
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tasksByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {tasksByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  {tasksByCategory.slice(0, 4).map((category, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          {category.value}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{category.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activities Table */}
            <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
                <span className="text-sm text-gray-500">
                  Showing {recentActivities.length} activities
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium rounded-tl-lg">
                        Name / Organization
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Role</th>
                      <th className="px-4 py-3 text-left font-medium">Activity</th>
                      <th className="px-4 py-3 text-left font-medium rounded-tr-lg">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity, index) => (
                      <tr
                        key={activity.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                          index === recentActivities.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {activity.name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activity.role === "Volunteer"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {activity.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {activity.activity}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {activity.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}