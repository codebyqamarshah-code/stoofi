'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import Link from 'next/link';

import React, { useState, useMemo } from 'react';
import api from '@/services/api';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  React.useEffect(() => { fetchCategories(); }, []);
  const fetchCategories = async () => { try { const res = await api.get('/lms-category'); if(res.success) setCategories(res.data); } catch(e){} };
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    try {
      const res = await api.post('/lms-category', formData);
      if (res.success) {
        setCategories([res.data, ...categories]);
        setFormData({
          name: '',
          description: '',
          parent: '',
          position: '',
          status: 'Active',
          icon: '',
          thumbnail: ''
        });
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete('/lms-category/' + id);
      fetchCategories();
    } catch(e) { alert(e.message); }
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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-950">Course Category</h1>
        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Course Category</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-950">Add Course Category</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Name <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 focus-visible:ring-zinc-600" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Description</Label>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex min-h-[70px] w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-900 dark:text-zinc-950 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Parent Category</Label>
                <select 
                  value={formData.parent}
                  onChange={(e) => setFormData({...formData, parent: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
                >
                  <option value="">Parent Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Position Order</Label>
                <Input 
                  type="number" 
                  placeholder="Position Order" 
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 focus-visible:ring-zinc-600" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Status</Label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-900 dark:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Icon</Label>
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="BROWSE IMAGE FILE" readOnly className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 focus-visible:ring-zinc-600 text-xs" />
                  <Button type="button" variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 shrink-0 text-xs font-semibold">BROWSE</Button>
                </div>
                <p className="text-[10px] text-zinc-500">Recommended size 200px x 200px</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Thumbnail Image</Label>
                <div className="flex items-center gap-2">
                  <Input type="text" placeholder="BROWSE FILE" readOnly className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 focus-visible:ring-zinc-600 text-xs" />
                  <Button type="button" variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 shrink-0 text-xs font-semibold">BROWSE</Button>
                </div>
                <p className="text-[10px] text-zinc-500">Recommended size 1140px x 300px</p>
              </div>

              <div className="pt-2">
                <Button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-semibold">SAVE CATEGORY</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-950">Course Category</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="SEARCH" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[160px] bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 focus-visible:ring-zinc-600 text-xs font-semibold uppercase" 
                  />
                </div>
                <TableExportToolbar />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-600 dark:text-zinc-700 uppercase font-bold bg-white dark:bg-zinc-50 border-b border-zinc-200 dark:border-zinc-200">
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
                    <tr key={c.id} className="border-b border-zinc-200 dark:border-zinc-200/50 hover:bg-zinc-50 dark:hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-4 text-zinc-950">{i + 1}</td>
                      <td className="px-4 py-4 text-zinc-950">{c.name}</td>
                      <td className="px-4 py-4 text-zinc-950">{c.parent || '-'}</td>
                      <td className="px-4 py-4 text-zinc-950">{c.position || '-'}</td>
                      <td className="px-4 py-4 text-zinc-950">{c.description || '-'}</td>
                      <td className="px-4 py-4 text-zinc-950">No Image</td>
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
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredCategories.length > 0 ? 1 : 0} to {filteredCategories.length} of {filteredCategories.length} entries</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-200 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-200 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}