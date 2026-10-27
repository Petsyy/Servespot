import React, { useState, useEffect } from "react";
import { BadgeInfo, Tags, Clock } from "lucide-react";

function TagInput({ label, icon, value = [], onChange, editable }) {
  const [text, setText] = useState(() => (Array.isArray(value) ? value.join(", ") : ""));

  useEffect(() => {
    setText(Array.isArray(value) ? value.join(", ") : "");
  }, [value]);

  const toArray = (s) =>
    s
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
        {icon}
        <span>{label}</span>
      </label>
      {editable ? (
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(toArray(e.target.value));
          }}
          placeholder="Separate items with commas"
          className="w-full h-9 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm transition"
        />
      ) : (
        <div className="flex flex-wrap gap-1.5 min-h-[36px] items-center">
          {Array.isArray(value) && value.length > 0 ? (
            value.map((t, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-100 font-medium"
              >
                {t}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Not set</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function VolunteerAboutSection({ me, isEditing, onChange }) {
  return (
    <section className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-green-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <BadgeInfo size={16} className="text-green-700" />
        <h3 className="font-semibold text-gray-900 text-sm">About & Preferences</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Bio */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
          {isEditing ? (
            <textarea
              rows={3}
              value={me?.bio || ""}
              onChange={(e) => onChange("bio", e.target.value)}
              className="w-full rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 p-3 text-sm transition"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-gray-800 min-h-[72px] text-sm whitespace-pre-wrap">
              {me?.bio || <span className="text-gray-400">Not set</span>}
            </div>
          )}
        </div>

        {/* Skills */}
        <TagInput
          label="Skills"
          icon={<Tags size={14} className="text-green-600" />}
          value={me?.skills}
          editable={isEditing}
          onChange={(arr) => onChange("skills", arr)}
        />

        {/* Interests */}
        <TagInput
          label="Interests"
          icon={<Tags size={14} className="text-green-600" />}
          value={me?.interests}
          editable={isEditing}
          onChange={(arr) => onChange("interests", arr)}
        />

        {/* Availability */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <Clock size={14} className="text-green-600" />
            <span>Availability</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              value={me?.availability || ""}
              onChange={(e) => onChange("availability", e.target.value)}
              placeholder="e.g. Weekdays / Weekends / Flexible"
              className="w-full h-9 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm transition"
            />
          ) : (
            <div className="w-full h-9 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-sm">
              {me?.availability || <span className="text-gray-400">Not set</span>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

