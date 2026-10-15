'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'MCQ (Multiple Choice)' },
  { value: 'short', label: 'Short Answer' },
  { value: 'long', label: 'Long / Essay' },
  { value: 'truefalse', label: 'True / False' },
];

const SAMPLE_QUESTIONS = [
  { _id: 'sq1', questionGroupId: '', question: 'What is the value of π (pi) to 2 decimal places?', optionA: '3.14', optionB: '3.16', optionC: '3.12', optionD: '3.18', correctAnswer: 'A', marks: '2', type: 'mcq' },
  { _id: 'sq2', questionGroupId: '', question: 'Which data structure works on LIFO (Last In First Out) principle?', optionA: 'Queue', optionB: 'Stack', optionC: 'Tree', optionD: 'Graph', correctAnswer: 'B', marks: '2', type: 'mcq' },
  { _id: 'sq3', questionGroupId: '', question: 'The speed of light in vacuum is approximately?', optionA: '3×10⁶ m/s', optionB: '3×10⁸ m/s', optionC: '3×10¹⁰ m/s', optionD: '3×10⁴ m/s', correctAnswer: 'B', marks: '3', type: 'mcq' },
];

export default function QuestionBankPage() {
  const [records, setRecords] = useState(SAMPLE_QUESTIONS);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    questionGroupId: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '',
    correctAnswer: '', marks: '', type: 'mcq'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchAll = async () => {
    try {
      const [rRes, gRes] = await Promise.all([
        api.get('/question-bank').catch(() => null),
        api.get('/question-group').catch(() => null)
      ]);
      if (rRes?.success && Array.isArray(rRes.data) && rRes.data.length > 0) setRecords(rRes.data);
      if (gRes?.success && Array.isArray(gRes.data)) setGroups(gRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      questionGroupId: item.questionGroupId || '',
      question: item.question || '',
      optionA: item.optionA || '',
      optionB: item.optionB || '',
      optionC: item.optionC || '',
      optionD: item.optionD || '',
      correctAnswer: item.correctAnswer || '',
      marks: item.marks || '',
      type: item.type || 'mcq'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ questionGroupId: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '', marks: '', type: 'mcq' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question) return alert('Question text is required.');
    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/question-bank/${editingId}`, formData).catch(() => null);
        setRecords(prev => prev.map(r => r._id === editingId ? { ...r, ...formData } : r));
      } else {
        const payload = { ...formData, _id: 'q_' + Date.now() };
        try {
          const res = await api.post('/question-bank', formData);
          if (res.success && res.data) payload._id = res.data._id || payload._id;
        } catch { /* fallback */ }
        setRecords(prev => [...prev, payload]);
      }
      handleCancelEdit();
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/question-bank/${id}`).catch(() => null);
    setRecords(prev => prev.filter(r => r._id !== id));
    if (editingId === id) handleCancelEdit();
  };

  const getName = (arr, id, field = 'name') => arr.find(x => x._id === id)?.[field] || '-';

  const filtered = records.filter(r =>
    (r.question || '').toLowerCase().includes(search.toLowerCase()) &&
    (typeFilter ? r.type === typeFilter : true)
  );

  const isMcq = formData.type === 'mcq' || formData.type === 'truefalse';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#084A86]" />
            Question Bank
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Create and manage MCQ, Short Answer, and Essay questions for online exams</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Online Exam</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Question Bank</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-950">
                {editingId ? 'Edit Question' : 'Add Question'}
              </h2>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-xs text-zinc-500 hover:text-zinc-800 underline">Cancel</button>
              )}
            </div>
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">Question Type <span className="text-rose-500">*</span></Label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                >
                  {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {groups.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Question Group</Label>
                  <select
                    value={formData.questionGroupId}
                    onChange={e => setFormData({ ...formData, questionGroupId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                  >
                    <option value="">Select Group (Optional)</option>
                    {groups.map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">Question Text <span className="text-rose-500">*</span></Label>
                <textarea
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question..."
                  className="flex min-h-[90px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#084A86]"
                  required
                />
              </div>

              {(formData.type === 'mcq') && (
                <div className="grid grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <div key={opt} className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-700 uppercase">Option {opt}</Label>
                      <Input
                        value={formData[`option${opt}`]}
                        onChange={e => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                        placeholder={`Option ${opt}`}
                        className="bg-white border-zinc-300 text-zinc-950 text-sm focus-visible:ring-[#084A86]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {formData.type === 'truefalse' && (
                <div className="grid grid-cols-2 gap-3">
                  {['True', 'False'].map(opt => (
                    <div key={opt} className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-700 uppercase">Option</Label>
                      <Input value={opt} readOnly className="bg-zinc-50 border-zinc-300 text-zinc-700 text-sm" />
                    </div>
                  ))}
                </div>
              )}

              {isMcq && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase">Correct Answer <span className="text-rose-500">*</span></Label>
                  {formData.type === 'truefalse' ? (
                    <select
                      value={formData.correctAnswer}
                      onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                    >
                      <option value="">Select Correct Answer</option>
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  ) : (
                    <select
                      value={formData.correctAnswer}
                      onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                    >
                      <option value="">Select Correct Option</option>
                      {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>Option {o}</option>)}
                    </select>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase">Marks</Label>
                <Input
                  type="number" min="0" placeholder="e.g. 2"
                  value={formData.marks}
                  onChange={e => setFormData({ ...formData, marks: e.target.value })}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]"
                />
              </div>

              <Button
                disabled={submitting}
                type="submit"
                className="w-full bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold py-2.5"
              >
                {submitting ? 'SAVING...' : editingId ? 'UPDATE QUESTION' : 'SAVE QUESTION'}
              </Button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-950">Question List</h2>
                <span className="text-xs bg-zinc-200/70 text-zinc-600 px-2 py-0.5 rounded-full font-medium">{records.length} Questions</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="h-9 rounded-md border border-zinc-300 bg-white px-2 text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#084A86]"
                >
                  <option value="">All Types</option>
                  {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <div className="relative w-44">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-[#084A86]"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-100/70 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 w-10">#</th>
                    <th className="px-4 py-3">Question</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Correct</th>
                    <th className="px-4 py-3 text-center">Marks</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">Loading questions...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No questions match your search.</td></tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3 text-zinc-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-zinc-950 max-w-[250px]">
                          <span title={item.question} className="line-clamp-2 text-xs leading-relaxed">
                            {item.question}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.type === 'mcq' ? 'bg-blue-50 text-blue-700' :
                            item.type === 'short' ? 'bg-amber-50 text-amber-700' :
                            item.type === 'truefalse' ? 'bg-purple-50 text-purple-700' :
                            'bg-zinc-100 text-zinc-600'
                          }`}>
                            {QUESTION_TYPES.find(t => t.value === item.type)?.label || item.type || 'MCQ'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            {item.correctAnswer || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-zinc-700 font-semibold text-xs">{item.marks || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button onClick={() => handleEdit(item)} variant="ghost" size="sm" className="h-8 px-2 text-[#084A86] hover:bg-blue-50">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 px-2 text-rose-500 hover:bg-rose-50">
                              <Trash2 className="h-3.5 w-3.5" />
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
