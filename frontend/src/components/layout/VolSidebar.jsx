import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, Award, User, LogOut } from "lucide-react";

const linkCls = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
   ${isActive ? "bg-gray-800 text-white" : "text-gray-200 hover:bg-gray-800/70"}`;

export default function VolSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-[#111827] text-gray-100 min-h-screen p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="h-9 w-9 flex items-center justify-center rounded-md bg-blue-600 font-bold">
          SS
        </div>
        <div>
          <p className="font-semibold">ServeSpot</p>
          <p className="text-xs text-gray-400">Volunteer Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-6 space-y-1">
        <NavLink to="/volunteer/dashboard" className={linkCls}>
          <Home size={18} /> <span>Dashboard</span>
        </NavLink>
        <NavLink to="/opportunities" className={linkCls}>
          <Compass size={18} /> <span>Browse Opportunities</span>
        </NavLink>
        <NavLink to="/volunteer/badges" className={linkCls}>
          <Award size={18} /> <span>Badges</span>
        </NavLink>
        <NavLink to="/volunteer/profile" className={linkCls}>
          <User size={18} /> <span>Profile</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <button
        onClick={() => {
          localStorage.clear();
          navigate("/role/login");
        }}
        className="mt-10 flex items-center gap-2 text-gray-300 hover:text-white px-2"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
