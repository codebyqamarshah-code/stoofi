'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, Trash2, Edit2, FileText, Video, Image, Archive, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';

const ICON_OPTIONS = [
  { label: 'FileText', value: 'FileText', Icon: FileText },
  { label: 'Video', value: 'Video', Icon: Video },
  { label: 'Image', value: 'Image', Icon: Image },
  { label: 'Archive', value: 'Archive', Icon: Archive },
];

const getIconComponent = (name) => {
  const found = ICON_OPTIONS.find(o => o.value === name);
  return found ? found.Icon : FileText;
};

const FALLBACK = [
  { _id: 'f1', name: 'PDF Document', description: 'Standard PDF files for reading and printing', icon: 'FileText' },
  { _id: 'f2', name: 'Video Lecture', description: 'Recorded video lectures for online learning', icon: 'Video' },
  { _id: 'f3', name: 'Image Gallery', description: 'Image collections and visual study material', icon: 'Image' },
  { _id: 'f4', name: 'ZIP Archive', description: 'Compressed archive files with multiple resources', icon: 'Archive' },
];

const emptyForm = { name: '', description: '', icon: 'FileText' };

export default function ContentTypePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/content-type');
      if (res && res.success && res.data?.length > 0) {
        setItems(res.data);
      } else {
        setItems(FALLBACK);
      }
    } catch {
      setItems(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.icon) e.icon = 'Icon is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await api.put(`/content-type/${editId}`, formData);
        if (res && res.success) {
          setItems(prev => prev.map(it => it._id === editId ? { ...it, ...formData } : it));
          showToast('Content type updated successfully');
        }
      } else {
        const res = await api.post('/content-type', formData);
        const newItem = res?.data || { _id: Date.now().toString(), ...formData };
        setItems(prev => [newItem, ...prev]);
        showToast('Content type added successfully');
      }
      setFormData(emptyForm);
      setEditId(null);
      setErrors({});
    } catch {
      showToast('Failed to save content type', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({ name: item.name, description: item.description || '', icon: item.icon || 'FileText' });
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this content type?')) return;
    setDeleting(id);
    try {
      await api.delete(`/content-type/${id}`);
      setItems(prev => prev.filter(it => it._id !== id));
      showToast('Deleted successfully');
    } catch {
      showToast('Failed to delete', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setFormData(emptyForm);
    setErrors({});
  };

  const filtered = useMemo(() =>
    items.filter(it => it.name?.toLowerCase().includes(search.toLowerCase()) || it.description?.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-zinc-900">Content Types</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Download Center</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-900 font-semibold">Content Types</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50">
              <h2 className="font-semibold text-zinc-800">{editId ? 'Edit Content Type' : 'Add Content Type'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. PDF Document"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full h-10 rounded-lg border px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] ${errors.name ? 'border-rose-400' : 'border-zinc-300'}`}
                />
                {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this content type..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Icon <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {ICON_OPTIONS.map(({ label, value, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: value })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${formData.icon === value ? 'border-[#084A86] bg-[#084A86]/5 text-[#084A86]' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
                {errors.icon && <p className="text-xs text-rose-500">{errors.icon}</p>}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-[#084A86] hover:bg-[#073b6b] text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : editId ? 'Update' : 'Save'}
                </button>
                {editId && (
                  <button type="button" onClick={handleCancel} className="h-10 px-4 rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 text-sm font-semibold transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-semibold text-zinc-800">Content Type List</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-3 h-9 w-56 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Icon</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="5" className="px-4 py-10 text-center text-zinc-400"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="5" className="px-4 py-10 text-center text-zinc-400">No content types found</td></tr>
                  ) : filtered.map((item, idx) => {
                    const IconComp = getIconComponent(item.icon);
                    return (
                      <tr key={item._id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 text-zinc-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#084A86]/10 text-[#084A86]">
                            <IconComp className="h-4 w-4" />
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900">{item.name}</td>
                        <td className="px-4 py-3 text-zinc-500 max-w-xs truncate">{item.description || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-[#084A86] hover:bg-[#084A86]/10 transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(item._id)} disabled={deleting === item._id} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50">
                              {deleting === item._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-zinc-100 text-xs text-zinc-400">
              Showing {filtered.length} of {items.length} records
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}