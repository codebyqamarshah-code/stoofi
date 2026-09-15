'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 250);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-zinc-900 overflow-hidden pointer-events-none">
      <div className="h-full bg-emerald-500 animate-pulse w-full transform origin-left" style={{ animation: 'ping 1s infinite' }} />
    </div>
  );
}
