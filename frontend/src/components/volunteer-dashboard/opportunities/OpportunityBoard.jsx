import React, { useState, useEffect } from "react";
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
import { signupForOpportunity, getOpportunityById } from "@/services/api";
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

    // Verify join status with backend to ensure accuracy
    async function verifyJoinStatus() {
      try {
        const res = await getOpportunityById(_id);
        if (res.data?.volunteers && volunteerId) {
          const isActuallyJoined = res.data.volunteers.some(
            (v) => v._id === volunteerId || v.toString() === volunteerId
          );
          setIsJoined(isActuallyJoined);

          // Check volunteer's proof status
          if (isActuallyJoined && res.data.completionProofs) {
            console.log("Debug - Checking proof status:", {
              volunteerId,
              completionProofs: res.data.completionProofs,
              volunteerProofs: res.data.completionProofs.filter(
                (p) =>
                  p.volunteer._id === volunteerId ||
                  p.volunteer.toString() === volunteerId
              ),
            });

            const volunteerProof = res.data.completionProofs.find(
              (proof) =>
                proof.volunteer._id === volunteerId ||
                proof.volunteer.toString() === volunteerId
            );

            console.log("Debug - Found volunteer proof:", volunteerProof);
            setProofStatus(volunteerProof ? volunteerProof.status : null);
          }
        }
      } catch (err) {
        console.warn("Failed to verify join status:", err);
      }
    }
    verifyJoinStatus();

    // Fetch latest status from backend
    async function refreshStatus() {
      try {
        const res = await getOpportunityById(_id);
        if (res.data?.status && res.data.status !== currentStatus) {
          setCurrentStatus(res.data.status);
        }

        // Update proof status
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
    const interval = setInterval(refreshStatus, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [_id, currentVolunteers, volunteersNeeded, currentStatus]);

  const handleSignup = async () => {
    if (isFull || currentStatus === "Closed") {
      toast.warning("This opportunity is already full or closed.");
      return;
    }

    const volunteerId = localStorage.getItem("volunteerId");
    const joinedKey = volunteerId
      ? `joinedTasks_${volunteerId}`
      : "joinedTasks";

    setLoading(true);
    try {
      const res = await signupForOpportunity(_id);

      // 🧠 Update local joined state
      const joinedTasks = JSON.parse(localStorage.getItem(joinedKey) || "[]");
      if (!joinedTasks.includes(_id)) {
        joinedTasks.push(_id);
        localStorage.setItem(joinedKey, JSON.stringify(joinedTasks));
      }

      setIsJoined(true);

      const { currentVolunteers, volunteersNeeded } = res.data;
      if (currentVolunteers >= volunteersNeeded) {
        setIsFull(true);
        toast.info("Volunteer slots filled! Opportunity now in progress.");
      }

      if (res.data.opportunityStatus === "In Progress") {
        setIsFull(true);
      }
      toast.success(res.data.message || "Signed up successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to sign up.";
      toast.error(msg);
      console.error("Sign-up error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col w-72 min-h-[420px]">
      {/* Poster Image */}
      {fileUrl && (
        <img
          src={`http://localhost:5000${fileUrl}`}
          alt={title}
          className="w-full h-[130px] object-cover rounded-t-xl"
        />
      )}

      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
              volunteerDisplayStatus === "Rejected"
                ? "bg-red-100 text-red-700"
                : badgeColor
            }`}
          >
            {volunteerDisplayStatus}
          </span>
        </div>

        {description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {description}
          </p>
        )}

        <p className="mt-3 text-sm text-gray-700">
          <strong>Organization:</strong> {orgName}
        </p>

        <div className="mt-3 space-y-2 text-sm text-gray-600">
          {date && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              {date}
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              {duration}
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              {location}
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

        {/* ---------- Skills Section ---------- */}
        {Array.isArray(skills) && skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <p className="text-sm font-semibold text-gray-800 mb-2">Skills:</p>
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* ---------- Actions ---------- */}
        <div
          className={`mt-4 flex gap-3 ${isJoined && currentStatus !== "Completed" && currentStatus !== "Closed" ? "flex-col" : ""}`}
        >
          {/* View Details Button */}
          <button
            onClick={() => onViewDetails && onViewDetails(_id)}
            className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition cursor-pointer"
          >
            View Details
          </button>

          {/* Proof Status and Actions */}
          {isJoined &&
            currentStatus !== "Completed" &&
            currentStatus !== "Closed" && (
              <>
                {(() => {
                  console.log("Debug - Button display check:", {
                    isJoined,
                    currentStatus,
                    proofStatus,
                    showProofSection:
                      isJoined &&
                      currentStatus !== "Completed" &&
                      currentStatus !== "Closed",
                  });
                  return null;
                })()}
                {proofStatus === "Pending" && (
                  <button
                    disabled
                    className="flex-1 h-10 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Clock size={16} />
                    Proof Under Review
                  </button>
                )}

                {proofStatus === "Approved" && (
                  <button
                    disabled
                    className="flex-1 h-10 rounded-lg bg-green-100 text-green-700 text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <CheckCircle size={16} />
                    Proof Approved
                  </button>
                )}

                {proofStatus === "Rejected" && (
                  <button
                    onClick={() => setShowProofModal(true)}
                    className="flex-1 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <UploadCloud size={16} />
                    Resubmit Proof
                  </button>
                )}

                {!proofStatus && (
                  <button
                    onClick={() => setShowProofModal(true)}
                    className="flex-1 h-10 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <UploadCloud size={16} />
                    Submit Proof
                  </button>
                )}
              </>
            )}

          {/* Dynamic Sign-Up Button */}
          {currentStatus === "Completed" ? ( // new condition
            <button
              disabled
              className="flex-1 h-10 rounded-lg bg-gray-300 text-gray-700 text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-1"
            >
              <CheckCircle size={16} />
              Completed
            </button>
          ) : currentStatus === "Closed" ? (
            <button
              disabled
              className="flex-1 h-10 rounded-lg bg-gray-300 text-gray-700 text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-1"
            >
              <X size={16} />
              Closed
            </button>
          ) : isJoined ? (
            <button
              disabled
              className="flex-1 h-10 rounded-lg bg-green-100 text-green-700 text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-1"
            >
              <CheckCircle size={16} />
              Joined
            </button>
          ) : isFull ? (
            <button
              disabled
              className="flex-1 h-10 rounded-lg bg-gray-200 text-gray-600 text-sm font-medium cursor-not-allowed flex items-center justify-center gap-1"
            >
              <UsersIcon size={16} />
              Full
            </button>
          ) : (
            <button
              onClick={handleSignup}
              disabled={loading}
              className="flex-1 h-10 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center justify-center gap-1 transition cursor-pointer"
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
                  Sign Up
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
            // Refresh proof status after submission
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
