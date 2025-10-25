import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { createOpportunity } from "@/services/organization.api";
import PreviewCard from "@/components/organization-dashboard/post/PreviewCard";
import SkillCheckbox from "@/components/organization-dashboard/post/SkillCheckbox";
import ImageDropzone from "@/components/organization-dashboard/post/ImageDropzone";

const skillsOptions = [
  "Tutoring",
  "Public Speaking",
  "Graphic Design",
  "Elderly Care",
  "Photography",
  "Event Planning",
  "Gardening",
  "Fundraising",
  "Communication Skills",
  "Customer Service",
  "Web Development",
  "Social Media",
];

export default function PostOpportunityModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    duration: "",
    location: "",
    skills: [],
    volunteersNeeded: 1,
    file: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const imagePreview = useMemo(
    () =>
      form.file && form.file.type.startsWith("image/")
        ? URL.createObjectURL(form.file)
        : null,
    [form.file]
  );

  const handleCheckboxChange = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orgId = localStorage.getItem("orgId");
      if (!orgId) {
        toast.error("Organization not found. Please log in again.");
        return;
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "skills")
          value.forEach((s) => formData.append("skills[]", s));
        else if (key === "file" && value) formData.append("file", value);
        else formData.append(key, value);
      });
      formData.append("organization", orgId);

      const res = await createOpportunity(formData);
      if (res?.data) {
        // Pass the created opportunity back to parent
        onSuccess?.(res.data.opportunity);
      }
    } catch (err) {
      console.error("❌ Failed to post opportunity:", err);
      toast.error(err.response?.data?.message || "Failed to post opportunity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl p-8 relative overflow-y-auto max-h-[90vh] border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
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
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opportunity Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g., Beach Cleanup Volunteer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Describe the volunteer opportunity..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>

            {/* Date / Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g., 4 hours"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g., Community Center, Manila"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>

            {/* Skills */}
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {skillsOptions.map((skill) => (
                  <SkillCheckbox
                    key={skill}
                    label={skill}
                    checked={form.skills.includes(skill)}
                    onChange={() => handleCheckboxChange(skill)}
                  />
                ))}
              </div>
            </div>

            {/* Volunteers Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Volunteers Needed
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                value={form.volunteersNeeded}
                onChange={(e) => {
                  const value = e.target.value;
                  // Handle empty or invalid input
                  if (value === "" || isNaN(parseInt(value))) {
                    setForm({ ...form, volunteersNeeded: 1 }); // Default to 1
                  } else {
                    setForm({
                      ...form,
                      volunteersNeeded: parseInt(value) || 1, // Fallback to 1 if NaN
                    });
                  }
                }}
                onBlur={(e) => {
                  // Ensure minimum value on blur
                  if (!form.volunteersNeeded || form.volunteersNeeded < 1) {
                    setForm({ ...form, volunteersNeeded: 1 });
                  }
                }}
              />
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Poster / Image
              </label>
              <ImageDropzone onFile={(file) => setForm({ ...form, file })} />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "Posting..." : "Post Opportunity"}
              </button>
            </div>
          </form>

          <div className="sticky top-0 self-start">
            <div className="pl-1">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Live Preview
              </h3>
              <div className="flex justify-start">
                <PreviewCard
                  title={form.title}
                  description={form.description}
                  location={form.location}
                  date={form.date}
                  duration={form.duration}
                  volunteersNeeded={form.volunteersNeeded}
                  skills={form.skills}
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