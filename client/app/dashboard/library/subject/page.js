'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Trash2, 
  Edit, 
  Plus, 
  X,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

export default function LibrarySubjectPage() {
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', category: '', code: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', category: '', code: '' });
  const [editSaving, setEditSaving] = useState(false);

  const fetchSubjects = async () => {
    try { 
      setLoading(true);
      const [sRes, cRes] = await Promise.all([
        api.get('/library-subject').catch(() => null),
        api.get('/book-category').catch(() => null)
      ]);
      if (sRes?.success && Array.isArray(sRes.data)) setSubjects(sRes.data); 
      if (cRes?.success && Array.isArray(cRes.data)) setCategories(cRes.data); 
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchSubjects(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Subject name is required');
    try {
      setSubmitting(true);
      const res = await api.post('/library-subject', formData);
      if (res?.success) { 
        setFormData({ name: '', category: '', code: '' }); 
        fetchSubjects(); 
      } else {
        alert(res?.message || 'Failed to save subject');
      }
    } catch (e) { 
      alert(e.message); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleOpenEdit = (subj) => {
    setEditingSubject(subj);
    setEditFormData({
      name: subj.name || '',
      category: subj.category || '',
      code: subj.code || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return alert('Subject name is required');
    try {
      setEditSaving(true);
      const res = await api.put(`/library-subject/${editingSubject._id}`, editFormData);
      if (res?.success) {
        setIsEditOpen(false);
        fetchSubjects();
      } else {
        alert(res?.message || 'Failed to update subject');
      }
    } catch (err) {
      alert('Failed to update subject');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this library subject?')) return;
    try { 
      const res = await api.delete(`/library-subject/${id}`); 
      if (res?.success) fetchSubjects(); 
    } catch (e) { 
      alert(e.message); 
    }
  };

  const filtered = useMemo(() => {
    return subjects.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      (s.code && s.code.toLowerCase().includes(search.toLowerCase())) ||
      (s.category && s.category.toLowerCase().includes(search.toLowerCase()))
    );
  }, [subjects, search]);

  const exportColumns = [
    { key: 'name', label: 'Subject Name' },
    { key: 'code', label: 'Subject Code' },
    { key: 'category', label: 'Category' }
  ];

  const exportData = filtered.map(s => ({
    name: s.name,
    code: s.code || '—',
    category: s.category || 'General'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#084A86]" />
            Library Subjects
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Manage library curriculum subjects, disciplines, and academic codes</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/library" className="hover:text-zinc-600 transition-colors">Library</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Subjects</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Subject */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#084A86]" />
                Add Library Subject
              </h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Subject Name <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="e.g. Mathematics, Physics, English..."
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="h-10 rounded-xl" 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Subject Code</Label>
                <Input 
                  placeholder="e.g. MTH-101, PHY-202"
                  value={formData.code} 
                  onChange={e => setFormData({ ...formData, code: e.target.value })} 
                  className="h-10 rounded-xl font-mono" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Category Tag</Label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="">Select Category Tag</option>
                  {categories.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-xl shadow-xs cursor-pointer"
              >
                {submitting ? 'Saving...' : 'Save Subject'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Table: Subject List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Subject Directory ({subjects.length})</h2>
                <p className="text-xs text-zinc-500 mt-0.5">List of all academic subjects cataloged in library</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search subject..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="pl-8 h-8 text-xs bg-white border-zinc-200 rounded-xl" 
                  />
                </div>

                <TableExportToolbar
                  data={exportData}
                  columns={exportColumns}
                  filename="Library_Subjects_Report"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3.5 font-bold w-14">#</th>
                    <th className="px-4 py-3.5 font-bold">Subject Name</th>
                    <th className="px-4 py-3.5 font-bold">Subject Code</th>
                    <th className="px-4 py-3.5 font-bold">Category</th>
                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-zinc-500">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          Loading subjects...
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-zinc-500">
                        No library subjects found. Add a subject using the form.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s, idx) => (
                      <tr key={s._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-zinc-500 text-xs">#{idx + 1}</td>
                        <td className="px-4 py-3.5 font-bold text-zinc-950">
                          {s.name}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-700">
                          {s.code || '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                            {s.category || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              onClick={() => handleOpenEdit(s)} 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit Subject"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(s._id)} 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-zinc-200 text-xs text-zinc-500 bg-zinc-50/30">
              Showing {filtered.length} subjects
            </div>
          </div>
        </div>
      </div>

      {/* Edit Subject Modal */}
      {isEditOpen && editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 text-zinc-950 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Edit className="h-4 w-4 text-[#084A86]" />
                Edit Library Subject
              </h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Subject Name *</Label>
                <Input 
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="h-10 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Subject Code</Label>
                <Input 
                  value={editFormData.code}
                  onChange={e => setEditFormData({ ...editFormData, code: e.target.value })}
                  className="h-10 rounded-xl font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Category Tag</Label>
                <select
                  value={editFormData.category}
                  onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="">Select Category Tag</option>
                  {categories.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs h-9 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editSaving}
                  style={{ backgroundColor: '#084A86' }}
                  className="hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-xl cursor-pointer"
                >
                  {editSaving ? 'Updating...' : 'Update Subject'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
