import React from "react";
import FormInput from "@/shared/components/ui/FormInput";
import CheckboxGroup from "@/shared/components/ui/CheckboxGroup";
import { Sparkles, ChevronDown } from "lucide-react";
import {
  SKILLS_OPTIONS,
  INTERESTS_OPTIONS,
  AVAILABILITY_DAYS,
  MAX_SELECTION,
} from "@/features/volunteers/constants/volunteerOptions";
import { useVolunteerProfileStep } from "@/features/auth/hooks/useVolunteerProfileStep";

export default function Step2VolunteerCompleteProfile({
  formData,
  updateField,
  onPrev,
  onSubmit,
}) {
  const {
    errors,
    isSubmitting,
    location,
    showAvailabilityDropdown,
    setShowAvailabilityDropdown,
    availabilityDropdownRef,
    handleCheckboxChange,
    handleSubmit,
  } = useVolunteerProfileStep({ formData, updateField, onPrev, onSubmit });

  const maxBirthdate = new Date();
  maxBirthdate.setFullYear(maxBirthdate.getFullYear() - 18);
  const maxBirthdateStr = maxBirthdate.toISOString().split("T")[0];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 2 of 2 • Profile Setup</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Complete Your Profile
        </h2>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          Help us connect you with verified local causes that match your skills and schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal & Contact */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
            1. Personal & Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Birthdate"
              type="date"
              max={maxBirthdateStr}
              min="1920-01-01"
              value={formData.birthdate || ""}
              onChange={(val) => updateField("birthdate", val)}
              error={errors.birthdate}
            />

            <FormInput
              label="Gender"
              type="radio"
              options={["Male", "Female"]}
              value={formData.gender || ""}
              onChange={(val) => updateField("gender", val)}
              error={errors.gender}
            />
          </div>

          <FormInput
            label="Contact Number"
            placeholder="e.g. 09171234567"
            type="text"
            value={formData.contact || ""}
            onChange={(val) => {
              if (/^\d{0,11}$/.test(val)) {
                updateField("contact", val);
              }
            }}
            error={errors.contact}
          />
        </div>

        {/* Section 2: Location Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
            2. Your Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Region"
              type="select"
              options={location.regions.map((r) => ({ value: r.code, label: r.name }))}
              value={formData.regionCode || ""}
              onChange={location.handleRegionChange}
              placeholder={location.loadingRegions ? "Loading regions..." : "Select your region"}
              disabled={location.loadingRegions}
              error={errors.region}
            />

            <FormInput
              label="Province"
              type="select"
              options={location.provinces.map((p) => ({ value: p.code, label: p.name }))}
              value={formData.provinceCode || ""}
              onChange={location.handleProvinceChange}
              placeholder={
                location.loadingProvinces
                  ? "Loading provinces..."
                  : "Select your province"
              }
              disabled={location.loadingProvinces || !formData.regionCode}
              error={errors.province}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="City / Municipality"
              type="select"
              options={location.cities.map((c) => ({ value: c.code, label: c.name }))}
              value={formData.cityCode || ""}
              onChange={location.handleCityChange}
              placeholder={
                location.loadingCities ? "Loading cities..." : "Select your city"
              }
              disabled={location.loadingCities || !formData.provinceCode}
              error={errors.city}
            />

            <FormInput
              label="Barangay"
              type="select"
              options={location.barangays.map((b) => ({ value: b.code, label: b.name }))}
              value={formData.barangayCode || ""}
              onChange={location.handleBarangayChange}
              placeholder={
                location.loadingBarangays
                  ? "Loading barangays..."
                  : "Select your barangay"
              }
              disabled={location.loadingBarangays || !formData.cityCode}
              error={errors.barangay}
            />
          </div>

          <FormInput
            label="Specific Address (Optional)"
            type="text"
            placeholder="e.g. Street name, building, house number"
            value={formData.address || ""}
            onChange={(val) => updateField("address", val)}
          />
        </div>

        {/* Section 3: Skills, Interests & Availability */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
            3. Skills & Availability
          </h3>

          <div>
            <CheckboxGroup
              label={`Skills & Expertise (max ${MAX_SELECTION})`}
              options={SKILLS_OPTIONS}
              selected={formData.skills || []}
              onChange={(val) => handleCheckboxChange("skills", val)}
            />
            {errors.skills && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.skills}</p>
            )}
          </div>

          <div>
            <CheckboxGroup
              label={`Interests & Causes (max ${MAX_SELECTION})`}
              options={INTERESTS_OPTIONS}
              selected={formData.interests || []}
              onChange={(val) => handleCheckboxChange("interests", val)}
            />
            {errors.interests && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.interests}</p>
            )}
          </div>

          {/* Availability Dropdown */}
          <div className="relative" ref={availabilityDropdownRef}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Availability (Select all that apply)
            </label>

            <button
              type="button"
              className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-left flex justify-between items-center focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all text-sm"
              onClick={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
            >
              <span className={formData.availability?.length ? "text-gray-900 font-medium" : "text-gray-400"}>
                {formData.availability?.length
                  ? formData.availability.join(", ")
                  : "Select available days..."}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showAvailabilityDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showAvailabilityDropdown && (
              <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-52 overflow-y-auto p-1 animate-fadeInUp">
                {AVAILABILITY_DAYS.map((day) => {
                  const isChecked = formData.availability?.includes(day);
                  return (
                    <label
                      key={day}
                      className="flex items-center px-3 py-2 hover:bg-emerald-50 rounded-lg cursor-pointer text-sm text-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(isChecked)}
                        onChange={(e) => {
                          const current = Array.isArray(formData.availability)
                            ? formData.availability
                            : [];
                          const next = e.target.checked
                            ? [...current, day]
                            : current.filter((d) => d !== day);
                          updateField("availability", next);
                        }}
                        className="mr-2 text-emerald-600 focus:ring-emerald-500 rounded"
                      />
                      {day}
                    </label>
                  );
                })}
              </div>
            )}

            {errors.availability && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.availability}</p>
            )}
          </div>

          <FormInput
            label="Bio & Motivation (Optional)"
            type="textarea"
            placeholder="Tell us what motivates you to volunteer (optional)..."
            value={formData.bio || ""}
            onChange={(val) => updateField("bio", val)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onPrev}
            disabled={isSubmitting}
            className="py-3 px-5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 transition-all duration-150 cursor-pointer"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Completing registration...</span>
              </>
            ) : (
              "Complete Registration"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
