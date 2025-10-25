import React, { useState, useEffect } from "react";
import {
  confirmJoin,
  successAlert,
  errorAlert,
  cancelledAlert,
  warningAlert,
} from "@/utils/swalAlerts";
import {
  Calendar,
  Clock,
  MapPin,
  Users as UsersIcon,
  Award,
  CheckCircle,
  X,
  UploadCloud,
  Shield,
} from "lucide-react";
import { getOpportunityById } from "@/services/api";
import { signupForOpportunity } from "@/services/volunteer.api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProofUploadModal from "@/components/volunteer-dashboard/opportunities/ProofUploadModal";

export default function OpportunityBoard({
  _id,
  title,
  description,
  organization,
  location,
  date,
  duration,
  volunteersNeeded,
  status = "Open",
  fileUrl,
  points,
  currentVolunteers = 0,
  onViewDetails,
  skills = [],
}) {
  // Add CSS animations
  const modalStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes slideDown {
      from { 
        opacity: 1;
        transform: translateY(0);
      }
      to { 
        opacity: 0;
        transform: translateY(20px);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
    .animate-fadeOut {
      animation: fadeOut 0.3s ease-out;
    }
    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
    .animate-slideDown {
      animation: slideDown 0.3s ease-out;
    }
  `;

  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showProofModal, setShowProofModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [proofStatus, setProofStatus] = useState(null);

  // Calculate default points if not provided
  const calculatedPoints =
    points ||
    (duration ? Math.max(10, Math.floor(parseInt(duration) / 2)) : 10);

  // Handle modal close with animation
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowDetailsModal(false);
      setIsClosingModal(false);
    }, 300);
  };

  const badgeColor =
    currentStatus === "Open"
      ? "bg-green-100 text-green-700"
      : currentStatus === "In Progress"
        ? "bg-orange-100 text-orange-700"
        : currentStatus === "Completed"
          ? "bg-blue-100 text-blue-700"
          : currentStatus === "Closed"
            ? "bg-gray-200 text-gray-700"
            : "bg-gray-100 text-gray-600";

  const volunteerDisplayStatus =
    proofStatus === "Rejected" ? "Rejected" : currentStatus;

  const orgName =
    organization && typeof organization === "object"
      ? organization.orgName || organization.name || "Unknown Organization"
      : organization || "Unknown Organization";

  useEffect(() => {
    const volunteerId = localStorage.getItem("volunteerId");
    const joinedKey = volunteerId
      ? `joinedTasks_${volunteerId}`
      : "joinedTasks";
    const joinedTasks =
      JSON.parse(localStorage.getItem(joinedKey) || "[]") || [];

    if (joinedTasks.includes(_id)) {
      setIsJoined(true);
    }

    if (
      currentVolunteers >= volunteersNeeded ||
      currentStatus === "In Progress"
    ) {
      setIsFull(true);
    }

    async function verifyJoinStatus() {
      try {
        const res = await getOpportunityById(_id);
        if (res.data?.volunteers && volunteerId) {
          const isActuallyJoined = res.data.volunteers.some(
            (v) => v._id === volunteerId || v.toString() === volunteerId
          );
          setIsJoined(isActuallyJoined);

          if (isActuallyJoined && res.data.completionProofs) {
            const volunteerProof = res.data.completionProofs.find(
              (proof) =>
                proof.volunteer._id === volunteerId ||
                proof.volunteer.toString() === volunteerId
            );
            setProofStatus(volunteerProof ? volunteerProof.status : null);
          }
        }
      } catch (err) {
        console.warn("Failed to verify join status:", err);
      }
    }
    verifyJoinStatus();

    async function refreshStatus() {
      try {
        const res = await getOpportunityById(_id);
        if (res.data?.status && res.data.status !== currentStatus) {
          setCurrentStatus(res.data.status);
        }

        if (res.data?.completionProofs && volunteerId) {
          const volunteerProof = res.data.completionProofs.find(
            (proof) =>
              proof.volunteer._id === volunteerId ||
              proof.volunteer.toString() === volunteerId
          );
          setProofStatus(volunteerProof ? volunteerProof.status : null);
        }
      } catch (err) {
        console.warn("Status refresh failed", err);
      }
    }

    refreshStatus();
    const interval = setInterval(refreshStatus, 10000);
    return () => clearInterval(interval);
  }, [_id, currentVolunteers, volunteersNeeded, currentStatus]);

  if (currentStatus === "Completed" || proofStatus === "Approved") {
    return null;
  }

  const handleSignup = async () => {
    try {
      // Step 1: Confirm user action
      const confirmed = await confirmJoin();
      if (!confirmed) {
        await cancelledAlert();
        return;
      }

      // Step 2: Check if full or closed
      if (isFull || currentStatus === "Closed") {
        await warningAlert(
          "Unable to Join",
          "This opportunity is already full or closed."
        );
        return;
      }

      // Step 3: Proceed joining
      const volunteerId = localStorage.getItem("volunteerId");
      const joinedKey = volunteerId
        ? `joinedTasks_${volunteerId}`
        : "joinedTasks";

      setLoading(true);
      const res = await signupForOpportunity(_id);

      // Update joined list locally
      const joinedTasks = JSON.parse(localStorage.getItem(joinedKey) || "[]");
      if (!joinedTasks.includes(_id)) {
        joinedTasks.push(_id);
        localStorage.setItem(joinedKey, JSON.stringify(joinedTasks));
      }

      setIsJoined(true);

      const { currentVolunteers, volunteersNeeded, opportunityStatus } =
        res.data;
      if (
        currentVolunteers >= volunteersNeeded ||
        opportunityStatus === "In Progress"
      ) {
        setIsFull(true);
      }
      // Step 4: Success alert
      await successAlert(
        "Joined Successfully!",
        res.data.message || "You’re now part of this opportunity."
      );
    } catch (err) {
      console.error("Sign-up error:", err);
      const msg =
        err?.response?.data?.message || err?.message || "Failed to sign up.";

      // Handle other errors
      await errorAlert("Sign-Up Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{modalStyles}</style>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col w-72 transition hover:shadow-lg">
        {/* Poster Image */}
        {fileUrl && (
          <img
            src={`http://localhost:5000${fileUrl}`}
            alt={title}
            className="w-full h-[140px] object-cover"
          />
        )}

        <div className="p-4 flex flex-col flex-1 justify-between">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate max-w-[65%]">
              {title}
            </h3>
            <span
              className={`text-xs px-3 py-1 rounded-full ${badgeColor} font-medium whitespace-nowrap`}
            >
              {volunteerDisplayStatus}
            </span>
          </div>

          {/* Description */}
          {description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
              {description}
            </p>
          )}

          {/* Org Info */}
          <p className="mt-3 text-sm text-gray-700">
            <strong>Organization:</strong> {orgName}
          </p>

          {/* Details - Two Column Layout */}
          <div className="mt-3 grid grid-cols-2 gap-6 text-sm">
            {/* Left Column - Date and Duration */}
            <div className="space-y-2">
              {date && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-600 flex-shrink-0" />
                  <span className="truncate text-gray-600">{date}</span>
                </div>
              )}
              {duration && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-600 flex-shrink-0" />
                  <span className="truncate text-gray-600">{duration}</span>
                </div>
              )}
              {volunteersNeeded !== undefined && (
                <div className="flex items-center gap-2">
                  <UsersIcon
                    size={16}
                    className="text-gray-600 flex-shrink-0"
                  />
                  <span className="truncate text-gray-600">
                    {currentVolunteers}/{volunteersNeeded} volunteers
                  </span>
                </div>
              )}
            </div>

            {/* Right Column - Location and Points */}
            <div className="space-y-2">
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-600 flex-shrink-0" />
                  <span className="truncate text-gray-600">{location}</span>
                </div>
              )}
              {calculatedPoints > 0 && (
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-gray-600 flex-shrink-0" />
                  <span className="truncate text-gray-600">
                    {calculatedPoints} pts
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {Array.isArray(skills) && skills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Buttons Section */}
          <div className="mt-5 flex flex-col items-stretch gap-2">
            {/* View Details */}
            <button
              onClick={() => setShowDetailsModal(true)}
              className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              View Details
            </button>

            {/* Proof Buttons */}
            {isJoined &&
              currentStatus !== "Completed" &&
              currentStatus !== "Closed" && (
                <>
                  {proofStatus === "Pending" && (
                    <button
                      disabled
                      className="w-full h-10 rounded-lg bg-yellow-100 text-yellow-700 font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Clock size={16} />
                      Proof Under Review
                    </button>
                  )}

                  {proofStatus === "Approved" && (
                    <button
                      disabled
                      className="w-full h-10 rounded-lg bg-green-100 text-green-700 font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <CheckCircle size={16} />
                      Proof Approved
                    </button>
                  )}

                  {proofStatus === "Rejected" && (
                    <button
                      onClick={() => setShowProofModal(true)}
                      className="w-full h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <UploadCloud size={16} />
                      Resubmit Proof
                    </button>
                  )}

                  {!proofStatus && (
                    <button
                      onClick={() => setShowProofModal(true)}
                      className="w-full h-10 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <UploadCloud size={16} />
                      Submit Proof
                    </button>
                  )}
                </>
              )}

            {/* Join/Status Buttons */}
            {currentStatus === "Completed" ? (
              <button
                disabled
                className="w-full h-10 rounded-lg bg-gray-300 text-gray-700 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <CheckCircle size={16} />
                Completed
              </button>
            ) : currentStatus === "Closed" ? (
              <button
                disabled
                className="w-full h-10 rounded-lg bg-gray-300 text-gray-700 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <X size={16} />
                Closed
              </button>
            ) : isJoined ? (
              <button
                disabled
                className="w-full h-10 rounded-lg bg-green-100 text-green-700 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <CheckCircle size={16} />
                Joined
              </button>
            ) : isFull ? (
              <button
                disabled
                className="w-full h-10 rounded-lg bg-gray-200 text-gray-600 font-medium flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <UsersIcon size={16} />
                Full
              </button>
            ) : (
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full h-10 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    <span className="ml-2">Joining...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Join Task
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
              isClosingModal ? "animate-fadeOut" : ""
            }`}
          >
            {/* Background overlay with blur + dim */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
              onClick={handleCloseModal}
            ></div>

            {/* Modal content */}
            <div
              className={`relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
                isClosingModal ? "animate-slideDown" : ""
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Organization Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    <strong>Organization:</strong> {orgName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Status:</strong>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}
                    >
                      {volunteerDisplayStatus}
                    </span>
                  </p>
                </div>

                {/* Description */}
                {description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {description}
                    </p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {date && (
                    <div className="flex items-center gap-2">
                      <Calendar
                        size={16}
                        className="text-gray-600 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {date}
                        </p>
                      </div>
                    </div>
                  )}
                  {duration && (
                    <div className="flex items-center gap-2">
                      <Clock
                        size={16}
                        className="text-gray-600 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-900">
                          {duration}
                        </p>
                      </div>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={16}
                        className="text-gray-600 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900">
                          {location}
                        </p>
                      </div>
                    </div>
                  )}
                  {calculatedPoints > 0 && (
                    <div className="flex items-center gap-2">
                      <Award
                        size={16}
                        className="text-gray-600 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs text-gray-500">Points</p>
                        <p className="text-sm font-medium text-gray-900">
                          {calculatedPoints} pts
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Volunteers Info */}
                {volunteersNeeded !== undefined && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UsersIcon size={16} className="text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {currentVolunteers}/{volunteersNeeded} volunteers
                        </p>
                        <p className="text-xs text-blue-600">
                          {volunteersNeeded - currentVolunteers} spots remaining
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {Array.isArray(skills) && skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    Close
                  </button>
                  {!isJoined && !isFull && currentStatus !== "Closed" && (
                    <button
                      onClick={() => {
                        handleCloseModal();
                        handleSignup();
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition"
                    >
                      Join Opportunity
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proof Upload Modal */}
        {showProofModal && (
          <ProofUploadModal
            opportunityId={_id}
            onClose={() => setShowProofModal(false)}
            onProofSubmitted={() => {
              const volunteerId = localStorage.getItem("volunteerId");
              if (volunteerId) {
                getOpportunityById(_id)
                  .then((res) => {
                    if (res.data?.completionProofs) {
                      const volunteerProof = res.data.completionProofs.find(
                        (proof) =>
                          proof.volunteer._id === volunteerId ||
                          proof.volunteer.toString() === volunteerId
                      );
                      setProofStatus(
                        volunteerProof ? volunteerProof.status : null
                      );
                    }
                  })
                  .catch((err) =>
                    console.warn("Failed to refresh proof status:", err)
                  );
              }
            }}
          />
        )}
      </div>
    </>
  );
}
