"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

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
    // Removed auto-redirect logic so the user stays on the login page
    // until they actively submit the form or click a role button.
  }, []);

  const onSubmit = async (data) => {
    const cleanEmail = data.email?.trim().toLowerCase();
    const cleanPass = data.password?.trim();
    const res = await login(cleanEmail, cleanPass, rememberMe);
    if (res?.success) {
      const isSuperAdmin = cleanEmail === 'super@gmail.com';
      const isAdmin = cleanEmail === 'admin@gmail.com';

      if (isSuperAdmin) {
        window.location.href = '/dashboard';
      } else if (isAdmin) {
        window.location.href = '/dashboard/admin';
      } else {
        // Students, Teachers, Parents, Accountants — dashboard under construction
        window.location.href = '/coming-soon';
      }
    }
  };

  const handleRoleClick = (role) => {
    setValue("email", role.email);
    setValue("password", role.pass);
    // Auto-login removed for all roles as requested
    // Users must click SIGN IN manually
  };

  const demoRoles = [
    { id: "superadmin", label: "SUPER ADMIN", email: "super@gmail.com", pass: "school@123" },
    { id: "admin", label: "ADMIN", email: "admin@gmail.com", pass: "school@123" },
    { id: "teacher", label: "TEACHER", email: "teacher@gmail.com", pass: "123456" },
    { id: "parents", label: "PARENTS", email: "parent@gmail.com", pass: "123456" },
    { id: "accountant", label: "ACCOUNTANT", email: "accountant@gmail.com", pass: "123456" },
    { id: "student", label: "STUDENT", email: "student@gmail.com", pass: "123456" },
  ];

  if (!mounted) return null;

  const inputClass = "w-full pl-14 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:opacity-80 transition-opacity text-sm">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <ThemeToggle />
      </div>

      {/* Card - no shadow */}
      <div className="w-full max-w-[440px] bg-white dark:bg-zinc-900 rounded-2xl p-8 sm:p-10 border border-zinc-100 dark:border-zinc-800">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
           <img src="/stoofi light.png" alt="Stoofi PRO" className="h-24 w-auto object-contain dark:hidden" />
           <img src="/stoofi dark.png" alt="Stoofi PRO" className="h-24 w-auto object-contain hidden dark:block" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1.5">Login Details</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900 text-center">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-emerald-500" strokeWidth={1.5} />
                <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 ml-3"></div>
              </div>
              <input
                type="email"
                {...register("email")}
                placeholder="Enter Email Address"
                className={inputClass}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1 pl-1">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 text-emerald-500" strokeWidth={1.5} />
                <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 ml-3"></div>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter Password"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-emerald-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1 pl-1">{errors.password.message}</p>}
          </div>

          {/* Remember Me & Forget Password */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 accent-emerald-600"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Remember Me</span>
            </label>
            <a href="#" className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Forget Password?
            </a>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold tracking-wide transition-all disabled:opacity-70 flex items-center justify-center mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "SIGN IN"
            )}
          </button>
        </form>

        {/* Demo Roles */}
        <div className="mt-7 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4 font-medium text-center uppercase tracking-wider">Click any button below to auto login for demo</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {demoRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleClick(role)}
                disabled={isLoading}
                className="py-2.5 px-1 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-100 dark:border-emerald-900/40 transition-colors uppercase tracking-wider disabled:opacity-60"
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}
