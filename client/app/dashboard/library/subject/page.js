'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function LibrarySubjectPage() {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({ name: '', category: '', code: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchSubjects = async () => {
    try { const res = await api.get('/library-subject'); if (res.success) setSubjects(res.data); } 
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Subject name is required');
    try {
      setSubmitting(true);
      const res = await api.post('/library-subject', formData);
      if (res.success) { setFormData({ name: '', category: '', code: '' }); fetchSubjects(); }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return;
    try { const res = await api.delete(`/library-subject/${id}`); if (res.success) fetchSubjects(); } catch (e) { alert(e.message); }
  };

  const filtered = subjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.code && s.code.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Subject</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><span>Library</span><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-950 font-bold">Subject</span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl">
            <div className="p-4 border-b border-zinc-200"><h2 className="text-lg font-semibold text-zinc-950">Add Subject</h2></div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Subject Name <span className="text-rose-500">*</span></Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Category <span className="text-rose-500">*</span></Label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600" required>
                  <option value="">Category Name</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Literature">Literature</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Subject Code <span className="text-rose-500">*</span></Label>
                <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600" required />
              </div>
              <Button disabled={submitting} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                {submitting ? 'SAVING...' : 'SAVE SUBJECT'}
              </Button>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl flex flex-col h-full">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-950">Subject List</h2>
              <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-zinc-600" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Category Name</th><th className="px-4 py-3">Subject Code</th><th className="px-4 py-3 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  : filtered.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-indigo-500 font-medium">+{idx+1}</td>
                      <td className="px-4 py-3 text-zinc-950">{item.name}</td>
                      <td className="px-4 py-3 text-zinc-950">{item.category || '-'}</td>
                      <td className="px-4 py-3 text-zinc-950">{item.code || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
