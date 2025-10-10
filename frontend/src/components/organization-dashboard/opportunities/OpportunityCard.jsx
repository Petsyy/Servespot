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
  Trash,
  Eye,
  Pencil,
  CheckCircle,
  X,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProofReviewModal from "@/components/organization-dashboard/opportunities/ProofPreviewModal";
import {
  getOpportunityVolunteers,
  markOpportunityCompleted,
} from "@/services/api";
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
}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(initialStatus || "Open");
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [volList, setVolList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);

  //  Auto-update status when slots fill
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const res = await getOpportunityVolunteers(_id);

        // Update volunteers list
        if (Array.isArray(res.data.volunteers)) {
          setVolList(res.data.volunteers);
        }

        // Auto-update status if backend changed it
        if (res.data.status && res.data.status !== status) {
          setStatus(res.data.status);
        }

        // Auto-set "In Progress" when slots are filled
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
    // Cleanup
    return () => clearInterval(interval);
  }, [_id, status]);

  // Badge color mapping
  const badgeColor =
    status === "Open"
      ? "bg-green-100 text-green-700"
      : status === "In Progress"
        ? "bg-orange-100 text-orange-700"
        : status === "Completed"
          ? "bg-blue-100 text-blue-700"
          : status === "Closed"
            ? "bg-gray-200 text-gray-700"
            : "bg-gray-100 text-gray-600";

  // View volunteers
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

  // Mark as Completed (with SweetAlert2 confirmation)
  const handleMarkCompleted = async () => {
    try {
      const confirmed = await confirmCompletion(
        `Mark "${title}" as Completed?`
      );
      if (!confirmed) return; // cancelled

      setCompleting(true);
      const res = await markOpportunityCompleted(_id);

      setStatus("Completed");
      await successAlert(
        "Opportunity Completed!",
        res.data.message || "This opportunity is now marked as completed."
      );
    } catch (err) {
      console.error("Mark completed error:", err);
      const msg = err.response?.data?.message || "Failed to mark as completed.";
      await errorAlert("Error", msg);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition flex flex-col justify-between font-sans">
        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-900 tracking-tight truncate">
            {title}
          </h3>

          <span
            className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium capitalize ${badgeColor}`}
          >
            {status === "Open" && <CheckCircle size={14} />}
            {status === "In Progress" && <Clock size={14} />}
            {status === "Completed" && <CheckCircle size={14} />}
            {status === "Closed" && <X size={14} />}
            {status}
          </span>
        </div>

        {/* ---------- DETAILS ---------- */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-700 mt-3 font-bold">
          {date && (
            <div className="flex items-center gap-1">
              <Calendar size={16} className="text-blue-600" />
              <span>{date}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-blue-600" />
              <span>{duration}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-blue-600" />
              <span>{location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <UsersIcon size={16} className="text-blue-600" />
            <span className="font-semibold">
              {currentVolunteers}/{volunteersNeeded} volunteers
            </span>
          </div>
        </div>

        {/* ---------- ACTION BUTTONS (below details) ---------- */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {status === "Open" && (
            <>
              <button
                onClick={() =>
                  navigate(`/organization/opportunity/${_id}/edit`)
                }
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                onClick={handleViewVolunteers}
                className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Eye size={16} />
                View
              </button>

              <button
                onClick={() => onDelete(_id)}
                className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Trash size={16} />
                Delete
              </button>
            </>
          )}

          {status === "In Progress" && (
            <>
              <button
                onClick={handleViewVolunteers}
                className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <Eye size={16} />
                View Details
              </button>

              <button
                onClick={handleMarkCompleted}
                className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                <CheckCircle size={16} />
                Complete
              </button>
            </>
          )}

          {status === "Completed" && (
            <button
              onClick={handleViewVolunteers}
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <Eye size={16} />
              View Details
            </button>
          )}

          <button
            onClick={() => setShowProofModal(true)}
            className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <CheckCircle size={16} />
            Review Proofs
          </button>

          {status === "Closed" && (
            <button
              onClick={handleViewVolunteers}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <Eye size={16} />
              View
            </button>
          )}
        </div>
      </div>

      {/* ---------- VOLUNTEERS MODAL ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[550px] max-h-[85vh] overflow-y-auto relative p-6">
            {/* Close */}
            <button
              onClick={() => {
                setShowModal(false);
                setVolList([]);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UsersIcon className="text-blue-600" size={22} />
              Volunteers Signed Up
              {volList.length > 0 && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {volList.length} total
                </span>
              )}
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <svg
                  className="animate-spin h-6 w-6 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              </div>
            ) : volList.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <UsersIcon size={32} className="mx-auto text-gray-400 mb-2" />
                <p>No volunteers have signed up yet.</p>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-gray-200">
                {volList.map((v) => (
                  <div
                    key={v._id || v.email}
                    className="pt-4 first:pt-0 flex flex-col gap-1 hover:bg-gray-50 rounded-lg transition p-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {v.firstName && v.lastName
                            ? `${v.firstName} ${v.lastName}`
                            : v.fullName || "Unnamed Volunteer"}
                        </h3>
                        <p className="text-sm text-gray-600">{v.email}</p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          v.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {v.status || "Joined"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {showProofModal && (
        <ProofReviewModal
          opportunityId={_id}
          onClose={() => setShowProofModal(false)}
        />
      )}
    </>
  );
}
