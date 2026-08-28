'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
} from 'lucide-react';

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
  email: z
    .string()
    .email({
      message: 'Please enter a valid email address',
    }),

  password: z
    .string()
    .min(4, {
      message: 'Password must be at least 4 characters',
    }),
});

export default function LoginPage() {
  const router = useRouter();

  const {
    login,
    isLoading,
    error,
    isAuthenticated,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [localError, setLocalError] = useState('');

  const form = useForm({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: '',
      password: '',
    },
  });

  // --------------------------------------------------
  // Mount
  // --------------------------------------------------

  useEffect(() => {
    setMounted(true);
  }, []);

  // --------------------------------------------------
  // Redirect after authentication
  // --------------------------------------------------

  useEffect(() => {
    if (!mounted) return;

    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [
    mounted,
    isAuthenticated,
    router,
  ]);

  // --------------------------------------------------
  // Login
  // --------------------------------------------------

  const onSubmit = async (values) => {
    setLocalError('');

    try {
      console.log('=================================');
      console.log('LOGIN STARTED');
      console.log('Email:', values.email);
      console.log('=================================');

      const response = await login(
        values.email.trim(),
        values.password
      );

      console.log('LOGIN RESPONSE:', response);

      if (response?.success) {
        router.replace('/dashboard');
        return;
      }

      if (response?.message) {
        setLocalError(response.message);
      } else if (response?.error) {
        setLocalError(response.error);
      } else {
        setLocalError(
          'Unable to login. Please check your email and password.'
        );
      }
    } catch (err) {
      console.error('LOGIN ERROR:', err);

      setLocalError(
        err?.message ||
          'Network error. Unable to connect to the server.'
      );
    }
  };

  // --------------------------------------------------
  // Prevent login page flash
  // --------------------------------------------------

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950" />
    );
  }

  if (isAuthenticated) {
    return null;
  }

  // --------------------------------------------------
  // Error message
  // --------------------------------------------------

  const displayError =
    localError ||
    error ||
    '';

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-4">

      {/* Background Effects */}

      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[50%] w-[40%] rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[50%] w-[40%] rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Login Card */}

      <div className="relative z-10 w-full max-w-[420px] rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">

        {/* Logo */}

        <div className="mb-8 flex flex-col items-center justify-center">

          <div className="mb-5 flex items-center justify-center">

            <img
              src="/logo dark.png"
              alt="eSkooly PRO"
              className="h-20 w-auto object-contain drop-shadow-xl"
            />

          </div>

          <h1 className="text-xl font-bold tracking-tight text-emerald-50">
            Login Details
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Sign In to your account to continue
          </p>

        </div>

        {/* Error */}

        {displayError && (
          <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
            {displayError}
          </div>
        )}

        {/* Form */}

        <Form {...form}>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* Email */}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>

                  <FormControl>

                    <div className="relative">

                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />

                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="Enter Email Address"
                        disabled={isLoading}
                        className="h-11 rounded-lg border-zinc-800 bg-zinc-950 pl-10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                        {...field}
                      />

                    </div>

                  </FormControl>

                  <FormMessage className="ml-1 text-xs text-red-400" />

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

                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />

                      <Input
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        autoComplete="current-password"
                        placeholder="Enter Password"
                        disabled={isLoading}
                        className="h-11 rounded-lg border-zinc-800 bg-zinc-950 pl-10 pr-10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                        {...field}
                      />

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>

                    </div>

                  </FormControl>

                  <FormMessage className="ml-1 text-xs text-red-400" />

                </FormItem>
              )}
            />

            {/* Remember / Forgot */}

            <div className="flex items-center justify-between py-1 text-sm">

              <label className="group flex cursor-pointer items-center gap-2">

                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-zinc-700 bg-zinc-950 text-emerald-600 focus:ring-emerald-600"
                />

                <span className="text-zinc-400 transition-colors group-hover:text-zinc-300">
                  Remember Me
                </span>

              </label>

              <button
                type="button"
                className="text-emerald-500 transition-colors hover:text-emerald-400 hover:underline"
              >
                Forgot Password?
              </button>

            </div>

            {/* Login Button */}

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-4 h-11 w-full rounded-lg bg-emerald-600 text-base font-semibold text-white shadow-[0_0_15px_rgba(5,150,105,0.3)] transition-all hover:bg-emerald-700 hover:shadow-[0_0_20px_rgba(5,150,105,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {isLoading ? (
                <span className="flex items-center gap-2">

                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Signing in...

                </span>
              ) : (
                'SIGN IN'
              )}

            </Button>

          </form>

        </Form>

      </div>

    </main>
  );
}