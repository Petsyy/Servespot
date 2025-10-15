import React, { useState } from "react";
import { X, Users as UsersIcon, CheckCircle, XCircle } from "lucide-react";
import { updateVolunteerStatus } from "@/services/api";
import { toast } from "react-toastify";

export default function VolunteerDetailsModal({ volunteer, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!volunteer) return null;

  const handleAction = async (newStatus) => {
    try {
      setLoading(true);
      await updateVolunteerStatus(volunteer.id, volunteer.opportunityId, newStatus);
      toast.success(`${volunteer.name} marked as ${newStatus}`);

      // Notify other components (like ManageVolunteers or OpportunityCard) to refresh
      window.dispatchEvent(new Event("volunteersUpdated"));
      onClose();
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update volunteer status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Volunteer Details</h2>
              <p className="text-gray-600">{volunteer.opportunity}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 text-sm text-gray-700">
          <p>
            <span className="font-semibold text-gray-900">Name:</span> {volunteer.name}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Email:</span> {volunteer.email}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Contact:</span>{" "}
            {volunteer.phone || "—"}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Applied Date:</span>{" "}
            {volunteer.appliedDate}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                volunteer.status === "Completed"
                  ? "bg-blue-100 text-blue-700"
                  : volunteer.status === "Approved"
                  ? "bg-green-100 text-green-700"
                  : volunteer.status === "Rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {volunteer.status}
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-2">
            {volunteer.status === "Pending" && (
              <>
                <button
                  onClick={() => handleAction("Approved")}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button
                  onClick={() => handleAction("Rejected")}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </>
            )}

            {volunteer.status === "Approved" && (
              <button
                onClick={() => handleAction("Completed")}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Mark Completed
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
