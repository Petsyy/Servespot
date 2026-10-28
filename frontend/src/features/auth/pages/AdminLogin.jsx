import React from "react";
import { LogIn, Shield } from "lucide-react";
import { useAdminLoginForm } from "@/features/auth/hooks/useAdminLoginForm";

const AdminLogin = () => {
  const { register, handleSubmit, errors, isSubmitting } = useAdminLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm p-7 bg-white shadow-xl rounded-2xl border border-gray-200/80">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-300 font-bold text-lg flex items-center justify-center border border-emerald-800/60 shadow-xs">
              <Shield size={22} />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Admin Gateway</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Restricted access for system administrators
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className={`w-full px-3 py-2 text-xs border rounded-xl outline-none transition ${
                errors.email
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                  : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              }`}
              placeholder="admin@servespot.com"
              disabled={isSubmitting}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className={`w-full px-3 py-2 text-xs border rounded-xl outline-none transition ${
                errors.password
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                  : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              }`}
              placeholder="••••••••"
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl disabled:opacity-60 transition font-semibold text-xs shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-1.5">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                <span>Authenticating…</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <LogIn size={14} />
                <span>Access Admin Panel</span>
              </div>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100 mt-5">
          <p className="text-[11px] text-gray-400">
            ServeSpot Security Operations • Authorized Staff Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
