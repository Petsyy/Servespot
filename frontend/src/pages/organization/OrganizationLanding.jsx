import React from "react";
import { useNavigate } from "react-router-dom";
import RoleNavbar from "@/components/layout/RoleNavbar";
import { UserPlus, Clock, Award, ShieldCheck } from "lucide-react";
import Footer from "@/components/layout/Footer";

export default function OrganizationLanding() {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Create Task",
      desc: "Post opportunities with clear details to attract volunteers.",
      img: "/images/task.jpg",
    },
    {
      title: "Confirm Completion",
      desc: "Review completed tasks and approve contributions easily.",
      img: "/images/completion.jpg",
    },
    {
      title: "See Impact",
      desc: "Track your organization’s community impact and engagement.",
      img: "/images/impact.jpg",
    },
  ];

  const features = [
    {
      title: "Easy Setup",
      desc: "Register your organization and start posting tasks in minutes.",
      icon: <UserPlus className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      title: "Quick Recruitment",
      desc: "Reach volunteers quickly with targeted micro-volunteering posts.",
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      bg: "bg-orange-100",
    },
    {
      title: "Trusted Network",
      desc: "Work with verified volunteers who are eager to contribute.",
      icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      title: "Recognize Efforts",
      desc: "Acknowledge volunteers and build long-term partnerships.",
      icon: <Award className="w-8 h-8 text-orange-500" />,
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <RoleNavbar role="organization" />

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between bg-blue-50 px-10 md:px-20 py-20 pt-32">
        <div className="max-w-xl">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Engage <span className="text-blue-600">Volunteers</span> and Grow
            Impact
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Post micro-volunteering tasks, recruit passionate volunteers, and
            track your organization’s impact.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/organization/post-task")}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Post a Task
            </button>
            <button
              onClick={() => navigate("/organization/dashboard")}
              className="px-6 py-3 border border-blue-600 text-black rounded-md hover:bg-blue-100 cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
        <img
          src="/images/organization.png"
          alt="Organization team"
          className="rounded-2xl shadow-lg w-[450px] mt-10 md:mt-0"
        />
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 md:px-20 bg-gray-50 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-3">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6">
              <img
                src={s.img}
                alt={s.title}
                className="h-40 w-full object-cover rounded-md mb-4"
              />
              <h4 className="font-semibold text-lg text-blue-900">{s.title}</h4>
              <p className="text-gray-600 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-16 px-6 md:px-20 bg-green-100 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-3">
          Why Use ServeSpot?
        </h3>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow flex flex-col items-center"
            >
              <div className={`p-4 rounded-full mb-4 ${f.bg}`}>{f.icon}</div>
              <h4 className="font-semibold text-lg text-blue-900 mb-2">
                {f.title}
              </h4>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 md:px-20 bg-indigo-50 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Ready to Make an Impact?
        </h3>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Sign up today and start your journey of giving back. ServeSpot makes
          it easy to find, join, and track your volunteering efforts.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/opportunities")}
            className="px-6 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            Browse Opportunities
          </button>
          <button
            onClick={() => navigate("/role/signup")}
            className="px-6 py-2 rounded-md bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
          >
            Sign Up Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
