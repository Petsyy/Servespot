import React from "react";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // ✅ for "x minutes ago"

export default function Notifications({ items = [], loading, onMarkAllRead }) {
  const handleMarkAll = () => {
    if (onMarkAllRead) onMarkAllRead();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell size={18} className="text-blue-600" /> Notifications
        </h3>
        <button
          onClick={handleMarkAll}
          className="text-sm text-gray-500 hover:text-blue-600 transition"
        >
          Mark all read
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && <div className="h-24 bg-gray-100 rounded animate-pulse" />}

      {/* Notification List */}
      {!loading && (
        <ul className="space-y-3">
          {items.length > 0 ? (
            items.map((n, i) => (
              <li
                key={n._id || i}
                className={`flex items-start gap-3 p-3 rounded-lg border transition ${
                  n.isRead ? "bg-white" : "bg-orange-50 border-orange-100"
                }`}
              >
                {/* Icon */}
                <div className="mt-0.5 h-8 w-8 grid place-items-center rounded-full bg-blue-50 text-blue-600">
                  <Bell size={16} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-medium">{n.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {n.createdAt
                      ? formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })
                      : "Just now"}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              You’re all caught up.
            </p>
          )}
        </ul>
      )}
    </div>
  );
}
