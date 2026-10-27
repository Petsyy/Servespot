import React from "react";

export default function Card({ children }) {
  return (
    <div className="rounded-2xl shadow-md p-8 flex flex-col items-center bg-white">
      {children}
    </div>
  );
}
