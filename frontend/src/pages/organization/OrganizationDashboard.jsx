import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function OrganizationDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar showAuthButtons={false} />

      <main className="flex-grow p-8">
        <h1 className="text-2xl font-bold text-green-700 mb-4">
          Organization Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Manage your tasks and connect with volunteers easily.
        </p>

        {/* Simple cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Tasks Posted</h2>
            <p className="text-3xl font-bold text-green-600 mt-2">8</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Active Volunteers</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">15</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800">Reports Generated</h2>
            <p className="text-3xl font-bold text-purple-600 mt-2">4</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
