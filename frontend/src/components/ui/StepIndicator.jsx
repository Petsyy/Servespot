import React from "react";
import { Check } from "lucide-react";

export default function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex justify-center items-center mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div key={step} className="flex items-center">
            {/* Step circle */}
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold
                ${isActive ? "bg-green-600" : isCompleted ? "bg-green-500" : "bg-gray-300"}
              `}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : step}
            </div>

            {/* Connector line */}
            {step < totalSteps && (
              <div
                className={`w-10 h-1 mx-2 ${
                  currentStep > step ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
