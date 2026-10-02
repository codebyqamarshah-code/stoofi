'use client';
import { useState } from 'react';
import { ChevronRight, Check, Palette } from 'lucide-react';

export default function ManageThemePage() {
  const [activeTheme, setActiveTheme] = useState('edulia');

  const themes = [
    {
      id: 'edulia',
      name: 'Edulia',
      tag: 'Active: Edulia',
      previewGradient: 'from-zinc-100 via-zinc-900 to-zinc-950',
      heroTitle: 'STOOFI PRO - EDULIA',
      heroSubtitle: 'Modern next-generation school management & student portal',
    },
    {
      id: 'default',
      name: 'Default',
      tag: 'Default Theme',
      previewGradient: 'from-zinc-900 via-zinc-800 to-zinc-900',
      heroTitle: 'STOOFI PRO',
      heroSubtitle: 'Managing various administrative tasks in one place is not easy, Stoofi pro is here to help you.',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">Theme Manager - {activeTheme}</span>
      </div>

      <h1 className="text-xl font-bold text-zinc-950 mb-6">Theme Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <div
              key={theme.id}
              className={`bg-white border ${
                isActive ? 'border-zinc-600 ring-1 ring-zinc-600/50' : 'border-zinc-200'
              } rounded-xl overflow-hidden flex flex-col shadow-xl transition-all`}
            >
              {/* Preview Banner */}
              <div className={`h-56 bg-gradient-to-br ${theme.previewGradient} p-6 flex flex-col justify-center items-center text-center relative border-b border-zinc-100`}>
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                  <span className="text-xs font-bold tracking-wider text-zinc-950 uppercase">Stoofi Pro</span>
                </div>
                <h3 className="text-2xl font-black text-zinc-950 tracking-wide mb-2 drop-shadow-md">
                  {theme.heroTitle}
                </h3>
                <p className="text-xs text-zinc-950 max-w-sm drop-shadow">
                  {theme.heroSubtitle}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 bg-zinc-800/80 text-zinc-950 rounded text-[11px] font-semibold">Notice Board</span>
                  <span className="px-3 py-1 bg-zinc-800/80 text-zinc-950 rounded text-[11px]">Admissions 2026</span>
                </div>
              </div>

              {/* Bottom Info & Action Bar */}
              <div className="p-4 bg-zinc-900 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-950">{theme.name}</h4>
                  <span className="text-xs text-zinc-400">Version 2.4.0</span>
                </div>

                {isActive ? (
                  <button
                    disabled
                    className="bg-zinc-800/20 border border-zinc-600/40 text-zinc-500 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-default"
                  >
                    <Check className="w-3.5 h-3.5" /> Active: {theme.name}
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTheme(theme.id)}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold shadow-xs text-xs font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
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

