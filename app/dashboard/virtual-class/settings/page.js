'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ZoomSettingsPage() {
  const [approval, setApproval] = useState('Automatically');
  const [autoRecord, setAutoRecord] = useState('None');
  const [audioOption, setAudioOption] = useState('Both');
  const [packageType, setPackageType] = useState('Basic Free)');
  
  const [accountId, setAccountId] = useState('');
  const [clientId, setClientId] = useState('GsF_U_fzQyuqQ7bMDWBL9A');
  const [clientSecret, setClientSecret] = useState('IOB0jsyfAXSTAVkYiBF3Jg0DLhZG247yohOG');
  
  const [hostVideo, setHostVideo] = useState('Disable');
  const [partVideo, setPartVideo] = useState('Disable');
  const [joinBefore, setJoinBefore] = useState('Disable');
  const [waitingRoom, setWaitingRoom] = useState('Disable');
  const [partMic, setPartMic] = useState('Disable');
  
  const [apiUse, setApiUse] = useState('Admin');

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
        <h1 className="text-[22px] font-bold text-[#1f2937]">Manage Zoom Settings</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">Virtual Class</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Settings</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-[#1f2937] text-center pt-8 pb-4">Zoom Setting</h2>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">MEETING JOIN APPROVAL</span>
              <select value={approval} onChange={e => setApproval(e.target.value)} className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500">
                <option>Automatically</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">AUTO RECORDING FOR PAID PACKAGE )</span>
              <select value={autoRecord} onChange={e => setAutoRecord(e.target.value)} className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500">
                <option>None</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">AUDIO OPTION</span>
              <select value={audioOption} onChange={e => setAudioOption(e.target.value)} className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500">
                <option>Both</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">PAKAGE</span>
              <select value={packageType} onChange={e => setPackageType(e.target.value)} className="w-64 bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500">
                <option>Basic Free)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase block mb-1">ACCOUNT ID <span className="text-red-500">*</span></label>
              <input type="text" value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase block mb-1">CLIENT ID <span className="text-red-500">*</span></label>
              <input type="text" value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase block mb-1">CLIENT SECRET <span className="text-red-500">*</span></label>
              <input type="text" value={clientSecret} onChange={e => setClientSecret(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">HOST VIDEO</span>
              <ToggleRadio name="hostVideo" value={hostVideo} setValue={setHostVideo} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">PARTICIPANT VIDEO</span>
              <ToggleRadio name="partVideo" value={partVideo} setValue={setPartVideo} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">JOIN BEFORE HOST</span>
              <ToggleRadio name="joinBefore" value={joinBefore} setValue={setJoinBefore} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">WAITING ROOM</span>
              <ToggleRadio name="waitingRoom" value={waitingRoom} setValue={setWaitingRoom} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">PARTICIPATE MIC MUTE</span>
              <ToggleRadio name="partMic" value={partMic} setValue={setPartMic} />
            </div>
            
            <div className="mt-8 pt-8 flex items-center gap-12">
              <span className="text-xs font-bold text-gray-500 uppercase">API USE FOR</span>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="apiUse" checked={apiUse === 'Admin'} onChange={() => setApiUse('Admin')} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                  <span className="text-sm text-gray-600">Admin</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="apiUse" checked={apiUse === 'Teacher'} onChange={() => setApiUse('Teacher')} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                  <span className="text-sm text-gray-600">Teacher</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-8 mt-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-8 py-2.5 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">✓ UPDATE</button>
        </div>
      </div>
    </div>
  );
}
