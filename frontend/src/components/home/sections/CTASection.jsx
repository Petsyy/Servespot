import React from "react";
import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  return (
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
  );
}
