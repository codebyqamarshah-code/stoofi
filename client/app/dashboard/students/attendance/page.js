'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Calendar as CalendarIcon, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
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
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" />
            Student Attendance
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage and record daily classroom attendance for students</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Student Attendance</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              options={classOptions}
              value={formData.class}
              placeholder="-- Select Class * --"
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              options={sectionOptions}
              value={formData.section}
              placeholder="-- Select Section * --"
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Attendance Date <span className="text-rose-500">*</span></Label>
            <Input 
              type="date"
              value={formData.attendanceDate} 
              onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
              className="bg-white border-zinc-300 text-zinc-950 font-medium focus-visible:ring-zinc-400 h-10" 
            />
          </div>
          
          <div className="md:col-span-3 flex items-center justify-between pt-4 border-t border-zinc-100">
            <span className="text-xs text-zinc-500 font-medium">Select class and section to view & mark students</span>
            <Button 
              disabled={loading} 
              onClick={handleSearch} 
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold flex items-center gap-2 px-6 rounded-lg shadow-xs"
            >
              {loading ? 'Searching...' : <><Search className="h-4 w-4" /> SEARCH STUDENTS</>}
            </Button>
          </div>
        </div>
      </div>

      {isSearched && (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <span>Attendance Register</span>
                <span className="text-xs font-bold text-zinc-800 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                  {students.length} Student{students.length !== 1 ? 's' : ''}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">Date: {formData.attendanceDate} | Class: {formData.class} ({formData.section})</p>
            </div>
            {students.length > 0 && (
              <div className="flex gap-2 text-xs">
                <Button size="sm" variant="outline" onClick={() => handleMarkAll('Present')} className="h-8 border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 font-bold">Mark All Present</Button>
                <Button size="sm" variant="outline" onClick={() => handleMarkAll('Absent')} className="h-8 border-rose-500/30 text-rose-700 hover:bg-rose-50 font-bold">Mark All Absent</Button>
                <Button size="sm" variant="outline" onClick={() => handleMarkAll('Late')} className="h-8 border-amber-500/30 text-amber-700 hover:bg-amber-50 font-bold">Mark All Late</Button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-bold w-12">#</th>
                  <th className="px-4 py-3 font-bold">Admission No</th>
                  <th className="px-4 py-3 font-bold">Roll No</th>
                  <th className="px-4 py-3 font-bold">Student Name</th>
                  <th className="px-4 py-3 font-bold">Attendance Status</th>
                  <th className="px-4 py-3 font-bold">Remarks / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-zinc-500 font-medium">
                      <p className="text-base font-bold text-zinc-800">No students found for this class and section.</p>
                      <p className="text-xs text-zinc-500 mt-1">Please enroll students in {formData.class} ({formData.section}) or check criteria.</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr key={student.studentId || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-zinc-500 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3.5 font-mono text-zinc-950 font-bold text-xs">{student.admissionNo}</td>
                      <td className="px-4 py-3.5 font-mono text-zinc-700 font-medium text-xs">{student.rollNo}</td>
                      <td className="px-4 py-3.5 font-bold text-zinc-950">{student.name}</td>
                      <td className="px-4 py-3.5">
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
                              <span className="text-zinc-900 text-xs font-semibold">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Input 
                          value={student.note || ''}
                          onChange={(e) => handleNoteChange(student.studentId, e.target.value)}
                          className="h-8 text-xs bg-white border-zinc-300 text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-400 font-medium"
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
            <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <span className="text-xs text-zinc-500 font-medium">Make sure all records are correct before saving</span>
              <Button 
                disabled={saving} 
                onClick={handleSave} 
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold flex items-center gap-2 px-6 rounded-lg shadow-xs"
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
