import React from "react";

export default function StatCard({ icon, title, value, delta, color = "green" }) {
  //  Define gradient themes per color
  const getGradient = (color) => {
    switch (color) {
      case "green":
        return "linear-gradient(135deg, #22c55e, #16a34a)";
      case "emerald":
        return "linear-gradient(135deg, #10b981, #059669)";
      case "teal":
        return "linear-gradient(135deg, #14b8a6, #0d9488)";
      case "lime":
        return "linear-gradient(135deg, #84cc16, #65a30d)";
      default:
        return "linear-gradient(135deg, #22c55e, #16a34a)";
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl shadow-md p-5 flex items-start gap-4 text-white transition-transform hover:scale-[1.02] duration-300"
      style={{
        background: getGradient(color),
      }}
    >
      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-black/10 rounded-xl"></div>

      {/* ICON */}
      <div className="relative h-10 w-10 grid place-items-center rounded-lg bg-white/20 text-white">
        {icon}
      </div>

      {/* TEXT */}
      <div className="relative">
        <p className="text-sm text-white/90">{title}</p>
        <p className="text-2xl font-bold text-white">{value || 0}</p>
        {delta && <p className="text-xs text-green-200 mt-1">{delta}</p>}
      </div>
    </div>
  );
}