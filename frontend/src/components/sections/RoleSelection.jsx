import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-6 md:px-20 bg-gray-100 text-center">
      {/* Heading */}
      <h3 className="text-3xl font-bold text-blue-900 mb-3">
        Choose Your Path
      </h3>
      <p className="text-gray-600 mb-12">
        Whether you want to help or need help, ServeSpot connects you with your
        community
      </p>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Volunteer Card */}
        <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center">
          <img
            src="/images/volunteers.jpg"
            alt="Volunteers illustration"
            className="w-full h-full object-contain mb-6"
          />
          <h4 className="text-xl font-bold text-blue-900 mb-3">
            I'm a Volunteer
          </h4>
          <p className="text-gray-600 mb-4">
            Browse tasks, sign up for opportunities, and earn badges while
            making a difference in your community.
          </p>
          <ul className="text-left text-gray-700 mb-6 space-y-2">
            <li>✔ Find local volunteer opportunities</li>
            <li>✔ Earn recognition and badges</li>
            <li>✔ Track your impact</li>
          </ul>
          <button
            onClick={() => navigate("/role/signup")}
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition"
          >
            Start Volunteering
          </button>
        </div>

        {/* Organization Card */}
        <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center">
          <img
            src="/images/organization.png"
            alt="Organization team"
            className="w-full h-full object-cover mb-6 rounded-md"
          />
          <h4 className="text-xl font-bold text-blue-900 mb-3">
            We're an Organization
          </h4>
          <p className="text-gray-600 mb-4">
            Post tasks, recruit volunteers, and manage your community impact
            with our easy-to-use platform.
          </p>
          <ul className="text-left text-gray-700 mb-6 space-y-2">
            <li>✔ Post volunteer opportunities</li>
            <li>✔ Manage volunteer applications</li>
            <li>✔ Track project impact</li>
          </ul>
          <button
            onClick={() => navigate("/role/signup")}
            className="w-full py-3 bg-blue-900 text-white font-semibold rounded-md hover:bg-blue-800 transition"
          >
            Post Opportunities
          </button>
        </div>
      </div>
    </section>
  );
}
