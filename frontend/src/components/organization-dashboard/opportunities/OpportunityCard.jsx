import React, { useState, useEffect } from "react";
import {
  confirmCompletion,
  successAlert,
  errorAlert,
} from "@/utils/swalAlerts";
import {
  Calendar,
  MapPin,
  Users as UsersIcon,
  Trash2,
  Eye,
  Edit3,
  CheckCircle2,
  X,
  Clock,
  MoreVertical,
  UserCheck,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProofReviewModal from "@/components/organization-dashboard/opportunities/ProofPreviewModal";
import EditOpportunityModal from "@/components/organization-dashboard/opportunities/EditOpportunityModal";
import {
  getOpportunityVolunteers,
  markOpportunityCompleted,
} from "@/services/organization.api";
import { toast } from "react-toastify";

export default function OpportunityCard({
  _id,
  title,
  date,
  location,
  currentVolunteers = 0,
  volunteersNeeded = 0,
  duration,
  status: initialStatus,
  onDelete,
  onUpdate,
}) {
  const navigate = useNavigate();

  const [cardData, setCardData] = useState({
    title,
    date,
    location,
    duration,
    currentVolunteers,
    volunteersNeeded,
  });

  const [status, setStatus] = useState(initialStatus || "Open");
  const [showModal, setShowModal] = useState(false);
  const [volList, setVolList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Auto-update status when slots fill
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const res = await getOpportunityVolunteers(_id);

        if (Array.isArray(res.data.volunteers)) {
          setVolList(res.data.volunteers);
        }

        if (res.data.status && res.data.status !== status) {
          setStatus(res.data.status);
        }

        if (
          (status === "Open" || res.data.status === "Open") &&
          res.data.currentVolunteers >= res.data.volunteersNeeded &&
          res.data.volunteersNeeded > 0
        ) {
          setStatus("In Progress");
        }
      } catch (err) {
        console.warn("Auto-refresh failed:", err.message);
      }
    };

    fetchLatestData();

    const interval = setInterval(fetchLatestData, 10000);
    return () => clearInterval(interval);
  }, [_id, status]);

  // Status badge configuration
  const statusConfig = {
    Open: {
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
      icon: <CheckCircle2 size={14} />,
      label: "Open"
    },
    "In Progress": {
      color: "bg-amber-50 border-amber-200 text-amber-700",
      icon: <Clock size={14} />,
      label: "In Progress"
    },
    Completed: {
      color: "bg-blue-50 border-blue-200 text-blue-700",
      icon: <CheckCircle2 size={14} />,
      label: "Completed"
    },
    Closed: {
      color: "bg-gray-100 border-gray-300 text-gray-600",
      icon: <X size={14} />,
      label: "Closed"
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.Open;

  const handleViewVolunteers = async () => {
    try {
      setShowModal(true);
      setLoading(true);
      const res = await getOpportunityVolunteers(_id);
      setVolList(res.data.volunteers || []);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      toast.error("Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      const confirmed = await confirmCompletion(
        `Are you sure you want to mark "${cardData.title}" as Completed?`
      );
      if (!confirmed) return;

      setCompleting(true);
      const res = await markOpportunityCompleted(_id);
      setStatus("Completed");

      await successAlert(
        "Opportunity Completed!",
        res.data?.message ||
          "This opportunity is now marked as completed, and approved volunteers have been rewarded with points and badges."
      );

      if (onUpdate) onUpdate({ _id, status: "Completed" });
    } catch (err) {
      console.error("Mark completed error:", err);
      const msg =
        err.response?.data?.message ||
        "Something went wrong while marking this opportunity as completed.";
      await errorAlert("Error", msg);
    } finally {
      setCompleting(false);
    }
  };

  const progressPercentage = Math.min(
    (cardData.currentVolunteers / cardData.volunteersNeeded) * 100,
    100
  );

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 p-6 font-sans">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-bold text-xl text-gray-900 tracking-tight truncate">
                {cardData.title}
              </h3>
              <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold border ${currentStatus.color}`}>
                {currentStatus.icon}
                {currentStatus.label}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Volunteer Progress</span>
                <span className="font-semibold text-gray-900">
                  {cardData.currentVolunteers}/{cardData.volunteersNeeded}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(_id);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details Section - Horizontal Layout */}
        <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
          {date && (
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={16} className="text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium">
                {cardData.date ? new Date(cardData.date).toLocaleDateString("en-US", {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : "—"}
              </span>
            </div>
          )}
          
          {cardData.duration && (
            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={16} className="text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium">{cardData.duration}</span>
            </div>
          )}
          
          {cardData.location && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={16} className="text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium">{cardData.location}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleViewVolunteers}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          >
            <UsersIcon size={16} />
            View Volunteers
          </button>

          <button
            onClick={() => setShowProofModal(true)}
            className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          >
            <FileText size={16} />
            Review Proofs
          </button>

          {status === "In Progress" && (
            <button
              onClick={handleMarkCompleted}
              disabled={completing}
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCheck size={16} />
              {completing ? "Completing..." : "Mark Complete"}
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ml-auto"
          >
            {expanded ? "Show Less" : "Show More"}
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium text-gray-900">{currentStatus.label}</span>
              </div>
              <div>
                <span className="text-gray-500">Volunteers Needed:</span>
                <span className="ml-2 font-medium text-gray-900">{cardData.volunteersNeeded}</span>
              </div>
              <div>
                <span className="text-gray-500">Current Volunteers:</span>
                <span className="ml-2 font-medium text-gray-900">{cardData.currentVolunteers}</span>
              </div>
              <div>
                <span className="text-gray-500">Progress:</span>
                <span className="ml-2 font-medium text-gray-900">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Volunteers Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UsersIcon className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Volunteers</h2>
                  <p className="text-gray-600">{cardData.title}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setVolList([]);
                }}
                className="p-2 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading volunteers...</p>
                </div>
              ) : volList.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Volunteers Yet</h3>
                  <p className="text-gray-500">No volunteers have signed up for this opportunity.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      {volList.length} volunteer{volList.length !== 1 ? 's' : ''} signed up
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {cardData.currentVolunteers}/{cardData.volunteersNeeded} slots filled
                    </span>
                  </div>
                  
                  <div className="grid gap-3">
                    {volList.map((v, index) => (
                      <div
                        key={v._id || v.email}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {v.fullName?.[0]?.toUpperCase() || 
                             v.firstName?.[0]?.toUpperCase() || 
                             v.lastName?.[0]?.toUpperCase() || 
                             v.email?.[0]?.toUpperCase() || 
                             "V"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {v.fullName || 
                               (v.firstName && v.lastName ? `${v.firstName} ${v.lastName}` : null) ||
                               v.firstName || 
                               v.lastName || 
                               v.email?.split('@')[0] || 
                               "Volunteer"}
                            </h4>
                            <p className="text-sm text-gray-600">{v.email}</p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            v.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {v.status || "Joined"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showProofModal && (
        <ProofReviewModal
          opportunityId={_id}
          onClose={() => setShowProofModal(false)}
        />
      )}
      
      {showEditModal && (
        <EditOpportunityModal
          opportunityId={_id}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updated) => {
            setCardData((prev) => ({
              ...prev,
              title: updated.title ?? prev.title,
              date: updated.date
                ? new Date(updated.date).toISOString().split("T")[0]
                : prev.date,
              location: updated.location ?? prev.location,
              duration: updated.duration ?? prev.duration,
            }));

            if (updated.status) setStatus(updated.status);
            onUpdate?.(updated);
          }}
        />
      )}
    </>
  );
}