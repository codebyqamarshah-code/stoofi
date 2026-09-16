'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function BBBSettingsPage() {
  const ToggleRadio = ({ name, value, setValue }) => (
    <div className="flex items-center gap-6">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} checked={value === 'Enable'} onChange={() => setValue('Enable')} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
        <span className="text-sm text-gray-600">Enable</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} checked={value === 'Disable'} onChange={() => setValue('Disable')} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
        <span className="text-sm text-gray-600">Disable</span>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#1f2937]">Settings</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">BigBlueButton</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Settings</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm pb-8">
        <h2 className="text-lg font-bold text-[#1f2937] text-center pt-8 pb-8">BBB Setup</h2>
        
        <div className="px-8 grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">PASSWORD LENGTH</span>
              <input type="text" defaultValue="6" className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">DIAL NUMBER</span>
              <input type="text" className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">LOGOUT URL</span>
              <input type="text" className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">DURATION</span>
              <input type="text" defaultValue="0" className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">COPYRIGHT</span>
              <input type="text" className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">WELCOME MESSAGE</span>
              <input type="text" className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">MODERATOR ONLY MESSAGE</span>
              <input type="text" className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-gray-500 uppercase">LOCK SETTINGS DISABLE PRIVATE CHAT</span>
              <ToggleRadio name="l1" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">LOCK SETTINGS DISABLE NOTE</span>
              <ToggleRadio name="l2" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">LOCK SETTINGS LOCK ON JOIN</span>
              <ToggleRadio name="l3" value="Disable" setValue={()=>{}} />
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-xs font-bold text-gray-500 uppercase">GUEST POLICY</span>
              <select className="w-40 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2 focus:outline-none focus:border-indigo-500">
                <option value="Always Accept">Always Accept</option>
                <option value="Always Deny">Always Deny</option>
                <option value="Ask Moderator">Ask Moderator</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">STATUS</span>
              <select className="w-40 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2 focus:outline-none focus:border-indigo-500">
                <option value="Any">Any</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">ALLOW START RECORDING</span>
              <ToggleRadio name="r1" value="Enable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">LOCK SETTINGS DISABLE MIC</span>
              <ToggleRadio name="r2" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">RECORD</span>
              <ToggleRadio name="r3" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">IS BREAKOUT</span>
              <ToggleRadio name="r4" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">AUTO START RECORDING</span>
              <ToggleRadio name="r5" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">WEBCAMS ONLY FOR MODERATOR</span>
              <ToggleRadio name="r6" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">MUTE ON START</span>
              <ToggleRadio name="r7" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">LOCK SETTINGS DISABLE PUBLIC CHAT</span>
              <ToggleRadio name="r8" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">LOCK SETTINGS LOCKED LAYOUT</span>
              <ToggleRadio name="r9" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">LOCK SETTINGS LOCK ON JOIN CONFIGURABLE</span>
              <ToggleRadio name="r10" value="Disable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">JOIN VIA HTML 5</span>
              <ToggleRadio name="r11" value="Enable" setValue={()=>{}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">REDIRECT</span>
              <ToggleRadio name="r12" value="Enable" setValue={()=>{}} />
            </div>
          </div>
        </div>
        
        <div className="px-8 mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-16">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">BBB SECURITY SALT <span className="text-red-500">*</span></label>
            <input type="text" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">BBB SERVER BASE URL <span className="text-red-500">*</span></label>
            <input type="text" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-8 py-2.5 rounded flex items-center justify-center gap-2 shadow-sm">✓ UPDATE</button>
        </div>
      </div>
    </div>
  );
}
