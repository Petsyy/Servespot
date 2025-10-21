import React from "react";

export default function FormInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  options = [],
  placeholder,
  accept,
}) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {type === "textarea" ? (
        <textarea
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : type === "select" ? (
        <select
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === "file" ? (
        <input
          type="file"
          accept={accept}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => onChange(e.target.files?.[0] || null )} // ✅ Fixed
        />
      ) : (
        <input
          type={type}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
