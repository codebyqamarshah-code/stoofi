'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function DisabledStudentsPage() {
  const [formData, setFormData] = useState({
    class: '',
    section: '',
    name: '',
    admissionNo: ''
  });

  const [students, setStudents] = useState([]);
  const [quickSearch, setQuickSearch] = useState('');
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = () => {
    setIsSearched(true);
    // In a real app, fetch disabled students based on criteria here
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Disabled Students</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-500 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Disabled Students</span>
        </div>
      </div>

      {/* Select Criteria */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
          <h2 className="text-lg font-semibold text-zinc-950">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class <span className="text-rose-500">*</span></Label>
            <select 
              value={formData.class}
              onChange={(e) => setFormData({...formData, class: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-900 dark:text-zinc-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
            >
              <option value="">Select Class *</option>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section</Label>
            <select 
              value={formData.section}
              onChange={(e) => setFormData({...formData, section: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-900 dark:text-zinc-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
            >
              <option value="">Select Section</option>
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Search By Name</Label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Search By Admission No</Label>
            <Input 
              value={formData.admissionNo}
              onChange={(e) => setFormData({...formData, admissionNo: e.target.value})}
              className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" 
            />
          </div>
          
          <div className="lg:col-span-4 flex items-end justify-end pt-2">
            <Button onClick={handleSearch} className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg shadow-xs flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>

      {/* Disabled Students List */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden flex flex-col mt-6">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-950">Disabled Students</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="QUICK SEARCH" 
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="pl-9 w-[200px] bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium text-xs font-semibold uppercase" 
              />
            </div>
            <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-xs">
              {[FileText, Download, FileText, Download, Printer, MoreVertical].map((Icon, i) => (
                <button key={i} className={`p-2 hover:bg-zinc-100 text-zinc-700 transition-colors ${i < 5 ? 'border-r border-zinc-200' : ''}`}>
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Admission No</th>
                <th className="px-4 py-3 font-semibold">Roll No</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold">Father Name</th>
                <th className="px-4 py-3 font-semibold">Date Of Birth</th>
                <th className="px-4 py-3 font-semibold">Gender</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? students.map((s) => (
                <tr key={s.id} className="border-b border-zinc-100/50 hover:bg-zinc-50/80 transition-colors">
                  <td className="px-4 py-3 text-zinc-950">
                    <span className="bg-zinc-600/10 text-zinc-500 border border-zinc-600/20 px-2 py-0.5 rounded text-xs">+{s.admissionNo}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-950">{s.rollNo}</td>
                  <td className="px-4 py-3 text-zinc-950 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-zinc-700">{s.class}</td>
                  <td className="px-4 py-3 text-zinc-700">{s.fatherName || '-'}</td>
                  <td className="px-4 py-3 text-zinc-700">{s.dob}</td>
                  <td className="px-4 py-3 text-zinc-700">{s.gender}</td>
                  <td className="px-4 py-3 text-zinc-700">{s.type || '-'}</td>
                  <td className="px-4 py-3 text-zinc-700">{s.phone || '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-zinc-500">
                    {isSearched || quickSearch ? "No matching records found" : "No Data Available In Table"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing {students.length > 0 ? 1 : 0} to {students.length} of {students.length} entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700" disabled><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
