import React from "react";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // ✅ for "x minutes ago"

export default function Notifications({ items = [], loading, onMarkAllRead, onMarkRead, maxItems = 3 }) {
  const handleMarkAll = () => {
    if (onMarkAllRead) onMarkAllRead();
  };

  const handleMarkRead = (notificationId) => {
    if (onMarkRead) onMarkRead(notificationId);
  };

  // Limit items to prevent scrolling issues
  const displayItems = items.slice(0, maxItems);
  
  // Debug: Log notification count (remove in production)
  // console.log(`🔔 Notifications Component:`, {
  //   totalItems: items.length,
  //   displayItems: displayItems.length,
  //   maxItems: maxItems,
  //   items: items.map(n => ({ id: n._id, title: n.title }))
  // });

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" /> Notifications
          </h3>
          {items.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {items.length}
            </span>
          )}
        </div>
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
        <div>
          <ul className="space-y-3">
            {displayItems.length > 0 ? (
              displayItems.map((n, i) => (
                <li
                  key={n._id || i}
                  onClick={() => handleMarkRead(n._id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition cursor-pointer hover:shadow-sm ${
                    n.isRead ? "bg-white" : "bg-orange-50 border-orange-100"
                  }`}
                >
                  {/* Icon */}
                  <div className="mt-0.5 h-8 w-8 grid place-items-center rounded-full bg-blue-50 text-blue-600">
                    <Bell size={16} />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-800 font-medium">{n.title}</p>
                      {!n.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
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
                You're all caught up.
              </p>
            )}
          </ul>
          
          {/* Show more indicator if there are more items */}
          {items.length > maxItems && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing {displayItems.length} of {items.length} notifications
                </p>
                <button 
                  onClick={() => {
                    // Navigate to full notifications page or expand view
                    window.location.href = '/volunteer/notifications';
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors border border-blue-200 hover:border-blue-300"
                >
                  View All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
