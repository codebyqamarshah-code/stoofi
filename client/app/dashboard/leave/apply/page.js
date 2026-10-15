'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Send, Paperclip, CalendarDays, Clock3, CheckCircle2, XCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

const DEMO_STAFF = [
  { _id: 's1', firstName: 'Ayesha', lastName: 'Tariq', employeeId: 'EMP-001' },
  { _id: 's2', firstName: 'Bilal', lastName: 'Hassan', employeeId: 'EMP-002' },
  { _id: 's3', firstName: 'Sara', lastName: 'Ahmed', employeeId: 'EMP-003' },
  { _id: 's4', firstName: 'Umar', lastName: 'Farooq', employeeId: 'EMP-004' },
];
const DEMO_TYPES = [
  { _id: 't1', name: 'Annual Leave', maxDays: 20 },
  { _id: 't2', name: 'Sick Leave', maxDays: 10 },
  { _id: 't3', name: 'Casual Leave', maxDays: 7 },
  { _id: 't4', name: 'Maternity Leave', maxDays: 90 },
];
const DEMO_APPLICATIONS = [
  { _id: 'a1', employeeName: 'Ayesha Tariq', leaveTypeName: 'Sick Leave', fromDate: '2026-10-10', toDate: '2026-10-12', days: 3, reason: 'Fever and cold', status: 'approved', appliedAt: '2026-10-09' },
  { _id: 'a2', employeeName: 'Bilal Hassan', leaveTypeName: 'Annual Leave', fromDate: '2026-10-14', toDate: '2026-10-18', days: 5, reason: 'Family vacation', status: 'pending', appliedAt: '2026-10-11' },
  { _id: 'a3', employeeName: 'Sara Ahmed', leaveTypeName: 'Casual Leave', fromDate: '2026-10-15', toDate: '2026-10-15', days: 1, reason: 'Personal work', status: 'approved', appliedAt: '2026-10-13' },
  { _id: 'a4', employeeName: 'Umar Farooq', leaveTypeName: 'Emergency Leave', fromDate: '2026-10-08', toDate: '2026-10-09', days: 2, reason: 'Family emergency', status: 'rejected', appliedAt: '2026-10-07' },
];

const BLANK = { staffId: '', leaveTypeId: '', fromDate: '', toDate: '', reason: '', attachment: null };

function StatusBadge({ status }) {
  const map = {
    approved: { cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Approved' },
    pending: { cls: 'bg-amber-100 text-amber-700', icon: Clock3, label: 'Pending' },
    rejected: { cls: 'bg-rose-100 text-rose-700', icon: XCircle, label: 'Rejected' },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <Icon className="w-3.5 h-3.5" />{cfg.label}
    </span>
  );
}

function calcDays(from, to) {
  if (!from || !to) return 0;
  const d1 = new Date(from), d2 = new Date(to);
  if (d2 < d1) return 0;
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
}

export default function ApplyLeavePage() {
  const [form, setForm] = useState(BLANK);
  const [staff, setStaff] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, ltRes, aRes] = await Promise.all([
        api.get('/staff'), api.get('/leave-type'), api.get('/leave')
      ]);
      setStaff(sRes.success && sRes.data?.length > 0 ? sRes.data : DEMO_STAFF);
      setLeaveTypes(ltRes.success && ltRes.data?.length > 0 ? ltRes.data : DEMO_TYPES);
      setApplications(aRes.success && aRes.data?.length > 0 ? aRes.data : DEMO_APPLICATIONS);
    } catch {
      setStaff(DEMO_STAFF); setLeaveTypes(DEMO_TYPES); setApplications(DEMO_APPLICATIONS);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); }
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'attachment') setForm(f => ({ ...f, attachment: files[0] || null }));
    else setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.staffId) return showMsg('Please select an employee.', true);
    if (!form.leaveTypeId) return showMsg('Please select a leave type.', true);
    if (!form.fromDate) return showMsg('Please select a from date.', true);
    if (!form.toDate) return showMsg('Please select a to date.', true);
    if (new Date(form.toDate) < new Date(form.fromDate)) return showMsg('To date must be after from date.', true);
    if (!form.reason.trim()) return showMsg('Please provide a reason.', true);

    setSaving(true);
    try {
      const days = calcDays(form.fromDate, form.toDate);
      const sel = staff.find(s => s._id === form.staffId);
      const lt = leaveTypes.find(t => t._id === form.leaveTypeId);
      const payload = { staffId: form.staffId, leaveTypeId: form.leaveTypeId, fromDate: form.fromDate, toDate: form.toDate, days, reason: form.reason, status: 'pending', employeeName: sel ? `${sel.firstName} ${sel.lastName}` : '', leaveTypeName: lt?.name || '' };
      const res = await api.post('/leave', payload);
      if (res.success) {
        showMsg('Leave application submitted successfully!');
        setForm(BLANK); fetchAll();
      } else showMsg(res.message || 'Submission failed.', true);
    } catch (err) { showMsg(err.message || 'Server error.', true); }
    finally { setSaving(false); }
  };

  const staffOptions = staff.map(s => ({ value: s._id, label: `${s.firstName} ${s.lastName}${s.employeeId ? ' (' + s.employeeId + ')' : ''}` }));
  const typeOptions = leaveTypes.map(t => ({ value: t._id, label: `${t.name} (${t.maxDays} days max)` }));
  const days = calcDays(form.fromDate, form.toDate);

  const handleSelectChange = name => e => setForm(f => ({ ...f, [name]: e.target.value }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Apply for Leave</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Submit and track staff leave applications</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/leave" className="hover:text-[#084A86] transition-colors">Leave</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-700 font-semibold">Apply</span>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />{success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#084A86]/10 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-[#084A86]" />
          </div>
          <h2 className="text-base font-bold text-zinc-800">Leave Application Form</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700">Select Employee <span className="text-rose-500">*</span></Label>
              <SearchableSelect options={staffOptions} value={form.staffId} onChange={handleSelectChange('staffId')} placeholder="Search employee..." name="staffId" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700">Leave Type <span className="text-rose-500">*</span></Label>
              <SearchableSelect options={typeOptions} value={form.leaveTypeId} onChange={handleSelectChange('leaveTypeId')} placeholder="Select leave type..." name="leaveTypeId" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fromDate" className="text-xs font-semibold text-zinc-700">From Date <span className="text-rose-500">*</span></Label>
              <Input id="fromDate" name="fromDate" type="date" value={form.fromDate} onChange={handleChange}
                className="border-zinc-300 focus-visible:ring-[#084A86]" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="toDate" className="text-xs font-semibold text-zinc-700">To Date <span className="text-rose-500">*</span></Label>
              <Input id="toDate" name="toDate" type="date" value={form.toDate} onChange={handleChange}
                min={form.fromDate} className="border-zinc-300 focus-visible:ring-[#084A86]" />
            </div>
          </div>

          {/* Days calculated */}
          {days > 0 && (
            <div className="mt-4 flex items-center gap-2 bg-[#084A86]/5 border border-[#084A86]/20 rounded-xl px-4 py-3">
              <CalendarDays className="w-4 h-4 text-[#084A86]" />
              <span className="text-sm font-semibold text-[#084A86]">Duration: <strong>{days} day{days !== 1 ? 's' : ''}</strong></span>
            </div>
          )}

          <div className="mt-5 space-y-1.5">
            <Label htmlFor="reason" className="text-xs font-semibold text-zinc-700">Reason for Leave <span className="text-rose-500">*</span></Label>
            <textarea id="reason" name="reason" value={form.reason} onChange={handleChange} rows={4}
              placeholder="Please describe the reason for your leave request..."
              className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86] resize-none" />
          </div>

          <div className="mt-5 space-y-1.5">
            <Label htmlFor="attachment" className="text-xs font-semibold text-zinc-700">Attachment (Optional)</Label>
            <label htmlFor="attachment"
              className="flex items-center gap-3 border-2 border-dashed border-zinc-300 hover:border-[#084A86] rounded-xl px-4 py-3 cursor-pointer transition-colors group">
              <Paperclip className="w-5 h-5 text-zinc-400 group-hover:text-[#084A86] transition-colors" />
              <div>
                <p className="text-sm font-medium text-zinc-600">{form.attachment ? form.attachment.name : 'Click to attach a file'}</p>
                <p className="text-xs text-zinc-400">PDF, JPG, PNG up to 5MB</p>
              </div>
              <input id="attachment" name="attachment" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="hidden" />
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="submit" disabled={saving}
              className="bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold rounded-xl h-10 px-6">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</> : <><Send className="w-4 h-4 mr-2" />Submit Application</>}
            </Button>
            <Button type="button" variant="outline" onClick={() => setForm(BLANK)}
              className="border-zinc-300 text-zinc-600 hover:bg-zinc-50 rounded-xl h-10 px-4">
              Clear Form
            </Button>
          </div>
        </form>
      </div>

      {/* Applications List */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#084A86]/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#084A86]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-800">Leave Applications</h2>
              <p className="text-xs text-zinc-500">{applications.length} total application{applications.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            {['pending', 'approved', 'rejected'].map(s => (
              <span key={s} className={`px-2.5 py-1 rounded-full font-semibold capitalize ${s === 'approved' ? 'bg-emerald-100 text-emerald-700' : s === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                {applications.filter(a => (a.status || 'pending') === s).length} {s}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase font-bold border-b border-zinc-100">
              <tr>
                <th className="px-6 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Leave Type</th>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">To</th>
                <th className="px-4 py-3 text-center">Days</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center text-zinc-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-zinc-400">No applications found</td></tr>
              ) : applications.map((a, i) => {
                const emp = staff.find(s => s._id === a.staffId);
                const empName = a.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : '-');
                const lt = leaveTypes.find(t => t._id === a.leaveTypeId);
                const typeName = a.leaveTypeName || lt?.name || '-';
                return (
                  <tr key={a._id || i} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-3.5 text-zinc-500 text-xs font-medium">{i + 1}</td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-800">{empName}</td>
                    <td className="px-4 py-3.5 text-zinc-600">{typeName}</td>
                    <td className="px-4 py-3.5 text-zinc-600">{a.fromDate ? new Date(a.fromDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="px-4 py-3.5 text-zinc-600">{a.toDate ? new Date(a.toDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#084A86]/10 text-[#084A86] font-bold text-sm">
                        {a.days || calcDays(a.fromDate, a.toDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500 max-w-[160px] truncate">{a.reason || '-'}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={a.status || 'pending'} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
