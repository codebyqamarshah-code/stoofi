'use client';

import Link from 'next/link';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DeleteStudentRecordPage() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (id) => {
    if(confirm('Are you sure you want to permanently delete this student record?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.includes(searchQuery) ||
      s.rollNo.includes(searchQuery)
    );
  }, [students, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Delete Student Record</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-emerald-400 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Delete Student Record</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="SEARCH" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[250px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs font-semibold uppercase" 
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Admission No</th>
                <th className="px-4 py-3 font-semibold">Roll No</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Class (Section)</th>
                <th className="px-4 py-3 font-semibold">Father Name</th>
                <th className="px-4 py-3 font-semibold">Date Of Birth</th>
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
                  <td className="px-4 py-3 text-zinc-300">{s.rollNo}</td>
                  <td className="px-4 py-3 text-zinc-300 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.classSection}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.fatherName || '-'}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.dob}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.phone || '-'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button 
                      onClick={() => handleDelete(s.id)}
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10 px-2"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> DELETE
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-zinc-500">
                    {searchQuery ? "No matching records found" : "No Data Available In Table"}
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
