import React from "react";

import {
  Calendar,
  Clock,
  MapPin,
  Users as UsersIcon,
  Trash,
} from "lucide-react";

export default function OpportunityCard({
  _id,
  title,
  date,
  duration,
  location,
  volunteers,
  status = "Open",
  fileUrl,
  onDelete,
}) {
  const badgeColor =
    status === "Open"
      ? "bg-green-100 text-green-700"
      : status === "In Progress"
        ? "bg-orange-100 text-orange-700"
        : "bg-gray-100 text-gray-600";

  // ✅ Handle volunteer count label (singular/plural)
  const volunteerLabel =
    volunteers === 1 ? "1 volunteer needed" : `${volunteers} volunteers needed`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full w-full">
      {/* Poster Image */}
      {fileUrl && (
        <img
          src={`http://localhost:5000${fileUrl}`}
          alt={title}
          className="w-full h-32 object-cover rounded-t-xl"
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${badgeColor}`}
          >
            {status}
          </span>
        </div>

        {/* Info */}
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

          {volunteers !== undefined && (
            <div className="flex items-center gap-2">
              <UsersIcon size={16} className="text-blue-600" />
              {volunteerLabel}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button className="flex-1 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium">
            View Details
          </button>
          <button className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
            Manage
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(_id)}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
