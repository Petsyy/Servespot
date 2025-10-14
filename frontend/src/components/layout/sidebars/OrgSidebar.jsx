import React from "react";
import { logout } from "@/utils/logout";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  PlusSquare,
  Users,
  BarChart2,
  Bell,
  User,
  LogOut,
  X,
} from "lucide-react";

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
   ${
     isActive
       ? "bg-blue-600 text-white shadow-sm"
       : "text-gray-200 hover:bg-gray-800/70 hover:text-white"
   }`;

export default function OrgSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout("organization");
    navigate("/organization/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50
        w-64 bg-[#111827] text-gray-100 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        top-0 bottom-0 left-0 md:top-auto md:bottom-auto
      `}>
        <div className="p-4 flex flex-col h-full">
          {/* Top Logo Section */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between px-2 py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 flex items-center justify-center rounded-md bg-blue-600 font-bold text-white">
                  SS
                </div>
                <div>
                  <p className="font-semibold text-white">ServeSpot</p>
                  <p className="text-xs text-gray-400">Organization Portal</p>
                </div>
              </div>
              
              {/* Close button for mobile */}
              <button 
                onClick={onClose}
                className="md:hidden p-1 rounded-md hover:bg-gray-800 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Links - Scrollable area */}
          <nav className="mt-6 space-y-1 flex-1 overflow-y-auto">
            <NavLink 
              to="/organization/dashboard" 
              className={linkCls}
              onClick={onClose}
            >
              <LayoutGrid size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink 
              to="/organization/opportunities" 
              className={linkCls}
              onClick={onClose}
            >
              <PlusSquare size={18} />
              <span>Posted Opportunities</span>
            </NavLink>

            <NavLink 
              to="/organization/volunteers" 
              className={linkCls}
              onClick={onClose}
            >
              <Users size={18} />
              <span>Manage Volunteers</span>
            </NavLink>

            <NavLink 
              to="/organization/reports" 
              className={linkCls}
              onClick={onClose}
            >
              <BarChart2 size={18} />
              <span>Reports</span>
            </NavLink>

            <NavLink 
              to="/organization/notifications" 
              className={linkCls}
              onClick={onClose}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </NavLink>

            <NavLink 
              to="/organization/profile" 
              className={linkCls}
              onClick={onClose}
            >
              <User size={18} />
              <span>Profile</span>
            </NavLink>
          </nav>

          {/* Logout Button - Fixed at bottom */}
          <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-gray-400 hover:text-white px-2 py-3 transition rounded-md hover:bg-gray-800/70"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}