import React from "react";
import { X, Users as UsersIcon, CheckCircle, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { updateVolunteerStatus } from "@/shared/services/api";
import { queryClient } from "@/shared/services/queryClient";
import { queryKeys } from "@/shared/services/queryKeys";
import { toast } from "react-toastify";

export default function VolunteerDetailsModal({ volunteer, onClose }) {
  const updateStatusMutation = useMutation({
    mutationFn: ({ volunteerId, opportunityId, status }) =>
      updateVolunteerStatus(volunteerId, opportunityId, status),
    onSuccess: (_, variables) => {
      toast.success(`${volunteer.name} marked as ${variables.status}`);
      if (variables.opportunityId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.opportunities.volunteers(variables.opportunityId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.opportunities.detail(variables.opportunityId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
      window.dispatchEvent(new Event("volunteersUpdated"));
      onClose();
    },
    onError: (err) => {
      console.error("Failed to update status:", err);
      toast.error(err?.response?.data?.message || "Failed to update volunteer status");
    },
  });

  if (!volunteer) return null;

  const handleAction = (newStatus) => {
    updateStatusMutation.mutate({
      volunteerId: volunteer.id,
      opportunityId: volunteer.opportunityId,
      status: newStatus,
    });
  };

  const loading = updateStatusMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200/80 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <UsersIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Volunteer Details</h2>
              <p className="text-xs text-gray-500 mt-0.5 max-w-[240px] truncate">{volunteer.opportunity}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-slate-50/60 rounded-xl border border-gray-200/80 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-500">Name</span>
              <span className="font-bold text-gray-900">{volunteer.name}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
              <span className="font-semibold text-gray-500">Email</span>
              <span className="font-medium text-gray-800">{volunteer.email}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
              <span className="font-semibold text-gray-500">Contact</span>
              <span className="font-medium text-gray-800">{volunteer.phone || "—"}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
              <span className="font-semibold text-gray-500">Applied Date</span>
              <span className="font-medium text-gray-800">{volunteer.appliedDate}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
              <span className="font-semibold text-gray-500">Current Status</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  volunteer.status === "Completed"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200/60"
                    : volunteer.status === "Approved"
                    ? "bg-teal-50 text-teal-800 border-teal-200/60"
                    : volunteer.status === "Rejected"
                    ? "bg-rose-50 text-rose-800 border-rose-200/60"
                    : "bg-amber-50 text-amber-800 border-amber-200/60"
                }`}
              >
                {volunteer.status}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-slate-50/40">
          <div className="flex gap-2">
            {volunteer.status === "Pending" && (
              <>
                <button
                  onClick={() => handleAction("Approved")}
                  disabled={loading}
                  className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <CheckCircle size={14} />
                  Approve
                </button>
                <button
                  onClick={() => handleAction("Rejected")}
                  disabled={loading}
                  className="px-3.5 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </>
            )}

            {volunteer.status === "Approved" && (
              <button
                onClick={() => handleAction("Completed")}
                disabled={loading}
                className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <CheckCircle size={14} />
                Mark Completed
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 text-xs font-semibold hover:bg-gray-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
