import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { createOpportunity } from "@/services/api";
import PreviewCard from "@/components/organization-dashboard/post/PreviewCard";
import SkillCheckbox from "@/components/organization-dashboard/post/SkillCheckbox";
import ImageDropzone from "@/components/organization-dashboard/post/ImageDropzone";

const skillsOptions = [
  "Tutoring", "Public Speaking", "Graphic Design", "Elderly Care", "Photography",
  "Event Planning", "Marketing", "Fundraising", "Communication Skills",
  "Customer Service", "Web Development", "Social Media",
];

export default function PostOpportunityModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "", description: "", date: "", duration: "",
    location: "", skills: [], volunteersNeeded: 1, file: null,
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
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("date", form.date);
      formData.append("duration", form.duration);
      formData.append("location", form.location);
      formData.append("volunteersNeeded", form.volunteersNeeded);
      formData.append("organization", orgId);
      form.skills.forEach((skill) => formData.append("skills[]", skill));
      if (form.file) formData.append("file", form.file);

      await createOpportunity(formData);
      onSuccess?.();
    } catch (err) {
      console.error("❌ Failed to post opportunity:", err);
      toast.error(err.response?.data?.message || "Failed to post opportunity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Post New Opportunity</h2>
        <p className="text-gray-600 mb-4">
          Fill out the details below to create a new volunteer opportunity.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opportunity Title
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="e.g., Beach Cleanup Volunteer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Describe the volunteer opportunity..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-2"
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
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="e.g., 123 Main St"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Volunteers Needed
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={form.volunteersNeeded}
                onChange={(e) =>
                  setForm({ ...form, volunteersNeeded: parseInt(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Poster / Image
              </label>
              <ImageDropzone onFile={(file) => setForm({ ...form, file })} />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md font-medium disabled:opacity-60"
              >
                {submitting ? "Posting..." : "Post Opportunity"}
              </button>
            </div>
          </form>

          {/* RIGHT PREVIEW */}
          <div className="space-y-3 sticky top-0">
            <h3 className="text-sm font-medium text-gray-700">Preview</h3>
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
  );
}
