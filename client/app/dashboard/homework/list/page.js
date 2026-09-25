'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Plus, BookOpen } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const DEFAULT_CLASSES = [
  { _id: 'c1', name: 'Class 1' },
  { _id: 'c2', name: 'Class 2' },
  { _id: 'c3', name: 'Class 3' },
  { _id: 'c4', name: 'Class 4' },
  { _id: 'c5', name: 'Class 5' },
  { _id: 'c6', name: 'Class 6' },
  { _id: 'c7', name: 'Class 7' },
  { _id: 'c8', name: 'Class 8' },
  { _id: 'c9', name: 'Class 9' },
  { _id: 'c10', name: 'Class 10' },
  { _id: 'c11', name: 'O-Levels' },
  { _id: 'c12', name: 'A-Levels' },
];

const DEFAULT_SUBJECTS = [
  { _id: 'sub1', name: 'Mathematics' },
  { _id: 'sub2', name: 'English Language' },
  { _id: 'sub3', name: 'Urdu Literature' },
  { _id: 'sub4', name: 'General Science' },
  { _id: 'sub5', name: 'Physics' },
  { _id: 'sub6', name: 'Chemistry' },
  { _id: 'sub7', name: 'Biology' },
  { _id: 'sub8', name: 'Computer Science' },
  { _id: 'sub9', name: 'Islamiat' },
  { _id: 'sub10', name: 'Pakistan Studies' },
];

export default function HomeworkListPage() {
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [formData, setFormData] = useState({ class: '', subject: '', section: '' });
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/class').then(r => r?.success && Array.isArray(r.data) && r.data.length > 0 && setClasses(r.data)).catch(()=>{});
    api.get('/subject').then(r => r?.success && Array.isArray(r.data) && r.data.length > 0 && setSubjects(r.data)).catch(()=>{});
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/homework');
      if (res?.success && Array.isArray(res.data)) {
        setRecords(res.data);
      }
    } catch(e){}
  };

  const filteredRecords = records.filter(r => {
    return (!formData.class || r.className === formData.class) &&
           (!formData.subject || r.subject === formData.subject) &&
           (!formData.section || r.section === formData.section) &&
           (!search || 
              r.subject?.toLowerCase().includes(search.toLowerCase()) || 
              r.className?.toLowerCase().includes(search.toLowerCase()) ||
              r.description?.toLowerCase().includes(search.toLowerCase())
           );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            Homework List
          </h1>
          <p className="text-sm text-zinc-400 mt-1">View, filter, and track all assigned student homework tasks</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Homework</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-500">Homework List</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Filter Criteria</h2>
          <Link href="/dashboard/homework/add">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 text-xs">
              <Plus className="h-4 w-4" /> ADD HOMEWORK
            </Button>
          </Link>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
            <select 
              value={formData.class} 
              onChange={e => setFormData({...formData, class: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject</Label>
            <select 
              value={formData.subject} 
              onChange={e => setFormData({...formData, subject: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id || s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
            <select 
              value={formData.section} 
              onChange={e => setFormData({...formData, section: e.target.value})} 
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="">All Sections</option>
              {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/30">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
            Assigned Homework ({filteredRecords.length})
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search homework..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs text-white focus-visible:ring-indigo-500" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold w-12">#</th>
                <th className="px-4 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold">Section</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Marks</th>
                <th className="px-4 py-3 font-semibold">Homework Date</th>
                <th className="px-4 py-3 font-semibold">Submission Date</th>
                <th className="px-4 py-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-zinc-500">
                    No homework assigned matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={r._id || i} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{r.className}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.section?.startsWith('Section') ? r.section : `Section ${r.section}`}</td>
                    <td className="px-4 py-3 text-indigo-400 font-medium">{r.subject}</td>
                    <td className="px-4 py-3 text-zinc-300 font-mono">{r.marks || '-'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{r.homeworkDate ? new Date(r.homeworkDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-rose-400 text-xs font-medium">{r.submissionDate ? new Date(r.submissionDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-zinc-300 max-w-xs truncate">{r.description || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
