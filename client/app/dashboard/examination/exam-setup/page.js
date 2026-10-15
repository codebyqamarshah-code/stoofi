'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Trash2, 
  Settings, 
  Layers, 
  SlidersHorizontal,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

const DEFAULT_SYSTEMS = [
  { _id: 'sys1', name: 'Annual Board Exam System 2026' },
  { _id: 'sys2', name: 'Mid Term Semester System' },
  { _id: 'sys3', name: 'Continuous Monthly Assessment' },
  { _id: 'sys4', name: 'O-Level Cambridge Mock Format' },
];

const DEFAULT_SETUPS = [
  {
    _id: 'set1',
    examSystemId: 'sys1',
    totalMark: '100',
    distributions: [
      { title: 'Theory / Subjective', mark: '70' },
      { title: 'MCQ / Objective', mark: '20' },
      { title: 'Practical / Viva', mark: '10' }
    ]
  },
  {
    _id: 'set2',
    examSystemId: 'sys2',
    totalMark: '50',
    distributions: [
      { title: 'Written Paper', mark: '40' },
      { title: 'Assignment / Notebook', mark: '10' }
    ]
  },
  {
    _id: 'set3',
    examSystemId: 'sys3',
    totalMark: '25',
    distributions: [
      { title: 'Class Test Paper', mark: '20' },
      { title: 'Oral Quiz', mark: '5' }
    ]
  }
];

export default function ExamSetupPage() {
  const [examSetups, setExamSetups] = useState([]);
  const [examSystems, setExamSystems] = useState(DEFAULT_SYSTEMS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({ 
    examSystemId: 'sys1', 
    totalMark: '100',
    distributions: [
      { title: 'Theory Exam', mark: '70' },
      { title: 'Practical / Lab', mark: '20' },
      { title: 'Viva / Assignment', mark: '10' }
    ]
  });

  const fetchData = async () => {
    try {
      const [setupRes, sysRes] = await Promise.all([
        api.get('/exam-setup').catch(() => null),
        api.get('/exam-type').catch(() => null)
      ]);
      if (setupRes?.success && Array.isArray(setupRes.data) && setupRes.data.length > 0) {
        setExamSetups(setupRes.data);
      } else {
        setExamSetups(DEFAULT_SETUPS);
      }
      if (sysRes?.success && Array.isArray(sysRes.data) && sysRes.data.length > 0) {
        setExamSystems(sysRes.data);
      } else {
        setExamSystems(DEFAULT_SYSTEMS);
      }
    } catch (error) {
      setExamSetups(DEFAULT_SETUPS);
      setExamSystems(DEFAULT_SYSTEMS);
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
      const res = await api.post('/exam-setup', formData).catch(() => null);
      if (res?.success) {
        fetchData();
      } else {
        // Optimistic local update
        const newEntry = {
          _id: `local-${Date.now()}`,
          examSystemId: formData.examSystemId,
          totalMark: formData.totalMark,
          distributions: [...formData.distributions]
        };
        setExamSetups(prev => [newEntry, ...prev]);
      }
      setFormData({ 
        examSystemId: 'sys1', 
        totalMark: '100', 
        distributions: [{ title: 'Written Paper', mark: '80' }, { title: 'Viva', mark: '20' }] 
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this setup?')) {
      try {
        await api.delete(`/exam-setup/${id}`).catch(() => null);
        setExamSetups(prev => prev.filter(x => x._id !== id));
      } catch (error) {
        setExamSetups(prev => prev.filter(x => x._id !== id));
      }
    }
  };

  const getExamSystemName = (id) => {
    const sys = examSystems.find(s => s._id === id);
    return sys ? sys.name : 'Exam System';
  };

  const filtered = examSetups.filter(e => 
    getExamSystemName(e.examSystemId).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <Settings className="h-6 w-6" />
            </span>
            Exam Setup
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Configure examination mark distribution schemes, practical weightages, and grading systems.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Examinations</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Exam Setup</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="xl:col-span-1 space-y-5">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-slate-50/50">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">1. Select Exam System</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  EXAM SYSTEM <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  value={formData.examSystemId} 
                  onChange={(val) => setFormData({...formData, examSystemId: val})}
                  placeholder="Select Exam System *"
                  options={examSystems.map(s => ({ label: s.name, value: s._id }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  TOTAL MARKS <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  type="number"
                  value={formData.totalMark} 
                  onChange={(e) => setFormData({...formData, totalMark: e.target.value})}
                  className="bg-slate-50 border-zinc-300 text-zinc-950 font-bold focus-visible:ring-[#084A86]" 
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">2. Mark Distributions</h2>
                <p className="text-[11px] text-zinc-500">Break total score into components</p>
              </div>
              <Button 
                onClick={addDistribution} 
                size="sm" 
                className="bg-[#084A86] hover:bg-[#063866] text-white h-7 w-7 p-0 rounded-lg cursor-pointer"
                title="Add Distribution Component"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="grid grid-cols-5 gap-2 pb-1 border-b border-zinc-100 text-[11px] font-bold text-zinc-500 uppercase">
                <div className="col-span-2">Component Name</div>
                <div className="col-span-2 text-center">Marks</div>
                <div className="col-span-1 text-center">Action</div>
              </div>
              
              {formData.distributions.map((dist, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-2">
                    <Input 
                      placeholder="e.g. Theory"
                      value={dist.title} 
                      onChange={(e) => handleDistributionChange(idx, 'title', e.target.value)}
                      className="bg-slate-50 border-zinc-200 text-zinc-950 h-8 text-xs font-semibold focus-visible:ring-[#084A86]" 
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number"
                      placeholder="0"
                      value={dist.mark} 
                      onChange={(e) => handleDistributionChange(idx, 'mark', e.target.value)}
                      className="bg-slate-50 border-zinc-200 text-zinc-950 h-8 text-xs text-center font-bold focus-visible:ring-[#084A86]" 
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button 
                      onClick={() => removeDistribution(idx)} 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-5 gap-2 items-center pt-3 border-t border-zinc-200">
                <div className="col-span-2 font-black text-xs text-zinc-900 uppercase">Sum of Marks</div>
                <div className="col-span-2 text-center">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-black font-mono ${
                    Number(calculatedTotal) === Number(formData.totalMark)
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {calculatedTotal} / {formData.totalMark || 0}
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  {Number(calculatedTotal) === Number(formData.totalMark) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                  )}
                </div>
              </div>
              
              <Button 
                disabled={submitting} 
                onClick={handleSubmit} 
                className="w-full bg-[#084A86] hover:bg-[#063866] text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl shadow-md cursor-pointer mt-4"
              >
                {submitting ? 'SAVING SCHEME...' : 'SAVE EXAM SETUP'}
              </Button>
            </div>
          </div>
        </div>

        {/* List Column */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Configured Exam Setups</h2>
                <p className="text-xs text-zinc-500">Active mark breakdown rules in institution</p>
              </div>

              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input 
                  placeholder="SEARCH RULES..." 
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
                    <th className="px-4 py-3">Exam System Title</th>
                    <th className="px-4 py-3 text-center">Total Score</th>
                    <th className="px-4 py-3">Components Breakdown</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="5" className="px-4 py-10 text-center text-zinc-500">Loading setups...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="5" className="px-4 py-10 text-center text-zinc-500 font-medium">No exam setups configured yet.</td></tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-center text-zinc-400 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-zinc-950 text-sm">
                          {getExamSystemName(item.examSystemId)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
                            {item.totalMark}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(item.distributions) && item.distributions.map((d, dIdx) => (
                              <span 
                                key={dIdx} 
                                className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-[#084A86] text-[10px] font-bold"
                              >
                                {d.title}: <strong>{d.mark}</strong>
                              </span>
                            ))}
                          </div>
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
