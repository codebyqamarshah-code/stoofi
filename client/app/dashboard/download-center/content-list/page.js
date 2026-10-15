'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronRight, Search, Trash2, Edit2, FileText, Video, Image, Archive, LayoutGrid, List, Upload, Share2, Copy, CheckCircle2, AlertCircle, Loader2, Download, X } from 'lucide-react';
import api from '@/services/api';

const CONTENT_TYPES = ['All Types', 'PDF Document', 'Video Lecture', 'Image Gallery', 'ZIP Archive', 'Assignments', 'Study Material', 'Syllabus'];

const TYPE_ICON = {
  'PDF Document': FileText,
  'Video Lecture': Video,
  'Image Gallery': Image,
  'ZIP Archive': Archive,
  'Assignments': FileText,
  'Study Material': FileText,
  'Syllabus': FileText,
};

const getTypeIcon = (type) => TYPE_ICON[type] || FileText;

const FALLBACK = [
  { _id: 'c1', fileName: 'Mathematics_Notes_Chapter5.pdf', contentType: 'PDF Document', fileSize: '2.4 MB', downloads: 142, uploadedBy: 'Admin', createdAt: '2026-08-10T10:00:00Z' },
  { _id: 'c2', fileName: 'Physics_Lab_Manual.pdf', contentType: 'PDF Document', fileSize: '5.1 MB', downloads: 87, uploadedBy: 'Admin', createdAt: '2026-09-01T09:30:00Z' },
  { _id: 'c3', youtubeLink: 'https://youtube.com/watch?v=dQw4w9WgXcQ', contentType: 'Video Lecture', fileSize: '—', downloads: 203, uploadedBy: 'Teacher', createdAt: '2026-09-12T14:00:00Z', fileName: 'Organic_Chemistry_Lecture.mp4' },
  { _id: 'c4', fileName: 'English_Grammar_Workbook.zip', contentType: 'ZIP Archive', fileSize: '12.7 MB', downloads: 56, uploadedBy: 'Admin', createdAt: '2026-10-01T11:00:00Z' },
  { _id: 'c5', fileName: 'Biology_Image_Collection.zip', contentType: 'Image Gallery', fileSize: '34.2 MB', downloads: 29, uploadedBy: 'Teacher', createdAt: '2026-10-05T08:00:00Z' },
];

const emptyForm = { contentType: '', youtubeLink: '', title: '' };

export default function ContentListPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [viewMode, setViewMode] = useState('list');
  const [formData, setFormData] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [editId, setEditId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchContents(); }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/download-center/content');
      if (res && res.success && res.data?.length > 0) {
        setContents(res.data);
      } else {
        setContents(FALLBACK);
      }
    } catch {
      setContents(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '—';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { showToast('File too large. Max 20MB.', 'error'); return; }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    const reader = new FileReader();
    reader.onloadend = () => setFileBase64(reader.result);
    reader.readAsDataURL(f);
  };

  const removeFile = () => {
    setFile(null); setPreviewUrl(''); setFileBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const e = {};
    if (!formData.contentType) e.contentType = 'Content type is required';
    if (!file && !formData.youtubeLink) e.file = 'Upload a file or provide a YouTube link';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        contentType: formData.contentType,
        youtubeLink: formData.youtubeLink,
        fileUrl: fileBase64,
        fileName: file ? file.name : formData.youtubeLink,
        fileType: file ? file.type : 'link',
        fileSize: file ? formatSize(file.size) : '—',
        downloads: 0,
      };
      if (editId) {
        const res = await api.put(`/download-center/content/${editId}`, payload);
        setContents(prev => prev.map(c => c._id === editId ? { ...c, ...payload } : c));
        showToast('Content updated');
      } else {
        const res = await api.post('/download-center/content', payload);
        const newItem = res?.data || { _id: Date.now().toString(), ...payload, uploadedBy: 'Admin', createdAt: new Date().toISOString() };
        setContents(prev => [newItem, ...prev]);
        showToast('Content added successfully');
      }
      setFormData(emptyForm); setEditId(null); removeFile(); setErrors({});
    } catch {
      showToast('Failed to save content', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({ contentType: item.contentType || '', youtubeLink: item.youtubeLink || '', title: item.fileName || '' });
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this content?')) return;
    try {
      await api.delete(`/download-center/content/${id}`);
      setContents(prev => prev.filter(c => c._id !== id));
      showToast('Content deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handleShareLink = (id) => {
    const link = `${window.location.origin}/download/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filtered = useMemo(() =>
    contents.filter(c =>
      (c.fileName?.toLowerCase().includes(search.toLowerCase()) || c.youtubeLink?.toLowerCase().includes(search.toLowerCase()) || c.contentType?.toLowerCase().includes(search.toLowerCase())) &&
      (typeFilter === 'All Types' || c.contentType === typeFilter)
    ),
    [contents, search, typeFilter]
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
        <h1 className="text-2xl font-bold text-zinc-900">Content List</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Download Center</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-900 font-semibold">Content List</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add/Edit Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden sticky top-4">
            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50">
              <h2 className="font-semibold text-zinc-800">{editId ? 'Edit Content' : 'Add Content'}</h2>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Content Type <span className="text-rose-500">*</span></label>
                <select value={formData.contentType} onChange={e => setFormData({ ...formData, contentType: e.target.value })}
                  className={`w-full h-10 rounded-lg border px-3 text-sm bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86] ${errors.contentType ? 'border-rose-400' : 'border-zinc-300'}`}>
                  <option value="">Select type...</option>
                  {CONTENT_TYPES.filter(t => t !== 'All Types').map(t => <option key={t}>{t}</option>)}
                </select>
                {errors.contentType && <p className="text-xs text-rose-500">{errors.contentType}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">YouTube / External Link</label>
                <input type="url" placeholder="https://youtube.com/..." value={formData.youtubeLink} onChange={e => setFormData({ ...formData, youtubeLink: e.target.value })}
                  className="w-full h-10 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]" />
              </div>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-200" />
                <span className="text-xs text-zinc-400 font-semibold">OR UPLOAD</span>
                <div className="flex-1 h-px bg-zinc-200" />
              </div>

              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip,.rar,.mp4" />

              {!file ? (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-zinc-300 rounded-xl text-zinc-400 hover:border-[#084A86] hover:text-[#084A86] transition-colors">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-medium">Click to browse files</span>
                  <span className="text-xs">Max 20MB · PDF, DOC, IMG, ZIP, MP4</span>
                </button>
              ) : (
                <div className="border border-zinc-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-[#084A86] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-900 truncate">{file.name}</p>
                      <p className="text-xs text-emerald-600 font-medium">{formatSize(file.size)} · Ready</p>
                    </div>
                    <button type="button" onClick={removeFile} className="p-1 rounded text-zinc-400 hover:text-rose-500"><X className="h-4 w-4" /></button>
                  </div>
                  {file.type.startsWith('image/') && previewUrl && (
                    <img src={previewUrl} alt="preview" className="w-full h-28 object-cover rounded-lg" />
                  )}
                </div>
              )}
              {errors.file && <p className="text-xs text-rose-500">{errors.file}</p>}

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-[#084A86] hover:bg-[#073b6b] text-white text-sm font-semibold disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {saving ? 'Saving...' : editId ? 'Update' : 'Upload'}
                </button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setFormData(emptyForm); removeFile(); setErrors({}); }}
                    className="px-4 h-10 rounded-lg border border-zinc-300 text-zinc-600 text-sm hover:bg-zinc-50">Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: List */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-sm">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input type="text" placeholder="Search content..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 h-9 w-full rounded-lg border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-zinc-300 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#084A86] bg-white">
              {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="flex border border-zinc-300 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-[#084A86] text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}><List className="h-4 w-4" /></button>
              <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-[#084A86] text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}><LayoutGrid className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white border border-zinc-200 rounded-xl py-16 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#084A86]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center text-zinc-400">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No content found</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">File / Link</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Size</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-zinc-500 uppercase">DLs</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map(c => {
                    const IconComp = getTypeIcon(c.contentType);
                    return (
                      <tr key={c._id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#084A86]/10 text-[#084A86] shrink-0">
                              <IconComp className="h-4 w-4" />
                            </span>
                            <span className="text-zinc-900 font-medium text-xs max-w-[140px] truncate">
                              {c.youtubeLink ? (
                                <a href={c.youtubeLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{c.fileName || c.youtubeLink}</a>
                              ) : c.fileName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">{c.contentType}</span></td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">{c.fileSize || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="flex items-center justify-center gap-1 text-zinc-700 text-xs font-semibold">
                            <Download className="h-3.5 w-3.5" />{c.downloads || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleShareLink(c._id)} title="Copy share link"
                              className={`p-1.5 rounded-lg transition-colors ${copiedId === c._id ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-500 hover:bg-zinc-100'}`}>
                              {copiedId === c._id ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                            <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg text-[#084A86] hover:bg-[#084A86]/10 transition-colors"><Edit2 className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-zinc-100 text-xs text-zinc-400">
                Showing {filtered.length} of {contents.length} records
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(c => {
                const IconComp = getTypeIcon(c.contentType);
                return (
                  <div key={c._id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#084A86]/10 text-[#084A86] shrink-0">
                        <IconComp className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 text-sm truncate">{c.fileName || 'Untitled'}</p>
                        <p className="text-xs text-zinc-400">{c.contentType}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 mb-3">
                      <div><span className="font-medium text-zinc-700">Size:</span> {c.fileSize || '—'}</div>
                      <div className="flex items-center gap-1"><Download className="h-3 w-3" /><span>{c.downloads || 0} downloads</span></div>
                      <div><span className="font-medium text-zinc-700">Date:</span> {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</div>
                      <div><span className="font-medium text-zinc-700">By:</span> {c.uploadedBy || 'Admin'}</div>
                    </div>
                    <div className="flex gap-1.5 border-t border-zinc-100 pt-3">
                      <button onClick={() => handleShareLink(c._id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${copiedId === c._id ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}>
                        {copiedId === c._id ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                        {copiedId === c._id ? 'Copied!' : 'Share'}
                      </button>
                      <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg text-[#084A86] hover:bg-[#084A86]/10 transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
