import React from "react";
import { useNavigate } from "react-router-dom";
import RoleNavbar from "@/components/layout/navbars/RoleNavbar";
import {
  UserPlus,
  Clock,
  Award,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  HeartHandshake,
} from "lucide-react";
import Footer from "@/components/layout/footer/Footer";

export default function OrganizationLanding() {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Post Micro-Tasks",
      desc: "Create and publish short volunteer activities such as food packing, flyer design, or 1-hour tutoring sessions.",
      icon: <UserPlus className="w-6 h-6 text-white" />,
      bg: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      title: "Connect With Volunteers",
      desc: "Easily reach passionate volunteers ready to take action, and track sign-ups through your organization dashboard.",
      icon: <Users className="w-6 h-6 text-white" />,
      bg: "bg-gradient-to-r from-emerald-500 to-green-600",
    },
    {
      title: "Track Impact & Reward Service",
      desc: "Verify completions, award points, and recognize volunteers’ contributions to your community programs.",
      icon: <Award className="w-6 h-6 text-white" />,
      bg: "bg-gradient-to-r from-green-600 to-emerald-600",
    },
  ];

  const features = [
    {
      title: "Streamlined Posting",
      desc: "Quickly create micro-volunteering opportunities with full details such as duration, location, and skills needed.",
      icon: <UserPlus className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Volunteer Management",
      desc: "Monitor volunteer sign-ups, review submitted proofs, and mark tasks as completed in one organized system.",
      icon: <Clock className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Secure & Reliable",
      desc: "Built using Node.js, Express, and MongoDB to ensure smooth operations and data protection for all users.",
      icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Impact Recognition",
      desc: "Reward volunteers with points and digital badges to promote civic engagement and appreciation of service.",
      icon: <HeartHandshake className="w-8 h-8 text-green-600" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <RoleNavbar role="organization" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-white px-6 md:px-20 py-20 pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Hero Content */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <CheckCircle size={16} />
                ServeSpot for Organizations
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Empower Communities with{" "}
                <span className="text-green-600">Micro-Volunteering</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                ServeSpot enables organizations, NGOs, and community leaders to
                post short volunteer opportunities, connect with local
                volunteers, and measure real-time impact — all in one powerful,
                secure platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/organization/dashboard")}
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Go to Dashboard
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button
                  onClick={() => navigate("/organization/dashboard")}
                  className="px-8 py-4 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Post Task
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/organization.png"
                    alt="ServeSpot Organization Collaboration"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How ServeSpot Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to post your first opportunity and start making
              a difference in your community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>

                <div
                  className={`p-8 rounded-2xl ${step.bg} text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full`}
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

      {/* Features Section */}
      <section className="py-20 px-6 md:px-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Community Impact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ServeSpot provides everything your organization needs to attract
              volunteers and manage community projects efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border-2 border-green-200 bg-white hover:shadow-lg transition-all duration-300 group hover:border-green-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow">
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

      {/* CTA */}
      <section className="py-20 px-6 md:px-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Transforming Your Volunteer Program
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join ServeSpot today — simplify your volunteer management, build
            stronger communities, and celebrate every act of kindness.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
