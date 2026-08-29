'use client';

import React, { useState } from 'react';

const eventsList = [
  'Student Admission', 'Student Checkout', 'Fee Submission', 'Exam Result',
  'Notice Published', 'Homework Added', 'Event Created', 'Holiday Added',
  'Library Book Issued', 'Library Book Returned'
];

export default function NotificationSettingPage() {
  const [events, setEvents] = useState(
    eventsList.map(e => ({ name: e, email: false, sms: false, push: false }))
  );

  const toggleSetting = (index, type) => {
    const newEvents = [...events];
    newEvents[index][type] = !newEvents[index][type];
    setEvents(newEvents);
  };

  const renderToggle = (checked, onChange, label) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-600' : 'bg-zinc-700'}`}></div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
      </div>
      <span className="text-sm text-zinc-300 font-medium w-10">{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Notification Setting</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden max-w-5xl">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-medium text-white">Notification Setting</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {events.map((event, idx) => (
              <div key={event.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                <span className="text-sm font-medium text-zinc-200 mb-4 sm:mb-0">{event.name}</span>
                <div className="flex gap-4">
                  {renderToggle(event.email, () => toggleSetting(idx, 'email'), 'Email')}
                  {renderToggle(event.sms, () => toggleSetting(idx, 'sms'), 'SMS')}
                  {renderToggle(event.push, () => toggleSetting(idx, 'push'), 'Push')}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-8 rounded transition-colors">
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
