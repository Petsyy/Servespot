import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import OrganizationAccountStep from "@/features/auth/components/Step1-OrganizationAccount";
import OrganizationProfileStep from "@/features/auth/components/Step2-OrganizationCompleteAccount";

export default function OrganizationSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1
    orgName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2
    contactPerson: "",
    contactNumber: "",
    region: "",
    regionCode: "",
    province: "",
    provinceCode: "",
    city: "",
    cityCode: "",
    barangay: "",
    barangayCode: "",
    address: "",
    orgType: "",
    description: "",
    document: null,
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-white font-sans antialiased lg:overflow-hidden">
      {/* Left Column: Clean Organization Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-950 overflow-hidden flex-col justify-between p-10 xl:p-14 text-white">
        {/* Real community backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity scale-105"
          style={{ backgroundImage: "url('/images/organization.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-emerald-900/90 to-emerald-800/85" />

        {/* Top: Brand Logo (clean brand text, no heart icon) */}
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

        {/* Bottom Spacer */}
        <div className="relative z-10" />
      </div>

      {/* Right Column: Clean Form Canvas */}
      <div className="flex-1 flex flex-col justify-between h-full px-6 py-8 sm:px-10 lg:px-12 xl:px-16 bg-white overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-4">
          {step === 1 ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-700 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to home</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-700 transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Step 1</span>
            </button>
          )}

          {/* Role Switcher Pill */}
          <div className="inline-flex items-center p-1 bg-gray-100/90 rounded-xl border border-gray-200/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => navigate("/volunteer/signup")}
              className="px-3 py-1.5 text-gray-500 hover:text-gray-900 rounded-lg transition-all cursor-pointer"
            >
              Volunteer
            </button>
            <button
              type="button"
              onClick={() => navigate("/organization/signup")}
              className="px-3 py-1.5 bg-white text-emerald-700 font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              Organization
            </button>
          </div>
        </div>

        {/* Form Container (Fixed max-w-xl width across both steps) */}
        <div className="w-full max-w-xl mx-auto my-auto py-4">
          {/* Step Progress Bar */}
          <div className="flex items-center gap-2 mb-6 p-1.5 rounded-xl bg-gray-50 border border-gray-100">
            <div
              className={`flex items-center justify-center gap-2 flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                step === 1
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-gray-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step > 1
                    ? "bg-emerald-600 text-white"
                    : step === 1
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </span>
              <span>Organization Credentials</span>
            </div>

            <div className="w-4 h-px bg-gray-200" />

            <div
              className={`flex items-center justify-center gap-2 flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                step === 2
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-gray-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === 2
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </span>
              <span>Organization Profile</span>
            </div>
          </div>

          {step === 1 && (
            <OrganizationAccountStep
              formData={formData}
              updateField={updateField}
              onNext={nextStep}
            />
          )}

          {step === 2 && (
            <OrganizationProfileStep
              formData={formData}
              updateField={updateField}
              onPrev={prevStep}
            />
          )}
        </div>

        {/* Bottom Footer Note */}
        <div className="text-center text-xs text-gray-500 py-3 max-w-xl mx-auto w-full space-y-1.5">
          <div>
            Already registered?{" "}
            <Link
              to="/organization/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="text-gray-400">
            ServeSpot &copy; {new Date().getFullYear()} • Secure Organization Portal
          </p>
        </div>
      </div>
    </div>
  );
}
