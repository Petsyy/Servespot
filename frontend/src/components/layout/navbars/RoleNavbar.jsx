import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function RoleNavbar({ role }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const volunteerLinks = [
    { name: "Home", path: "/volunteer/homepage" },
    { name: "Opportunities", path: "/volunteer/opportunities" },
    { name: "My Tasks", path: "/volunteer/tasks" },
  ];

  const organizationLinks = [
    { name: "Home", path: "/organization/homepage" },
    { name: "Posted Opportunities", path: "/organization/opportunities" },

  ];

  const links = role === "volunteer" ? volunteerLinks : organizationLinks;

  const handleLinkClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Side - Mobile Menu Button & Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>

            {/* Logo */}
            <button
              onClick={() => navigate(role === "volunteer" ? "/volunteer/homepage" : "/organization/homepage")}
              className="text-xl sm:text-2xl font-bold text-green-600 hover:text-green-700 transition cursor-pointer"
            >
              ServeSpot
            </button>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8 text-gray-700 font-medium">
            {links.map((link, i) => (
              <button
                key={i}
                onClick={() => navigate(link.path)}
                className="hover:text-green-600 transition cursor-pointer py-2 px-3 rounded-lg hover:bg-green-50 whitespace-nowrap"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Desktop Profile & Logout - Right */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate("/organization/profile")}
              className="text-green-600 px-4 py-2 hover:bg-green-50 rounded-lg transition cursor-pointer font-medium"
            >
              Profile
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer font-medium"
            >
              Logout
            </button>
          </div>

          {/* Mobile - Right side empty for balance */}
          <div className="md:hidden w-10"></div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2 pt-4">
              {links.map((link, i) => (
                <button
                  key={i}
                  onClick={() => handleLinkClick(link.path)}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition cursor-pointer font-medium"
                >
                  {link.name}
                </button>
              ))}
              <div className="border-t border-gray-200 pt-4 mt-2">
                <button
                  onClick={() => handleLinkClick("/organization/profile")}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition cursor-pointer font-medium"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg transition cursor-pointer font-medium mt-2"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}