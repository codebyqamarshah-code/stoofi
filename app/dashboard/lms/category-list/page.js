'use client';

import Link from 'next/link';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    position: '',
    status: 'Active',
    icon: '',
    thumbnail: ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setCategories([{ ...formData, id: Date.now() }, ...categories]);
    setFormData({
      name: '',
      description: '',
      parent: '',
      position: '',
      status: 'Active',
      icon: '',
      thumbnail: ''
    });
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Course Category</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Course Category</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Course Category</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Name <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Description</Label>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex min-h-[70px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Parent Category</Label>
                <select 
                  value={formData.parent}
                  onChange={(e) => setFormData({...formData, parent: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="">Parent Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Position Order</Label>
                <Input 
                  type="number" 
                  placeholder="Position Order" 
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Status</Label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Icon</Label>
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="BROWSE IMAGE FILE" readOnly className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs" />
                  <Button type="button" variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-white shrink-0 text-xs font-semibold">BROWSE</Button>
                </div>
                <p className="text-[10px] text-zinc-500">Recommended size 200px x 200px</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Thumbnail Image</Label>
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="BROWSE FILE" readOnly className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs" />
                  <Button type="button" variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-white shrink-0 text-xs font-semibold">BROWSE</Button>
                </div>
                <p className="text-[10px] text-zinc-500">Recommended size 1140px x 300px</p>
              </div>

              <div className="pt-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">SAVE CATEGORY</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Course Category</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="SEARCH" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[160px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs font-semibold uppercase" 
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
                    <th className="px-4 py-3 font-semibold">SL</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Parent</th>
                    <th className="px-4 py-3 font-semibold">Position</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold">Icon</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length > 0 ? filteredCategories.map((c, i) => (
                    <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-4 text-zinc-300">{i + 1}</td>
                      <td className="px-4 py-4 text-zinc-300">{c.name}</td>
                      <td className="px-4 py-4 text-zinc-300">{c.parent || '-'}</td>
                      <td className="px-4 py-4 text-zinc-300">{c.position || '-'}</td>
                      <td className="px-4 py-4 text-zinc-300">{c.description || '-'}</td>
                      <td className="px-4 py-4 text-zinc-300">No Image</td>
                      <td className="px-4 py-4">
                        <Button 
                          onClick={() => handleDelete(c.id)}
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
                      <td colSpan="7" className="px-4 py-8 text-center text-zinc-500">
                        {searchQuery ? "No matching records found" : "No Data Available In Table"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredCategories.length > 0 ? 1 : 0} to {filteredCategories.length} of {filteredCategories.length} entries</div>
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
