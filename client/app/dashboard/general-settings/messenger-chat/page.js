'use client';

import React, { useState } from 'react';

export default function MessengerChat() {
  const [chatEnabled, setChatEnabled] = useState('enable');
  const [applicableFor, setApplicableFor] = useState({ student: true, parent: false, teacher: false });
  const [showOnAdmin, setShowOnAdmin] = useState('yes');
  const [showOnFront, setShowOnFront] = useState('yes');
  const [position, setPosition] = useState('right');
  const [availability, setAvailability] = useState('both');
  const [showingPage, setShowingPage] = useState('all');
  const [shortcode, setShortcode] = useState('');

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <h1 className="text-2xl font-semibold mb-6">Messenger Chat Setting</h1>
      
      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg overflow-hidden shadow-sm max-w-4xl">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-lg font-medium">Messenger Chat Setting</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
             <label className="text-sm font-medium text-zinc-950 pt-2">MESSENGER CHAT</label>
             <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="chatEnabled" checked={chatEnabled === 'enable'} onChange={() => setChatEnabled('enable')} className="accent-zinc-800" />
                  <span className="text-sm">Enable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="chatEnabled" checked={chatEnabled === 'disable'} onChange={() => setChatEnabled('disable')} className="accent-zinc-800" />
                  <span className="text-sm">Disable</span>
                </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-t border-zinc-200 pt-6">
             <label className="text-sm font-medium text-zinc-950 pt-2">APPLICABLE FOR</label>
             <div className="col-span-2 flex gap-6 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={applicableFor.student} onChange={(e) => setApplicableFor({...applicableFor, student: e.target.checked})} className="rounded border-zinc-200 text-zinc-800 focus:ring-zinc-600 bg-zinc-800 cursor-pointer accent-zinc-800" />
                  <span className="text-sm">Student</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={applicableFor.parent} onChange={(e) => setApplicableFor({...applicableFor, parent: e.target.checked})} className="rounded border-zinc-200 text-zinc-800 focus:ring-zinc-600 bg-zinc-800 cursor-pointer accent-zinc-800" />
                  <span className="text-sm">Parent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={applicableFor.teacher} onChange={(e) => setApplicableFor({...applicableFor, teacher: e.target.checked})} className="rounded border-zinc-200 text-zinc-800 focus:ring-zinc-600 bg-zinc-800 cursor-pointer accent-zinc-800" />
                  <span className="text-sm">Teacher</span>
                </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-t border-zinc-200 pt-6">
             <label className="text-sm font-medium text-zinc-950 pt-2">SHOW ON ADMIN PANEL</label>
             <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="showOnAdmin" checked={showOnAdmin === 'yes'} onChange={() => setShowOnAdmin('yes')} className="accent-zinc-800" />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="showOnAdmin" checked={showOnAdmin === 'no'} onChange={() => setShowOnAdmin('no')} className="accent-zinc-800" />
                  <span className="text-sm">No</span>
                </label>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-t border-zinc-200 pt-6">
             <label className="text-sm font-medium text-zinc-950 pt-2">SHOW ON FRONTEND</label>
             <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="showOnFront" checked={showOnFront === 'yes'} onChange={() => setShowOnFront('yes')} className="accent-zinc-800" />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="showOnFront" checked={showOnFront === 'no'} onChange={() => setShowOnFront('no')} className="accent-zinc-800" />
                  <span className="text-sm">No</span>
                </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-zinc-200 pt-6">
             <label className="text-sm font-medium text-zinc-950">POSITION</label>
             <div className="col-span-2">
                <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 max-w-sm">
                   <option value="left">Left</option>
                   <option value="right">Right</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-zinc-200 pt-6">
             <label className="text-sm font-medium text-zinc-950">AVAILABILITY</label>
             <div className="col-span-2">
                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 max-w-sm">
                   <option value="mobile">Mobile</option>
                   <option value="desktop">Desktop</option>
                   <option value="both">Desktop & Mobile</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-zinc-200 pt-6">
             <label className="text-sm font-medium text-zinc-950">SHOWING PAGE</label>
             <div className="col-span-2">
                <select value={showingPage} onChange={(e) => setShowingPage(e.target.value)} className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 max-w-sm">
                   <option value="homepage">Homepage</option>
                   <option value="all">All Pages</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-t border-zinc-200 pt-6">
             <label className="text-sm font-medium text-zinc-950 pt-2">SHORT CODE</label>
             <div className="col-span-2">
                <textarea 
                  value={shortcode}
                  onChange={(e) => setShortcode(e.target.value)}
                  className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" 
                  rows={4}
                  placeholder="Paste your messenger chat shortcode here"
                />
             </div>
          </div>

          <div className="border-t border-zinc-200 pt-6">
             <button className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 px-6 py-2 rounded text-sm transition-colors">
                UPDATE
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
