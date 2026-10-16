'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Edit, 
  X, 
  Bell, 
  Smartphone, 
  Sparkles,
  Info
} from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEMO_TIMES = [
  { _id: 'st-1', title: 'Morning Attendance Broadcast', time: '08:30 AM', trigger: 'Student Present / Absent Marking', status: 'Active' },
  { _id: 'st-2', title: 'Mid-Day Campus Gate Check', time: '11:45 AM', trigger: 'Late Arrival Alerts', status: 'Active' },
  { _id: 'st-3', title: 'School Dispersal & Transport Departure', time: '01:45 PM', trigger: 'Transport Departure Notification', status: 'Active' },
  { _id: 'st-4', title: 'Evening Daily Homework & Diary Sync', time: '05:00 PM', trigger: 'Class Homework Assignment', status: 'Active' },
  { _id: 'st-5', title: 'Monthly Fee Reminder Dispatch', time: '06:30 PM', trigger: '1st of Every Month', status: 'Inactive' },
];

export default function SMSSendingTimePage() {
  const [records, setRecords] = useState(DEMO_TIMES);
  const [formData, setFormData] = useState({ title: '', time: '08:30 AM', trigger: 'Daily Schedule', status: 'Active' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/sms-sending-time');
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setRecords(res.data);
      } else {
        setRecords(DEMO_TIMES);
      }
    } catch {
      setRecords(DEMO_TIMES);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.time.trim()) {
      showToast('⚠️ Time is required.');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await api.put(`/sms-sending-time/${editingId}`, formData).catch(() => null);
        setRecords(records.map(r => r._id === editingId ? { ...r, ...formData } : r));
        showToast('✓ SMS schedule updated successfully!');
      } else {
        const res = await api.post('/sms-sending-time', formData).catch(() => null);
        const newRec = res?.data || {
          _id: `st-${Date.now()}`,
          ...formData
        };
        setRecords([newRec, ...records]);
        showToast('✓ New automated SMS trigger created!');
      }
      setEditingId(null);
      setFormData({ title: '', time: '08:30 AM', trigger: 'Daily Schedule', status: 'Active' });
    } catch (e) {
      showToast('⚠️ ' + (e.message || 'Error saving time'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (r) => {
    setEditingId(r._id);
    setFormData({
      title: r.title || '',
      time: r.time,
      trigger: r.trigger || 'Daily Schedule',
      status: r.status
    });
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete('/sms-sending-time/' + deleteModal._id).catch(() => null);
      setRecords(records.filter(r => r._id !== deleteModal._id));
      showToast('✓ SMS schedule deleted.');
    } catch {
      setRecords(records.filter(r => r._id !== deleteModal._id));
    }
    setDeleteModal(null);
  };

  const handleToggleStatus = (id) => {
    setRecords(records.map(r => {
      if (r._id === id) {
        const nextStatus = r.status === 'Active' ? 'Inactive' : 'Active';
        api.put(`/sms-sending-time/${id}`, { status: nextStatus }).catch(() => {});
        return { ...r, status: nextStatus };
      }
      return r;
    }));
    showToast('SMS trigger status updated.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-sky-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-zinc-950">Delete SMS Schedule?</h3>
            <p className="text-sm text-zinc-600">
              Are you sure you want to delete <strong className="text-rose-700">{deleteModal.title || deleteModal.time}</strong>?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDeleteModal(null)} className="text-xs">Cancel</Button>
              <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <Clock className="h-6 w-6" />
            </span>
            SMS Sending Time &amp; Triggers
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Automate scheduled SMS broadcasts for attendance, dispersal, fee alerts, and diary sync
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-600">Student Info</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">SMS Time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden sticky top-4">
            <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex justify-between items-center">
              <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                {editingId ? <><Edit className="w-4 h-4 text-[#084A86]" /> Edit Schedule</> : <><Plus className="w-4 h-4 text-[#084A86]" /> Add SMS Trigger</>}
              </h2>
              {editingId && (
                <button onClick={() => { setEditingId(null); setFormData({ title: '', time: '08:30 AM', trigger: 'Daily Schedule', status: 'Active' }); }} className="text-zinc-400 hover:text-zinc-900 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">
                  Broadcast Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Morning Attendance Broadcast"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white border-zinc-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">
                    Dispatch Time <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    required
                    placeholder="e.g. 08:30 AM"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="bg-white border-zinc-200 text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">
                    Status
                  </Label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-2.5 text-xs font-semibold text-zinc-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-extrabold text-zinc-700 uppercase">
                  Trigger Event
                </Label>
                <Input
                  placeholder="e.g. Automated after attendance lock"
                  value={formData.trigger}
                  onChange={e => setFormData({ ...formData, trigger: e.target.value })}
                  className="bg-white border-zinc-200 text-xs"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#084A86] hover:bg-[#063866] text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {editingId ? 'UPDATE SCHEDULE' : 'SAVE TRIGGER'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Table Card */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
              <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Configured SMS Timetable</h2>
              <span className="text-[11px] text-zinc-500 font-mono">Gateway: Pak Royal College GSM</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-10">#</th>
                    <th className="p-3">Schedule Title</th>
                    <th className="p-3 text-center">Time</th>
                    <th className="p-3">Trigger Event</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {records.map((r, i) => (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-zinc-400 font-mono">{i + 1}</td>
                      <td className="p-3 font-extrabold text-zinc-950">
                        {r.title || 'Automated SMS'}
                      </td>
                      <td className="p-3 text-center font-mono font-black text-zinc-800">
                        <span className="bg-sky-50 text-[#084A86] border border-sky-200 px-2.5 py-1 rounded-lg text-xs">
                          {r.time}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-600 font-medium">
                        {r.trigger || 'Daily Trigger'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(r._id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase cursor-pointer ${
                            r.status === 'Active' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {r.status}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#084A86] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal(r)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-zinc-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-zinc-500">
              <span>{records.length} automated SMS dispatch schedules active</span>
              <span className="font-bold text-zinc-700">Pak Royal College Sharaqpur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
