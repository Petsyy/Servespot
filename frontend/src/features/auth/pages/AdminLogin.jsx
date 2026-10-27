import React from "react";
import { LogIn, Shield } from "lucide-react";
import { useAdminLoginForm } from "@/features/auth/hooks/useAdminLoginForm";

const AdminLogin = () => {
  const { register, handleSubmit, errors, isSubmitting } = useAdminLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-white">
      <div className="w-full max-w-sm p-6 bg-white shadow-xl rounded-2xl border border-green-200">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Portal</h2>
          <p className="text-xs text-gray-600">
            Secure access to system administration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none transition-colors ${
                errors.email
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : "border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              }`}
              placeholder="admin@servespot.com"
              disabled={isSubmitting}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none transition-colors ${
                errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-500"
                  : "border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              }`}
              placeholder="Enter your password"
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Authenticating...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="w-4 h-4 mr-1.5" />
                Access Admin Panel
              </div>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-200 mt-4">
          <p className="text-xs text-gray-500">
            Restricted access • Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
