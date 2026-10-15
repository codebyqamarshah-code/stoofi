'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Plus, Pencil, Trash2, CheckCircle2, XCircle, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEMO_TYPES = [
  { _id: 'd1', name: 'Annual Leave', maxDays: 20, applicableFor: 'Both', carryForward: true, paid: true, description: 'Standard annual leave for all staff', status: 'active' },
  { _id: 'd2', name: 'Sick Leave', maxDays: 10, applicableFor: 'Both', carryForward: false, paid: true, description: 'Leave for medical illness or health issues', status: 'active' },
  { _id: 'd3', name: 'Casual Leave', maxDays: 7, applicableFor: 'Staff', carryForward: false, paid: true, description: 'Short casual leaves for personal matters', status: 'active' },
  { _id: 'd4', name: 'Maternity Leave', maxDays: 90, applicableFor: 'Staff', carryForward: false, paid: true, description: 'Paid maternity leave for female employees', status: 'active' },
];

const BLANK = { name: '', maxDays: '', applicableFor: 'Both', carryForward: false, paid: true, description: '', status: 'active' };

export default function LeaveTypePage() {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leave-type');
      if (res.success && res.data?.length > 0) setTypes(res.data);
      else setTypes(DEMO_TYPES);
    } catch { setTypes(DEMO_TYPES); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTypes(); }, []);

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 3500); }
    else { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) return showMsg('Leave type name is required.', true);
    if (!form.maxDays || isNaN(form.maxDays) || Number(form.maxDays) < 1) return showMsg('Enter a valid max days value.', true);
    setSaving(true);
    try {
      const payload = { ...form, maxDays: Number(form.maxDays) };
      let res;
      if (editId) res = await api.put(`/leave-type/${editId}`, payload);
      else res = await api.post('/leave-type', payload);
      if (res.success) {
        showMsg(editId ? 'Leave type updated successfully!' : 'Leave type created successfully!');
        setForm(BLANK); setEditId(null); fetchTypes();
      } else showMsg(res.message || 'Failed to save.', true);
    } catch (err) { showMsg(err.message || 'Server error.', true); }
    finally { setSaving(false); }
  };

  const handleEdit = t => {
    setEditId(t._id);
    setForm({ name: t.name, maxDays: t.maxDays, applicableFor: t.applicableFor || 'Both', carryForward: !!t.carryForward, paid: t.paid !== false, description: t.description || '', status: t.status || 'active' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!confirm('Delete this leave type?')) return;
    setDeleting(id);
    try {
      const res = await api.delete(`/leave-type/${id}`);
      if (res.success) { showMsg('Deleted.'); fetchTypes(); }
      else showMsg(res.message || 'Failed to delete.', true);
    } catch (err) { showMsg(err.message || 'Server error.', true); }
    finally { setDeleting(null); }
  };

  const filtered = types.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Leave Types</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Define and manage leave categories for staff and teachers</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/leave" className="hover:text-[#084A86] transition-colors">Leave</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-700 font-semibold">Types</span>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#084A86]/10 flex items-center justify-center">
                <Tag className="w-4 h-4 text-[#084A86]" />
              </div>
              <h2 className="text-base font-bold text-zinc-800">
                {editId ? 'Edit Leave Type' : 'Add Leave Type'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-zinc-700">Leave Type Name <span className="text-rose-500">*</span></Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Annual Leave" className="border-zinc-300 focus-visible:ring-[#084A86]" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxDays" className="text-xs font-semibold text-zinc-700">Max Days Allowed <span className="text-rose-500">*</span></Label>
                <Input id="maxDays" name="maxDays" type="number" min="1" value={form.maxDays} onChange={handleChange}
                  placeholder="e.g. 20" className="border-zinc-300 focus-visible:ring-[#084A86]" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="applicableFor" className="text-xs font-semibold text-zinc-700">Applicable For</Label>
                <select id="applicableFor" name="applicableFor" value={form.applicableFor} onChange={handleChange}
                  className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86] text-zinc-800">
                  <option value="Both">Both (Staff & Teachers)</option>
                  <option value="Staff">Staff Only</option>
                  <option value="Teacher">Teachers Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold text-zinc-700">Status</Label>
                <select id="status" name="status" value={form.status} onChange={handleChange}
                  className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#084A86] text-zinc-800">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer bg-zinc-50 rounded-xl px-4 py-3 border border-zinc-200 hover:border-[#084A86] transition-colors">
                  <div className="relative">
                    <input type="checkbox" name="carryForward" checked={form.carryForward} onChange={handleChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-zinc-200 peer-checked:bg-[#084A86] rounded-full transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-700">Carry Forward</p>
                    <p className="text-xs text-zinc-400">Rollover unused</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer bg-zinc-50 rounded-xl px-4 py-3 border border-zinc-200 hover:border-[#084A86] transition-colors">
                  <div className="relative">
                    <input type="checkbox" name="paid" checked={form.paid} onChange={handleChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-zinc-200 peer-checked:bg-[#084A86] rounded-full transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-700">Paid Leave</p>
                    <p className="text-xs text-zinc-400">Full salary</p>
                  </div>
                </label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-zinc-700">Description</Label>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3}
                  placeholder="Brief description about this leave type..."
                  className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86] resize-none" />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="flex-1 bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold rounded-xl h-10">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : (editId ? 'Update Type' : <><Plus className="w-4 h-4 mr-1.5" />Add Type</>)}
                </Button>
                {editId && (
                  <Button type="button" variant="outline" onClick={() => { setForm(BLANK); setEditId(null); }}
                    className="border-zinc-300 text-zinc-600 hover:bg-zinc-50 rounded-xl h-10 px-4">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-800">All Leave Types</h2>
                <p className="text-xs text-zinc-500">{types.length} type{types.length !== 1 ? 's' : ''} defined</p>
              </div>
              <div className="relative w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs border-zinc-300 focus-visible:ring-[#084A86]" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase font-bold border-b border-zinc-100">
                  <tr>
                    <th className="px-4 py-3 text-left">SL</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-center">Max Days</th>
                    <th className="px-4 py-3 text-left">Applicable</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-400 text-sm">No leave types found</td></tr>
                  ) : filtered.map((t, i) => (
                    <tr key={t._id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3.5 text-zinc-500 text-xs font-medium">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-semibold text-zinc-800">{t.name}</p>
                          <div className="flex gap-2 mt-0.5">
                            {t.paid && <span className="text-xs text-emerald-600 font-medium">Paid</span>}
                            {t.carryForward && <span className="text-xs text-blue-600 font-medium">• Carry Forward</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#084A86]/10 text-[#084A86] font-bold text-sm">
                          {t.maxDays}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs bg-zinc-100 text-zinc-700 rounded-full px-2.5 py-1 font-semibold">{t.applicableFor || 'Both'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {t.status === 'inactive' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(t)}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#084A86]/30 text-[#084A86] hover:bg-[#084A86]/10 font-semibold transition-colors">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => handleDelete(t._id)} disabled={deleting === t._id}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition-colors">
                            {deleting === t._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
