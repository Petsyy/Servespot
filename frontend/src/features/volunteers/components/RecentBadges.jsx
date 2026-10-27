import React from "react";

export default function RecentBadges({ badges = [], loading }) {
  // Ensure badges is always an array (safe fallback)
  const safeBadges = Array.isArray(badges)
    ? badges
    : badges?.badges || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Badges</h3>
        {safeBadges.length > 0 && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            {safeBadges.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full h-16 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : safeBadges.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2 text-gray-300">🏅</div>
          <p className="text-sm text-gray-500 font-medium">No badges yet</p>
          <p className="text-xs text-gray-400 mt-1">Complete tasks to earn badges</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {safeBadges.slice(0, 3).map((b, idx) => (
            <div
              key={b._id || b.name || idx}
              className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                {b.icon || "🏅"}
              </div>
              <p className="text-xs font-medium text-gray-700 text-center line-clamp-2 leading-tight">
                {b.name}
              </p>
              {b.earnedAt && (
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(b.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}