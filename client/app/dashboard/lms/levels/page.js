'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, Plus, Trash2, Edit2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function CourseLevelPage() {
  const [levels, setLevels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const res = await api.get('/lms-course-level');
      if (res && res.success) {
        setLevels(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        const res = await api.put(`/lms-course-level/${editingId}`, { name: formData.name.trim() });
        if (res.success) {
          setLevels(levels.map(l => l._id === editingId ? { ...l, name: res.data.name } : l));
          setEditingId(null);
          setFormData({ name: '' });
        }
      } else {
        const res = await api.post('/lms-course-level', { name: formData.name.trim() });
        if (res.success) {
          setLevels([res.data, ...levels]);
          setFormData({ name: '' });
        }
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Error saving course level');
    }
  };

  const handleEdit = (levelObj) => {
    setEditingId(levelObj._id);
    setFormData({ name: levelObj.name });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this course level?')) {
      try {
        const res = await api.delete(`/lms-course-level/${id}`);
        if (res.success) {
          setLevels(levels.filter(l => l._id !== id));
        }
      } catch (err) {
        alert('Error deleting course level');
      }
    }
  };

  const toggleStatus = async (level) => {
    try {
      const newStatus = !level.status;
      const res = await api.put(`/lms-course-level/${level._id}`, { status: newStatus });
      if (res.success) {
        setLevels(levels.map(l => l._id === level._id ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const filteredLevels = useMemo(() => {
    return levels.filter(l => 
      (l.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [levels, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Layers className="h-6 w-6 text-indigo-500" />
          Course Level
        </h1>
        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-400 dark:text-zinc-500">Course Level</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{editingId ? 'Edit Level' : 'Add Level'}</h2>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setFormData({name: ''}); }} className="text-zinc-500 dark:text-zinc-400 h-8">Cancel</Button>
              )}
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">Level Name <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="e.g. Beginner, Intermediate..." 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500 text-zinc-900 dark:text-white" 
                  required
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  {editingId ? 'UPDATE LEVEL' : 'SAVE LEVEL'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/30">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Level List</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[180px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500 text-xs font-semibold uppercase text-zinc-900 dark:text-white" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-zinc-500">Loading...</td>
                    </tr>
                  ) : filteredLevels.length > 0 ? filteredLevels.map((l) => (
                    <tr key={l._id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-4 text-zinc-900 dark:text-zinc-300 font-medium">{l.name}</td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => toggleStatus(l)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${l.status ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}
                        >
                          {l.status ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                         <Button 
                          onClick={() => handleEdit(l)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" /> EDIT
                        </Button>
                        <Button 
                          onClick={() => handleDelete(l._id)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-rose-600 dark:text-rose-500 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> DELETE
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-zinc-500">
                        {searchQuery ? "No matching levels found" : "No Data Available In Table"}
                      </td>
                    </tr>
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
