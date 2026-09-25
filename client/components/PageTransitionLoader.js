'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function PageTransitionLoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef(pathname);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger on route changes
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setLoading(true);
      setProgress(40);
      const timer1 = setTimeout(() => setProgress(85), 100);
      const timer2 = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 200);
      }, 350);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [pathname, searchParams]);

  // Intercept client link clicks for instant visual response
  useEffect(() => {
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (
        target && 
        target.href && 
        !target.target && 
        target.origin === window.location.origin &&
        !target.hasAttribute('download')
      ) {
        try {
          const url = new URL(target.href);
          if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
            setLoading(true);
            setProgress(35);
            setTimeout(() => setProgress(75), 150);
          }
        } catch (err) {}
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <>
      {/* Top Animated Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[999999] h-1.5 bg-zinc-900/40 overflow-hidden pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 shadow-[0_0_15px_rgba(99,102,241,1)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Corner Badge Indicator */}
      <div className="fixed top-4 right-4 z-[999999] pointer-events-none animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2.5 bg-zinc-900/95 text-white border border-indigo-500/40 px-3.5 py-2 rounded-full shadow-2xl backdrop-blur-md">
          <div className="h-3.5 w-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold tracking-wide">Loading...</span>
        </div>
      </div>
    </>
  );
}

export default function PageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <PageTransitionLoaderContent />
    </Suspense>
  );
}
