import React from "react";
import { Clock, Medal, TrendingUp } from "lucide-react";

const icons = {
  trending: <TrendingUp size={18} />,
  timer: <Clock size={18} />,
  badge: <Medal size={18} />,
};

export default function MetricCard({ title, value, gradient, icon, loading }) {
  return (
    <div className={`rounded-xl p-5 shadow-sm bg-gradient-to-r ${gradient} text-white`}>
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-90">{title}</p>
        <div className="h-9 w-9 grid place-items-center rounded-full bg-white/20">
          {icons[icon]}
        </div>
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-8 bg-white/30 rounded animate-pulse" />
        ) : (
          <p className="text-4xl font-bold">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}
