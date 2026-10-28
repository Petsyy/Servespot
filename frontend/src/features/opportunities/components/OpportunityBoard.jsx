import React, { useState, useEffect } from "react";
import {
  confirmJoin,
  successAlert,
  errorAlert,
} from "@/shared/utils/swalAlerts";
import {
  Calendar,
  Clock,
  MapPin,
  Users as UsersIcon,
  Award,
  CheckCircle,
  X,
  UploadCloud,
  Building2,
  Sparkles,
} from "lucide-react";
import {
  useOpportunityDetail,
  useSignupOpportunity,
} from "@/features/opportunities/hooks/useOpportunities";
import ProofUploadModal from "@/features/opportunities/components/ProofUploadModal";
import { buildFileUrl } from "@/shared/utils/fileUrl";
import { getCookie } from "@/shared/utils/cookies";

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
  skills = [],
  volunteers = [],
  completionProofs = [],
}) {
  const modalStyles = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(16px); } }
    .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
    .animate-fadeOut { animation: fadeOut 0.2s ease-out; }
    .animate-slideUp { animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-slideDown { animation: slideDown 0.2s ease-in; }
  `;

  const [isJoined, setIsJoined] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofStatus, setProofStatus] = useState(null);

  const signupMutation = useSignupOpportunity();
  const { data: detailData } = useOpportunityDetail(showDetailsModal ? _id : null);

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowDetailsModal(false);
      setIsClosingModal(false);
    }, 200);
  };

  const badgeColor =
    currentStatus === "Open"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
      : currentStatus === "In Progress"
      ? "bg-amber-50 text-amber-800 border-amber-200/80"
      : currentStatus === "Completed"
      ? "bg-sky-50 text-sky-800 border-sky-200/80"
      : "bg-slate-100 text-slate-700 border-slate-200";

  const volunteerDisplayStatus =
    proofStatus === "Rejected" ? "Rejected" : currentStatus;

  const orgName =
    organization && typeof organization === "object"
      ? organization.orgName || organization.name || "Community Partner"
      : organization || "Community Partner";

  useEffect(() => {
    if (detailData?.status) {
      setCurrentStatus(detailData.status);
    } else if (status) {
      setCurrentStatus(status);
    }
  }, [detailData?.status, status]);

  useEffect(() => {
    const totalVolunteers = detailData?.volunteers?.length ?? currentVolunteers;
    if (
      totalVolunteers >= volunteersNeeded ||
      currentStatus === "In Progress"
    ) {
      setIsFull(true);
    } else {
      setIsFull(false);
    }
  }, [detailData?.volunteers, currentVolunteers, volunteersNeeded, currentStatus]);

  useEffect(() => {
    const volunteerId = getCookie("volunteerId") || localStorage.getItem("volunteerId");
    if (!volunteerId) return;

    const joinedKey = `joinedTasks_${volunteerId}`;
    const joinedTasks = JSON.parse(localStorage.getItem(joinedKey) || "[]") || [];

    const activeVolunteers = detailData?.volunteers || volunteers || [];
    const isActuallyJoined =
      joinedTasks.includes(_id) ||
      (Array.isArray(activeVolunteers) &&
        activeVolunteers.some((v) => {
          const vId = v?._id || v?.id || v?.toString?.() || v;
          return vId && String(vId) === String(volunteerId);
        }));

    if (isActuallyJoined) {
      setIsJoined(true);
    }

    // Check proof status from server data or persistent optimistic cache
    const proofStorageKey = `proofStatus_${volunteerId}`;
    let savedLocalStatus = null;
    try {
      const localMap = JSON.parse(localStorage.getItem(proofStorageKey) || "{}");
      savedLocalStatus = localMap[_id] || null;
    } catch (err) {
      console.warn("Failed to read local proof status:", err);
    }

    const proofs = detailData?.completionProofs || completionProofs || [];
    if (isActuallyJoined && Array.isArray(proofs)) {
      const volunteerProof = proofs.find((proof) => {
        const vId =
          proof.volunteer?._id ||
          proof.volunteer?.id ||
          proof.volunteer?._doc?._id ||
          proof.volunteer;
        return vId && String(vId) === String(volunteerId);
      });

      if (volunteerProof?.status) {
        setProofStatus(volunteerProof.status);
        try {
          const localMap = JSON.parse(localStorage.getItem(proofStorageKey) || "{}");
          localMap[_id] = volunteerProof.status;
          localStorage.setItem(proofStorageKey, JSON.stringify(localMap));
        } catch (err) {
          console.warn("Failed to update local proof status:", err);
        }
      } else if (savedLocalStatus) {
        setProofStatus(savedLocalStatus);
      } else {
        setProofStatus(null);
      }
    } else if (savedLocalStatus) {
      setProofStatus(savedLocalStatus);
    }
  }, [detailData, volunteers, completionProofs, _id]);

  const handleSignup = async () => {
    try {
      const isConfirmed = await confirmJoin(
        "Join this Opportunity?",
        "Are you sure you want to commit to this micro-volunteering task?"
      );

      const confirmed = typeof isConfirmed === "boolean" ? isConfirmed : Boolean(isConfirmed?.isConfirmed);
      if (!confirmed) return;

      if (isFull || currentStatus === "Closed" || currentStatus === "Completed") {
        await errorAlert(
          "Unable to Join",
          "This opportunity is currently unavailable."
        );
        return;
      }

      const volunteerId = getCookie("volunteerId") || localStorage.getItem("volunteerId");
      const joinedKey = volunteerId
        ? `joinedTasks_${volunteerId}`
        : "joinedTasks";

      signupMutation.mutate(_id, {
        onSuccess: async (res) => {
          const joinedTasks = JSON.parse(localStorage.getItem(joinedKey) || "[]");
          if (!joinedTasks.includes(_id)) {
            joinedTasks.push(_id);
            localStorage.setItem(joinedKey, JSON.stringify(joinedTasks));
          }
          setIsJoined(true);
          await successAlert(
            "Joined Successfully!",
            res?.data?.message || "You're now registered for this opportunity."
          );
        },
        onError: async (err) => {
          console.error("Sign-up error:", err);
          const msg =
            err?.response?.data?.message || err?.message || "Failed to sign up.";
          await errorAlert("Sign-Up Failed", msg);
        },
      });
    } catch (err) {
      console.error("Sign-up error:", err);
      const msg =
        err?.response?.data?.message || err?.message || "Failed to sign up.";
      await errorAlert("Sign-Up Failed", msg);
    }
  };

  return (
    <>
      <style>{modalStyles}</style>

      {/* Opportunity Card Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:border-emerald-300/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group w-full">
        {/* Top Image or Civic Placeholder */}
        <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
          {fileUrl ? (
            <img
              src={buildFileUrl(fileUrl)}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-950/10 via-emerald-800/5 to-slate-100 text-emerald-700/60 p-4">
              <Building2 className="w-8 h-8 mb-1" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800/70">
                Community Initiative
              </span>
            </div>
          )}

          {/* Status Badge Tag */}
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-semibold shadow-xs backdrop-blur-md ${badgeColor}`}
            >
              {volunteerDisplayStatus}
            </span>
          </div>

          {points && points > 0 && (
            <div className="absolute bottom-2.5 left-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-emerald-850 shadow-xs border border-gray-200/80">
                <Award size={12} className="text-amber-500" />
                <span>{points} pts</span>
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
          <div>
            {/* Organization */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 truncate mb-1">
              <Building2 size={13} className="flex-shrink-0 text-emerald-600" />
              <span className="truncate">{orgName}</span>
            </div>

            {/* Title */}
            <h3
              onClick={() => setShowDetailsModal(true)}
              className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 cursor-pointer hover:text-emerald-700 transition-colors"
            >
              {title}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
                {description}
              </p>
            )}

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-100 font-medium">
              {date && (
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar size={13} className="text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{new Date(date).toLocaleDateString()}</span>
                </div>
              )}
              {duration && (
                <div className="flex items-center gap-1.5 truncate">
                  <Clock size={13} className="text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{duration}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin size={13} className="text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              {volunteersNeeded !== undefined && (
                <div className="flex items-center gap-1.5 truncate">
                  <UsersIcon size={13} className="text-emerald-600 flex-shrink-0" />
                  <span className="truncate">
                    {currentVolunteers}/{volunteersNeeded} vols
                  </span>
                </div>
              )}
            </div>

            {/* Skills Pills */}
            {Array.isArray(skills) && skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {skills.slice(0, 2).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100"
                  >
                    {skill}
                  </span>
                ))}
                {skills.length > 2 && (
                  <span className="px-1.5 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 text-gray-500">
                    +{skills.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Button Row */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="flex-1 py-2 px-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition text-center cursor-pointer"
            >
              Details
            </button>

            {/* Primary Action Button */}
            {currentStatus === "Completed" ? (
              <button
                disabled
                className="flex-1 py-2 px-2.5 rounded-xl bg-gray-100 text-gray-500 font-semibold text-xs text-center cursor-not-allowed"
              >
                Completed
              </button>
            ) : currentStatus === "Closed" ? (
              <button
                disabled
                className="flex-1 py-2 px-2.5 rounded-xl bg-gray-100 text-gray-500 font-semibold text-xs text-center cursor-not-allowed"
              >
                Closed
              </button>
            ) : isJoined ? (
              proofStatus === "Approved" ? (
                <button
                  disabled
                  className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs flex items-center justify-center gap-1 cursor-default"
                >
                  <CheckCircle size={13} />
                  <span>Approved</span>
                </button>
              ) : proofStatus === "Pending" ? (
                <button
                  disabled
                  className="flex-1 py-2 px-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-default shadow-xs"
                >
                  <Clock size={13} className="text-amber-600" />
                  <span>In Review</span>
                </button>
              ) : proofStatus === "Rejected" ? (
                <button
                  onClick={() => setShowProofModal(true)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition"
                >
                  <UploadCloud size={13} />
                  <span>Resubmit</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowProofModal(true)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition"
                >
                  <UploadCloud size={13} />
                  <span>Proof</span>
                </button>
              )
            ) : isFull ? (
              <button
                disabled
                className="flex-1 py-2 px-2.5 rounded-xl bg-gray-100 text-gray-500 font-semibold text-xs text-center cursor-not-allowed"
              >
                Full
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignup}
                disabled={signupMutation.isPending}
                className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition disabled:opacity-50"
              >
                {signupMutation.isPending ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={13} />
                    <span>Join</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${
            isClosingModal ? "animate-fadeOut" : "animate-fadeIn"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={handleCloseModal}
          />

          <div
            className={`relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 ${
              isClosingModal ? "animate-slideDown" : "animate-slideUp"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
                    <Building2 size={14} className="text-emerald-600" />
                    <span>{orgName}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                    {title}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status and Points Banner */}
              <div className="flex flex-wrap items-center gap-2 mb-5 p-3 rounded-xl bg-slate-50 border border-gray-200/80">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
                  {volunteerDisplayStatus}
                </span>
                {points && points > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                    <Award size={13} className="text-amber-600" />
                    <span>{points} Reward Points</span>
                  </span>
                )}
              </div>

              {description && (
                <div className="mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Description
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-3 mb-5 p-3.5 rounded-xl bg-slate-50/70 border border-gray-100 text-xs text-gray-700">
                {date && (
                  <div>
                    <span className="text-gray-400 block mb-0.5">Date</span>
                    <span className="font-semibold">{new Date(date).toLocaleDateString()}</span>
                  </div>
                )}
                {duration && (
                  <div>
                    <span className="text-gray-400 block mb-0.5">Duration</span>
                    <span className="font-semibold">{duration}</span>
                  </div>
                )}
                {location && (
                  <div>
                    <span className="text-gray-400 block mb-0.5">Location</span>
                    <span className="font-semibold">{location}</span>
                  </div>
                )}
                {volunteersNeeded !== undefined && (
                  <div>
                    <span className="text-gray-400 block mb-0.5">Capacity</span>
                    <span className="font-semibold">{currentVolunteers} / {volunteersNeeded} volunteers</span>
                  </div>
                )}
              </div>

              {Array.isArray(skills) && skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                {!isJoined && !isFull && currentStatus !== "Closed" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseModal();
                      handleSignup();
                    }}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition shadow-xs cursor-pointer"
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
            setProofStatus("Pending");
            const volunteerId = getCookie("volunteerId") || localStorage.getItem("volunteerId");
            if (volunteerId) {
              try {
                const proofStorageKey = `proofStatus_${volunteerId}`;
                const localMap = JSON.parse(
                  localStorage.getItem(proofStorageKey) || "{}"
                );
                localMap[_id] = "Pending";
                localStorage.setItem(proofStorageKey, JSON.stringify(localMap));
              } catch (err) {
                console.warn("Failed to cache proof submission status:", err);
              }
            }
          }}
        />
      )}
    </>
  );
}
