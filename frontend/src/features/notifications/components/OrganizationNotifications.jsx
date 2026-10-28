import React from "react";
import { Bell, CheckCircle2, AlertCircle, Info, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Notifications({
  items = [],
  loading,
  onMarkAllRead,
  onMarkRead,
  maxItems = 3,
}) {
  const handleMarkAll = () => {
    if (onMarkAllRead) onMarkAllRead();
  };

  const handleMarkRead = (notificationId) => {
    if (onMarkRead) onMarkRead(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "success":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "warning":
        return <AlertCircle size={16} className="text-amber-600" />;
      case "error":
        return <AlertCircle size={16} className="text-rose-600" />;
      default:
        return <Info size={16} className="text-emerald-600" />;
    }
  };

  const displayItems = items.slice(0, maxItems);
  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Bell size={18} className="text-emerald-700" />
            <span>Notifications</span>
          </h3>
          {unreadCount > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {items.length > 0 && unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-1 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-100 rounded-xl mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="space-y-2.5">
          {displayItems.length > 0 ? (
            <>
              {displayItems.map((n, i) => (
                <div
                  key={n._id || i}
                  onClick={() => handleMarkRead(n._id)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !n.isRead
                      ? "bg-emerald-50/40 border-emerald-200/80 shadow-xs"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`shrink-0 p-2 rounded-xl border ${
                      !n.isRead
                        ? "bg-emerald-100/70 border-emerald-200 text-emerald-700"
                        : "bg-gray-100 border-gray-200 text-gray-500"
                    }`}
                  >
                    {getNotificationIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <div className="w-2 h-2 bg-emerald-600 rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mt-1.5">
                      <span>
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {n.link && (
                        <span className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold">
                          View details <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-2 text-gray-400">
                <Bell size={18} />
              </div>
              <p className="text-xs font-bold text-gray-800">You're all caught up</p>
              <p className="text-[11px] text-gray-400 mt-0.5">No unread notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
