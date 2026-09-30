'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Calendar as CalendarIcon, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

const DEFAULT_CLASSES = [
  { _id: 'c-nursery', name: 'Nursery', sections: ['A', 'B'] },
  { _id: 'c-kg', name: 'KG', sections: ['A', 'B'] },
  { _id: 'c-prep', name: 'Prep', sections: ['A', 'B'] },
  { _id: 'c-1', name: 'Class 1', sections: ['A', 'B', 'C'] },
  { _id: 'c-2', name: 'Class 2', sections: ['A', 'B', 'C'] },
  { _id: 'c-3', name: 'Class 3', sections: ['A', 'B', 'C'] },
  { _id: 'c-4', name: 'Class 4', sections: ['A', 'B', 'C'] },
  { _id: 'c-5', name: 'Class 5', sections: ['A', 'B', 'C'] },
  { _id: 'c-6', name: 'Class 6', sections: ['A', 'B', 'C'] },
  { _id: 'c-7', name: 'Class 7', sections: ['A', 'B', 'C'] },
  { _id: 'c-8', name: 'Class 8', sections: ['A', 'B', 'C'] },
  { _id: 'c-9', name: 'Class 9', sections: ['A', 'B', 'C'] },
  { _id: 'c-10', name: 'Class 10', sections: ['A', 'B', 'C'] },
  { _id: 'c-olevels', name: 'O-Levels', sections: ['A', 'B'] },
  { _id: 'c-alevels', name: 'A-Levels', sections: ['A', 'B'] },
];

const DEFAULT_SECTIONS = [
  { _id: 's-a', name: 'A' },
  { _id: 's-b', name: 'B' },
  { _id: 's-c', name: 'C' },
  { _id: 's-d', name: 'D' },
];

export default function StudentAttendancePage() {
  const [formData, setFormData] = useState({
    class: '',
    section: '',
    attendanceDate: new Date().toISOString().split('T')[0]
  });

  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [students, setStudents] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/class').catch(() => null),
        api.get('/section').catch(() => null)
      ]);

      if (cRes && cRes.success && Array.isArray(cRes.data) && cRes.data.length > 0) {
        const fetchedNames = new Set(cRes.data.map(c => c.name.toLowerCase()));
        const uniqueDefaults = DEFAULT_CLASSES.filter(c => !fetchedNames.has(c.name.toLowerCase()));
        setClasses([...cRes.data, ...uniqueDefaults]);
      } else {
        setClasses(DEFAULT_CLASSES);
      }

      if (sRes && sRes.success && Array.isArray(sRes.data) && sRes.data.length > 0) {
        setSections(sRes.data);
      } else {
        setSections(DEFAULT_SECTIONS);
      }
    } catch (e) {
      setClasses(DEFAULT_CLASSES);
      setSections(DEFAULT_SECTIONS);
    }
  };

  const getAvailableSections = () => {
    if (!formData.class) {
      return sections.map(s => (typeof s === 'string' ? s : s.name));
    }
    const selected = classes.find(c => c.name === formData.class || c._id === formData.class);
    if (selected && selected.sections && selected.sections.length > 0) {
      return selected.sections;
    }
    return ['A', 'B', 'C', 'D'];
  };

  const handleSearch = async () => {
    if (!formData.class || !formData.section || !formData.attendanceDate) {
      alert('Please select Class, Section, and Attendance Date to search.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/student-attendance?class=${encodeURIComponent(formData.class)}&section=${encodeURIComponent(formData.section)}&date=${formData.attendanceDate}`);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setStudents(res.data);
        setIsSearched(true);
      } else {
        const stuRes = await api.get(`/student?className=${encodeURIComponent(formData.class)}&section=${encodeURIComponent(formData.section)}`).catch(() => null);
        if (stuRes && stuRes.success && Array.isArray(stuRes.data) && stuRes.data.length > 0) {
          const mapped = stuRes.data.map(st => ({
            studentId: st._id,
            admissionNo: st.admissionNo || st.rollNumber || 'N/A',
            rollNo: st.rollNumber || '1',
            name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.fullName || 'Student',
            status: 'Present',
            note: ''
          }));
          setStudents(mapped);
        } else {
          setStudents([]);
        }
        setIsSearched(true);
      }
    } catch (e) {
      console.error(e);
      setStudents([]);
      setIsSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
  };

  const handleNoteChange = (studentId, note) => {
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, note } : s));
  };

  const handleMarkAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.post('/student-attendance', {
        date: formData.attendanceDate,
        attendanceData: students
      });
      if (res.success) {
        alert('Attendance saved successfully!');
      } else {
        alert(res.message || 'Failed to save attendance');
      }
    } catch (e) {
      alert('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const classOptions = classes.map(c => ({
    label: c.name,
    value: c.name
  }));

  const sectionOptions = getAvailableSections().map(s => {
    const raw = s.startsWith('Section ') ? s.replace('Section ', '') : s;
    const display = s.startsWith('Section ') ? s : `Section ${s}`;
    return { label: display, value: raw };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            Student Attendance
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage and record daily classroom attendance for students</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-500">Student Attendance</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              options={classOptions}
              value={formData.class}
              placeholder="-- Select Class * --"
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              options={sectionOptions}
              value={formData.section}
              placeholder="-- Select Section * --"
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Attendance Date <span className="text-rose-500">*</span></Label>
            <Input 
              type="date"
              value={formData.attendanceDate} 
              onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
              className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-indigo-500 h-10" 
            />
          </div>
          
          <div className="md:col-span-3 flex items-center justify-between pt-2 border-t border-zinc-900">
            <span className="text-xs text-zinc-500">Select class and section to view & mark students</span>
            <Button 
              disabled={loading} 
              onClick={handleSearch} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 px-6"
            >
              {loading ? 'Searching...' : <><Search className="h-4 w-4" /> SEARCH STUDENTS</>}
            </Button>
          </div>
        </div>
      </div>

      {isSearched && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-300">
          <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/50">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Attendance Register</span>
                <span className="text-xs font-normal text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                  {students.length} Student{students.length !== 1 ? 's' : ''}
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Date: {formData.attendanceDate} | Class: {formData.class} ({formData.section})</p>
            </div>
            {students.length > 0 && (
              <div className="flex gap-2 text-xs">
                <Button size="sm" variant="outline" onClick={() => handleMarkAll('Present')} className="h-8 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">Mark All Present</Button>
                <Button size="sm" variant="outline" onClick={() => handleMarkAll('Absent')} className="h-8 border-rose-500/30 text-rose-400 hover:bg-rose-500/10">Mark All Absent</Button>
                <Button size="sm" variant="outline" onClick={() => handleMarkAll('Late')} className="h-8 border-amber-500/30 text-amber-400 hover:bg-amber-500/10">Mark All Late</Button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12">#</th>
                  <th className="px-4 py-3 font-semibold">Admission No</th>
                  <th className="px-4 py-3 font-semibold">Roll No</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Attendance Status</th>
                  <th className="px-4 py-3 font-semibold">Remarks / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-zinc-500">
                      <p className="text-base font-medium text-zinc-400">No students found for this class and section.</p>
                      <p className="text-xs text-zinc-500 mt-1">Please enroll students in {formData.class} ({formData.section}) or check criteria.</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr key={student.studentId || idx} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3 text-zinc-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-zinc-300 text-xs">{student.admissionNo}</td>
                      <td className="px-4 py-3 font-mono text-zinc-300 text-xs">{student.rollNo}</td>
                      <td className="px-4 py-3 font-medium text-white">{student.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {[
                            { label: 'Present', color: 'accent-emerald-500 text-emerald-400' },
                            { label: 'Absent', color: 'accent-rose-500 text-rose-400' },
                            { label: 'Late', color: 'accent-amber-500 text-amber-400' },
                            { label: 'Half Day', color: 'accent-blue-500 text-blue-400' }
                          ].map(opt => (
                            <label key={opt.label} className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input 
                                type="radio" 
                                name={`status-${student.studentId || idx}`}
                                value={opt.label}
                                checked={student.status === opt.label}
                                onChange={() => handleStatusChange(student.studentId, opt.label)}
                                className={`h-3.5 w-3.5 cursor-pointer ${opt.color}`}
                              />
                              <span className="text-zinc-300 text-xs">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          value={student.note || ''}
                          onChange={(e) => handleNoteChange(student.studentId, e.target.value)}
                          className="h-8 text-xs bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500"
                          placeholder="Optional remark..."
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {students.length > 0 && (
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30">
              <span className="text-xs text-zinc-400">Make sure all records are correct before saving</span>
              <Button 
                disabled={saving} 
                onClick={handleSave} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 px-6"
              >
                {saving ? 'SAVING...' : <><Save className="h-4 w-4" /> SAVE ATTENDANCE</>}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
