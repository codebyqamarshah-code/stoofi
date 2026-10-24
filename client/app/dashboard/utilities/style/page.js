'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Palette, Monitor, ArrowRight } from 'lucide-react';

export default function StylePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
          <Layers className="h-6 w-6 text-[#084A86]" />
          Style &amp; Theme Management
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Configure portal background themes (Light Mode / Dark Mode) and inspect system color palettes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/utilities/style/background-settings"
          className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs hover:border-emerald-500 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950">BackGround Settings (Theme Switcher)</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Activate Default Light Theme or Midnight Dark Mode exclusively from here
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/dashboard/utilities/style/color-theme"
          className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs hover:border-emerald-500 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#084A86]">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950">Color Theme Palettes</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                View active institutional color tokens and surface swatches
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
