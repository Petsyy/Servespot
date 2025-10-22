// src/components/layout/navbars/VolunteerNavbar.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  UserCircle,
  ChevronDown,
  LogOut,
  Settings,
  Award,
  Search,
  Home,
  Compass,
  Menu,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { getVolunteerNotifications } from "@/services/volunteer.api";
import API from "@/services/api";
import { socket } from "@/utils/socket";

export default function VolunteerNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();

  // 🧠 State for notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // 🧩 Get volunteer name (same logic you had)
  const getVolunteerName = () => {
    if (typeof window === "undefined") return "Volunteer";
    const volUser = localStorage.getItem("volUser");
    if (volUser) {
      try {
        const userData = JSON.parse(volUser);
        if (userData.firstName && userData.lastName)
          return `${userData.firstName} ${userData.lastName}`;
        if (userData.name) return userData.name;
        if (userData.firstName) return userData.firstName;
      } catch (err) {
        console.error("Error parsing volUser:", err);
      }
    }
    const directName =
      localStorage.getItem("volunteerName") ||
      localStorage.getItem("volunteerFullName") ||
      localStorage.getItem("userName");
    return directName?.trim() || "Volunteer";
  };

  const volunteerName = getVolunteerName();

  // 🧩 Real-time socket notifications
  useEffect(() => {
    const volunteerId = localStorage.getItem("volunteerId");
    if (!volunteerId) return;

    socket.emit("registerVolunteer", volunteerId);

    socket.on("newNotification", (notif) => {
      toast.info(`🔔 ${notif.title}: ${notif.message}`, { autoClose: 5000 });
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    // Update state when socket connects/disconnects
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Auto-register this volunteer if not yet registered
    const volunteerId = localStorage.getItem("volunteerId");
    if (volunteerId) socket.emit("registerVolunteer", volunteerId);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // 🧩 Mark all read
  const markAllRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // 🧩 Outside click/ESC close
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
    const fetchNotifs = async () => {
      try {
        const res = await getVolunteerNotifications();
        if (res?.data) {
          const notifs = Array.isArray(res.data) ? res.data : [];
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        console.error("❌ Failed to load notifications:", err);
      }
    };

    fetchNotifs();
  }, []);

  const initials = useMemo(() => {
    return volunteerName
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [volunteerName]);

  const navLinkCls = ({ isActive }) =>
    `flex items-center gap-1 text-sm font-medium transition-all ${
      isActive
        ? "text-blue-600 border-b-2 border-blue-600"
        : "text-gray-600 hover:text-blue-600 hover:border-blue-400"
    } pb-1 border-transparent`;

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-gray-200">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Sidebar Toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-xl font-extrabold tracking-tight text-gray-700">
            ServeSpot
          </h1>
        </div>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <nav className="flex items-center gap-6">
            <NavLink to="/volunteer/dashboard" className={navLinkCls}>
              <Home size={16} /> Dashboard
            </NavLink>
            <NavLink to="/volunteer/opportunities" className={navLinkCls}>
              <Compass size={16} /> Opportunities
            </NavLink>
          </nav>

          <label className="relative w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Search..."
              className="w-full h-9 pl-10 pr-3 rounded-lg bg-gray-100 border border-transparent focus:border-blue-300 focus:bg-white outline-none transition text-sm"
            />
          </label>
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

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-blue-600 outline-none focus:ring-2 focus:ring-blue-300"
            >
              <Bell size={20} />
              {notifications && notifications.some((n) => !n.isRead) && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 grid place-items-center">
                  ●
                </span>
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b bg-gray-50 flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-800">
                    Notifications
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await API.patch(
                          "/notifications/mark-all-read",
                          {},
                          {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem("volToken")}`,
                            },
                          }
                        );
                        setNotifications((prev) =>
                          prev.map((n) => ({ ...n, isRead: true }))
                        );
                        setUnreadCount(0);
                        setOpenNotif(false);
                      } catch (err) {
                        console.error(
                          "❌ Failed to mark notifications read:",
                          err
                        );
                      }
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                {notifications && notifications.length ? (
                  <ul className="max-h-72 overflow-auto">
                    {notifications.map((n, i) => (
                      <li
                        key={i}
                        className={`px-3 py-3 text-sm flex items-start gap-2 ${
                          n.isRead ? "bg-white" : "bg-orange-50"
                        } hover:bg-gray-50 transition`}
                      >
                        <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 grid place-items-center">
                          <Bell size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-6 text-sm text-gray-500">
                    You're all caught up!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 👤 Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setOpenProfile((v) => !v)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 outline-none focus:ring-2 focus:ring-blue-300"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold grid place-items-center shadow">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-800">
                {volunteerName}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-500 transition ${
                  openProfile ? "rotate-180" : ""
                }`}
              />
            </button>

            {openProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">Account</p>
                  <p className="text-xs text-gray-600">{volunteerName}</p>
                </div>
                <button
                  onClick={() => {
                    setOpenProfile(false);
                    navigate("/volunteer/profile");
                  }}
                  className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <UserCircle size={16} /> Profile
                </button>
                <button
                  onClick={() => {
                    setOpenProfile(false);
                    navigate("/volunteer/settings");
                  }}
                  className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings size={16} /> Settings
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    setOpenProfile(false);
                    navigate("/volunteer/login");
                  }}
                  className="w-full text-left px-3 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
    </header>
  );
}
