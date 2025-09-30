import React from "react";
import Button from "../../ui/Button";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  return (
    <section
      id="hero"
      className="flex flex-col md:flex-row items-center justify-between bg-green-50 px-10 md:px-20 py-16 pt-32 scroll-mt-24"
    >
      {/* Left Content */}
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

      {/* Right Image */}
      <div className="mt-10 md:mt-0">
        <img
          src="/images/community-group.png"
          alt="Community volunteering"
          className="rounded-2xl shadow-lg w-[450px]"
        />
      </div>
    </section>
  );
}
