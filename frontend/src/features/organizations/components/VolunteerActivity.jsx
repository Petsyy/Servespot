import React from "react";

export default function VolunteerActivity({ items=[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Volunteer Activity</h3>
      <ul className="divide-y divide-gray-100">
        {items.map((a, i) => (
          <li key={i} className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{a.name}</p>
              <p className="text-xs text-gray-500">{a.action}</p>
            </div>
            <span className="text-xs text-gray-400">{a.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
