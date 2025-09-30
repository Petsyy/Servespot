import React, { useState } from "react";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState("volunteers");

  const steps = {
    volunteers: [
      {
        title: "Browse",
        desc: "Discover local volunteer opportunities that match your interests and schedule.",
        img: "/images/browse.jpg", // 👈 replace with your own image
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

  return (
    <section id="howitworks" className="py-16 px-6 md:px-20 bg-gray-50 text-center">
      <h3 className="text-3xl font-bold text-blue-900 mb-3">How It Works</h3>
      <p className="text-gray-600 mb-8">
        Getting started is simple, whether you're volunteering or organizing
      </p>

      {/* Tabs */}
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

      {/* Steps */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {steps[activeTab].map((step, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-white rounded-xl shadow hover:shadow-md transition"
          >
            {/* Step image */}
            <img
              src={step.img}
              alt={step.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />

            {/* Content */}
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white font-bold mb-4">
                {i + 1}
              </div>
              <h4 className="font-semibold text-lg text-blue-900 mb-2">
                {step.title}
              </h4>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
