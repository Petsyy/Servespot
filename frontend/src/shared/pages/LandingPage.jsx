import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Clock,
  Award,
  ShieldCheck,
  Star,
  Trophy,
  Medal,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Zap,
  Flame,
  Crown,
  Sparkles,
} from "lucide-react";
import Navbar from "@/shared/components/layout/navbars/Navbar";
import Footer from "@/shared/components/layout/footer/Footer";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("volunteers");

  const ALL_BADGES = [
    {
      name: "First Step",
      description: "Completed your first volunteering task!",
      icon: <Star className="w-6 h-6" />,
      milestone: 1,
      bgGradient: "bg-amber-50/70 border-amber-200/80",
      iconColor: "text-amber-500",
      pillColor: "bg-amber-100 text-amber-800",
    },
    {
      name: "Active Helper",
      description: "Completed 2 volunteering tasks",
      icon: <Zap className="w-6 h-6" />,
      milestone: 2,
      bgGradient: "bg-emerald-50/70 border-emerald-200/80",
      iconColor: "text-emerald-600",
      pillColor: "bg-emerald-100 text-emerald-800",
    },
    {
      name: "Helping Hand",
      description: "Completed 3 volunteering tasks",
      icon: <Award className="w-6 h-6" />,
      milestone: 3,
      bgGradient: "bg-sky-50/70 border-sky-200/80",
      iconColor: "text-sky-600",
      pillColor: "bg-sky-100 text-sky-800",
    },
    {
      name: "Community Hero",
      description: "Completed 4 volunteering tasks",
      icon: <Trophy className="w-6 h-6" />,
      milestone: 4,
      bgGradient: "bg-amber-50/90 border-amber-300",
      iconColor: "text-amber-600",
      pillColor: "bg-amber-200/80 text-amber-900",
    },
    {
      name: "Neighborhood Legend",
      description: "Completed 5 volunteering tasks",
      icon: <Flame className="w-6 h-6" />,
      milestone: 5,
      bgGradient: "bg-rose-50/70 border-rose-200/80",
      iconColor: "text-rose-600",
      pillColor: "bg-rose-100 text-rose-800",
    },
    {
      name: "Volunteer Champion",
      description: "Completed 6 volunteering tasks",
      icon: <Crown className="w-6 h-6" />,
      milestone: 6,
      bgGradient: "bg-purple-50/70 border-purple-200/80",
      iconColor: "text-purple-600",
      pillColor: "bg-purple-100 text-purple-800",
    },
    {
      name: "Volunteer Master",
      description: "Completed 7 volunteering tasks",
      icon: <Medal className="w-6 h-6" />,
      milestone: 7,
      bgGradient: "bg-indigo-50/70 border-indigo-200/80",
      iconColor: "text-indigo-600",
      pillColor: "bg-indigo-100 text-indigo-800",
    },
    {
      name: "Volunteer Legend",
      description: "Completed 8 volunteering tasks",
      icon: <Sparkles className="w-6 h-6" />,
      milestone: 8,
      bgGradient: "bg-amber-100/60 border-amber-300",
      iconColor: "text-amber-600",
      pillColor: "bg-amber-200 text-amber-900",
    },
  ];

  // For HowItWorks steps
  const steps = {
    volunteers: [
      {
        title: "Browse Opportunities",
        desc: "Discover local micro-volunteering tasks that match your interests, skills, and schedule.",
        icon: <Users className="w-6 h-6 text-emerald-600" />,
      },
      {
        title: "Sign Up & Complete",
        desc: "Register for verified tasks and make a positive difference in hours, not days.",
        icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      },
      {
        title: "Earn Recognition",
        desc: "Log verified service hours, unlock achievement badges, and build your community profile.",
        icon: <Award className="w-6 h-6 text-emerald-600" />,
      },
    ],
    organizations: [
      {
        title: "Post Micro-Tasks",
        desc: "Create volunteer opportunities with clear role expectations, dates, and requirements.",
        icon: <UserPlus className="w-6 h-6 text-emerald-600" />,
      },
      {
        title: "Manage Volunteers",
        desc: "Review volunteer applications and confirm attendance with streamlined management tools.",
        icon: <Users className="w-6 h-6 text-emerald-600" />,
      },
      {
        title: "Track Impact",
        desc: "Measure total hours served and export verified impact reports for your board and partners.",
        icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      },
    ],
  };

  // For WhyChoose
  const features = [
    {
      title: "Easy Sign-Up",
      desc: "Get started in under 2 minutes with our streamlined registration process.",
      icon: <UserPlus className="w-6 h-6 text-emerald-600" />,
    },
    {
      title: "Flexible Scheduling",
      desc: "Find and complete micro-volunteering tasks that comfortably fit your busy routine.",
      icon: <Clock className="w-6 h-6 text-emerald-600" />,
    },
    {
      title: "Certified Badges",
      desc: "Earn tangible recognition and verified digital certificates for your service records.",
      icon: <Award className="w-6 h-6 text-emerald-600" />,
    },
    {
      title: "Vetted Partners",
      desc: "Every volunteer initiative is verified by registered non-profits and community groups.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    },
  ];

  // Display only first 4 badges
  const displayedBadges = ALL_BADGES.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans antialiased">
      <Navbar />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative bg-gradient-to-b from-emerald-50/70 via-slate-50/40 to-white px-6 md:px-20 py-20 pt-32 lg:pt-36"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border border-emerald-200/60 shadow-xs">
                <CheckCircle size={14} className="text-emerald-700" />
                <span>Micro-Volunteering Made Simple</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.15] tracking-tight">
                Connect. <span className="text-emerald-600">Volunteer.</span>{" "}
                Impact.
              </h1>

              <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
                ServeSpot makes civic engagement accessible. Discover local
                opportunities, lend a helping hand, and strengthen your
                community—one task at a time.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5">
                <button
                  onClick={() => navigate("/volunteer/signup")}
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                >
                  <span>Start Volunteering</span>
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
                <button
                  onClick={() => navigate("/organization/signup")}
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
                >
                  Post a Task
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 flex justify-center lg:justify-end w-full">
              <div className="relative w-full max-w-lg">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-950/10 border border-gray-100 bg-white">
                  <img
                    src="/images/community-group.png"
                    alt="Community volunteering"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="howitworks"
        className="py-24 px-6 md:px-20 bg-slate-50/80 border-b border-gray-200/60"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-2">
              Simple Workflow
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              How It Works
            </h2>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Getting started is straightforward, whether you are volunteering or mobilizing a cause.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
              <button
                onClick={() => setActiveTab("volunteers")}
                className={`px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === "volunteers"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                For Volunteers
              </button>
              <button
                onClick={() => setActiveTab("organizations")}
                className={`px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === "organizations"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                For Organizations
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {steps[activeTab].map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xs hover:shadow-md transition-all relative flex flex-col items-center text-center group"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center absolute -top-3.5 left-6 shadow-xs">
                  {index + 1}
                </div>

                <div className="w-13 h-13 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-5 text-emerald-600 group-hover:scale-105 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose ServeSpot */}
      <section id="whychooseservespot" className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-2">
              Core Benefits
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Why Choose ServeSpot?
            </h2>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              We make volunteering accessible, rewarding, and accountable for everyone involved.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-gray-200/80 bg-white hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Badges & Recognition Section */}
      <section className="py-24 px-6 md:px-20 bg-slate-50/80 border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-2">
              Achievements
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Earn Recognition for Service
            </h2>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Unlock verifiable achievement badges as you complete tasks and build your community track record.
            </p>
          </div>

          {/* Badge Grid with Warm Amber / Civic Tones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {displayedBadges.map((badge, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border ${badge.bgGradient} shadow-xs hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-between`}
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xs border border-gray-100">
                  <div className={badge.iconColor}>{badge.icon}</div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-base">
                    {badge.name}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {badge.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/5 w-full">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badge.pillColor}`}>
                    Milestone {badge.milestone}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Deep Forest Emerald Banner */}
          <div className="relative rounded-2xl p-10 md:p-14 text-center text-white overflow-hidden bg-gradient-to-tr from-emerald-950 via-emerald-900 to-emerald-850 shadow-xl shadow-emerald-950/15">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-bold uppercase tracking-wider">
                Get Certified
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Start Your Volunteer Journey Today
              </h3>
              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                Join thousands of dedicated volunteers discovering verified service opportunities and creating measurable local impact.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate("/volunteer/signup")}
                  className="bg-white text-emerald-900 hover:bg-emerald-50 active:bg-emerald-100 px-8 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  Create Volunteer Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
            Join ServeSpot today and begin your journey of giving back to the community through meaningful micro-volunteering.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <button
              onClick={() => navigate("/volunteer/signup")}
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              <span>Join as Volunteer</span>
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <button
              onClick={() => navigate("/organization/signup")}
              className="inline-flex items-center justify-center px-8 py-3.5 border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl font-semibold transition-all duration-200 cursor-pointer"
            >
              Register Organization
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
