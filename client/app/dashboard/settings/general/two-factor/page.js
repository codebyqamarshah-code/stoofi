'use client';
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

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
    <div className="p-6 bg-white min-h-screen text-zinc-950 font-sans">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
          <span>Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>General Settings</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-950 font-bold">Two Factor Setting</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">Two Factor Authentication Setting</h1>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs w-full max-w-4xl">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-sm font-bold text-zinc-950">2FA Security Configuration</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">TWO FACTOR OTP</label>
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="otp" value="enable" checked={otp === 'enable'} onChange={() => setOtp('enable')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                <span className="text-sm font-medium text-zinc-900">Enable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="otp" value="disable" checked={otp === 'disable'} onChange={() => setOtp('disable')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                <span className="text-sm font-medium text-zinc-900">Disable</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-t border-zinc-200 pt-6">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">SEND CODE VIA</label>
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="sendCodeVia" value="sms" checked={sendCodeVia === 'sms'} onChange={() => setSendCodeVia('sms')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                <span className="text-sm font-medium text-zinc-900">SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="sendCodeVia" value="email" checked={sendCodeVia === 'email'} onChange={() => setSendCodeVia('email')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                <span className="text-sm font-medium text-zinc-900">Email</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-t border-zinc-200 pt-6">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">APPLICABLE FOR</label>
            <div className="md:col-span-2 flex flex-wrap gap-4">
              {Object.keys(applicableFor).map((key) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer capitalize">
                  <input type="checkbox" checked={applicableFor[key]} onChange={() => handleCheckbox(key)} className="w-4 h-4 rounded accent-zinc-950 cursor-pointer" />
                  <span className="text-sm font-medium text-zinc-900">{key}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-t border-zinc-200 pt-6">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">CODE LIFETIME (SECONDS)</label>
            <div className="md:col-span-2">
              <input type="text" value={lifetime} onChange={(e) => setLifetime(e.target.value)} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 max-w-xs" />
            </div>
          </div>

          <div className="flex justify-start pt-4 border-t border-zinc-200">
            <button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-8 rounded-lg shadow-sm transition-colors cursor-pointer">
              UPDATE SETTINGS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
