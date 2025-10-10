import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, KeyRound, ArrowLeft } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { sendOtp, verifyOtp, resetPassword } from "@/services/api";
import useApi from "@/hooks/useApi";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState("volunteer");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Resend OTP cooldown timer
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const { request, loading } = useApi();

  useEffect(() => {
    setRole(location.pathname.includes("organization") ? "organization" : "volunteer");
  }, [location.pathname]);

  const otpCode = otp.join("");

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.warning("Please enter your email.");
    await request(() => sendOtp({ email, role }), `OTP sent to ${email}`);
    setStep(2);
    setCooldown(30); // start 30s cooldown
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return toast.warning("Enter all 6 digits.");
    await request(() => verifyOtp({ email, role, otp: otpCode }), "OTP verified!");
    setStep(3);
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword)
      return toast.warning("Please fill all password fields.");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match.");

    await request(() => resetPassword({ email, role, newPassword }), "Password reset successfully!");
    setTimeout(() => {
      navigate(role === "volunteer" ? "/volunteer/login" : "/organization/login");
    }, 1500);
  };

  const handleBackToLogin = () => {
    navigate(role === "volunteer" ? "/volunteer/login" : "/organization/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-inter">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-2xl p-8 relative">

        <button
          onClick={handleBackToLogin}
          className="absolute left-5 top-5 text-green-700 hover:text-green-800 flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <h2 className="text-3xl font-bold text-center text-green-700 mb-2 mt-6">
          {step === 1
            ? "Forgot Password"
            : step === 2
            ? "Verify OTP"
            : "Reset Password"}
        </h2>

        <p className="text-center text-gray-600 mb-8 text-sm">
          {step === 1 &&
            `Enter your ${role} email to receive an OTP for password reset.`}
          {step === 2 &&
            `We’ve sent a 6-digit OTP to ${email}. Enter it below to verify your identity.`}
          {step === 3 &&
            "Set a new password for your account. Make sure both fields match."}
        </p>

        {/* STEP 1: Send OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg font-semibold text-white ${
                loading
                  ? "bg-green-500 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              } flex items-center justify-center gap-2 transition-all duration-200`}
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form
            onSubmit={handleVerifyOtp}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex justify-between w-full max-w-xs">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  disabled={loading}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, i)}
                  className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg font-semibold text-white ${
                  loading
                    ? "bg-green-500 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800"
                } flex items-center justify-center gap-2 transition-all duration-200`}
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Resend OTP Timer */}
              <button
                type="button"
                onClick={() => handleSendOtp({ preventDefault: () => {} })}
                disabled={cooldown > 0 || loading}
                className={`text-sm font-medium ${
                  cooldown > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-green-700 hover:underline"
                }`}
              >
                {cooldown > 0
                  ? `Resend OTP in ${cooldown}s`
                  : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 w-5 h-5" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg font-semibold text-white ${
                loading
                  ? "bg-green-500 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-800"
              } flex items-center justify-center gap-2 transition-all duration-200`}
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
