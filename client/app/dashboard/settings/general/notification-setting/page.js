'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const eventsList = [
  'Student Admission', 'Student Checkout', 'Fee Submission', 'Exam Result',
  'Notice Published', 'Homework Added', 'Event Created', 'Holiday Added',
  'Library Book Issued', 'Library Book Returned'
];

export default function NotificationSettingPage() {
  const [events, setEvents] = useState(
    eventsList.map(e => ({ name: e, email: true, sms: false, push: true }))
  );

  const toggleSetting = (index, type) => {
    const newEvents = [...events];
    newEvents[index][type] = !newEvents[index][type];
    setEvents(newEvents);
  };

  const renderToggle = (checked, onChange, label) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`block w-9 h-5 rounded-full transition-colors ${checked ? 'bg-zinc-950' : 'bg-zinc-300'}`}></div>
        <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${checked ? 'transform translate-x-4' : ''}`}></div>
      </div>
      <span className="text-xs font-semibold text-zinc-800">{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>General Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Notification Setting</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Notification Setting</h1>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs max-w-5xl">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-sm font-bold text-zinc-950">Notification Event Channels</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event, idx) => (
              <div key={event.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-sm font-bold text-zinc-950 mb-3 sm:mb-0">{event.name}</span>
                <div className="flex gap-4">
                  {renderToggle(event.email, () => toggleSetting(idx, 'email'), 'Email')}
                  {renderToggle(event.sms, () => toggleSetting(idx, 'sms'), 'SMS')}
                  {renderToggle(event.push, () => toggleSetting(idx, 'push'), 'Push')}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-8 rounded-lg shadow-sm transition-colors cursor-pointer">
              SAVE NOTIFICATIONS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
