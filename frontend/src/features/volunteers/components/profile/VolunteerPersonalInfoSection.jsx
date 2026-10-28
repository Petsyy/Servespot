import React from "react";
import { User, Calendar, Phone, ShieldCheck } from "lucide-react";
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
          placeholder={placeholder}
          className="w-full h-10 px-3.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs transition outline-none"
        />
      ) : (
        <div className="w-full h-10 px-3.5 flex items-center rounded-xl bg-slate-50/60 border border-gray-200/80 text-gray-800 text-xs font-medium">
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
    <section className="rounded-2xl border border-gray-200/80 overflow-hidden bg-white shadow-xs">
      <div className="bg-slate-50/80 px-5 py-3.5 border-b border-gray-200/80 flex items-center gap-2">
        <ShieldCheck size={16} className="text-emerald-700" />
        <h3 className="font-bold text-gray-900 text-sm">Personal Information & Address</h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Full Name & Contact Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Full Name"
            icon={<User size={13} className="text-emerald-600" />}
            value={me?.fullName}
            editable={isEditing}
            onChange={(v) => onChange("fullName", v)}
            placeholder="First and last name"
            required={profileIncomplete}
          />

          <Field
            label="Contact Number"
            icon={<Phone size={13} className="text-emerald-600" />}
            value={me?.contactNumber}
            editable={isEditing}
            onChange={(v) => onChange("contactNumber", v)}
            placeholder="e.g. 0917-123-4567"
            required={profileIncomplete}
          />
        </div>

        {/* Birthdate & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Birthdate"
            icon={<Calendar size={13} className="text-emerald-600" />}
            type="date"
            value={me?.birthdate ? me.birthdate.slice(0, 10) : ""}
            editable={isEditing}
            onChange={(v) => onChange("birthdate", v)}
            required={profileIncomplete}
          />

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 block">
              Gender
            </label>
            {isEditing ? (
              <div className="flex items-center gap-4 h-10 px-3.5 rounded-xl border border-gray-300 bg-white">
                {["Male", "Female", "Prefer not to say"].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-gray-700 select-none"
                  >
                    <input
                      type="radio"
                      name="volunteer-gender"
                      value={option}
                      checked={me?.gender === option}
                      onChange={() => onChange("gender", option)}
                      className="h-3.5 w-3.5 text-emerald-600 focus:ring-emerald-500/20 accent-emerald-600 cursor-pointer"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="w-full h-10 px-3.5 flex items-center rounded-xl bg-slate-50/60 border border-gray-200/80 text-gray-800 text-xs font-medium">
                {me?.gender || <span className="text-gray-400">Not set</span>}
              </div>
            )}
          </div>
        </div>

        {/* Address / Location Cascading */}
        <div className="pt-3 border-t border-gray-100">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Residential Address & Jurisdiction
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
      </div>
    </section>
  );
}
