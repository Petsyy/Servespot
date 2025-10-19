import React, { useState } from "react";
import {
  Users,
  Building2,
  ClipboardList,
  CheckCircle2,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminSidebar from "@/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/components/layout/navbars/AdminNavbar";

export default function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sample chart data
  const volunteerGrowth = [
    { month: "Jan", count: 40 },
    { month: "Feb", count: 60 },
    { month: "Mar", count: 90 },
    { month: "Apr", count: 120 },
    { month: "May", count: 160 },
    { month: "Jun", count: 200 },
  ];

  const opportunityStatus = [
    { name: "Open", value: 12 },
    { name: "In Progress", value: 8 },
    { name: "Completed", value: 20 },
  ];

  const COLORS = ["#34D399", "#FBBF24", "#7C3AED"];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <AdminNavbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifCount={3}
        />
        
        {/* Reports Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
                <p className="text-gray-500 text-sm">
                  Monitor ServeSpot's performance and generate analytics reports.
                </p>
              </div>

              <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all text-sm font-medium">
                <FileText className="h-4 w-4" />
                Export Report
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white shadow-md rounded-xl p-5 flex items-center justify-between border-l-4 border-blue-500">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Volunteers
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">1,284</h3>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ 12% from last month
                  </p>
                </div>
                <Users className="h-10 w-10 text-blue-600" />
              </div>

              <div className="bg-white shadow-md rounded-xl p-5 flex items-center justify-between border-l-4 border-indigo-500">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Organizations
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">156</h3>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ 8% from last month
                  </p>
                </div>
                <Building2 className="h-10 w-10 text-indigo-600" />
              </div>

              <div className="bg-white shadow-md rounded-xl p-5 flex items-center justify-between border-l-4 border-yellow-400">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Active Opportunities
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">245</h3>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ 15% from last month
                  </p>
                </div>
                <ClipboardList className="h-10 w-10 text-yellow-500" />
              </div>

              <div className="bg-white shadow-md rounded-xl p-5 flex items-center justify-between border-l-4 border-green-500">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Completed Opportunities
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">2,341</h3>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ 18% from last month
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Volunteer Growth Bar Chart */}
              <div className="bg-white shadow-md rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Volunteer Growth (Monthly)
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={volunteerGrowth}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7C3AED" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Opportunity Status Pie Chart */}
              <div className="bg-white shadow-md rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Opportunities by Status
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={opportunityStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {opportunityStatus.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white shadow-md rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activities
              </h2>
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Name / Organization</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Activity</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">Juan Dela Cruz</td>
                    <td className="px-4 py-2">Volunteer</td>
                    <td className="px-4 py-2">Completed 3 tasks</td>
                    <td className="px-4 py-2">2025-09-18</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">Helping Hands Org</td>
                    <td className="px-4 py-2">Organization</td>
                    <td className="px-4 py-2">Posted 2 new opportunities</td>
                    <td className="px-4 py-2">2025-09-15</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-2">Maria Lopez</td>
                    <td className="px-4 py-2">Volunteer</td>
                    <td className="px-4 py-2">Earned 1 new badge</td>
                    <td className="px-4 py-2">2025-09-12</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}