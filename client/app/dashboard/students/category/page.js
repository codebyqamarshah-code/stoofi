'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Edit, 
  Trash2, 
  Tag, 
  Plus, 
  X, 
  CheckCircle2, 
  Users, 
  Percent, 
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TableExportToolbar from '@/components/ui/TableExportToolbar';

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', type: 'Regular Admission', code: 'REG', discount: '0%', students: 284, description: 'Standard general tuition fee structure' },
  { id: 'cat-2', type: 'Merit Scholar (Top 5%)', code: 'MERIT', discount: '50%', students: 34, description: 'High academic achievers scoring 90%+ in board exams' },
  { id: 'cat-3', type: 'Hafiz-e-Quran Quota', code: 'HQ', discount: '25%', students: 18, description: 'Recognized certificate holders of Hifz-e-Quran' },
  { id: 'cat-4', type: 'Sibling Discount', code: 'SIB', discount: '20%', students: 46, description: 'Concession applicable for second child enrolled' },
  { id: 'cat-5', type: 'Faculty / Staff Dependent', code: 'STAFF', discount: '100%', students: 12, description: 'Children of full-time Pak Royal College faculty and staff' },
  { id: 'cat-6', type: 'Need-Based Financial Aid', code: 'AID', discount: '40%', students: 22, description: 'Deserving candidates approved by scholarship committee' },
  { id: 'cat-7', type: 'Sports Excellence Quota', code: 'SPT', discount: '30%', students: 15, description: 'District & provincial level athletic champions' },
];

export default function StudentCategoryPage() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ type: '', code: '', discount: '0%', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.type.trim()) {
      showToast('⚠️ Category name is required.');
      return;
    }

    if (editingId) {
      setCategories(categories.map(c => c.id === editingId ? {
        ...c,
        type: formData.type.trim(),
        code: formData.code.trim() || c.code,
        discount: formData.discount.trim() || c.discount,
        description: formData.description.trim() || c.description
      } : c));
      showToast('✓ Category updated successfully!');
      setEditingId(null);
    } else {
      const newCat = {
        id: `cat-${Date.now()}`,
        type: formData.type.trim(),
        code: formData.code.trim() || 'GEN',
        discount: formData.discount.trim() || '0%',
        students: 0,
        description: formData.description.trim() || 'Standard category'
      };
      setCategories([newCat, ...categories]);
      showToast('✓ New student category created!');
    }
    setFormData({ type: '', code: '', discount: '0%', description: '' });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      type: category.type,
      code: category.code || '',
      discount: category.discount || '0%',
      description: category.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    setCategories(categories.filter(c => c.id !== deleteModal.id));
    setDeleteModal(null);
    showToast('✓ Category deleted successfully.');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ type: '', code: '', discount: '0%', description: '' });
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const totalStudents = categories.reduce((s, c) => s + (c.students || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-sky-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-zinc-900">Delete Student Category?</h3>
            <p className="text-sm text-zinc-600">
              Are you sure you want to delete <strong className="text-rose-700">{deleteModal.type}</strong>?
              {deleteModal.students > 0 && (
                <span className="block mt-1 text-amber-700 font-semibold">
                  ⚠️ This category currently has {deleteModal.students} students assigned to it.
                </span>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteModal(null)} className="text-xs">Cancel</Button>
              <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">Delete Category</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <Tag className="h-6 w-6" />
            </span>
            Student Categories &amp; Fee Concessions
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Define institutional student quotas, scholarship classifications, and fee concession tiers
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-600">Student Info</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Student Category</span>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Active Categories</span>
            <div className="text-xl font-black text-zinc-900">{categories.length}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Classified Students</span>
            <div className="text-xl font-black text-emerald-600">{totalStudents}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Concession Tiers</span>
            <div className="text-xl font-black text-purple-700">0% – 100%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add / Edit Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden sticky top-4">
            <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex justify-between items-center">
              <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                {editingId ? <><Edit className="w-4 h-4 text-[#084A86]" /> Edit Category</> : <><Plus className="w-4 h-4 text-[#084A86]" /> Add New Category</>}
              </h2>
              {editingId && (
                <button onClick={cancelEdit} className="text-zinc-400 hover:text-zinc-950 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                  Category Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="e.g. Merit Scholar, Need-Based Aid..."
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="bg-white border-zinc-200 text-zinc-950 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                    Category Code
                  </Label>
                  <Input 
                    placeholder="e.g. SCHOLAR"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="bg-white border-zinc-200 text-zinc-950 font-mono text-xs uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                    Fee Concession
                  </Label>
                  <Input 
                    placeholder="e.g. 25%, 50%"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="bg-white border-zinc-200 text-zinc-950 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                  Policy Description
                </Label>
                <textarea
                  placeholder="Eligibility criteria and rules..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-950 resize-none focus:outline-none focus:ring-2 focus:ring-[#084A86]/20 focus:border-[#084A86]"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full bg-[#084A86] hover:bg-[#063866] text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95">
                  {editingId ? 'UPDATE CATEGORY' : 'SAVE CATEGORY'}
                </Button>
                {editingId && (
                  <Button type="button" onClick={cancelEdit} variant="outline" className="w-full mt-2 text-xs">
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Category List</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-white border-zinc-200 text-xs h-9"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-10">#</th>
                    <th className="p-3">Category Title</th>
                    <th className="p-3">Code</th>
                    <th className="p-3 text-center">Concession</th>
                    <th className="p-3 text-center">Enrolled</th>
                    <th className="p-3">Policy Note</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredCategories.length > 0 ? filteredCategories.map((c, i) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-zinc-400 font-mono">{i + 1}</td>
                      <td className="p-3 font-extrabold text-zinc-950">
                        {c.type}
                      </td>
                      <td className="p-3 font-mono text-[10.5px] font-bold text-zinc-700">
                        <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                          {c.code || 'REG'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          {c.discount || '0%'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-zinc-800 bg-sky-50 text-[#084A86] px-2 py-0.5 rounded-full text-[10px]">
                          {c.students || 0} Students
                        </span>
                      </td>
                      <td className="p-3 text-zinc-500 max-w-xs truncate text-[11px]">
                        {c.description || '—'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#084A86] transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal(c)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-zinc-500">
                        <Tag className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                        <p className="font-bold">No categories match your search</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-zinc-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Showing {filteredCategories.length} categories</span>
              <span className="font-bold text-zinc-800">{totalStudents} Total students categorized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}