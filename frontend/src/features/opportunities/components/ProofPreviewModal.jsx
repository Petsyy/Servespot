import React, { useState, useCallback } from "react";
import { X, CheckCircle, XCircle, Image, Loader2 } from "lucide-react";
import { buildFileUrl } from "@/shared/utils/fileUrl";
import {
  useOpportunityDetail,
  useReviewOpportunityProof,
} from "@/features/opportunities/hooks/useOpportunities";

function getVolunteerId(v) {
  if (!v) return "";
  return typeof v === "string" ? v : v._id || "";
}

export default function ProofReviewModal({ opportunityId, onClose }) {
  const { data: opportunity, isLoading: loading } = useOpportunityDetail(opportunityId);
  const reviewMutation = useReviewOpportunityProof(opportunityId);
  const [reviewingId, setReviewingId] = useState(null);

  const proofs = opportunity?.completionProofs || [];

  const handleReview = useCallback(
    (volunteerId, action) => {
      setReviewingId(volunteerId);
      reviewMutation.mutate(
        { volunteerId, action },
        {
          onSettled: () => setReviewingId(null),
        }
      );
    },
    [reviewMutation]
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative border border-gray-200/80 animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Proof Submissions
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Review and verify volunteer completion proofs for this opportunity.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 gap-3">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
            <p className="text-xs text-gray-500 font-medium">Loading submissions...</p>
          </div>
        ) : proofs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Image size={36} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">No proofs submitted yet</p>
            <p className="text-xs text-gray-400 mt-0.5">Submissions will appear here once volunteers submit evidence.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proofs.map((proof) => {
              const volunteerId = getVolunteerId(proof.volunteer);
              const isThisRowLoading = reviewingId === volunteerId;

              return (
                <div
                  key={proof._id || volunteerId}
                  className="border border-gray-200/80 rounded-2xl p-4.5 bg-white shadow-xs hover:border-gray-300 transition"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        {proof.volunteer?.firstName
                          ? `${proof.volunteer.firstName} ${proof.volunteer.lastName}`
                          : "Volunteer"}
                      </h3>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-gray-600">Status:</span>
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] ${
                            proof.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                              : proof.status === "Rejected"
                              ? "bg-rose-100 text-rose-800 border border-rose-200/60"
                              : "bg-amber-100 text-amber-800 border border-amber-200/60"
                          }`}
                        >
                          {proof.status}
                        </span>
                        {proof.status === "Rejected" && proof.rejectedAt && (
                          <span className="text-gray-400">
                            • Rejected: {new Date(proof.rejectedAt).toLocaleDateString()}
                          </span>
                        )}
                        {proof.status === "Pending" && proof.submittedAt && (
                          <span className="text-gray-400">
                            • Submitted: {new Date(proof.submittedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {proof.status === "Pending" ? (
                        <>
                          <button
                            disabled={isThisRowLoading}
                            onClick={() => handleReview(volunteerId, "approve")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-60 transition cursor-pointer"
                          >
                            {isThisRowLoading ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Approve
                          </button>

                          <button
                            disabled={isThisRowLoading}
                            onClick={() => handleReview(volunteerId, "reject")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-60 transition cursor-pointer"
                          >
                            {isThisRowLoading ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <XCircle size={14} />
                            )}
                            Reject
                          </button>
                        </>
                      ) : proof.status === "Approved" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-xl text-xs font-semibold">
                          <CheckCircle size={14} className="text-emerald-600" />
                          Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200/60 rounded-xl text-xs font-semibold">
                          <XCircle size={14} className="text-rose-600" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {proof.message && (
                    <div className="text-gray-700 text-xs mb-3 bg-gray-50/70 p-3 rounded-xl border border-gray-200/60">
                      <span className="font-semibold text-gray-900">Note: </span>
                      {proof.message}
                    </div>
                  )}

                  {proof.fileUrl && (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-64 flex items-center justify-center">
                      <img
                        src={buildFileUrl(proof.fileUrl)}
                        alt="Submitted proof"
                        className="max-h-64 object-contain mx-auto"
                      />
                      <a
                        href={buildFileUrl(proof.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition"
                      >
                        View Full Size &rarr;
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
