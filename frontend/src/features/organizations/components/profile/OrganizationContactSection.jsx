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
      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
        {icon}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      {editable ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm transition"
          placeholder={placeholder}
        />
      ) : (
        <div className="w-full h-10 px-3 flex items-center rounded-lg bg-gray-50 border border-green-200 text-gray-800 text-sm">
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
    <section className="rounded-2xl border border-green-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3 border-b border-green-200 flex items-center gap-2">
        <User size={18} className="text-green-700" />
        <h3 className="font-semibold text-gray-900">Contact & Location</h3>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Organization Name"
            icon={<Building2 size={16} className="text-green-600" />}
            value={org.orgName}
            editable={isEditing}
            onChange={(v) => onChange("orgName", v)}
            placeholder="Enter organization name"
            required={profileIncomplete}
          />

          <Field
            label="Email"
            icon={<Mail size={16} className="text-green-600" />}
            value={org.email}
            editable={false}
          />

          <Field
            label="Contact Person"
            icon={<User size={16} className="text-green-600" />}
            value={org.contactPerson}
            editable={isEditing}
            onChange={(v) => onChange("contactPerson", v)}
            placeholder="Full name of contact person"
            required={profileIncomplete}
          />

          <Field
            label="Contact Number"
            icon={<Phone size={16} className="text-green-600" />}
            value={org.contactNumber}
            editable={isEditing}
            onChange={(v) => onChange("contactNumber", v)}
            placeholder="Phone number"
            required={profileIncomplete}
          />
        </div>

        {/* Location Section */}
        <div className="pt-2 border-t border-gray-100">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Address / Location
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

        {isEditing && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Fields marked with * are required to complete your profile setup.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

