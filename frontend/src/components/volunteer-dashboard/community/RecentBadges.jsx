import React from "react";

export default function RecentBadges({ badges = [], loading }) {
  // Ensure badges is always an array (safe fallback)
  const safeBadges = Array.isArray(badges)
    ? badges
    : badges?.badges || [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Recent Badges
      </h3>

      {loading ? (
        <div className="h-20 bg-gray-100 rounded animate-pulse" />
      ) : safeBadges.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No badges yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {safeBadges.map((b, idx) => (
            <div
              key={b._id || b.name || idx}
              className="rounded-lg border border-gray-200 p-3 text-center hover:bg-gray-50 transition"
            >
              {/* Show badge icon or fallback emoji */}
              <div className="text-2xl mb-1">{b.icon || "🏅"}</div>
              <p className="text-xs font-medium text-gray-700 mt-1 truncate">
                {b.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
