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
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className="sticky top-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden w-full max-w-sm self-start"
      style={{
        maxHeight: "calc(100vh - 3rem)",
        overflowY: "auto",
      }}
    >
      {/* Poster Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Poster"
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white/40 text-xs font-semibold tracking-wider uppercase">
          Opportunity Cover Preview
        </div>
      )}

      {/* Content */}
      <div className="p-5 break-words">
        <h3 className="text-base font-bold text-gray-900 leading-snug">
          {title || "Opportunity Title"}
        </h3>
        <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed line-clamp-3">
          {description || "Opportunity description will appear here..."}
        </p>

        {/* Info Section */}
        <div className="space-y-2 text-xs text-gray-700 bg-slate-50/70 p-3 rounded-xl border border-gray-100 mb-4">
          {formattedDate && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-emerald-600 shrink-0" />
              <span className="font-medium text-gray-700">{formattedDate}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-emerald-600 shrink-0" />
              <span className="font-medium text-gray-700">{duration}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-emerald-600 shrink-0" />
              <span className="font-medium text-gray-700">{location}</span>
            </div>
          )}
          {volunteersNeeded !== undefined && (
            <div className="flex items-center gap-2">
              <UsersIcon size={14} className="text-emerald-600 shrink-0" />
              <span className="font-medium text-gray-700">
                {volunteersNeeded === 1
                  ? "1 volunteer needed"
                  : `${volunteersNeeded} volunteers needed`}
              </span>
            </div>
          )}
        </div>

        {/* Skills Section */}
        {skills?.length > 0 && (
          <div>
            <p className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 mb-2">
              Required Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60"
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
