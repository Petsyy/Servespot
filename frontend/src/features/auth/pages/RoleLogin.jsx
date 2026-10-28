import React, { useState } from "react";
import { Users, Building2 } from "lucide-react";
import Navbar from "@/shared/components/layout/navbars/Navbar";
import Footer from "@/shared/components/layout/footer/Footer";
import { useNavigate } from "react-router-dom";

export default function RoleSignin() {
  const navigate = useNavigate();

  const [loadingVolunteer, setLoadingVolunteer] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(false);

  const handleVolunteer = () => {
    setLoadingVolunteer(true);
    navigate("/volunteer/login");
  };

  const handleOrg = () => {
    setLoadingOrg(true);
    navigate("/organization/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50/50 to-white font-sans antialiased">
      {/* Navbar */}
      <Navbar showAuthButtons={false} />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-24 pt-32">
        {/* Top Heading */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-2">
            Portal Access
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Connect. Volunteer. Impact.
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-lg leading-relaxed">
            Choose your account type to access your personalized ServeSpot dashboard.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Volunteer Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-950/5 p-8 sm:p-10 flex flex-col items-center text-center justify-between transition-all duration-200">
            <div>
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-6 mx-auto shadow-xs">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                I'm a Volunteer
              </h2>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Ready to make a difference? Sign in to browse tasks, log certified hours, and build your community track record.
              </p>
            </div>
            <button
              onClick={handleVolunteer}
              disabled={loadingVolunteer}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
            >
              {loadingVolunteer ? "Redirecting..." : "Login as Volunteer"}
            </button>
          </div>

          {/* Organization Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-950/5 p-8 sm:p-10 flex flex-col items-center text-center justify-between transition-all duration-200">
            <div>
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-6 mx-auto shadow-xs">
                <Building2 className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                I'm an Organization
              </h2>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Connect with passionate volunteers, manage event attendance, and amplify your community service initiatives.
              </p>
            </div>
            <button
              onClick={handleOrg}
              disabled={loadingOrg}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loadingOrg ? "Redirecting..." : "Login as Organization"}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer showAuthButtons={false} />
    </div>
  );
}
