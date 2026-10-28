import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Shield,
  Clock,
} from "lucide-react";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { useAdminNavbar } from "@/features/admin/hooks/useAdminNavbar";

export default function AdminNavbar({ onToggleSidebar }) {
  const location = useLocation();
  const {
    adminName,
    adminEmail,
    initials,
    notifications,
    loadingNotif,
    computedCount,
    openNotif,
    setOpenNotif,
    openProfile,
    setOpenProfile,
    markAllRead,
    isMarkingRead,
    handleLogout,
  } = useAdminNavbar();

  // Close dropdowns on outside clicks
  const notifRef = useClickOutside(() => setOpenNotif(false));
  const profileRef = useClickOutside(() => setOpenProfile(false));

  const pageTitle = (() => {
    switch (location.pathname) {
      case "/admin/dashboard":
        return "Executive Overview";
      case "/admin/management":
        return "User & Organization Management";
      case "/admin/reports":
        return "Platform Reports & Analytics";
      case "/admin/notifications":
        return "Notification Center";
      default:
        return "Administration";
    }
  })();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-gray-200/80">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-400">Admin Workspace</span>
            <span className="text-gray-300">/</span>
            <span className="font-bold text-gray-800">{pageTitle}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Notification Menu */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-emerald-700 outline-none transition cursor-pointer"
              aria-label="View notifications"
            >
              <Bell size={18} />
              {computedCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] rounded-full min-w-[15px] h-3.5 px-1 grid place-items-center font-bold">
                  {computedCount > 9 ? "9+" : computedCount}
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200/90 rounded-2xl shadow-xl overflow-hidden z-50 animate-scaleIn">
                <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      System Notifications
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {computedCount} unread alert{computedCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  {computedCount > 0 && (
                    <button
                      onClick={markAllRead}
                      disabled={isMarkingRead}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-50 cursor-pointer"
                    >
                      {isMarkingRead ? "Marking..." : "Mark all read"}
                    </button>
                  )}
                </div>

                {loadingNotif ? (
                  <div className="px-4 py-8 text-center text-xs text-gray-500">
                    Loading notifications...
                  </div>
                ) : notifications.length ? (
                  <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {notifications.map((n) => (
                      <li
                        key={n._id}
                        className={`p-3 text-xs flex items-start gap-2.5 transition ${
                          n.isRead ? "bg-white" : "bg-emerald-50/50"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 mt-0.5 ${
                            n.isRead
                              ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          <Bell size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-bold truncate">
                            {n.title}
                          </p>
                          <p className="text-gray-600 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Clock size={10} />
                            <span>{new Date(n.createdAt).toLocaleString()}</span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Bell className="mx-auto mb-2 text-gray-300 w-7 h-7" />
                    <p className="text-xs text-gray-500 font-medium">
                      No notifications yet
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-100 p-2 bg-slate-50/50">
                  <Link
                    to="/admin/notifications"
                    onClick={() => setOpenNotif(false)}
                    className="block text-center py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpenProfile((v) => !v)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 outline-none transition cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold grid place-items-center border border-emerald-800/60 shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {adminName}
                </p>
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider leading-tight">
                  Super Admin
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${
                  openProfile ? "rotate-180" : ""
                }`}
              />
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200/90 rounded-2xl shadow-xl overflow-hidden z-50 animate-scaleIn">
                <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold grid place-items-center border border-emerald-800/60">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {adminName}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {adminEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-1.5">
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpenProfile(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    <LogOut size={14} className="text-rose-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
