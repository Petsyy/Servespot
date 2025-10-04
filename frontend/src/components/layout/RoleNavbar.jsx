import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleNavbar({ role }) {
  const navigate = useNavigate();

  const volunteerLinks = [
    { name: "Home", path: "/volunteer/homepage" },
    { name: "Opportunities", path: "/opportunities" },
    { name: "My Tasks", path: "/volunteer/tasks" },
  ];

  const organizationLinks = [
    { name: "Home", path: "/organization/homepage" },
    { name: "My Posts", path: "/organization/opportunities" },
  ];

  const links = role === "volunteer" ? volunteerLinks : organizationLinks;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
      <div className="flex justify-between items-center px-8 py-4">
        <button
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-green-600 hover:text-green-700 transition cursor-pointer"
        >
          ServeSpot
        </button>

        <nav className="flex space-x-8 text-gray-700 font-medium">
          {links.map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.path)}
              className="hover:text-green-600 transition cursor-pointer"
            >
              {link.name}
            </button>
          ))}
        </nav>

        <div className="space-x-4">
          <button
            onClick={() => navigate("/profile")}
            className="text-green-600 px-4 py-2 hover:bg-green-50 transition cursor-pointer"
          >
            Profile
          </button>
          <button
            onClick={() => {
              navigate("/");
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
