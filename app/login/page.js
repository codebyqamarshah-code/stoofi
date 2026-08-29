'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-emerald-200/40 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-emerald-200/40 blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl p-8 shadow-2xl border border-zinc-200 relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center justify-center space-y-3 mb-8">
          <img
            src="/eskooly light.png"
            alt="eSkooly PRO"
            className="h-20 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h2 className="text-xl font-bold tracking-tight text-zinc-800 mt-2">Login Details</h2>
          <p className="text-sm text-zinc-500">Sign In to your account to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 text-center">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        placeholder="Enter Email Address"
                        className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 pl-10 h-11 rounded-lg"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs ml-1" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Password"
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 pl-10 pr-10 h-11 rounded-lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-500 focus:outline-none transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs ml-1" />
                </FormItem>
              )}
            />

            {/* Remember Me & Forget Password */}
            <div className="flex items-center justify-between text-sm py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${rememberMe ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-zinc-300'}`}
                >
                  {rememberMe && <span className="text-white text-xs font-bold leading-none">✓</span>}
                </div>
                <span className="text-zinc-600">Remember Me</span>
              </label>
              <a href="#" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                Forget Password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-lg text-base font-semibold transition-all shadow-md hover:shadow-emerald-200 mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'SIGN IN'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
