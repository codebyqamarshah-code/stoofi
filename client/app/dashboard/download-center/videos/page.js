'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, Trash2, Edit2, Play, CheckCircle2, AlertCircle, Loader2, Eye, Plus, X, Video, LayoutGrid, List } from 'lucide-react';
import api from '@/services/api';

const FALLBACK = [
  { _id: 'v1', title: 'Introduction to Algebra', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: 'Mathematics', className: 'Class 9', description: 'Basics of algebraic expressions and equations.', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', views: 324, duration: '18:45', createdAt: '2026-08-10' },
  { _id: 'v2', title: 'Newton\'s Laws of Motion', youtubeUrl: 'https://www.youtube.com/watch?v=kKKM8Y-u7ds', category: 'Physics', className: 'Class 10', description: 'Understanding the three laws of motion.', thumbnail: 'https://img.youtube.com/vi/kKKM8Y-u7ds/hqdefault.jpg', views: 512, duration: '22:10', createdAt: '2026-08-15' },
  { _id: 'v3', title: 'Photosynthesis Explained', youtubeUrl: 'https://www.youtube.com/watch?v=AN4SI9d7QQ4', category: 'Biology', className: 'Class 8', description: 'How plants make food using sunlight.', thumbnail: 'https://img.youtube.com/vi/AN4SI9d7QQ4/hqdefault.jpg', views: 198, duration: '14:30', createdAt: '2026-09-01' },
  { _id: 'v4', title: 'World War II Overview', youtubeUrl: 'https://www.youtube.com/watch?v=fo2Rb9h788s', category: 'History', className: 'Class 11', description: 'Comprehensive overview of World War II events.', thumbnail: 'https://img.youtube.com/vi/fo2Rb9h788s/hqdefault.jpg', views: 445, duration: '35:20', createdAt: '2026-09-12' },
];

const CATEGORIES = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer Science', 'Other'];
const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

const getYTThumb = (url) => {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const emptyForm = { title: '', youtubeUrl: '', category: '', className: '', description: '', thumbnail: '', duration: '' };

export default function VideosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
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
      const res = await api.get('/download-center/video');
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
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.youtubeUrl.trim()) e.youtubeUrl = 'YouTube/Vimeo URL is required';
    if (!formData.category) e.category = 'Category is required';
    if (!formData.className) e.className = 'Class is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUrlChange = (url) => {
    const thumb = getYTThumb(url);
    setFormData(prev => ({ ...prev, youtubeUrl: url, thumbnail: thumb || prev.thumbnail }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...formData, thumbnail: getYTThumb(formData.youtubeUrl) || formData.thumbnail, views: 0 };
      if (editId) {
        const res = await api.put(`/download-center/video/${editId}`, payload);
        setItems(prev => prev.map(it => it._id === editId ? { ...it, ...payload } : it));
        showToast('Video updated successfully');
      } else {
        const res = await api.post('/download-center/video', payload);
        const newItem = res?.data || { _id: Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
        setItems(prev => [newItem, ...prev]);
        showToast('Video added successfully');
      }
      setFormData(emptyForm);
      setEditId(null);
      setShowForm(false);
      setErrors({});
    } catch {
      showToast('Failed to save video', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({ title: item.title, youtubeUrl: item.youtubeUrl || '', category: item.category || '', className: item.className || '', description: item.description || '', thumbnail: item.thumbnail || '', duration: item.duration || '' });
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this video?')) return;
    try {
      await api.delete(`/download-center/video/${id}`);
      setItems(prev => prev.filter(it => it._id !== id));
      showToast('Video deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const filtered = useMemo(() =>
    items.filter(it =>
      (it.title?.toLowerCase().includes(search.toLowerCase()) || it.category?.toLowerCase().includes(search.toLowerCase())) &&
      (!categoryFilter || it.category === categoryFilter)
    ),
    [items, search, categoryFilter]
  );

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
        <h1 className="text-2xl font-bold text-zinc-900">Video Library</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Download Center</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-900 font-semibold">Videos</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input type="text" placeholder="Search videos..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-3 h-9 w-full rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-zinc-300 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#084A86] bg-white">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex border border-zinc-300 rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-[#084A86] text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-[#084A86] text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}><List className="h-4 w-4" /></button>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setFormData(emptyForm); }}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#084A86] hover:bg-[#073b6b] text-white text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" /> Add Video
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
              <h2 className="font-bold text-zinc-900">{editId ? 'Edit Video' : 'Add New Video'}</h2>
              <button onClick={() => { setShowForm(false); setEditId(null); setErrors({}); }} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase">Title <span className="text-rose-500">*</span></label>
                <input type="text" placeholder="Video title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full h-10 rounded-lg border px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] ${errors.title ? 'border-rose-400' : 'border-zinc-300'}`} />
                {errors.title && <p className="text-xs text-rose-500">{errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase">YouTube / Vimeo URL <span className="text-rose-500">*</span></label>
                <input type="url" placeholder="https://youtube.com/watch?v=..." value={formData.youtubeUrl} onChange={e => handleUrlChange(e.target.value)}
                  className={`w-full h-10 rounded-lg border px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] ${errors.youtubeUrl ? 'border-rose-400' : 'border-zinc-300'}`} />
                {errors.youtubeUrl && <p className="text-xs text-rose-500">{errors.youtubeUrl}</p>}
                {getYTThumb(formData.youtubeUrl) && (
                  <img src={getYTThumb(formData.youtubeUrl)} alt="Thumbnail preview" className="mt-1 w-full h-32 object-cover rounded-lg border border-zinc-200" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-600 uppercase">Category <span className="text-rose-500">*</span></label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full h-10 rounded-lg border px-3 text-sm bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] ${errors.category ? 'border-rose-400' : 'border-zinc-300'}`}>
                    <option value="">Select...</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-xs text-rose-500">{errors.category}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-600 uppercase">Class <span className="text-rose-500">*</span></label>
                  <select value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })}
                    className={`w-full h-10 rounded-lg border px-3 text-sm bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] ${errors.className ? 'border-rose-400' : 'border-zinc-300'}`}>
                    <option value="">Select...</option>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.className && <p className="text-xs text-rose-500">{errors.className}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase">Duration (e.g. 18:45)</label>
                <input type="text" placeholder="mm:ss" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase">Description</label>
                <textarea rows={3} placeholder="Brief description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] resize-none" />
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-[#084A86] hover:bg-[#073b6b] text-white text-sm font-semibold disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : editId ? 'Update Video' : 'Add Video'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); setErrors({}); }}
                  className="px-4 h-10 rounded-lg border border-zinc-300 text-zinc-600 text-sm font-semibold hover:bg-zinc-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#084A86]" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center text-zinc-400">
          <Video className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No videos found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(item => (
            <div key={item._id} className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="w-full h-44 object-cover" onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-44 bg-zinc-100 flex items-center justify-center">
                    <Play className="h-12 w-12 text-zinc-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a href={item.youtubeUrl} target="_blank" rel="noreferrer" className="p-3 bg-white rounded-full shadow">
                    <Play className="h-5 w-5 text-[#084A86]" />
                  </a>
                </div>
                {item.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">{item.duration}</span>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-zinc-900 truncate mb-1">{item.title}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#084A86]/10 text-[#084A86] text-xs font-medium">{item.category}</span>
                  <span className="text-xs text-zinc-400">{item.className}</span>
                </div>
                <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-zinc-400"><Eye className="h-3.5 w-3.5" />{item.views || 0} views</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-[#084A86] hover:bg-[#084A86]/10 transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Thumbnail</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Class</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-zinc-500 uppercase">Views</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-zinc-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-zinc-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(item => (
                <tr key={item._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    {item.thumbnail
                      ? <img src={item.thumbnail} alt="" className="w-16 h-10 object-cover rounded" />
                      : <div className="w-16 h-10 bg-zinc-100 rounded flex items-center justify-center"><Play className="h-4 w-4 text-zinc-400" /></div>}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 max-w-[200px] truncate">{item.title}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-[#084A86]/10 text-[#084A86] text-xs font-medium">{item.category}</span></td>
                  <td className="px-4 py-3 text-zinc-600 text-xs">{item.className}</td>
                  <td className="px-4 py-3 text-center text-zinc-700">{item.views || 0}</td>
                  <td className="px-4 py-3 text-center text-zinc-500 text-xs">{item.duration || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a href={item.youtubeUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"><Play className="h-4 w-4" /></a>
                      <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-[#084A86] hover:bg-[#084A86]/10 transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
