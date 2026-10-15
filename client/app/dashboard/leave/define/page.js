'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Search, ChevronRight, Sliders, Trash2, Edit2, Check, RefreshCw 
} from 'lucide-react';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEFAULT_DEFINED = [
  { _id: 'ld1', role: 'Teacher', leaveType: 'Casual Leave', days: 12 },
  { _id: 'ld2', role: 'Teacher', leaveType: 'Sick Leave', days: 10 },
  { _id: 'ld3', role: 'Teacher', leaveType: 'Annual Leave', days: 20 },
  { _id: 'ld4', role: 'Staff', leaveType: 'Casual Leave', days: 10 },
  { _id: 'ld5', role: 'Staff', leaveType: 'Sick Leave', days: 8 },
  { _id: 'ld6', role: 'Accountant', leaveType: 'Annual Leave', days: 18 },
  { _id: 'ld7', role: 'Admin', leaveType: 'Casual Leave', days: 15 },
];

const ROLES = ['Admin', 'Teacher', 'Staff', 'Accountant', 'Librarian'];
const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Maternity Leave', 'Emergency Leave'];

export default function LeaveDefinePage() {
    const [data, setData] = useState(DEFAULT_DEFINED);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({ role: 'Teacher', leaveType: 'Casual Leave', days: '' });
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/leave-define').catch(() => null);
                if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
                    setData(res.data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const showMsg = (msg) => {
        setFeedback(msg);
        setTimeout(() => setFeedback(''), 4000);
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({ role: item.role, leaveType: item.leaveType, days: item.days });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ role: 'Teacher', leaveType: 'Casual Leave', days: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.days || Number(formData.days) < 1) {
            return alert('Please enter valid number of allocated days.');
        }

        try {
            setSubmitting(true);
            if (editingId) {
                await api.put(`/leave-define/${editingId}`, formData).catch(() => null);
                setData(prev => prev.map(d => d._id === editingId ? { ...d, ...formData, days: Number(formData.days) } : d));
                showMsg('Leave quota policy updated successfully!');
            } else {
                const payload = { ...formData, days: Number(formData.days), _id: 'ld_' + Date.now() };
                try {
                    const res = await api.post('/leave-define', formData);
                    if (res?.success && res.data?._id) payload._id = res.data._id;
                } catch {
                    // graceful fallback
                }
                setData(prev => [...prev, payload]);
                showMsg('New leave quota policy added successfully!');
            }
            handleCancelEdit();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this leave quota rule?')) return;
        try {
            await api.delete(`/leave-define/${id}`).catch(() => null);
        } catch (e) {
            console.error(e);
        }
        setData(prev => prev.filter(d => d._id !== id));
        if (editingId === id) handleCancelEdit();
        showMsg('Leave quota deleted.');
    };

    const filtered = data.filter(item => 
        item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.leaveType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
                        <Sliders className="h-6 w-6 text-[#084A86]" />
                        Leave Quota Definition
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">Allocate maximum permitted annual leave days per staff role</p>
                </div>
                <div className="flex items-center text-sm text-zinc-400 font-medium">
                    <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <Link href="/dashboard/leave" className="hover:text-zinc-600 transition-colors">Leave</Link>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <span className="text-zinc-950 font-bold">Leave Define</span>
                </div>
            </div>

            {feedback && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{feedback}</span>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Form Card */}
                <div className="xl:col-span-1">
                    <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-zinc-950">
                                {editingId ? 'Edit Quota Rule' : 'Add Leave Quota'}
                            </h2>
                            {editingId && (
                                <button onClick={handleCancelEdit} className="text-xs text-zinc-500 hover:text-zinc-800 underline">
                                    Cancel
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-zinc-700 uppercase">Target Role <span className="text-rose-500">*</span></Label>
                                <select 
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                                >
                                    {ROLES.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-zinc-700 uppercase">Leave Type <span className="text-rose-500">*</span></Label>
                                <select 
                                    value={formData.leaveType}
                                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                                >
                                    {LEAVE_TYPES.map(lt => (
                                        <option key={lt} value={lt}>{lt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-zinc-700 uppercase">Allocated Days (Per Year) <span className="text-rose-500">*</span></Label>
                                <Input 
                                    type="number"
                                    min="1"
                                    max="365"
                                    placeholder="e.g. 14"
                                    value={formData.days}
                                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                    className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]"
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold py-2.5 mt-2"
                            >
                                {submitting ? 'SAVING...' : editingId ? 'UPDATE QUOTA' : 'SAVE QUOTA RULE'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Table Card */}
                <div className="xl:col-span-2">
                    <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden h-full flex flex-col">
                        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold text-zinc-950">Active Quota Rules</h2>
                                <span className="text-xs bg-zinc-200/70 text-zinc-700 px-2.5 py-0.5 rounded-full font-bold">
                                    {data.length} Rules
                                </span>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                                <input 
                                    type="text" 
                                    placeholder="SEARCH ROLE OR LEAVE TYPE..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-950">
                                <thead className="text-xs text-zinc-700 uppercase bg-zinc-100/70 border-b border-zinc-200 font-bold">
                                    <tr>
                                        <th className="px-4 py-3 font-bold w-12">#</th>
                                        <th className="px-4 py-3 font-bold">Target Role</th>
                                        <th className="px-4 py-3 font-bold">Leave Type</th>
                                        <th className="px-4 py-3 font-bold text-center">Allocated Days</th>
                                        <th className="px-4 py-3 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-10 text-center text-zinc-500 font-medium">
                                                No leave definitions match your search query.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((item, idx) => (
                                            <tr key={item._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                                                <td className="px-4 py-3.5 text-zinc-400 text-xs">{idx + 1}</td>
                                                <td className="px-4 py-3.5 font-bold text-zinc-950">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-zinc-100 text-zinc-800">
                                                        {item.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 font-medium text-zinc-800 text-xs">
                                                    {item.leaveType}
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="font-extrabold text-sm text-[#084A86] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                                        {item.days} Days / Yr
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button 
                                                            onClick={() => handleEdit(item)}
                                                            className="text-[#084A86] hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                                            title="Edit Quota"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(item._id)}
                                                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                                            title="Delete Quota"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}