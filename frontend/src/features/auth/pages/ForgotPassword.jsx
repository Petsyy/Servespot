import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "@/features/auth/hooks/useAuthMutations";

export default function ForgotPassword() {
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
  const [resetToken, setResetToken] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setRole(location.pathname.includes("organization") ? "organization" : "volunteer");
  }, [location.pathname]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const loading = sendOtpMutation.isPending || verifyOtpMutation.isPending || resetPasswordMutation.isPending;

  const otpCode = otp.join("");

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(""));
      document.getElementById("otp-5")?.focus();
    }
  };

  const handleSendOtp = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!email.trim()) {
      return toast.warning("Please enter your email address.");
    }

    try {
      await sendOtpMutation.mutateAsync({ email: email.trim(), role });
      setStep(2);
      setCooldown(30);
      setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
    } catch (err) {
      console.debug("Failed to send OTP:", err?.message || err);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      return toast.warning("Please enter all 6 digits of the OTP code.");
    }

    try {
      const data = await verifyOtpMutation.mutateAsync({
        email: email.trim(),
        role,
        otp: otpCode,
      });

      if (data?.resetToken) {
        setResetToken(data.resetToken);
        setStep(3);
      }
    } catch (err) {
      console.debug("Failed to verify OTP:", err?.message || err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      return toast.warning("Please fill in both password fields.");
    }
    if (newPassword.length < 8) {
      return toast.warning("Password must be at least 8 characters long.");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (!resetToken) {
      return toast.error("Verification session expired. Please request a new OTP.");
    }

    try {
      await resetPasswordMutation.mutateAsync({
        email: email.trim(),
        role,
        newPassword,
        resetToken,
      });
      setTimeout(() => {
        navigate(role === "organization" ? "/organization/login" : "/volunteer/login");
      }, 1500);
    } catch (err) {
      console.debug("Failed to reset password:", err?.message || err);
    }
  };

  const handleSwitchRole = (newRole) => {
    if (newRole === role) return;
    setRole(newRole);
    setStep(1);
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setResetToken(null);
    navigate(newRole === "organization" ? "/organization/forgot-password" : "/volunteer/forgot-password");
  };

  const handleBackToLogin = () => {
    navigate(role === "organization" ? "/organization/login" : "/volunteer/login");
  };

  const isOrg = role === "organization";

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-white font-sans antialiased lg:overflow-hidden">
      {/* Left Hero Pane (Matching Volunteer & Organization Login) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-950 overflow-hidden flex-col justify-between p-10 xl:p-14 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: isOrg
              ? "url('/images/organization.png')"
              : "url('/images/volunteers.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-emerald-900/90 to-emerald-800/85" />

        <div className="relative z-10">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-white hover:text-emerald-200 transition-colors inline-block"
          >
            ServeSpot
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-5">
          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {isOrg ? (
              <>
                Secure Access Recovery. <br />
                Restore your organization workspace.
              </>
            ) : (
              <>
                Fast Account Recovery. <br />
                Get back to serving your community.
              </>
            )}
          </h1>

          <p className="text-emerald-100/90 text-sm xl:text-base leading-relaxed">
            {isOrg
              ? "Safeguard your organization's verified identity, active event postings, and community volunteer rosters."
              : "Regain quick access to your civic service records, unlocked badges, and upcoming community initiatives."}
          </p>

          <div className="pt-2 space-y-3.5 text-sm text-emerald-100/85">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Direct 6-digit one-time code sent to your verified inbox</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Time-limited encrypted reset token for account protection</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Seamless transition directly back to your dashboard</span>
            </div>
          </div>
        </div>

        <div className="relative z-10" />
      </div>

      {/* Right Recovery Pane */}
      <div className="flex-1 flex flex-col justify-between h-full px-6 py-8 sm:px-12 lg:px-16 xl:px-20 bg-white overflow-y-auto">
        {/* Top Header Bar: Back Link + Role Switcher */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-4">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-700 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to login</span>
          </button>

          <div className="inline-flex items-center p-1 bg-gray-100/90 rounded-xl border border-gray-200/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleSwitchRole("volunteer")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                !isOrg
                  ? "bg-white text-emerald-700 font-semibold shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Volunteer
            </button>
            <button
              type="button"
              onClick={() => handleSwitchRole("organization")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isOrg
                  ? "bg-white text-emerald-700 font-semibold shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Organization
            </button>
          </div>
        </div>

        {/* Center Recovery Container */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          {/* Progress Stepper */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { num: 1, label: "Email" },
              { num: 2, label: "Verification" },
              { num: 3, label: "New Password" },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.num
                        ? "bg-emerald-600 text-white shadow-xs"
                        : step > s.num
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs ${
                      step === s.num
                        ? "text-gray-900 font-semibold"
                        : step > s.num
                        ? "text-emerald-800 font-medium"
                        : "text-gray-400 font-medium"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 rounded transition-all ${
                      step > s.num ? "bg-emerald-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Forgot password?
              </h1>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                Enter the {isOrg ? "organization" : "volunteer"} email associated with your account. We'll send you a 6-digit one-time code to reset your password.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-5 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="email"
                      placeholder={isOrg ? "organization@servespot.org" : "volunteer@servespot.org"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Verify OTP code
              </h1>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                We've sent a 6-digit verification code to{" "}
                <strong className="text-gray-900 font-semibold">{email}</strong>.
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-emerald-700 hover:text-emerald-800 font-medium text-xs hover:underline cursor-pointer ml-1 inline-block"
                >
                  Change email
                </button>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2.5 text-center">
                    Enter the 6-digit code
                  </label>
                  <div
                    className="flex justify-center gap-2 sm:gap-2.5"
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        disabled={loading}
                        value={digit}
                        onChange={(e) => handleOtpChange(e, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        className="w-11 h-12 sm:w-12 sm:h-13 text-center text-xl font-bold bg-slate-50 focus:bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center text-xs text-gray-500 pt-1">
                    {cooldown > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-gray-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Resend code in <strong className="text-gray-600">{cooldown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
                      >
                        Didn't receive code? Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Reset your password
              </h1>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                Create a new password for your account. Make sure it contains at least 8 characters.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoFocus
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-2 max-w-md mx-auto w-full">
          ServeSpot &copy; {new Date().getFullYear()} • Secure account recovery
        </div>
      </div>
    </div>
  );
}
