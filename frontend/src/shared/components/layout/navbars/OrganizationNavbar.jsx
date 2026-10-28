import React from "react";
import {
  Bell,
  UserCircle,
  ChevronDown,
  LogOut,
  Menu,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { useOrganizationNavbar } from "@/features/organizations/hooks/useOrganizationNavbar";

export default function OrganizationNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    organizationName,
    organizationEmail,
    initials,
    notifications,
    unreadCount,
    openNotif,
    setOpenNotif,
    openProfile,
    setOpenProfile,
    markAllRead,
    handleLogout,
  } = useOrganizationNavbar();

  const notifRef = useClickOutside(() => setOpenNotif(false));
  const profileRef = useClickOutside(() => setOpenProfile(false));

  const getBreadcrumbTitle = (pathname) => {
    if (pathname.includes("/organization/dashboard")) return "Dashboard";
    if (pathname.includes("/organization/opportunities")) return "Posted Opportunities";
    if (pathname.includes("/organization/reports")) return "Reports & Analytics";
    if (pathname.includes("/organization/notifications")) return "Notifications";
    if (pathname.includes("/organization/profile")) return "Organization Profile";
    return "Workspace";
  };

  const profileMenuItems = [
    {
      icon: UserCircle,
      label: "Organization Profile",
      onClick: () => navigate("/organization/profile"),
    },
    {
      icon: LogOut,
      label: "Sign Out",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 border-b border-gray-200/80">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile Toggle & Desktop Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span>Organization Workspace</span>
            <span className="text-gray-300 font-normal">/</span>
            <span className="text-gray-900 font-bold tracking-tight">
              {getBreadcrumbTitle(location.pathname)}
            </span>
          </div>

          <span className="sm:hidden text-sm font-bold text-gray-900">
            {getBreadcrumbTitle(location.pathname)}
          </span>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 grid place-items-center font-bold shadow-xs">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-gray-200/80 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3.5 border-b border-gray-100 bg-slate-50/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Notifications
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {unreadCount > 0
                          ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                          : "All notifications caught up"}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                {notifications && notifications.length > 0 ? (
                  <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {notifications.slice(0, 5).map((n) => (
                      <li
                        key={n._id}
                        onClick={() => {
                          setOpenNotif(false);
                          if (n.link) navigate(n.link);
                        }}
                        className={`px-4 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !n.isRead ? "bg-emerald-50/40" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl grid place-items-center shrink-0 mt-0.5 border ${
                            !n.isRead
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          <Bell size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-gray-900 font-semibold text-xs truncate">
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <div className="w-2 h-2 bg-emerald-600 rounded-full shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium mt-1">
                            {new Date(n.createdAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Bell className="mx-auto mb-2 text-gray-300 w-8 h-8" />
                    <p className="text-xs font-semibold text-gray-700">No new notifications</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">You're up to date.</p>
                  </div>
                )}

                <div className="border-t border-gray-100 bg-gray-50/50 p-2 text-center">
                  <button
                    onClick={() => {
                      setOpenNotif(false);
                      navigate("/organization/notifications");
                    }}
                    className="w-full py-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors cursor-pointer"
                  >
                    View all notifications &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpenProfile((v) => !v)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-gray-100 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white text-xs font-extrabold grid place-items-center shadow-xs border border-emerald-850/20">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[140px]">
                  {organizationName}
                </p>
                <p className="text-[11px] text-gray-500 leading-tight">Partner Organization</p>
              </div>
              <ChevronDown
                size={15}
                className={`text-gray-400 transition-transform duration-200 ${
                  openProfile ? "rotate-180" : ""
                }`}
              />
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200/80 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3.5 border-b border-gray-100 bg-slate-50/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white text-sm font-extrabold grid place-items-center shadow-xs border border-emerald-850/20">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {organizationName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {organizationEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.onClick();
                        setOpenProfile(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        item.danger
                          ? "text-rose-600 hover:bg-rose-50"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon
                        size={16}
                        className={item.danger ? "text-rose-500" : "text-gray-400"}
                      />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                  <span className="text-[11px] text-gray-400 font-medium">ServeSpot Verified Organization</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
