import React from "react";

export default function StatCard({ icon, title, value, delta, color = "blue" }) {
  // 🎨 Define gradient themes per color
  const getGradient = (color) => {
    switch (color) {
      case "green":
        return "linear-gradient(135deg, #22c55e, #86efac)";
      case "blue":
        return "linear-gradient(135deg, #3b82f6, #60a5fa)";
      case "purple":
        return "linear-gradient(135deg, #6366f1, #a5b4fc)";
      case "orange":
        return "linear-gradient(135deg, #f97316, #fb923c)";
      default:
        return "linear-gradient(135deg, #3b82f6, #60a5fa)";
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
