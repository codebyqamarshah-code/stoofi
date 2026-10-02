'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When route changes, complete the progress bar
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept all link clicks for instant visual loading feedback
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.href && !target.target && target.origin === window.location.origin) {
        const url = new URL(target.href);
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          setLoading(true);
          setProgress(30);
          setTimeout(() => setProgress(70), 150);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none">
      <div 
        className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(99,102,241,0.8)]"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute right-4 top-3 flex items-center gap-2 bg-zinc-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-zinc-200 shadow-xl backdrop-blur-md animate-pulse">
        <div className="h-3 w-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
}
