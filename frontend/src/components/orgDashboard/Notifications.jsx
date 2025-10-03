import React from "react";
import { BellRing } from "lucide-react";

export default function Notifications({ items=[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
      <ul className="space-y-4">
        {items.map((n, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 grid place-items-center rounded-full bg-blue-50 text-blue-600">
              <BellRing size={16}/>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">{n.title}</p>
              <p className="text-xs text-gray-500">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
