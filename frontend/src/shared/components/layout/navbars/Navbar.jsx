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
    { name: "How It Works", id: "howitworks" },
    { name: "Why ServeSpot", id: "whychooseservespot" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 relative">
          {/* Left side: Burger + Logo */}
          <div className="flex items-center gap-3">
            {showAuthButtons && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
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
              className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
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
                  className="hover:text-emerald-600 transition cursor-pointer py-2 px-3 rounded-lg hover:bg-emerald-50/60 whitespace-nowrap text-sm"
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
                onClick={() => navigate("/volunteer/login")}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition font-medium text-sm cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/volunteer/signup")}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4.5 py-2 rounded-xl transition font-medium text-sm shadow-xs hover:shadow cursor-pointer"
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
            <nav className="flex flex-col space-y-1 pt-3">
              {navLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => handleScroll(link.id)}
                  className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition font-medium text-sm cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="border-t border-gray-200 pt-3 mt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  navigate("/volunteer/login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition font-medium text-sm cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate("/volunteer/signup");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition font-medium text-sm shadow-xs cursor-pointer"
              >
                Get Started
              </button>
              <div className="text-center pt-1">
                <button
                  onClick={() => {
                    navigate("/organization/signup");
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-gray-500 hover:text-emerald-700 font-medium transition cursor-pointer"
                >
                  Are you an organization? Post a task &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
