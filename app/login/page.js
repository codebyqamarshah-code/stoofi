'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock, GraduationCap } from 'lucide-react';
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
    return null; // Don't flash the login form if we are about to redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Decorative background circles to mimic the reference but in our dark theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-emerald-500/10 dark:bg-emerald-900/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-emerald-500/10 dark:bg-emerald-900/10 blur-3xl" />

      <div className="w-full max-w-[420px] bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-xl dark:shadow-2xl border border-zinc-200 dark:border-zinc-800 relative z-10 transition-colors duration-300">
        
        {/* Logo Area */}
        <div className="flex flex-col items-center justify-center space-y-3 mb-8">
          <div className="flex items-center justify-center">
            <img src="/eskooly light.png" alt="eSkooly PRO" className="h-20 object-contain drop-shadow-xl dark:hidden" />
            <img src="/logo dark.png" alt="eSkooly PRO" className="h-20 object-contain drop-shadow-xl hidden dark:block" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-emerald-50 mt-4">Login Details</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign In to your account to continue
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-500 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        placeholder="Enter Email Address"
                        className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus-visible:ring-emerald-500 pl-10 h-11 rounded-lg transition-colors"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 dark:text-red-400 text-xs ml-1" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus-visible:ring-emerald-500 pl-10 pr-10 h-11 rounded-lg transition-colors"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500 focus:outline-none transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 dark:text-red-400 text-xs ml-1" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between text-sm py-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="rounded border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-emerald-600 focus:ring-emerald-600 focus:ring-offset-zinc-50 dark:focus:ring-offset-zinc-900 cursor-pointer h-4 w-4 transition-colors" />
                <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">Remember Me</span>
              </label>
              <a href="#" className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline transition-colors">
                Forget Password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-lg text-base font-semibold transition-all shadow-[0_0_15px_rgba(5,150,105,0.2)] dark:shadow-[0_0_15px_rgba(5,150,105,0.3)] hover:shadow-[0_0_20px_rgba(5,150,105,0.4)] mt-4"
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
