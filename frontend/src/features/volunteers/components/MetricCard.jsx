import React from "react";
import { TrendingUp, Timer, Award } from "lucide-react";

export default function MetricCard({
  title,
  value,
  icon,
  accent = "emerald",
  subtext,
  loading = false,
}) {
  const getTheme = () => {
    switch (accent) {
      case "amber":
        return {
          iconBox: "bg-amber-50 text-amber-600 border-amber-200/80",
          ring: "hover:border-amber-300",
        };
      case "sky":
        return {
          iconBox: "bg-sky-50 text-sky-600 border-sky-100",
          ring: "hover:border-sky-300",
        };
      case "emerald":
      default:
        return {
          iconBox: "bg-emerald-50 text-emerald-600 border-emerald-100",
          ring: "hover:border-emerald-300",
        };
    }
  };

  const getIcon = () => {
    switch (icon) {
      case "trending":
        return <TrendingUp size={20} />;
      case "timer":
        return <Timer size={20} />;
      case "badge":
        return <Award size={20} />;
      default:
        return <TrendingUp size={20} />;
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs transition-all duration-150 flex flex-col justify-between ${theme.ring}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        <div
          className={`h-10 w-10 grid place-items-center rounded-xl border ${theme.iconBox}`}
        >
          {getIcon()}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse mt-1" />
        ) : (
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {value ?? 0}
          </p>
        )}
        {subtext && (
          <p className="text-xs font-medium text-gray-500 mt-1">{subtext}</p>
        )}
      </div>
    </div>
  );
}
