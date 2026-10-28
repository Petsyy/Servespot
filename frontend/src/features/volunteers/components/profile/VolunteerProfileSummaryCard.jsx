import React, { useMemo } from "react";
import { User, MapPin, Phone, Mail, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function VolunteerProfileSummaryCard({ me, badgesData }) {
  const allTags = useMemo(() => {
    const skills = Array.isArray(me?.skills) ? me.skills : [];
    const interests = Array.isArray(me?.interests) ? me.interests : [];
    return Array.from(new Set([...skills, ...interests]));
  }, [me?.skills, me?.interests]);

  const locationDisplay = useMemo(() => {
    const parts = [me?.barangay, me?.city, me?.province].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : me?.barangay || "";
  }, [me?.barangay, me?.city, me?.province]);

  const points = badgesData?.points ?? me?.points ?? 0;
  const badgesCount = (Array.isArray(badgesData?.badges) ? badgesData.badges.length : 0) || (Array.isArray(me?.badges) ? me.badges.length : 0);
  const levelName = badgesData?.level?.level || "Volunteer";

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 mb-6 shadow-xs">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 truncate">
            <User size={18} className="text-emerald-600 shrink-0" />
            <span className="truncate">{me?.fullName || "No name set"}</span>
          </h2>

          {/* Quick Rewards Pill */}
          <Link
            to="/volunteer/badges"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-gray-200/80 hover:border-emerald-200 text-xs font-semibold text-gray-700 hover:text-emerald-800 transition shadow-xs group self-start sm:self-auto cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-amber-700">
              <Trophy size={13} />
              <span>{levelName}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-emerald-700 font-bold">{points} pts</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600">{badgesCount} badges</span>
            <ArrowRight size={11} className="text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <MapPin
              size={14}
              className={locationDisplay ? "text-emerald-600 shrink-0" : "text-gray-400 shrink-0"}
            />
            <span className={locationDisplay ? "font-medium text-gray-700" : "text-gray-400"}>
              {locationDisplay || "Location not set"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Phone
              size={14}
              className={me?.contactNumber?.trim() ? "text-emerald-600 shrink-0" : "text-gray-400 shrink-0"}
            />
            <span className={me?.contactNumber?.trim() ? "font-medium text-gray-700" : "text-gray-400"}>
              {me?.contactNumber?.trim() || "Contact not set"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Mail
              size={14}
              className={me?.email ? "text-emerald-600 shrink-0" : "text-gray-400 shrink-0"}
            />
            <span className={me?.email ? "font-medium text-gray-700" : "text-gray-400"}>
              {me?.email || "Email not set"}
            </span>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {allTags.slice(0, 7).map((item, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 text-[11px] rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800 font-semibold"
              >
                {item}
              </span>
            ))}
            {allTags.length > 7 && (
              <span className="px-2 py-0.5 text-[11px] rounded-lg bg-slate-100 text-slate-600 font-semibold">
                +{allTags.length - 7} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
