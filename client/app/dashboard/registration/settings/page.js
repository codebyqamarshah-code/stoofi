'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RegistrationSettingsPage() {
  const ToggleRadio = ({ name, value, setValue }) => (
    <div className="flex items-center gap-6">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} checked={value === 'Yes'} onChange={() => setValue('Yes')} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
        <span className="text-sm text-gray-600">Yes</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} checked={value === 'No'} onChange={() => setValue('No')} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
        <span className="text-sm text-gray-600">No</span>
      </label>
    </div>
  );

  const ToggleEnable = ({ name, value, setValue }) => (
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

  const StatusToggle = ({ label }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-600">{label}</span>
        <svg className="w-3.5 h-3.5 text-indigo-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </div>
      <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
        <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-[22px] font-bold text-[#1f2937]">Registration Settings</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <span className="mx-2">|</span>
          <span className="hover:text-indigo-600 cursor-pointer">Registration</span>
          <span className="mx-2">|</span>
          <span className="text-gray-700 font-medium">Settings</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h2 className="text-lg font-bold text-[#1f2937] text-center mb-8">Registration Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">REGISTRATION</span>
            <ToggleEnable name="reg" value="Enable" setValue={()=>{}} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">REGISTRATION BUTTON</span>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                <span className="text-sm text-gray-600">Header</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                <span className="text-sm text-gray-600">Footer</span>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">AFTER REGISTRATION MAIL SEND</span>
            <ToggleRadio name="amail" value="Yes" setValue={()=>{}} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">AFTER REGISTRATION APPROVE MAIL SEND</span>
            <ToggleRadio name="aamail" value="Yes" setValue={()=>{}} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">RECAPTCHA</span>
            <div className="flex items-center gap-4">
              <ToggleEnable name="recap" value="Disable" setValue={()=>{}} />
              <a href="#" className="text-xs text-indigo-600 hover:underline">Click For Recaptcha Create</a>
            </div>
          </div>
          <div></div>
          
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">NOCAPTCHA SITEKEY</label>
            <input type="text" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">NOCAPTCHA</label>
            <input type="text" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">START DATE</label>
            <div className="relative">
              <input type="text" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase block mb-1">END DATE</label>
            <div className="relative">
              <input type="text" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 mt-6">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Before Start Msg</label>
            <textarea rows={3} defaultValue="Registration start on {START_DATE} and end on {END_DATE}&#10;&#10;You can use {START_DATE}, {END_DATE} as variable for show dynamic date on message" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 resize-none"></textarea>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">After End Msg</label>
            <textarea rows={3} defaultValue="Registration date is over. Thank you for your query.&#10;&#10;You can use {START_DATE}, {END_DATE} as variable for show dynamic date on message" className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-3 py-2.5 focus:outline-none focus:border-indigo-500 resize-none"></textarea>
          </div>
        </div>

        <div className="mt-6 flex items-center border border-gray-300 rounded px-4 py-3 bg-gray-50 text-sm text-gray-600">
          https://stoofi.pro/online/ <span className="text-gray-900 bg-white border border-gray-300 px-3 py-1 rounded ml-2">registration</span>
        </div>

        <div className="mt-6">
          <label className="text-xs font-bold text-gray-700 block mb-1">Footer Note</label>
          <input type="text" defaultValue="If you want to register your another child please contact with school." className="w-full bg-white border border-gray-300 text-gray-700 text-sm rounded px-4 py-3 focus:outline-none focus:border-indigo-500" />
        </div>

        <div className="flex justify-center mt-6 border-b border-gray-200 pb-8">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-8 py-2.5 rounded flex items-center justify-center gap-2 shadow-sm">? SAVE</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 mt-8">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase">ONLINE STUDENT REGISTRATION DISPLAY</span>
              <span className="text-xs font-bold text-gray-500 uppercase">STATUS</span>
            </div>
            {['Session', 'Class', 'Section', 'Session', 'Academic Year', 'Faculty', 'Department', 'Semester', 'Semester Label', 'Section', 'First Name', 'Last Name', 'Email', 'Gender', 'Date Of Birth', 'Age', 'Blood Group', 'Religion', 'Caste', 'Phone Number', 'ID Number', 'Category', 'Group', 'Height', 'Weight', 'Photo', 'Father Name', 'Father Occupation', 'Fathers Phone', 'Fathers Photo'].map(f => <StatusToggle key={f} label={f} />)}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase">ONLINE STUDENT REGISTRATION DISPLAY</span>
              <span className="text-xs font-bold text-gray-500 uppercase">STATUS</span>
            </div>
            {['Mothers Name', 'Mothers Occupation', 'Mother Phone', 'Mothers Photo', 'Guardian Name', 'Relation', 'Guardian Email', 'Guardian Photo', 'Guardian Phone', 'Guardian Occupation', 'Guardian Address', 'Current Address', 'Permanent Address', 'Route', 'Vehicle', 'Dormitory Name', 'Room Number', 'National Id Number', 'Local Id Number', 'Bank Account Number', 'Bank Name', 'Previous School Details', 'Additional Notes', 'IFSC Code', 'Document File 1', 'Document File 2', 'Document File 3', 'Document File 4', 'Custom Field'].map(f => <StatusToggle key={f} label={f} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
