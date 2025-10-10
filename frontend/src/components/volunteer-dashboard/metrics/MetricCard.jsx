import React from "react";
import { Clock, Medal, TrendingUp } from "lucide-react";

const icons = {
  trending: <TrendingUp size={20} />,
  timer: <Clock size={20} />,
  badge: <Medal size={20} />,
};

export default function MetricCard({ title, value, icon, loading }) {
  // 🎨 Tailwind-based gradient mapping
  const getGradient = () => {
    const key = (title || icon || "").toLowerCase();

    if (key.includes("point") || key.includes("trending"))
      return "from-blue-500 via-sky-500 to-blue-400";
    if (key.includes("hour") || key.includes("time"))
      return "from-green-500 via-emerald-500 to-lime-400";
    if (key.includes("badge") || key.includes("award"))
      return "from-orange-500 via-amber-500 to-yellow-400";
    return "from-blue-500 via-orange-400 to-green-500"; // fallback
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-md p-5 flex items-start gap-4 text-white bg-gradient-to-br ${getGradient()} transition-transform hover:scale-[1.02] duration-300`}
    >
      {/* Overlay for subtle depth */}
      <div className="absolute inset-0 bg-black/10 rounded-xl"></div>

      {/* ICON */}
      <div className="relative h-10 w-10 grid place-items-center rounded-lg bg-white/20 text-white">
        {icons[icon]}
      </div>

      {/* TEXT */}
      <div className="relative">
        <p className="text-sm text-white/90">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-white/30 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-white">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}
