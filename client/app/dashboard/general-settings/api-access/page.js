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
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>System Settings</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-500">API Access</span>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">API Access</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-6">API Access</h2>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8 pb-6 border-b border-zinc-800">
          <span className="text-sm text-zinc-300 font-medium">Enable Api Access</span>
          <button
            onClick={() => setApiEnabled(!apiEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${apiEnabled ? 'bg-zinc-800' : 'bg-zinc-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${apiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* FCM Key */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase mb-1 block">FCM KEY *</label>
            <input
              type="text"
              value={fcmKey}
              onChange={(e) => setFcmKey(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-zinc-800 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-2 rounded flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> SAVE FCM KEY
          </button>
        </div>
      </div>
    </div>
  );
}
