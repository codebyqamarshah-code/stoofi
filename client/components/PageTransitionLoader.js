'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(null);

  useEffect(() => {
    if (prevPath !== null && prevPath !== pathname) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 700);
      return () => clearTimeout(timer);
    }
    setPrevPath(pathname);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/70 backdrop-blur-sm transition-all duration-300" />
      <div className="relative flex flex-col items-center gap-4 z-10">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 border-[3px] border-zinc-200 dark:border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-[#009966] dark:border-emerald-500 rounded-full border-t-transparent animate-spin" />
          <div className="w-11 h-11 flex items-center justify-center">
            <img src="/stoofi light.png" alt="Stoofi" className="w-full h-full object-contain dark:hidden" />
            <img src="/stoofi dark.png" alt="Stoofi" className="w-full h-full object-contain hidden dark:block" />
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#009966] dark:text-emerald-400 uppercase animate-pulse">
          Loading...
        </span>
      </div>
    </div>
  );
}