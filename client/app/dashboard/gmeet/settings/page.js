'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function GmeetSettingsPage() {
  const [useCalendarApi, setUseCalendarApi] = useState('Disable');

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#1f2937]">Settings</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">Gmeet</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Settings</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-base font-bold text-[#1f2937] px-8 pt-8 pb-4">Manage Gmeet(Google Meet) Settings</h2>
        
        <div className="px-8 pb-8">
          <div className="flex items-center gap-24 mt-4">
            <span className="text-xs font-bold text-gray-500 uppercase">USE GOOGLE CALENDER API</span>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="api" checked={useCalendarApi === 'Enable'} onChange={() => setUseCalendarApi('Enable')} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                <span className="text-sm text-gray-600">Enable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="api" checked={useCalendarApi === 'Disable'} onChange={() => setUseCalendarApi('Disable')} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                <span className="text-sm text-gray-600">Disable</span>
              </label>
            </div>
          </div>

          <div className="mt-8">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2 rounded flex items-center justify-center gap-2 shadow-sm">
              ? UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
