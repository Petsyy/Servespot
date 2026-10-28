import React from "react";

export default function Footer({ showAuthButtons = true }) {
  return (
    <footer className="bg-slate-50 border-t border-gray-200/80 py-8 px-6 md:px-20 text-gray-500 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand */}
        <div className="text-center md:text-left">
          <h2 className="text-emerald-700 font-bold text-xl tracking-tight">ServeSpot</h2>
          <p className="text-xs text-gray-500 mt-1">
            Empowering communities through verified civic micro-volunteering.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-400">
          © {new Date().getFullYear()} ServeSpot. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
