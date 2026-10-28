import React from "react";
import { logout } from "@/shared/utils/logout";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  BarChart3,
  Shield,
  LogOut,
  X,
  Bell,
} from "lucide-react";

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout("admin");
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { to: "/admin/management", icon: Users, label: "User Management" },
    { to: "/admin/reports", icon: BarChart3, label: "Reports & Analytics" },
    { to: "/admin/notifications", icon: Bell, label: "Notifications" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Deep Forest Brand Palette */}
      <aside
        className={`fixed md:sticky z-50
        w-64 bg-emerald-950 border-r border-emerald-900/60 text-white flex flex-col
        transition-all duration-300 ease-in-out shadow-xl
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        h-screen top-0 left-0
      `}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex-shrink-0 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-900/80 border border-emerald-700/60 font-black text-emerald-300 text-lg shadow-sm">
                  SS
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-extrabold text-white text-base tracking-tight">ServeSpot</p>
                    <span className="p-0.5 rounded-md bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                      <Shield size={11} />
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-400/90 tracking-wide uppercase">
                    Admin Workspace
                  </p>
                </div>
              </div>

              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg hover:bg-emerald-900/60 text-emerald-300 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? "bg-emerald-900/70 text-emerald-100 border border-emerald-800/60 shadow-xs"
                      : "text-emerald-300/80 hover:text-white hover:bg-emerald-900/40"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg transition ${
                      isActive
                        ? "bg-emerald-800 text-emerald-200"
                        : "text-emerald-400 group-hover:text-emerald-200"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="flex-shrink-0 pt-4 border-t border-emerald-900/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-emerald-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-900/40"
            >
              <div className="p-1.5 rounded-lg bg-emerald-900/60 text-emerald-300 transition">
                <LogOut size={15} />
              </div>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
