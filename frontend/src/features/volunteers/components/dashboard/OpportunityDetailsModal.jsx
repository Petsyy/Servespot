import React from "react";
import { X, Calendar, Clock, MapPin, Users, Info } from "lucide-react";

export default function OpportunityDetailsModal({ opportunity, onClose }) {
  if (!opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Opportunity Details
                  </h2>
                  <p className="text-green-100 text-sm mt-1">
                    {opportunity.organization?.orgName || "Community Partner"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 cursor-pointer"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          {/* Title and Status */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {opportunity.title}
            </h3>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <Clock size={14} />
              Active Opportunity
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunity.date && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Date</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {new Date(opportunity.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {opportunity.duration && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Duration</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {opportunity.duration}
                  </p>
                </div>
              </div>
            )}

            {opportunity.location && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {opportunity.location}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Users size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Volunteers</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {opportunity.volunteers?.length || 0} /{" "}
                  {opportunity.volunteersNeeded || 1}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-gray-600" />
              <h4 className="font-semibold text-gray-900 text-sm">Description</h4>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {opportunity.description || "No description available."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 rounded-lg font-medium shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer"
          >
            <X size={16} />
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

