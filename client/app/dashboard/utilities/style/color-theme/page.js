'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Palette, ExternalLink, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const COLOR_SCHEMES = [
  {
    sl: 1,
    name: 'Pak Royal Light Palette',
    themeId: 'light',
    primary: '#084A86',
    secondary: '#009966',
    surface: '#FFFFFF',
    details: 'Royal Navy (#084A86) & Stoofi Emerald (#009966) on Crisp White (#FFFFFF) cards'
  },
  {
    sl: 2,
    name: 'Pak Royal Midnight Dark Palette',
    themeId: 'dark',
    primary: '#38BDF8',
    secondary: '#10B981',
    surface: '#090D16',
    details: 'Sky Blue (#38BDF8) & Emerald (#10B981) on Midnight Obsidian (#090D16 / #111827) surfaces'
  }
];

export default function ColorThemePage() {
  const [search, setSearch] = useState('');
  const [activeTheme, setActiveTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sync = () => {
        const saved = localStorage.getItem('stoofi_portal_theme') || 'light';
        setActiveTheme(saved === 'dark' ? 'dark' : 'light');
      };
      sync();
      window.addEventListener('stoofi_theme_changed', sync);
      return () => window.removeEventListener('stoofi_theme_changed', sync);
    }
  }, []);

  const filtered = COLOR_SCHEMES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Palette className="h-6 w-6 text-[#084A86]" />
            Color Theme Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Inspect active color tokens. Theme activation (Light / Dark Mode) is controlled exclusively in BackGround Settings.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">
            Utilities
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/utilities/style" className="hover:text-zinc-500 transition-colors">
            Style
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Color Theme</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-zinc-950">System Color Palettes</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="SEARCH"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-white border-zinc-200 text-xs text-zinc-950"
              />
            </div>
            <Link href="/dashboard/utilities/style/background-settings">
              <Button size="sm" className="h-9 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5">
                <span>Open BackGround Settings</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-4 py-3 font-semibold w-14">SL</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Color Swatches</th>
                <th className="px-4 py-3 font-semibold">Details</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((item) => {
                const isActive = activeTheme === item.themeId;
                return (
                  <tr key={item.sl} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-zinc-500">{item.sl}</td>
                    <td className="px-4 py-3.5 font-bold text-zinc-950 flex items-center gap-2">
                      {item.themeId === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      {item.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-5 w-5 rounded-full border border-zinc-300 inline-block"
                          style={{ backgroundColor: item.surface }}
                          title={`Surface: ${item.surface}`}
                        />
                        <span
                          className="h-5 w-5 rounded-full border border-zinc-300 inline-block"
                          style={{ backgroundColor: item.primary }}
                          title={`Primary: ${item.primary}`}
                        />
                        <span
                          className="h-5 w-5 rounded-full border border-zinc-300 inline-block"
                          style={{ backgroundColor: item.secondary }}
                          title={`Accent: ${item.secondary}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-600">{item.details}</td>
                    <td className="px-4 py-3.5">
                      {isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Active in Portal
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                          Standby
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href="/dashboard/utilities/style/background-settings"
                        className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                      >
                        Manage in BackGround Settings
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
