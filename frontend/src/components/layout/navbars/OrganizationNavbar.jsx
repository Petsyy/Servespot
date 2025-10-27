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
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { socket, registerUserSocket } from "@/utils/socket";
import {
  getOrganizationProfile,
  getOrgNotifications,
  markOrgNotificationsRead,
} from "@/services/organization.api";

export default function OrganizationNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  
  // 🧠 State for notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [organizationName, setOrganizationName] = useState("Organization");
  const [organizationEmail, setOrganizationEmail] = useState("organization@servespot.com");

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  /* ------------------------- Socket setup (safe) ------------------------- */
  useEffect(() => {
    const orgId = localStorage.getItem("organizationId") || localStorage.getItem("orgId");
    if (!orgId) return;

    registerUserSocket(orgId, "organization");

    // Notification listener WITHOUT toasts
    const handleNotif = (notif) => {
      setNotifications((prev) => {
        // Check if notification already exists to prevent duplicates
        const exists = prev.some((n) => n._id === notif._id);
        if (exists) {
          return prev;
        }

        // Add new notification and limit to 50
        const updated = [notif, ...prev]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 50);

        return updated;
      });

      setUnreadCount((c) => c + 1);
    };

    socket.on("newNotification", handleNotif);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("newNotification", handleNotif);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  /* ------------------------- Fetch org profile ------------------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const orgId = localStorage.getItem("orgId");
        const token = localStorage.getItem("orgToken");
        if (!orgId || !token) return;

        const res = await getOrganizationProfile(orgId);
        const data = res?.data?.data || res?.data;
        if (!data) return;

        if (data.orgName) setOrganizationName(data.orgName);
        if (data.email) setOrganizationEmail(data.email);
      } catch (err) {
        console.error("❌ Failed to fetch organization profile:", err);
      }
    };

    fetchProfile();
  }, []);

  /* ------------------------- Fetch Bell Notifications ------------------------- */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const orgId = localStorage.getItem("organizationId") || localStorage.getItem("orgId");
        if (!orgId) return;

        const res = await getOrgNotifications(orgId);
        const list = Array.isArray(res?.data) ? res.data : [];

        // Deduplicate notifications by ID and sort by creation date
        const uniqueNotifs = list.reduce((acc, current) => {
          const existingIndex = acc.findIndex((item) => item._id === current._id);
          if (existingIndex === -1) {
            acc.push(current);
          } else {
            // Keep the more recent version if duplicate
            if (new Date(current.createdAt) > new Date(acc[existingIndex].createdAt)) {
              acc[existingIndex] = current;
            }
          }
          return acc;
        }, []);

        // Sort by creation date (newest first) and limit to 50 notifications
        const sortedNotifs = uniqueNotifs
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 50);

        setNotifications(sortedNotifs);
        setUnreadCount(sortedNotifs.filter((n) => !n.isRead).length);
      } catch (err) {
        console.error("❌ Failed to fetch organization notifications:", err);
      }
    };

    fetchNotifications();

    // Set up periodic refresh every 30 seconds to keep notifications updated
    const interval = setInterval(() => {
      fetchNotifications();
      cleanupOldNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* ------------------------- Notification functions ------------------------- */
  // 🧩 Mark all read
  const markAllRead = async () => {
    try {
      const orgId = localStorage.getItem("organizationId") || localStorage.getItem("orgId");
      const response = await markOrgNotificationsRead(orgId);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      // Show success feedback
      const updatedCount = response?.data?.updatedCount || 0;
      if (updatedCount > 0) {
        toast.success(
          `✅ Marked ${updatedCount} notification${updatedCount === 1 ? "" : "s"} as read`
        );
      } else {
        toast.info("All notifications were already read");
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
      toast.error("Failed to mark notifications as read");
    }
  };

  // 🧩 Mark individual notification as read
  const markNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  // 🧩 Clean up old notifications (older than 30 days)
  const cleanupOldNotifications = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setNotifications((prev) =>
      prev.filter((n) => new Date(n.createdAt) > thirtyDaysAgo)
    );
  };

  /* ------------------------- Outside click/ESC close ------------------------- */
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

  /* ------------------------- Logout ------------------------- */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/organization/login");
  };

  const initials = useMemo(() => {
    return organizationName
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [organizationName]);

  // Calculate unread count for notification badge
  const computedUnreadCount = notifications.filter((n) => !n.isRead).length;

  const profileMenuItems = [
    {
      icon: UserCircle,
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

  /* ------------------------- Render ------------------------- */
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-gray-200">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Sidebar Toggle + Brand */}
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

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Search size={20} />
          </button>

          {/* Live Connection Indicator */}
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

          {/* Notifications - Updated UI (same as volunteer) */}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Notifications
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {computedUnreadCount} unread{" "}
                        {computedUnreadCount === 1
                          ? "notification"
                          : "notifications"}
                      </p>
                    </div>
                    {computedUnreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                {notifications && notifications.length ? (
                  <ul className="max-h-72 overflow-auto">
                    {notifications
                      // 🧹 Remove duplicates by ID
                      .filter(
                        (n, index, arr) =>
                          index === arr.findIndex((x) => x._id === n._id)
                      )
                      .slice(0, 5)
                      .map((n, i) => (
                        <li
                          key={`${n._id || "notif"}-${i}`} // ✅ unique + safe
                          onClick={() => markNotificationRead(n._id)}
                          className={`px-4 py-3 text-sm flex items-start gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer ${
                            !n.isRead ? "bg-green-50/70" : ""
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 grid place-items-center flex-shrink-0 mt-0.5">
                            <Bell size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-gray-900 font-medium truncate">
                                {n.title}
                              </p>
                              {!n.isRead && (
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 ml-2"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {n.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
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
                    <p className="text-sm text-gray-500">
                      No new notifications
                    </p>
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

          {/* 👤 Profile Dropdown (similar to volunteer) */}
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
                      <item.icon
                        size={16}
                        className={
                          item.danger ? "text-red-500" : "text-gray-400"
                        }
                      />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500">ServeSpot Organization</p>
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