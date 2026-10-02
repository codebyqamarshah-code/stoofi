'use client';

import React, { useState } from 'react';
import { Mail, ChevronRight } from 'lucide-react';

export default function EmailSettings() {
  const [activeTab, setActiveTab] = useState('SMTP SETTINGS');
  const [fromName, setFromName] = useState('');
  const [fromMail, setFromMail] = useState('');
  const [status, setStatus] = useState('Active');

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
          <span>Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>General Settings</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-950 font-bold">Email Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">Email Settings</h1>
      </div>
      
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs max-w-4xl">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-zinc-950">Select Email Configuration</h2>
          <button className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm">
            <Mail className="w-3.5 h-3.5" />
            SEND TEST MAIL
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4 border-b border-zinc-200 mb-6">
            <button
              onClick={() => setActiveTab('SMTP SETTINGS')}
              className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeTab === 'SMTP SETTINGS' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              SMTP SETTINGS
            </button>
            <button
              onClick={() => setActiveTab('PHP SETTINGS')}
              className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeTab === 'PHP SETTINGS' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              PHP MAIL
            </button>
          </div>
          
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">FROM NAME *</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                placeholder="e.g. Stoofi School System"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">FROM MAIL *</label>
              <input
                type="email"
                value={fromMail}
                onChange={(e) => setFromMail(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                placeholder="noreply@stoofi.pro"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">STATUS *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-sm transition-colors cursor-pointer">
                UPDATE EMAIL SETTINGS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
