import React from "react";

export default function TopVolunteers({ items = [], loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Volunteers</h3>
      {loading ? (
        <div className="h-24 bg-gray-100 rounded animate-pulse" />
      ) : (
        <ul className="space-y-3">
          {items.map((v, i) => (
            <li key={v.id || i} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 grid place-items-center font-semibold text-blue-600">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{v.name}</p>
                  <p className="text-xs text-gray-500">{v.points} points</p>
                </div>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-gray-500">No leaderboard yet.</p>
          )}
        </ul>
      )}
    </div>
  );
}
