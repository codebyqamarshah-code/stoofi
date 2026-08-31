'use client';
import { useState } from 'react';
import { 
  ChevronRight, 
  Phone, 
  Mail, 
  Clock, 
  Globe, 
  Share2, 
  Check
} from 'lucide-react';

export default function HeaderContentPage() {
  const [phone, setPhone] = useState('+92 300 1234567');
  const [email, setEmail] = useState('info@eskooly.pro');
  const [openingHours, setOpeningHours] = useState('Mon - Sat: 8:00 AM - 4:00 PM');
  const [facebook, setFacebook] = useState('https://facebook.com/eskooly');
  const [twitter, setTwitter] = useState('https://twitter.com/eskooly');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/company/eskooly');
  const [instagram, setInstagram] = useState('https://instagram.com/eskooly');
  const [showTopBar, setShowTopBar] = useState(true);
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
        <span className="text-emerald-400">Header Content</span>
      </div>

      <h1 className="text-xl font-bold text-white">Header Content</h1>

      {/* Main Settings Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h2 className="text-sm font-semibold text-zinc-300">Website Header Contact & Social Information</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">SHOW TOP BAR:</span>
            <button
              type="button"
              onClick={() => setShowTopBar(!showTopBar)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${showTopBar ? 'bg-emerald-600' : 'bg-zinc-700'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showTopBar ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Contact Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">PHONE NUMBER</label>
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
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">EMAIL ADDRESS</label>
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

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">OPENING HOURS</label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={openingHours}
                onChange={e => setOpeningHours(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-zinc-800 pt-4 space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Social Media Links</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">FACEBOOK URL</label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-blue-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={facebook}
                  onChange={e => setFacebook(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">TWITTER / X URL</label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={twitter}
                  onChange={e => setTwitter(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">LINKEDIN URL</label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">INSTAGRAM URL</label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
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
              <Check className="w-3.5 h-3.5" /> Header content updated successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
