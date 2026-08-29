'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const admissionFields = [
  'Session', 'Class', 'Section', 'Roll Number', 'First Name', 'Last Name',
  'Gender', 'Date of Birth', 'Category', 'Religion', 'Mobile Number',
  'Email', 'Admission Date', 'Student Photo', 'Blood Group', 'House',
  'Height', 'Weight', 'As on Date', 'Parent Name', 'Father Name'
];

const teacherFieldsList = ['Email', 'Phone'];

export default function StudentSettingsPage() {
  const [studentFields, setStudentFields] = useState(
    admissionFields.map(f => ({ name: f, show: true, studentEdit: false, parentEdit: false, required: false }))
  );
  
  const [teacherFields, setTeacherFields] = useState(
    teacherFieldsList.map(f => ({ name: f, view: false }))
  );

  const toggleStudentField = (index, key) => {
    const newFields = [...studentFields];
    newFields[index][key] = !newFields[index][key];
    setStudentFields(newFields);
  };

  const toggleTeacherField = (index, key) => {
    const newFields = [...teacherFields];
    newFields[index][key] = !newFields[index][key];
    setTeacherFields(newFields);
  };

  const renderToggle = (checked, onChange) => (
    <div className="relative" onClick={onChange}>
      <input type="checkbox" className="sr-only" checked={checked} readOnly />
      <div className={`block w-10 h-6 rounded-full transition-colors cursor-pointer ${checked ? 'bg-emerald-600' : 'bg-zinc-700'}`}></div>
      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform pointer-events-none ${checked ? 'transform translate-x-4' : ''}`}></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="mb-6 flex items-center text-sm text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span>Student Info</span>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="text-zinc-100">Settings</span>
      </div>

      <h1 className="text-2xl font-semibold text-white mb-6">Settings</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-medium text-white">Student Admission Field</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {studentFields.map((field, index) => (
              <div key={field.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300 w-1/3">{field.name}</span>
                <div className="flex gap-4 w-2/3 justify-end">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-semibold tracking-wider">SHOW</span>
                    {renderToggle(field.show, () => toggleStudentField(index, 'show'))}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-semibold tracking-wider text-center">STUDENT<br/>EDIT</span>
                    {renderToggle(field.studentEdit, () => toggleStudentField(index, 'studentEdit'))}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-semibold tracking-wider text-center">PARENT<br/>EDIT</span>
                    {renderToggle(field.parentEdit, () => toggleStudentField(index, 'parentEdit'))}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-semibold tracking-wider text-center">REQUIRED</span>
                    {renderToggle(field.required, () => toggleStudentField(index, 'required'))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-medium text-white">Teacher Information View</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {teacherFields.map((field, index) => (
              <div key={field.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">{field.name}</span>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-semibold tracking-wider">VIEW</span>
                    {renderToggle(field.view, () => toggleTeacherField(index, 'view'))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
