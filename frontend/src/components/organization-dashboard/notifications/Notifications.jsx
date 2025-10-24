import React from "react";
import { BellRing } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Notifications({ items = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <BellRing size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((n, i) => (
            <li key={n._id || i} className="flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 grid place-items-center rounded-full bg-blue-50 text-blue-600">
                <BellRing size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">{n.title}</p>
                <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {n.createdAt
                    ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                    : n.time || "Just now"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
