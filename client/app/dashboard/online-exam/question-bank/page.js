'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function QuestionBankPage() {
  const [records, setRecords] = useState([]);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({ questionGroupId: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '', marks: '', type: 'mcq' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const [rRes, gRes] = await Promise.all([api.get('/question-bank'), api.get('/question-group')]);
      if (rRes.success) setRecords(rRes.data);
      if (gRes.success) setGroups(gRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/question-bank', formData);
      if (res.success) { setFormData({ questionGroupId: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '', marks: '', type: 'mcq' }); fetchAll(); }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { const res = await api.delete(`/question-bank/${id}`); if (res.success) fetchAll(); } catch (e) { alert(e.message); }
  };

  const getName = (arr, id, field = 'name') => arr.find(x => x._id === id)?.[field] || '-';
  const filtered = records.filter(r => r.question.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Question Bank</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><span>Online Exam</span><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-950 font-bold">Question Bank</span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl">
            <div className="p-4 border-b border-zinc-200"><h2 className="text-lg font-semibold text-zinc-950">Add Question</h2></div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Question Group</Label>
                <select value={formData.questionGroupId} onChange={e => setFormData({...formData, questionGroupId: e.target.value})} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-600">
                  <option value="">Select Group</option>
                  {groups.map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Question *</Label><textarea value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600" required /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Option A</Label><Input value={formData.optionA} onChange={e => setFormData({...formData, optionA: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Option B</Label><Input value={formData.optionB} onChange={e => setFormData({...formData, optionB: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Option C</Label><Input value={formData.optionC} onChange={e => setFormData({...formData, optionC: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Option D</Label><Input value={formData.optionD} onChange={e => setFormData({...formData, optionD: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600" /></div>
              </div>
              
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Correct Answer</Label><Input value={formData.correctAnswer} onChange={e => setFormData({...formData, correctAnswer: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600" placeholder="A, B, C, or D" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Marks</Label><Input type="number" value={formData.marks} onChange={e => setFormData({...formData, marks: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600" /></div>

              <Button disabled={submitting} type="submit" className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold">
                {submitting ? 'SAVING...' : 'SAVE QUESTION'}
              </Button>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-950">Question List</h2>
              <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-zinc-600" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Group</th><th className="px-4 py-3">Question</th><th className="px-4 py-3">Correct</th><th className="px-4 py-3">Marks</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  : filtered.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-600">+{idx+1}</td>
                      <td className="px-4 py-3 text-zinc-700">{getName(groups, item.questionGroupId, 'title')}</td>
                      <td className="px-4 py-3 font-medium text-zinc-950">
                        {item.question.length > 50 ? item.question.substring(0, 50) + '...' : item.question}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 font-bold">{item.correctAnswer}</td>
                      <td className="px-4 py-3 text-zinc-700">{item.marks}</td>
                      <td className="px-4 py-3"><Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10">DELETE</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
