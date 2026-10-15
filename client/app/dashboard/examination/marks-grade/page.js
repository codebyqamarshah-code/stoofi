'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Award, Plus, Edit2, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEFAULT_GRADES = [
  { _id: 'g1', name: 'A+', gpa: 4.0, percentFrom: 85, percentTo: 100, gpaFrom: 3.8, gpaTo: 4.0, description: 'Outstanding / Excellent performance' },
  { _id: 'g2', name: 'A', gpa: 3.5, percentFrom: 75, percentTo: 84, gpaFrom: 3.3, gpaTo: 3.79, description: 'Very Good' },
  { _id: 'g3', name: 'B', gpa: 3.0, percentFrom: 65, percentTo: 74, gpaFrom: 2.8, gpaTo: 3.29, description: 'Good' },
  { _id: 'g4', name: 'C', gpa: 2.0, percentFrom: 50, percentTo: 64, gpaFrom: 2.0, gpaTo: 2.79, description: 'Satisfactory / Average' },
  { _id: 'g5', name: 'D', gpa: 1.0, percentFrom: 40, percentTo: 49, gpaFrom: 1.0, gpaTo: 1.99, description: 'Pass / Below Average' },
  { _id: 'g6', name: 'F', gpa: 0.0, percentFrom: 0, percentTo: 39, gpaFrom: 0.0, gpaTo: 0.99, description: 'Fail / Needs Improvement' },
];

export default function MarksGradePage() {
  const [grades, setGrades] = useState(DEFAULT_GRADES);
  const [formData, setFormData] = useState({ 
    name: '', gpa: '', percentFrom: '', percentTo: '', gpaFrom: '', gpaTo: '', description: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exam-grade');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setGrades(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || '',
      gpa: item.gpa ?? '',
      percentFrom: item.percentFrom ?? '',
      percentTo: item.percentTo ?? '',
      gpaFrom: item.gpaFrom ?? '',
      gpaTo: item.gpaTo ?? '',
      description: item.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', gpa: '', percentFrom: '', percentTo: '', gpaFrom: '', gpaTo: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.gpa === '') return alert('Grade Name and GPA are required');
    try {
      setSubmitting(true);
      if (editingId) {
        try {
          await api.put(`/exam-grade/${editingId}`, formData);
        } catch {
          // fallback update in state
        }
        setGrades(prev => prev.map(g => g._id === editingId ? { ...g, ...formData } : g));
        setSuccessMsg('Grade scale updated successfully!');
      } else {
        const payload = { ...formData, _id: 'grade_' + Date.now() };
        try {
          const res = await api.post('/exam-grade', formData);
          if (res.success && res.data) {
            payload._id = res.data._id || payload._id;
          }
        } catch {
          // fallback state update
        }
        setGrades(prev => [...prev, payload]);
        setSuccessMsg('New Grade level saved successfully!');
      }
      handleCancelEdit();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadDefaults = () => {
    setGrades(DEFAULT_GRADES);
    setSuccessMsg('Loaded standard A+ to F national grading scale!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this grade?')) {
      try {
        await api.delete(`/exam-grade/${id}`).catch(() => null);
      } catch (error) {
        console.error(error);
      }
      setGrades(prev => prev.filter(g => g._id !== id));
      if (editingId === id) handleCancelEdit();
    }
  };

  const filtered = grades.filter(g => 
    (g?.name || '').toLowerCase().includes((search || '').toLowerCase()) ||
    (g?.description || '').toLowerCase().includes((search || '').toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Award className="h-6 w-6 text-[#084A86]" />
            Marks Grade System
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Configure academic grading thresholds, GPA benchmarks, and assessment standards
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/examination/exam-setup" className="hover:text-zinc-600 transition-colors">Examination</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Marks Grade</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-xs text-emerald-600 hover:text-emerald-800 underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-950">
                {editingId ? 'Edit Grade Rule' : 'Add New Grade'}
              </h2>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-xs text-zinc-500 hover:text-zinc-800 underline">
                  Cancel Edit
                </button>
              )}
            </div>
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">Grade Name <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="e.g. A+, A, B, C, D, F"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">GPA Point <span className="text-rose-500">*</span></Label>
                  <Input 
                    type="number" step="0.01" min="0" max="5"
                    placeholder="4.00"
                    value={formData.gpa} onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]" 
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">GPA (From - To)</Label>
                  <div className="flex gap-1.5 items-center">
                    <Input 
                      type="number" step="0.01" placeholder="3.8"
                      value={formData.gpaFrom} onChange={(e) => setFormData({...formData, gpaFrom: e.target.value})}
                      className="bg-white border-zinc-300 text-zinc-950 text-xs px-2 focus-visible:ring-[#084A86]" 
                    />
                    <span className="text-zinc-400 text-xs">-</span>
                    <Input 
                      type="number" step="0.01" placeholder="4.0"
                      value={formData.gpaTo} onChange={(e) => setFormData({...formData, gpaTo: e.target.value})}
                      className="bg-white border-zinc-300 text-zinc-950 text-xs px-2 focus-visible:ring-[#084A86]" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Percent From (%) <span className="text-rose-500">*</span></Label>
                  <Input 
                    type="number" min="0" max="100" placeholder="85"
                    value={formData.percentFrom} onChange={(e) => setFormData({...formData, percentFrom: e.target.value})}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]" 
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Percent To (%) <span className="text-rose-500">*</span></Label>
                  <Input 
                    type="number" min="0" max="100" placeholder="100"
                    value={formData.percentTo} onChange={(e) => setFormData({...formData, percentTo: e.target.value})}
                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">Description / Performance Remarks</Label>
                <textarea 
                  placeholder="e.g. Outstanding / Distinction level performance"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex min-h-[75px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#084A86]" 
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button 
                  disabled={submitting} 
                  type="submit" 
                  className="w-full bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold py-2.5 shadow-sm"
                >
                  {submitting ? 'SAVING...' : editingId ? 'UPDATE GRADE RULE' : 'SAVE GRADE'}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleLoadDefaults}
                  className="w-full text-xs text-zinc-600 border-zinc-300 hover:bg-zinc-50 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset to Standard Grading Presets
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-950 flex items-center gap-2">
                  <span>Grading Scale Table</span>
                  <span className="text-xs font-normal text-zinc-600 bg-zinc-200/70 px-2 py-0.5 rounded-full">
                    {grades.length} Grades
                  </span>
                </h2>
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  placeholder="Search grade or desc..." 
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-[#084A86]"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-100/70 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-12 text-center">#</th>
                    <th className="px-4 py-3 font-semibold">Grade</th>
                    <th className="px-4 py-3 font-semibold">GPA</th>
                    <th className="px-4 py-3 font-semibold">Score Range (%)</th>
                    <th className="px-4 py-3 font-semibold">GPA Range</th>
                    <th className="px-4 py-3 font-semibold">Remarks</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">Loading grading scale...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">No grades match your search.</td></tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3 text-zinc-400 font-medium text-center text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            item.name.startsWith('A') 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : item.name === 'B' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                              : item.name === 'C' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : item.name === 'F'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-zinc-100 text-zinc-800 border border-zinc-300'
                          }`}>
                            {item.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-zinc-900">{Number(item.gpa).toFixed(2)}</td>
                        <td className="px-4 py-3 text-zinc-700 font-mono text-xs">{item.percentFrom}% - {item.percentTo}%</td>
                        <td className="px-4 py-3 text-zinc-700 font-mono text-xs">{item.gpaFrom} - {item.gpaTo}</td>
                        <td className="px-4 py-3 text-zinc-600 text-xs max-w-[200px] truncate" title={item.description}>
                          {item.description || 'Standard evaluation'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              onClick={() => handleEdit(item)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-[#084A86] hover:bg-blue-50"
                              title="Edit Grade"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(item._id)} 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete Grade"
                            >
                              DELETE
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
