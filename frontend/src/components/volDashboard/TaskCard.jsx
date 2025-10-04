import React from "react";
import { Calendar, MapPin, Clock } from "lucide-react";

export default function TaskCard({ title, orgName, dateLabel, location, duration, points, status }) {
  const badge =
    status === "In Progress"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-blue-100 text-blue-700";

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{orgName}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${badge}`}>{status || "Upcoming"}</span>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2"><Calendar size={16}/> {dateLabel}</div>
        <div className="flex items-center gap-2"><Clock size={16}/> {duration}</div>
        <div className="flex items-center gap-2"><MapPin size={16}/> {location}</div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          View Details
        </button>
        <span className="text-orange-600 font-semibold">+{points || 0}</span>
        <span className="text-xs text-gray-400">points</span>
      </div>
    </div>
  );
}
