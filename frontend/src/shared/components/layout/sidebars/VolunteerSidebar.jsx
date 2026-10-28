import React from "react";
import { logout } from "@/shared/utils/logout";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  Award,
  User,
  LogOut,
  ClipboardList,
  X,
  Bell,
} from "lucide-react";

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer ${
    isActive
      ? "bg-emerald-850 text-white font-semibold border border-emerald-700/60 shadow-xs"
      : "text-emerald-100/75 hover:text-white hover:bg-emerald-900/60"
  }`;

export default function VolunteerSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout("volunteer");
    navigate("/volunteer/login");
  };

  const navItems = [
    { to: "/volunteer/dashboard", icon: Home, label: "Dashboard" },
    {
      to: "/volunteer/opportunities",
      icon: Compass,
      label: "Browse Opportunities",
    },
    { to: "/volunteer/tasks", icon: ClipboardList, label: "My Activities" },
    { to: "/volunteer/badges", icon: Award, label: "Badges" },
    { to: "/volunteer/profile", icon: User, label: "Profile" },
    { to: "/volunteer/notifications", icon: Bell, label: "Notifications" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky z-50 w-64 bg-emerald-950 border-r border-emerald-900/60 text-white flex flex-col transition-all duration-300 ease-in-out shadow-xl md:shadow-none h-screen top-0 left-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 flex flex-col h-full justify-between">
          <div>
            {/* Brand Header */}
            <div className="flex items-center justify-between px-2 py-3 border-b border-emerald-900/60 pb-4">
              <div
                onClick={() => navigate("/volunteer/dashboard")}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div>
                  <p className="font-bold text-white text-base tracking-tight leading-tight">
                    ServeSpot
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90 leading-tight">
                    Volunteer Portal
                  </p>
                </div>
              </div>

              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-lg hover:bg-emerald-900/60 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="mt-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={linkCls}
                    onClick={onClose}
                  >
                    <div
                      className={`transition-colors ${
                        isActive
                          ? "text-emerald-300"
                          : "text-emerald-300/70 group-hover:text-emerald-200"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section: Clean Logout */}
          <div className="flex-shrink-0 pt-4 border-t border-emerald-900/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-emerald-200/75 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition-all duration-150 font-medium text-sm border border-transparent hover:border-rose-900/40 cursor-pointer group"
            >
              <div className="text-emerald-300/70 group-hover:text-rose-300 transition-colors">
                <LogOut size={18} />
              </div>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
