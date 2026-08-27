'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

export default function ExamSetupPage() {
  const [examSetups, setExamSetups] = useState([]);
  const [examSystems, setExamSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({ 
    examSystemId: '', 
    totalMark: '',
    distributions: [{ title: '', mark: '' }]
  });

  const fetchData = async () => {
    try {
      const [setupRes, sysRes] = await Promise.all([
        api.get('/exam-setup'),
        api.get('/exam-type')
      ]);
      if (setupRes.success) setExamSetups(setupRes.data);
      if (sysRes.success) setExamSystems(sysRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDistributionChange = (index, field, value) => {
    const newDist = [...formData.distributions];
    newDist[index][field] = value;
    setFormData({ ...formData, distributions: newDist });
  };

  const addDistribution = () => {
    setFormData({ ...formData, distributions: [...formData.distributions, { title: '', mark: '' }] });
  };

  const removeDistribution = (index) => {
    const newDist = formData.distributions.filter((_, i) => i !== index);
    setFormData({ ...formData, distributions: newDist });
  };

  const calculatedTotal = formData.distributions.reduce((acc, curr) => acc + (Number(curr.mark) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.examSystemId || !formData.totalMark) return alert('Exam System and Total Mark are required');
    try {
      setSubmitting(true);
      const res = await api.post('/exam-setup', formData);
      if (res.success) {
        setFormData({ examSystemId: '', totalMark: '', distributions: [{ title: '', mark: '' }] });
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this setup?')) {
      try {
        const res = await api.delete(`/exam-setup/${id}`);
        if (res.success) fetchData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const getExamSystemName = (id) => {
    const sys = examSystems.find(s => s._id === id);
    return sys ? sys.name : '-';
  };

  const filtered = examSetups.filter(e => 
    getExamSystemName(e.examSystemId).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Exam Setup</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Examinations</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Exam Setup</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Exam</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Exam System <span className="text-rose-500">*</span></Label>
                <SearchableSelect 
                  value={formData.examSystemId} onChange={(val) => setFormData({...formData, examSystemId: val})}
                  placeholder="Exam System *"
                  options={examSystems.map(s => ({ label: s.name, value: s._id }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Exam Mark <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number"
                  value={formData.totalMark} onChange={(e) => setFormData({...formData, totalMark: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Add Mark Distributions</h2>
              <Button onClick={addDistribution} size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 w-8 p-0 rounded-md">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-5 gap-2 pb-2 border-b border-zinc-800">
                <div className="col-span-2 text-xs font-semibold text-zinc-400 uppercase">Exam Title</div>
                <div className="col-span-2 text-xs font-semibold text-zinc-400 uppercase">Exam Mark</div>
                <div className="col-span-1 text-xs font-semibold text-zinc-400 uppercase text-center">Action</div>
              </div>
              
              {formData.distributions.map((dist, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <Input 
                      value={dist.title} onChange={(e) => handleDistributionChange(idx, 'title', e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white h-9 focus-visible:ring-emerald-500" 
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number"
                      value={dist.mark} onChange={(e) => handleDistributionChange(idx, 'mark', e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white h-9 focus-visible:ring-emerald-500" 
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button onClick={() => removeDistribution(idx)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-5 gap-2 items-center pt-4">
                <div className="col-span-2 font-bold text-white">Total</div>
                <div className="col-span-2">
                  <Input readOnly value={calculatedTotal} className="bg-zinc-800 border-zinc-700 text-white h-9" />
                </div>
              </div>
              
              <Button disabled={submitting} onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold mt-4">
                {submitting ? 'SAVING...' : 'SAVE'}
              </Button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Exam List</h2>
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
                    <th className="px-4 py-3 font-semibold">Exam Title</th>
                    <th className="px-4 py-3 font-semibold">Total Mark</th>
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
                        <td className="px-4 py-3 text-zinc-300">{getExamSystemName(item.examSystemId)}</td>
                        <td className="px-4 py-3 text-zinc-400">{item.totalMark}</td>
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
