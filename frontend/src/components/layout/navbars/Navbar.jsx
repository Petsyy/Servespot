import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar({ showAuthButtons = true }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", id: "hero" },
    { name: "Choose Your Path", id: "chooseyourpath" },
    { name: "How It Works", id: "howitworks" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 relative">
          {/* Left side: Burger + Logo */}
          <div className="flex items-center gap-3">
            {showAuthButtons && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            )}

            {/* Brand Logo */}
            <button
              onClick={() => navigate("/")}
              className="text-2xl font-bold text-green-600 hover:text-green-700 transition cursor-pointer"
            >
              ServeSpot
            </button>
          </div>

          {/* Desktop Navigation Links - Center */}
          {showAuthButtons && (
            <nav className="hidden md:flex space-x-6 lg:space-x-8 text-gray-700 font-medium absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => handleScroll(link.id)}
                  className="hover:text-green-600 transition cursor-pointer py-2 px-3 rounded-lg hover:bg-green-50 whitespace-nowrap"
                >
                  {link.name}
                </button>
              ))}
            </nav>
          )}

          {/* Desktop Auth Buttons - Right */}
          {showAuthButtons && (
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => navigate("/role/login")}
                className="px-4 py-2 rounded-lg border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/role/signup")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu (Dropdown) */}
        {isMobileMenuOpen && showAuthButtons && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            {/* Navigation Links */}
            <nav className="flex flex-col space-y-2 pt-4">
              {navLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => handleScroll(link.id)}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition font-medium"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <button
                onClick={() => {
                  navigate("/role/login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition font-medium"
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate("/role/signup");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg transition font-medium mt-2"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
