'use client';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SeatPlanSettingPage() {
  const [settings, setSettings] = useState({
    schoolName: true,
    studentName: true,
    rollNo: true,
    examName: true,
    studentPhoto: true,
    admissionNo: true,
    classSection: true,
    academicYear: true,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = () => {
    alert('Settings updated!');
  };

  return (
    <div className="space-y-6 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <Link href="/dashboard" className="hover:text-zinc-200">Dashboard</Link>
        <ChevronRight className="w-3 h-3 text-zinc-600" />
        <span className="hover:text-zinc-200 cursor-pointer">Exam Plan</span>
        <ChevronRight className="w-3 h-3 text-zinc-600" />
        <span className="text-zinc-200 font-medium">Seat Plan Setting</span>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-8 max-w-5xl">
        <h2 className="text-sm font-semibold text-zinc-950 mb-8">Seat Plan Setting</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 uppercase font-bold">SCHOOL NAME</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="schoolName" checked={settings.schoolName === true} onChange={() => handleChange('schoolName', true)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Show</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="schoolName" checked={settings.schoolName === false} onChange={() => handleChange('schoolName', false)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Hide</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 uppercase font-bold">STUDENT NAME</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="studentName" checked={settings.studentName === true} onChange={() => handleChange('studentName', true)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Show</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="studentName" checked={settings.studentName === false} onChange={() => handleChange('studentName', false)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Hide</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 uppercase font-bold">ROLL NO</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="rollNo" checked={settings.rollNo === true} onChange={() => handleChange('rollNo', true)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Show</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="rollNo" checked={settings.rollNo === false} onChange={() => handleChange('rollNo', false)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Hide</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 uppercase font-bold">EXAM NAME</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="examName" checked={settings.examName === true} onChange={() => handleChange('examName', true)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Show</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="examName" checked={settings.examName === false} onChange={() => handleChange('examName', false)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Hide</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 uppercase font-bold">STUDENT PHOTO</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="studentPhoto" checked={settings.studentPhoto === true} onChange={() => handleChange('studentPhoto', true)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Show</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="studentPhoto" checked={settings.studentPhoto === false} onChange={() => handleChange('studentPhoto', false)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Hide</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 uppercase font-bold">ADMISSION NO</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="admissionNo" checked={settings.admissionNo === true} onChange={() => handleChange('admissionNo', true)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Show</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="admissionNo" checked={settings.admissionNo === false} onChange={() => handleChange('admissionNo', false)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Hide</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 uppercase font-bold">CLASS & SECTION</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="classSection" checked={settings.classSection === true} onChange={() => handleChange('classSection', true)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Show</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="classSection" checked={settings.classSection === false} onChange={() => handleChange('classSection', false)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Hide</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 uppercase font-bold">ACADEMIC YEAR</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="academicYear" checked={settings.academicYear === true} onChange={() => handleChange('academicYear', true)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Show</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="academicYear" checked={settings.academicYear === false} onChange={() => handleChange('academicYear', false)} className="w-4 h-4 text-zinc-800 bg-zinc-800 border-zinc-600 focus:ring-zinc-600" />
                  <span className="text-sm text-zinc-950">Hide</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleUpdate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-2 rounded-md transition-colors"
          >
            ? UPDATE
          </button>
        </div>
      </div>
    </div>
  );
}
