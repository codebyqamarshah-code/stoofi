'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const staffFields = [
  'Staff No', 'Role', 'Department', 'Designation', 'First Name', 'Last Name',
  'Father Name', 'Mother Name', 'Email', 'Gender', 'Date Of Birth',
  'Date Of Joining', 'Phone', 'Emergency Contact', 'Marital Status',
  'Photo', 'Current Address', 'Permanent Address', 'Qualification', 'Work Experience'
];

export default function StaffSettingsPage() {
  const [fields, setFields] = useState(
    staffFields.map(f => ({ name: f, staffEdit: false, required: false }))
  );

  const toggleField = (index, key) => {
    const newFields = [...fields];
    newFields[index][key] = !newFields[index][key];
    setFields(newFields);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="mb-6 flex items-center text-sm text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span>Human Resource</span>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="text-zinc-100">Settings</span>
      </div>

      <h1 className="text-2xl font-semibold text-white mb-6">Settings</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-medium text-white">Staff Information Field</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {fields.map((field, index) => (
              <div key={field.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">{field.name}</span>
                <div className="flex gap-4">
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <span className="text-xs text-zinc-400 font-semibold tracking-wider">STAFF EDIT</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={field.staffEdit}
                        onChange={() => toggleField(index, 'staffEdit')}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${field.staffEdit ? 'bg-emerald-600' : 'bg-zinc-700'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${field.staffEdit ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <span className="text-xs text-zinc-400 font-semibold tracking-wider">REQUIRED</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={field.required}
                        onChange={() => toggleField(index, 'required')}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${field.required ? 'bg-emerald-600' : 'bg-zinc-700'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${field.required ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
