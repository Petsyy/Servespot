import React from "react";

export default function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex justify-center items-center mb-8 space-x-4">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        return (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold
              ${step === currentStep ? "bg-green-600" : step < currentStep ? "bg-green-400" : "bg-gray-300"}
            `}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div className="w-10 h-1 bg-gray-300 mx-2">
                <div
                  className={`h-1 ${currentStep > step ? "bg-green-400" : "bg-gray-300"}`}
                ></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
