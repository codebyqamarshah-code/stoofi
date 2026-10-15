'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Search, Plus, Pencil, Trash2,
  Briefcase, CheckCircle2, X, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEMO_DEPARTMENTS = [
  { id: 1, name: 'IT' },
  { id: 2, name: 'Administration' },
  { id: 3, name: 'Finance' },
  { id: 4, name: 'Science' },
  { id: 5, name: 'Arts & Humanities' },
  { id: 6, name: 'Mathematics' },
];

const DEMO_DESIGNATIONS = [
  { id: 1, name: 'Principal', departmentId: 2, department: 'Administration', description: 'Head of the school and academic leader' },
  { id: 2, name: 'Teacher', departmentId: 4, department: 'Science', description: 'Subject teacher responsible for instruction' },
  { id: 3, name: 'Admin Officer', departmentId: 2, department: 'Administration', description: 'Manages day-to-day administrative tasks' },
  { id: 4, name: 'Accountant', departmentId: 3, department: 'Finance', description: 'Handles school financial accounts and records' },
  { id: 5, name: 'IT Coordinator', departmentId: 1, department: 'IT', description: 'Manages IT infrastructure and systems' },
  { id: 6, name: 'Librarian', departmentId: 2, department: 'Administration', description: 'Manages the school library and resources' },
];

const EMPTY_FORM = { name: '', departmentId: '', description: '' };

export default function DesignationPage() {
  const [designations, setDesignations] = useState(DEMO_DESIGNATIONS);
  const [departments, setDepartments] = useState(DEMO_DEPARTMENTS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [deptRes, desigRes] = await Promise.allSettled([
        api.get('/Department'),
        api.get('/designation'),
      ]);
      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.length > 0) {
        setDepartments(deptRes.value.data);
      }
      if (desigRes.status === 'fulfilled' && desigRes.value?.data?.length > 0) {
        setDesignations(desigRes.value.data);
      }
    } catch (_) {}
    finally { setLoading(false); }
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };

  const getDeptName = (id) => departments.find(d => d.id === Number(id))?.name || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showError('Designation name is required.');
    setSaving(true);
    try {
      const payload = { ...form, departmentId: Number(form.departmentId) };
      if (editId) {
        await api.put(`/designation/${editId}`, payload).catch(() => {});
        setDesignations(prev => prev.map(d => d.id === editId
          ? { ...d, ...payload, department: getDeptName(form.departmentId) } : d));
        showSuccess('Designation updated successfully.');
      } else {
        const res = await api.post('/designation', payload).catch(() => ({ data: null }));
        const newItem = res?.data || { id: Date.now(), ...payload, department: getDeptName(form.departmentId) };
        setDesignations(prev => [...prev, newItem]);
        showSuccess('Designation added successfully.');
      }
      setForm(EMPTY_FORM);
      setEditId(null);
    } catch (_) {
      showError('Failed to save designation. Please try again.');
    } finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ name: item.name, departmentId: item.departmentId || '', description: item.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    try { await api.delete(`/designation/${id}`); } catch (_) {}
    setDesignations(prev => prev.filter(d => d.id !== id));
    setDeleteId(null);
    showSuccess('Designation deleted.');
    if (editId === id) { setEditId(null); setForm(EMPTY_FORM); }
  };

  const filtered = useMemo(() =>
    designations.filter(d =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.department?.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
    ), [designations, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Designation Management</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage staff designations and job titles</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/hr" className="hover:text-zinc-600 transition-colors">HR</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Designation</span>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden sticky top-4">
            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#084A86] rounded-md">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-semibold text-zinc-900">{editId ? 'Edit Designation' : 'Add Designation'}</h2>
              </div>
              {editId && (
                <button onClick={() => { setEditId(null); setForm(EMPTY_FORM); }} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                  Designation Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Teacher, Principal, Accountant"
                  className="border-zinc-300 focus-visible:ring-[#084A86] focus-visible:border-[#084A86]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Department</Label>
                <select
                  value={form.departmentId}
                  onChange={e => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] focus:border-[#084A86]"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Description</Label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this designation..."
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86] focus:border-[#084A86] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#084A86] hover:bg-[#073b6b] text-white gap-2"
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Plus className="h-4 w-4" /> {editId ? 'Update' : 'Add Designation'}</>}
                </Button>
                {editId && (
                  <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(EMPTY_FORM); }} className="border-zinc-300 text-zinc-600">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-semibold text-zinc-900">Designations</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{filtered.length} designation{filtered.length !== 1 ? 's' : ''} found</p>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search designations..."
                  className="pl-9 border-zinc-300 focus-visible:ring-[#084A86] text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-2 text-zinc-400">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading...
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase w-10">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-500 uppercase w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-zinc-400 text-sm">
                          <Briefcase className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                          No designations found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item, idx) => (
                        <tr key={item.id} className={`hover:bg-zinc-50/70 transition-colors ${editId === item.id ? 'bg-blue-50/50' : ''}`}>
                          <td className="px-4 py-3.5 text-zinc-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-md bg-[#084A86]/10 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="h-3.5 w-3.5 text-[#084A86]" />
                              </div>
                              <span className="font-medium text-zinc-900">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {item.department
                              ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#084A86]">{item.department}</span>
                              : <span className="text-zinc-300 text-xs italic">—</span>}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-500 text-xs max-w-[160px] truncate" title={item.description}>
                            {item.description || <span className="text-zinc-300 italic">No description</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 rounded-md text-zinc-400 hover:text-[#084A86] hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={deleteId === item.id}
                                className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                {deleteId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
