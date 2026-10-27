import React from "react";

export default function Footer({ showAuthButtons = true }) {
  return (
    <footer className="bg-gray-50 py-4 px-8 md:px-20 text-gray-600 text-sm">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-green-600 font-bold text-xl">ServeSpot</h2>
          <p className="text-xs mt-2">
            © {new Date().getFullYear()} ServeSpot. All rights reserved.
          </p>
        </div>

        {/* Links
        {showAuthButtons && (
        <div className="flex space-x-8 text-sm">
          <a href="#" className="hover:text-green-600 transition">
            About
          </a>
          <a href="#" className="hover:text-green-600 transition">
            Opportunities
          </a>
          <a href="#" className="hover:text-green-600 transition">
            Contact
          </a>
        </div>
        )} */}
      </div>
    </footer>
  );
}
