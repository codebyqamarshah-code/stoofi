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
    <div className="flex h-screen items-center justify-center bg-zinc-950 overflow-hidden">
      <div className="relative flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
        {/* Glowing ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full animate-pulse pointer-events-none"></div>
        
        <div className="mb-10 relative z-10 transform hover:scale-105 transition-transform duration-500">
          <img src="/eskooly light.png" alt="eSkooly PRO" className="h-20 sm:h-24 w-auto object-contain drop-shadow-2xl dark:hidden" />
          <img src="/logo dark.png" alt="eSkooly PRO" className="h-20 sm:h-24 w-auto object-contain drop-shadow-2xl hidden dark:block" />
        </div>
        
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500/80 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 rounded-full bg-emerald-500/80 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 w-2 rounded-full bg-emerald-500/80 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase">Initializing Application</p>
        </div>
      </div>
    </div>
  );
}
