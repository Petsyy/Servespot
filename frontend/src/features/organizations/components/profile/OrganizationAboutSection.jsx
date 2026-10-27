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
    <section className="rounded-2xl border border-green-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3 border-b border-green-200 flex items-center gap-2">
        <FileText size={18} className="text-green-700" />
        <h3 className="font-semibold text-gray-900">About Organization</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Description
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              value={org.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 text-sm transition"
              placeholder="Tell us about your organization..."
            />
          ) : (
            <div className="rounded-lg bg-gray-50 border border-green-200 p-3 text-gray-800 text-sm min-h-[84px] whitespace-pre-wrap">
              {org.description || (
                <span className="text-gray-400">Not set</span>
              )}
            </div>
          )}
        </div>

        {/* Organization Type */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            Organization Type {profileIncomplete && <span className="text-red-500">*</span>}
          </label>
          {isEditing ? (
            <select
              value={org.orgType || ""}
              onChange={(e) => onChange("orgType", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm transition"
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
            <div className="w-full h-10 px-3 flex items-center rounded-lg bg-gray-50 border border-green-200 text-gray-800 text-sm">
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

