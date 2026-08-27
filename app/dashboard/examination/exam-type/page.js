'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function ExamTypePage() {
  const [examTypes, setExamTypes] = useState([]);
  const [formData, setFormData] = useState({ name: '', isAveragePassing: false });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchExamTypes = async () => {
    try {
      const res = await api.get('/exam-type');
      if (res.success) setExamTypes(res.data);
    } catch (error) {
      console.error(error);
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
      const res = await api.post('/exam-type', formData);
      if (res.success) {
        setFormData({ name: '', isAveragePassing: false });
        fetchExamTypes();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this exam type?')) {
      try {
        const res = await api.delete(`/exam-type/${id}`);
        if (res.success) fetchExamTypes();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const filtered = examTypes.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Exam Type</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Examination</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Exam Type</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Exam Type</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Exam Name <span className="text-rose-500">*</span></Label>
                <Input 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Average Passing Examination</Label>
                <div className="mt-2 flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={formData.isAveragePassing}
                    onChange={(e) => setFormData({...formData, isAveragePassing: e.target.checked})}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-zinc-300">Yes</span>
                </div>
              </div>
              <Button disabled={submitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mt-4">
                {submitting ? 'SAVING...' : 'SAVE EXAM TYPE'}
              </Button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Exam Type List</h2>
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
                    <th className="px-4 py-3 font-semibold">Exam Name</th>
                    <th className="px-4 py-3 font-semibold">Is Average Passing Exam</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr><td colSpan="4" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="4" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 text-emerald-500 font-medium">+{idx + 1}</td>
                        <td className="px-4 py-3 text-zinc-300">{item.name}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.isAveragePassing ? 'Yes' : 'No'}</td>
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
