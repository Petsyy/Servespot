import React from "react";

export default function CheckboxGroup({ label, options, selected, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((opt, i) => (
          <label key={i} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onChange(opt)}
              className="text-green-600 focus:ring-green-500 rounded"
            />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}