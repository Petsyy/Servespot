import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LoginForm from "@/features/auth/components/LoginForm";

export default function OrganizationLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-white font-sans antialiased lg:overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-950 overflow-hidden flex-col justify-between p-10 xl:p-14 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity scale-105"
          style={{ backgroundImage: "url('/images/organization.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-emerald-900/90 to-emerald-800/85" />

        <div className="relative z-10">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-white hover:text-emerald-200 transition-colors inline-block"
          >
            ServeSpot
          </Link>
        </div>

        {/* Center: Mission & Value Proposition */}
        <div className="relative z-10 max-w-lg space-y-5">
          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Mobilize Support. <br />
            Amplify your mission.
          </h1>

          <p className="text-emerald-100/90 text-sm xl:text-base leading-relaxed">
            Post volunteer opportunities, manage registrations, track attendance, and build lasting community partnerships.
          </p>

          <div className="pt-2 space-y-3.5 text-sm text-emerald-100/85">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Reach a dedicated network of verified volunteers</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Real-time attendance tracking and impact analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Automated certificate issuance and hour verification</span>
            </div>
          </div>
        </div>

        <div className="relative z-10" />
      </div>

      <div className="flex-1 flex flex-col justify-between h-full px-6 py-8 sm:px-12 lg:px-16 xl:px-20 bg-white overflow-y-auto">
        {/* Top Header Bar: Navigation + Role Switcher */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to home</span>
          </Link>

          {/* Role Switcher Pill */}
          <div className="inline-flex items-center p-1 bg-gray-100/90 rounded-xl border border-gray-200/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => navigate("/volunteer/login")}
              className="px-3 py-1.5 text-gray-500 hover:text-gray-900 rounded-lg transition-all cursor-pointer"
            >
              Volunteer
            </button>
            <button
              type="button"
              onClick={() => navigate("/organization/login")}
              className="px-3 py-1.5 bg-white text-emerald-700 font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              Organization
            </button>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-6">
          <LoginForm role="Organization" />
        </div>

        <div className="text-center text-xs text-gray-400 py-2 max-w-md mx-auto w-full">
          ServeSpot &copy; {new Date().getFullYear()} • Supporting nonprofit excellence
        </div>
      </div>
    </div>
  );
}
