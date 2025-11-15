import React, { useState } from "react";
import AccountStep from "@/pages/volunteer-pages/volunteer-registration/Step1-VolunteerAccount";
import ProfileStep from "@/pages/volunteer-pages/volunteer-registration/Step2-VolunteerCompleteProfile";
import StepIndicator from "@/components/ui/StepIndicator";

export default function VolunteerSignup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
    gender: "",
    contact: "",
    city: "",
    address: "",
    skills: [],
    interests: [],
    availability: "",
    bio: "",
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-10 px-4">
      {/* Step Indicator */}
      <StepIndicator currentStep={step} totalSteps={2} />

      {step === 1 && (
        <AccountStep
          formData={formData}
          updateField={updateField}
          onNext={nextStep}
        />
      )}

      {step === 2 && (
        <ProfileStep
          formData={formData}
          updateField={updateField}
          onPrev={prevStep}
        />
      )}
    </div>
  );
}
