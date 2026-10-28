import React, { useState } from "react";
import {
  confirmCompletion,
  successAlert,
  errorAlert,
} from "@/shared/utils/swalAlerts";
import {
  Calendar,
  MapPin,
  Users as UsersIcon,
  Trash2,
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
import ProofReviewModal from "@/features/opportunities/components/ProofPreviewModal";
import EditOpportunityModal from "@/features/opportunities/components/EditOpportunityModal";
import {
  useOpportunityVolunteers,
  useCompleteOpportunity,
} from "@/features/opportunities/hooks/useOpportunities";

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
  const [showProofModal, setShowProofModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // TanStack Query for volunteers (loaded on demand)
  const { data: volunteerData, isLoading: loadingVolunteers } = useOpportunityVolunteers(
    showModal ? _id : null
  );
  const completeMutation = useCompleteOpportunity();

  const volList = Array.isArray(volunteerData?.volunteers)
    ? volunteerData.volunteers
    : Array.isArray(volunteerData)
    ? volunteerData
    : [];

  const completing = completeMutation.isPending;

  // Status badge configuration
  const statusConfig = {
    Open: {
      color: "bg-emerald-50 border-emerald-200/60 text-emerald-800",
      icon: <CheckCircle2 size={13} className="text-emerald-600" />,
      label: "Active (Open)",
    },
    "In Progress": {
      color: "bg-amber-50 border-amber-200/60 text-amber-800",
      icon: <Clock size={13} className="text-amber-600" />,
      label: "In Progress",
    },
    Completed: {
      color: "bg-sky-50 border-sky-200/60 text-sky-800",
      icon: <CheckCircle2 size={13} className="text-sky-600" />,
      label: "Completed",
    },
    Closed: {
      color: "bg-gray-100 border-gray-200 text-gray-700",
      icon: <X size={13} className="text-gray-500" />,
      label: "Closed",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.Open;

  const handleViewVolunteers = () => {
    setShowModal(true);
  };

  const handleMarkCompleted = async () => {
    try {
      const confirmed = await confirmCompletion("Complete this Opportunity?");
      if (!confirmed) return;

      completeMutation.mutate(_id, {
        onSuccess: async (data) => {
          setStatus("Completed");
          onUpdate?.({ _id, status: "Completed" });
          await successAlert(
            "Opportunity Completed!",
            data?.message || "The opportunity is marked as completed."
          );
        },
        onError: async (err) => {
          console.error("Failed to mark completed:", err);
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to complete opportunity.";
          await errorAlert("Action Failed", msg);
        },
      });
    } catch (err) {
      console.error("Complete opportunity error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to complete opportunity.";
      await errorAlert("Action Failed", msg);
    }
  };

  const progressPercentage = Math.min(
    (cardData.currentVolunteers / (cardData.volunteersNeeded || 1)) * 100,
    100
  );

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all p-5 flex flex-col justify-between">
        <div>
          {/* Card Top Row: Title + Status + Actions */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatus.color}`}
                >
                  {currentStatus.icon}
                  <span>{currentStatus.label}</span>
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
                {cardData.title}
              </h3>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions((prev) => !prev)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                aria-label="Actions"
              >
                <MoreVertical size={18} />
              </button>

              {showActions && (
                <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-10 min-w-[150px]">
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowActions(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <Edit3 size={15} />
                    <span>Edit Opportunity</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(_id);
                      setShowActions(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Volunteer Capacity Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1.5">
              <span>Volunteer Capacity</span>
              <span className="font-bold text-gray-900">
                {cardData.currentVolunteers} / {cardData.volunteersNeeded} filled
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Details Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50/70 border border-gray-200/80 rounded-xl text-xs text-gray-700 font-medium">
            {date && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-600 shrink-0" />
                <span>
                  {cardData.date
                    ? new Date(cardData.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            )}

            {cardData.duration && (
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-600 shrink-0" />
                <span>{cardData.duration}</span>
              </div>
            )}

            {cardData.location && (
              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                <MapPin size={14} className="text-emerald-600 shrink-0" />
                <span className="truncate">{cardData.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div>
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={handleViewVolunteers}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <UsersIcon size={14} />
              <span>Volunteers</span>
            </button>

            <button
              onClick={() => setShowProofModal(true)}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <FileText size={14} />
              <span>Review Proofs</span>
            </button>

            {status === "In Progress" && (
              <button
                onClick={handleMarkCompleted}
                disabled={completing}
                className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/60 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <UserCheck size={14} />
                <span>{completing ? "Completing..." : "Complete"}</span>
              </button>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 px-2 py-2 text-xs font-semibold transition ml-auto cursor-pointer"
            >
              <span>{expanded ? "Less" : "More"}</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Expanded Drawer */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1.5 animate-fadeIn">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-gray-900">{currentStatus.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Volunteers Needed:</span>
                <span className="font-semibold text-gray-900">{cardData.volunteersNeeded}</span>
              </div>
              <div className="flex justify-between">
                <span>Joined Volunteers:</span>
                <span className="font-semibold text-gray-900">{cardData.currentVolunteers}</span>
              </div>
              <div className="flex justify-between">
                <span>Progress:</span>
                <span className="font-semibold text-emerald-700">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Volunteers Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200/80 animate-scaleIn flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <UsersIcon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    Volunteers Roster
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">{cardData.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
              {loadingVolunteers ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent mb-3" />
                  <p className="text-gray-500 text-xs font-medium">Loading roster...</p>
                </div>
              ) : volList.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <UsersIcon size={36} className="mx-auto text-gray-300 mb-2" />
                  <h3 className="text-sm font-bold text-gray-800">No Volunteers Yet</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    No volunteers have signed up for this initiative yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>{volList.length} registered volunteer{volList.length !== 1 ? "s" : ""}</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full font-semibold text-[11px]">
                      {cardData.currentVolunteers}/{cardData.volunteersNeeded} slots filled
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {volList.map((v) => (
                      <div
                        key={v._id || v.email}
                        className="flex items-center justify-between p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs border border-emerald-850/20">
                            {v.fullName?.[0]?.toUpperCase() ||
                              v.firstName?.[0]?.toUpperCase() ||
                              v.lastName?.[0]?.toUpperCase() ||
                              "V"}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs">
                              {v.fullName ||
                                (v.firstName && v.lastName
                                  ? `${v.firstName} ${v.lastName}`
                                  : null) ||
                                v.firstName ||
                                v.lastName ||
                                v.email ||
                                "Volunteer"}
                            </h4>
                            <p className="text-[11px] text-gray-500">{v.email}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            v.status === "Completed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200/60"
                              : "bg-amber-50 text-amber-800 border-amber-200/60"
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

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Review Modal */}
      {showProofModal && (
        <ProofReviewModal
          opportunityId={_id}
          onClose={() => setShowProofModal(false)}
        />
      )}

      {/* Edit Opportunity Modal */}
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
