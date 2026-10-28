'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Search, Save, Printer, CheckCircle2,
  UserCheck, UserX, Clock, AlertCircle, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { getPhotoUrl } from '@/lib/utils';

const STATUS_CONFIG = {
  Present: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'accent-emerald-600' },
  Absent: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', accent: 'accent-red-500' },
  Late: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', accent: 'accent-amber-500' },
  'Half Day': { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', accent: 'accent-blue-500' },
};

export default function StaffAttendancePage() {
  const [formData, setFormData] = useState({
    attendanceDate: new Date().toISOString().split('T')[0]
  });
  const [staffs, setStaffs] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const printRef = useRef(null);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };

  const handleSearch = async (overrideDate = null) => {
    const targetDate = overrideDate || formData.attendanceDate;
    if (!targetDate) return;
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.get(`/staff-attendance?date=${targetDate}`);
      const list = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
      if (Array.isArray(list) && list.length > 0) {
        setStaffs(list);
      } else {
        // Fallback: query registered staff from /staff
        const staffRes = await api.get('/staff?limit=500').catch(() => null);
        const sList = staffRes?.data?.data || (Array.isArray(staffRes?.data) ? staffRes.data : []);
        if (Array.isArray(sList) && sList.length > 0) {
          setStaffs(sList.map(s => ({
            staffId: String(s._id || s.id),
            staffNo: s.staffNo || '',
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Staff Member',
            department: s.department || 'Administration',
            designation: s.designation || 'Staff',
            photo: s.staffPhoto || s.photo || s.avatar || null,
            status: 'Present',
            note: ''
          })));
        } else {
          setStaffs([]);
        }
      }
      setIsSearched(true);
    } catch (err) {
      console.error('Failed to load staff attendance:', err);
      try {
        const staffRes = await api.get('/staff?limit=500').catch(() => null);
        const sList = staffRes?.data?.data || (Array.isArray(staffRes?.data) ? staffRes.data : []);
        if (Array.isArray(sList) && sList.length > 0) {
          setStaffs(sList.map(s => ({
            staffId: String(s._id || s.id),
            staffNo: s.staffNo || '',
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Staff Member',
            department: s.department || 'Administration',
            designation: s.designation || 'Staff',
            photo: s.staffPhoto || s.photo || s.avatar || null,
            status: 'Present',
            note: ''
          })));
        } else {
          setStaffs([]);
        }
      } catch (_) {
        setStaffs([]);
      }
      setIsSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch real staff attendance on component mount
  useEffect(() => {
    handleSearch();
  }, []);

  const handleStatusChange = (staffId, status) =>
    setStaffs(prev => prev.map(s => s.staffId === staffId ? { ...s, status } : s));

  const handleNoteChange = (staffId, note) =>
    setStaffs(prev => prev.map(s => s.staffId === staffId ? { ...s, note } : s));

  const handleMarkAll = (status) =>
    setStaffs(prev => prev.map(s => ({ ...s, status })));

  const handleSave = async () => {
    if (staffs.length === 0) {
      showError('No staff records found to save.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/staff-attendance', {
        date: formData.attendanceDate,
        attendanceData: staffs
      });
      if (res?.data?.success !== false) {
        showSuccess('Staff attendance saved successfully!');
      } else {
        showError(res?.data?.message || 'Failed to save attendance.');
      }
    } catch (err) {
      console.error('Save attendance error:', err);
      showError(err?.response?.data?.message || 'Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Staff Attendance - ${formData.attendanceDate}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #111; }
            h1 { font-size: 18px; color: #084A86; margin-bottom: 4px; }
            p { color: #666; margin-bottom: 16px; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #084A86; color: white; padding: 8px 12px; text-align: left; font-size: 11px; }
            td { padding: 7px 12px; border-bottom: 1px solid #eee; font-size: 11px; }
            tr:nth-child(even) td { background: #f8f9fa; }
            .badge { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; display: inline-block; }
            .Present { background: #d1fae5; color: #065f46; }
            .Absent { background: #fee2e2; color: #991b1b; }
            .Late { background: #fef3c7; color: #92400e; }
            .HalfDay { background: #dbeafe; color: #1e40af; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  // Summary counts
  const counts = staffs.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  const summaryChips = [
    { label: 'Present', count: counts['Present'] || 0, icon: UserCheck, ...STATUS_CONFIG.Present },
    { label: 'Absent', count: counts['Absent'] || 0, icon: UserX, ...STATUS_CONFIG.Absent },
    { label: 'Late', count: counts['Late'] || 0, icon: Clock, ...STATUS_CONFIG.Late },
    { label: 'Half Day', count: counts['Half Day'] || 0, icon: Users, ...STATUS_CONFIG['Half Day'] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Staff Attendance</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Record and manage daily staff attendance</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/hr" className="hover:text-zinc-600 transition-colors">HR</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">Staff Attendance</span>
        </div>
      </div>

      {/* Inline alerts */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Date selector card */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50">
          <h2 className="text-base font-semibold text-zinc-900">Select Attendance Date</h2>
        </div>
        <div className="p-5 flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-1.5 w-full sm:w-72">
            <Label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
              Attendance Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.attendanceDate}
              onChange={e => {
                const newDate = e.target.value;
                setFormData({ ...formData, attendanceDate: newDate });
                if (newDate) handleSearch(newDate);
              }}
              className="border-zinc-300 focus-visible:ring-[#084A86] focus-visible:border-[#084A86]"
            />
          </div>
          <Button
            disabled={loading}
            onClick={() => handleSearch()}
            className="bg-[#084A86] hover:bg-[#073b6b] text-white gap-2 font-semibold"
          >
            {loading ? (
              <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Loading...</>
            ) : (
              <><Search className="h-4 w-4" /> Load Staff</>
            )}
          </Button>
        </div>
      </div>

      {/* Attendance Register */}
      {isSearched && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
          {/* Sub-header with summary + actions */}
          <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Attendance Register</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{formData.attendanceDate} &bull; {staffs.length} registered staff</p>
              </div>
              {staffs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAll('Present')}
                    className="h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    Mark All Present
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAll('Absent')}
                    className="h-8 text-xs border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Mark All Absent
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrint}
                    className="h-8 text-xs border-zinc-300 text-zinc-600 hover:bg-zinc-50 gap-1"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print
                  </Button>
                </div>
              )}
            </div>

            {/* Summary chips */}
            {staffs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {summaryChips.map(chip => {
                  const Icon = chip.icon;
                  return (
                    <div
                      key={chip.label}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${chip.bg} ${chip.border} ${chip.color}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {chip.label}: <span className="font-bold">{chip.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hidden print content */}
          <div className="hidden">
            <div ref={printRef}>
              <h1>Staff Attendance Register</h1>
              <p>Date: {formData.attendanceDate} &nbsp;|&nbsp; Total: {staffs.length} &nbsp;|&nbsp; Present: {counts['Present'] || 0} &nbsp;|&nbsp; Absent: {counts['Absent'] || 0} &nbsp;|&nbsp; Late: {counts['Late'] || 0}</p>
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Department</th><th>Designation</th><th>Status</th><th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {staffs.map((staff, idx) => (
                    <tr key={staff.staffId || idx}>
                      <td>{idx + 1}</td>
                      <td>{staff.name}</td>
                      <td>{staff.department}</td>
                      <td>{staff.designation}</td>
                      <td><span className={`badge ${staff.status?.replace(' ', '')}`}>{staff.status}</span></td>
                      <td>{staff.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase w-10">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Staff Member</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Designation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Attendance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase w-36">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {staffs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-zinc-500 text-sm">
                      <Users className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
                      <div className="font-semibold text-zinc-800 text-base">No Registered Staff Found</div>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                        There are currently no staff members registered in the database. Please add staff members in the Staff Directory to track their attendance.
                      </p>
                      <Link href="/dashboard/hr/staff-directory">
                        <Button size="sm" variant="outline" className="mt-4 text-xs font-semibold">
                          Go to Staff Directory
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  staffs.map((staff, idx) => {
                    const cfg = STATUS_CONFIG[staff.status] || STATUS_CONFIG.Present;
                    const photoUrl = getPhotoUrl(staff.photo);
                    return (
                      <tr key={staff.staffId || idx} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-4 py-3.5 text-zinc-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={staff.name}
                                className="h-8 w-8 rounded-full object-cover border border-zinc-200 shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-[#084A86] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {staff.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'S'}
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-zinc-900 block">{staff.name}</span>
                              {staff.staffNo && (
                                <span className="text-[11px] text-zinc-400 font-mono">ID: {staff.staffNo}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 text-sm">{staff.department || 'Academics'}</td>
                        <td className="px-4 py-3.5 text-zinc-600 text-sm">{staff.designation || 'Staff'}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center flex-wrap gap-3">
                            {['Present', 'Absent', 'Late', 'Half Day'].map(opt => {
                              const c = STATUS_CONFIG[opt];
                              return (
                                <label key={opt} className="flex items-center gap-1.5 cursor-pointer select-none">
                                  <input
                                    type="radio"
                                    name={`status-${staff.staffId}`}
                                    value={opt}
                                    checked={staff.status === opt}
                                    onChange={() => handleStatusChange(staff.staffId, opt)}
                                    className={`h-3.5 w-3.5 ${c.accent}`}
                                  />
                                  <span className={`text-xs font-medium ${staff.status === opt ? c.color : 'text-zinc-500'}`}>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Input
                            value={staff.note || ''}
                            onChange={e => handleNoteChange(staff.staffId, e.target.value)}
                            className="h-8 text-xs border-zinc-200 focus-visible:ring-[#084A86] placeholder:text-zinc-300"
                            placeholder="Remark..."
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {staffs.length > 0 && (
            <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                {staffs.length} staff &bull; Present: <strong className="text-emerald-600">{counts['Present'] || 0}</strong> &bull; Absent: <strong className="text-red-500">{counts['Absent'] || 0}</strong>
              </p>
              <Button
                disabled={saving}
                onClick={handleSave}
                className="bg-[#084A86] hover:bg-[#073b6b] text-white gap-2 font-semibold"
              >
                {saving ? (
                  <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Saving...</>
                ) : (
                  <><Save className="h-4 w-4" /> Save Attendance</>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
