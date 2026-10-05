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
      className={`fixed inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm transition-opacity duration-400 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ zIndex: 999999 }}
    >
      {/* Spinner rings around logo */}
      <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
        {/* Outer spinning ring */}
        <div
          className="absolute rounded-full border-2 border-sky-400 border-dashed animate-spin"
          style={{ width: 140, height: 140, animationDuration: '3s' }}
        />
        {/* Inner spinning ring reverse */}
        <div
          className="absolute rounded-full border-2 border-[#0B4D9C]"
          style={{ width: 108, height: 108, animationDuration: '2s', animation: 'spin 2s linear infinite reverse' }}
        />
        {/* Logo in center */}
        <div className="relative flex items-center justify-center bg-white rounded-full shadow-lg" style={{ width: 80, height: 80 }}>
          <img
            src="/stoofi-icon.png"
            alt="Stoofi"
            className="object-contain"
            style={{ width: 52, height: 52 }}
            onError={(e) => { e.currentTarget.src = '/stoofi-icon.png'; }}
          />
        </div>
      </div>

      {/* Loading text */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="text-xs font-bold text-[#0B4D9C] tracking-[0.25em] uppercase">Loading</span>
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0B4D9C] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
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
