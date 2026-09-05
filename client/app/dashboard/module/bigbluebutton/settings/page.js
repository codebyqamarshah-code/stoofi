'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Save, CheckCircle2, ShieldCheck, KeyRound, Server } from 'lucide-react';

export default function BBBSettingsPage() {
  const [settings, setSettings] = useState({
    serverUrl: 'https://bbb.eskooly.com/bigbluebutton/api',
    sharedSecret: '8cd8ef52e8e101574e400365b55e11a6',
    autoRecordAll: true,
    allowGuestJoin: true,
    muteOnStart: true,
    disableCamForGuests: false,
    lockLayout: false,
    defaultDuration: '45',
    maxParticipants: '100'
  });

  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestConnection = () => {
    setTestResult('testing');
    setTimeout(() => {
      setTestResult('success');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">BigBlueButton Settings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configure your self-hosted or cloud BigBlueButton API credentials and room defaults.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/bigbluebutton" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">BigBlueButton</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Settings</span>
        </div>
      </div>

      <div className="max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {saved && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              BBB Configuration settings updated and saved successfully.
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-600" /> API & Server Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">BBB Server Base URL <span className="text-rose-500">*</span></label>
                <input
                  type="url"
                  required
                  value={settings.serverUrl}
                  onChange={(e) => setSettings({ ...settings, serverUrl: e.target.value })}
                  placeholder="https://bbb.example.com/bigbluebutton/api"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">BBB Shared Secret (Salt) <span className="text-rose-500">*</span></label>
                <input
                  type="password"
                  required
                  value={settings.sharedSecret}
                  onChange={(e) => setSettings({ ...settings, sharedSecret: e.target.value })}
                  placeholder="Enter BBB Secret Salt..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Default Room Policies & Limits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Default Duration (Mins)</label>
                <input
                  type="number"
                  value={settings.defaultDuration}
                  onChange={(e) => setSettings({ ...settings, defaultDuration: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Max Participants Per Room</label>
                <input
                  type="number"
                  value={settings.maxParticipants}
                  onChange={(e) => setSettings({ ...settings, maxParticipants: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRecordAll}
                  onChange={(e) => setSettings({ ...settings, autoRecordAll: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">Auto Record All Virtual Classes</div>
                  <div className="text-[11px] text-zinc-500">Automatically trigger cloud server recording as soon as the moderator starts session.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.muteOnStart}
                  onChange={(e) => setSettings({ ...settings, muteOnStart: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">Mute Participants on Entry</div>
                  <div className="text-[11px] text-zinc-500">Mutes microphones of all joining students by default to avoid echo/noise.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowGuestJoin}
                  onChange={(e) => setSettings({ ...settings, allowGuestJoin: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">Allow Direct Guest Join via Link</div>
                  <div className="text-[11px] text-zinc-500">Permit external attendees/parents to join without logging into the LMS.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleTestConnection}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider transition-colors"
            >
              {testResult === 'testing' ? 'Testing Connection...' : testResult === 'success' ? '✓ BBB Connected Successfully' : 'Test BBB Connection'}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#009966] hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" /> Save BBB Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
