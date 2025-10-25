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
      case 'success': return <CheckCircle size={18} className="text-green-500" />;
      case 'warning': return <AlertCircle size={18} className="text-amber-500" />;
      case 'error': return <AlertCircle size={18} className="text-red-500" />;
      default: return <Info size={18} className="text-green-500" />; // Changed to green
    }
  };

  const displayItems = items.slice(0, maxItems);
  const unreadCount = items.filter(n => !n.isRead).length;

  return (
    <div className="bg-white rounded-xl border border-green-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-green-600" /> 
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              {unreadCount} new
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-sm text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-all font-medium"
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
              <div className="w-10 h-10 bg-green-100 rounded-full mt-0.5"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-green-100 rounded w-3/4"></div>
                <div className="h-3 bg-green-100 rounded w-full"></div>
                <div className="h-2 bg-green-100 rounded w-1/2"></div>
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
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                    n.isRead 
                      ? "bg-white border-green-100 hover:border-green-300 hover:bg-green-50" 
                      : "bg-green-50 border-green-300 hover:border-green-400 hover:bg-green-100"
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    n.isRead 
                      ? "bg-green-100 text-green-600" 
                      : "bg-green-200 text-green-700"
                  }`}>
                    {getNotificationIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className={`text-sm font-semibold ${
                        n.isRead ? "text-gray-700" : "text-green-900"
                      }`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-1 shadow-sm"></div>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      n.isRead ? "text-gray-600" : "text-gray-700"
                    }`}>
                      {n.message}
                    </p>
                    <p className={`text-xs mt-2 ${
                      n.isRead ? "text-gray-400" : "text-green-600 font-medium"
                    }`}>
                      {n.createdAt
                        ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                        : "Just now"}
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell size={24} className="text-green-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">You're all caught up</p>
              <p className="text-xs text-gray-400 mt-1">No new notifications</p>
            </div>
          )}

          {/* View All Footer */}
          {items.length > maxItems && (
            <div className="pt-4 border-t border-green-100">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing {displayItems.length} of {items.length}
                </p>
                <button 
                  onClick={() => window.location.href = '/volunteer/notifications'}
                  className="flex items-center gap-2 text-xs text-green-600 hover:text-green-700 font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-all border border-green-200 hover:border-green-300 shadow-sm"
                >
                  View All <ExternalLink size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}