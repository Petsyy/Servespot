import React from "react";
import { Calendar, Clock, MapPin, Users as UsersIcon } from "lucide-react";

export default function PreviewCard({
  title,
  description,
  location,
  date,
  duration,
  volunteersNeeded,
  skills = [],
  imageUrl,
}) {
  const formattedDate = date
    ? new Date(date).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className="sticky top-6 bg-white rounded-xl border border-gray-200 shadow-sm 
                 overflow-hidden w-full max-w-sm self-start"
      style={{
        maxHeight: 'calc(100vh - 3rem)', // Prevent overflow
        overflowY: 'auto', // Enable scrolling if content is too tall
      }}
    >
      {/* Poster Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Poster"
          className="w-full h-44 object-cover rounded-t-xl"
        />
      )}

      {/* Content */}
      <div className="p-5 break-words">
        <h3 className="text-lg font-semibold text-gray-900">
          {title || "Opportunity Title"}
        </h3>
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          {description || "Opportunity description will appear here..."}
        </p>

        {/* Info Section */}
        <div className="space-y-2 text-sm text-gray-700">
          {formattedDate && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600 shrink-0" />
              <span>{formattedDate}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-600 shrink-0" />
              <span>{duration}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600 shrink-0" />
              <span>{location}</span>
            </div>
          )}
          {volunteersNeeded !== undefined && (
            <div className="flex items-center gap-2">
              <UsersIcon size={16} className="text-blue-600 shrink-0" />
              <span>
                {volunteersNeeded === 1
                  ? "1 volunteer needed"
                  : `${volunteersNeeded} volunteers needed`}
              </span>
            </div>
          )}
        </div>

        {/* Skills Section */}
        {skills?.length > 0 && (
          <div className="mt-4">
            <p className="font-medium text-sm text-gray-800 mb-2">
              Required Skills:
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}