'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(3, { message: 'Please enter a valid email address' }),
  password: z.string().min(4, { message: 'Password must be at least 4 characters' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@gmail.com',
      password: 'school@123',
    },
  });

  useEffect(() => {
    setMounted(true);
    useAuth.setState({ error: null });
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [mounted, isAuthenticated, router]);

  const onSubmit = async (values) => {
    const res = await login(values.email, values.password);
    if (res.success) {
      router.push('/dashboard');
    }
  };

  if (mounted && isAuthenticated) {
    return null;
  }

  return (
    <div
      style={{ backgroundColor: '#09090b', minHeight: '100vh' }}
      className="flex items-center justify-center p-4 relative overflow-hidden font-sans"
    >
      {/* Centered Login Card - Exact Match to Image 2 */}
      <div
        style={{
          backgroundColor: '#18181b',
          borderColor: '#27272a',
        }}
        className="w-full max-w-[440px] rounded-2xl p-8 sm:p-10 border shadow-2xl relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <img
              src="/logo dark.png"
              alt="eSkooly PRO"
              className="h-16 object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/eskooly light.png';
              }}
            />
          </div>
          <h2 style={{ color: '#ffffff' }} className="text-xl font-semibold tracking-tight text-center mt-2">
            Login Details
          </h2>
          <p style={{ color: '#a1a1aa' }} className="text-sm text-center mt-1">
            Sign In to your account to continue
          </p>
        </div>

        {/* Server / Auth Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              borderColor: 'rgba(244, 63, 94, 0.25)',
              color: '#fb7185',
            }}
            className="mb-5 rounded-lg border p-3 text-sm text-center font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div>
            <div
              style={{
                backgroundColor: '#09090b',
                borderColor: errors.email ? '#e11d48' : '#27272a',
              }}
              className="relative flex items-center rounded-xl border focus-within:!border-[#10b981] transition-colors"
            >
              <div className="pl-3.5 flex items-center pointer-events-none" style={{ color: '#10b981' }}>
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                placeholder="Enter Email Address"
                {...register('email')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                }}
                className="w-full px-3 py-3 text-sm focus:outline-none placeholder:text-[#52525b]"
              />
            </div>
            {errors.email && (
              <p style={{ color: '#fb7185' }} className="text-xs mt-1 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div
              style={{
                backgroundColor: '#09090b',
                borderColor: errors.password ? '#e11d48' : '#27272a',
              }}
              className="relative flex items-center rounded-xl border focus-within:!border-[#10b981] transition-colors"
            >
              <div className="pl-3.5 flex items-center pointer-events-none" style={{ color: '#10b981' }}>
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                {...register('password')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                }}
                className="w-full px-3 py-3 text-sm focus:outline-none placeholder:text-[#52525b]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: '#71717a' }}
                className="pr-3.5 hover:text-[#10b981] focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#fb7185' }} className="text-xs mt-1 ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me & Forget Password Row */}
          <div className="flex items-center justify-between text-sm pt-1 pb-2">
            <label
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div
                style={{
                  backgroundColor: rememberMe ? '#10b981' : '#09090b',
                  borderColor: rememberMe ? '#10b981' : '#3f3f46',
                }}
                className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
              >
                {rememberMe && <span className="text-white text-xs font-bold leading-none">✓</span>}
              </div>
              <span style={{ color: '#a1a1aa' }}>Remember Me</span>
            </label>
            <a
              href="#"
              style={{ color: '#10b981' }}
              className="hover:underline transition-colors"
            >
              Forget Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
            }}
            className="w-full h-12 rounded-xl text-sm font-bold tracking-wider hover:opacity-90 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center uppercase cursor-pointer"
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
}
