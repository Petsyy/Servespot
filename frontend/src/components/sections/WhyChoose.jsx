import React from "react";
import { UserPlus, Clock, Award, ShieldCheck } from "lucide-react";

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

export default function WhyChoose() {
  return (
    <section
  id="whychoose"
  className="py-16 px-6 md:px-20 bg-green-100 text-center"
>
      <h3 className="text-3xl font-bold text-blue-900 mb-3">
        Why Choose ServeSpot?
      </h3>
      <p className="text-gray-600 mb-12">
        We make volunteering accessible, rewarding, and impactful for everyone
      </p>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-xl shadow hover:shadow-md transition flex flex-col items-center text-center"
          >
            <div
              className={`p-4 rounded-full mb-4 flex items-center justify-center ${f.bg}`}
            >
              {f.icon}
            </div>
            <h4 className="font-semibold text-lg text-blue-900 mb-2">
              {f.title}
            </h4>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
