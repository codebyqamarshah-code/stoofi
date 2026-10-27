'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Search, Plus, Pencil, Trash2,
  Building2, CheckCircle2, X, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEMO_DEPARTMENTS = [
  { id: 1, name: 'IT', description: 'Information Technology and Computer Science department' },
  { id: 2, name: 'Administration', description: 'School administrative and management operations' },
  { id: 3, name: 'Finance', description: 'Financial planning, accounts and budget management' },
  { id: 4, name: 'Science', description: 'Physics, Chemistry, Biology and Lab Sciences' },
  { id: 5, name: 'Arts & Humanities', description: 'Literature, History, Social Studies and Islamic Education' },
  { id: 6, name: 'Mathematics', description: 'Pure and Applied Mathematics department' },
];

const EMPTY_FORM = { name: '', description: '' };

export default function DepartmentPage() {
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
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/department');
      if (res?.success && res.data?.length > 0) setDepartments(res.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showError('Department name is required.');
    setSaving(true);
    try {
      if (editId) {
        const res = await api.put(`/department/${editId}`, form);
        if (res?.success || res?.data) {
          setDepartments(prev => prev.map(d => ((d._id || d.id) === editId) ? { ...d, ...form } : d));
          showSuccess('Department updated successfully.');
        } else {
          setDepartments(prev => prev.map(d => ((d._id || d.id) === editId) ? { ...d, ...form } : d));
          showSuccess('Department updated successfully.');
        }
      } else {
        const res = await api.post('/department', form);
        const newDept = res?.data || { _id: String(Date.now()), ...form };
        setDepartments(prev => [newDept, ...prev]);
        showSuccess('Department added successfully.');
      }
      setForm(EMPTY_FORM);
      setEditId(null);
    } catch (err) {
      showError(err?.response?.data?.message || err?.message || 'Failed to save department. Please try again.');
    } finally { setSaving(false); }
  };

  const handleEdit = (dept) => {
    setEditId(dept._id || dept.id);
    setForm({ name: dept.name, description: dept.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await api.delete(`/department/${id}`);
    } catch (_) {}
    setDepartments(prev => prev.filter(d => (d._id || d.id) !== id));
    setDeleteId(null);
    showSuccess('Department deleted.');
    if (editId === id) { setEditId(null); setForm(EMPTY_FORM); }
  };

  const handleCancel = () => { setEditId(null); setForm(EMPTY_FORM); setError(''); };

  const filtered = useMemo(() =>
    departments.filter(d =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
    ), [departments, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Department Management</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Add, edit, and manage school departments</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/hr" className="hover:text-zinc-600 transition-colors">HR</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Department</span>
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
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-semibold text-zinc-900">{editId ? 'Edit Department' : 'Add Department'}</h2>
              </div>
              {editId && (
                <button onClick={handleCancel} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                  Department Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Science, IT, Finance"
                  className="border-zinc-300 focus-visible:ring-[#084A86] focus-visible:border-[#084A86]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Description</Label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this department..."
                  rows={4}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86] focus:border-[#084A86] resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#084A86] hover:bg-[#073b6b] text-white gap-2"
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Plus className="h-4 w-4" /> {editId ? 'Update' : 'Add Department'}</>}
                </Button>
                {editId && (
                  <Button type="button" variant="outline" onClick={handleCancel} className="border-zinc-300 text-zinc-600">
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
                <h2 className="font-semibold text-zinc-900">Departments</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{filtered.length} department{filtered.length !== 1 ? 's' : ''} found</p>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search departments..."
                  className="pl-9 border-zinc-300 focus-visible:ring-[#084A86] text-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-2 text-zinc-400">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading departments...
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase w-10">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-500 uppercase w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-zinc-400 text-sm">
                          <Building2 className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                          No departments found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((dept, idx) => {
                        const dId = dept._id || dept.id;
                        return (
                        <tr key={dId} className={`hover:bg-zinc-50/70 transition-colors ${editId === dId ? 'bg-blue-50/50' : ''}`}>
                          <td className="px-4 py-3.5 text-zinc-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-md bg-[#084A86]/10 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-3.5 w-3.5 text-[#084A86]" />
                              </div>
                              <span className="font-medium text-zinc-900">{dept.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-zinc-500 text-xs max-w-[200px] truncate" title={dept.description}>
                            {dept.description || <span className="text-zinc-300 italic">No description</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEdit(dept)}
                                className="p-1.5 rounded-md text-zinc-400 hover:text-[#084A86] hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(dId)}
                                disabled={deleteId === dId}
                                className="p-1.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                {deleteId === dId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                      })
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
