import React from "react";
import { X, Calendar, Clock, MapPin, Users, Info, Building2 } from "lucide-react";

export default function OpportunityDetailsModal({ opportunity, onClose }) {
  if (!opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200/80 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
              <Building2 size={14} className="text-emerald-600" />
              <span>{opportunity.organization?.orgName || "Community Partner"}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Opportunity Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Title and Status */}
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
              {opportunity.title}
            </h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-xs font-semibold">
              <Clock size={13} className="text-emerald-600" />
              Active Opportunity
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {opportunity.date && (
              <div className="flex items-center gap-3.5 p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Date</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {new Date(opportunity.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {opportunity.duration && (
              <div className="flex items-center gap-3.5 p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-sky-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Duration</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {opportunity.duration}
                  </p>
                </div>
              </div>
            )}

            {opportunity.location && (
              <div className="flex items-center gap-3.5 p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-amber-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Location</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {opportunity.location}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3.5 p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Users size={18} className="text-emerald-700" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Volunteers</p>
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {opportunity.volunteers?.length || 0} /{" "}
                  {opportunity.volunteersNeeded || 1} joined
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Info size={15} className="text-gray-500" />
              <h4 className="font-bold text-gray-900 text-sm">Description & Instructions</h4>
            </div>
            <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-200/80 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {opportunity.description || "No description provided for this opportunity."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-xs transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
