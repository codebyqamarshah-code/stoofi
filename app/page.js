'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (mounted) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [mounted, isAuthenticated, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <div className="relative flex flex-col items-center justify-center">
        <div className="h-16 w-16 relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 bg-zinc-900 rounded-full flex items-center justify-center">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          eSkooly<span className="text-[10px] font-bold text-zinc-900 bg-emerald-500 rounded px-1.5 py-0.5 ml-1 align-top inline-block">PRO</span>
        </h2>
        <p className="text-zinc-500 text-sm animate-pulse">Initializing application...</p>
      </div>
    </div>
  );
}
