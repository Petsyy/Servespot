import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t py-8 px-8 md:px-20 text-gray-600 text-sm flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        <h2 className="text-green-600 font-bold text-lg">ServeSpot</h2>
        <p className="text-xs">© 2024 ServeSpot. All rights reserved.</p>
      </div>
    </footer>
  );
}
