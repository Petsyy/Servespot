import React from "react";
import { useState } from "react";
import StepIndicator from "@/components/ui/StepIndicator";
import OrganizationAccountStep from "@/pages/organization-pages/organization-registration/OrganizationAccount";
import OrganizationProfileStep from "@/pages/organization-pages/organization-registration/OrganizationProfile";

export default function OrganizationSignup() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1
    orgName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2
    contactPerson: "",
    contactNumber: "",
    city: "",
    address: "",
    orgType: "",
    description: "",
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl">
        <StepIndicator currentStep={step} totalSteps={2} />
      </div>

      {step === 1 && (
        <OrganizationAccountStep
          formData={formData}
          updateField={updateField}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <OrganizationProfileStep
          formData={formData}
          updateField={updateField}
          onPrev={() => setStep(1)}
          onSubmit={() => {
            // TODO: replace with real API call
          }}
        />
      )}
    </div>
  );
}
