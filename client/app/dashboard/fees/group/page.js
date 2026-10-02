'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function FeesGroupPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await api.get('/fees/group');
      if (res.success) setGroups(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return alert('Name is required');
    try {
      setSubmitting(true);
      const res = await api.post('/fees/group', { name, description });
      if (res.success) {
        setName('');
        setDescription('');
        fetchGroups();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this group?')) {
      try {
        const res = await api.delete(`/fees/group/${id}`);
        if (res.success) fetchGroups();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    (g.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Fees Group</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/fees/invoice" className="hover:text-zinc-500 transition-colors">Fees</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Fees Group</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-950">Add Fees Group</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Name <span className="text-rose-500">*</span></Label>
                <Input 
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Description</Label>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600" 
                />
              </div>
              <Button disabled={submitting} type="submit" className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold">
                {submitting ? 'SAVING...' : 'SAVE'}
              </Button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-950">Fees Group List</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="SEARCH" 
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-zinc-600"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  ) : filteredGroups.length === 0 ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : (
                    filteredGroups.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 text-zinc-950">{item.name}</td>
                        <td className="px-4 py-3 text-zinc-700">{item.description || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                            DELETE
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
