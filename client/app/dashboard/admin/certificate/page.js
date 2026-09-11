'use client';

import Link from 'next/link';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronRight, Search, Plus, Edit, Trash2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function CertificatePage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificate');
      if (res.success) setCards(res.data);
    } catch (error) {
      alert(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', type: '' });
  const [editingId, setEditingId] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (editingId) {
        await api.put('/certificate/' + editingId, payload);
      } else {
        await api.post('/certificate', payload);
      }
      setEditingId(null);
      fetchData();
      if(typeof setShowForm === 'function') setShowForm(false);
      const resetForm = {};
      Object.keys(formData).forEach(k => resetForm[k] = '');
      setFormData(resetForm);
      if (typeof setFileName === 'function') setFileName('');
    } catch (error) {
      alert(error.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (card) => {
    setEditingId(card._id);
    setFormData({ title: card.title, type: card.type });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete('/certificate/' + id);
        setCards(cards.filter(item => item._id !== id));
      } catch (error) {
        alert(error.message || 'Failed to delete');
      }
    }
  };

    const handleExport = (type) => {
    if (filtered.length === 0) {
      alert('No data to export');
      return;
    }
    
    const exportData = filtered.map(item => {
      const clean = { ...item };
      delete clean._id;
      delete clean.__v;
      delete clean.createdAt;
      delete clean.updatedAt;
      return clean;
    });

    const headers = Object.keys(exportData[0] || {});
    const filename = `export_${Date.now()}`;

    if (type === 'Print') {
      printData(exportData, headers, 'Export');
    } else if (type === 'CSV') {
      exportToCSV(exportData, filename);
    } else if (type === 'Excel') {
      exportToExcel(exportData, filename);
    } else if (type === 'PDF') {
      exportToPDF(exportData, headers, 'Export', filename);
    } else {
      alert(`${type} export started...`);
    }
  };

  const filtered = useMemo(() => 
    cards.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.type.toLowerCase().includes(searchQuery.toLowerCase())
    ), [cards, searchQuery]
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Certificate</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/admin/admission-query" className="hover:text-zinc-500 transition-colors">Admin Section</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Certificate</span>
        </div>
      </div>

      {showForm && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mb-6">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit' : 'Create'} Certificate</h2>
            <Button variant="ghost" size="sm" onClick={() => {setShowForm(false); setEditingId(null); setFormData({ title: '', type: '' });}} className="text-zinc-400">Cancel</Button>
          </div>
          <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSave}>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Title <span className="text-rose-500">*</span></Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title" className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Type <span className="text-rose-500">*</span></Label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white" required>
                <option value="">Select Type *</option>
                <option value="Transfer">Transfer Certificate</option>
                <option value="Character">Character Certificate</option>
                <option value="Leaving">Leaving Certificate</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <Button type="submit" className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold">
                {editingId ? 'UPDATE' : 'SAVE'} CERTIFICATE
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Certificate List</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="SEARCH" className="pl-9 w-full sm:w-[250px] bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 uppercase text-xs font-semibold" />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setShowForm(true)} className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold h-9 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> CREATE CERTIFICATE
              </Button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold w-24">SL</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold w-32 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((c, i) => (
                  <tr key={c._id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-4 text-zinc-300">{i + 1}</td>
                    <td className="px-4 py-4 text-zinc-300 font-medium">{c.title}</td>
                    <td className="px-4 py-4 text-zinc-300">{c.type}</td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <Button onClick={() => handleEdit(c)} variant="outline" size="sm" className="h-7 text-xs text-zinc-600 border-zinc-600/50 hover:bg-zinc-600/10 px-2"><Edit className="h-3 w-3" /></Button>
                      <Button onClick={() => handleDelete(c._id)} variant="outline" size="sm" className="h-7 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10 px-2"><Trash2 className="h-3 w-3" /></Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-zinc-500">
                    {searchQuery ? 'No matching records' : 'No Data Available In Table'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
