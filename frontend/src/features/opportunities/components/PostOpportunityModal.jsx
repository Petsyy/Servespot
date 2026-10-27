import React from "react";
import { X } from "lucide-react";
import { OPPORTUNITY_SKILLS } from "@/features/opportunities/constants/opportunitySkills";
import { usePostOpportunityForm } from "@/features/opportunities/hooks/usePostOpportunityForm";
import PreviewCard from "@/features/opportunities/components/PreviewCard";
import SkillCheckbox from "@/features/opportunities/components/SkillCheckbox";
import ImageDropzone from "@/features/opportunities/components/ImageDropzone";

export default function PostOpportunityModal({ onClose, onSuccess }) {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    formValues,
    selectedSkills,
    imagePreview,
    handleCheckboxChange,
    handleFileChange,
  } = usePostOpportunityForm({ onSuccess });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl p-8 relative overflow-y-auto max-h-[90vh] border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close modal"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
            Post New Opportunity
          </h2>
          <p className="text-gray-600 mt-1">
            Fill out the details below to create a new volunteer opportunity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm"
            noValidate
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opportunity Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full border rounded-lg p-2 focus:ring-2 outline-none ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                }`}
                placeholder="e.g., Beach Cleanup Volunteer"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className={`w-full border rounded-lg p-2 focus:ring-2 outline-none ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                }`}
                placeholder="Describe the volunteer opportunity..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Date / Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`w-full border rounded-lg p-2 focus:ring-2 outline-none ${
                    errors.date
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                  }`}
                  {...register("date")}
                />
                {errors.date && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.date.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g., 4 hours"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                  {...register("duration")}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full border rounded-lg p-2 focus:ring-2 outline-none ${
                  errors.location
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                }`}
                placeholder="e.g., Community Center, Manila"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.location.message}</p>
              )}
            </div>

            {/* Skills */}
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {OPPORTUNITY_SKILLS.map((skill) => (
                  <SkillCheckbox
                    key={skill}
                    label={skill}
                    checked={selectedSkills.includes(skill)}
                    onChange={() => handleCheckboxChange(skill)}
                  />
                ))}
              </div>
            </div>

            {/* Volunteers Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Volunteers Needed <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className={`w-full border rounded-lg p-2 focus:ring-2 outline-none ${
                  errors.volunteersNeeded
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-green-500"
                }`}
                {...register("volunteersNeeded")}
              />
              {errors.volunteersNeeded && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {errors.volunteersNeeded.message}
                </p>
              )}
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Poster / Image
              </label>
              <ImageDropzone onFile={handleFileChange} />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Posting..." : "Post Opportunity"}
              </button>
            </div>
          </form>

          {/* RIGHT PREVIEW */}
          <div className="sticky top-0 self-start">
            <div className="pl-1">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Live Preview
              </h3>
              <div className="flex justify-start">
                <PreviewCard
                  title={formValues.title}
                  description={formValues.description}
                  location={formValues.location}
                  date={formValues.date}
                  duration={formValues.duration}
                  volunteersNeeded={formValues.volunteersNeeded}
                  skills={selectedSkills}
                  imageUrl={imagePreview || undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
