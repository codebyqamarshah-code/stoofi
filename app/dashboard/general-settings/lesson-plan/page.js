'use client';
import React, { useState } from 'react';

export default function LessonPlanSettingPage() {
  const [subtopic, setSubtopic] = useState('enable');

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Lesson plan setting</h1>
        <div className="text-sm text-zinc-400">Dashboard &gt; General Settings &gt; Lesson plan setting</div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm w-full max-w-4xl">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-medium text-white">Lesson plan setting</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <label className="text-sm font-medium text-zinc-300 md:col-span-1 pt-2">LESSON PLAN SUBTOPIC</label>
            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="subtopic" value="enable" checked={subtopic === 'enable'} onChange={() => setSubtopic('enable')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" />
                <span>Enable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="subtopic" value="disable" checked={subtopic === 'disable'} onChange={() => setSubtopic('disable')} className="w-4 h-4 text-emerald-600 bg-zinc-900 border-zinc-800 focus:ring-emerald-500 focus:ring-offset-zinc-900" />
                <span>Disable</span>
              </label>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded transition-colors">
              UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
