'use client';

import Link from 'next/link';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StudentCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ type: '' });
  const [editingId, setEditingId] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.type.trim()) return;

    if (editingId) {
      setCategories(categories.map(c => c.id === editingId ? { ...c, type: formData.type.trim() } : c));
      setEditingId(null);
    } else {
      setCategories([{ id: Date.now(), type: formData.type.trim() }, ...categories]);
    }
    setFormData({ type: '' });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ type: category.type });
  };

  const handleDelete = (id) => {
    if(confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Student Category</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-500 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Student Category</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add/Edit Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-950">{editingId ? 'Edit' : 'Add'} Student Category</h2>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setFormData({type: ''}); }} className="text-zinc-400 hover:text-zinc-950 h-8">Cancel</Button>
              )}
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Type <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="Category Type" 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium" 
                  required
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg shadow-xs">
                  {editingId ? 'UPDATE CATEGORY' : 'SAVE CATEGORY'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-950">Student Category List</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="SEARCH" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[180px] bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-700 focus-visible:ring-zinc-400 font-medium text-xs font-semibold uppercase" 
                  />
                </div>
                <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-xs">
                  {[FileText, Download, FileText, Download, Printer, MoreVertical].map((Icon, i) => (
                    <button key={i} className={`p-2 hover:bg-zinc-100 text-zinc-700 transition-colors ${i < 5 ? 'border-r border-zinc-200' : ''}`}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">SL</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length > 0 ? filteredCategories.map((c, i) => (
                    <tr key={c.id} className="border-b border-zinc-100/50 hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-4 text-zinc-950">{i + 1}</td>
                      <td className="px-4 py-4 text-zinc-950">{c.type}</td>
                      <td className="px-4 py-4 text-right space-x-2">
                         <Button 
                          onClick={() => handleEdit(c)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-zinc-600 border-zinc-600/50 hover:bg-zinc-600/10"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> EDIT
                        </Button>
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
                      <td colSpan="3" className="px-4 py-8 text-center text-zinc-500">
                        {searchQuery ? "No matching records found" : "No Data Available In Table"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredCategories.length > 0 ? 1 : 0} to {filteredCategories.length} of {filteredCategories.length} entries</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
