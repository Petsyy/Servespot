import React from "react";
import { Bell, CheckCircle, AlertCircle, Info, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function Notifications({
  items = [],
  loading,
  onMarkAllRead,
  onMarkRead,
  maxItems = 3,
}) {
  const navigate = useNavigate();

  const handleMarkAll = () => {
    if (onMarkAllRead) onMarkAllRead();
  };

  const handleMarkRead = (notificationId) => {
    if (onMarkRead) onMarkRead(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "success":
        return <CheckCircle size={16} className="text-emerald-600" />;
      case "warning":
        return <AlertCircle size={16} className="text-amber-500" />;
      case "error":
        return <AlertCircle size={16} className="text-rose-500" />;
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
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center border border-emerald-100">
            <Bell size={16} />
          </div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {unreadCount} new
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer"
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
              <div className="w-8 h-8 bg-gray-100 rounded-xl" />
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
        <div className="space-y-3">
          {displayItems.length > 0 ? (
            <>
              {displayItems.map((n, i) => (
                <div
                  key={n._id || i}
                  onClick={() => handleMarkRead(n._id)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                    n.isRead
                      ? "bg-white border-gray-100 hover:border-gray-200"
                      : "bg-emerald-50/50 border-emerald-200/60 hover:border-emerald-300"
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 p-1.5 rounded-lg bg-white border border-gray-100 shadow-xs mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          n.isRead ? "text-gray-800" : "text-emerald-950 font-bold"
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {n.createdAt
                        ? formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                          })
                        : "Just now"}
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-emerald-600">
                <Bell size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                You're all caught up
              </p>
              <p className="text-xs text-gray-400 mt-0.5">No new notifications</p>
            </div>
          )}

          {/* View All Footer */}
          {items.length > maxItems && (
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing {displayItems.length} of {items.length}
              </p>
              <button
                onClick={() => navigate("/volunteer/notifications")}
                className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors cursor-pointer"
              >
                <span>View all</span>
                <ExternalLink size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
