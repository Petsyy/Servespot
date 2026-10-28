import React from "react";

export default function SkillCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/30 border-gray-300 accent-emerald-600 cursor-pointer"
      />
      <span className="font-medium text-xs text-gray-700">{label}</span>
    </label>
  );
}
