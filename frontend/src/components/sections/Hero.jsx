import React from "react";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between bg-green-50 px-10 md:px-20 py-16">
      <div className="max-w-xl">
        <h2 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Connect. Volunteer. Impact.
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          ServeSpot makes micro-volunteering easy and accessible. Discover
          local opportunities, lend a hand, and strengthen your community—one
          small task at a time.
        </p>
        <div className="flex space-x-4">
          <Button variant="primary">Find Opportunities</Button>
          <Button variant="outline">Post a Task</Button>
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
  );
}
