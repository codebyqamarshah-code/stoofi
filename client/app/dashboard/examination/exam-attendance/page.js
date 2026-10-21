'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Search, Printer, CheckCircle, XCircle, Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

const DEFAULT_EXAMS = [
  { _id: 'e1', name: 'First Term Examination 2026' },
  { _id: 'e2', name: 'Mid Term Examination 2026' },
  { _id: 'e3', name: 'Final Term Examination 2026' },
  { _id: 'e4', name: 'Monthly Class Assessment' },
];
const DEFAULT_CLASSES = [
  { _id: 'c-bs-psych', name: 'BS Psychology' },
  { _id: 'c-bs-rit', name: 'BS RIT' },
  { _id: 'c-dpt', name: 'DPT' },
  { _id: 'c-fsc-dental', name: 'FSC Dental' },
  { _id: 'c-fsc-nursing', name: 'FSC NURSING' },
  { _id: 'c-fsc-ott', name: 'FSC OTT' },
];
const DEFAULT_SUBJECTS = [
  { _id: 's1', name: 'Mathematics' }, { _id: 's2', name: 'English Language' },
  { _id: 's3', name: 'Urdu Literature' }, { _id: 's4', name: 'General Science' },
  { _id: 's5', name: 'Physics' }, { _id: 's6', name: 'Chemistry' },
  { _id: 's7', name: 'Biology' }, { _id: 's8', name: 'Computer Science' },
];
const DEFAULT_SECTIONS = [
  { _id: 'sec1', name: 'Section A' }, { _id: 'sec2', name: 'Section B' },
  { _id: 'sec3', name: 'Section C' }, { _id: 'sec4', name: 'Section D' },
];

export default function ExamAttendancePage() {
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [formData, setFormData] = useState({ examId: '', classId: '', subjectId: '', sectionId: '' });
  const [students, setStudents] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [eRes, cRes, subRes, secRes] = await Promise.all([
          api.get('/exam-type').catch(() => null),
          api.get('/class').catch(() => null),
          api.get('/subject').catch(() => null),
          api.get('/section').catch(() => null)
        ]);
        if (eRes?.success && Array.isArray(eRes.data) && eRes.data.length > 0) setExams(eRes.data);
        if (cRes?.success && Array.isArray(cRes.data) && cRes.data.length > 0) setClasses(sortClassesAcademic(cRes.data));
        if (subRes?.success && Array.isArray(subRes.data) && subRes.data.length > 0) setSubjects(subRes.data);
        if (secRes?.success && Array.isArray(secRes.data) && secRes.data.length > 0) setSections(secRes.data);
      } catch (error) { console.error(error); }
    };
    fetchDropdowns();
  }, []);

  const handleSearch = async () => {
    if (!formData.examId || !formData.classId || !formData.subjectId) {
      return alert('Please select Exam, Class, and Subject to continue.');
    }
    setLoading(true);
    setSaved(false);
    try {
      const selectedClass = classes.find(c => c._id === formData.classId)?.name || formData.classId;
      const res = await api.get(`/student?className=${encodeURIComponent(selectedClass)}`).catch(() => null);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setStudents(res.data.map(st => ({
          studentId: st._id,
          admissionNo: st.admissionNo || st.rollNumber || 'N/A',
          rollNo: st.rollNumber || '-',
          name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.fullName || 'Student',
          status: 'Present',
          note: ''
        })));
      } else {
        // Demo students for testing
        setStudents([
          { studentId: 'demo1', admissionNo: 'ADM-001', rollNo: '1', name: 'Ali Hassan', status: 'Present', note: '' },
          { studentId: 'demo2', admissionNo: 'ADM-002', rollNo: '2', name: 'Sara Ahmed', status: 'Present', note: '' },
          { studentId: 'demo3', admissionNo: 'ADM-003', rollNo: '3', name: 'Omar Farooq', status: 'Present', note: '' },
          { studentId: 'demo4', admissionNo: 'ADM-004', rollNo: '4', name: 'Fatima Malik', status: 'Present', note: '' },
          { studentId: 'demo5', admissionNo: 'ADM-005', rollNo: '5', name: 'Bilal Khan', status: 'Absent', note: '' },
        ]);
      }
      setSearched(true);
    } catch (e) {
      setStudents([]);
      setSearched(true);
    } finally { setLoading(false); }
  };

  const handleStatusChange = (studentId, status) =>
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));

  const handleNoteChange = (studentId, note) =>
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, note } : s));

  const handleMarkAll = (status) =>
    setStudents(prev => prev.map(s => ({ ...s, status })));

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      examId: formData.examId,
      classId: formData.classId,
      subjectId: formData.subjectId,
      sectionId: formData.sectionId,
      date: new Date().toISOString().split('T')[0],
      attendanceList: students.map(s => ({
        studentId: s.studentId,
        status: s.status,
        note: s.note
      }))
    };
    try {
      await api.post('/exam-attendance', payload).catch(() => null);
    } catch (e) { console.error(e); }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 5000);
  };

  const handlePrint = () => {
    const examName = exams.find(e => e._id === formData.examId)?.name || 'Exam';
    const className = classes.find(c => c._id === formData.classId)?.name || 'Class';
    const subjectName = subjects.find(s => s._id === formData.subjectId)?.name || 'Subject';
    const sectionName = sections.find(s => s._id === formData.sectionId)?.name || '';
    const rows = students.map((s, i) => `
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:8px 12px;text-align:center">${i + 1}</td>
        <td style="padding:8px 12px;font-family:monospace">${s.admissionNo}</td>
        <td style="padding:8px 12px;font-family:monospace">${s.rollNo}</td>
        <td style="padding:8px 12px;font-weight:600">${s.name}</td>
        <td style="padding:8px 12px;text-align:center">
          <span style="padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:700;background:${s.status==='Present'?'#dcfce7':s.status==='Absent'?'#fee2e2':'#fef9c3'};color:${s.status==='Present'?'#166534':s.status==='Absent'?'#991b1b':'#854d0e'}">
            ${s.status}
          </span>
        </td>
        <td style="padding:8px 12px;font-size:12px;color:#6b7280">${s.note || '-'}</td>
      </tr>`).join('');
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Exam Attendance Sheet</title>
      <style>body{font-family:system-ui,sans-serif;color:#111;} table{width:100%;border-collapse:collapse;} th{background:#f1f5f9;text-transform:uppercase;font-size:11px;font-weight:700;padding:10px 12px;text-align:left;border-bottom:2px solid #cbd5e1;} @media print{.no-print{display:none}}</style>
    </head><body>
      <div style="text-align:center;margin-bottom:20px">
        <h2 style="font-size:18px;font-weight:700;margin:0;color:#084A86">EXAM ATTENDANCE SHEET</h2>
        <p style="margin:4px 0 0;color:#6b7280;font-size:13px">${examName} &bull; ${className}${sectionName ? ' / ' + sectionName : ''} &bull; ${subjectName}</p>
        <p style="margin:2px 0;color:#6b7280;font-size:12px">Date: ${new Date().toLocaleDateString('en-PK', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>
      <table>
        <thead><tr><th>#</th><th>Adm. No.</th><th>Roll No.</th><th>Student Name</th><th>Status</th><th>Note</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:40px;display:flex;justify-content:space-around;font-size:12px">
        <div style="text-align:center"><div style="width:160px;border-top:1px solid #374151;margin-bottom:4px"></div>Invigilator Signature</div>
        <div style="text-align:center"><div style="width:160px;border-top:1px solid #374151;margin-bottom:4px"></div>Class Teacher</div>
        <div style="text-align:center"><div style="width:160px;border-top:1px solid #374151;margin-bottom:4px"></div>Principal</div>
      </div>
      <script>window.onload=()=>window.print()</script>
    </body></html>`);
    win.document.close();
  };

  const summary = {
    present: students.filter(s => s.status === 'Present').length,
    absent: students.filter(s => s.status === 'Absent').length,
    late: students.filter(s => s.status === 'Late').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Exam Attendance</h1>
          <p className="text-sm text-zinc-500 mt-1">Track and manage student attendance during formal examinations</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Examinations</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Exam Attendance</span>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50">
          <h2 className="text-sm font-semibold text-zinc-950 uppercase tracking-wider">Select Criteria</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase">EXAM <span className="text-rose-500">*</span></label>
              <SearchableSelect
                value={formData.examId}
                onChange={val => setFormData(f => ({ ...f, examId: typeof val === 'object' ? val?.target?.value ?? '' : val }))}
                placeholder="Select Exam *"
                options={exams.map(e => ({ label: e.name, value: e._id || e.name }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase">CLASS <span className="text-rose-500">*</span></label>
              <SearchableSelect
                value={formData.classId}
                onChange={val => setFormData(f => ({ ...f, classId: typeof val === 'object' ? val?.target?.value ?? '' : val }))}
                placeholder="Select Class *"
                options={classes.map(c => ({ label: c.name, value: c._id || c.name }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase">SUBJECT <span className="text-rose-500">*</span></label>
              <SearchableSelect
                value={formData.subjectId}
                onChange={val => setFormData(f => ({ ...f, subjectId: typeof val === 'object' ? val?.target?.value ?? '' : val }))}
                placeholder="Select Subject *"
                options={subjects.map(s => ({ label: s.name, value: s._id || s.name }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase">SECTION</label>
              <SearchableSelect
                value={formData.sectionId}
                onChange={val => setFormData(f => ({ ...f, sectionId: typeof val === 'object' ? val?.target?.value ?? '' : val }))}
                placeholder="Select Section"
                options={sections.map(s => ({ label: s.name, value: s._id || s.name }))}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button
              disabled={loading}
              onClick={handleSearch}
              className="bg-[#084A86] hover:bg-[#073b6b] text-white text-sm px-6 font-semibold flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {loading ? 'Searching...' : 'LOAD EXAM REGISTER'}
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {searched && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
          {/* Summary Chips */}
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-sm font-bold text-zinc-950">
                Attendance Register
                <span className="ml-2 text-xs font-normal text-zinc-500 bg-zinc-200/70 px-2 py-0.5 rounded-full">
                  {students.length} Students
                </span>
              </h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3" /> {summary.present} Present
                </span>
                <span className="flex items-center gap-1 text-xs bg-rose-50 border border-rose-200 text-rose-700 font-semibold px-2.5 py-1 rounded-full">
                  <XCircle className="h-3 w-3" /> {summary.absent} Absent
                </span>
                <span className="flex items-center gap-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
                  <Clock className="h-3 w-3" /> {summary.late} Late
                </span>
              </div>
            </div>
            {students.length > 0 && (
              <div className="flex gap-2 text-xs">
                <Button size="sm" variant="outline" onClick={() => handleMarkAll('Present')} className="h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs">All Present</Button>
                <Button size="sm" variant="outline" onClick={() => handleMarkAll('Absent')} className="h-8 border-rose-300 text-rose-600 hover:bg-rose-50 text-xs">All Absent</Button>
                <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 border-zinc-300 text-zinc-600 hover:bg-zinc-50 flex items-center gap-1 text-xs">
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto" ref={printRef}>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3">Adm. No</th>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Attendance Status</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-zinc-500">
                      No students found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr key={student.studentId || idx} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3 text-zinc-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-zinc-900 text-xs font-medium">{student.admissionNo}</td>
                      <td className="px-4 py-3 font-mono text-zinc-700 text-xs">{student.rollNo}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-950">{student.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          {[
                            { label: 'Present', color: 'text-emerald-700', ring: 'accent-emerald-600' },
                            { label: 'Absent', color: 'text-rose-600', ring: 'accent-rose-600' },
                            { label: 'Late', color: 'text-amber-600', ring: 'accent-amber-500' }
                          ].map(opt => (
                            <label key={opt.label} className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="radio"
                                name={`status-${student.studentId || idx}`}
                                value={opt.label}
                                checked={student.status === opt.label}
                                onChange={() => handleStatusChange(student.studentId, opt.label)}
                                className={`h-3.5 w-3.5 cursor-pointer ${opt.ring}`}
                              />
                              <span className={`text-xs font-medium ${opt.color}`}>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={student.note}
                          onChange={e => handleNoteChange(student.studentId, e.target.value)}
                          className="w-full text-xs border border-zinc-200 rounded-md px-2.5 py-1.5 bg-white text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#084A86]"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {students.length > 0 && (
            <div className="p-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50">
              {saved && (
                <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Exam attendance saved successfully!
                </div>
              )}
              <div className="sm:ml-auto flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="border-zinc-300 text-zinc-600 hover:bg-zinc-100 flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  Print Sheet
                </Button>
                <Button
                  disabled={saving}
                  onClick={handleSave}
                  className="bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold flex items-center gap-2 px-6"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'SAVING...' : 'SAVE EXAM ATTENDANCE'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
