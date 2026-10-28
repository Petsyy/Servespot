import React from "react";
import { X, Sparkles } from "lucide-react";
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 md:p-8 relative overflow-y-auto max-h-[90vh] border border-gray-200/80 animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Post New Opportunity
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Fill out the details below to publish a new micro-volunteering opportunity to the community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4.5 bg-slate-50/60 rounded-2xl p-6 border border-gray-200/80 shadow-xs"
            noValidate
          >
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Opportunity Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full border rounded-xl px-3 py-2 text-sm transition outline-none ${
                  errors.title
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                    : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
                placeholder="e.g., Community Food Bank Packaging"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                className={`w-full border rounded-xl px-3 py-2 text-sm transition outline-none ${
                  errors.description
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                    : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
                placeholder="Provide a clear description of the tasks and community impact..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Date / Duration */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Event Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  className={`w-full border rounded-xl px-3 py-2 text-sm transition outline-none ${
                    errors.date
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                      : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                  {...register("date")}
                />
                {errors.date && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.date.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g., 4 hours"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  {...register("duration")}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full border rounded-xl px-3 py-2 text-sm transition outline-none ${
                  errors.location
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                    : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
                placeholder="e.g., Barangay San Antonio Community Center"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.location.message}</p>
              )}
            </div>

            {/* Skills */}
            <div>
              <p className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Required Skills
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-gray-200">
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
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Volunteers Needed <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className={`w-full border rounded-xl px-3 py-2 text-sm transition outline-none ${
                  errors.volunteersNeeded
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                    : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
                {...register("volunteersNeeded")}
              />
              {errors.volunteersNeeded && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  {errors.volunteersNeeded.message}
                </p>
              )}
            </div>

            {/* Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Upload Poster / Cover Image
              </label>
              <ImageDropzone onFile={handleFileChange} />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Publishing..." : "Post Opportunity"}
              </button>
            </div>
          </form>

          {/* RIGHT PREVIEW */}
          <div className="sticky top-0 self-start">
            <div className="pl-1">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                Live Opportunity Preview
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
