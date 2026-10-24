'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCmsSection, mutateCmsSection } from '@/lib/frontendCmsApi';
import { ChevronRight, Check, Palette, ExternalLink } from 'lucide-react';

export default function ManageThemePage() {
  const [activeTheme, setActiveTheme] = useState('edulia');
  const [saving, setSaving] = useState(false);

  const themes = [
    {
      id: 'edulia',
      name: 'Edulia Modern Campus',
      previewGradient: 'from-emerald-900 via-teal-900 to-zinc-900',
      heroTitle: 'STOOFI PRO — EDULIA',
      heroSubtitle: 'Modern next-generation school management & interactive student portal'
    },
    {
      id: 'default',
      name: 'Classic Institutional',
      previewGradient: 'from-slate-900 via-indigo-950 to-zinc-900',
      heroTitle: 'STOOFI PRO — CLASSIC',
      heroSubtitle: 'Comprehensive academic, examination, and campus ERP suite for institutions.'
    }
  ];

  useEffect(() => {
    (async () => {
      const data = await fetchCmsSection('manageTheme', { activeTheme: 'edulia' });
      if (data?.activeTheme) setActiveTheme(data.activeTheme);
    })();
  }, []);

  const handleActivate = async (themeId) => {
    setActiveTheme(themeId);
    setSaving(true);
    await mutateCmsSection('manageTheme', 'saveObject', {
      data: { activeTheme: themeId, primaryColor: themeId === 'edulia' ? '#009966' : '#084A86' }
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">Theme Manager - {activeTheme}</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#009966]" /> Frontend Theme Manager
          </h1>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Preview Website
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <div
              key={theme.id}
              className={`bg-white border-2 ${
                isActive ? 'border-[#009966] ring-2 ring-[#009966]/20' : 'border-zinc-200'
              } rounded-2xl overflow-hidden flex flex-col shadow-sm transition-all`}
            >
              {/* Preview Banner */}
              <div
                className={`h-60 bg-gradient-to-br ${theme.previewGradient} p-6 flex flex-col justify-center items-center text-center relative`}
              >
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-bold tracking-wider text-white uppercase">Stoofi Pro</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-wide mb-2">{theme.heroTitle}</h3>
                <p className="text-xs text-zinc-200 max-w-sm">{theme.heroSubtitle}</p>
                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/15 text-white rounded-lg text-[11px] font-semibold backdrop-blur-xs">
                    Notice Board
                  </span>
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[11px] font-bold">
                    Admissions 2026
                  </span>
                </div>
              </div>

              {/* Bottom Info & Action Bar */}
              <div className="p-5 bg-white flex items-center justify-between border-t border-zinc-100">
                <div>
                  <h4 className="text-base font-black text-zinc-950">{theme.name}</h4>
                  <span className="text-xs text-zinc-500 font-medium">Version 2.4.0 • Responsive & SEO Ready</span>
                </div>

                {isActive ? (
                  <button
                    disabled
                    className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-default"
                  >
                    <Check className="w-4 h-4" /> Active Theme
                  </button>
                ) : (
                  <button
                    disabled={saving}
                    onClick={() => handleActivate(theme.id)}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Make Active
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
