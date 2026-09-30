"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound, Lock, CheckCircle, ShieldAlert, Eye, EyeOff, Timer } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import api from "@/services/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // OTP Timer State
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let timer;
    if (step === 2 && otpTimer > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (step === 2 && otpTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email or username.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      if (res && res.success) {
        setSuccessMsg("Verification code sent to your email.");
        setStep(2);
        setOtpTimer(60);
      } else {
        setError(res?.message || "Failed to send reset code. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Resend Reset Code Handler
  const handleResendResetCode = async () => {
    if (!email.trim() || resending) return;
    setResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      if (res && res.success) {
        setSuccessMsg("A new 6-digit verification code has been sent.");
        setOtpTimer(60);
        setCanResend(false);
      } else {
        setError(res?.message || "Failed to resend code.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    if (otpTimer === 0) {
      setError("This verification code has expired. Please request a new code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/verify-reset-otp", { email: email.trim().toLowerCase(), otp: otp.trim() });
      if (res && res.success) {
        setSuccessMsg("Code verified! Please choose a new password.");
        setStep(3);
      } else {
        setError(res?.message || "Invalid or expired code.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword
      });
      if (res && res.success) {
        setStep(4);
      } else {
        setError(res?.message || "Failed to reset password.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Top Header Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <Link href="/login" className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 font-bold transition-colors text-sm">
          <ArrowLeft size={18} /> Back to Login
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[440px] bg-white dark:bg-zinc-900 rounded-2xl p-8 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
            <KeyRound size={28} />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Forgot Password?</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            {step === 1 && "Enter your registered email address to receive a verification code."}
            {step === 2 && `Enter the 6-digit code sent to ${email}`}
            {step === 3 && "Create a new strong password for your account."}
            {step === 4 && "Your password has been successfully updated!"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-start gap-3 text-rose-700 dark:text-rose-400 text-xs font-semibold animate-in fade-in duration-200">
            <ShieldAlert size={18} className="shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && step !== 4 && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3 text-emerald-800 dark:text-emerald-400 text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Registered Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@school.com"
                  className={inputClass}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? "SENDING CODE..." : "SEND VERIFICATION CODE"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className={`${inputClass} tracking-[6px] text-center text-lg font-bold`}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Timer & Resend */}
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium px-1">
              <span className="flex items-center gap-1.5">
                <Timer size={14} className={otpTimer > 0 ? "text-emerald-500 animate-pulse" : "text-rose-500"} />
                {otpTimer > 0 ? (
                  <>Code expires in <span className="font-bold text-zinc-800 dark:text-zinc-200">00:{String(otpTimer).padStart(2, '0')}</span></>
                ) : (
                  <span className="text-rose-500 font-bold">Code has expired</span>
                )}
              </span>

              <button
                type="button"
                disabled={!canResend || resending}
                onClick={handleResendResetCode}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline disabled:opacity-40 disabled:no-underline transition-all"
              >
                {resending ? "Resending..." : "Resend Code"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otpTimer === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? "VERIFYING..." : "VERIFY CODE"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors py-1"
            >
              Change email address
            </button>
          </form>
        )}

        {/* STEP 3: Reset Password Form */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={`${inputClass} pr-12`}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`${inputClass} pr-12`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? "SAVING..." : "UPDATE PASSWORD"}
            </button>
          </form>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={36} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Password Reset Complete!</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                Your password has been changed successfully. You can now log into your Stoofi ERP account.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] text-sm tracking-wide"
            >
              PROCEED TO LOGIN
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
