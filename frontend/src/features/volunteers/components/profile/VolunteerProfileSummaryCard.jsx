import React, { useMemo } from "react";
import { User, MapPin, Phone, Mail, AlertCircle } from "lucide-react";

export default function VolunteerProfileSummaryCard({ me, profileIncomplete }) {
  const initials = useMemo(() => {
    const n = me?.fullName?.trim();
    if (!n) return "VA";
    const parts = n.split(" ").filter(Boolean);
    return (parts[0]?.[0] + (parts[1]?.[0] || "")).toUpperCase();
  }, [me?.fullName]);

  const allTags = useMemo(() => {
    const skills = Array.isArray(me?.skills) ? me.skills : [];
    const interests = Array.isArray(me?.interests) ? me.interests : [];
    return [...skills, ...interests];
  }, [me?.skills, me?.interests]);

  const locationDisplay = useMemo(() => {
    const parts = [me?.barangay, me?.city, me?.province].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : me?.barangay || "";
  }, [me?.barangay, me?.city, me?.province]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-2xl font-bold shadow-md">
          {initials}
        </div>

        {/* Info Section */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2 mb-1 truncate">
            <User size={18} className="text-green-600 shrink-0" />
            <span className="truncate">{me?.fullName || "No name set"}</span>
          </h2>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-gray-700 text-sm mb-3">
            <div className="flex items-center gap-1">
              <MapPin
                size={14}
                className={
                  locationDisplay
                    ? "text-green-600 shrink-0"
                    : "text-gray-400 shrink-0"
                }
              />
              <span
                className={
                  locationDisplay ? "text-sm" : "text-sm text-gray-400"
                }
              >
                {locationDisplay || "Location not set"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Phone
                size={14}
                className={
                  me?.contactNumber?.trim()
                    ? "text-green-600 shrink-0"
                    : "text-gray-400 shrink-0"
                }
              />
              <span
                className={
                  me?.contactNumber?.trim()
                    ? "text-sm"
                    : "text-sm text-gray-400"
                }
              >
                {me?.contactNumber?.trim() || "Contact not set"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Mail
                size={14}
                className={
                  me?.email
                    ? "text-green-600 shrink-0"
                    : "text-gray-400 shrink-0"
                }
              />
              <span className={me?.email ? "text-sm" : "text-sm text-gray-400"}>
                {me?.email || "Email not set"}
              </span>
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
              {allTags.slice(0, 6).map((item, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-full bg-green-50 border border-green-100 text-green-700 font-medium"
                >
                  {item}
                </span>
              ))}
              {allTags.length > 6 && (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">
                  +{allTags.length - 6} more
                </span>
              )}
            </div>
          )}

          {profileIncomplete && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                <AlertCircle size={12} />
                Setup Incomplete
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
