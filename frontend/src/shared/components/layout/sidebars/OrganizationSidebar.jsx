import React from "react";
import { logout } from "@/shared/utils/logout";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  PlusSquare,
  BarChart2,
  Bell,
  User,
  LogOut,
  X,
} from "lucide-react";

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
   ${
     isActive
       ? "bg-emerald-850 text-white shadow-xs border border-emerald-700/60"
       : "text-emerald-100/75 hover:bg-emerald-900/70 hover:text-white"
   }`;

export default function OrganizationSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout("organization");
    navigate("/organization/login");
  };

  const navItems = [
    { to: "/organization/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { to: "/organization/opportunities", icon: PlusSquare, label: "Opportunities" },
    { to: "/organization/reports", icon: BarChart2, label: "Reports & Analytics" },
    { to: "/organization/notifications", icon: Bell, label: "Notifications" },
    { to: "/organization/profile", icon: User, label: "Profile" },
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

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky z-50 w-64 bg-emerald-950 border-r border-emerald-900/60 text-white flex flex-col transition-all duration-300 ease-in-out shadow-xl md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } h-screen top-0 left-0`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between px-2 py-3">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-extrabold text-white text-lg tracking-tight">
                    ServeSpot
                  </p>
                  <p className="text-xs text-emerald-300/80 font-medium">
                    Organization Portal
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="md:hidden p-2 rounded-xl hover:bg-emerald-900/70 text-emerald-300 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5 flex-1 overflow-y-auto">
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
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "text-emerald-300"
                        : "text-emerald-400 group-hover:text-emerald-200"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="font-semibold text-sm">{item.label}</span>
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
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-emerald-100/75 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition-all duration-200 group border border-transparent hover:border-rose-900/50 cursor-pointer"
            >
              <div className="p-1.5 rounded-lg text-emerald-400 group-hover:text-rose-400 transition-colors">
                <LogOut size={18} />
              </div>
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
