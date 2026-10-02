'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

export default function MarksRegisterPage() {
  const [records, setRecords] = useState([]);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ examId: '', classId: '', sectionId: '', subjectId: '', studentId: '', marks: '', totalMarks: '', grade: '', gpa: '', remarks: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const [rRes, eRes, cRes, subRes, secRes, stRes] = await Promise.all([
        api.get('/marks-register'), api.get('/exam-type'), api.get('/class'),
        api.get('/subject'), api.get('/section'), api.get('/students')
      ]);
      if (rRes.success) setRecords(rRes.data);
      if (eRes.success) setExams(eRes.data);
      if (cRes.success) setClasses(cRes.data);
      if (subRes.success) setSubjects(subRes.data);
      if (secRes.success) setSections(secRes.data);
      if (stRes.success) setStudents(stRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.examId || !formData.studentId || !formData.marks) return alert('Exam, Student and Marks are required');
    try {
      setSubmitting(true);
      const res = await api.post('/marks-register', formData);
      if (res.success) { setFormData({ examId: '', classId: '', sectionId: '', subjectId: '', studentId: '', marks: '', totalMarks: '', grade: '', gpa: '', remarks: '' }); fetchAll(); }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { const res = await api.delete(`/marks-register/${id}`); if (res.success) fetchAll(); } catch (e) { alert(e.message); }
  };

  const getName = (arr, id, field = 'name') => arr.find(x => x._id === id)?.[field] || '-';

  const filtered = records.filter(r =>
    getName(students, r.studentId).toLowerCase().includes(search.toLowerCase()) ||
    getName(exams, r.examId).toLowerCase().includes(search.toLowerCase())
  );

  const sel = (label, field, arr, nameField = 'name') => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">{label}</Label>
      <select value={formData[field]} onChange={e => setFormData({...formData, [field]: e.target.value})} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-600">
        <option value="">Select {label}</option>
        {arr.map(x => <option key={x._id} value={x._id}>{x[nameField]}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Marks Register</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/examination/exam-setup" className="hover:text-zinc-500 transition-colors">Examination</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-950 font-bold">Marks Register</span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl">
            <div className="p-4 border-b border-zinc-200"><h2 className="text-lg font-semibold text-zinc-950">Add Marks</h2></div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              {sel('Exam *', 'examId', exams)}
              {sel('Class', 'classId', classes)}
              {sel('Section', 'sectionId', sections)}
              {sel('Subject', 'subjectId', subjects)}
              {sel('Student *', 'studentId', students, 'firstName')}
              {[['marks','Marks Obtained *',true],['totalMarks','Total Marks'],['grade','Grade'],['gpa','GPA'],['remarks','Remarks']].map(([field, label]) => (
                <div key={field} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">{label}</Label>
                  <Input value={formData[field]} onChange={e => setFormData({...formData, [field]: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600" />
                </div>
              ))}
              <Button disabled={submitting} type="submit" className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold">
                {submitting ? 'SAVING...' : 'SAVE MARKS'}
              </Button>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-950">Marks Register List</h2>
              <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-zinc-600" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Exam</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Marks</th><th className="px-4 py-3">Grade</th><th className="px-4 py-3">GPA</th><th className="px-4 py-3 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  : filtered.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-600">+{idx+1}</td>
                      <td className="px-4 py-3 text-zinc-950">{getName(exams, item.examId)}</td>
                      <td className="px-4 py-3 text-zinc-700">{getName(students, item.studentId, 'firstName')}</td>
                      <td className="px-4 py-3 text-zinc-700">{getName(subjects, item.subjectId)}</td>
                      <td className="px-4 py-3 text-zinc-700">{item.marks}{item.totalMarks ? `/${item.totalMarks}` : ''}</td>
                      <td className="px-4 py-3 text-zinc-500 font-bold">{item.grade || '-'}</td>
                      <td className="px-4 py-3 text-zinc-700">{item.gpa || '-'}</td>
                      <td className="px-4 py-3 text-right"><Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10">DELETE</Button></td>
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
