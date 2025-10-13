import React, { useEffect, useState } from "react";
import VolSidebar from "@/components/layout/sidebars/VolSidebar";
import { getVolunteerTasks } from "@/services/volunteer.api";

export default function VolunteerTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getVolunteerTasks();
        setTasks(res.data || []);
      } catch (err) {
        console.error("❌ Failed to load my tasks:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  //  The return must be INSIDE the function
  return (
    <div className="min-h-screen flex bg-gray-50">
      <VolSidebar />

      <main className="flex-1 p-8 max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Activities</h1>

        {loading && <p>Loading...</p>}

        {!loading && tasks.length === 0 && (
          <p className="text-gray-500 text-sm mt-8">
            You haven’t signed up for any opportunities yet.
          </p>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition"
            >
              <h2 className="font-semibold text-lg text-gray-900 mb-1">
                {task.title}
              </h2>
              <p className="text-sm text-gray-700">{task.organization?.orgName}</p>
              <p className="text-sm text-gray-500">{task.location}</p>

              <div className="flex justify-between items-center mt-4">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    task.status === "Open"
                      ? "bg-green-100 text-green-700"
                      : task.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {task.status}
                </span>
                <span className="text-xs text-gray-400">
                  {task.date
                    ? new Date(task.date).toLocaleDateString()
                    : "No date set"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
