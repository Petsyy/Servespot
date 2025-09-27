import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled = false,
  loading = false,
  ...props
}) {
  const base =
    "px-6 py-3 rounded-lg font-medium transition duration-200 focus:outline-none flex items-center justify-center gap-2 cursor-pointer";

  const styles = {
    primary: `${base} bg-green-600 text-white hover:bg-green-700`,
    outline: `${base} border border-green-600 text-green-600 hover:bg-green-50`,
  };

  return (
    <button
      className={`${styles[variant]} ${className} ${
        (disabled || loading) ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
