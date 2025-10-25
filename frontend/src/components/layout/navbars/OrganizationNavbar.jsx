import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  UserCircle,
  ChevronDown,
  LogOut,
  Settings,
  Building,
  Search,
  Menu,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { socket } from "@/utils/socket";

export default function OrganizationNavbar({
  onToggleSidebar,
  notifCount,
  notifications: notificationsProp,
}) {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(socket.connected);

  const organizationName =
    (typeof window !== "undefined" &&
      localStorage.getItem("orgName")?.trim()) ||
    "Organization";

  const organizationEmail = localStorage.getItem("orgEmail") || "organization@servespot.com";

  const fallbackNotifs = [
    {
      id: 1,
      title: "New Volunteer Application",
      icon: <UserCircle size={16} />,
    },
    { id: 2, title: "Opportunity Approved" },
  ];
  const notifications = notificationsProp ?? fallbackNotifs;
  const computedCount =
    typeof notifCount === "number" ? notifCount : notifications.length;

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

  useEffect(() => {
    const handleConnect = () => {
      console.log("Navbar detected socket connect");
      setIsConnected(true);
    };
    const handleDisconnect = () => {
      console.log("Navbar detected socket disconnect");
      setIsConnected(false);
    };

    // Listen for socket events
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Force re-check of state immediately
    setIsConnected(socket.connected);

    // Ensure connection is active
    if (!socket.connected) socket.connect();

    // Cleanup
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const initials = useMemo(() => {
    return organizationName
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [organizationName]);

  const handleLogout = () => {
    localStorage.removeItem("orgToken");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("orgId");
    localStorage.removeItem("orgName");
    localStorage.removeItem("orgEmail");
    navigate("/organization/login");
  };

  const profileMenuItems = [
    {
      icon: Building,
      label: "Profile",
      onClick: () => navigate("/organization/profile"),
    },
    {
      icon: LogOut,
      label: "Sign out",
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Calculate unread count for notification badge
  const computedUnreadCount = notifications.filter(n => !n.isRead).length;

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
            ServeSpot
          </h1>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button - Visible only on mobile */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Search size={20} />
          </button>

          {/* Socket Status */}
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${
              isConnected
                ? "text-green-700 border-green-400 bg-green-50"
                : "text-red-700 border-red-400 bg-red-50"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {isConnected ? "Connected" : "Disconnected"}
          </div>

          {/* Notifications - Updated UI */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-green-600 outline-none focus:ring-2 focus:ring-green-300 transition-colors"
            >
              <Bell size={20} />
              {computedUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 grid place-items-center font-medium">
                  {computedUnreadCount > 9 ? "9+" : computedUnreadCount}
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95">
                {/* Notification Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-green-50/80">
                  <p className="text-sm font-semibold text-gray-800">
                    Notifications
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {computedUnreadCount} unread {computedUnreadCount === 1 ? 'notification' : 'notifications'}
                  </p>
                </div>

                {/* Notifications List */}
                {notifications.length ? (
                  <ul className="max-h-72 overflow-auto">
                    {notifications.slice(0, 5).map((n) => (
                      <li
                        key={n.id}
                        className={`px-4 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                          !n.isRead ? "bg-green-50/70" : ""
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 grid place-items-center flex-shrink-0 mt-0.5">
                          {n.icon || <Bell size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium truncate">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {n.message || "New update for your organization"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date().toLocaleString(undefined, {
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

                {/* Footer with View All Button */}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => {
                      setOpenNotif(false);
                      navigate("/organization/notifications");
                    }}
                    className="w-full px-4 py-3 text-sm text-green-600 hover:bg-green-50 font-medium transition-colors"
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
                  {organizationName}
                </p>
                <p className="text-xs text-gray-500 leading-tight">Organization</p>
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
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold grid place-items-center shadow">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {organizationName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {organizationEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {profileMenuItems.map((item, index) => (
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
                      <item.icon size={16} className={item.danger ? "text-red-500" : "text-gray-400"} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    ServeSpot Organization
                  </p>
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