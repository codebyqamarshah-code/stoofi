'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Edit, Trash2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InvitationPage() {
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setRecords(records.map(r => r.id === editId ? { ...r, ...formData } : r));
      setEditId(null);
    } else {
      setRecords([{ id: Date.now(), ...formData }, ...records]);
    }
    setFormData({});
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const cancelEdit = () => {
    setFormData({});
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Invitation</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Utilities</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Chat</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-950 font-bold">Invitation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-950">{editId ? 'Edit' : 'Add'} Invitation</h2>
              {editId && <button onClick={cancelEdit} className="text-zinc-400 hover:text-zinc-950"><X className="h-4 w-4" /></button>}
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Send To</Label>
          <Input 
            type="text"
            name="sentTo"
            value={formData.sentTo || ''} 
            onChange={handleChange}
            className="bg-white border-zinc-200 text-zinc-950 focus-visible:ring-zinc-600" 
          />
        </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Message</Label>
            <textarea 
              name="message"
              value={formData.message || ''} 
              onChange={handleChange}
              className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600" 
            />
          </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg shadow-xs">
                  {editId ? 'UPDATE' : 'SAVE'}
                </Button>
                {editId && (
                  <Button type="button" onClick={cancelEdit} variant="outline" className="border-zinc-200 text-zinc-400 hover:text-zinc-950">Cancel</Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-950">Invitation List</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-white border-zinc-200 text-xs focus-visible:ring-zinc-600 text-zinc-950" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">SL</th>
                    <th className="px-4 py-3 font-semibold">Sent To</th><th className="px-4 py-3 font-semibold">Message</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {records.length === 0 ? (
                    <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : records.map((r, i) => (
                    <tr key={r.id} className="hover:bg-zinc-50/80">
                      <td className="px-4 py-3 text-zinc-600">+{i+1}</td>
                      <td className="px-4 py-3 text-zinc-950">{r.sentTo || '-'}</td><td className="px-4 py-3 text-zinc-950">{r.message || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleEdit(r)} variant="ghost" size="sm" className="h-8 text-zinc-600 hover:bg-zinc-600/10"><Edit className="h-4 w-4" /></Button>
                          <Button onClick={() => handleDelete(r.id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></Button>
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

