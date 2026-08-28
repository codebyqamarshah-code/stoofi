'use client';

import Link from 'next/link';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StudentGroupPage() {
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ group: '' });
  const [editingId, setEditingId] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.group.trim()) return;

    if (editingId) {
      setGroups(groups.map(g => g.id === editingId ? { ...g, group: formData.group.trim() } : g));
      setEditingId(null);
    } else {
      setGroups([{ id: Date.now(), group: formData.group.trim(), students: 0 }, ...groups]);
    }
    setFormData({ group: '' });
  };

  const handleEdit = (groupObj) => {
    setEditingId(groupObj.id);
    setFormData({ group: groupObj.group });
  };

  const handleDelete = (id) => {
    if(confirm('Are you sure you want to delete this group?')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  const filteredGroups = useMemo(() => {
    return groups.filter(g => 
      g.group.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Student Group</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/students" className="hover:text-emerald-400 transition-colors">Student Info</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Student Group</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add/Edit Form */}
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit' : 'Add'} Student Group</h2>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setFormData({group: ''}); }} className="text-zinc-400 hover:text-white h-8">Cancel</Button>
              )}
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Group <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="Group Name" 
                  value={formData.group}
                  onChange={(e) => setFormData({...formData, group: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
                  required
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {editingId ? 'UPDATE GROUP' : 'SAVE GROUP'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Student Group List</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="SEARCH" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[180px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs font-semibold uppercase" 
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
                    <th className="px-4 py-3 font-semibold">Group</th>
                    <th className="px-4 py-3 font-semibold">Students</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.length > 0 ? filteredGroups.map((g) => (
                    <tr key={g.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-4 text-zinc-300 font-medium">{g.group}</td>
                      <td className="px-4 py-4 text-zinc-400">{g.students}</td>
                      <td className="px-4 py-4 text-right space-x-2">
                         <Button 
                          onClick={() => handleEdit(g)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> EDIT
                        </Button>
                        <Button 
                          onClick={() => handleDelete(g.id)}
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
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredGroups.length > 0 ? 1 : 0} to {filteredGroups.length} of {filteredGroups.length} entries</div>
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
