import React from "react";
import { FileText } from "lucide-react";
import { ORG_TYPES } from "../../constants/organizationTypes";

export default function OrganizationAboutSection({
  org,
  isEditing,
  onChange,
  profileIncomplete,
}) {
  return (
    <section className="rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs bg-white">
      <div className="bg-slate-50/60 px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
          <FileText size={16} />
        </div>
        <h3 className="font-bold text-sm text-gray-900 tracking-tight">About Organization</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
            Mission & Description
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              value={org.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 p-3 text-xs transition outline-none"
              placeholder="Tell volunteers about your mission, background, and community impact..."
            />
          ) : (
            <div className="rounded-xl bg-slate-50/60 border border-gray-200/80 p-3.5 text-gray-800 text-xs min-h-[90px] whitespace-pre-wrap leading-relaxed">
              {org.description || (
                <span className="text-gray-400">No mission or description provided yet.</span>
              )}
            </div>
          )}
        </div>

        {/* Organization Type */}
        <div>
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            Organization Type {profileIncomplete && <span className="text-rose-500">*</span>}
          </label>
          {isEditing ? (
            <select
              value={org.orgType || ""}
              onChange={(e) => onChange("orgType", e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs transition outline-none bg-white cursor-pointer"
            >
              <option value="" disabled>
                Select type...
              </option>
              {ORG_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full h-10 px-3.5 flex items-center rounded-xl bg-slate-50/60 border border-gray-200/80 text-gray-800 text-xs font-medium">
              {org.orgType ? (
                ORG_TYPES.find((o) => o.value === org.orgType)?.label || org.orgType
              ) : (
                <span className="text-gray-400">Not set</span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
