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
  Sliders
} from 'lucide-react';

export default function VirtualClassSettingsPage() {
  const [settings, setSettings] = useState({
    apiKey: 'zm_oauth_live_981273948123',
    apiSecret: '••••••••••••••••••••••••••••••••',
    accountId: 'act_stoofi_zoom_pro_pk',
    webhookSecret: '••••••••••••••••••••••',
    hostVideo: true,
    participantVideo: true,
    joinBeforeHost: false,
    waitingRoom: true,
    autoRecording: 'none'
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
        message: 'Successfully authenticated with Zoom Server-to-Server OAuth API!'
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">
            Virtual Class Settings
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">
            Configure Zoom API credentials, OAuth tokens, and global meeting room policies.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/virtual-class" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">
            Virtual Class
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">Settings</span>
        </div>
      </div>

      {/* Success Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-100 border border-zinc-300 dark:border-zinc-200 text-zinc-900 dark:text-zinc-900 flex items-center gap-3 text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-zinc-800 flex-shrink-0" />
          <span>Zoom Virtual Class configuration settings have been updated successfully.</span>
        </div>
      )}

      {/* Settings Form Card */}
      <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Zoom OAuth Credentials */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-zinc-100 dark:border-zinc-200">
              <KeyRound className="h-5 w-5 text-zinc-800 dark:text-zinc-900" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">
                Zoom Server-to-Server OAuth Credentials
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                  Client ID / API Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="Enter Zoom OAuth Client ID..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                  Client Secret <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={settings.apiSecret}
                  onChange={(e) => setSettings({ ...settings, apiSecret: e.target.value })}
                  placeholder="Enter Zoom OAuth Client Secret..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                  Account ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.accountId}
                  onChange={(e) => setSettings({ ...settings, accountId: e.target.value })}
                  placeholder="Enter Zoom Account ID..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                  Webhook Secret Token
                </label>
                <input
                  type="password"
                  value={settings.webhookSecret}
                  onChange={(e) => setSettings({ ...settings, webhookSecret: e.target.value })}
                  placeholder="Enter Webhook secret token..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Meeting Room Defaults */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-zinc-100 dark:border-zinc-200">
              <Sliders className="h-5 w-5 text-zinc-800 dark:text-zinc-900" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">
                Meeting Room Configuration & Policies
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                  Auto Cloud Recording
                </label>
                <select
                  value={settings.autoRecording}
                  onChange={(e) => setSettings({ ...settings, autoRecording: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                >
                  <option value="none">Disabled (No auto-record)</option>
                  <option value="local">Record on Local Machine</option>
                  <option value="cloud">Record to Zoom Cloud Storage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                  Audio Type Policy
                </label>
                <select
                  defaultValue="both"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                >
                  <option value="both">Both Computer Audio and Telephony</option>
                  <option value="computer">Computer Audio Only (VoIP)</option>
                  <option value="telephony">Telephony Dial-in Only</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.hostVideo}
                  onChange={(e) => setSettings({ ...settings, hostVideo: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-600"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-800 uppercase">Host Video On</div>
                  <div className="text-[11px] text-zinc-500">Start video automatically when instructor joins.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.participantVideo}
                  onChange={(e) => setSettings({ ...settings, participantVideo: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-600"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-800 uppercase">Participant Video On</div>
                  <div className="text-[11px] text-zinc-500">Enable cameras for students upon admission.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.waitingRoom}
                  onChange={(e) => setSettings({ ...settings, waitingRoom: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-600"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-800 uppercase">Enable Waiting Room</div>
                  <div className="text-[11px] text-zinc-500">Hold students in lobby until admitted by teacher.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.joinBeforeHost}
                  onChange={(e) => setSettings({ ...settings, joinBeforeHost: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-600"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-800 uppercase">Join Before Host</div>
                  <div className="text-[11px] text-zinc-500">Allow students to enter prior to teacher's arrival.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-100 text-zinc-700 dark:text-zinc-700 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              {testingConnection ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Server className="h-3.5 w-3.5" />
                  Test Zoom OAuth Connection
                </>
              )}
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" />
              Save Virtual Class Settings
            </button>
          </div>

          {connectionStatus && (
            <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-100 border border-zinc-300 dark:border-zinc-200 text-xs text-zinc-800 dark:text-zinc-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-zinc-600 flex-shrink-0" />
              <span>{connectionStatus.message}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
