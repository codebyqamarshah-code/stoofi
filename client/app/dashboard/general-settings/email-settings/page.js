'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export default function EmailSettings() {
  const [activeTab, setActiveTab] = useState('SMTP SETTINGS');
  const [fromName, setFromName] = useState('');
  const [fromMail, setFromMail] = useState('');
  const [status, setStatus] = useState('Active');

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <h1 className="text-2xl font-semibold mb-6">Email Settings</h1>
      
      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">Select Email Settings</h2>
          <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-100 text-zinc-950 px-4 py-2 rounded text-sm transition-colors">
            <Mail className="w-4 h-4" />
            SEND TEST MAIL
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4 border-b border-zinc-200 mb-6">
            <button
              onClick={() => setActiveTab('SMTP SETTINGS')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'SMTP SETTINGS' ? 'border-zinc-600 text-zinc-600' : 'border-transparent text-zinc-400 hover:text-zinc-950'
              }`}
            >
              SMTP SETTINGS
            </button>
            <button
              onClick={() => setActiveTab('PHP SETTINGS')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'PHP SETTINGS' ? 'border-zinc-600 text-zinc-600' : 'border-transparent text-zinc-400 hover:text-zinc-950'
              }`}
            >
              PHP SETTINGS
            </button>
          </div>
          
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-zinc-950 mb-1">FROM NAME *</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-colors"
                placeholder="Enter from name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-950 mb-1">FROM MAIL *</label>
              <input
                type="email"
                value={fromMail}
                onChange={(e) => setFromMail(e.target.value)}
                className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-colors"
                placeholder="Enter from mail"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-950 mb-1">STATUS *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 px-6 py-2 rounded text-sm transition-colors">
                UPDATE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
