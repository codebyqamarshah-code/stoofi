'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

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
      <input 
        type="radio" 
        name={name} 
        checked={currentVal === value}
        onChange={() => setFormData(prev => ({ ...prev, [setterKey]: value }))}
        className="w-4 h-4 accent-zinc-950 cursor-pointer"
      />
      <span className="text-sm font-medium text-zinc-900">{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>General Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Tawk To Chat Setting</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Tawk To Chat Setting</h1>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden max-w-4xl">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-sm font-bold text-zinc-950">Tawk To Chat Configuration</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">TAWK TO CHAT</span>
            <div className="flex gap-6 md:col-span-3">
              {renderRadio('Enable', 'enabled', 'Enable', formData.enabled, 'enabled')}
              {renderRadio('Disable', 'enabled', 'Disable', formData.enabled, 'enabled')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1 pt-1">APPLICABLE FOR</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:col-span-3">
              {Object.entries(formData.applicableFor).map(([role, isChecked]) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => handleApplicableToggle(role)}
                    className="w-4 h-4 accent-zinc-950 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-900">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">SHOW ON ADMIN PANEL</span>
            <div className="flex gap-6 md:col-span-3">
              {renderRadio('Yes', 'showAdmin', 'Yes', formData.showOnAdmin, 'showOnAdmin')}
              {renderRadio('No', 'showAdmin', 'No', formData.showOnAdmin, 'showOnAdmin')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">SHOW ON FRONTEND</span>
            <div className="flex gap-6 md:col-span-3">
              {renderRadio('Yes', 'showFront', 'Yes', formData.showOnFront, 'showOnFront')}
              {renderRadio('No', 'showFront', 'No', formData.showOnFront, 'showOnFront')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">POSITION</span>
            <div className="flex gap-6 md:col-span-3">
              {renderRadio('Left Side', 'position', 'Left Side', formData.position, 'position')}
              {renderRadio('Right Side', 'position', 'Right Side', formData.position, 'position')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">AVAILABILITY</span>
            <div className="flex flex-wrap gap-6 md:col-span-3">
              {renderRadio('Mobile', 'availability', 'Mobile', formData.availability, 'availability')}
              {renderRadio('Only Desktop', 'availability', 'Only Desktop', formData.availability, 'availability')}
              {renderRadio('Both', 'availability', 'Both', formData.availability, 'availability')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1">SHOWING PAGE</span>
            <div className="flex flex-wrap gap-6 md:col-span-3">
              {renderRadio('Only homepage', 'showPage', 'Only homepage', formData.showingPage, 'showingPage')}
              {renderRadio('All page', 'showPage', 'All page', formData.showingPage, 'showingPage')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 md:col-span-1 pt-2">SHORT CODE</span>
            <div className="md:col-span-3">
              <textarea 
                rows={4}
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                value={formData.shortCode}
                onChange={e => setFormData(prev => ({ ...prev, shortCode: e.target.value }))}
                placeholder="Paste Tawk.to short code here"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-200">
            <button className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-sm transition-colors cursor-pointer">
              UPDATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
