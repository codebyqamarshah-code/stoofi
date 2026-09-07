'use client';
import { useState } from 'react';
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Copyright,
  Check
} from 'lucide-react';

export default function FooterContentPage() {
  const [about, setAbout] = useState('Stoofi Pro is a comprehensive multi-purpose educational institution management system providing modern student and faculty automation.');
  const [copyright, setCopyright] = useState('Copyright © 2026 All rights reserved | This application is made by Stoofi Inc.');
  const [address, setAddress] = useState('Sector F-7/2, Islamabad, Pakistan');
  const [phone, setPhone] = useState('+92 51 111 222 333');
  const [email, setEmail] = useState('support@stoofi.pro');
  const [showNewsletter, setShowNewsletter] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-emerald-400">Footer Content</span>
      </div>

      <h1 className="text-xl font-bold text-white">Footer Content</h1>

      {/* Main Settings Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h2 className="text-sm font-semibold text-zinc-300">Website Footer Description & Address Information</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">SHOW NEWSLETTER:</span>
            <button
              type="button"
              onClick={() => setShowNewsletter(!showNewsletter)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${showNewsletter ? 'bg-emerald-600' : 'bg-zinc-700'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showNewsletter ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">ABOUT FOOTER DESCRIPTION</label>
          <textarea
            rows={3}
            value={about}
            onChange={e => setAbout(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">COPYRIGHT TEXT</label>
          <div className="relative">
            <Copyright className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={copyright}
              onChange={e => setCopyright(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">CAMPUS ADDRESS</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">SUPPORT PHONE</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">SUPPORT EMAIL</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg transition-colors"
          >
            ✓ UPDATE
          </button>
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> Footer content updated successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
