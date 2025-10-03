import React from "react";

export default function StatCard({ icon, title, value, delta }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4">
      <div className="h-10 w-10 grid place-items-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {delta && <p className="text-xs text-green-600 mt-1">{delta}</p>}
      </div>
    </div>
  );
}
