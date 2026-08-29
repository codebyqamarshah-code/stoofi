'use client';

import React, { useState } from 'react';

export default function TawkToChatPage() {
  const [formData, setFormData] = useState({
    enabled: 'Enable',
    applicableFor: {
      Student: false, Parents: false, Teacher: false, Admin: true, 
      Accountant: false, Receptionist: false, Librarian: false, Driver: false
    },
    showOnAdmin: 'Yes',
    showOnFront: 'Yes',
    position: 'Right Side',
    availability: 'Both',
    showingPage: 'All page',
    shortCode: ''
  });

  const handleApplicableToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      applicableFor: {
        ...prev.applicableFor,
        [role]: !prev.applicableFor[role]
      }
    }));
  };

  const renderRadio = (label, name, value, currentVal, setterKey) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative flex items-center justify-center">
        <input 
          type="radio" 
          name={name} 
          className="peer sr-only" 
          checked={currentVal === value}
          onChange={() => setFormData(prev => ({ ...prev, [setterKey]: value }))}
        />
        <div className="w-4 h-4 border border-zinc-600 rounded-full peer-checked:border-emerald-500"></div>
        <div className="absolute w-2 h-2 bg-emerald-500 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
      </div>
      <span className="text-sm text-zinc-300">{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Tawk To Chat Setting</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden max-w-4xl">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-medium text-white">Tawk To Chat Setting</h2>
        </div>
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <span className="text-sm font-medium text-zinc-300 md:col-span-1 pt-0.5">TAWK TO CHAT</span>
            <div className="flex gap-6 md:col-span-3">
              {renderRadio('Enable', 'enabled', 'Enable', formData.enabled, 'enabled')}
              {renderRadio('Disable', 'enabled', 'Disable', formData.enabled, 'enabled')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <span className="text-sm font-medium text-zinc-300 md:col-span-1 pt-0.5">APPLICABLE FOR</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:col-span-3">
              {Object.entries(formData.applicableFor).map(([role, isChecked]) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={isChecked}
                      onChange={() => handleApplicableToggle(role)}
                    />
                    <div className="w-4 h-4 border border-zinc-600 rounded bg-zinc-950 peer-checked:bg-emerald-600 peer-checked:border-emerald-600 flex items-center justify-center transition-colors">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-zinc-300">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <span className="text-sm font-medium text-zinc-300 md:col-span-1 pt-0.5">SHOW ON ADMIN PANEL</span>
            <div className="flex gap-6 md:col-span-3">
              {renderRadio('Yes', 'showAdmin', 'Yes', formData.showOnAdmin, 'showOnAdmin')}
              {renderRadio('No', 'showAdmin', 'No', formData.showOnAdmin, 'showOnAdmin')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <span className="text-sm font-medium text-zinc-300 md:col-span-1 pt-0.5">SHOW ON FRONTEND</span>
            <div className="flex gap-6 md:col-span-3">
              {renderRadio('Yes', 'showFront', 'Yes', formData.showOnFront, 'showOnFront')}
              {renderRadio('No', 'showFront', 'No', formData.showOnFront, 'showOnFront')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <span className="text-sm font-medium text-zinc-300 md:col-span-1 pt-0.5">POSITION</span>
            <div className="flex gap-6 md:col-span-3">
              {renderRadio('Left Side', 'position', 'Left Side', formData.position, 'position')}
              {renderRadio('Right Side', 'position', 'Right Side', formData.position, 'position')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <span className="text-sm font-medium text-zinc-300 md:col-span-1 pt-0.5">AVAILABILITY</span>
            <div className="flex flex-wrap gap-6 md:col-span-3">
              {renderRadio('Mobile', 'availability', 'Mobile', formData.availability, 'availability')}
              {renderRadio('Only Desktop', 'availability', 'Only Desktop', formData.availability, 'availability')}
              {renderRadio('Both', 'availability', 'Both', formData.availability, 'availability')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <span className="text-sm font-medium text-zinc-300 md:col-span-1 pt-0.5">SHOWING PAGE</span>
            <div className="flex flex-wrap gap-6 md:col-span-3">
              {renderRadio('Only homepage', 'showPage', 'Only homepage', formData.showingPage, 'showingPage')}
              {renderRadio('All page', 'showPage', 'All page', formData.showingPage, 'showingPage')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <span className="text-sm font-medium text-zinc-300 md:col-span-1 pt-2">SHORT CODE</span>
            <div className="md:col-span-3">
              <textarea 
                rows={5}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={formData.shortCode}
                onChange={e => setFormData(prev => ({ ...prev, shortCode: e.target.value }))}
                placeholder="Paste Tawk.to short code here"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded transition-colors">
              UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
