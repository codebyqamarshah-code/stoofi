'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Save, 
  Settings, 
  Video, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  Globe, 
  KeyRound,
  Sliders,
  AlertCircle
} from 'lucide-react';

export default function JitsiSettingsPage() {
  const [settings, setSettings] = useState({
    serverUrl: 'https://meet.jit.si',
    appId: 'stoofi-jitsi-org-pk',
    secretKey: '••••••••••••••••••••••••••',
    enableJwt: false,
    resolution: '720p',
    muteAudioOnStart: true,
    muteVideoOnStart: false,
    enableWatermark: false,
    requireHostApproval: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionStatus({
        success: true,
        message: 'Connected to Jitsi Meet server successfully!'
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Jitsi Settings
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Configure Jitsi Meet integration parameters, domain URLs, and session defaults.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/jitsi" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Jitsi
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Settings</span>
        </div>
      </div>

      {/* Success Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>Jitsi configuration settings have been updated successfully.</span>
        </div>
      )}

      {/* Settings Form Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Server Connection */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <Server className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Server Credentials & Domain
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Jitsi Server URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="url"
                    required
                    value={settings.serverUrl}
                    onChange={(e) => setSettings({ ...settings, serverUrl: e.target.value })}
                    placeholder="https://meet.jit.si"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Use public server (https://meet.jit.si) or your own self-hosted Jitsi instance.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  App ID / Tenant ID
                </label>
                <input
                  type="text"
                  value={settings.appId}
                  onChange={(e) => setSettings({ ...settings, appId: e.target.value })}
                  placeholder="e.g. vpaas-magic-cookie-xxx"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Leave blank if utilizing community server without 8x8 JaaS tenant.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  App Secret / JWT Private Key
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    value={settings.secretKey}
                    onChange={(e) => setSettings({ ...settings, secretKey: e.target.value })}
                    placeholder="Enter private JWT secret..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Meeting Room Defaults */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <Sliders className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Meeting Room Configuration & Defaults
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Default Video Quality
                </label>
                <select
                  value={settings.resolution}
                  onChange={(e) => setSettings({ ...settings, resolution: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                >
                  <option value="480p">Standard Definition (480p - Low Bandwidth)</option>
                  <option value="720p">High Definition (720p HD - Recommended)</option>
                  <option value="1080p">Full HD (1080p FHD - High Bandwidth)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  JWT Authentication Mode
                </label>
                <select
                  value={settings.enableJwt ? 'true' : 'false'}
                  onChange={(e) => setSettings({ ...settings, enableJwt: e.target.value === 'true' })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-colors"
                >
                  <option value="false">Standard Open Room Access</option>
                  <option value="true">Secure Tokenized JWT Verification</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.muteAudioOnStart}
                  onChange={(e) => setSettings({ ...settings, muteAudioOnStart: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase">Mute Audio on Start</div>
                  <div className="text-[11px] text-zinc-500">Automatically mute participants upon joining.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.muteVideoOnStart}
                  onChange={(e) => setSettings({ ...settings, muteVideoOnStart: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase">Mute Video on Start</div>
                  <div className="text-[11px] text-zinc-500">Participants join with cameras turned off by default.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.requireHostApproval}
                  onChange={(e) => setSettings({ ...settings, requireHostApproval: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase">Require Host Approval (Lobby)</div>
                  <div className="text-[11px] text-zinc-500">Attendees wait in lobby until teacher or host admits them.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.enableWatermark}
                  onChange={(e) => setSettings({ ...settings, enableWatermark: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase">Show Stoofi Branding</div>
                  <div className="text-[11px] text-zinc-500">Render institutional watermark inside live classroom.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              {testingConnection ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  Testing Server...
                </>
              ) : (
                <>
                  <Server className="h-3.5 w-3.5" />
                  Test Server Connection
                </>
              )}
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-2.5 bg-[#009966] hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" />
              Save Jitsi Settings
            </button>
          </div>

          {connectionStatus && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>{connectionStatus.message}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
