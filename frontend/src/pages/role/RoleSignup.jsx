import React from "react";
import { Heart, Users, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

export default function RoleSignup() {
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      {/* Navbar */}
      <Navbar showAuthButtons={false} />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        {/* Top Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <Heart className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Connect. Volunteer. Impact.
          </h1>
          <p className="text-gray-600 mt-2 max-w-xl">
            Join our community of volunteers and organizations working together
            to make a difference.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* Volunteer Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <Users className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              I'm a Volunteer
            </h2>
            <p className="text-gray-600 mb-6">
              Ready to make a difference? Join our community of passionate
              volunteers and find meaningful opportunities.
            </p>
            <div className="w-full flex flex-col gap-3">
              <Link
                to="/volunteer/signup"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium text-center transition "
              >
                Get Started as Volunteer
              </Link>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <Building2 className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              I'm an Organization
            </h2>
            <p className="text-gray-600 mb-6">
              Connect with dedicated volunteers and amplify your impact in the
              community.
            </p>
            <div className="w-full flex flex-col gap-3">
              <Link
                to="/organization/signup"
                className="w-full border border-green-600 text-green-600 py-2 px-4 rounded-lg font-medium text-center transition mt-6 hover:bg-green-50" 
              >
                Join as Organization
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
