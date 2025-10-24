import React from "react";
import { logout } from "@/utils/logout";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  X,
  Bell,
} from "lucide-react";

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
   ${
     isActive
       ? "bg-white text-blue-600 shadow-md border border-blue-200"
       : "text-blue-100 hover:bg-blue-500 hover:text-white hover:shadow-sm"
   }`;

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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky z-50
        w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white flex flex-col
        transition-all duration-300 ease-in-out shadow-xl
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        h-screen top-0 left-0
      `}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between px-2 py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 font-bold shadow-sm">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">ServeSpot</p>
                  <p className="text-xs text-blue-100 opacity-90">
                    Admin Portal
                  </p>
                </div>
              </div>

              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-2 flex-1 overflow-y-auto">
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
                    className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-blue-600 text-white" : "group-hover:bg-white/20"}`}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="flex-shrink-0 space-y-3">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 text-blue-100 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group border border-transparent hover:border-red-400/30"
            >
              <div className="p-1.5 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                <LogOut size={18} />
              </div>
              <span className="font-medium">Logout</span>
            </button>

            {/* Collapse indicator for desktop */}
            <div className="hidden md:flex items-center justify-center pt-2">
              <div className="w-8 h-1 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}