'use client';
import React, { useState } from 'react';
import { Upload, Image as ImageIcon, ChevronRight } from 'lucide-react';

export default function GeneralSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    schoolName: 'Stoofi International Academy',
    siteTitle: 'Stoofi Admin',
    address: '123 Education Street',
    phoneNumber: '+1 234 567 8900',
    email: 'admin@stoofi.pro',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    currency: 'USD ($)',
    currencySymbol: '$',
    session: '2026-2027'
  });

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950 font-sans">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
          <span>Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>General Settings</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-950 font-bold">General Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">General Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Logos */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo Card */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-sm font-bold text-zinc-950">School Brand Logo</h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-28 h-28 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-4 p-2">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-2 w-full">
                <button className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 px-2 rounded-lg text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-xs">
                  <Upload size={14} /> UPLOAD
                </button>
                <button className="flex-1 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-bold py-2 px-2 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer">
                  CHANGE
                </button>
              </div>
            </div>
          </div>

          {/* Favicon Card */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-sm font-bold text-zinc-950">Site Favicon</h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-4 p-2">
                <img src="/logo.png" alt="Favicon" className="w-full h-full object-contain" />
              </div>
              <div className="flex gap-2 w-full">
                <button className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 px-2 rounded-lg text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-xs">
                  <Upload size={14} /> UPLOAD
                </button>
                <button className="flex-1 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-bold py-2 px-2 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer">
                  CHANGE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - General Settings View */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="border-b border-zinc-200 px-6 py-4 flex justify-between items-center bg-zinc-50">
              <h2 className="text-sm font-bold text-zinc-950">General Settings View</h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-1.5 px-4 rounded-lg transition-colors text-xs uppercase tracking-wider cursor-pointer shadow-xs"
              >
                {isEditing ? 'CANCEL' : 'EDIT'}
              </button>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {Object.entries(settings).map(([key, value], index) => (
                    <tr key={key} className={index !== 0 ? 'border-t border-zinc-200' : ''}>
                      <td className="p-4 w-1/3 bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-700 border-r border-zinc-200">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="p-4 w-2/3">
                        {isEditing ? (
                          <input 
                            type="text"
                            value={value}
                            onChange={(e) => handleSettingChange(key, e.target.value)}
                            className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                          />
                        ) : (
                          <span className="text-sm font-bold text-zinc-950">{value}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {isEditing && (
                <div className="p-4 border-t border-zinc-200 flex justify-end bg-zinc-50">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 px-6 rounded-lg text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                  >
                    SAVE CHANGES
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
