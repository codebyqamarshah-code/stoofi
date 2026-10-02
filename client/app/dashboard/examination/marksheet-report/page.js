'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

export default function MarksheetReportPage() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [formData, setFormData] = useState({ examId: '', classId: '', subjectId: '', sectionId: '' });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [eRes, cRes, subRes, secRes, stRes] = await Promise.all([
          api.get('/exam-type'),
          api.get('/class'),
          api.get('/subject'),
          api.get('/section'),
          api.get('/students')
        ]);
        if (eRes.success) setExams(eRes.data);
        if (cRes.success) setClasses(cRes.data);
        if (subRes.success) setSubjects(subRes.data);
        if (secRes.success) setSections(secRes.data);
        if (stRes.success) setStudents(stRes.data || stRes.students || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSearch = async () => {
    if (!formData.examId || !formData.classId) {
      return alert('Please select at least Exam and Class.');
    }
    try {
      setLoading(true);
      setSearched(true);
      // Fetch all marks registers and filter locally
      const res = await api.get('/marks-register');
      if (res.success) {
        let filtered = res.data.filter(r => r.examId === formData.examId);
        if (formData.classId) filtered = filtered.filter(r => r.classId === formData.classId);
        if (formData.sectionId) filtered = filtered.filter(r => r.sectionId === formData.sectionId);
        if (formData.subjectId) filtered = filtered.filter(r => r.subjectId === formData.subjectId);
        setRecords(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getName = (arr, id, field = 'name') => arr.find(x => x._id === id)?.[field] || '-';
  const getStudentName = (id) => {
    const s = students.find(x => x._id === id);
    return s ? `${s.firstName || ''} ${s.lastName || ''}`.trim() : '-';
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-zinc-400';
    const g = grade.toUpperCase();
    if (g === 'A+' || g === 'A') return 'text-emerald-400';
    if (g === 'B') return 'text-blue-400';
    if (g === 'C') return 'text-yellow-400';
    if (g === 'D') return 'text-orange-400';
    return 'text-rose-400';
  };

  const totalMarks = records.reduce((sum, r) => sum + (parseFloat(r.marks) || 0), 0);
  const avgMarks = records.length > 0 ? (totalMarks / records.length).toFixed(1) : 0;
  const passCount = records.filter(r => {
    const pct = r.totalMarks ? (parseFloat(r.marks) / parseFloat(r.totalMarks)) * 100 : 0;
    return pct >= 40;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Marksheet Report</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Exam</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Marksheet Report</span>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-950">Select Criteria</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Select Exam <span className="text-rose-500">*</span></label>
              <SearchableSelect value={formData.examId} onChange={(val) => setFormData({ ...formData, examId: val })}
                placeholder="Select Exam *" options={exams.map(e => ({ label: e.name, value: e._id }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Select Class <span className="text-rose-500">*</span></label>
              <SearchableSelect value={formData.classId} onChange={(val) => setFormData({ ...formData, classId: val })}
                placeholder="Select Class *" options={classes.map(c => ({ label: c.name, value: c._id }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Select Section</label>
              <SearchableSelect value={formData.sectionId} onChange={(val) => setFormData({ ...formData, sectionId: val })}
                placeholder="Select Section" options={sections.map(s => ({ label: s.name, value: s._id }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Select Subject</label>
              <SearchableSelect value={formData.subjectId} onChange={(val) => setFormData({ ...formData, subjectId: val })}
                placeholder="Select Subject" options={subjects.map(s => ({ label: s.name, value: s._id }))} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSearch} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-8">
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'SEARCHING...' : 'SEARCH'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <>
          {/* Summary Cards */}
          {records.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: records.length, color: 'text-blue-400' },
                { label: 'Average Marks', value: avgMarks, color: 'text-indigo-400' },
                { label: 'Pass Count', value: passCount, color: 'text-emerald-400' },
                { label: 'Fail Count', value: records.length - passCount, color: 'text-rose-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white border border-zinc-200 shadow-xs rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-zinc-500 mt-1 uppercase">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Marksheet Table */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-950">
                Marksheet — {getName(exams, formData.examId)} | {getName(classes, formData.classId)}
              </h2>
              <Button onClick={() => window.print()} variant="ghost" className="text-zinc-400 hover:text-zinc-950 text-xs">
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3">SL</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Marks Obtained</th>
                    <th className="px-4 py-3">Total Marks</th>
                    <th className="px-4 py-3">%</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">GPA</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="9" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  ) : records.length === 0 ? (
                    <tr><td colSpan="9" className="px-4 py-8 text-center text-zinc-500">No marksheet records found for selected criteria.</td></tr>
                  ) : records.map((r, idx) => {
                    const pct = r.totalMarks ? ((parseFloat(r.marks) / parseFloat(r.totalMarks)) * 100).toFixed(1) : '-';
                    return (
                      <tr key={r._id} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 text-zinc-600">#{idx + 1}</td>
                        <td className="px-4 py-3 text-zinc-950 font-medium">{getStudentName(r.studentId)}</td>
                        <td className="px-4 py-3 text-zinc-700">{getName(subjects, r.subjectId)}</td>
                        <td className="px-4 py-3 text-zinc-950 font-bold">{r.marks}</td>
                        <td className="px-4 py-3 text-zinc-700">{r.totalMarks || '-'}</td>
                        <td className="px-4 py-3 text-zinc-700">{pct !== '-' ? `${pct}%` : '-'}</td>
                        <td className={`px-4 py-3 font-bold ${getGradeColor(r.grade)}`}>{r.grade || '-'}</td>
                        <td className="px-4 py-3 text-zinc-700">{r.gpa || '-'}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">{r.remarks || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
