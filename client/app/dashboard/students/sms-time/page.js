'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Edit, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function SmsSendingTimePage() {
  const [setups, setSetups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    time: '12:17 PM',
    status: 'Status'
  });
  const [editingId, setEditingId] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.status === 'Status') {
      alert("Please select a status");
      return;
    }

    if (editingId) {
      setSetups(setups.map(s => s.id === editingId ? { ...s, time: formData.time, status: formData.status } : s));
      setEditingId(null);
    } else {
      setSetups([{ id: Date.now(), time: formData.time, status: formData.status }, ...setups]);
    }
    setFormData({ time: '12:17 PM', status: 'Status' });
  };

  const handleEdit = (setup) => {
    setEditingId(setup.id);
    setFormData({ time: setup.time, status: setup.status });
  };

  const handleDelete = (id) => {
    if(confirm('Are you sure you want to delete this time setup?')) {
      setSetups(setups.filter(s => s.id !== id));
    }
  };

  const filteredSetups = setups.filter(s => 
    s.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">SMS Sending Time</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center text-sm text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/dashboard/students" className="hover:text-zinc-500 transition-colors">Student Info</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-zinc-600">SMS Sending Time</span>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold w-full sm:w-auto uppercase text-xs h-8">
            CRON COMMAND
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add/Edit Form */}
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit' : 'Add'} Time Setup</h2>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setFormData({time: '12:17 PM', status: 'Status'}); }} className="text-zinc-400 hover:text-white h-8">Cancel</Button>
              )}
            </div>
            <form className="p-6 space-y-6" onSubmit={handleSave}>
              <div className="space-y-1.5 relative">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">START TIME <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Input 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 pr-10" 
                    required
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Status <span className="text-rose-500">*</span></Label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
                  required
                >
                  <option value="Status">Status *</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  {editingId ? 'UPDATE TIME SETUP' : 'SAVE TIME SETUP'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Time Setup List</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="SEARCH" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[180px] bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 text-xs font-semibold uppercase" 
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Time</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSetups.length > 0 ? filteredSetups.map((s) => (
                    <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-4 text-zinc-300 font-medium">{s.time}</td>
                      <td className="px-4 py-4 text-zinc-400">
                        <span className={`px-2 py-1 rounded text-xs ${s.status === 'Active' ? 'bg-zinc-600/10 text-zinc-600 border border-zinc-600/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                         <Button 
                          onClick={() => handleEdit(s)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-zinc-600 border-zinc-600/50 hover:bg-zinc-600/10"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> EDIT
                        </Button>
                        <Button 
                          onClick={() => handleDelete(s.id)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> DELETE
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-zinc-500">
                        {searchQuery ? "No matching records found" : "No Data Available In Table"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-800 mt-auto flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredSetups.length > 0 ? 1 : 0} to {filteredSetups.length} of {filteredSetups.length} entries</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
