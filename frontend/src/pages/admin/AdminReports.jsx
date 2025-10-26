import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  FileText,
  FileDown,
  Table,
  ChevronDown,
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
import AdminSidebar from "@/components/layout/sidebars/AdminSidebar";
import AdminNavbar from "@/components/layout/navbars/AdminNavbar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

export default function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch reports data from API
  const fetchReportsData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/reports", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching reports data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadReportsData = async () => {
      try {
        setLoading(true);
        const data = await fetchReportsData();
        setReportsData(data);
      } catch (error) {
        console.error("Error loading reports data:", error);
        setReportsData(null);
        // You could add a toast notification here for better UX
        // toast.error("Failed to load reports data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadReportsData();
  }, []);

  const handleExport = async (format) => {
    if (!reportsData) {
      alert("No data available to export. Please wait for data to load.");
      return;
    }

    setExportOpen(false);

    try {
      switch (format) {
        // case "PDF":
        //   await exportToPDF();
        //   break;
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

  // const exportToPDF = async () => {
  //   const element = document.getElementById("reports-content");
  //   if (!element) {
  //     alert("Report content not found. Please refresh and try again.");
  //     return;
  //   }

  //   try {
  //     // ✅ Clone node
  //     const clone = element.cloneNode(true);
  //     clone.id = "reports-content-clone";
  //     clone.style.position = "absolute";
  //     clone.style.left = "-9999px";
  //     clone.style.top = "0";
  //     clone.style.background = "#fff";
  //     document.body.appendChild(clone);

  //     // ✅ Replace any OKLCH or LAB colors with rgb fallbacks
  //     const sanitizeColor = (color) => {
  //       if (!color) return "rgb(255,255,255)";
  //       if (color.startsWith("oklch") || color.startsWith("lab("))
  //         return "rgb(255,255,255)";
  //       return color;
  //     };

  //     const all = clone.querySelectorAll("*");
  //     all.forEach((el) => {
  //       const computed = window.getComputedStyle(el);
  //       const color = sanitizeColor(computed.color);
  //       const bg = sanitizeColor(computed.backgroundColor);
  //       const border = sanitizeColor(computed.borderColor);

  //       el.style.color = color;
  //       el.style.backgroundColor = bg;
  //       el.style.borderColor = border;
  //       el.style.boxShadow = "none";
  //     });

  //     // ✅ Override Tailwind CSS vars that use oklch()
  //     const vars = clone.querySelectorAll("[style], [class]");
  //     vars.forEach((el) => {
  //       const inline = el.getAttribute("style");
  //       if (inline && inline.includes("oklch")) {
  //         el.setAttribute(
  //           "style",
  //           inline.replace(/oklch\([^)]*\)/g, "rgb(255,255,255)")
  //         );
  //       }
  //     });

  //     // ✅ Snapshot
  //     const canvas = await html2canvas(clone, {
  //       scale: 2,
  //       useCORS: true,
  //       allowTaint: true,
  //       backgroundColor: "#ffffff",
  //     });

  //     const imgData = canvas.toDataURL("image/png");
  //     const pdf = new jsPDF("p", "mm", "a4");
  //     const imgWidth = 210;
  //     const pageHeight = 295;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //     let heightLeft = imgHeight;
  //     let position = 0;

  //     pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  //     heightLeft -= pageHeight;

  //     while (heightLeft >= 0) {
  //       position = heightLeft - imgHeight;
  //       pdf.addPage();
  //       pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  //       heightLeft -= pageHeight;
  //     }

  //     const fileName = `ServeSpot_Reports_${new Date().toISOString().split("T")[0]}.pdf`;
  //     pdf.save(fileName);

  //     document.body.removeChild(clone);
  //   } catch (error) {
  //     console.error("Error exporting PDF:", error);
  //     alert("PDF export failed. Check console for details.");
  //   }
  // };

  const exportToCSV = () => {
    const csvData = [];

    // Add summary data
    csvData.push(["ServeSpot Reports Summary"]);
    csvData.push(["Generated on:", new Date().toLocaleDateString()]);
    csvData.push([]);

    // Top performers
    csvData.push(["Top Performers"]);
    csvData.push(["Top Volunteer:", reportsData.topVolunteer?.name || "N/A"]);
    csvData.push([
      "Tasks Completed:",
      reportsData.topVolunteer?.tasksCompleted || 0,
    ]);
    csvData.push([
      "Top Organization:",
      reportsData.topOrganization?.name || "N/A",
    ]);
    csvData.push([
      "Opportunities Posted:",
      reportsData.topOrganization?.opportunitiesPosted || 0,
    ]);
    csvData.push([
      "Total Volunteer Hours:",
      reportsData.totalVolunteerHours || 0,
    ]);
    csvData.push([]);

    // Monthly signups
    csvData.push(["Monthly Signups"]);
    csvData.push(["Month", "Volunteers", "Organizations"]);
    reportsData.monthlySignups.forEach((month) => {
      csvData.push([month.month, month.volunteers, month.organizations]);
    });
    csvData.push([]);

    // Tasks by category
    csvData.push(["Tasks by Category"]);
    csvData.push(["Category", "Count"]);
    reportsData.tasksByCategory.forEach((category) => {
      csvData.push([category.name, category.value]);
    });
    csvData.push([]);

    // Recent activities
    csvData.push(["Recent Activities"]);
    csvData.push(["Name", "Role", "Activity", "Date"]);
    reportsData.recentActivities.forEach((activity) => {
      csvData.push([
        activity.name,
        activity.role,
        activity.activity,
        activity.date,
      ]);
    });

    // Convert to CSV string
    const csvString = csvData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Download CSV
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ServeSpot_Reports_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["ServeSpot Reports Summary"],
      ["Generated on:", new Date().toLocaleDateString()],
      [],
      ["Top Performers"],
      ["Top Volunteer:", reportsData.topVolunteer?.name || "N/A"],
      ["Tasks Completed:", reportsData.topVolunteer?.tasksCompleted || 0],
      ["Top Organization:", reportsData.topOrganization?.name || "N/A"],
      [
        "Opportunities Posted:",
        reportsData.topOrganization?.opportunitiesPosted || 0,
      ],
      ["Total Volunteer Hours:", reportsData.totalVolunteerHours || 0],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Monthly signups sheet
    const monthlyData = [
      ["Month", "Volunteers", "Organizations"],
      ...reportsData.monthlySignups.map((month) => [
        month.month,
        month.volunteers,
        month.organizations,
      ]),
    ];
    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, "Monthly Signups");

    // Tasks by category sheet
    const categoryData = [
      ["Category", "Count"],
      ...reportsData.tasksByCategory.map((category) => [
        category.name,
        category.value,
      ]),
    ];
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, "Tasks by Category");

    // Recent activities sheet
    const activitiesData = [
      ["Name", "Role", "Activity", "Date"],
      ...reportsData.recentActivities.map((activity) => [
        activity.name,
        activity.role,
        activity.activity,
        activity.date,
      ]),
    ];
    const activitiesSheet = XLSX.utils.aoa_to_sheet(activitiesData);
    XLSX.utils.book_append_sheet(
      workbook,
      activitiesSheet,
      "Recent Activities"
    );

    // Download Excel file
    const fileName = `ServeSpot_Reports_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
      const total =
        reportsData?.tasksByCategory?.reduce(
          (sum, category) => sum + category.value,
          0
        ) || 0;
      const percentage =
        total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            Tasks: {payload[0].value}
          </p>
          <p className="text-sm text-gray-600">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Helper function to format data with loading state
  const formatData = (data, defaultValue = []) => {
    if (loading) return [];
    if (!reportsData || !data) return defaultValue;
    return data;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifCount={3}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div id="reports-content" className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Reports & Analytics
                </h1>
                <p className="text-gray-500 text-sm">
                  Analyze ServeSpot's yearly trends and generate exportable
                  reports.
                </p>
              </div>

              {/* Export dropdown */}
              <div className="relative">
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-4 w-4" />
                </button>
                {exportOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {/* <button
                      onClick={() => handleExport("PDF")}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b"
                    >
                      <FileText className="h-4 w-4" />
                      Export as PDF
                    </button> */}
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
                <p className="text-sm text-gray-500 font-medium">
                  Top Volunteer
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  {loading
                    ? "Loading..."
                    : reportsData?.topVolunteer?.name || "No data"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {reportsData?.topVolunteer?.tasksCompleted || "0"} tasks
                  completed
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-all">
                <p className="text-sm text-gray-500 font-medium">
                  Top Organization
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  {loading
                    ? "Loading..."
                    : reportsData?.topOrganization?.name || "No data"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {reportsData?.topOrganization?.opportunitiesPosted || "0"}{" "}
                  opportunities posted
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all">
                <p className="text-sm text-gray-500 font-medium">
                  Total Volunteer Hours
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  {loading
                    ? "..."
                    : reportsData?.totalVolunteerHours?.toLocaleString() ||
                      "0"}{" "}
                  hrs
                </h3>
                <p className="text-xs text-green-600 mt-1">
                  {loading
                    ? "..."
                    : reportsData
                      ? "↑ 20% from last quarter"
                      : "No data available"}
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Signups - Bar Chart */}
              <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-all">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Monthly Signups of Volunteer and Organizations
                </h2>
                <div className="w-full h-80">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-gray-500">Loading chart data...</div>
                    </div>
                  ) : !reportsData?.monthlySignups ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-gray-500 text-center">
                        <p>No signup data available</p>
                        <p className="text-sm mt-2">
                          Connect to your data source to display analytics
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportsData.monthlySignups}>
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
                  )}
                </div>
              </div>

              {/* Tasks by Category - Pie Chart */}
              <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-all">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Tasks by Category
                </h2>
                <div className="w-full h-80">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-gray-500">Loading chart data...</div>
                    </div>
                  ) : !reportsData?.tasksByCategory ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-gray-500 text-center">
                        <p>No category data available</p>
                        <p className="text-sm mt-2">
                          Connect to your data source to display analytics
                        </p>
                      </div>
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
                          outerRadius={100}
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {reportsData.tasksByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                {reportsData?.tasksByCategory && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    {reportsData.tasksByCategory
                      .slice(0, 4)
                      .map((category, index) => (
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
                          <p className="text-xs text-gray-600">
                            {category.name}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities Table */}
            <div className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Activities
                </h2>
                <span className="text-sm text-gray-500">
                  {loading
                    ? "Loading..."
                    : reportsData?.recentActivities
                      ? `Showing ${reportsData.recentActivities.length} activities`
                      : "No activities"}
                </span>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading activities...
                  </div>
                ) : !reportsData?.recentActivities ? (
                  <div className="text-center py-8 text-gray-500">
                    No recent activities available
                  </div>
                ) : (
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium rounded-tl-lg">
                          Name / Organization
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          Activity
                        </th>
                        <th className="px-4 py-3 text-left font-medium rounded-tr-lg">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData.recentActivities.map((activity, index) => (
                        <tr
                          key={activity.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                            index === reportsData.recentActivities.length - 1
                              ? "border-b-0"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {activity.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                activity.role === "Volunteer"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-green-100 text-green-800"
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
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
