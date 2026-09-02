'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Edit, Trash2, X, Plus } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BankAccountPage() {
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  React.useEffect(() => { fetchRecords(); }, []);
  const fetchRecords = async () => { try { const res = await api.get('/bank-account'); if(res.success) setRecords(res.data); } catch(e){} };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put('/bank-account/' + editId, formData);
        setEditId(null);
      } else {
        await api.post('/bank-account', formData);
      }
      fetchRecords();
      setFormData({});
    } catch(e) {
      alert(e.message);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
      if(confirm('Delete?')) {
        await api.delete('/bank-account/' + id);
        fetchRecords();
      }
    };

  const cancelEdit = () => {
    setFormData({});
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Bank Account</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Accounts</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Accounts</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Bank Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editId ? 'Edit' : 'Add'} Bank Account</h2>
              {editId && <button onClick={cancelEdit} className="text-zinc-400 hover:text-white"><X className="h-4 w-4" /></button>}
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-400 uppercase">Bank Name</Label>
          <Input 
            type="text"
            name="bankName"
            value={formData.bankName || ''} 
            onChange={handleChange}
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-400 uppercase">Account Title</Label>
          <Input 
            type="text"
            name="accountTitle"
            value={formData.accountTitle || ''} 
            onChange={handleChange}
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-400 uppercase">Account Number</Label>
          <Input 
            type="text"
            name="accountNumber"
            value={formData.accountNumber || ''} 
            onChange={handleChange}
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-400 uppercase">Opening Balance</Label>
          <Input 
            type="number"
            name="openingBalance"
            value={formData.openingBalance || ''} 
            onChange={handleChange}
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
          />
        </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {editId ? 'UPDATE' : 'SAVE'}
                </Button>
                {editId && (
                  <Button type="button" onClick={cancelEdit} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">Cancel</Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Bank Account List</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500 text-white" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">SL</th>
                    <th className="px-4 py-3 font-semibold">Bank Name</th><th className="px-4 py-3 font-semibold">Account Title</th><th className="px-4 py-3 font-semibold">Account Number</th><th className="px-4 py-3 font-semibold">Opening Balance</th><th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {records.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : records.map((r, i) => (
                    <tr key={r._id} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 text-emerald-500">+{i+1}</td>
                      <td className="px-4 py-3 text-zinc-300">{r.bankName || '-'}</td><td className="px-4 py-3 text-zinc-300">{r.accountTitle || '-'}</td><td className="px-4 py-3 text-zinc-300">{r.accountNumber || '-'}</td><td className="px-4 py-3 text-zinc-300">{r.openingBalance || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleEdit(r)} variant="ghost" size="sm" className="h-8 text-emerald-500 hover:bg-emerald-500/10"><Edit className="h-4 w-4" /></Button>
                          <Button onClick={() => handleDelete(r._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></Button>
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

