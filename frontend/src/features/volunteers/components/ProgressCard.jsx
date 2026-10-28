import React from "react";
import { TrendingUp, Star, Target } from "lucide-react";

export default function ProgressCard({ progress, loading }) {
  const current = progress?.current ?? 0;
  const target = progress?.target ?? 1;
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">
          Your Progress
        </h3>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center border border-emerald-100">
          <TrendingUp size={16} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-10 h-10 bg-gray-100 rounded-xl mx-auto mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {progress?.levelLabel || "Level 1"} Progress
              </p>
              <p className="text-sm font-bold text-emerald-700">{pct}%</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-emerald-600 transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1.5 font-medium">
              <span>{current} points</span>
              <span>{target} points</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-200/80">
              <div className="w-8 h-8 mx-auto rounded-lg bg-white border border-gray-200 grid place-items-center text-slate-800 font-bold text-xs mb-1 shadow-xs">
                #{progress?.rank ?? "-"}
              </div>
              <p className="text-[11px] font-medium text-gray-500">Rank</p>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <div className="w-8 h-8 mx-auto rounded-lg bg-white border border-amber-200 grid place-items-center text-amber-600 font-bold text-xs mb-1 shadow-xs">
                <Star size={14} />
              </div>
              <p className="text-[11px] font-medium text-amber-900">
                Level {progress?.level ?? 1}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="w-8 h-8 mx-auto rounded-lg bg-white border border-emerald-200 grid place-items-center text-emerald-700 font-bold text-xs mb-1 shadow-xs">
                {progress?.totalBadges ?? 0}
              </div>
              <p className="text-[11px] font-medium text-emerald-900">Badges</p>
            </div>
          </div>

          {/* Next Milestone */}
          {progress?.nextMilestone && (
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-emerald-700 flex-shrink-0" />
                <p className="text-xs font-semibold text-emerald-900">
                  Next: {progress.nextMilestone}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
