import React from "react";
import { Award, Star, Trophy, Medal } from "lucide-react";

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

export default function Recognition() {
  return (
    <section id="badges" className="py-16 px-6 md:px-20 text-center">
      {/* Heading */}
      <h3 className="text-3xl font-bold text-blue-900 mb-3">Earn Badges</h3>
      <p className="text-gray-600 mb-10">
        Earn recognition for your contributions and unlock achievements as you help your community
      </p>

      {/* Badge Cards */}
      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
        {badges.map((badge, i) => (
          <div
            key={i}
            className={`p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center ${badge.color}`}
          >
            <div className="p-4 rounded-full bg-white mb-4">{badge.icon}</div>
            <h4 className="font-semibold text-lg text-blue-900 mb-2">
              {badge.title}
            </h4>
            <p className="text-gray-600 text-sm mb-3">{badge.desc}</p>

            {badge.earned && (
              <span className="px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-full">
                ✔ Earned
              </span>
            )}
          </div>
        ))}
      </div>

      {/* CTA Banner */}
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
  );
}
