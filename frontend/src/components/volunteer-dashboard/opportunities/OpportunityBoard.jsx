import React, { useState, useEffect } from "react";
import { confirmJoin, successAlert, errorAlert } from "@/utils/swalAlerts";
import {
  Calendar,
  Clock,
  MapPin,
  Users as UsersIcon,
  Award,
  CheckCircle,
  X,
  UploadCloud,
} from "lucide-react";
import { getOpportunityById } from "@/services/api";
import { signupForOpportunity } from "@/services/volunteer.api";
import { toast } from "react-toastify";
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
  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofStatus, setProofStatus] = useState(null);

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
      const msg = err.response?.data?.message || "Failed to sign up.";
      await errorAlert("Sign-Up Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
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

        {/* Details */}
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          {date && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" /> {date}
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-600" /> {duration}
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" /> {location}
            </div>
          )}
          {volunteersNeeded !== undefined && (
            <div className="flex items-center gap-2">
              <UsersIcon size={16} className="text-blue-600" />
              <span>
                {currentVolunteers}/{volunteersNeeded} volunteers
              </span>
            </div>
          )}
          {points && (
            <div className="flex items-center gap-2">
              <Award size={16} className="text-yellow-500" />
              Earn {points} points
            </div>
          )}
        </div>

        {/* Skills */}
        {Array.isArray(skills) && skills.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-800 mb-2">Skills:</p>
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
            onClick={() => onViewDetails && onViewDetails(_id)}
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
  );
}
