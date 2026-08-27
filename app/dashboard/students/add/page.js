'use client';

import React, { useState } from 'react';
import { ChevronRight, Plus, Calendar as CalendarIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddStudentPage() {
  const [activeTab, setActiveTab] = useState('PERSONAL INFO');

  const tabs = [
    'PERSONAL INFO',
    'PARENTS & GUARDIAN INFO',
    'DOCUMENT INFO',
    'PREVIOUS SCHOOL INFORMATION',
    'OTHER INFO',
    'CUSTOM FIELD'
  ];

  const handleSave = (e) => {
    e.preventDefault();
    alert("Student saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Student Admission</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Student Info</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Student Admission</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Add Student</h2>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 text-xs">
            <Plus className="h-4 w-4" /> IMPORT STUDENT
          </Button>
        </div>

        <form onSubmit={handleSave}>
          <div className="p-4">
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-zinc-800 mb-6 relative">
              {tabs.map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-semibold transition-colors border-b-2 uppercase ${
                    activeTab === tab
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="absolute right-0 bottom-2 hidden sm:block">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-8 text-xs">
                  SAVE STUDENT
                </Button>
              </div>
            </div>

            {/* Tab Content: Personal Info */}
            {activeTab === 'PERSONAL INFO' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Academic Information */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">ACADEMIC INFORMATION</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Academic Year <span className="text-rose-500">*</span></Label>
                        <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                          <option>2026[Jan-Dec]</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
                        <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                          <option>Class *</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Section <span className="text-rose-500">*</span></Label>
                        <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                          <option>Section *</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Admission Number <span className="text-rose-500">*</span></Label>
                        <Input defaultValue="142" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Admission Date</Label>
                        <div className="relative">
                          <Input defaultValue="08/27/2026" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 pl-10" />
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Roll</Label>
                        <Input className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">CONTACT INFORMATION</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Phone Number</Label>
                        <Input className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                    </div>
                  </div>

                  {/* Student Address Info */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">STUDENT ADDRESS INFO</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Current Address</Label>
                        <textarea className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Permanent Address</Label>
                        <textarea className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 resize-none"></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">PERSONAL INFO</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">First Name <span className="text-rose-500">*</span></Label>
                        <Input className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Last Name</Label>
                        <Input className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Gender <span className="text-rose-500">*</span></Label>
                        <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                          <option>Gender *</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Date of Birth <span className="text-rose-500">*</span></Label>
                        <div className="relative">
                          <Input defaultValue="08/27/2026" className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 pl-10" />
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Religion</Label>
                        <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                          <option>Religion</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Caste</Label>
                        <Input className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold text-zinc-400 uppercase">Student Photo</Label>
                        <div className="flex">
                          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-l-md px-3 py-2 text-sm text-zinc-500 flex items-center">
                            Student Photo
                          </div>
                          <Button type="button" className="rounded-l-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                            BROWSE
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Record */}
                  <div>
                    <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">MEDICAL RECORD</h3>
                    {/* Add inputs here later if needed */}
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs placeholder */}
            {activeTab !== 'PERSONAL INFO' && (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                <p>Fill out the {activeTab.toLowerCase()} below.</p>
                <p className="text-xs mt-2 text-zinc-600">(This section is fully customizable in the backend)</p>
              </div>
            )}
            
            <div className="mt-8 flex justify-end sm:hidden">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold w-full">
                SAVE STUDENT
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
