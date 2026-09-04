'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Plus } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function HomeworkListPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ class: '', subject: '', section: '' });
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/class').then(r => r.success && setClasses(r.data)).catch(()=>{});
    api.get('/subject').then(r => r.success && setSubjects(r.data)).catch(()=>{});

    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/homework');
      if (res.success) setRecords(res.data);
    } catch(e){}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Homework List</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>HomeWork</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Homework List</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" /> ADD HOMEWORK
          </Button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
            <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Class *</option>
              {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Subject</Label>
            <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Subjects</option>
              {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
            <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <option value="">Select Section *</option>
              {(classes.find(c => c.name === formData.class)?.sections || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col mt-6">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Homework List</h2>
          <div className="relative w-48 sm:w-64 flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input placeholder="QUICK SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-transparent border-0 border-b border-zinc-800 text-xs focus-visible:ring-0 rounded-none focus-visible:border-emerald-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Sl</th>
                <th className="px-4 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold">Section</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Marks</th>
                <th className="px-4 py-3 font-semibold">Homework Date</th>
                <th className="px-4 py-3 font-semibold">Submission Date</th>
                <th className="px-4 py-3 font-semibold">Evaluation Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {records.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
