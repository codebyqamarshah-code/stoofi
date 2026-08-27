'use client';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function StudentListPage() {
  const [students, setStudents] = useState([]);

  const [quickSearch, setQuickSearch] = useState('');
  
  // Filters
  const [academicYear, setAcademicYear] = useState('2026[Jan-Dec]');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [rollFilter, setRollFilter] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    academicYear: '2026[Jan-Dec]', classFilter: '', sectionFilter: '', nameFilter: '', rollFilter: ''
  });

  const handleSearch = () => {
    setAppliedFilters({ academicYear, classFilter, sectionFilter, nameFilter, rollFilter });
  };

  const handleDelete = (id) => {
    if(confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Apply Quick Search
      if (quickSearch && !s.name.toLowerCase().includes(quickSearch.toLowerCase()) && !s.admissionNo.includes(quickSearch)) {
        return false;
      }
      // Apply Advanced Filters
      if (appliedFilters.nameFilter && !s.name.toLowerCase().includes(appliedFilters.nameFilter.toLowerCase())) return false;
      if (appliedFilters.rollFilter && s.admissionNo !== appliedFilters.rollFilter) return false;
      if (appliedFilters.classFilter && !s.classSection.toLowerCase().includes(appliedFilters.classFilter.toLowerCase())) return false;
      if (appliedFilters.sectionFilter && !s.classSection.toLowerCase().includes(appliedFilters.sectionFilter.toLowerCase())) return false;
      
      return true;
    });
  }, [students, quickSearch, appliedFilters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Manage Student</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Student Info</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Student List</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
          <Link href="/dashboard/students/add">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" /> ADD STUDENT
            </Button>
          </Link>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Academic Year <span className="text-rose-500">*</span></Label>
            <select 
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="2026[Jan-Dec]">2026[Jan-Dec]</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="">Select Class</option>
              <option value="Class 1">Class 1</option>
              <option value="LEN">LEN</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
            <select 
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="">Select Section</option>
              <option value="(A)">(A)</option>
              <option value="(B)">(B)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Search by Name</Label>
            <Input 
              placeholder="Name" 
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Search by Roll</Label>
            <Input 
              placeholder="Roll" 
              value={rollFilter}
              onChange={(e) => setRollFilter(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
            />
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Student List</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="QUICK SEARCH" 
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="pl-9 w-[200px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs font-semibold uppercase" 
              />
            </div>
            <div className="flex items-center border border-zinc-800 rounded-md bg-zinc-900">
              {[FileText, Download, FileText, Download, Printer, MoreVertical].map((Icon, i) => (
                <button key={i} className={`p-2 hover:bg-zinc-800 text-zinc-400 transition-colors ${i < 5 ? 'border-r border-zinc-800' : ''}`}>
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Admission No</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Father Name</th>
                <th className="px-4 py-3 font-semibold">Date Of Birth</th>
                <th className="px-4 py-3 font-semibold">Class(Section)</th>
                <th className="px-4 py-3 font-semibold">Gender</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 text-zinc-300">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs">+{s.admissionNo}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.fatherName || '-'}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.dob}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.classSection}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.gender}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.type || '-'}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.phone || '-'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                     <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10 px-2"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(s.id)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10 px-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-zinc-500">
                    {quickSearch || appliedFilters.nameFilter || appliedFilters.rollFilter ? "No matching records found" : "No Data Available In Table"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing {filteredStudents.length > 0 ? 1 : 0} to {filteredStudents.length} of {filteredStudents.length} entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
