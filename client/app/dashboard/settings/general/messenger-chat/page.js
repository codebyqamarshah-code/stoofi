'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

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
    <div className="p-6 bg-white min-h-screen text-zinc-950">
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>General Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Messenger Chat Setting</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Messenger Chat Setting</h1>
      
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs max-w-4xl">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-sm font-bold text-zinc-950">Messenger Chat Configuration</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
             <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">MESSENGER CHAT</label>
             <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="chatEnabled" checked={chatEnabled === 'enable'} onChange={() => setChatEnabled('enable')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                  <span className="text-sm font-medium text-zinc-900">Enable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="chatEnabled" checked={chatEnabled === 'disable'} onChange={() => setChatEnabled('disable')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                  <span className="text-sm font-medium text-zinc-900">Disable</span>
                </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-zinc-200 pt-6">
             <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">APPLICABLE FOR</label>
             <div className="col-span-2 flex gap-6 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={applicableFor.student} onChange={(e) => setApplicableFor({...applicableFor, student: e.target.checked})} className="w-4 h-4 rounded accent-zinc-950 cursor-pointer" />
                  <span className="text-sm font-medium text-zinc-900">Student</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={applicableFor.parent} onChange={(e) => setApplicableFor({...applicableFor, parent: e.target.checked})} className="w-4 h-4 rounded accent-zinc-950 cursor-pointer" />
                  <span className="text-sm font-medium text-zinc-900">Parent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={applicableFor.teacher} onChange={(e) => setApplicableFor({...applicableFor, teacher: e.target.checked})} className="w-4 h-4 rounded accent-zinc-950 cursor-pointer" />
                  <span className="text-sm font-medium text-zinc-900">Teacher</span>
                </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-zinc-200 pt-6">
             <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">SHOW ON ADMIN PANEL</label>
             <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="showOnAdmin" checked={showOnAdmin === 'yes'} onChange={() => setShowOnAdmin('yes')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                  <span className="text-sm font-medium text-zinc-900">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="showOnAdmin" checked={showOnAdmin === 'no'} onChange={() => setShowOnAdmin('no')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                  <span className="text-sm font-medium text-zinc-900">No</span>
                </label>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-zinc-200 pt-6">
             <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">SHOW ON FRONTEND</label>
             <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="showOnFront" checked={showOnFront === 'yes'} onChange={() => setShowOnFront('yes')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                  <span className="text-sm font-medium text-zinc-900">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="showOnFront" checked={showOnFront === 'no'} onChange={() => setShowOnFront('no')} className="w-4 h-4 accent-zinc-950 cursor-pointer" />
                  <span className="text-sm font-medium text-zinc-900">No</span>
                </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-zinc-200 pt-6">
             <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">POSITION</label>
             <div className="col-span-2">
                <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 max-w-sm">
                   <option value="left">Left Side</option>
                   <option value="right">Right Side</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-zinc-200 pt-6">
             <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">AVAILABILITY</label>
             <div className="col-span-2">
                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 max-w-sm">
                   <option value="mobile">Mobile</option>
                   <option value="desktop">Desktop</option>
                   <option value="both">Desktop & Mobile</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t border-zinc-200 pt-6">
             <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">SHOWING PAGE</label>
             <div className="col-span-2">
                <select value={showingPage} onChange={(e) => setShowingPage(e.target.value)} className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 max-w-sm">
                   <option value="homepage">Only Homepage</option>
                   <option value="all">All Pages</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-t border-zinc-200 pt-6">
             <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 pt-2">SHORT CODE</label>
             <div className="col-span-2">
                <textarea 
                  value={shortcode}
                  onChange={(e) => setShortcode(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" 
                  rows={4}
                  placeholder="Paste your messenger chat shortcode here"
                />
             </div>
          </div>

          <div className="border-t border-zinc-200 pt-6">
             <button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer">
                UPDATE
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
