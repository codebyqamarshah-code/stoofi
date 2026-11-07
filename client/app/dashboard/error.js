'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertTriangle, Globe } from 'lucide-react';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error('Captured dashboard error:', error);
  }, [error]);

  const resetToEnglish = () => {
    try {
      localStorage.setItem('stoofi_lang', 'EN');
      const hostname = window.location.hostname;
      const hostParts = hostname.split('.');
      const domains = ['', hostname, `.${hostname}`];
      if (hostParts.length > 2) {
        domains.push(`.${hostParts.slice(-2).join('.')}`);
      }
      domains.forEach((d) => {
        const domainStr = d ? `; domain=${d}` : '';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainStr}`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${domainStr}`;
        document.cookie = `googtrans=; max-age=0; path=/${domainStr}`;
      });
    } catch (_) {}
    window.location.reload();
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-white rounded-2xl border border-zinc-200/80 m-4 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-lg font-bold text-zinc-900 mb-1.5">Section Display Error</h2>
      <p className="text-xs sm:text-sm text-zinc-500 max-w-md mb-6 leading-relaxed">
        An unexpected error occurred while updating this page. If this happened after changing the language, you can retry or reset back to English.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <button
          onClick={resetToEnglish}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-lg hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
        >
          <Globe className="w-4 h-4 text-zinc-600" />
          Reset to English & Reload
        </button>
      </div>
    </div>
  );
}
