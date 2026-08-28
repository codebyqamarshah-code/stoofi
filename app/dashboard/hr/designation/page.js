'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function DesignationPage() {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);

  const fetchAll = async () => {
    try {
      const res = await api.get('/designation');
      if (res.success) setRecords(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editId) {
        const res = await api.put(`/designation/${editId}`, formData);
        if (res.success) { setFormData({ name: '' }); setEditId(null); fetchAll(); }
      } else {
        const res = await api.post('/designation', formData);
        if (res.success) { setFormData({ name: '' }); fetchAll(); }
      }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name });
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData({ name: '' });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { const res = await api.delete(`/designation/${id}`); if (res.success) fetchAll(); } catch (e) { alert(e.message); }
  };

  const filtered = records.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Designation</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/hr/staff-directory" className="hover:text-emerald-400 transition-colors">Human Resource</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Designation</span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editId ? 'Edit' : 'Add'} Designation</h2>
              {editId && (
                <button onClick={cancelEdit} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Designation Name *</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" required />
              </div>
              <div className="flex gap-2">
                <Button disabled={submitting} type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {submitting ? 'SAVING...' : editId ? 'UPDATE' : 'SAVE'}
                </Button>
                {editId && (
                  <Button type="button" onClick={cancelEdit} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</Button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Designation List</h2>
              <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Designation Name</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  : filtered.map((item, idx) => (
                    <tr key={item._id} className={`hover:bg-zinc-900/50 transition-colors ${editId === item._id ? 'bg-emerald-950/20 border-l-2 border-l-emerald-500' : ''}`}>
                      <td className="px-4 py-3 text-emerald-500">+{idx+1}</td>
                      <td className="px-4 py-3 text-zinc-300">{item.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleEdit(item)} variant="ghost" size="sm" className="h-8 text-blue-500 hover:bg-blue-500/10">
                            <Edit className="h-3.5 w-3.5 mr-1" /> EDIT
                          </Button>
                          <Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10">DELETE</Button>
                        </div>
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
