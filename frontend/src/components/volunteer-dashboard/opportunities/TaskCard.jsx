import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";

export default function TaskCard({
  title,
  orgName,
  dateLabel,
  duration,
  location,
  points,
  status,
}) {
  // 🎨 Define colors and icons per status
  const statusStyles = {
    Open: {
      color: "text-green-700",
      bg: "bg-green-50",
      icon: null,
    },
    "In Progress": {
      color: "text-orange-700",
      bg: "bg-orange-50",
      icon: <Loader2 size={14} className="text-orange-600 animate-spin" />,
    },
    Completed: {
      color: "text-gray-700",
      bg: "bg-gray-100",
      icon: <CheckCircle2 size={14} className="text-green-600" />,
    },
  };

  const { color, bg, icon } = statusStyles[status] || {
    color: "text-gray-700",
    bg: "bg-gray-100",
    icon: null,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition hover:shadow-md">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium text-gray-800">Organization:</span>{" "}
            {orgName}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${bg} ${color}`}
        >
          {icon} {status}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700 font-semibold">
        {dateLabel && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            {dateLabel}
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
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-5 gap-3">
        {status === "Completed" ? (
          <button
            className="w-full sm:w-auto flex-1 sm:flex-none h-10 px-6 rounded-lg bg-gray-200 hover:bg-gray-300 
                       text-gray-800 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <FileText size={16} />
            View Proof
          </button>
        ) : (
          <button
            className="w-full sm:w-auto flex-1 sm:flex-none h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 
                       text-white font-semibold text-sm transition-all shadow-sm"
          >
            View Details
          </button>
        )}

        {points && (
          <span className="text-sm font-semibold text-orange-600 sm:ml-3 text-center sm:text-right">
            +{points} points
          </span>
        )}
      </div>
    </div>
  );
}
