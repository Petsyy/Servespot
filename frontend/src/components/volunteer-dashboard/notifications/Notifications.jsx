import React from "react";
import { Bell, CheckCircle, AlertCircle, Info, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Notifications({ items = [], loading, onMarkAllRead, onMarkRead, maxItems = 3 }) {
  const handleMarkAll = () => {
    if (onMarkAllRead) onMarkAllRead();
  };

  const handleMarkRead = (notificationId) => {
    if (onMarkRead) onMarkRead(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      case 'warning': return <AlertCircle size={16} className="text-amber-500" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const displayItems = items.slice(0, maxItems);
  const unreadCount = items.filter(n => !n.isRead).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell size={18} className="text-green-600" /> 
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-sm text-gray-500 hover:text-green-600 transition font-medium"
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
              <div className="w-8 h-8 bg-gray-200 rounded-full mt-0.5"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
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
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer group ${
                    n.isRead 
                      ? "bg-white border-gray-200 hover:border-green-300" 
                      : "bg-green-50 border-green-200 hover:border-green-400"
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 mt-0.5 ${
                    n.isRead ? "text-gray-400" : "text-green-500"
                  }`}>
                    {getNotificationIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${
                        n.isRead ? "text-gray-700" : "text-gray-900"
                      }`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {n.createdAt
                        ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                        : "Just now"}
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-6">
              <Bell size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">You're all caught up</p>
              <p className="text-xs text-gray-400 mt-1">No new notifications</p>
            </div>
          )}

          {/* View All Footer */}
          {items.length > maxItems && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing {displayItems.length} of {items.length}
                </p>
                <button 
                  onClick={() => window.location.href = '/volunteer/notifications'}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors border border-green-200 hover:border-green-300"
                >
                  View All <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}