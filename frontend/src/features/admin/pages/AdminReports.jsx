import React, { useState } from "react";
import {
  Users,
  Building2,
  FileText,
  FileDown,
  Table,
  ChevronDown,
  Clock,
  Award,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminSidebar from "@/shared/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/shared/components/layout/navbars/AdminNavbar";
import { useAdminReports } from "@/features/admin/hooks/useAdminReports";
import * as XLSX from "xlsx";

export default function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const { reportsData, isLoading: loading } = useAdminReports();

  const handleExport = (format) => {
    if (!reportsData) {
      alert("No data available to export. Please wait for data to load.");
      return;
    }

    setExportOpen(false);

    try {
      switch (format) {
        case "CSV":
          exportToCSV();
          break;
        case "Excel":
          exportToExcel();
          break;
        default:
          console.log(`Export format ${format} not implemented`);
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      alert(`Failed to export ${format}. Please try again.`);
    }
  };

  const exportToCSV = () => {
    const csvData = [];
    csvData.push(["ServeSpot Reports Summary"]);
    csvData.push(["Generated on:", new Date().toLocaleDateString()]);
    csvData.push([]);
    csvData.push(["Top Performers"]);
    csvData.push(["Top Volunteer:", reportsData.topVolunteer?.name || "N/A"]);
    csvData.push(["Tasks Completed:", reportsData.topVolunteer?.tasksCompleted || 0]);
    csvData.push(["Top Organization:", reportsData.topOrganization?.name || "N/A"]);
    csvData.push(["Opportunities Posted:", reportsData.topOrganization?.opportunitiesPosted || 0]);
    csvData.push(["Total Volunteer Hours:", reportsData.totalVolunteerHours || 0]);
    csvData.push([]);

    csvData.push(["Monthly Signups"]);
    csvData.push(["Month", "Volunteers", "Organizations"]);
    reportsData.monthlySignups?.forEach((month) => {
      csvData.push([month.month, month.volunteers, month.organizations]);
    });
    csvData.push([]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ServeSpot_Reports_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ["ServeSpot Reports Summary"],
      ["Generated on:", new Date().toLocaleDateString()],
      [],
      ["Top Performers"],
      ["Top Volunteer:", reportsData.topVolunteer?.name || "N/A"],
      ["Tasks Completed:", reportsData.topVolunteer?.tasksCompleted || 0],
      ["Top Organization:", reportsData.topOrganization?.name || "N/A"],
      ["Opportunities Posted:", reportsData.topOrganization?.opportunitiesPosted || 0],
      ["Total Volunteer Hours:", reportsData.totalVolunteerHours || 0],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    const monthlyData = [
      ["Month", "Volunteers", "Organizations"],
      ...(reportsData.monthlySignups || []).map((m) => [
        m.month,
        m.volunteers,
        m.organizations,
      ]),
    ];
    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, "Monthly Signups");

    const categoryData = [
      ["Category", "Count"],
      ...(reportsData.tasksByCategory || []).map((c) => [c.name, c.value]),
    ];
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, "Tasks by Category");

    const activitiesData = [
      ["Name", "Role", "Activity", "Date"],
      ...(reportsData.recentActivities || []).map((a) => [
        a.name,
        a.role,
        a.activity,
        a.date,
      ]),
    ];
    const activitiesSheet = XLSX.utils.aoa_to_sheet(activitiesData);
    XLSX.utils.book_append_sheet(workbook, activitiesSheet, "Recent Activities");

    const fileName = `ServeSpot_Reports_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const SignupsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 border border-gray-200/80 rounded-xl shadow-lg text-xs">
          <p className="font-bold text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-medium" style={{ color: entry.color }}>
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
      const total =
        reportsData?.tasksByCategory?.reduce((sum, c) => sum + c.value, 0) || 0;
      const percentage =
        total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 border border-gray-200/80 rounded-xl shadow-lg text-xs">
          <p className="font-bold text-gray-900 mb-0.5">{payload[0].name}</p>
          <p className="font-semibold text-emerald-600">Tasks: {payload[0].value}</p>
          <p className="text-gray-400 text-[10px]">{percentage}% of all tasks</p>
        </div>
      );
    }
    return null;
  };

  const civicColors = ["#059669", "#0284c7", "#0d9488", "#d97706", "#6366f1", "#e11d48"];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* Header & Export Dropdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1.5 border border-emerald-100">
                  <BarChart3 size={12} className="text-emerald-600" />
                  <span>Platform Reports</span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  System-Wide Analytics & Reports
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Platform-wide growth trajectories, category concentrations, and audit logs.
                </p>
              </div>

              {/* Export Selector */}
              <div className="relative">
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <FileText size={14} />
                  <span>Export Report</span>
                  <ChevronDown size={14} />
                </button>
                {exportOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200/90 rounded-2xl shadow-xl z-20 p-1.5 animate-scaleIn">
                    <button
                      onClick={() => handleExport("CSV")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                      <Table size={14} className="text-gray-500" />
                      <span>Export as CSV</span>
                    </button>
                    <button
                      onClick={() => handleExport("Excel")}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                      <FileDown size={14} className="text-gray-500" />
                      <span>Export as Excel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Top Performers Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100/60 shrink-0">
                    <Award size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                      Top Volunteer
                    </span>
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {loading ? "…" : reportsData?.topVolunteer?.name || "No records"}
                    </h3>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                      {reportsData?.topVolunteer?.tasksCompleted || 0} tasks completed
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100/60 shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                      Top Organization
                    </span>
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {loading ? "…" : reportsData?.topOrganization?.name || "No records"}
                    </h3>
                    <p className="text-xs text-sky-700 font-semibold mt-0.5">
                      {reportsData?.topOrganization?.opportunitiesPosted || 0} initiatives published
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100/60 shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                      Total Volunteer Hours
                    </span>
                    <h3 className="text-base font-bold text-gray-900">
                      {loading
                        ? "…"
                        : `${reportsData?.totalVolunteerHours?.toLocaleString() || 0} hrs`}
                    </h3>
                    <p className="text-xs text-teal-700 font-semibold mt-0.5">
                      Platform-wide verified time
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Signups */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">
                      Platform Acquisition Velocity
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Monthly registration of volunteers vs. organizations</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Monthly
                  </span>
                </div>

                <div className="w-full h-72">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      Loading acquisition metrics…
                    </div>
                  ) : !reportsData?.monthlySignups ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      No acquisition data available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportsData.monthlySignups}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                        <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<SignupsTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                        <Bar
                          dataKey="volunteers"
                          fill="#059669"
                          name="Volunteers"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="organizations"
                          fill="#0284c7"
                          name="Organizations"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Tasks by Category */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">
                      Initiatives by Category
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Distribution of volunteer projects</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Categories
                  </span>
                </div>

                <div className="w-full h-72">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      Loading categories…
                    </div>
                  ) : !reportsData?.tasksByCategory ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      No category metrics available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportsData.tasksByCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={80}
                          paddingAngle={3}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {reportsData.tasksByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color || civicColors[index % civicColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activities Audit Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Platform Audit Log
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Real-time transaction and participation activity
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {reportsData?.recentActivities?.length || 0} events
                </span>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    Loading audit stream…
                  </div>
                ) : !reportsData?.recentActivities?.length ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    No recent audit events recorded.
                  </div>
                ) : (
                  <table className="w-full text-xs min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-gray-100 text-left">
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Participant
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportsData.recentActivities.map((activity, index) => (
                        <tr key={activity.id || index} className="hover:bg-slate-50/60 transition">
                          <td className="px-6 py-3.5 font-bold text-gray-900">
                            {activity.name}
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                activity.role === "Volunteer"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200/60"
                                  : "bg-sky-50 text-sky-800 border-sky-200/60"
                              }`}
                            >
                              {activity.role}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-gray-700">
                            {activity.activity}
                          </td>
                          <td className="px-6 py-3.5 text-gray-400">
                            {activity.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
