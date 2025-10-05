import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users as UsersIcon,
  Award,
} from "lucide-react";

export default function FindOpportunity({
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
  onViewDetails,
}) {
  const badgeColor =
    status === "Open"
      ? "bg-green-100 text-green-700"
      : status === "In Progress"
      ? "bg-orange-100 text-orange-700"
      : "bg-gray-100 text-gray-600";

  //  Handle volunteer count label
  const volunteerLabel =
    volunteersNeeded === 1
      ? "1 volunteer needed"
      : `${volunteersNeeded || 0} volunteers needed`;

  // Handle organization name
  const orgName =
    organization && typeof organization === "object"
      ? organization.orgName || organization.name || "Unknown Organization"
      : organization || "Unknown Organization";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col w-72 min-h-48">
      {/* Poster Image */}
      {fileUrl && (
        <img
          src={`http://localhost:5000${fileUrl}`}
          alt={title}
          className="w-full h-32 object-cover rounded-t-xl"
        />
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${badgeColor}`}
          >
            {status}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {description}
          </p>
        )}

        {/* Organization */}
        <p className="mt-3 text-sm text-gray-700">
          <strong>Organization:</strong> {orgName}
        </p>

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

          {volunteersNeeded !== undefined && (
            <div className="flex items-center gap-2">
              <UsersIcon size={16} className="text-blue-600" />
              {volunteerLabel}
            </div>
          )}

          {points && (
            <div className="flex items-center gap-2">
              <Award size={16} className="text-yellow-500" />
              Earn {points} points
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => onViewDetails && onViewDetails(_id)}
            className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
          >
            View Details
          </button>

          <button className="flex-1 h-10 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
