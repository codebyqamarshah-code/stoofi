'use client';
import React, { useState } from 'react';

export default function TwoFactorPage() {
  const [otp, setOtp] = useState('enable');
  const [sendCodeVia, setSendCodeVia] = useState('email');
  const [applicableFor, setApplicableFor] = useState({
    admin: true,
    student: false,
    parent: false,
    teacher: false,
    staff: false,
  });
  const [lifetime, setLifetime] = useState('300');

  const handleCheckbox = (key) => {
    setApplicableFor({ ...applicableFor, [key]: !applicableFor[key] });
  };

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Two Factor Setting</h1>
        <div className="text-sm text-zinc-400">Dashboard &gt; General Settings &gt; Two Factor Setting</div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm w-full max-w-4xl">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-medium text-zinc-950">Two Factor Setting</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <label className="text-sm font-medium text-zinc-950 md:col-span-1 pt-2">TWO FACTOR OTP</label>
            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="otp" value="enable" checked={otp === 'enable'} onChange={() => setOtp('enable')} className="w-4 h-4 text-zinc-800 bg-white border-zinc-300 text-zinc-950 focus:ring-zinc-600 focus:ring-offset-zinc-900" />
                <span>Enable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="otp" value="disable" checked={otp === 'disable'} onChange={() => setOtp('disable')} className="w-4 h-4 text-zinc-800 bg-white border-zinc-300 text-zinc-950 focus:ring-zinc-600 focus:ring-offset-zinc-900" />
                <span>Disable</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <label className="text-sm font-medium text-zinc-950 md:col-span-1 pt-2">SEND CODE VIA</label>
            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="sendCodeVia" value="sms" checked={sendCodeVia === 'sms'} onChange={() => setSendCodeVia('sms')} className="w-4 h-4 text-zinc-800 bg-white border-zinc-300 text-zinc-950 focus:ring-zinc-600 focus:ring-offset-zinc-900" />
                <span>SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="sendCodeVia" value="email" checked={sendCodeVia === 'email'} onChange={() => setSendCodeVia('email')} className="w-4 h-4 text-zinc-800 bg-white border-zinc-300 text-zinc-950 focus:ring-zinc-600 focus:ring-offset-zinc-900" />
                <span>Email</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <label className="text-sm font-medium text-zinc-950 md:col-span-1 pt-2">APPLICABLE FOR</label>
            <div className="md:col-span-2 flex flex-wrap gap-4">
              {Object.keys(applicableFor).map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer capitalize">
                  <input type="checkbox" checked={applicableFor[key]} onChange={() => handleCheckbox(key)} className="w-4 h-4 rounded text-zinc-800 bg-white border-zinc-300 text-zinc-950 focus:ring-zinc-600 focus:ring-offset-zinc-900" />
                  <span>{key}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-medium text-zinc-950 md:col-span-1">CODE LIFETIME (SECOND)</label>
            <div className="md:col-span-2">
              <input type="text" value={lifetime} onChange={(e) => setLifetime(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600" />
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-medium py-2 px-8 rounded transition-colors">
              UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
