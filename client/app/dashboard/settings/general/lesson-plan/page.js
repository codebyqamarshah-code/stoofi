'use client';
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function LessonPlanSettingPage() {
  const [subtopic, setSubtopic] = useState('enable');

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950 font-sans">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
          <span>Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>General Settings</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-950 font-bold">Lesson Plan Setting</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">Lesson Plan Setting</h1>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs w-full max-w-4xl">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-sm font-bold text-zinc-950">Lesson Plan Configuration</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">LESSON PLAN SUBTOPIC</label>
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="subtopic" value="enable" checked={subtopic === 'enable'} onChange={() => setSubtopic('enable')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                <span className="text-sm font-medium text-zinc-900">Enable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="subtopic" value="disable" checked={subtopic === 'disable'} onChange={() => setSubtopic('disable')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                <span className="text-sm font-medium text-zinc-900">Disable</span>
              </label>
            </div>
          </div>

          <div className="flex justify-start pt-4 border-t border-zinc-200">
            <button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-8 rounded-lg shadow-sm transition-colors cursor-pointer">
              UPDATE SETTING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
