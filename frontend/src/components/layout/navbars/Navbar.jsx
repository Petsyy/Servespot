import React from "react";

export default function Navbar({ showAuthButtons = true }) {
  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
      <div className="flex justify-between items-center px-8 py-4">
        {/* Brand (Left) */}
        <button
          onClick={() => handleScroll("hero")}
          className="text-2xl font-bold text-green-600 hover:text-green-700 transition cursor-pointer"
        >
          ServeSpot
        </button>

        {/* Center Nav Links */}
        {showAuthButtons && (
          <nav className="flex space-x-8 text-gray-700 font-medium absolute left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => handleScroll("hero")}
              className="hover:text-green-600 transition cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleScroll("chooseyourpath")}
              className="hover:text-green-600 transition cursor-pointer"
            >
              Choose Your Path
            </button>
            <button
              onClick={() => handleScroll("howitworks")}
              className="hover:text-green-600 transition cursor-pointer"
            >
              How It Works
            </button>
          </nav>
        )}

        {/* Auth Buttons (Right) */}
        {showAuthButtons && (
          <div className="space-x-4">
            <button
              onClick={() => (window.location.href = "/role/login")}
              className="px-4 py-2 rounded-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => (window.location.href = "/role/signup")}
              className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition cursor-pointer"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
