import React from "react";

export default function Navbar() {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
      <h1 className="text-2xl font-bold text-green-600">ServeSpot</h1>
      <nav className="space-x-6 text-gray-700 font-medium">
        <a href="#" className="hover:text-green-600">Home</a>
        <a href="#" className="hover:text-green-600">Opportunities</a>
        <a href="#" className="hover:text-green-600">About</a>
        <a href="#" className="hover:text-green-600">Login/Signup</a>
      </nav>
    </header>
  );
}
