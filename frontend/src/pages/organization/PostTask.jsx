import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOpportunity } from "@/services/api";
import PreviewCard from "@/components/post/PreviewCard";
import SkillCheckbox from "@/components/post/SkillCheckbox";
import ImageDropzone from "@/components/post/ImageDropzone";
import { toast } from "react-toastify";

const skillsOptions = [
  "Tutoring",
  "Packing",
  "Graphic Design",
  "Writing",
  "Photography",
  "Event Planning",
  "Marketing",
  "Fundraising",
  "Mentoring",
  "Translation",
  "Web Development",
  "Social Media",
];

export default function PostTask() {
  const navigate = useNavigate();
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
      await createOpportunity(form);
      navigate("/organization/dashboard");
    } catch (err) {
      console.error("Failed to post opportunity", err);
      toast.error("Failed to post opportunity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold text-gray-900">Post New Opportunity</h1>
      <p className="text-gray-600 mb-6">
        Create a volunteer opportunity for your organization
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-5 space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opportunity Title
            </label>
            <input
              type="text"
              placeholder="e.g., Food Bank Volunteer"
              className="w-full border border-gray-300 rounded-lg p-2"
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
              placeholder="Describe the volunteer opportunity, tasks, and requirements..."
              className="w-full border border-gray-300 rounded-lg p-2"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>

          {/* Date (Removed time) */}
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

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              type="text"
              placeholder="e.g., 2 hours"
              className="w-full border border-gray-300 rounded-lg p-2"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </div>

          {/* Location (Removed Online toggle; simple input) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g., 123 Main St, City"
              className="w-full border border-gray-300 rounded-lg p-2"
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
              placeholder="e.g., 5"
              className="w-full border border-gray-300 rounded-lg p-2"
              value={form.volunteersNeeded || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  volunteersNeeded: e.target.value
                    ? parseInt(e.target.value, 10)
                    : "",
                })
              }
              required
            />
          </div>

          {/* File Upload with preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Poster/Files
            </label>
            <ImageDropzone onFile={(file) => setForm({ ...form, file })} />
            {form.file && (
              <p className="text-sm text-gray-600 truncate">
                Selected: {form.file.name}
              </p>
            )}
          </div>

          {/* Actions (Removed Save Draft) */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md font-medium disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Posting..." : "Post Opportunity"}
            </button>
          </div>
        </form>

        {/* RIGHT: PREVIEW */}
        <div className="space-y-3 sticky top-6 h-fit">
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
  );
}
