'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Search,
  Sun,
  Moon,
  CheckCircle2,
  Palette,
  Sparkles,
  Monitor,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PORTAL_THEMES = [
  {
    id: 'light',
    sl: 1,
    name: 'Pak Royal Default Light Theme',
    modeLabel: 'Light Mode (Default)',
    type: 'Institutional Light Surface',
    details: 'Clean white surfaces (#FFFFFF), Royal Navy headings (#084A86), and Stoofi Emerald primary buttons (#009966).',
    bgPreview: '#FFFFFF',
    sidebarPreview: '#F8FAFC',
    cardPreview: '#FFFFFF',
    accentPreview: '#084A86',
    btnPreview: '#009966',
    textPreview: '#09090B',
    isDefault: true
  },
  {
    id: 'dark',
    sl: 2,
    name: 'Pak Royal Midnight Dark Theme',
    modeLabel: 'Dark Mode',
    type: 'Executive Dark Surface',
    details: 'Deep obsidian & midnight slate surfaces (#090D16 / #111827), crisp light typography (#F8FAFC), and emerald highlights.',
    bgPreview: '#090D16',
    sidebarPreview: '#0B1120',
    cardPreview: '#111827',
    accentPreview: '#38BDF8',
    btnPreview: '#10B981',
    textPreview: '#F8FAFC',
    isDefault: false
  }
];

export default function BackGroundSettingsPage() {
  const [search, setSearch] = useState('');
  const [activeTheme, setActiveTheme] = useState('light');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stoofi_portal_theme') || 'light';
      setActiveTheme(saved === 'dark' ? 'dark' : 'light');
    }
  }, []);

  const handleActivateTheme = (themeId) => {
    const normalized = themeId === 'dark' ? 'dark' : 'light';
    setActiveTheme(normalized);

    if (typeof window !== 'undefined') {
      localStorage.setItem('stoofi_portal_theme', normalized);
      document.documentElement.classList.toggle('dark', normalized === 'dark');
      document.documentElement.setAttribute('data-portal-theme', normalized);
      window.dispatchEvent(new CustomEvent('stoofi_theme_changed', { detail: { theme: normalized } }));
    }

    const selectedObj = PORTAL_THEMES.find((t) => t.id === normalized);
    setToastMsg(`${selectedObj?.name || 'Theme'} activated successfully!`);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const filteredThemes = PORTAL_THEMES.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.modeLabel.toLowerCase().includes(search.toLowerCase()) ||
      t.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2.5">
            <Palette className="h-6 w-6 text-[#084A86]" />
            BackGround &amp; Theme Settings
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Switch and manage the active portal theme (Light Mode or Dark Mode) exclusively from this control panel
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
          <span className="text-zinc-950 font-bold">BackGround Settings</span>
        </div>
      </div>

      {/* Exclusive Control Notice Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-950">
              Exclusive Portal Theme Controller
            </h3>
            <p className="text-xs text-zinc-500">
              Dark Mode and Light Mode can only be activated from this page. Currently active:{' '}
              <strong className="text-emerald-600 uppercase">
                {activeTheme === 'dark' ? 'Pak Royal Midnight Dark Theme (Dark Mode)' : 'Pak Royal Default Light Theme (Light Mode)'}
              </strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            {activeTheme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
          </span>
        </div>
      </div>

      {/* Visual Theme Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PORTAL_THEMES.map((theme) => {
          const isCurrent = activeTheme === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => handleActivateTheme(theme.id)}
              className={`bg-white border-2 rounded-2xl p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <div>
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                        theme.id === 'dark'
                          ? 'bg-slate-900 text-amber-400 border-slate-700'
                          : 'bg-sky-50 text-[#084A86] border-sky-200'
                      }`}
                    >
                      {theme.id === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-950">{theme.name}</h3>
                      </div>
                      <p className="text-xs font-semibold text-zinc-500">{theme.modeLabel}</p>
                    </div>
                  </div>

                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Live Mini UI Preview Mockup (Protected from Dark Mode override via .theme-preview-box) */}
                <div
                  className="theme-preview-box rounded-xl border p-3 mb-4 shadow-inner"
                  style={{
                    backgroundColor: theme.bgPreview,
                    borderColor: theme.id === 'dark' ? '#1e293b' : '#e4e4e7'
                  }}
                >
                  <div className="flex gap-2.5 h-28">
                    {/* Mini Sidebar */}
                    <div
                      className="w-1/4 rounded-lg p-2 flex flex-col justify-between border"
                      style={{
                        backgroundColor: theme.sidebarPreview,
                        borderColor: theme.id === 'dark' ? '#1e293b' : '#e4e4e7'
                      }}
                    >
                      <div className="space-y-1.5">
                        <div
                          className="h-2.5 w-12 rounded"
                          style={{ backgroundColor: theme.accentPreview }}
                        />
                        <div
                          className="h-2 w-full rounded opacity-60"
                          style={{ backgroundColor: theme.btnPreview }}
                        />
                        <div
                          className="h-2 w-4/5 rounded opacity-30"
                          style={{ backgroundColor: theme.textPreview }}
                        />
                        <div
                          className="h-2 w-3/4 rounded opacity-30"
                          style={{ backgroundColor: theme.textPreview }}
                        />
                      </div>
                      <div
                        className="h-2 w-10 rounded opacity-40"
                        style={{ backgroundColor: theme.textPreview }}
                      />
                    </div>

                    {/* Mini Dashboard Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Mini Topbar */}
                      <div
                        className="h-6 rounded-lg px-2.5 flex items-center justify-between border"
                        style={{
                          backgroundColor: theme.cardPreview,
                          borderColor: theme.id === 'dark' ? '#1e293b' : '#e4e4e7'
                        }}
                      >
                        <div
                          className="h-2 w-20 rounded opacity-50"
                          style={{ backgroundColor: theme.textPreview }}
                        />
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-3 w-8 rounded"
                            style={{ backgroundColor: theme.btnPreview }}
                          />
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: theme.accentPreview }}
                          />
                        </div>
                      </div>

                      {/* Mini Cards Grid */}
                      <div className="grid grid-cols-3 gap-2 flex-1 mt-2">
                        {[1, 2, 3].map((n) => (
                          <div
                            key={n}
                            className="rounded-lg p-2 border flex flex-col justify-between"
                            style={{
                              backgroundColor: theme.cardPreview,
                              borderColor: theme.id === 'dark' ? '#1e293b' : '#e4e4e7'
                            }}
                          >
                            <div
                              className="h-2 w-8 rounded opacity-40"
                              style={{ backgroundColor: theme.textPreview }}
                            />
                            <div
                              className="h-3 w-12 rounded font-bold"
                              style={{ backgroundColor: n === 1 ? theme.btnPreview : theme.accentPreview }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed mb-4">{theme.details}</p>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-4 w-4 rounded-full border border-zinc-300"
                    style={{ backgroundColor: theme.bgPreview }}
                    title={`Background: ${theme.bgPreview}`}
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-zinc-300"
                    style={{ backgroundColor: theme.cardPreview }}
                    title={`Card: ${theme.cardPreview}`}
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-zinc-300"
                    style={{ backgroundColor: theme.btnPreview }}
                    title={`Primary: ${theme.btnPreview}`}
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-zinc-300"
                    style={{ backgroundColor: theme.accentPreview }}
                    title={`Accent: ${theme.accentPreview}`}
                  />
                </div>

                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivateTheme(theme.id);
                  }}
                  className={`h-9 px-4 text-xs font-bold rounded-xl cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                  }`}
                >
                  {isCurrent ? 'Active Theme' : `Activate ${theme.modeLabel}`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BackGround & Theme Settings Overview Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <Monitor className="h-4 w-4 text-[#084A86]" />
              BackGround Settings &amp; Theme Directory
            </h2>
            <p className="text-xs text-zinc-500">
              Select which theme is active for the college portal
            </p>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search theme..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white border-zinc-200 text-xs text-zinc-950"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-4 py-3 font-semibold w-14">SL</th>
                <th className="px-4 py-3 font-semibold">Theme Name</th>
                <th className="px-4 py-3 font-semibold">Mode</th>
                <th className="px-4 py-3 font-semibold">Details</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredThemes.map((t) => {
                const isCurrent = activeTheme === t.id;
                return (
                  <tr key={t.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-zinc-500">{t.sl}</td>
                    <td className="px-4 py-3.5 font-bold text-zinc-950">{t.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
                        {t.id === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                        {t.modeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-600 max-w-md">{t.details}</td>
                    <td className="px-4 py-3.5">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                          Standby
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleActivateTheme(t.id)}
                        className={`h-8 px-3.5 text-xs font-bold rounded-lg cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                        }`}
                      >
                        {isCurrent ? 'Activated' : 'Set Active'}
                      </Button>
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
