import React from "react";
import { Bell } from "lucide-react";

export default function Notifications({ items = [], loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <button className="text-sm text-gray-500 hover:underline">Mark all read</button>
      </div>
      {loading && <div className="h-24 bg-gray-100 rounded animate-pulse" />}
      {!loading && (
        <ul className="space-y-4">
          {items.map((n, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 grid place-items-center rounded-full bg-blue-50 text-blue-600">
                <Bell size={16}/>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500">{n.time}</p>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-gray-500">You’re all caught up.</p>
          )}
        </ul>
      )}
    </div>
  );
}
