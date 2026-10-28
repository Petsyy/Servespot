import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo,
}) {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const fallback =
      redirectTo ||
      (allowedRoles.length === 1 && allowedRoles[0] === "admin"
        ? "/admin/login"
        : allowedRoles.length === 1 && allowedRoles[0] === "organization"
        ? "/organization/login"
        : allowedRoles.length === 1 && allowedRoles[0] === "volunteer"
        ? "/volunteer/login"
        : "/volunteer/login");

    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const roleHome =
      role === "admin"
        ? "/admin/dashboard"
        : role === "organization"
        ? "/organization/dashboard"
        : role === "volunteer"
        ? "/volunteer/dashboard"
        : "/";
    return <Navigate to={roleHome} replace />;
  }

  return children;
}

