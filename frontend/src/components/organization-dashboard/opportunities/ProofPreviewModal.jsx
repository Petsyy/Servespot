import React, { useEffect, useState, useCallback } from "react";
import { X, CheckCircle, XCircle, Image, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:5000").replace(/\/+$/, "");

function getVolunteerId(v) {
  if (!v) return "";
  return typeof v === "string" ? v : v._id || "";
}

export default function ProofReviewModal({ opportunityId, onClose }) {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null); // stores volunteerId currently being reviewed

  // Load all submitted proofs for this opportunity
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/opportunities/view/${opportunityId}`);
        if (!alive) return;
        setProofs(res.data.completionProofs || []);
      } catch (err) {
        console.error("Failed to load proofs:", err);
        toast.error("Failed to load volunteer proofs");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [opportunityId]);

  const handleReview = useCallback(async (volunteerId, action) => {
    // Optimistic update: apply immediately
    setReviewing(volunteerId);

    setProofs((prevProofs) =>
      prevProofs.map((p) => {
        const pId = getVolunteerId(p.volunteer);
        if (pId === volunteerId && p.status === "Pending") {
          return {
            ...p,
            status: action === "approve" ? "Approved" : "Rejected",
            // set timestamps optimistically
            ...(action === "reject"
              ? { rejectedAt: new Date().toISOString() }
              : {}),
          };
        }
        return p;
      })
    );

    try {
      const token =
        localStorage.getItem("ic_org_token") ||
        localStorage.getItem("ic_token") ||
        localStorage.getItem("token") ||
        "";

      const res = await axios.patch(
        `${API_BASE}/api/opportunities/${opportunityId}/proof/${volunteerId}/review`,
        { action },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      toast.success(res?.data?.message || "Review updated");
    } catch (err) {
      console.error("Review failed:", err);
      // Revert on failure
      setProofs((prevProofs) =>
        prevProofs.map((p) => {
          const pId = getVolunteerId(p.volunteer);
          if (pId === volunteerId) {
            return {
              ...p,
              status: "Pending",
              rejectedAt: undefined,
            };
          }
          return p;
        })
      );
      toast.error(
        err?.response?.data?.message || "Failed to update review status"
      );
    } finally {
      setReviewing(null);
    }
  }, [opportunityId]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Proof Submissions
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : proofs.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <Image size={36} className="mx-auto mb-2 text-gray-400" />
            <p>No proofs submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proofs.map((proof) => {
              const volunteerId = getVolunteerId(proof.volunteer);
              const isThisRowLoading = reviewing === volunteerId;

              return (
                <div
                  key={proof._id || volunteerId}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {proof.volunteer?.firstName
                          ? `${proof.volunteer.firstName} ${proof.volunteer.lastName}`
                          : "Volunteer"}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>Status:</span>
                          <span
                            className={`font-semibold px-2 py-1 rounded-full text-xs ${
                              proof.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : proof.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {proof.status}
                          </span>
                        </div>
                        {proof.status === "Rejected" && proof.rejectedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Rejected on:{" "}
                            {new Date(proof.rejectedAt).toLocaleString()}
                          </div>
                        )}
                        {proof.status === "Pending" && proof.submittedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Submitted:{" "}
                            {new Date(proof.submittedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {proof.status === "Pending" ? (
                        <>
                          <button
                            disabled={isThisRowLoading}
                            onClick={() => handleReview(volunteerId, "approve")}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm font-medium disabled:opacity-60"
                          >
                            {isThisRowLoading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                            Approve
                          </button>

                          <button
                            disabled={isThisRowLoading}
                            onClick={() => handleReview(volunteerId, "reject")}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium disabled:opacity-60"
                          >
                            {isThisRowLoading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <XCircle size={16} />
                            )}
                            Reject
                          </button>
                        </>
                      ) : proof.status === "Approved" ? (
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                          <CheckCircle size={16} />
                          Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium">
                          <XCircle size={16} />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {proof.message && (
                    <p className="text-gray-700 text-sm mb-2 border-l-2 border-blue-200 pl-3 italic">
                      “{proof.message}”
                    </p>
                  )}

                  {proof.fileUrl && (
                    <div className="relative group">
                      <img
                        src={`${API_BASE}${proof.fileUrl}`}
                        alt="proof"
                        className="rounded-lg border border-gray-200 max-h-64 object-cover mx-auto"
                      />
                      <a
                        href={`${API_BASE}${proof.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition"
                      >
                        View Full Image
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
