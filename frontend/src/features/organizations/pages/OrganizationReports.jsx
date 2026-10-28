import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  useOrganizationOpportunities,
  useOpportunityVolunteers,
} from "@/features/opportunities/hooks/useOpportunities";
import { getSession } from "@/shared/services/api";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Users,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import OrganizationSidebar from "@/shared/components/layout/sidebars/OrganizationSidebar.jsx";
import OrgNavbar from "@/shared/components/layout/navbars/OrganizationNavbar.jsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { getCookie, setCookie } from "@/shared/utils/cookies";

export default function Reports() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("last30days");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [orgId, setOrgId] = useState(() => getCookie("orgId") || null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSession();
        if (res.data?.user?.role !== "organization") {
          navigate("/organization/login");
          return;
        }

        const id = res.data?.user?.id;
        if (!id) {
          navigate("/organization/login");
          return;
        }

        setOrgId(id);
        setCookie("orgId", id);
      } catch {
        navigate("/organization/login");
      }
    })();
  }, [navigate]);

  // TanStack Query integration
  const { opportunities = [], isLoading: loadingOpps } = useOrganizationOpportunities(orgId);
  const { data: rawVolunteers = [], isLoading: loadingVols } = useOpportunityVolunteers(selectedOpportunity);

  const volunteersData = Array.isArray(rawVolunteers) ? rawVolunteers : rawVolunteers?.volunteers || [];
  const allOpportunitiesData = opportunities;
  const loading = loadingOpps || (Boolean(selectedOpportunity) && loadingVols);

  // Auto-select first opportunity if available
  useEffect(() => {
    if (opportunities.length > 0 && !selectedOpportunity) {
      setSelectedOpportunity(opportunities[0]._id);
    }
  }, [opportunities, selectedOpportunity]);

  const handleDownloadCharts = async () => {
    const charts = document.getElementById("charts-section");
    if (!charts) return;

    try {
      toast.info("Generating comprehensive report...");

      const canvas = await html2canvas(charts, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `Volunteer_Report_${new Date().toISOString().split("T")[0]}.pdf`
      );

      toast.success("Report downloaded successfully!");
    } catch (err) {
      console.error("Failed to export report:", err);
      toast.error("Report export failed");
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
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

  const handleOpportunitySelect = (opportunityId) => {
    setSelectedOpportunity(opportunityId);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/60";
      case "approved":
        return "bg-teal-50 text-teal-800 border-teal-200/60";
      case "pending":
        return "bg-amber-50 text-amber-800 border-amber-200/60";
      case "joined":
        return "bg-sky-50 text-sky-800 border-sky-200/60";
      case "rejected":
        return "bg-rose-50 text-rose-800 border-rose-200/60";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalVolunteers = volunteersData.length;
    const activeVolunteers = volunteersData.filter((v) =>
      ["Joined", "Completed", "Approved"].includes(v.status)
    ).length;
    const completedVolunteers = volunteersData.filter((v) => v.status === "Completed").length;
    const completionRate =
      totalVolunteers > 0
        ? Math.round((completedVolunteers / totalVolunteers) * 100)
        : 0;
    const totalOpportunities = allOpportunitiesData.length;
    const activeOpportunities = allOpportunitiesData.filter((opp) =>
      ["Open", "In Progress"].includes(opp.status)
    ).length;
    const totalApplications = allOpportunitiesData.reduce(
      (sum, opp) => sum + (opp.volunteers?.length || 0),
      0
    );

    return {
      totalVolunteers,
      activeVolunteers,
      completedVolunteers,
      completionRate,
      totalOpportunities,
      activeOpportunities,
      totalApplications,
    };
  }, [volunteersData, allOpportunitiesData]);

  // Calculate dynamic chart datasets
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentMonthIdx = now.getMonth();

    const trendMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), currentMonthIdx - i, 1);
      const mName = months[d.getMonth()];
      trendMap[mName] = 0;
    }

    allOpportunitiesData.forEach((opp) => {
      if (opp.date) {
        const oppDate = new Date(opp.date);
        const mName = months[oppDate.getMonth()];
        if (trendMap[mName] !== undefined) {
          trendMap[mName] += (opp.volunteers?.length || 0);
        }
      }
    });

    const monthlyTrend = Object.entries(trendMap).map(([month, volunteers]) => ({
      month,
      volunteers,
    }));

    const statusCounts = {
      Completed: 0,
      Approved: 0,
      Joined: 0,
      Pending: 0,
      Rejected: 0,
    };

    volunteersData.forEach((v) => {
      const s = v.status || "Joined";
      if (statusCounts[s] !== undefined) {
        statusCounts[s]++;
      } else {
        statusCounts.Joined++;
      }
    });

    const statusColors = {
      Completed: "#059669",
      Approved: "#0d9488",
      Joined: "#0284c7",
      Pending: "#d97706",
      Rejected: "#e11d48",
    };

    const statusDistribution = Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: statusColors[name] || "#64748b",
      }));

    if (statusDistribution.length === 0) {
      statusDistribution.push({ name: "No Data", value: 1, color: "#cbd5e1" });
    }

    const topOpportunities = allOpportunitiesData
      .map((opp) => {
        const apps = opp.volunteers?.length || 0;
        const needed = opp.volunteersNeeded || 1;
        const fillRate = Math.min(100, Math.round((apps / needed) * 100));
        return {
          name: opp.title?.length > 18 ? opp.title.slice(0, 16) + "..." : (opp.title || "Untitled"),
          fullName: opp.title,
          applications: apps,
          needed,
          fillRate,
        };
      })
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);

    return { monthlyTrend, statusDistribution, topOpportunities };
  }, [allOpportunitiesData, volunteersData]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <OrganizationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <OrgNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Volunteer & Program Reports
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Actionable metrics and participation analytics across your community initiatives.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={selectedOpportunity || ""}
                  onChange={(e) => handleOpportunitySelect(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium text-gray-700 bg-white transition cursor-pointer"
                >
                  <option value="">All Opportunities</option>
                  {opportunities.map((opp) => (
                    <option key={opp._id} value={opp._id}>
                      {opp.title}
                    </option>
                  ))}
                </select>

                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium text-gray-700 bg-white transition cursor-pointer"
                >
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                  <option value="thisYear">This Year</option>
                </select>

                <button
                  onClick={handleDownloadCharts}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100/60">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                      Total Volunteers
                    </span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      {summaryMetrics.totalVolunteers}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100/60">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                      Active Volunteers
                    </span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      {summaryMetrics.activeVolunteers}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100/60">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                      Applications
                    </span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      {summaryMetrics.totalApplications}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100/60">
                    <Award size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                      Completion Rate
                    </span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      {summaryMetrics.completionRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div id="charts-section" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Volunteer Growth Trend */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 tracking-tight">
                        Volunteer Sign-Up Trend
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">Monthly volunteer acquisition volume</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {timeRange}
                    </span>
                  </div>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="month"
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="volunteers"
                          stroke="#059669"
                          strokeWidth={2.5}
                          dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#047857" }}
                          name="Volunteers"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 tracking-tight">
                        Status Breakdown
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">Current state of volunteer commitments</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {volunteersData.length} total
                    </span>
                  </div>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.statusDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {chartData.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Opportunities by Applications */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 tracking-tight">
                        Top Initiatives by Volunteer Response
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">Most engaged opportunities by sign-up count</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      Top 5
                    </span>
                  </div>
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.topOpportunities}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white/95 backdrop-blur-xs p-3 border border-gray-200/80 rounded-xl shadow-lg text-xs">
                                  <p className="font-bold text-gray-900 mb-1">{data.fullName || label}</p>
                                  <p className="font-semibold text-emerald-600">
                                    Applications: {data.applications}
                                  </p>
                                  <p className="text-gray-500">
                                    Capacity: {data.needed}
                                  </p>
                                  <p className="font-semibold text-sky-600">
                                    Fill Rate: {data.fillRate}%
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="applications"
                          fill="#059669"
                          name="Applications"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Volunteer Activity Table */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                      <Users size={16} />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Roster & Participation Details
                    </h2>
                    <span className="text-xs text-gray-400 font-medium ml-1">
                      ({volunteersData.length} records)
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-slate-50/70 text-left">
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Volunteer
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Skills
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                            <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-emerald-600 border-t-transparent mb-2"></div>
                            <p className="text-xs font-medium text-gray-500">Loading volunteer rosters...</p>
                          </td>
                        </tr>
                      ) : volunteersData.length > 0 ? (
                        volunteersData.map((volunteer) => (
                          <tr
                            key={volunteer._id}
                            className="hover:bg-slate-50/60 transition"
                          >
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-800/40 shrink-0">
                                  {volunteer.firstName
                                    ? `${volunteer.firstName.charAt(0)}${volunteer.lastName?.charAt(0) || ""}`
                                    : volunteer.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "V"}
                                </div>
                                <span className="font-semibold text-gray-900">
                                  {volunteer.firstName && volunteer.lastName
                                    ? `${volunteer.firstName} ${volunteer.lastName}`
                                    : volunteer.name || "Volunteer"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-gray-600">
                              {volunteer.email || "No email provided"}
                            </td>
                            <td className="px-6 py-3.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                                  volunteer.status
                                )}`}
                              >
                                {volunteer.status || "Joined"}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-gray-600">
                              {volunteer.skills?.join(", ") || "No skills listed"}
                            </td>
                            <td className="px-6 py-3.5 text-gray-600">
                              {volunteer.city || volunteer.location || "Not specified"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-gray-500">
                              {selectedOpportunity
                                ? "No volunteer signups found for this opportunity."
                                : "Please select an opportunity to view participants."}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
