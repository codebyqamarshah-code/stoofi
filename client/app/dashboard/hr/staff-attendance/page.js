'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function StaffAttendancePage() {
  const [formData, setFormData] = useState({
    attendanceDate: new Date().toISOString().split('T')[0]
  });

  const [staffs, setStaffs] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSearch = async () => {
    if (formData.attendanceDate) {
      setLoading(true);
      try {
        const res = await api.get(`/staff-attendance?date=${formData.attendanceDate}`);
        if (res.success) {
          setStaffs(res.data);
          setIsSearched(true);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = (staffId, status) => {
    setStaffs(prev => prev.map(s => s.staffId === staffId ? { ...s, status } : s));
  };

  const handleNoteChange = (staffId, note) => {
    setStaffs(prev => prev.map(s => s.staffId === staffId ? { ...s, note } : s));
  };

  const handleMarkAll = (status) => {
    setStaffs(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.post('/staff-attendance', {
        date: formData.attendanceDate,
        attendanceData: staffs
      });
      if (res.success) {
        alert('Staff attendance saved successfully');
      }
    } catch (e) {
      alert('Failed to save staff attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Staff Attendance</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Staff Attendance</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-950">Select Date</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Attendance Date <span className="text-rose-500">*</span></Label>
            <Input 
              type="date"
              value={formData.attendanceDate} 
              onChange={(e) => setFormData({...formData, attendanceDate: e.target.value})}
              className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" 
            />
          </div>
          
          <div className="flex items-end pt-2">
            <Button disabled={loading} onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
              {loading ? 'Searching...' : <><Search className="h-4 w-4" /> SEARCH</>}
            </Button>
          </div>
        </div>
      </div>

      {isSearched && (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden mt-6">
          <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
            <h3 className="text-lg font-bold text-zinc-950">Attendance Register</h3>
            <div className="flex gap-2 text-xs">
              <Button size="sm" variant="outline" onClick={() => handleMarkAll('Present')} className="h-8 border-zinc-600/50 text-zinc-600 hover:bg-zinc-600/10">Mark All Present</Button>
              <Button size="sm" variant="outline" onClick={() => handleMarkAll('Absent')} className="h-8 border-rose-500/50 text-rose-500 hover:bg-rose-500/10">Mark All Absent</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Designation</th>
                  <th className="px-4 py-3 font-semibold">Attendance</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {staffs.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-zinc-500">No staff found in the system.</td></tr>
                ) : (
                  staffs.map((staff, idx) => (
                    <tr key={staff.staffId} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-zinc-950">{staff.name}</td>
                      <td className="px-4 py-3 text-zinc-950">{staff.department}</td>
                      <td className="px-4 py-3 text-zinc-950">{staff.designation}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          {['Present', 'Absent', 'Late', 'Half Day'].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="radio" 
                                name={`status-${staff.staffId}`}
                                value={opt}
                                checked={staff.status === opt}
                                onChange={() => handleStatusChange(staff.staffId, opt)}
                                className={`h-3 w-3 ${opt === 'Present' ? 'accent-zinc-600' : opt === 'Absent' ? 'accent-rose-500' : opt === 'Late' ? 'accent-amber-500' : 'accent-blue-500'}`}
                              />
                              <span className="text-zinc-950 text-xs">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          value={staff.note || ''}
                          onChange={(e) => handleNoteChange(staff.staffId, e.target.value)}
                          className="h-8 text-xs bg-white border-zinc-300 text-zinc-950"
                          placeholder="Remark..."
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {staffs.length > 0 && (
            <div className="p-4 border-t border-zinc-200 flex justify-end bg-zinc-50">
              <Button disabled={saving} onClick={handleSave} className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold">
                {saving ? 'SAVING...' : <><Save className="h-4 w-4 mr-2" /> SAVE ATTENDANCE</>}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
