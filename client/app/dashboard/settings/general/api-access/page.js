'use client';
import { useState } from 'react';
import { ChevronRight, Save } from 'lucide-react';

export default function ApiAccessPage() {
  const [apiEnabled, setApiEnabled] = useState(true);
  const [fcmKey, setFcmKey] = useState('');

  const handleSave = () => {
    alert('FCM Key saved successfully!');
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>System Settings</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">API Access</span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-950 mb-6">API Access</h1>

      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs max-w-3xl">
        <h2 className="text-sm font-bold text-zinc-950 mb-6">API Access Configuration</h2>

        {/* Toggle */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200">
          <div>
            <p className="text-sm font-bold text-zinc-950">Enable API Access</p>
            <p className="text-xs text-zinc-500 font-medium">Allow authorized external mobile/web apps to connect to Stoofi APIs</p>
          </div>
          <button
            type="button"
            onClick={() => setApiEnabled(!apiEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${apiEnabled ? 'bg-zinc-950' : 'bg-zinc-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${apiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* FCM Key */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2 block">FCM KEY *</label>
            <input
              type="text"
              value={fcmKey}
              placeholder="Enter your Firebase Cloud Messaging server key"
              onChange={(e) => setFcmKey(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2.5 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" /> SAVE FCM KEY
          </button>
        </div>
      </div>
    </div>
  );
}
