import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  Search,
  Menu,
  AlertTriangle,
  HelpCircle,
  UserCog,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminNavbar({
  onToggleSidebar,
  notifCount,
  notifications: notificationsProp,
}) {
  const navigate = useNavigate();

  const adminName = "Admin"; // You can fetch this from localStorage if needed
  const adminEmail = "admin@servespot.com"; // You can fetch this from localStorage if needed

  const fallbackNotifs = [
    { id: 1, title: "New organization registration pending approval", icon: <Shield size={16} /> },
    { id: 2, title: "System backup completed successfully" },
    { id: 3, title: "High traffic alert - 500+ active users" },
  ];
  const notifications = notificationsProp ?? fallbackNotifs;
  const computedCount = typeof notifCount === "number" ? notifCount : notifications.length;

  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setOpenNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setOpenProfile(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setOpenNotif(false);
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const initials = useMemo(() => {
    return adminName
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [adminName]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("adminId");
    navigate("/admin/login");
  };

  const profileMenuItems = [
    {
      icon: UserCog,
      label: "Profile Settings",
      onClick: () => navigate("/admin/profile"),
      divider: false,
    },
    {
      icon: Settings,
      label: "Preferences",
      onClick: () => navigate("/admin/preferences"),
      divider: false,
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onClick: () => navigate("/admin/support"),
      divider: true,
    },
    {
      icon: LogOut,
      label: "Sign out",
      onClick: handleLogout,
      danger: true,
      divider: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-gray-200">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Sidebar Toggle + Brand */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu - Only visible on mobile */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-xl font-extrabold tracking-tight text-gray-700">
            ServeSpot <span className="text-blue-600">Admin</span>
          </h1>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button - Visible only on mobile */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            <Search size={20} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-blue-600 outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
            >
              <Bell size={20} />
              {computedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 grid place-items-center font-medium">
                  {computedCount > 9 ? "9+" : computedCount}
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                  <p className="text-sm font-semibold text-gray-800">
                    System Notifications
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {computedCount} unread {computedCount === 1 ? 'notification' : 'notifications'}
                  </p>
                </div>
                {notifications.length ? (
                  <ul className="max-h-72 overflow-auto">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className="px-4 py-3 text-sm text-gray-700 flex items-start gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center flex-shrink-0 mt-0.5">
                          {n.icon || <Bell size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium truncate">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-1">Just now</p>
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
                    className="w-full px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                    onClick={() => setOpenNotif(false)}
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
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 outline-none focus:ring-2 focus:ring-blue-300 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold grid place-items-center shadow-sm group-hover:shadow transition-shadow">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800 leading-tight">
                  {adminName}
                </p>
                <p className="text-xs text-gray-500 leading-tight">Administrator</p>
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
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold grid place-items-center shadow">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {adminName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {adminEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {profileMenuItems.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <button
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
                        <item.icon size={16} className={item.danger ? "text-red-500" : "text-gray-400"} />
                        <span>{item.label}</span>
                      </button>
                      {item.divider && <div className="border-t border-gray-100 my-1" />}
                    </React.Fragment>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    ServeSpot Admin Portal
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
    </header>
  );
}