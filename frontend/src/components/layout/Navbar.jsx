import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ showAuthButtons = true }) {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
      {/* Brand now clickable */}
      <Link
        to="/"
        className="text-2xl font-bold text-green-600 hover:text-green-700 transition"
      >
        ServeSpot
      </Link>

      {showAuthButtons && (
        <nav className="space-x-6 text-gray-700 font-medium">
          <Link
            to="/role/login"
            className="border border-green-600 text-green-600 px-4 py-2 rounded-full transition hover:bg-green-50"
          >
            Login
          </Link>
          <Link
            to="/role/signup"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Get Started
          </Link>
        </nav>
      )}
    </header>
  );
}
