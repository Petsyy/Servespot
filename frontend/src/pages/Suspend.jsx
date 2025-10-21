import React from "react";

export default function Suspended() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Account Suspended
      </h1>
      <p className="text-gray-700 max-w-md mb-6">
        Your volunteer account has been suspended by the administrator.<br />
        Please contact support if you think this is a mistake.
      </p>
      <button
        onClick={() => (window.location.href = "/login")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Return to Login
      </button>
    </div>
  );
}
