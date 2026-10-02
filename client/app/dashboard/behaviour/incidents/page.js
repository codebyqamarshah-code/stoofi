'use client';

import Link from 'next/link';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, Plus, Download, Printer, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', point: '', description: '' });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (editingId) {
      setIncidents(incidents.map(i => i.id === editingId ? { ...i, ...formData } : i));
      setEditingId(null);
    } else {
      setIncidents([{ id: Date.now(), ...formData }, ...incidents]);
    }
    setFormData({ title: '', point: '', description: '' });
    setShowForm(false);
  };

  const handleEdit = (incident) => {
    setEditingId(incident.id);
    setFormData({ title: incident.title, point: incident.point, description: incident.description });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this incident?')) {
      setIncidents(incidents.filter(i => i.id !== id));
    }
  };

  const filtered = useMemo(() =>
    incidents.filter(i =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [incidents, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Incidents</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/behaviour/incidents" className="hover:text-zinc-500 transition-colors">Behaviour Records</Link><ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Incidents</span>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-zinc-950">{editingId ? 'Edit' : 'Add'} Incident</h2>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ title: '', point: '', description: '' }); }} className="text-zinc-400 hover:text-zinc-950 h-8">Cancel</Button>
          </div>
          <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Title <span className="text-rose-500">*</span></Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Incident title" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Point</Label>
              <Input type="number" value={formData.point} onChange={e => setFormData({ ...formData, point: e.target.value })} placeholder="Points" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Description</Label>
              <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description" className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold">
                {editingId ? 'UPDATE' : 'SAVE'} INCIDENT
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-950">Incident List</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input placeholder="SEARCH" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 w-[180px] bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600 text-xs font-semibold uppercase" />
            </div>
            <div className="flex items-center border border-zinc-200 rounded-md bg-zinc-900">
              {[FileText, Download, FileText, Download, Printer, MoreVertical].map((Icon, i) => (
                <button key={i} className={`p-2 hover:bg-zinc-100 text-zinc-400 transition-colors ${i < 5 ? 'border-r border-zinc-200' : ''}`}><Icon className="h-4 w-4" /></button>
              ))}
            </div>
            <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: '', point: '', description: '' }); }}
              className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" /> ADD
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Point</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(i => (
                <tr key={i.id} className="border-b border-zinc-200/50 hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-zinc-950 font-medium">{i.title}</td>
                  <td className="px-4 py-3 text-zinc-700">{i.point || '-'}</td>
                  <td className="px-4 py-3 text-zinc-700">{i.description || '-'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button onClick={() => handleEdit(i)} variant="outline" size="sm" className="h-7 text-xs text-zinc-600 border-zinc-600/50 hover:bg-zinc-600/10 px-2"><Edit className="h-3 w-3" /></Button>
                    <Button onClick={() => handleDelete(i.id)} variant="outline" size="sm" className="h-7 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10 px-2"><Trash2 className="h-3 w-3" /></Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-zinc-500">{searchQuery ? 'No matching records found' : 'No Data Available In Table'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
