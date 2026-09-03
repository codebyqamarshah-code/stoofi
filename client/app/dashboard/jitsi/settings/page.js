'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function JitsiSettingsPage() {
  const [serverUrl, setServerUrl] = useState('https://meet.jit.si/');

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#1f2937]">Settings</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">Jitsi</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Settings</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Jitsi Server Url <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={serverUrl} 
            onChange={(e) => setServerUrl(e.target.value)} 
            className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
          />
        </div>

        <div className="flex justify-center mt-8">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-8 py-2.5 rounded flex items-center gap-2 transition-colors cursor-pointer shadow-sm">
            ✓ UPDATE
          </button>
        </div>
      </div>
    </div>
  );
}
