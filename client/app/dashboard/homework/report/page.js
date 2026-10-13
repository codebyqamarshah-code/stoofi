'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  RotateCcw, 
  BookOpen, 
  Save, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users, 
  Award, 
  Paperclip,
  CheckCheck
} from 'lucide-react';
import { sortClassesAcademic, normalizeClassName } from '@/lib/academicUtils';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';

export default function HomeworkReportPage() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [formData, setFormData] = useState({ class: '', subject: '', section: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Results
  const [matchedHomework, setMatchedHomework] = useState(null);
  const [allHomeworkOptions, setAllHomeworkOptions] = useState([]);
  const [studentRows, setStudentRows] = useState([]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [cRes, sRes, subRes] = await Promise.all([
          api.get('/class').catch(() => null),
          api.get('/section').catch(() => null),
          api.get('/subject').catch(() => null)
        ]);
        if (cRes?.success && Array.isArray(cRes.data)) setClasses(cRes.data);
        if (sRes?.success && Array.isArray(sRes.data)) setSections(sRes.data);
        if (subRes?.success && Array.isArray(subRes.data)) setSubjects(subRes.data);
      } catch (err) {
        console.error('Error fetching dropdowns:', err);
      }
    };
    fetchInitial();
  }, []);

  const classOptions = useMemo(() => {
    return [
      { value: '', label: 'Select Class *' },
      ...sortClassesAcademic(classes.map(c => ({ value: c.name, label: c.name })))
    ];
  }, [classes]);

  const subjectOptions = useMemo(() => {
    return [
      { value: '', label: 'All Subjects' },
      ...subjects.map(s => ({ value: s.name, label: s.name }))
    ];
  }, [subjects]);

  const availableSections = useMemo(() => {
    if (formData.class) {
      const selectedClassObj = classes.find(c => 
        c.name === formData.class || 
        normalizeClassName(c.name) === normalizeClassName(formData.class)
      );
      if (selectedClassObj?.sections && Array.isArray(selectedClassObj.sections) && selectedClassObj.sections.length > 0) {
        return [
          { value: '', label: 'All Sections' },
          ...selectedClassObj.sections.map(s => {
            const raw = typeof s === 'string' ? s : (s.name || '');
            const clean = raw.replace(/^section\s+/i, '');
            return { value: raw, label: `Section ${clean}` };
          })
        ];
      }
    }

    const allSecSet = new Set();
    (sections || []).forEach(s => {
      const name = typeof s === 'string' ? s : (s.name || '');
      if (name) allSecSet.add(name);
    });
    (classes || []).forEach(c => {
      (c.sections || []).forEach(s => {
        if (s) allSecSet.add(s);
      });
    });
    if (allSecSet.size === 0) {
      ['A', 'B', 'C', 'D'].forEach(s => allSecSet.add(s));
    }

    return [
      { value: '', label: 'All Sections' },
      ...Array.from(allSecSet).sort().map(s => {
        const clean = String(s).replace(/^section\s+/i, '');
        return { value: s, label: `Section ${clean}` };
      })
    ];
  }, [formData.class, classes, sections]);

  // Execute Search for Homework & Class Students
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!formData.class) {
      alert('Please select a Class to generate report.');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      const [hwRes, stuRes] = await Promise.all([
        api.get('/homework').catch(() => null),
        api.get('/student?limit=1000').catch(() => null)
      ]);

      const allHw = hwRes?.success && Array.isArray(hwRes.data) ? hwRes.data : [];
      const allStu = stuRes?.success && Array.isArray(stuRes.data) ? stuRes.data : [];

      // Filter homework matching criteria
      const matchingHwList = allHw.filter(h => {
        const matchClass = !formData.class || 
          String(h.className || '').toLowerCase() === String(formData.class).toLowerCase() ||
          String(h.className || '').toLowerCase() === `class ${String(formData.class).toLowerCase()}`;
        const matchSubject = !formData.subject || 
          String(h.subject || '').toLowerCase() === String(formData.subject).toLowerCase();
        const matchSection = !formData.section || 
          String(h.section || '').toLowerCase() === String(formData.section).toLowerCase() ||
          String(h.section || '').toLowerCase() === `section ${String(formData.section).toLowerCase()}`;
        const matchDate = !formData.date || 
          (h.homeworkDate && h.homeworkDate.startsWith(formData.date));
        return matchClass && matchSubject && matchSection && matchDate;
      });

      setAllHomeworkOptions(matchingHwList);
      const chosenHw = matchingHwList[0] || null;
      setMatchedHomework(chosenHw);

      // Filter students in this class and section
      const enrolledStudents = allStu.filter(s => {
        const matchClass = !formData.class || 
          String(s.className || '').toLowerCase() === String(formData.class).toLowerCase() ||
          String(s.className || '').toLowerCase() === `class ${String(formData.class).toLowerCase()}`;
        const matchSection = !formData.section || 
          String(s.section || '').toLowerCase() === String(formData.section).toLowerCase() ||
          String(s.section || '').toLowerCase() === `section ${String(formData.section).toLowerCase()}`;
        return matchClass && matchSection;
      });

      // Prepare student rows merging with existing evaluations
      const existingEvaluations = chosenHw?.evaluations || [];
      const completedUserIds = new Set((chosenHw?.completedBy || []).map(id => String(id)));

      const rows = enrolledStudents.map(st => {
        const fullName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student';
        const existing = existingEvaluations.find(ev => 
          ev.studentId === String(st._id) || 
          ev.admissionNo === st.admissionNo ||
          ev.studentName?.toLowerCase() === fullName.toLowerCase()
        );

        const isUserCompleted = st.user && completedUserIds.has(String(st.user));

        return {
          studentId: String(st._id),
          studentName: fullName,
          admissionNo: st.admissionNo || '—',
          rollNo: st.rollNo || '—',
          status: existing?.status || (isUserCompleted ? 'Submitted' : 'Pending'),
          marksObtained: existing?.marksObtained !== undefined ? existing.marksObtained : (isUserCompleted ? (chosenHw?.marks || 0) : 0),
          teacherRemarks: existing?.teacherRemarks || ''
        };
      });

      setStudentRows(rows);
    } catch (err) {
      console.error('Error generating homework report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Switch homework if multiple match
  const handleSelectHomework = (hwId) => {
    const hw = allHomeworkOptions.find(h => h._id === hwId);
    if (!hw) return;
    setMatchedHomework(hw);

    const existingEvaluations = hw.evaluations || [];
    const completedUserIds = new Set((hw.completedBy || []).map(id => String(id)));

    setStudentRows(prev => prev.map(row => {
      const existing = existingEvaluations.find(ev => 
        ev.studentId === row.studentId || ev.admissionNo === row.admissionNo
      );
      return {
        ...row,
        status: existing?.status || (completedUserIds.has(row.studentId) ? 'Submitted' : 'Pending'),
        marksObtained: existing?.marksObtained !== undefined ? existing.marksObtained : 0,
        teacherRemarks: existing?.teacherRemarks || ''
      };
    }));
  };

  const handleRowChange = (studentId, field, val) => {
    setStudentRows(prev => prev.map(r => {
      if (r.studentId === studentId) {
        return { ...r, [field]: val };
      }
      return r;
    }));
  };

  // Save evaluations back to API
  const handleSaveEvaluations = async () => {
    if (!matchedHomework) {
      alert('No active homework assignment selected.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.put(`/homework/${matchedHomework._id}/evaluation`, {
        evaluations: studentRows
      });

      if (res?.success) {
        setActionMessage({
          type: 'success',
          text: `Evaluations saved successfully for ${studentRows.length} students!`
        });
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        alert(res?.message || 'Failed to save evaluations');
      }
    } catch (err) {
      console.error('Save evaluation error:', err);
      alert('Failed to save evaluations.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ class: '', subject: '', section: '', date: '' });
    setHasSearched(false);
    setMatchedHomework(null);
    setAllHomeworkOptions([]);
    setStudentRows([]);
  };

  // Stats
  const stats = useMemo(() => {
    const total = studentRows.length;
    const submitted = studentRows.filter(r => r.status === 'Submitted').length;
    const pending = studentRows.filter(r => r.status === 'Pending').length;
    const late = studentRows.filter(r => r.status === 'Late').length;
    const rate = total > 0 ? Math.round(((submitted + late) / total) * 100) : 0;
    return { total, submitted, pending, late, rate };
  }, [studentRows]);

  // Export configs
  const exportColumns = [
    { key: 'admissionNo', label: 'Admission No' },
    { key: 'rollNo', label: 'Roll No' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'status', label: 'Submission Status' },
    { key: 'marksObtained', label: 'Marks Obtained' },
    { key: 'maxMarks', label: 'Max Marks' },
    { key: 'teacherRemarks', label: 'Remarks' }
  ];

  const exportData = studentRows.map(r => ({
    admissionNo: r.admissionNo,
    rollNo: r.rollNo,
    studentName: r.studentName,
    status: r.status,
    marksObtained: r.marksObtained,
    maxMarks: matchedHomework?.marks || '0',
    teacherRemarks: r.teacherRemarks || '—'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#084A86]" />
            Homework Evaluation Report
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Review student homework completion, record marks, add teacher feedback, and export class reports.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/homework" className="hover:text-zinc-600 transition-colors">Homework</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Evaluation Report</span>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Criteria Selection Box */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-visible">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <Search className="h-4 w-4 text-[#084A86]" />
            Select Criteria to Generate Report
          </h2>
        </div>

        <form onSubmit={handleSearch} className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Class <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              options={classOptions}
              value={formData.class}
              onChange={e => setFormData(prev => ({ ...prev, class: e.target.value, section: '' }))}
              placeholder="Select Class *"
              name="class"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Subject</Label>
            <SearchableSelect
              options={subjectOptions}
              value={formData.subject}
              onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="All Subjects"
              name="subject"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Section</Label>
            <SearchableSelect
              options={availableSections}
              value={formData.section}
              onChange={e => setFormData(prev => ({ ...prev, section: e.target.value }))}
              placeholder="All Sections"
              name="section"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Homework Date</Label>
            <Input 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} 
              className="h-10 rounded-xl border-zinc-200 text-sm bg-white" 
            />
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-3 pt-2 border-t border-zinc-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset} 
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> RESET
            </Button>
            <Button 
              type="submit" 
              style={{ backgroundColor: '#084A86' }}
              className="hover:opacity-95 text-white font-semibold flex items-center gap-2 h-10 px-6 rounded-xl cursor-pointer"
            >
              <Search className="h-4 w-4" /> GENERATE REPORT
            </Button>
          </div>
        </form>
      </div>

      {/* When Search is Performed */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Multiple Matching Homework Selector (if more than 1) */}
          {allHomeworkOptions.length > 1 && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#084A86]">
                Found {allHomeworkOptions.length} homework assignments for this class. Select assignment to evaluate:
              </span>
              <select
                value={matchedHomework?._id || ''}
                onChange={e => handleSelectHomework(e.target.value)}
                className="bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900 px-3 py-1.5"
              >
                {allHomeworkOptions.map(h => (
                  <option key={h._id} value={h._id}>
                    {h.subject} (Due: {h.submissionDate ? new Date(h.submissionDate).toLocaleDateString() : '—'}) - Max: {h.marks} Marks
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active Homework Details Card */}
          {matchedHomework && (
            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#084A86]/10 text-[#084A86] text-xs font-bold">
                    {matchedHomework.subject}
                  </span>
                  <span className="text-xs font-semibold text-zinc-600">
                    {matchedHomework.className} ({matchedHomework.section})
                  </span>
                </div>
                <p className="text-xs text-zinc-700 mt-1 font-medium">{matchedHomework.description}</p>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Max Marks</span>
                  <span className="font-bold text-zinc-900 font-mono text-sm">{matchedHomework.marks || '0'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Submission Due</span>
                  <span className="font-bold text-rose-600">
                    {matchedHomework.submissionDate ? new Date(matchedHomework.submissionDate).toLocaleDateString() : '—'}
                  </span>
                </div>
                {matchedHomework.file && (
                  <a 
                    href={matchedHomework.file} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-blue-50 text-[#084A86] font-bold text-xs hover:bg-blue-100 flex items-center gap-1"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Worksheet
                  </a>
                )}
              </div>
            </div>
          )}

          {/* KPI Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Enrolled</div>
                <div className="text-2xl font-black text-zinc-950 mt-1">{stats.total}</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Submitted</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">{stats.submitted}</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Pending Tasks</div>
                <div className="text-2xl font-black text-rose-600 mt-1">{stats.pending}</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Completion Rate</div>
                <div className="text-2xl font-black text-[#084A86] mt-1">{stats.rate}%</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Student Evaluation Table */}
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
              <div>
                <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-[#084A86]" />
                  Student Evaluation Roster ({studentRows.length} Students)
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Update submission status, assign marks obtained, and record teacher remarks
                </p>
              </div>

              <div className="flex items-center gap-3">
                <TableExportToolbar
                  data={exportData}
                  columns={exportColumns}
                  filename="Homework_Evaluation_Report"
                />
                <Button
                  onClick={handleSaveEvaluations}
                  disabled={submitting || studentRows.length === 0}
                  style={{ backgroundColor: '#084A86' }}
                  className="hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? 'Saving...' : 'Save Evaluations'}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3.5">Admission No</th>
                    <th className="px-4 py-3.5">Roll No</th>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5 w-40">Status</th>
                    <th className="px-4 py-3.5 w-32">Marks Obtained</th>
                    <th className="px-4 py-3.5">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          Loading students and evaluations...
                        </div>
                      </td>
                    </tr>
                  ) : studentRows.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                        No enrolled students found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    studentRows.map(row => (
                      <tr key={row.studentId} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-bold font-mono text-xs text-zinc-900">
                          {row.admissionNo}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-600">
                          {row.rollNo}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-zinc-950">
                          {row.studentName}
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={row.status}
                            onChange={e => handleRowChange(row.studentId, 'status', e.target.value)}
                            className={`h-8 rounded-lg text-xs font-bold border px-2.5 focus:outline-none cursor-pointer ${
                              row.status === 'Submitted'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : row.status === 'Late'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Pending">Pending</option>
                            <option value="Late">Late Submission</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              min="0"
                              max={matchedHomework?.marks || 100}
                              value={row.marksObtained}
                              onChange={e => handleRowChange(row.studentId, 'marksObtained', Number(e.target.value) || 0)}
                              className="h-8 text-xs font-mono font-bold w-20 bg-white border-zinc-200 rounded-lg text-zinc-900"
                            />
                            <span className="text-xs text-zinc-400 font-mono">/ {matchedHomework?.marks || '0'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Input
                            placeholder="Add brief feedback for student..."
                            value={row.teacherRemarks}
                            onChange={e => handleRowChange(row.studentId, 'teacherRemarks', e.target.value)}
                            className="h-8 text-xs bg-white border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 bg-zinc-50/30 gap-2">
              <div>
                Showing <span className="font-bold text-zinc-900">{studentRows.length}</span> students &bull; <span className="font-bold text-emerald-700">{stats.submitted}</span> submitted &bull; <span className="font-bold text-rose-600">{stats.pending}</span> pending
              </div>
              <Button
                onClick={handleSaveEvaluations}
                disabled={submitting || studentRows.length === 0}
                style={{ backgroundColor: '#084A86' }}
                className="hover:opacity-95 text-white font-bold text-xs h-8 px-4 rounded-xl cursor-pointer"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {submitting ? 'Saving...' : 'Save Evaluations'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
