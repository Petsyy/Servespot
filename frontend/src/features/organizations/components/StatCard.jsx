import React from "react";

export default function StatCard({ icon, title, value, delta, color = "green" }) {
  const getTheme = (color) => {
    switch (color) {
      case "green":
        return {
          iconBox: "bg-emerald-50 border-emerald-100 text-emerald-700",
        };
      case "emerald":
        return {
          iconBox: "bg-sky-50 border-sky-100 text-sky-700",
        };
      case "teal":
        return {
          iconBox: "bg-amber-50 border-amber-100 text-amber-700",
        };
      case "lime":
        return {
          iconBox: "bg-indigo-50 border-indigo-100 text-indigo-700",
        };
      default:
        return {
          iconBox: "bg-emerald-50 border-emerald-100 text-emerald-700",
        };
    }
  };

  const theme = getTheme(color);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">
          {value || 0}
        </p>
        {delta && (
          <p className="text-xs font-semibold text-emerald-600 mt-1">
            {delta}
          </p>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs ${theme.iconBox}`}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon, {
              className: "w-5 h-5",
            })
          : icon}
      </div>
    </div>
  );
}
