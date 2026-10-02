'use client';
import React, { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

export default function GeneralSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    schoolName: 'Eskooly Modern School',
    siteTitle: 'Eskooly Admin',
    address: '123 Education Street, NY',
    phoneNumber: '+1 234 567 8900',
    email: 'admin@stoofi.com',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    currency: 'USD ($)',
    currencySymbol: '$',
    session: '2023-2024'
  });

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">General Settings</h1>
        <div className="text-sm text-zinc-400">Dashboard &gt; General Settings &gt; General Settings</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Logos */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo Card */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-medium text-zinc-950">Change Logo</h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-32 h-32 bg-white border border-zinc-200 shadow-xs rounded-lg flex items-center justify-center mb-4">
                <ImageIcon size={48} className="text-zinc-700" />
              </div>
              <div className="flex gap-2 w-full">
                <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-200 text-zinc-950 font-medium py-2 px-2 rounded text-sm transition-colors flex justify-center items-center gap-2">
                  <Upload size={16} /> UPLOAD
                </button>
                <button className="flex-1 bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-medium py-2 px-2 rounded text-sm transition-colors">
                  CHANGE
                </button>
              </div>
            </div>
          </div>

          {/* Favicon Card */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-medium text-zinc-950">Change Favicon</h2>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-white border border-zinc-200 shadow-xs rounded-lg flex items-center justify-center mb-4">
                <ImageIcon size={24} className="text-zinc-700" />
              </div>
              <div className="flex gap-2 w-full">
                <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-200 text-zinc-950 font-medium py-2 px-2 rounded text-sm transition-colors flex justify-center items-center gap-2">
                  <Upload size={16} /> UPLOAD
                </button>
                <button className="flex-1 bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-medium py-2 px-2 rounded text-sm transition-colors">
                  CHANGE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - General Settings View */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-medium text-zinc-950">General Settings View</h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-medium py-1 px-4 rounded transition-colors text-sm"
              >
                {isEditing ? 'CANCEL' : 'EDIT'}
              </button>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {Object.entries(settings).map(([key, value], index) => (
                    <tr key={key} className={index !== 0 ? 'border-t border-zinc-200' : ''}>
                      <td className="p-4 w-1/3 bg-zinc-950 text-sm font-medium text-zinc-950 capitalize border-r border-zinc-200">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="p-4 w-2/3">
                        {isEditing ? (
                          <input 
                            type="text"
                            value={value}
                            onChange={(e) => handleSettingChange(key, e.target.value)}
                            className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600"
                          />
                        ) : (
                          <span className="text-sm text-zinc-950">{value}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {isEditing && (
                <div className="p-4 border-t border-zinc-200 flex justify-end bg-zinc-950">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-medium py-2 px-6 rounded transition-colors"
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
