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
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6 flex items-center text-xs font-semibold text-zinc-600">
        <span>Dashboard</span>
        <ChevronRight className="mx-2 h-3.5 w-3.5" />
        <span>General Settings</span>
        <ChevronRight className="mx-2 h-3.5 w-3.5" />
        <span className="text-zinc-950 font-bold">Staff Settings</span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Staff Settings</h1>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-sm font-bold text-zinc-950">Staff Information Field Permissions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {fields.map((field, index) => (
              <div key={field.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="text-sm font-bold text-zinc-950">{field.name}</span>
                <div className="flex gap-4">
                  <label className="flex flex-col items-center gap-1 cursor-pointer">
                    <span className="text-[10px] text-zinc-700 font-bold tracking-wider">STAFF EDIT</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={field.staffEdit}
                        onChange={() => toggleField(index, 'staffEdit')}
                      />
                      <div className={`block w-9 h-5 rounded-full transition-colors ${field.staffEdit ? 'bg-zinc-950' : 'bg-zinc-300'}`}></div>
                      <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${field.staffEdit ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                  <label className="flex flex-col items-center gap-1 cursor-pointer">
                    <span className="text-[10px] text-zinc-700 font-bold tracking-wider">REQUIRED</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={field.required}
                        onChange={() => toggleField(index, 'required')}
                      />
                      <div className={`block w-9 h-5 rounded-full transition-colors ${field.required ? 'bg-zinc-950' : 'bg-zinc-300'}`}></div>
                      <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${field.required ? 'transform translate-x-4' : ''}`}></div>
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
