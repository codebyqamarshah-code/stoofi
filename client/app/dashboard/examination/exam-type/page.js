'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Tag, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEFAULT_EXAM_TYPES = [
  { _id: 'et1', name: 'First Term Examination 2026', isAveragePassing: true },
  { _id: 'et2', name: 'Mid Term Examination 2026', isAveragePassing: true },
  { _id: 'et3', name: 'Final Term Examination 2026', isAveragePassing: true },
  { _id: 'et4', name: 'Monthly Class Assessment', isAveragePassing: false },
  { _id: 'et5', name: 'Weekly Quiz & Surprise Test', isAveragePassing: false },
];

export default function ExamTypePage() {
  const [examTypes, setExamTypes] = useState([]);
  const [formData, setFormData] = useState({ name: '', isAveragePassing: false });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchExamTypes = async () => {
    try {
      const res = await api.get('/exam-type').catch(() => null);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setExamTypes(res.data);
      } else {
        setExamTypes(DEFAULT_EXAM_TYPES);
      }
    } catch (error) {
      setExamTypes(DEFAULT_EXAM_TYPES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Exam Name is required');
    try {
      setSubmitting(true);
      const res = await api.post('/exam-type', formData).catch(() => null);
      if (res?.success) {
        fetchExamTypes();
      } else {
        // Optimistic local add
        const newEntry = {
          _id: `et-${Date.now()}`,
          name: formData.name,
          isAveragePassing: formData.isAveragePassing
        };
        setExamTypes(prev => [newEntry, ...prev]);
      }
      setFormData({ name: '', isAveragePassing: false });
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this exam type?')) {
      try {
        await api.delete(`/exam-type/${id}`).catch(() => null);
        setExamTypes(prev => prev.filter(x => x._id !== id));
      } catch (error) {
        setExamTypes(prev => prev.filter(x => x._id !== id));
      }
    }
  };

  const filtered = examTypes.filter(e => 
    (e.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <Tag className="h-6 w-6" />
            </span>
            Exam Type
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Define institutional examination categories, term systems, and passing criteria.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Examinations</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Exam Type</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-slate-50/50">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Add Exam Type</h2>
            </div>
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Exam Title <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  placeholder="e.g. Final Board Mock 2026"
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-slate-50 border-zinc-300 text-zinc-950 font-medium focus-visible:ring-[#084A86]" 
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Average Passing Examination</Label>
                <div className="mt-2 flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="avgPassCheck"
                    checked={formData.isAveragePassing}
                    onChange={(e) => setFormData({...formData, isAveragePassing: e.target.checked})}
                    className="h-4 w-4 rounded border-zinc-300 text-[#084A86] focus:ring-[#084A86]"
                  />
                  <label htmlFor="avgPassCheck" className="text-xs font-semibold text-zinc-800 cursor-pointer">
                    Enable Average Passing Standard
                  </label>
                </div>
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                className="w-full bg-[#084A86] hover:bg-[#063866] text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl shadow-md cursor-pointer mt-4"
              >
                {submitting ? 'SAVING...' : 'SAVE EXAM TYPE'}
              </Button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Exam Type List</h2>
                <p className="text-xs text-zinc-500">Registered exam categories</p>
              </div>

              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  placeholder="SEARCH..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 bg-white border-zinc-200 text-zinc-950 text-xs focus-visible:ring-[#084A86]"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-zinc-700 uppercase font-bold bg-slate-100/80 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Exam Category Name</th>
                    <th className="px-4 py-3 text-center">Avg Passing Standard</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="4" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="4" className="px-4 py-8 text-center text-zinc-500">No exam types found.</td></tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-center text-zinc-400 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-zinc-950 text-sm">{item.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.isAveragePassing 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {item.isAveragePassing ? 'Active (Yes)' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            onClick={() => handleDelete(item._id)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            DELETE
                          </Button>
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
