import React from "react";
import {
  Bell,
  UserCircle,
  ChevronDown,
  LogOut,
  Search,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { useVolunteerNavbar } from "@/features/volunteers/hooks/useVolunteerNavbar";

export default function VolunteerNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();
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

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-gray-200">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-xl font-extrabold tracking-tight text-gray-700">
            ServeSpot
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Search size={20} />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-green-600 outline-none focus:ring-2 focus:ring-green-300 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 grid place-items-center font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-gray-100 bg-green-50/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Notifications
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {unreadCount} unread{" "}
                        {unreadCount === 1 ? "notification" : "notifications"}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded hover:bg-green-100/50 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                {notifications && notifications.length ? (
                  <ul className="max-h-72 overflow-auto">
                    {notifications.slice(0, 5).map((n) => (
                      <li
                        key={n._id}
                        onClick={() => {
                          setOpenNotif(false);
                          if (n.link) navigate(n.link);
                        }}
                        className={`px-4 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer ${
                          !n.isRead ? "bg-green-50/70" : ""
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 grid place-items-center flex-shrink-0 mt-0.5">
                          <Bell size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-900 font-medium truncate">
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{n.message}</p>
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
                    <Bell className="mx-auto mb-2 text-gray-300 w-8 h-8" />
                    <p className="text-sm text-gray-500">No new notifications</p>
                  </div>
                )}

                <div className="border-t border-gray-100">
                  <button
                    onClick={() => {
                      setOpenNotif(false);
                      navigate("/volunteer/notifications");
                    }}
                    className="w-full px-4 py-3 text-sm text-green-600 hover:bg-green-50 font-medium transition-colors text-center"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpenProfile((v) => !v)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 outline-none focus:ring-2 focus:ring-green-300 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-bold grid place-items-center shadow-sm group-hover:shadow transition-shadow">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800 leading-tight">
                  {volunteerName}
                </p>
                <p className="text-xs text-gray-500 leading-tight">Volunteer</p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${
                  openProfile ? "rotate-180" : ""
                }`}
              />
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold grid place-items-center shadow">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {volunteerName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {volunteerEmail}
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
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        item.danger
                          ? "text-red-600 hover:bg-red-50"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon
                        size={16}
                        className={item.danger ? "text-red-500" : "text-gray-400"}
                      />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500">ServeSpot Volunteer</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-green-300 to-transparent" />
    </header>
  );
}
