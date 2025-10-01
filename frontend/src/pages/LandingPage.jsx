import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Clock, Award, ShieldCheck, Star, Trophy, Medal } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("volunteers");

  // For HowItWorks steps
  const steps = {
    volunteers: [
      {
        title: "Browse",
        desc: "Discover local volunteer opportunities that match your interests and schedule.",
        img: "/images/browse.jpg",
      },
      {
        title: "Sign Up",
        desc: "Register for tasks that fit your availability and start making a difference.",
        img: "/images/signup.jpg",
      },
      {
        title: "Earn Recognition",
        desc: "Complete tasks, earn badges, and build your volunteer profile in the community.",
        img: "/images/recognition.jpg",
      },
    ],
    organizations: [
      {
        title: "Create Task",
        desc: "Post opportunities with clear details and requirements to attract volunteers.",
        img: "/images/task.jpg",
      },
      {
        title: "Confirm Completion",
        desc: "Review completed tasks and approve volunteer contributions easily.",
        img: "/images/completion.jpg",
      },
      {
        title: "See Impact",
        desc: "Track your organization’s community impact and volunteer engagement.",
        img: "/images/impact.jpg",
      },
    ],
  };

  // For WhyChoose
  const features = [
    {
      title: "Easy Sign-Up",
      desc: "Get started in minutes with our streamlined registration process.",
      icon: <UserPlus className="w-8 h-8 text-orange-500" />,
      bg: "bg-orange-100",
    },
    {
      title: "Quick Volunteering",
      desc: "Find and complete micro-volunteering tasks that fit your schedule.",
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      title: "Earn Badges",
      desc: "Get recognized for your contributions with our achievement system.",
      icon: <Award className="w-8 h-8 text-orange-500" />,
      bg: "bg-orange-100",
    },
    {
      title: "Verified Opportunities",
      desc: "All volunteer opportunities are verified by trusted organizations.",
      icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-100",
    },
  ];

  // For Badges
  const badges = [
    {
      title: "Starter",
      desc: "Complete your first volunteer task",
      icon: <Medal className="w-8 h-8 text-green-600" />,
      earned: true,
      color: "bg-green-100 border border-orange-400",
    },
    {
      title: "Helper",
      desc: "Complete 5 volunteer tasks",
      icon: <Award className="w-8 h-8 text-blue-600" />,
      earned: true,
      color: "bg-blue-100 border border-orange-400",
    },
    {
      title: "Community Champion",
      desc: "Complete 20 volunteer tasks",
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      earned: false,
      color: "bg-yellow-100",
    },
    {
      title: "Impact Leader",
      desc: "Complete 50 volunteer tasks",
      icon: <Star className="w-8 h-8 text-purple-600" />,
      earned: false,
      color: "bg-purple-100",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section
        id="hero"
        className="flex flex-col md:flex-row items-center justify-between bg-green-50 px-10 md:px-20 py-16 pt-32 scroll-mt-24"
      >
        <div className="max-w-xl">
          <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Connect. <span className="text-green-600"> Volunteer.</span> Impact.
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            ServeSpot makes micro-volunteering easy and accessible. Discover local
            opportunities, lend a hand, and strengthen your community—one small
            task at a time.
          </p>
          <div className="flex space-x-4">
            <Button variant="primary" onClick={() => navigate("/opportunities")}>
              Find Opportunities
            </Button>
            <Button variant="outline" onClick={() => navigate("/post-task")}>
              Post a Task
            </Button>
          </div>
        </div>
        <div className="mt-10 md:mt-0">
          <img
            src="/images/community-group.png"
            alt="Community volunteering"
            className="rounded-2xl shadow-lg w-[450px]"
          />
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-16 px-6 md:px-20 bg-gray-100 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-3">Choose Your Path</h3>
        <p className="text-gray-600 mb-12">
          Whether you want to help or need help, ServeSpot connects you with your
          community
        </p>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Volunteer Card */}
          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center border border-transparent hover:border-orange-500">
            <img
              src="/images/volunteers.jpg"
              alt="Volunteers"
              className="w-full h-full object-contain mb-6"
            />
            <h4 className="text-xl font-bold text-blue-900 mb-3">I'm a Volunteer</h4>
            <p className="text-gray-600 mb-4">
              Browse tasks, sign up for opportunities, and earn badges while making
              a difference in your community.
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
          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center border border-transparent hover:border-blue-900">
            <img
              src="/images/organization.png"
              alt="Organization team"
              className="w-full h-full object-cover mb-6 rounded-md"
            />
            <h4 className="text-xl font-bold text-blue-900 mb-3">We're an Organization</h4>
            <p className="text-gray-600 mb-4">
              Post tasks, recruit volunteers, and manage your community impact with
              our easy-to-use platform.
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

      {/* How It Works */}
      <section id="howitworks" className="py-16 px-6 md:px-20 bg-gray-50 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-3">How It Works</h3>
        <p className="text-gray-600 mb-8">
          Getting started is simple, whether you're volunteering or organizing
        </p>

        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-full bg-gray-200 overflow-hidden">
            <button
              onClick={() => setActiveTab("volunteers")}
              className={`px-6 py-2 text-sm font-medium transition ${
                activeTab === "volunteers"
                  ? "bg-green-500 text-white"
                  : "text-blue-900 hover:bg-gray-300"
              }`}
            >
              For Volunteers
            </button>
            <button
              onClick={() => setActiveTab("organizations")}
              className={`px-6 py-2 text-sm font-medium transition ${
                activeTab === "organizations"
                  ? "bg-green-500 text-white"
                  : "text-blue-900 hover:bg-gray-300"
              }`}
            >
              For Organizations
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps[activeTab].map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center bg-white rounded-xl shadow hover:shadow-md transition"
            >
              <img src={step.img} alt={step.title} className="w-full h-48 object-cover rounded-t-xl" />
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white font-bold mb-4">
                  {i + 1}
                </div>
                <h4 className="font-semibold text-lg text-blue-900 mb-2">{step.title}</h4>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose */}
      <section id="whychoose" className="py-16 px-6 md:px-20 bg-green-100 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-3">Why Choose ServeSpot?</h3>
        <p className="text-gray-600 mb-12">
          We make volunteering accessible, rewarding, and impactful for everyone
        </p>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow hover:shadow-md transition flex flex-col items-center text-center"
            >
              <div className={`p-4 rounded-full mb-4 flex items-center justify-center ${f.bg}`}>
                {f.icon}
              </div>
              <h4 className="font-semibold text-lg text-blue-900 mb-2">{f.title}</h4>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Badges */}
      <section id="badges" className="py-16 px-6 md:px-20 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-3">Earn Badges</h3>
        <p className="text-gray-600 mb-10">
          Earn recognition for your contributions and unlock achievements as you help your community
        </p>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {badges.map((badge, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center ${badge.color}`}
            >
              <div className="p-4 rounded-full bg-white mb-4">{badge.icon}</div>
              <h4 className="font-semibold text-lg text-blue-900 mb-2">{badge.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{badge.desc}</p>
              {badge.earned && (
                <span className="px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-full">
                  ✔ Earned
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-blue-900 text-white rounded-xl py-10 px-6 md:px-20 text-center">
          <h4 className="text-2xl font-bold mb-3">Ready to Start Earning?</h4>
          <p className="mb-6 text-gray-100">
            Join thousands of volunteers who are making a difference and earning recognition
          </p>
          <button className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-md font-semibold">
            Start Your Journey
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 md:px-20 bg-indigo-50 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Ready to Make an Impact?
        </h3>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Sign up today and start your journey of giving back. ServeSpot makes it easy 
          to find, join, and track your volunteering efforts.
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
