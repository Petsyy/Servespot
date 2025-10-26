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
import Navbar from "@/components/layout/navbars/Navbar";
import Footer from "@/components/layout/footer/Footer";
import Button from "@/components/ui/Button";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("volunteers");

  const ALL_BADGES = [
    {
      name: "First Step",
      description: "Completed your first volunteering task!",
      icon: <Star className="w-6 h-6" />,
      milestone: 1,
      gradient: "from-yellow-400 to-yellow-600",
      bgGradient: "from-yellow-50 to-amber-50",
      iconColor: "text-yellow-400",
    },
    {
      name: "Active Helper",
      description: "Completed 2 volunteering tasks",
      icon: <Zap className="w-6 h-6" />,
      milestone: 2,
      gradient: "from-orange-400 to-orange-600",
      bgGradient: "from-orange-50 to-amber-50",
      iconColor: "text-orange-500",
    },
    {
      name: "Helping Hand",
      description: "Completed 3 volunteering tasks",
      icon: <Award className="w-6 h-6" />,
      milestone: 3,
      gradient: "from-blue-400 to-blue-600",
      bgGradient: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-500",
    },
    {
      name: "Community Hero",
      description: "Completed 4 volunteering tasks",
      icon: <Trophy className="w-6 h-6" />,
      milestone: 4,
      gradient: "from-green-400 to-green-600",
      bgGradient: "from-green-50 to-emerald-50",
      iconColor: "text-green-500",
    },
    {
      name: "Neighborhood Legend",
      description: "Completed 5 volunteering tasks",
      icon: <Flame className="w-6 h-6" />,
      milestone: 5,
      gradient: "from-pink-400 to-pink-600",
      bgGradient: "from-pink-50 to-rose-50",
      iconColor: "text-pink-500",
    },
    {
      name: "Volunteer Champion",
      description: "Completed 6 volunteering tasks",
      icon: <Crown className="w-6 h-6" />,
      milestone: 6,
      gradient: "from-purple-400 to-purple-600",
      bgGradient: "from-purple-50 to-violet-50",
      iconColor: "text-purple-500",
    },
    {
      name: "Volunteer Master",
      description: "Completed 7 volunteering tasks",
      icon: <Medal className="w-6 h-6" />,
      milestone: 7,
      gradient: "from-indigo-400 to-indigo-600",
      bgGradient: "from-indigo-50 to-blue-50",
      iconColor: "text-indigo-500",
    },
    {
      name: "Volunteer Legend",
      description: "Completed 8 volunteering tasks",
      icon: <Sparkles className="w-6 h-6" />,
      milestone: 8,
      gradient: "from-yellow-400 to-yellow-600",
      bgGradient: "from-amber-50 to-yellow-50",
      iconColor: "text-yellow-500",
    },
  ];

  // For HowItWorks steps
  const steps = {
    volunteers: [
      {
        title: "Browse Opportunities",
        desc: "Discover local micro-volunteering tasks that match your interests and schedule.",
        icon: <Users className="w-8 h-8 text-white" />,
        bg: "bg-gradient-to-r from-green-500 to-emerald-500",
      },
      {
        title: "Sign Up & Complete",
        desc: "Register for quick tasks and make a difference in just hours, not days.",
        icon: <CheckCircle className="w-8 h-8 text-white" />,
        bg: "bg-gradient-to-r from-emerald-500 to-green-600",
      },
      {
        title: "Earn Recognition",
        desc: "Complete tasks, earn badges, and build your volunteer profile in the community.",
        icon: <Award className="w-8 h-8 text-white" />,
        bg: "bg-gradient-to-r from-green-600 to-emerald-600",
      },
    ],
    organizations: [
      {
        title: "Post Micro-Tasks",
        desc: "Create quick volunteer opportunities with clear details and requirements.",
        icon: <UserPlus className="w-8 h-8 text-white" />,
        bg: "bg-gradient-to-r from-green-500 to-emerald-500",
      },
      {
        title: "Manage Volunteers",
        desc: "Review applications and confirm volunteer participation easily.",
        icon: <Users className="w-8 h-8 text-white" />,
        bg: "bg-gradient-to-r from-emerald-500 to-green-600",
      },
      {
        title: "Track Impact",
        desc: "Monitor completed tasks and measure your community engagement.",
        icon: <TrendingUp className="w-8 h-8 text-white" />,
        bg: "bg-gradient-to-r from-green-600 to-emerald-600",
      },
    ],
  };

  // For WhyChoose
  const features = [
    {
      title: "Easy Sign-Up",
      desc: "Get started in minutes with our streamlined registration process.",
      icon: <UserPlus className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      title: "Quick Volunteering",
      desc: "Find and complete micro-volunteering tasks that fit your busy schedule.",
      icon: <Clock className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      title: "Earn Badges",
      desc: "Get recognized for your contributions with our achievement system.",
      icon: <Award className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      title: "Verified Opportunities",
      desc: "All volunteer opportunities are verified by trusted organizations.",
      icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50",
      border: "border-green-200",
    },
  ];

  // Display only first 4 badges
  const displayedBadges = ALL_BADGES.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-white px-6 md:px-20 py-20 pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Hero Content */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <CheckCircle size={16} />
                Micro-Volunteering Made Simple
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Connect. <span className="text-green-600">Volunteer.</span>{" "}
                Impact.
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                ServeSpot makes micro-volunteering easy and accessible. Discover
                local opportunities, lend a hand, and strengthen your
                community—one small task at a time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/volunteer/signup")}
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Find Opportunities
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button
                  onClick={() => navigate("/organization/signup")}
                  className="px-8 py-4 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Post a Task
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/community-group.png"
                    alt="Community volunteering"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section id="chooseyourpath" className="py-20 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Path
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you want to help or need help, ServeSpot connects you with
              your community
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Volunteer Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  I'm a Volunteer
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Browse micro-tasks, sign up for opportunities, and earn badges
                  while making a difference in your community.
                </p>
                <ul className="text-left text-gray-700 mb-8 space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    Find local volunteer opportunities
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    Earn recognition and badges
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    Track your impact
                  </li>
                </ul>
                <button
                  onClick={() => navigate("/volunteer/signup")}
                  className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Volunteering
                </button>
              </div>
            </div>

            {/* Organization Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <UserPlus className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  We're an Organization
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Post micro-tasks, recruit volunteers, and manage your
                  community impact with our easy-to-use platform.
                </p>
                <ul className="text-left text-gray-700 mb-8 space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    Post volunteer opportunities
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    Manage volunteer applications
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    Track project impact
                  </li>
                </ul>
                <button
                  onClick={() => navigate("/organization/signup")}
                  className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Post Opportunities
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="howitworks" className="py-20 px-6 md:px-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is simple, whether you're volunteering or
              organizing
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-green-100 rounded-full p-1">
              <button
                onClick={() => setActiveTab("volunteers")}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "volunteers"
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                For Volunteers
              </button>
              <button
                onClick={() => setActiveTab("organizations")}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "organizations"
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                For Organizations
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {steps[activeTab].map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>

                <div
                  className={`p-8 rounded-2xl border-2 border-green-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 h-full ${step.bg} text-white`}
                >
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                    <p className="text-white/90 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose ServeSpot */}
      <section className="py-20 px-6 md:px-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ServeSpot?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make volunteering accessible, rewarding, and impactful for
              everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border-2 ${feature.border} ${feature.bg} hover:shadow-lg transition-all duration-300 group hover:border-green-300`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="py-20 px-6 md:px-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Earn Recognition
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock badges as you complete more volunteer tasks and make a
              difference in your community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {displayedBadges.map((badge, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${badge.bgGradient} p-6 rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-all duration-300 text-center`}
              >
                <div
                  className={`w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-gray-200`}
                >
                  <div className={badge.iconColor}>{badge.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                  {badge.name}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Card */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Start Your Volunteer Journey
            </h3>
            <p className="text-green-100 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of volunteers earning badges while making a
              positive impact in their communities
            </p>
            <button
              onClick={() => navigate("/volunteer/signup")}
              className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Begin Earning Badges
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 md:px-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join ServeSpot today and start your journey of giving back to the
            community through meaningful micro-volunteering.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/volunteer/signup")}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Join as Volunteer
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button
              onClick={() => navigate("/organization/signup")}
              className="px-8 py-4 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-xl font-semibold transition-all duration-300"
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
