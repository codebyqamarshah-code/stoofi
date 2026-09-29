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

  const showLoader = (duration = 1000) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsFading(false);
    setIsVisible(true);

    timeoutRef.current = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsFading(false);
      }, 400); // 400ms fade transition
    }, duration);
  };

  useEffect(() => {
    showLoader(1200);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      showLoader(1000);
    }
  }, [pathname, searchParams]);

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
            showLoader(1000);
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
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-xl transition-all duration-500 ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Center Animated Logo Container */}
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" style={{ width: '200px', height: '200px', transform: 'translate(-50%, -50%)', top: '50%', left: '50%' }} />

        {/* Swirl Spinners matching eSkooly Pro style but tailored for Stoofi */}
        <div className="absolute rounded-full border-y-2 border-emerald-500/80 animate-spin" style={{ width: '150px', height: '150px', animationDuration: '2s' }} />
        <div className="absolute rounded-full border-x-2 border-indigo-500/80 animate-spin" style={{ width: '130px', height: '130px', animationDuration: '3s', animationDirection: 'reverse' }} />

        {/* Stoofi Logo */}
        <div className="relative h-24 w-auto flex items-center justify-center p-2 z-10 drop-shadow-2xl">
          <img 
            src="/stoofi light.png" 
            alt="Stoofi Loader" 
            className="h-full object-contain animate-pulse"
            onError={(e) => {
              // Fallback just in case
              e.currentTarget.src = '/logo.png';
            }}
          />
        </div>

        {/* Professional Loading Text */}
        <div className="mt-12 flex flex-col items-center z-10">
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 tracking-[0.2em] uppercase">
            Loading
          </span>
          <div className="flex gap-1.5 mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
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
