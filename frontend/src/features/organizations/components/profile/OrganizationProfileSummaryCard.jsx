import React from "react";
import { MapPin, User, Mail, AlertCircle, ShieldCheck } from "lucide-react";

export default function OrganizationProfileSummaryCard({ org, profileIncomplete }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
      <div className="flex flex-col gap-1 text-left">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight truncate">
            {org?.orgName || "No organization name set"}
          </h2>
          {!profileIncomplete ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <ShieldCheck size={12} className="text-emerald-600" />
              Verified Organization
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
              <AlertCircle size={12} className="text-amber-600" />
              Setup Incomplete
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 font-medium">
          {org?.orgType || "Organization type not specified"}
        </p>

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className={org?.city ? "text-emerald-600" : "text-gray-400"} />
            <span className={org?.city ? "font-medium text-gray-700" : "text-gray-400"}>
              {org?.city || "Location not set"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <User size={14} className={org?.contactPerson ? "text-emerald-600" : "text-gray-400"} />
            <span className={org?.contactPerson ? "font-medium text-gray-700" : "text-gray-400"}>
              {org?.contactPerson || "Contact person not set"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Mail size={14} className={org?.email ? "text-emerald-600" : "text-gray-400"} />
            <span className={org?.email ? "font-medium text-gray-700" : "text-gray-400"}>
              {org?.email || "Email not set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
