import React from "react";
import { User } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default function VolunteerLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <LoginForm role="Volunteer" icon={User} />
    </div>
  );
}
