'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [loading, setLoading] = useState(true); // start true for initial load

  useEffect(() => {
    // Initial page load - show loader then hide
    const initTimer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(initTimer);
  }, []); // only on mount

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 900);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md" />
      <div className="relative flex flex-col items-center gap-5 z-10">
        <div className="relative flex items-center justify-center w-28 h-28">
          <div className="absolute inset-0 border-[3px] border-zinc-200 dark:border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-zinc-950 dark:border-emerald-400 rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-1 border-[2px] border-dashed border-zinc-300 dark:border-emerald-900 rounded-full animate-spin" style={{animationDirection:'reverse', animationDuration:'3s'}} />
          <div className="w-14 h-14 flex items-center justify-center rounded-full overflow-hidden bg-white dark:bg-zinc-950 shadow">
            <img src="/logo dark(2).png" alt="Stoofi" className="w-full h-full object-contain dark:hidden p-1" />
            <img src="/stoofi dark.png" alt="Stoofi" className="w-full h-full object-contain hidden dark:block p-1" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold tracking-[0.3em] text-zinc-950 dark:text-emerald-400 uppercase animate-pulse">
            Loading...
          </span>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-bounce" style={{animationDelay:'0ms'}} />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-bounce" style={{animationDelay:'150ms'}} />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-bounce" style={{animationDelay:'300ms'}} />
          </div>
        </div>
      </div>
    </div>
  );
}
