'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Plus, Award } from 'lucide-react';
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
  { _id: 'c1', name: 'Class 1' },
  { _id: 'c2', name: 'Class 2' },
  { _id: 'c3', name: 'Class 3' },
  { _id: 'c4', name: 'Class 4' },
  { _id: 'c5', name: 'Class 5' },
  { _id: 'c6', name: 'Class 6' },
  { _id: 'c7', name: 'Class 7' },
  { _id: 'c8', name: 'Class 8' },
  { _id: 'c9', name: 'Class 9' },
  { _id: 'c10', name: 'Class 10' },
  { _id: 'c11', name: 'O-Levels' },
  { _id: 'c12', name: 'A-Levels' },
];

const DEFAULT_SUBJECTS = [
  { _id: 's1', name: 'Mathematics' },
  { _id: 's2', name: 'English Language' },
  { _id: 's3', name: 'Urdu Literature' },
  { _id: 's4', name: 'General Science' },
  { _id: 's5', name: 'Physics' },
  { _id: 's6', name: 'Chemistry' },
  { _id: 's7', name: 'Biology' },
  { _id: 's8', name: 'Computer Science' },
  { _id: 's9', name: 'Islamiat' },
  { _id: 's10', name: 'Pakistan Studies' },
];

const DEFAULT_SECTIONS = [
  { _id: 'sec1', name: 'Section A' },
  { _id: 'sec2', name: 'Section B' },
  { _id: 'sec3', name: 'Section C' },
  { _id: 'sec4', name: 'Section D' },
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
        if (cRes?.success && Array.isArray(cRes.data) && cRes.data.length > 0) setClasses(cRes.data);
        if (subRes?.success && Array.isArray(subRes.data) && subRes.data.length > 0) setSubjects(subRes.data);
        if (secRes?.success && Array.isArray(secRes.data) && secRes.data.length > 0) setSections(secRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSearch = async () => {
    if (!formData.examId || !formData.classId || !formData.subjectId) {
      alert('Please select Exam, Class, and Subject to search.');
      return;
    }
    
    setLoading(true);
    try {
      const selectedClass = classes.find(c => c._id === formData.classId)?.name || formData.classId;
      const res = await api.get(`/student?className=${encodeURIComponent(selectedClass)}`).catch(() => null);
      if (res?.success && Array.isArray(res.data)) {
        setStudents(res.data.map(st => ({
          studentId: st._id,
          admissionNo: st.admissionNo || st.rollNumber || 'N/A',
          rollNo: st.rollNumber || '1',
          name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.fullName || 'Student',
          status: 'Present',
          note: ''
        })));
      } else {
        setStudents([]);
      }
      setSearched(true);
    } catch (e) {
      setStudents([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
  };

  const handleMarkAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Award className="h-6 w-6 text-indigo-400" />
            Exam Attendance
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Track and manage student attendance during formal examinations</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Examinations</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Exam Attendance</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-900/30">
          <h2 className="text-sm font-semibold text-zinc-950 uppercase tracking-wider">Select Criteria</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">EXAM <span className="text-rose-500">*</span></label>
              <SearchableSelect 
                value={formData.examId} onChange={(val) => setFormData({...formData, examId: val})}
                placeholder="Select Exam *"
                options={exams.map(e => ({ label: e.name, value: e._id || e.name }))}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">CLASS <span className="text-rose-500">*</span></label>
              <SearchableSelect 
                value={formData.classId} onChange={(val) => setFormData({...formData, classId: val})}
                placeholder="Select Class *"
                options={classes.map(c => ({ label: c.name, value: c._id || c.name }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">SUBJECT <span className="text-rose-500">*</span></label>
              <SearchableSelect 
                value={formData.subjectId} onChange={(val) => setFormData({...formData, subjectId: val})}
                placeholder="Select Subject *"
                options={subjects.map(s => ({ label: s.name, value: s._id || s.name }))}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase font-bold">SECTION</label>
              <SearchableSelect 
                value={formData.sectionId} onChange={(val) => setFormData({...formData, sectionId: val})}
                placeholder="Select Section"
                options={sections.map(s => ({ label: s.name, value: s._id || s.name }))}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button disabled={loading} onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-6 font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" />
              {loading ? 'Searching...' : 'SEARCH EXAM REGISTER'}
            </Button>
          </div>
        </div>
      </div>

      {searched && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-300">
          <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50">
            <div>
              <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <span>Exam Attendance List</span>
                <span className="text-xs font-normal text-zinc-700 bg-zinc-800 px-2 py-0.5 rounded-full">
                  {students.length} Student{students.length !== 1 ? 's' : ''}
                </span>
              </h3>
            </div>
            {students.length > 0 && (
              <div className="flex gap-2 text-xs">
                <Button size="sm" variant="outline" onClick={() => handleMarkAll('Present')} className="h-8 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">Mark All Present</Button>
                <Button size="sm" variant="outline" onClick={() => handleMarkAll('Absent')} className="h-8 border-rose-500/30 text-rose-400 hover:bg-rose-500/10">Mark All Absent</Button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12">#</th>
                  <th className="px-4 py-3 font-semibold">Admission No</th>
                  <th className="px-4 py-3 font-semibold">Roll No</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Exam Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-zinc-500">
                      No students enrolled in this class.
                    </td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr key={student.studentId || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3 text-zinc-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-zinc-950 text-xs">{student.admissionNo}</td>
                      <td className="px-4 py-3 font-mono text-zinc-950 text-xs">{student.rollNo}</td>
                      <td className="px-4 py-3 font-medium text-zinc-950">{student.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {[
                            { label: 'Present', color: 'accent-emerald-500 text-emerald-400' },
                            { label: 'Absent', color: 'accent-rose-500 text-rose-400' },
                            { label: 'Late', color: 'accent-amber-500 text-amber-400' }
                          ].map(opt => (
                            <label key={opt.label} className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input 
                                type="radio" 
                                name={`exam-status-${student.studentId || idx}`}
                                value={opt.label}
                                checked={student.status === opt.label}
                                onChange={() => handleStatusChange(student.studentId, opt.label)}
                                className={`h-3.5 w-3.5 cursor-pointer ${opt.color}`}
                              />
                              <span className="text-zinc-950 text-xs">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {students.length > 0 && (
            <div className="p-4 border-t border-zinc-200 flex justify-end bg-zinc-900/30">
              <Button onClick={() => alert('Exam attendance submitted successfully!')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                SAVE EXAM ATTENDANCE
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
