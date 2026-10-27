import React from "react";
import { TrendingUp, Timer, Award } from "lucide-react";

export default function MetricCard({ title, value, gradient, icon, loading = false }) {
  // 🎨 Define gradient classes
  const getGradientClass = (gradient) => {
    switch (gradient) {
      case "from-green-500 to-emerald-500":
        return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "from-green-400 to-teal-400":
        return "bg-gradient-to-r from-green-400 to-teal-400";
      case "from-amber-400 to-orange-400":
        return "bg-gradient-to-r from-amber-400 to-orange-400";
      case "from-emerald-500 to-green-600":
        return "bg-gradient-to-r from-emerald-500 to-green-600";
      case "from-green-500 to-emerald-600":
        return "bg-gradient-to-r from-green-500 to-emerald-600";
      default:
        return "bg-gradient-to-r from-green-500 to-emerald-500";
    }
  };

  // 🎨 Get icon component
  const getIcon = (iconName) => {
    switch (iconName) {
      case "trending":
        return <TrendingUp size={20} className="text-white" />;
      case "timer":
        return <Timer size={20} className="text-white" />;
      case "badge":
        return <Award size={20} className="text-white" />;
      default:
        return <TrendingUp size={20} className="text-white" />;
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-md p-5 flex items-start gap-4 text-white transition-transform hover:scale-[1.02] duration-300 ${getGradientClass(gradient)}`}
    >
      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-black/10 rounded-xl"></div>

      {/* ICON */}
      <div className="relative h-10 w-10 grid place-items-center rounded-lg bg-white/20 text-white">
        {getIcon(icon)}
      </div>

      {/* TEXT */}
      <div className="relative">
        <p className="text-sm text-white/90 font-medium">{title}</p>
        {loading ? (
          <div className="h-6 w-16 bg-white/20 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-white mt-1">{value || 0}</p>
        )}
      </div>
    </div>
  );
}