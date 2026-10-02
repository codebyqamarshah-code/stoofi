"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, KeyRound, ShieldAlert, Timer } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StoofiLogo } from "@/components/StoofiLogo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import OtpInput from "@/components/OtpInput";

const loginSchema = z.object({
  email: z.string().min(3, { message: "Please enter a valid email address" }),
  password: z.string().min(4, { message: "Password must be at least 4 characters" }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [urlError, setUrlError] = useState('');

  // OTP State
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPass, setPendingPass] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  useEffect(() => {
    let timer;
    if (showOtpScreen && otpTimer > 0) {
      setCanResendOtp(false);
      timer = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (showOtpScreen && otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(timer);
  }, [showOtpScreen, otpTimer]);

  const handleResendOtpCode = async () => {
    if (!pendingEmail || resendingOtp) return;
    setResendingOtp(true);
    setOtpError("");
    setResendSuccess("");

    try {
      const res = await api.post("/auth/resend-otp", { email: pendingEmail });
      if (res && res.success) {
        setResendSuccess("A new 6-digit verification code has been sent.");
        setOtpTimer(60);
        setCanResendOtp(false);
      } else {
        setOtpError(res?.message || "Failed to resend code.");
      }
    } catch (e) {
      setOtpError(e?.response?.data?.message || e?.message || "Failed to resend verification code.");
    } finally {
      setResendingOtp(false);
    }
  };

  // Brute Force / Lockout State
  const [attemptsLeft, setAttemptsLeft] = useState(null);   // null = no info yet
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);    // seconds remaining
  const countdownRef = useRef(null);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err) setUrlError(err);
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockCountdown > 0) {
      countdownRef.current = setInterval(() => {
        setLockCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setIsLocked(false);
            setAttemptsLeft(5); // Reset after unlock
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownRef.current);
  }, [lockCountdown]);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const onSubmit = async (data) => {
    if (isLocked) return;

    const cleanEmail = data.email?.trim().toLowerCase();
    const cleanPass = data.password?.trim();

    setPendingEmail(cleanEmail);
    setPendingPass(cleanPass);

    const res = await login(cleanEmail, cleanPass, rememberMe);

    if (res?.success) {
      setAttemptsLeft(null);
      setIsLocked(false);
      if (res.requireOtp) {
        setShowOtpScreen(true);
        setOtpError("");
      } else {
        redirectUser(cleanEmail, res.user);
      }
    } else {
      // Parse error for brute-force info
      const msg = res?.message || error || "";

      if (res?.attemptsLeft !== undefined) {
        setAttemptsLeft(res.attemptsLeft);
      }

      // "Account temporarily locked... Try again in X minutes."
      const lockedMatch = msg.match(/Try again in (\d+) minutes?/i);
      if (lockedMatch || msg.toLowerCase().includes('locked')) {
        setIsLocked(true);
        const minutes = lockedMatch ? parseInt(lockedMatch[1]) : 15;
        setLockCountdown(minutes * 60);
        setAttemptsLeft(0);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 5) {
      setOtpError("Please enter a valid verification code");
      return;
    }

    setIsVerifying(true);
    setOtpError("");

    const res = await login(pendingEmail, pendingPass, rememberMe, null, otpCode);
    setIsVerifying(false);

    if (res?.success && !res.requireOtp) {
      redirectUser(pendingEmail, res.user);
    } else {
      setOtpError(error || "Invalid verification code. Please try again.");
    }
  };

  const redirectUser = (cleanEmail, user) => {
    const isSuperAdmin = cleanEmail === 'super@gmail.com' || user?.role === 'Super Admin';
    const isAdmin = cleanEmail === 'admin@gmail.com' || cleanEmail === 'admin@gamil.com' || user?.role === 'Admin';
    const isTeacher = user?.role === 'Teacher';

    if (isSuperAdmin || isAdmin) {
      window.location.href = '/dashboard';
    } else if (isTeacher) {
      window.location.href = '/dashboard/teacher';
    } else if (user?.role === 'Student') {
      window.location.href = '/dashboard/student';
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleRoleClick = (role) => {
    setValue("email", role.email);
    setValue("password", role.pass);
  };

  const demoRoles = [
    { id: "superadmin", label: "SUPER ADMIN", email: "super@gmail.com", pass: "school" },
    { id: "admin", label: "ADMIN", email: "admin@gmail.com", pass: "school" },
    { id: "teacher", label: "TEACHER", email: "teacher@gmail.com", pass: "123456" },
    { id: "parents", label: "PARENTS", email: "parent@gmail.com", pass: "123456" },
    { id: "accountant", label: "ACCOUNTANT", email: "accountant@gmail.com", pass: "123456" },
    { id: "student", label: "STUDENT", email: "student@gmail.com", pass: "123456" },
  ];

  if (!mounted) return null;

  const inputClass = "w-full pl-14 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white text-zinc-900 dark:text-zinc-900 placeholder-zinc-400 dark:placeholder-zinc-600";

  // ────────────────────────────────────────────────
  // OTP SCREEN
  // ────────────────────────────────────────────────
  if (showOtpScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button onClick={() => setShowOtpScreen(false)} className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold hover:opacity-80 transition-opacity text-sm">
            <ArrowLeft size={16} /> Back to Login
          </button>
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[440px] bg-white dark:bg-zinc-900 rounded-2xl p-8 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">2-Step Verification</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            We have sent a 6-digit verification code to <br/><span className="font-bold text-zinc-800 dark:text-zinc-200">{pendingEmail}</span>
          </p>

          <div className="mb-6">
            <OtpInput
              length={6}
              value={otpCode}
              onChange={(val) => setOtpCode(val)}
              disabled={isVerifying || otpTimer === 0}
            />
          </div>

          {/* Timer Display */}
          <div className="mb-6 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium px-1">
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
              disabled={!canResendOtp || resendingOtp}
              onClick={handleResendOtpCode}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline disabled:opacity-40 disabled:no-underline transition-all"
            >
              {resendingOtp ? "Resending..." : "Resend Code"}
            </button>
          </div>

          {otpError && (
            <div className="p-3 mb-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {otpError}
            </div>
          )}

          {resendSuccess && (
            <div className="p-3 mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              {resendSuccess}
            </div>
          )}

          <Button
            onClick={handleVerifyOtp}
            disabled={isVerifying || otpCode.length < 5 || otpTimer === 0}
            className="w-full py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {isVerifying ? "VERIFYING..." : "VERIFY & LOGIN"}
          </Button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // ACCOUNT LOCKED SCREEN
  // ────────────────────────────────────────────────
  if (isLocked && lockCountdown > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 transition-colors duration-300">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[440px] bg-white rounded-2xl p-8 sm:p-10 border border-rose-200 shadow-xl text-center">
          {/* Lock icon with pulsing ring */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-30"></div>
            <div className="relative w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-rose-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Account Locked</h2>
          <p className="text-sm text-zinc-500 mb-2">
            Too many failed login attempts detected.
          </p>
          <p className="text-xs text-zinc-400 mb-8">
            For security, your account has been temporarily locked. An alert has been sent to the administrator.
          </p>

          {/* Countdown Timer */}
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-3">
              <Timer className="w-4 h-4" />
              <span>Unlocks In</span>
            </div>
            <div className="text-5xl font-black text-rose-600 tracking-tight tabular-nums">
              {formatCountdown(lockCountdown)}
            </div>
            <p className="text-xs text-rose-400 mt-2">minutes : seconds</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-100 rounded-full h-1.5 mb-6 overflow-hidden">
            <div
              className="bg-rose-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${(lockCountdown / (15 * 60)) * 100}%` }}
            />
          </div>

          <p className="text-xs text-zinc-400">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // MAIN LOGIN SCREEN
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-white transition-colors duration-300">

      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-zinc-800 dark:text-zinc-900 font-semibold hover:opacity-80 transition-opacity text-sm">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div className="w-full max-w-[440px] bg-white dark:bg-zinc-50 rounded-2xl p-8 sm:p-10 border border-zinc-100 dark:border-zinc-200">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <StoofiLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-900">Welcome Back</h1>
          <p className="text-zinc-500 dark:text-zinc-500 mt-1 text-sm font-medium">Log in to your account</p>
        </div>

        {/* Error Message */}
        {(error || urlError) && (
          <div className="p-4 mb-4 rounded-xl bg-rose-50 dark:bg-rose-50 border border-rose-100 dark:border-rose-200 text-rose-600 dark:text-rose-600 text-sm font-medium flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error || urlError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
              </div>
              <input
                {...register("email")}
                type="text"
                placeholder="Email Address or Username"
                className={inputClass}
                disabled={isLocked}
              />
            </div>
            {errors.email && <p className="text-rose-500 text-xs font-medium pl-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
              </div>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={inputClass}
                disabled={isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-rose-500 text-xs font-medium pl-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border-2 border-zinc-300 peer-checked:bg-zinc-800 peer-checked:border-zinc-800 transition-all flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-600 group-hover:text-zinc-900 transition-colors">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm font-bold text-zinc-800 hover:text-zinc-600 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "SIGN IN"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
