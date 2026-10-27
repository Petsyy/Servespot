import React, { useMemo } from "react";
import { Building2, MapPin, User, Mail, AlertCircle } from "lucide-react";

export default function OrganizationProfileSummaryCard({ org, profileIncomplete }) {
  const initials = useMemo(() => {
    const n = org?.orgName?.trim();
    if (!n) return "OR";
    const parts = n.split(" ");
    return (parts[0]?.[0] + (parts[1]?.[0] || "")).toUpperCase();
  }, [org?.orgName]);

  return (
    <div className="bg-white rounded-xl border border-green-200 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8 shadow-sm hover:shadow-md transition-shadow">
      {/* Logo / Avatar */}
      <div className="w-20 h-20 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-2xl font-bold shadow-md">
        {initials}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1 text-center sm:text-left flex-1 min-w-0">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center justify-center sm:justify-start gap-2 truncate">
          <Building2 size={18} className="text-green-600 shrink-0" />
          <span className="truncate">{org?.orgName || "No organization name set"}</span>
        </h2>
        <p className="text-sm text-gray-600">
          {org?.orgType || "Organization type not specified"}
        </p>

        {/* Info Row */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mt-2 text-gray-700 text-sm">
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className={org?.city ? "text-green-600" : "text-gray-400"} />
            <span className={org?.city ? "" : "text-gray-400"}>
              {org?.city || "Location not set"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <User size={16} className={org?.contactPerson ? "text-green-600" : "text-gray-400"} />
            <span className={org?.contactPerson ? "" : "text-gray-400"}>
              {org?.contactPerson || "Contact person not set"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Mail size={16} className={org?.email ? "text-green-600" : "text-gray-400"} />
            <span className={org?.email ? "" : "text-gray-400"}>
              {org?.email || "Email not set"}
            </span>
          </div>
        </div>

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
  );
}

