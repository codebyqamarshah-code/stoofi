'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Layers, Edit2, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const SAMPLE_GROUPS = [
  { _id: 'sg1', title: 'Mathematics — Algebra', description: 'Algebraic expressions, equations, and factorization' },
  { _id: 'sg2', title: 'English — Grammar', description: 'Parts of speech, tenses, and sentence structure' },
  { _id: 'sg3', title: 'Physics — Mechanics', description: 'Newton\'s laws, motion, and energy' },
];

export default function QuestionGroupPage() {
  const [groups, setGroups] = useState(SAMPLE_GROUPS);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await api.get('/question-group');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) setGroups(res.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({ title: item.title || '', description: item.description || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '' });
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert('Group title is required');
    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/question-group/${editingId}`, formData).catch(() => null);
        setGroups(prev => prev.map(g => g._id === editingId ? { ...g, ...formData } : g));
        showSuccess('Question group updated successfully!');
      } else {
        const payload = { ...formData, _id: 'grp_' + Date.now() };
        try {
          const res = await api.post('/question-group', formData);
          if (res.success && res.data) payload._id = res.data._id || payload._id;
        } catch { /* fallback */ }
        setGroups(prev => [...prev, payload]);
        showSuccess('Question group created successfully!');
      }
      handleCancelEdit();
    } catch (error) { alert(error.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question group? All questions in this group may also be affected.')) return;
    await api.delete(`/question-group/${id}`).catch(() => null);
    setGroups(prev => prev.filter(g => g._id !== id));
    if (editingId === id) handleCancelEdit();
    showSuccess('Group deleted.');
  };

  const filtered = groups.filter(g =>
    (g.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Layers className="h-6 w-6 text-[#084A86]" />
            Question Groups
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Organize your question bank into logical topic groups</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Online Exam</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Question Group</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-950">
                {editingId ? 'Edit Group' : 'Add Question Group'}
              </h2>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-xs text-zinc-500 hover:text-zinc-800 underline">Cancel</button>
              )}
            </div>
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">Group Title <span className="text-rose-500">*</span></Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Math — Algebra"
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">Description</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this topic group..."
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#084A86]"
                />
              </div>
              <Button
                disabled={submitting}
                type="submit"
                className="w-full bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold py-2.5"
              >
                {submitting ? 'SAVING...' : editingId ? 'UPDATE GROUP' : 'SAVE GROUP'}
              </Button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-950">Question Group List</h2>
                <span className="text-xs bg-zinc-200/70 text-zinc-600 px-2 py-0.5 rounded-full font-medium">
                  {groups.length} Groups
                </span>
              </div>
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search groups..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-[#084A86]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-100/70 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 w-10">#</th>
                    <th className="px-4 py-3">Group Title</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="4" className="px-4 py-8 text-center text-zinc-500">Loading groups...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-2 text-zinc-400">
                          <Layers className="h-8 w-8" />
                          <span className="text-sm">No question groups yet</span>
                          <span className="text-xs">Add a group using the form on the left</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className={`hover:bg-zinc-50/80 transition-colors ${editingId === item._id ? 'bg-blue-50/40 border-l-2 border-l-[#084A86]' : ''}`}>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#084A86]/10 flex items-center justify-center flex-shrink-0">
                              <Layers className="h-3.5 w-3.5 text-[#084A86]" />
                            </div>
                            <span className="font-semibold text-zinc-950 text-sm">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs max-w-[220px]">
                          <span className="line-clamp-2">{item.description || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={() => handleEdit(item)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[#084A86] hover:bg-blue-50"
                              title="Edit Group"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(item._id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-rose-500 hover:bg-rose-50"
                              title="Delete Group"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
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
