import React from "react";

export default function RecentBadges({ badges = [], loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Badges</h3>
      {loading ? (
        <div className="h-20 bg-gray-100 rounded animate-pulse" />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <div key={b.id} className="rounded-lg border p-3 text-center">
              <div className="text-2xl">🏅</div>
              <p className="text-xs text-gray-700 mt-1">{b.name}</p>
            </div>
          ))}
          {badges.length === 0 && (
            <p className="text-sm text-gray-500">No badges yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
