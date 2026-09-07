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
      previewGradient: 'from-emerald-950 via-zinc-900 to-zinc-950',
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
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-emerald-400">Theme Manager - {activeTheme}</span>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">Theme Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <div
              key={theme.id}
              className={`bg-zinc-900 border ${
                isActive ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-zinc-800'
              } rounded-xl overflow-hidden flex flex-col shadow-xl transition-all`}
            >
              {/* Preview Banner */}
              <div className={`h-56 bg-gradient-to-br ${theme.previewGradient} p-6 flex flex-col justify-center items-center text-center relative border-b border-zinc-800`}>
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold tracking-wider text-white uppercase">Stoofi Pro</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-wide mb-2 drop-shadow-md">
                  {theme.heroTitle}
                </h3>
                <p className="text-xs text-zinc-300 max-w-sm drop-shadow">
                  {theme.heroSubtitle}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 bg-emerald-600/80 text-white rounded text-[11px] font-semibold">Notice Board</span>
                  <span className="px-3 py-1 bg-zinc-800/80 text-zinc-300 rounded text-[11px]">Admissions 2026</span>
                </div>
              </div>

              {/* Bottom Info & Action Bar */}
              <div className="p-4 bg-zinc-900 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{theme.name}</h4>
                  <span className="text-xs text-zinc-400">Version 2.4.0</span>
                </div>

                {isActive ? (
                  <button
                    disabled
                    className="bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-default"
                  >
                    <Check className="w-3.5 h-3.5" /> Active: {theme.name}
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTheme(theme.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
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
