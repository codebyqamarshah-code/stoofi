'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Plus, Calendar as CalendarIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function StudentAttendancePage() {
  const [formData, setFormData] = useState({
    class: '',
    section: '',
    attendanceDate: new Date().toISOString().split('T')[0]
  });

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [cRes, sRes] = await Promise.all([api.get('/class'), api.get('/section')]);
      if (cRes.success) setClasses(cRes.data);
      if (sRes.success) setSections(sRes.data);
    } catch(e){}
  };

  const handleSearch = async () => {
    if (formData.class && formData.section && formData.attendanceDate) {
      setLoading(true);
      try {
        const res = await api.get(`/student-attendance?class=${formData.class}&section=${formData.section}&date=${formData.attendanceDate}`);
        if (res.success) {
          setStudents(res.data);
          setIsSearched(true);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please select all criteria fields to search.');
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
        alert('Attendance saved successfully');
      }
    } catch (e) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Student Attendance</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Student Attendance</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class <span className="text-rose-500">*</span></Label>
            <select 
              value={formData.class}
              onChange={(e) => setFormData({...formData, class: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="">Select Class *</option>
              {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section <span className="text-rose-500">*</span></Label>
            <select 
              value={formData.section}
              onChange={(e) => setFormData({...formData, section: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="">Select Section *</option>
              {(classes.find(c => c.name === formData.class)?.sections || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Attendance Date <span className="text-rose-500">*</span></Label>
            <Input 
              type="date"
              value={formData.attendanceDate} 
              onChange={(e) => setFormData({...formData, attendanceDate: e.target.value})}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
            />
          </div>
          
          <div className="md:col-span-3 flex items-end justify-end pt-2">
            <Button disabled={loading} onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
              {loading ? 'Searching...' : <><Search className="h-4 w-4" /> SEARCH</>}
            </Button>
          </div>
        </div>
      </div>

      {isSearched && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mt-6">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <h3 className="text-lg font-bold text-white">Attendance Register</h3>
            <div className="flex gap-2 text-xs">
              <Button size="sm" variant="outline" onClick={() => handleMarkAll('Present')} className="h-8 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10">Mark All Present</Button>
              <Button size="sm" variant="outline" onClick={() => handleMarkAll('Absent')} className="h-8 border-rose-500/50 text-rose-500 hover:bg-rose-500/10">Mark All Absent</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Admission No</th>
                  <th className="px-4 py-3 font-semibold">Roll No</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Attendance</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {students.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-zinc-500">No students found for this class and section.</td></tr>
                ) : (
                  students.map((student, idx) => (
                    <tr key={student.studentId} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 text-zinc-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-zinc-300">{student.admissionNo}</td>
                      <td className="px-4 py-3 text-zinc-300">{student.rollNo}</td>
                      <td className="px-4 py-3 font-medium text-white">{student.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          {['Present', 'Absent', 'Late', 'Half Day'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name={`status-${student.studentId}`}
                                value={opt}
                                checked={student.status === opt}
                                onChange={() => handleStatusChange(student.studentId, opt)}
                                className={`h-3 w-3 ${opt === 'Present' ? 'accent-emerald-500' : opt === 'Absent' ? 'accent-rose-500' : opt === 'Late' ? 'accent-amber-500' : 'accent-blue-500'}`}
                              />
                              <span className="text-zinc-300 text-xs">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          value={student.note || ''}
                          onChange={(e) => handleNoteChange(student.studentId, e.target.value)}
                          className="h-8 text-xs bg-zinc-900 border-zinc-800"
                          placeholder="Remark..."
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {students.length > 0 && (
            <div className="p-4 border-t border-zinc-800 flex justify-end bg-zinc-900/50">
              <Button disabled={saving} onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {saving ? 'SAVING...' : <><Save className="h-4 w-4 mr-2" /> SAVE ATTENDANCE</>}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
