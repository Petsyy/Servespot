import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Building2,
  CheckCircle,
  RefreshCw,
  Eye,
  X,
  Users,
  Tag,
  Compass,
  ArrowRight,
  AlertCircle,
  ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import VolunteerSidebar from "@/shared/components/layout/sidebars/VolunteerSidebar";
import VolunteerNavbar from "@/shared/components/layout/navbars/VolunteerNavbar";
import { useVolunteerTasks } from "@/features/volunteers/hooks/useVolunteerTasks";
import { getOpportunityById } from "@/shared/services/api";
import { toast } from "react-toastify";

export default function VolunteerTasks() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { tasks, isLoading: loading, refetch: fetchTasks } = useVolunteerTasks();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const fetchTaskDetails = async (taskId) => {
    if (!taskId) return;

    setDetailsLoading(true);
    try {
      const res = await getOpportunityById(taskId);
      setTaskDetails(res.data);
    } catch (err) {
      console.error("Failed to load task details:", err);
      toast.error("Failed to load opportunity details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = async (task) => {
    setSelectedTask(task);
    setModalOpen(true);
    await fetchTaskDetails(task._id);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
    setTaskDetails(null);
  };

  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
      case "in progress":
      case "pending":
        return "bg-amber-50 text-amber-800 border-amber-200/80";
      case "completed":
      case "approved":
        return "bg-sky-50 text-sky-800 border-sky-200/80";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
        return <CheckCircle size={14} className="text-sky-600" />;
      case "rejected":
        return <AlertCircle size={14} className="text-rose-600" />;
      case "open":
        return <CheckCircle size={14} className="text-emerald-600" />;
      default:
        return <RefreshCw size={14} className="text-amber-600" />;
    }
  };

  const currentTasks =
    activeTab === "active" ? tasks.active || [] : tasks.completed || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <VolunteerSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <VolunteerNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                My Activities
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                View your active commitments and completed volunteer records.
              </p>
            </div>

            <button
              onClick={fetchTasks}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 text-sm font-semibold rounded-xl transition shadow-xs disabled:opacity-60 justify-center cursor-pointer"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin text-emerald-600" : ""}
              />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          {/* Segmented Tabs Switcher */}
          <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-gray-200/80 mb-6 max-w-md">
            <div className="flex gap-1.5">
              {[
                {
                  id: "active",
                  label: "Active Tasks",
                  count: tasks.active?.length || 0,
                },
                {
                  id: "completed",
                  label: "Completed Tasks",
                  count: tasks.completed?.length || 0,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex-1 justify-center cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white text-emerald-850 shadow-xs border border-gray-200/80"
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                      activeTab === tab.id
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200/70 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full">
            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200/80 p-5 animate-pulse space-y-3"
                  >
                    <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
                    <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                    <div className="space-y-2 pt-2">
                      <div className="h-3 bg-gray-100 rounded" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && currentTasks.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                  <Compass size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {activeTab === "active"
                    ? "No Active Commitments"
                    : "No Completed Activities"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-5 leading-relaxed">
                  {activeTab === "active"
                    ? "You haven't joined any active volunteer opportunities yet. Explore local tasks to get started!"
                    : "Complete and verify your tasks to build your service track record."}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/volunteer/opportunities")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow transition cursor-pointer"
                >
                  <span>Browse Opportunities</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Task Cards Grid */}
            {!loading && currentTasks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:border-emerald-300/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Organization */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 truncate mb-1.5">
                        <Building2 size={13} className="text-emerald-600 flex-shrink-0" />
                        <span className="truncate">
                          {task.organization?.orgName || "Community Partner"}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="font-bold text-gray-900 line-clamp-2 text-base leading-snug mb-3">
                        {task.title}
                      </h2>

                      {/* Meta Details */}
                      <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100 font-medium">
                        {task.location && (
                          <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{task.location}</span>
                          </div>
                        )}
                        {task.date && (
                          <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-emerald-600 flex-shrink-0" />
                            <span>{new Date(task.date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.duration && (
                          <div className="flex items-center gap-2">
                            <Clock size={13} className="text-emerald-600 flex-shrink-0" />
                            <span>{task.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(task.status)}
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${renderStatusBadge(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewDetails(task)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/50 text-xs font-semibold transition cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Task Details Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Activity Details
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6">
              {detailsLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-6 bg-gray-100 rounded-lg w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3.5 bg-gray-100 rounded" />
                    <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Basic Info */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
                      <Building2 size={14} className="text-emerald-600" />
                      <span>{selectedTask?.organization?.orgName || "Community Partner"}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
                      {selectedTask?.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${renderStatusBadge(
                          selectedTask?.status
                        )}`}
                      >
                        {selectedTask?.status}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700 p-3.5 rounded-xl bg-slate-50/70 border border-gray-100">
                    {selectedTask?.location && (
                      <div>
                        <span className="text-gray-400 block mb-0.5">Location</span>
                        <span className="font-semibold">{selectedTask.location}</span>
                      </div>
                    )}
                    {selectedTask?.date && (
                      <div>
                        <span className="text-gray-400 block mb-0.5">Date</span>
                        <span className="font-semibold">
                          {new Date(selectedTask.date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedTask?.duration && (
                      <div>
                        <span className="text-gray-400 block mb-0.5">Duration</span>
                        <span className="font-semibold">{selectedTask.duration}</span>
                      </div>
                    )}
                    {taskDetails?.volunteersRequired && (
                      <div>
                        <span className="text-gray-400 block mb-0.5">Volunteers</span>
                        <span className="font-semibold">
                          {taskDetails.volunteersRequired} volunteers needed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {taskDetails?.description && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                        Description
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {taskDetails.description}
                      </p>
                    </div>
                  )}

                  {/* Required Skills */}
                  {taskDetails?.requiredSkills?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                        Required Skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {taskDetails.requiredSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-100"
                          >
                            <Tag size={11} />
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-5 sm:p-6 border-t border-gray-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
