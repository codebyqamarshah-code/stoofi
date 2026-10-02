'use client';

import Link from 'next/link';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContentTypePage() {
  const [types, setTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setTypes([{ ...formData, id: Date.now() }, ...types]);
    setFormData({ name: '', description: '' }); // Reset form
  };

  const handleDelete = (id) => {
    setTypes(types.filter(t => t.id !== id));
  };

  const filteredTypes = useMemo(() => {
    return types.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [types, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Content Type</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Download Center</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Content Type</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-950">Add Type</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Name <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" 
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Description</Label>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex min-h-[90px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-zinc-950 resize-y"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold">SAVE</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-950">Content Type List</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="SEARCH" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[180px] bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600 text-xs font-semibold uppercase" 
                  />
                </div>
                <div className="flex items-center border border-zinc-200 rounded-md bg-zinc-900">
                  {[FileText, Download, FileText, Download, Printer, MoreVertical].map((Icon, i) => (
                    <button key={i} className={`p-2 hover:bg-zinc-100 text-zinc-400 transition-colors ${i < 5 ? 'border-r border-zinc-200' : ''}`}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTypes.length > 0 ? filteredTypes.map((t, i) => (
                    <tr key={t.id} className="border-b border-zinc-200/50 hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-4 text-zinc-950">{t.name}</td>
                      <td className="px-4 py-4 text-zinc-950">{t.description}</td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          onClick={() => handleDelete(t.id)}
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
            <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredTypes.length > 0 ? 1 : 0} to {filteredTypes.length} of {filteredTypes.length} entries</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-200 bg-transparent hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
