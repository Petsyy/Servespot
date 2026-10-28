import React from "react";
import { User, Building2, Mail, Phone } from "lucide-react";
import LocationCascadingSelector from "@/shared/components/location/LocationCascadingSelector";

function Field({
  label,
  icon,
  value,
  onChange,
  editable,
  placeholder = "",
  required = false,
  type = "text",
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        {icon}
        <span>{label}</span>
        {required && <span className="text-rose-500">*</span>}
      </label>
      {editable ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs transition outline-none"
          placeholder={placeholder}
        />
      ) : (
        <div className="w-full h-10 px-3.5 flex items-center rounded-xl bg-slate-50/60 border border-gray-200/80 text-gray-800 text-xs font-medium">
          {value || <span className="text-gray-400">Not set</span>}
        </div>
      )}
    </div>
  );
}

export default function OrganizationContactSection({
  org,
  isEditing,
  onChange,
  onLocationChange,
  profileIncomplete,
}) {
  return (
    <section className="rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs bg-white">
      <div className="bg-slate-50/60 px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
          <User size={16} />
        </div>
        <h3 className="font-bold text-sm text-gray-900 tracking-tight">Contact & Headquarters</h3>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Organization Name"
            icon={<Building2 size={14} className="text-emerald-600" />}
            value={org.orgName}
            editable={isEditing}
            onChange={(v) => onChange("orgName", v)}
            placeholder="Enter organization name"
            required={profileIncomplete}
          />

          <Field
            label="Account Email"
            icon={<Mail size={14} className="text-emerald-600" />}
            value={org.email}
            editable={false}
          />

          <Field
            label="Lead Contact Person"
            icon={<User size={14} className="text-emerald-600" />}
            value={org.contactPerson}
            editable={isEditing}
            onChange={(v) => onChange("contactPerson", v)}
            placeholder="Full name of representative"
            required={profileIncomplete}
          />

          <Field
            label="Official Contact Number"
            icon={<Phone size={14} className="text-emerald-600" />}
            value={org.contactNumber}
            editable={isEditing}
            onChange={(v) => onChange("contactNumber", v)}
            placeholder="e.g. 0917-123-4567"
            required={profileIncomplete}
          />
        </div>

        {/* Location Section */}
        <div className="pt-3 border-t border-gray-100">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Headquarters Jurisdiction
          </h4>
          <LocationCascadingSelector
            region={org.region}
            regionCode={org.regionCode}
            province={org.province}
            provinceCode={org.provinceCode}
            city={org.city}
            cityCode={org.cityCode}
            barangay={org.barangay}
            barangayCode={org.barangayCode}
            editable={isEditing}
            onChange={onLocationChange}
          />
        </div>
      </div>
    </section>
  );
}
