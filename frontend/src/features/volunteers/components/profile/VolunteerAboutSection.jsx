import React from "react";
import { BadgeInfo, Tags, Clock, Check } from "lucide-react";
import { OPPORTUNITY_SKILLS } from "@/features/opportunities/constants/opportunitySkills";

const AVAILABILITY_OPTIONS = [
  "Flexible",
  "Weekdays",
  "Weekends",
  "Mornings",
  "Afternoons",
  "Evenings",
];

export default function VolunteerAboutSection({ me, isEditing, onChange }) {
  const currentSkills = Array.isArray(me?.skills) ? me.skills : [];
  const currentAvailability = Array.isArray(me?.availability)
    ? me.availability
    : typeof me?.availability === "string" && me.availability.trim()
    ? me.availability.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const toggleSkill = (skill) => {
    if (currentSkills.includes(skill)) {
      onChange("skills", currentSkills.filter((s) => s !== skill));
    } else {
      onChange("skills", [...currentSkills, skill]);
    }
  };

  const toggleAvailability = (opt) => {
    if (currentAvailability.includes(opt)) {
      onChange("availability", currentAvailability.filter((a) => a !== opt));
    } else {
      onChange("availability", [...currentAvailability, opt]);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200/80 overflow-hidden bg-white shadow-xs">
      <div className="bg-slate-50/80 px-5 py-3.5 border-b border-gray-200/80 flex items-center gap-2">
        <BadgeInfo size={16} className="text-emerald-700" />
        <h3 className="font-bold text-gray-900 text-sm">About & Interests</h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Bio */}
        <div>
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
            About You & Motivations
          </label>
          {isEditing ? (
            <textarea
              rows={3}
              value={me?.bio || ""}
              onChange={(e) => onChange("bio", e.target.value)}
              className="w-full rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 p-3 text-xs transition outline-none"
              placeholder="Tell organizations about your background, values, and why you volunteer..."
            />
          ) : (
            <div className="rounded-xl bg-slate-50/60 border border-gray-200/80 p-3.5 text-gray-800 min-h-[72px] text-xs leading-relaxed whitespace-pre-wrap">
              {me?.bio || <span className="text-gray-400">No bio provided yet.</span>}
            </div>
          )}
        </div>

        {/* Skills & Causes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tags size={13} className="text-emerald-600" />
              <span>Skills & Causes</span>
            </label>
            {isEditing && (
              <span className="text-[11px] text-gray-400">Select skills that fit you</span>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2.5 rounded-xl border border-gray-200 bg-slate-50/40">
              {OPPORTUNITY_SKILLS.map((skill) => {
                const selected = currentSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      selected
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    {selected && <Check size={11} strokeWidth={3} />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 min-h-[40px] items-center p-2.5 rounded-xl bg-slate-50/60 border border-gray-200/80">
              {currentSkills.length > 0 ? (
                currentSkills.map((t, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">No skills selected</span>
              )}
            </div>
          )}
        </div>

        {/* Availability Schedule */}
        <div>
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock size={13} className="text-emerald-600" />
            <span>Availability Window</span>
          </label>

          {isEditing ? (
            <div className="flex flex-wrap gap-1.5">
              {AVAILABILITY_OPTIONS.map((opt) => {
                const isSelected = currentAvailability.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleAvailability(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 min-h-[40px] items-center p-2.5 rounded-xl bg-slate-50/60 border border-gray-200/80">
              {currentAvailability.length > 0 ? (
                currentAvailability.map((opt, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-100 text-slate-700 font-semibold"
                  >
                    {opt}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">Flexible / Not specified</span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
