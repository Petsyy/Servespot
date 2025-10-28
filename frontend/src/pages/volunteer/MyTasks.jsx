import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Building2,
  CheckCircle,
  RefreshCw,
  Info,
  Eye,
  X,
  User,
  Users,
  Tag,
} from "lucide-react";
import VolSidebar from "@/components/layout/sidebars/VolSidebar";
import VolunteerNavbar from "@/components/layout/navbars/VolunteerNavbar";
import { getVolunteerTasks } from "@/services/volunteer.api";
import { getOpportunityById } from "@/services/api";
import { toast } from "react-toastify";

export default function VolunteerTasks() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState({ all: [], active: [], completed: [] });
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

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
      
      // Improved task filtering logic
      const active = data.filter(
        (t) => t.status === "Open" || t.status === "In Progress" || t.status === "Pending"
      );
      const completed = data.filter((t) => 
        t.status === "Completed" || t.status === "Approved" || t.status === "Rejected"
      );
      
      setTasks({ all: data, active, completed });
    } catch (err) {
      console.error("❌ Failed to load my tasks:", err);
      toast.error("Failed to fetch your activities.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskDetails = async (taskId) => {
    if (!taskId) return;
    
    setDetailsLoading(true);
    try {
      const res = await getOpportunityById(taskId);
      setTaskDetails(res.data);
    } catch (err) {
      console.error("❌ Failed to load task details:", err);
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

  useEffect(() => {
    fetchTasks();
  }, []);

  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-700 border border-green-200";
      case "in progress":
      case "pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "completed":
      case "approved":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
        return <CheckCircle size={14} className="text-green-600" />;
      case "rejected":
        return <X size={14} className="text-red-600" />;
      default:
        return <RefreshCw size={14} className="text-yellow-600" />;
    }
  };

  const currentTasks =
    activeTab === "active" ? tasks.active || [] : tasks.completed || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <VolSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <VolunteerNavbar onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Activities
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                View your joined and completed volunteer opportunities.
              </p>
            </div>

            <button
              onClick={fetchTasks}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-60 w-full sm:w-auto justify-center"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 p-2 mb-6">
            <div className="flex gap-2">
              {[
                { 
                  id: "active", 
                  label: "Active Tasks", 
                  count: tasks.active?.length || 0 
                },
                { 
                  id: "completed", 
                  label: "Completed Tasks", 
                  count: tasks.completed?.length || 0 
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all flex-1 justify-center ${
                    activeTab === tab.id
                      ? "bg-green-100 text-green-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id 
                        ? "bg-green-200 text-green-800" 
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full">
            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && currentTasks.length === 0 && (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center max-w-2xl mx-auto">
                <Info size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === "active"
                    ? "No Active Tasks"
                    : "No Completed Tasks"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === "active"
                    ? "You haven't joined any active opportunities yet. Browse opportunities to get started!"
                    : "Complete some tasks to see them here."}
                </p>
                <button
                  onClick={() => window.location.href = "/volunteer/opportunities"}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Eye size={16} />
                  Browse Opportunities
                </button>
              </div>
            )}

            {/* Task Cards - Improved UI */}
            {!loading && currentTasks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                  >
                    {/* Subtle background accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                    
                    {/* Header */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 leading-tight flex-1 text-lg">
                          {task.title}
                        </h2>
                      </div>
                      
                      {/* Organization with improved styling */}
                      <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                        <Building2 size={18} className="text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-green-800 truncate">
                          {task.organization?.orgName || "Community Partner"}
                        </span>
                      </div>

                      {/* Task Details with improved spacing and icons */}
                      <div className="space-y-3 text-sm text-gray-600 mb-4">
                        {task.location && (
                          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <MapPin size={16} className="text-green-500 flex-shrink-0" />
                            <span className="truncate font-medium">{task.location}</span>
                          </div>
                        )}
                        {task.date && (
                          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <Calendar size={16} className="text-green-500 flex-shrink-0" />
                            <span className="font-medium">{new Date(task.date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.duration && (
                          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <Clock size={16} className="text-green-500 flex-shrink-0" />
                            <span className="font-medium">{task.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer with improved styling */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-semibold ${renderStatusBadge(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewDetails(task)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 border border-transparent hover:border-green-200"
                      >
                        <Eye size={16} />
                        Details
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
              <h2 className="text-xl font-bold text-gray-900">
                Opportunity Details
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {detailsLoading ? (
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedTask?.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Building2 size={16} />
                      <span>{selectedTask?.organization?.orgName || "Community Partner"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedTask?.status)}
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${renderStatusBadge(selectedTask?.status)}`}>
                        {selectedTask?.status}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedTask?.location && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <MapPin size={18} className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Location</p>
                          <p className="text-sm text-gray-600">{selectedTask.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedTask?.date && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <Calendar size={18} className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Date</p>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedTask.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {selectedTask?.duration && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <Clock size={18} className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Duration</p>
                          <p className="text-sm text-gray-600">{selectedTask.duration}</p>
                        </div>
                      </div>
                    )}
                    
                    {taskDetails?.volunteersRequired && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <Users size={18} className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Volunteers Needed</p>
                          <p className="text-sm text-gray-600">{taskDetails.volunteersRequired}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {taskDetails?.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {taskDetails.description}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {taskDetails?.requiredSkills?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {taskDetails.requiredSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200"
                          >
                            <Tag size={12} />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer - Removed View Full Details button */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
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