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
} from "lucide-react";
import RoleNavbar from "@/components/layout/RoleNavbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export default function VolunteerLanding() {
  const navigate = useNavigate();

  const steps = [
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
  ];

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
      <RoleNavbar role="volunteer" />

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between bg-green-50 px-10 md:px-20 py-20 pt-32">
        <div className="max-w-xl">
          <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Make an <span className="text-green-600">Impact</span> in Your
            Community
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Browse tasks, sign up, and earn badges while making a difference
            around you.
          </p>
          <Button variant="primary" onClick={() => navigate("/opportunities")}>
            Find Opportunities
          </Button>
        </div>
        <img
          src="/images/volunteers.jpg"
          alt="Volunteering"
          className="rounded-2xl shadow-lg w-[450px] mt-10 md:mt-0"
        />
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 md:px-20 bg-gray-50 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-3">How It Works</h3>
        <p className="text-gray-600 mb-8">
          Three easy steps to start volunteering
        </p>
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
          Why Choose ServeSpot?
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

      {/* Badges */}
      <section className="py-16 px-6 md:px-20 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-3">Earn Badges</h3>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {badges.map((b, i) => (
            <div
              key={i}
              className={`p-6 rounded-xl shadow ${b.color} flex flex-col items-center`}
            >
              <div className="p-4 rounded-full bg-white mb-4">{b.icon}</div>
              <h4 className="font-semibold text-lg">{b.title}</h4>
              <p className="text-gray-600 text-sm">{b.desc}</p>
              {b.earned && (
                <span className="px-3 py-1 mt-2 text-xs font-semibold bg-green-500 text-white rounded-full">
                  ✔ Earned
                </span>
              )}
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
