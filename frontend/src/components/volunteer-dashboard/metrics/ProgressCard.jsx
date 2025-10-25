import React from "react";
import { TrendingUp, Star, Target } from "lucide-react";

export default function ProgressCard({ progress, loading }) {
  const current = progress?.current ?? 0;
  const target = progress?.target ?? 1;
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
        <TrendingUp size={18} className="text-green-600" />
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                {progress?.levelLabel || "Level"} Progress
              </p>
              <p className="text-sm font-semibold text-green-600">{pct}%</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: `${pct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{current} points</span>
              <span>{target} points</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <div className="w-10 h-10 mx-auto rounded-full bg-white border border-indigo-200 grid place-items-center text-indigo-600 font-bold text-sm mb-1">
                #{progress?.rank ?? "-"}
              </div>
              <p className="text-xs font-medium text-gray-700">Global Rank</p>
            </div>
            
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
              <div className="w-10 h-10 mx-auto rounded-full bg-white border border-amber-200 grid place-items-center text-amber-600 font-bold text-sm mb-1">
                <Star size={16} />
              </div>
              <p className="text-xs font-medium text-gray-700">Level {progress?.level ?? "-"}</p>
            </div>
            
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="w-10 h-10 mx-auto rounded-full bg-white border border-emerald-200 grid place-items-center text-emerald-600 font-bold text-sm mb-1">
                {progress?.totalBadges ?? 0}
              </div>
              <p className="text-xs font-medium text-gray-700">Badges</p>
            </div>
          </div>

          {/* Next Milestone */}
          {progress?.nextMilestone && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-blue-600" />
                <p className="text-xs font-medium text-blue-800">Next: {progress.nextMilestone}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}