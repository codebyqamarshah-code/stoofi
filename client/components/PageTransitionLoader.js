'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function PageTransitionLoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef(pathname);
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const timeoutRef = useRef(null);

  const showLoader = (duration = 750) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsFading(false);
    setIsVisible(true);

    timeoutRef.current = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsFading(false);
      }, 250);
    }, duration);
  };

  // Initial full page load / reload
  useEffect(() => {
    showLoader(800);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Trigger on every page route change (page shift)
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      showLoader(700);
    }
  }, [pathname, searchParams]);

  // Intercept internal link clicks for instant visual feedback on page shift
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
            showLoader(900);
          }
        } catch (err) {}
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-opacity duration-300 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Thin Gradient Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-600 animate-pulse" />

      {/* Center Animated Logo Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Outer subtle spinning ring */}
        <div className="absolute h-28 w-28 rounded-full border-2 border-dashed border-emerald-500/60 animate-spin" style={{ animationDuration: '4s' }} />
        
        {/* Glowing pulse aura */}
        <div className="absolute h-24 w-24 rounded-full bg-emerald-500/15 animate-ping" style={{ animationDuration: '2s' }} />

        {/* Center Card with Logo */}
        <div className="relative h-20 w-20 rounded-2xl bg-white shadow-2xl border border-zinc-200/80 p-2.5 flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
          <img 
            src="/loader.png" 
            alt="Stoofi Logo" 
            className="h-full w-full object-contain animate-pulse"
            onError={(e) => {
              e.currentTarget.src = '/stoofi light.png';
            }}
          />
        </div>

        {/* Animated Loading Text */}
        <div className="mt-5 flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs font-extrabold text-zinc-900 tracking-wider uppercase mt-2">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <PageTransitionLoaderContent />
    </Suspense>
  );
}
