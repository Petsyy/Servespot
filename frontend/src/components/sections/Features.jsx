import React from "react";
import { Users, Calendar, Award } from "lucide-react";
import Card from "../ui/Card";

const features = [
  {
    title: "Easy Sign-Up",
    desc: "Join ServeSpot in minutes and start making a difference in your community right away.",
    icon: <Users className="h-6 w-6 text-blue-700" />,
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
  },
  {
    title: "Quick Volunteering",
    desc: "Find short, impactful tasks that fit your schedule and skill set. No long-term commitments needed.",
    icon: <Calendar className="h-6 w-6 text-green-700" />,
    bg: "bg-green-50",
    iconBg: "bg-green-100",
  },
  {
    title: "Earn Badges",
    desc: "Track your contributions and earn recognition with digital badges for every task you complete.",
    icon: <Award className="h-6 w-6 text-yellow-700" />,
    bg: "bg-yellow-50",
    iconBg: "bg-yellow-100",
  },
];

export default function Features() {
  return (
    <section className="py-16 px-6 md:px-20">
      <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
        How ServeSpot Empowers Communities
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 align gap-8 text-center">
        {features.map((f, i) => (
          <Card key={i} className={`${f.bg} flex flex-col items-start`}>
            <div
              className={`p-3 rounded-full ${f.iconBg} mb-4 flex items-center`}
            >
              {f.icon}
            </div>
            <h4 className="font-semibold text-lg mb-2">{f.title}</h4>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
