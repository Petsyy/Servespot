import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function VolunteerDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar showAuthButtons={false} />

      <main className="flex-grow p-8">
        <h1 className="text-2xl font-bold text-green-700 mb-4">
          Volunteer Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome back! Here’s your volunteer activity summary.
        </p>

        {/* Simple cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Tasks Completed</h2>
            <p className="text-3xl font-bold text-green-600 mt-2">12</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Tasks</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Badges Earned</h2>
            <p className="text-3xl font-bold text-yellow-500 mt-2">5</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
