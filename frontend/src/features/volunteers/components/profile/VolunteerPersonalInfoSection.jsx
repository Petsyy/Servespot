import React from "react";
import { User, Mail, Calendar, Phone, ShieldCheck } from "lucide-react";
import LocationCascadingSelector from "@/shared/components/location/LocationCascadingSelector";

function Field({
  label,
  icon,
  value,
  onChange,
  editable,
  type = "text",
  placeholder = "",
  required = false,
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
          placeholder={placeholder}
          className="w-full h-9 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm transition"
        />
      ) : (
        <div className="w-full h-9 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-sm">
          {value || <span className="text-gray-400">Not set</span>}
        </div>
      )}
    </div>
  );
}

export default function VolunteerPersonalInfoSection({
  me,
  isEditing,
  onChange,
  onLocationChange,
  profileIncomplete,
}) {
  return (
    <section className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-green-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <ShieldCheck size={16} className="text-green-700" />
        <h3 className="font-semibold text-gray-900 text-sm">Personal Information</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Full Name */}
        <Field
          label="Full Name"
          icon={<User size={14} className="text-green-600" />}
          value={me?.fullName}
          editable={isEditing}
          onChange={(v) => onChange("fullName", v)}
          placeholder="Enter your full name"
          required={profileIncomplete}
        />

        {/* Email */}
        <Field
          label="Email"
          icon={<Mail size={14} className="text-green-600" />}
          value={me?.email}
          editable={false}
        />

        {/* Birthdate & Gender Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Birthdate"
            icon={<Calendar size={14} className="text-green-600" />}
            type="date"
            value={me?.birthdate ? me.birthdate.slice(0, 10) : ""}
            editable={isEditing}
            onChange={(v) => onChange("birthdate", v)}
            required={profileIncomplete}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Gender
            </label>
            {isEditing ? (
              <div className="flex items-center gap-4 h-9 px-3 rounded-lg border border-gray-300">
                {["Male", "Female"].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700"
                  >
                    <input
                      type="radio"
                      name="volunteer-gender"
                      value={option}
                      checked={me?.gender === option}
                      onChange={() => onChange("gender", option)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="w-full h-9 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-sm">
                {me?.gender || <span className="text-gray-400">Not set</span>}
              </div>
            )}
          </div>
        </div>

        {/* Contact Number */}
        <Field
          label="Contact Number"
          icon={<Phone size={14} className="text-green-600" />}
          value={me?.contactNumber}
          editable={isEditing}
          onChange={(v) => onChange("contactNumber", v)}
          placeholder="Your phone number"
          required={profileIncomplete}
        />

        {/* Address / Location Cascading */}
        <div className="pt-2 border-t border-gray-100">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Address / Location
          </h4>
          <LocationCascadingSelector
            region={me?.region}
            regionCode={me?.regionCode || me?.region}
            province={me?.province}
            provinceCode={me?.provinceCode || me?.province}
            city={me?.city}
            cityCode={me?.cityCode || me?.city}
            barangay={me?.barangay}
            barangayCode={me?.barangayCode || me?.barangay}
            editable={isEditing}
            onChange={onLocationChange}
          />
        </div>

        {/* Required Fields Note */}
        {isEditing && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Fields marked with * are required to complete your profile setup.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

