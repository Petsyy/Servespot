import React from "react";
import Button from "@/shared/components/ui/Button";
import FormInput from "@/shared/components/ui/FormInput";
import CheckboxGroup from "@/shared/components/ui/CheckboxGroup";
import { Users, ChevronDown } from "lucide-react";
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
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-gray-600">Step 2 of 2</span>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Complete Volunteer Profile
        </h2>
        <p className="text-gray-600">
          Tell us more about yourself so we can match you with the right opportunities.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 w-full space-y-5"
      >
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
        </div>

        {/* Birthdate + Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormInput
              label="Birthdate"
              type="date"
              max={maxBirthdateStr}
              min="1920-01-01"
              value={formData.birthdate || ""}
              onChange={(val) => updateField("birthdate", val)}
              error={errors.birthdate}
            />
          </div>
          <div>
            <FormInput
              label="Gender"
              type="radio"
              options={["Male", "Female"]}
              value={formData.gender || ""}
              onChange={(val) => updateField("gender", val)}
              error={errors.gender}
            />
          </div>
        </div>

        {/* Contact Number */}
        <div>
          <FormInput
            label="Contact Number"
            placeholder="e.g., 09171234567"
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

        {/* Cascading Location Selection */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Location</h3>

          {/* Region */}
          <FormInput
            label="Region"
            type="select"
            options={location.regions.map((r) => ({ value: r.code, label: r.name }))}
            value={formData.regionCode || ""}
            onChange={location.handleRegionChange}
            placeholder={
              location.loadingRegions ? "Loading regions..." : "Select your region"
            }
            disabled={location.loadingRegions}
            error={errors.region}
          />

          {/* Province */}
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

          {/* City / Municipality */}
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

          {/* Barangay */}
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

          {/* Specific Address (Optional) */}
          <FormInput
            label="Specific Address (Optional)"
            type="text"
            placeholder="e.g., Street name, building number, etc."
            value={formData.address || ""}
            onChange={(val) => updateField("address", val)}
          />
        </div>

        {/* Skills */}
        <div>
          <CheckboxGroup
            label={`Skills & Expertise (max ${MAX_SELECTION})`}
            options={SKILLS_OPTIONS}
            selected={formData.skills || []}
            onChange={(val) => handleCheckboxChange("skills", val)}
          />
          {errors.skills && (
            <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
          )}
        </div>

        {/* Interests */}
        <div>
          <CheckboxGroup
            label={`Interests & Causes (max ${MAX_SELECTION})`}
            options={INTERESTS_OPTIONS}
            selected={formData.interests || []}
            onChange={(val) => handleCheckboxChange("interests", val)}
          />
          {errors.interests && (
            <p className="text-red-500 text-sm mt-1">{errors.interests}</p>
          )}
        </div>

        {/* Availability Dropdown with Click-Outside */}
        <div className="relative" ref={availabilityDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Availability (Select all that apply)
          </label>

          <button
            type="button"
            className="w-full border rounded-lg p-2.5 bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
          >
            <span
              className={
                formData.availability?.length ? "text-gray-900" : "text-gray-400"
              }
            >
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
            <div className="absolute z-20 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-52 overflow-y-auto p-1">
              {AVAILABILITY_DAYS.map((day) => {
                const isChecked = formData.availability?.includes(day);
                return (
                  <label
                    key={day}
                    className="flex items-center px-3 py-2 hover:bg-green-50 rounded cursor-pointer text-sm text-gray-700"
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
                      className="mr-2 text-green-600 focus:ring-green-500 rounded"
                    />
                    {day}
                  </label>
                );
              })}
            </div>
          )}

          {errors.availability && (
            <p className="text-red-500 text-sm mt-1">{errors.availability}</p>
          )}
        </div>

        {/* Bio (Optional) */}
        <div>
          <FormInput
            label="Bio & Motivation (Optional)"
            type="textarea"
            placeholder="Tell us about yourself and what motivates you to volunteer (optional)"
            value={formData.bio || ""}
            onChange={(val) => updateField("bio", val)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
