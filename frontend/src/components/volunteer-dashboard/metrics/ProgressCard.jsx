import React from "react";

export default function ProgressCard({ progress, loading }) {
  const current = progress?.current ?? 0;
  const target = progress?.target ?? 1;
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Progress</h3>
      {loading ? (
        <div className="h-20 bg-gray-100 rounded animate-pulse" />
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-2">
            {progress?.levelLabel || "Level"} Progress
          </p>
          <div className="h-3 w-full bg-gray-100 rounded">
            <div className="h-3 rounded bg-blue-600" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {current} / {target}
          </p>
          {/* little stat bubbles like screenshot */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 grid place-items-center text-indigo-600 font-semibold">
                #{progress?.rank ?? 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Global Rank</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 grid place-items-center text-amber-600 font-semibold">
                {progress?.level ?? "-"}
              </div>
              <p className="text-xs text-gray-500 mt-1">Current Level</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 grid place-items-center text-emerald-600 font-semibold">
                {progress?.totalBadges ?? 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total Badges</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
