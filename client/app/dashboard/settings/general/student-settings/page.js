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
    <div className="relative cursor-pointer" onClick={onChange}>
      <input type="checkbox" className="sr-only" checked={checked} readOnly />
      <div className={`block w-9 h-5 rounded-full transition-colors ${checked ? 'bg-zinc-950' : 'bg-zinc-300'}`}></div>
      <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-xs pointer-events-none ${checked ? 'transform translate-x-4' : ''}`}></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mb-6 flex items-center text-xs font-semibold text-zinc-600">
        <span>Dashboard</span>
        <ChevronRight className="mx-2 h-3.5 w-3.5" />
        <span>Student Info</span>
        <ChevronRight className="mx-2 h-3.5 w-3.5" />
        <span className="text-zinc-950 font-bold">Settings</span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Student Settings</h1>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs mb-6">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-sm font-bold text-zinc-950">Student Admission Field Controls</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {studentFields.map((field, index) => (
              <div key={field.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="text-sm font-bold text-zinc-950 w-1/3">{field.name}</span>
                <div className="flex gap-4 w-2/3 justify-end">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-zinc-700 font-bold tracking-wider">SHOW</span>
                    {renderToggle(field.show, () => toggleStudentField(index, 'show'))}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-zinc-700 font-bold tracking-wider text-center">STUDENT<br/>EDIT</span>
                    {renderToggle(field.studentEdit, () => toggleStudentField(index, 'studentEdit'))}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-zinc-700 font-bold tracking-wider text-center">PARENT<br/>EDIT</span>
                    {renderToggle(field.parentEdit, () => toggleStudentField(index, 'parentEdit'))}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-zinc-700 font-bold tracking-wider text-center">REQUIRED</span>
                    {renderToggle(field.required, () => toggleStudentField(index, 'required'))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-sm font-bold text-zinc-950">Teacher Information View</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {teacherFields.map((field, index) => (
              <div key={field.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="text-sm font-bold text-zinc-950">{field.name}</span>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-zinc-700 font-bold tracking-wider">VIEW</span>
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
