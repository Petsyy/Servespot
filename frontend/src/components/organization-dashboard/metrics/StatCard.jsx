import React from "react";

export default function StatCard({ icon, title, value, delta }) {
  // 🎨 Define gradient themes per title
  const getGradient = (title) => {
    const t = title.toLowerCase();
    if (t.includes("active")) return "linear-gradient(135deg, #3b82f6, #60a5fa)"; // blue
    if (t.includes("volunteer")) return "linear-gradient(135deg, #f97316, #fb923c)"; // orange
    if (t.includes("hours")) return "linear-gradient(135deg, #22c55e, #86efac)"; // green
    if (t.includes("completed")) return "linear-gradient(135deg, #6366f1, #a5b4fc)"; // indigo
    return "linear-gradient(135deg, #3b82f6, #f97316, #22c55e)"; // fallback
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl shadow-md p-5 flex items-start gap-4 text-white transition-transform hover:scale-[1.02] duration-300"
      style={{
        background: getGradient(title),
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
        <p className="text-2xl font-bold text-white">{value}</p>
        {delta && <p className="text-xs text-green-200 mt-1">{delta}</p>}
      </div>
    </div>
  );
}
