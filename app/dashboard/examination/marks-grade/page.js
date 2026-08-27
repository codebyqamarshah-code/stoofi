'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function MarksGradePage() {
  const [grades, setGrades] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', gpa: '', percentFrom: '', percentTo: '', gpaFrom: '', gpaTo: '', description: '' 
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchGrades = async () => {
    try {
      const res = await api.get('/exam-grade');
      if (res.success) setGrades(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.gpa) return alert('Grade Name and GPA are required');
    try {
      setSubmitting(true);
      const res = await api.post('/exam-grade', formData);
      if (res.success) {
        setFormData({ name: '', gpa: '', percentFrom: '', percentTo: '', gpaFrom: '', gpaTo: '', description: '' });
        fetchGrades();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this grade?')) {
      try {
        const res = await api.delete(`/exam-grade/${id}`);
        if (res.success) fetchGrades();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const filtered = grades.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Marks Grade</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Examination</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Marks Grade</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Grade</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Grade Name <span className="text-rose-500">*</span></Label>
                <Input 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">GPA <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number" step="0.01"
                  value={formData.gpa} onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Percent From <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number"
                  value={formData.percentFrom} onChange={(e) => setFormData({...formData, percentFrom: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Percent To <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number"
                  value={formData.percentTo} onChange={(e) => setFormData({...formData, percentTo: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">GPA From <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number" step="0.01"
                  value={formData.gpaFrom} onChange={(e) => setFormData({...formData, gpaFrom: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">GPA To <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number" step="0.01"
                  value={formData.gpaTo} onChange={(e) => setFormData({...formData, gpaTo: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Description</Label>
                <textarea 
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" 
                />
              </div>
              <Button disabled={submitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {submitting ? 'SAVING...' : 'SAVE GRADE'}
              </Button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Grade List</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="SEARCH" 
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-16">SL</th>
                    <th className="px-4 py-3 font-semibold">Grade</th>
                    <th className="px-4 py-3 font-semibold">GPA</th>
                    <th className="px-4 py-3 font-semibold">Percent (From-To)</th>
                    <th className="px-4 py-3 font-semibold">GPA (From-To)</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 text-emerald-500 font-medium">+{idx + 1}</td>
                        <td className="px-4 py-3 text-zinc-300">{item.name}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.gpa}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.percentFrom}% - {item.percentTo}%</td>
                        <td className="px-4 py-3 text-zinc-400">{item.gpaFrom} - {item.gpaTo}</td>
                        <td className="px-4 py-3 text-right">
                          <Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
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
