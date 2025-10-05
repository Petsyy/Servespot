import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  PlusSquare,
  Users,
  BarChart2,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { toast } from "react-toastify";

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
   ${isActive ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-800/70"}`;

export default function OrgSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    toast.info("Logged out successfully!");
    navigate("/");
  };

  return (
    <aside className="w-64 bg-[#111827] text-gray-100 min-h-screen p-4 flex flex-col justify-between">
      {/* Brand */}
      <div>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-9 w-9 flex items-center justify-center rounded-md bg-blue-600 font-bold">
            SS
          </div>
          <div>
            <p className="font-semibold">ServeSpot</p>
            <p className="text-xs text-gray-400">Organization Portal</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="mt-6 space-y-1">
          <NavLink to="/organization/dashboard" className={linkCls}>
            <LayoutGrid size={18} /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/organization/opportunities" className={linkCls}>
            <PlusSquare size={18} /> <span>Posted Opportunities</span>
          </NavLink>
          <NavLink to="/organization/volunteers" className={linkCls}>
            <Users size={18} /> <span>Manage Volunteers</span>
          </NavLink>
          <NavLink to="/organization/reports" className={linkCls}>
            <BarChart2 size={18} /> <span>Reports</span>
          </NavLink>
          <NavLink to="/organization/notifications" className={linkCls}>
            <Bell size={18} /> <span>Notifications</span>
          </NavLink>
          <NavLink to="/organization/profile" className={linkCls}>
            <User size={18} /> <span>Profile</span>
          </NavLink>
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-10 flex items-center gap-2 text-gray-300 hover:text-white px-2"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
