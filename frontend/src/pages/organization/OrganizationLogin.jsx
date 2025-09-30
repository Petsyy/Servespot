import React from "react";
import { Building2 } from "lucide-react";
import LoginForm from "../../components/auth/LoginForm";

export default function OrganizationLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <LoginForm role="Organization" icon={Building2} />
    </div>
  );
}
