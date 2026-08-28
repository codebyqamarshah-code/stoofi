'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Edit, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', designationId: '', departmentId: '', joinDate: '', salary: '' };

export default function AddStaffPage() {
  const [records, setRecords] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);

  const fetchAll = async () => {
    try {
      const [stRes, desRes, depRes] = await Promise.all([
        api.get('/staff'), api.get('/designation'), api.get('/department')
      ]);
      if (stRes.success) setRecords(stRes.data);
      if (desRes.success) setDesignations(desRes.data);
      if (depRes.success) setDepartments(depRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editId) {
        const res = await api.put(`/staff/${editId}`, formData);
        if (res.success) { setFormData(EMPTY_FORM); setEditId(null); fetchAll(); }
      } else {
        const res = await api.post('/staff', formData);
        if (res.success) { setFormData(EMPTY_FORM); fetchAll(); }
      }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleEdit = (item) => {
    setFormData({
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      email: item.email || '',
      phone: item.phone || '',
      designationId: item.designationId || '',
      departmentId: item.departmentId || '',
      joinDate: item.joinDate ? item.joinDate.split('T')[0] : '',
      salary: item.salary || '',
    });
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData(EMPTY_FORM);
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try { const res = await api.delete(`/staff/${id}`); if (res.success) fetchAll(); } catch (e) { alert(e.message); }
  };

  const getName = (arr, id) => arr.find(x => x._id === id)?.name || '-';
  const filtered = records.filter(r => (r.firstName + ' ' + r.lastName).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">{editId ? 'Edit Staff' : 'Add Staff'}</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/hr/staff-directory" className="hover:text-emerald-400 transition-colors">Human Resource</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Add Staff</span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editId ? 'Edit Staff' : 'Add Staff'}</h2>
              {editId && (
                <button onClick={cancelEdit} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">First Name *</Label><Input name="firstName" value={formData.firstName} onChange={handleChange} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" required /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Last Name</Label><Input name="lastName" value={formData.lastName} onChange={handleChange} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Email</Label><Input type="email" name="email" value={formData.email} onChange={handleChange} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Phone</Label><Input name="phone" value={formData.phone} onChange={handleChange} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Designation</Label>
                <select name="designationId" value={formData.designationId} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select</option>
                  {designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Department</Label>
                <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Join Date</Label><Input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" /></div>
              <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-400 uppercase">Salary</Label><Input type="number" name="salary" value={formData.salary} onChange={handleChange} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" /></div>
              <div className="flex gap-2">
                <Button disabled={submitting} type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" />
                  {submitting ? 'SAVING...' : editId ? 'UPDATE STAFF' : 'SAVE STAFF'}
                </Button>
                {editId && (
                  <Button type="button" onClick={cancelEdit} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</Button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Staff List</h2>
              <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Designation</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  : filtered.map((item, idx) => (
                    <tr key={item._id} className={`hover:bg-zinc-900/50 transition-colors ${editId === item._id ? 'bg-emerald-950/20 border-l-2 border-l-emerald-500' : ''}`}>
                      <td className="px-4 py-3 text-emerald-500">+{idx+1}</td>
                      <td className="px-4 py-3 text-zinc-300">{item.firstName} {item.lastName}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        <div>{item.phone}</div>
                        <div className="text-xs opacity-50">{item.email}</div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{getName(designations, item.designationId)}</td>
                      <td className="px-4 py-3 text-zinc-400">{getName(departments, item.departmentId)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleEdit(item)} variant="ghost" size="sm" className="h-8 text-blue-500 hover:bg-blue-500/10">
                            <Edit className="h-3.5 w-3.5 mr-1" /> EDIT
                          </Button>
                          <Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10">DELETE</Button>
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
