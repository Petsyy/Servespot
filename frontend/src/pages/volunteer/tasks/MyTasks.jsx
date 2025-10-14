import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Building2,
  CheckCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import VolSidebar from "@/components/layout/sidebars/VolSidebar";
import VolunteerNavbar from "@/components/layout/navbars/VolunteerNavbar";
import { getVolunteerTasks } from "@/services/volunteer.api";
import { toast } from "react-toastify";

export default function VolunteerTasks() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState({ all: [], active: [], completed: [] });
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar function
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getVolunteerTasks();
      const data = Array.isArray(res?.data) ? res.data : [];
      const active = data.filter(
        (t) => t.status === "Open" || t.status === "In Progress"
      );
      const completed = data.filter((t) => t.status === "Completed");
      setTasks({ all: data, active, completed });
    } catch (err) {
      console.error("❌ Failed to load my tasks:", err);
      toast.error("Failed to fetch your activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const currentTasks =
    activeTab === "active" ? tasks.active || [] : tasks.completed || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar with responsive controls */}
      <VolSidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar with sidebar toggle */}
        <VolunteerNavbar 
          onToggleSidebar={toggleSidebar}
        />

        <main className="flex-1 p-8 w-full">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                My Activities
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                View your joined and completed volunteer opportunities.
              </p>
            </div>

            <button
              onClick={fetchTasks}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-8">
              {[
                { id: "active", label: "Active Tasks" },
                { id: "completed", label: "Completed Tasks" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-1 -mb-px text-base font-semibold transition-all ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full">
            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty State - Left Aligned */}
            {!loading && currentTasks.length === 0 && (
              <div className="w-full">
                <div className="inline-flex items-start gap-4 rounded-xl border border-dashed border-gray-300 bg-white p-6 max-w-2xl">
                  <div className="flex-shrink-0 mt-0.5">
                    <Info size={24} className="text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-800 font-medium text-lg mb-1">
                      {activeTab === "active"
                        ? "You haven't joined any active opportunities yet"
                        : "No completed tasks yet"}
                    </p>
                    <p className="text-gray-500 text-base">
                      Join an opportunity from the Browse page to see it here.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Task Cards */}
            {!loading && currentTasks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col h-full"
                  >
                    {/* Header */}
                    <div className="flex-1">
                      <h2 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2 leading-tight">
                        {task.title}
                      </h2>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={16} className="text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">
                          {task.organization?.orgName || "Community Partner"}
                        </span>
                      </div>

                      {/* Task Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {task.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={15} className="text-blue-600 flex-shrink-0" />
                            <span className="truncate">{task.location}</span>
                          </div>
                        )}
                        {task.date && (
                          <div className="flex items-center gap-2">
                            <Calendar size={15} className="text-blue-600 flex-shrink-0" />
                            <span>{new Date(task.date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.duration && (
                          <div className="flex items-center gap-2">
                            <Clock size={15} className="text-blue-600 flex-shrink-0" />
                            <span>{task.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span
                        className={`text-xs px-3 py-1.5 rounded-full font-medium ${renderStatusBadge(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                      <button
                        onClick={() =>
                          window.location.assign(
                            `/volunteer/opportunity/${task._id}`
                          )
                        }
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}