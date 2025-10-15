import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  Users,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock4,
  Eye,
  Mail,
  Phone,
} from "lucide-react";
import OrgSidebar from "@/components/layout/sidebars/OrgSidebar.jsx";
import OrgNavbar from "@/components/layout/navbars/OrganizationNavbar.jsx";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Reports() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("last30days");

  // ✅ Enhanced demo data with realistic values
  const reportsData = {
    summary: {
      totalVolunteers: 156,
      totalHours: 1240,
      activeOpportunities: 8,
      completionRate: 78,
      avgVolunteersPerEvent: 19.5,
    },
    monthlyTrend: [
      { month: "Jan", volunteers: 45, hours: 320, opportunities: 6 },
      { month: "Feb", volunteers: 52, hours: 380, opportunities: 7 },
      { month: "Mar", volunteers: 48, hours: 360, opportunities: 5 },
      { month: "Apr", volunteers: 61, hours: 450, opportunities: 8 },
      { month: "May", volunteers: 67, hours: 520, opportunities: 9 },
      { month: "Jun", volunteers: 72, hours: 580, opportunities: 10 },
      { month: "Jul", volunteers: 65, hours: 510, opportunities: 8 },
      { month: "Aug", volunteers: 78, hours: 620, opportunities: 11 },
    ],
    statusDistribution: [
      { name: "Approved", value: 45, color: "#3b82f6" },
      { name: "Pending", value: 25, color: "#f59e0b" },
      { name: "Completed", value: 78, color: "#10b981" },
      { name: "Rejected", value: 8, color: "#ef4444" },
    ],
    recentActivities: [
      { 
        id: 1, 
        name: "Sarah Johnson", 
        email: "sarah.j@email.com", 
        phone: "+1 (555) 123-4567",
        opportunity: "Beach Clean-Up", 
        status: "Completed", 
        hours: 4,
        date: "2024-01-15",
        appliedDate: "2 days ago"
      },
      { 
        id: 2, 
        name: "Mike Chen", 
        email: "mike.chen@email.com", 
        phone: "+1 (555) 987-6543",
        opportunity: "Food Drive", 
        status: "Approved", 
        hours: 6,
        date: "2024-01-14",
        appliedDate: "3 days ago"
      },
      { 
        id: 3, 
        name: "Emily Davis", 
        email: "emily.davis@email.com", 
        phone: "+1 (555) 456-7890",
        opportunity: "Tree Planting", 
        status: "Pending", 
        hours: 0,
        date: "2024-01-14",
        appliedDate: "3 days ago"
      },
      { 
        id: 4, 
        name: "Alex Rodriguez", 
        email: "alex.r@email.com", 
        phone: "+1 (555) 234-5678",
        opportunity: "Blood Donation", 
        status: "Completed", 
        hours: 2,
        date: "2024-01-13",
        appliedDate: "4 days ago"
      },
      { 
        id: 5, 
        name: "Jessica Williams", 
        email: "jessica.w@email.com", 
        phone: "+1 (555) 345-6789",
        opportunity: "Elderly Support", 
        status: "Approved", 
        hours: 3,
        date: "2024-01-12",
        appliedDate: "5 days ago"
      },
      { 
        id: 6, 
        name: "David Kim", 
        email: "david.kim@email.com", 
        phone: "+1 (555) 567-8901",
        opportunity: "Tutoring Program", 
        status: "Rejected", 
        hours: 0,
        date: "2024-01-11",
        appliedDate: "6 days ago"
      },
    ]
  };

  // ✅ Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // ✅ Download charts only
  const handleDownloadCharts = async () => {
    const charts = document.getElementById("charts-section");
    if (!charts) return;

    try {
      toast.info("Generating comprehensive report...");

      const canvas = await html2canvas(charts, { 
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Volunteer_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      toast.success("Report downloaded successfully!");
    } catch (err) {
      console.error("Report export failed:", err);
      toast.error("Failed to export report");
    }
  };

  // Custom tooltip for charts
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
      {/* Sidebar */}
      <OrgSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <OrgNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Volunteer Analytics
                  </h1>
                  <p className="text-gray-600 text-sm md:text-base">
                    Comprehensive insights into your volunteer program performance
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last90days">Last 90 Days</option>
                    <option value="thisYear">This Year</option>
                  </select>
                  
                  <button
                    onClick={handleDownloadCharts}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Volunteers</p>
                      <p className="text-xl font-bold text-gray-900">{reportsData.summary.totalVolunteers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className="text-xl font-bold text-gray-900">{reportsData.summary.totalHours}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="text-xl font-bold text-gray-900">{reportsData.summary.completionRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Events</p>
                      <p className="text-xl font-bold text-gray-900">{reportsData.summary.activeOpportunities}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Charts Section */}
            <div id="charts-section" className="space-y-6">
              {/* First Row: Growth Trend and Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Trend Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Volunteer Growth Trend</h2>
                    <TrendingUp className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reportsData.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="volunteers" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportsData.statusDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {reportsData.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Volunteer Activity Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    Recent Volunteer Activity
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Volunteer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Opportunity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Applied
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportsData.recentActivities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                {activity.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {activity.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-700">
                                <Mail className="w-3 h-3 text-gray-400" />
                                {activity.email}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {activity.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-blue-600 font-medium text-sm">
                              {activity.opportunity}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {activity.appliedDate}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {activity.hours > 0 ? `${activity.hours}h` : '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}
                            >
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {reportsData.recentActivities.length} recent activities
                    </p>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All Activities →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}