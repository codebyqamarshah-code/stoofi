'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, Trash2, Edit2, Share2, CheckCircle2, AlertCircle, Loader2, ToggleLeft, ToggleRight, Calendar, Users, Globe } from 'lucide-react';
import api from '@/services/api';

const FALLBACK = [
  { _id: 'f1', title: 'Mathematics Chapter 5 Notes', type: 'PDF Document', sharedWith: 'Everyone', targetType: 'All', expiryDate: '2027-01-31', downloads: 142, active: true, createdAt: '2026-09-01' },
  { _id: 'f2', title: 'Physics Lab Manual', type: 'PDF Document', sharedWith: 'Class 10-A', targetType: 'Class', expiryDate: '2026-12-31', downloads: 87, active: true, createdAt: '2026-09-10' },
  { _id: 'f3', title: 'Video Lecture: Organic Chemistry', type: 'Video Lecture', sharedWith: 'Section B', targetType: 'Section', expiryDate: '2026-11-30', downloads: 203, active: false, createdAt: '2026-08-25' },
  { _id: 'f4', title: 'English Grammar Workbook', type: 'ZIP Archive', sharedWith: 'Everyone', targetType: 'All', expiryDate: '2027-03-15', downloads: 56, active: true, createdAt: '2026-10-01' },
];

const CONTENT_OPTIONS = [
  { value: 'Mathematics Chapter 5 Notes', label: 'Mathematics Chapter 5 Notes' },
  { value: 'Physics Lab Manual', label: 'Physics Lab Manual' },
  { value: 'Video Lecture: Organic Chemistry', label: 'Video Lecture: Organic Chemistry' },
  { value: 'English Grammar Workbook', label: 'English Grammar Workbook' },
];

const emptyForm = { content: '', target: 'All', sharedWith: '', expiryDate: '' };

export default function SharedContentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
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
      const res = await api.get('/download-center/shared');
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
    if (!formData.content) e.content = 'Please select content';
    if (!formData.expiryDate) e.expiryDate = 'Expiry date is required';
    if ((formData.target === 'Class' || formData.target === 'Section') && !formData.sharedWith.trim()) {
      e.sharedWith = 'Please specify class/section';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: formData.content,
        type: 'PDF Document',
        targetType: formData.target,
        sharedWith: formData.target === 'All' ? 'Everyone' : formData.sharedWith,
        expiryDate: formData.expiryDate,
        downloads: 0,
        active: true,
      };
      const res = await api.post('/download-center/shared', payload);
      const newItem = res?.data || { _id: Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
      setItems(prev => [newItem, ...prev]);
      setFormData(emptyForm);
      setErrors({});
      showToast('Content shared successfully');
    } catch {
      showToast('Failed to share content', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    setItems(prev => prev.map(it => it._id === id ? { ...it, active: !it.active } : it));
    try {
      const item = items.find(i => i._id === id);
      await api.put(`/download-center/shared/${id}`, { active: !item.active });
    } catch {
      setItems(prev => prev.map(it => it._id === id ? { ...it, active: !it.active } : it));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this shared content?')) return;
    try {
      await api.delete(`/download-center/shared/${id}`);
      setItems(prev => prev.filter(it => it._id !== id));
      showToast('Removed successfully');
    } catch {
      showToast('Failed to remove', 'error');
    }
  };

  const filtered = useMemo(() =>
    items.filter(it =>
      it.title?.toLowerCase().includes(search.toLowerCase()) ||
      it.sharedWith?.toLowerCase().includes(search.toLowerCase()) ||
      it.type?.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  );

  const isExpired = (date) => date && new Date(date) < new Date();

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-zinc-900">Shared Content</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Download Center</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-900 font-semibold">Shared Content</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Shared', value: items.length, color: 'bg-blue-50 text-blue-700', icon: Share2 },
          { label: 'Active Shares', value: items.filter(i => i.active).length, color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
          { label: 'Shared with All', value: items.filter(i => i.targetType === 'All').length, color: 'bg-purple-50 text-purple-700', icon: Globe },
          { label: 'Total Downloads', value: items.reduce((a, b) => a + (b.downloads || 0), 0), color: 'bg-amber-50 text-amber-700', icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center gap-3">
            <span className={`p-2 rounded-lg ${color}`}><Icon className="h-5 w-5" /></span>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50">
              <h2 className="font-semibold text-zinc-800">Share Content</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Select Content <span className="text-rose-500">*</span></label>
                <select
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className={`w-full h-10 rounded-lg border px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] bg-white ${errors.content ? 'border-rose-400' : 'border-zinc-300'}`}
                >
                  <option value="">-- Select content --</option>
                  {CONTENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors.content && <p className="text-xs text-rose-500">{errors.content}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Share Target <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {['All', 'Class', 'Section'].map(t => (
                    <button key={t} type="button" onClick={() => setFormData({ ...formData, target: t, sharedWith: '' })}
                      className={`py-2 rounded-lg border text-sm font-medium transition-all ${formData.target === t ? 'border-[#084A86] bg-[#084A86] text-white' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {(formData.target === 'Class' || formData.target === 'Section') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">{formData.target} Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    placeholder={`e.g. ${formData.target === 'Class' ? 'Class 10-A' : 'Section B'}`}
                    value={formData.sharedWith}
                    onChange={e => setFormData({ ...formData, sharedWith: e.target.value })}
                    className={`w-full h-10 rounded-lg border px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] ${errors.sharedWith ? 'border-rose-400' : 'border-zinc-300'}`}
                  />
                  {errors.sharedWith && <p className="text-xs text-rose-500">{errors.sharedWith}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Expiry Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full h-10 rounded-lg border px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] ${errors.expiryDate ? 'border-rose-400' : 'border-zinc-300'}`}
                />
                {errors.expiryDate && <p className="text-xs text-rose-500">{errors.expiryDate}</p>}
              </div>

              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-[#084A86] hover:bg-[#073b6b] text-white text-sm font-semibold transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                {saving ? 'Sharing...' : 'Share Content'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-semibold text-zinc-800">Shared Items</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-3 h-9 w-56 rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Shared With</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Expiry</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-zinc-500 uppercase">DLs</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-zinc-500 uppercase">Active</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="7" className="px-4 py-10 text-center text-zinc-400"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="7" className="px-4 py-10 text-center text-zinc-400">No shared content found</td></tr>
                  ) : filtered.map(item => (
                    <tr key={item._id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-900 max-w-[180px] truncate">{item.title}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{item.type}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">{item.sharedWith}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs ${isExpired(item.expiryDate) ? 'text-rose-500' : 'text-zinc-500'}`}>
                          <Calendar className="h-3 w-3" />
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}
                          {isExpired(item.expiryDate) && <span className="ml-1 font-semibold">(Expired)</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-700 font-semibold text-sm">{item.downloads || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleToggle(item._id)} className="transition-colors">
                          {item.active
                            ? <ToggleRight className="h-6 w-6 text-emerald-500" />
                            : <ToggleLeft className="h-6 w-6 text-zinc-400" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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