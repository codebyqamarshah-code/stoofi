'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Save, CheckCircle2, ShieldCheck, KeyRound, Globe } from 'lucide-react';

export default function GMeetSettingsPage() {
  const [settings, setSettings] = useState({
    workspaceDomain: 'school.stoofi.edu.pk',
    serviceAccountEmail: 'admin-gmeet@stoofi-workspace.iam.gserviceaccount.com',
    clientId: '782910482910-stoofi948271.apps.googleusercontent.com',
    autoAdmitInternal: true,
    requireHostToStart: true,
    enableHostManagement: true,
    enableQuickAccess: false,
    defaultMeetingDuration: '45'
  });

  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestAuth = () => {
    setTestResult('testing');
    setTimeout(() => {
      setTestResult('success');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Google Meet Settings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configure Google Workspace domain integration and default Google Meet space policies.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/gmeet" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Google Meet</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Settings</span>
        </div>
      </div>

      <div className="max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {saved && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Google Meet settings successfully saved.
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-600" /> Google Workspace Integration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Workspace Primary Domain <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={settings.workspaceDomain}
                  onChange={(e) => setSettings({ ...settings, workspaceDomain: e.target.value })}
                  placeholder="e.g. school.edu.pk"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Service Account Email <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  value={settings.serviceAccountEmail}
                  onChange={(e) => setSettings({ ...settings, serviceAccountEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Google OAuth Client ID</label>
                <input
                  type="text"
                  value={settings.clientId}
                  onChange={(e) => setSettings({ ...settings, clientId: e.target.value })}
                  placeholder="Enter OAuth 2.0 Client ID"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Space Security & Moderation Defaults
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoAdmitInternal}
                  onChange={(e) => setSettings({ ...settings, autoAdmitInternal: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">Auto Admit Domain Users</div>
                  <div className="text-[11px] text-zinc-500">Students and staff logged into their school Google Account enter room automatically.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireHostToStart}
                  onChange={(e) => setSettings({ ...settings, requireHostToStart: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">Require Host Before Students Join</div>
                  <div className="text-[11px] text-zinc-500">Students remain in waiting room until teacher / host enters the session.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableHostManagement}
                  onChange={(e) => setSettings({ ...settings, enableHostManagement: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">Enable Host Moderation Controls</div>
                  <div className="text-[11px] text-zinc-500">Allows hosts to mute all, disable chat, and prevent screen sharing by students.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleTestAuth}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider transition-colors"
            >
              {testResult === 'testing' ? 'Verifying...' : testResult === 'success' ? '✓ Google API Connected' : 'Test Google Auth'}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#009966] hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" /> Save GMeet Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
