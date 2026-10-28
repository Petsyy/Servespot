import React from "react";
import {
  Bell,
  UserCircle,
  ChevronDown,
  LogOut,
  Search,
  Menu,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { useVolunteerNavbar } from "@/features/volunteers/hooks/useVolunteerNavbar";

export default function VolunteerNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    volunteerName,
    volunteerEmail,
    initials,
    notifications,
    unreadCount,
    openNotif,
    setOpenNotif,
    openProfile,
    setOpenProfile,
    markAllRead,
    handleLogout,
  } = useVolunteerNavbar();

  const notifRef = useClickOutside(() => setOpenNotif(false));
  const profileRef = useClickOutside(() => setOpenProfile(false));

  const profileMenuItems = [
    {
      icon: UserCircle,
      label: "Profile",
      onClick: () => navigate("/volunteer/profile"),
    },
    {
      icon: LogOut,
      label: "Sign out",
      onClick: handleLogout,
      danger: true,
    },
  ];

  const getPageTitle = () => {
    if (location.pathname.startsWith("/volunteer/opportunities")) {
      return "Opportunity Board";
    }
    if (location.pathname.startsWith("/volunteer/tasks")) {
      return "My Activities";
    }
    if (location.pathname.startsWith("/volunteer/badges")) {
      return "Badges & Milestones";
    }
    if (location.pathname.startsWith("/volunteer/profile")) {
      return "Profile";
    }
    if (location.pathname.startsWith("/volunteer/notifications")) {
      return "Notifications";
    }
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 border-b border-gray-200/80">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Side: Mobile Menu + Contextual Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* On mobile: show brand. On desktop: show clean workspace breadcrumb */}
          <span className="md:hidden text-lg font-bold text-emerald-600 tracking-tight">
            ServeSpot
          </span>
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-900">Volunteer Workspace</span>
            <span className="text-gray-300">/</span>
            <span className="text-emerald-700 font-medium">{getPageTitle()}</span>
          </div>
        </div>

        {/* Right Side: Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-emerald-700 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 grid place-items-center font-bold shadow-xs">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200/90 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-gray-100 bg-emerald-50/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Notifications
                      </p>
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        {unreadCount} unread{" "}
                        {unreadCount === 1 ? "notification" : "notifications"}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-1 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                {notifications && notifications.length ? (
                  <ul className="max-h-72 overflow-auto divide-y divide-gray-100">
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
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center flex-shrink-0 mt-0.5">
                          <Bell size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-gray-900 font-medium truncate text-xs sm:text-sm">
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0 ml-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
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
                    <Bell className="mx-auto mb-2 text-gray-300 w-7 h-7" />
                    <p className="text-xs text-gray-500">No new notifications</p>
                  </div>
                )}

                <div className="border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => {
                      setOpenNotif(false);
                      navigate("/volunteer/notifications");
                    }}
                    className="w-full px-4 py-2.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors text-center cursor-pointer"
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
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-emerald-100 text-xs font-bold grid place-items-center shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {volunteerName}
                </p>
                <p className="text-xs text-emerald-700 font-medium leading-tight">
                  Volunteer
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
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200/90 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3.5 border-b border-gray-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-100 text-sm font-bold grid place-items-center shadow-xs">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {volunteerName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {volunteerEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.onClick();
                        setOpenProfile(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        item.danger
                          ? "text-rose-600 hover:bg-rose-50"
                          : "text-gray-700 hover:bg-gray-100/70"
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
