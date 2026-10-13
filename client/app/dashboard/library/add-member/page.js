'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Users, 
  Trash2, 
  Edit, 
  Plus, 
  X, 
  UserCheck, 
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';

const MEMBER_ROLES = ['Student', 'Teacher', 'Staff', 'Alumni / Parent'];

export default function AddMemberPage() {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '', 
    memberType: 'Student', 
    membershipExpiry: '' 
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    memberType: 'Student',
    membershipExpiry: ''
  });
  const [editSaving, setEditSaving] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/library-member');
      if (res?.success && Array.isArray(res.data)) setMembers(res.data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchMembers(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Member full name is required');
    try {
      setSubmitting(true);
      const res = await api.post('/library-member', formData);
      if (res?.success) { 
        setFormData({ 
          name: '', 
          phone: '', 
          email: '', 
          address: '', 
          memberType: 'Student', 
          membershipExpiry: '' 
        }); 
        fetchMembers(); 
      } else {
        alert(res?.message || 'Failed to enroll member');
      }
    } catch (e) { 
      alert(e.message || 'Error enrolling member'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setEditFormData({
      name: m.name || '',
      phone: m.phone || '',
      email: m.email || '',
      address: m.address || '',
      memberType: m.memberType || 'Student',
      membershipExpiry: m.membershipExpiry ? m.membershipExpiry.split('T')[0] : ''
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return alert('Name is required');
    try {
      setEditSaving(true);
      const res = await api.put(`/library-member/${editingMember._id}`, editFormData);
      if (res?.success) {
        setIsEditOpen(false);
        fetchMembers();
      } else {
        alert(res?.message || 'Failed to update member');
      }
    } catch (err) {
      alert('Failed to update member');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this library member?')) return;
    try { 
      const res = await api.delete(`/library-member/${id}`); 
      if (res?.success) fetchMembers(); 
    } catch (e) { 
      alert(e.message); 
    }
  };

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchType = typeFilter === 'ALL' || (m.memberType || '').toLowerCase() === typeFilter.toLowerCase();
      const q = search.toLowerCase().trim();
      const matchSearch = !q || 
        (m.name || '').toLowerCase().includes(q) ||
        (m.phone || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [members, typeFilter, search]);

  const exportColumns = [
    { key: 'name', label: 'Full Name' },
    { key: 'memberType', label: 'Member Type' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'membershipExpiry', label: 'Expiry Date' }
  ];

  const exportData = filtered.map(m => ({
    name: m.name,
    memberType: m.memberType || 'Student',
    phone: m.phone || '—',
    email: m.email || '—',
    address: m.address || '—',
    membershipExpiry: m.membershipExpiry ? new Date(m.membershipExpiry).toLocaleDateString() : '—'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#084A86]" />
            Library Members Directory
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Enroll students, teachers, and staff with library borrowing privileges</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/library" className="hover:text-zinc-600 transition-colors">Library</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Members</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Member */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#084A86]" />
                Enroll Library Member
              </h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Member Type / Role <span className="text-rose-500">*</span></Label>
                <select
                  value={formData.memberType}
                  onChange={e => setFormData({ ...formData, memberType: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none font-semibold cursor-pointer"
                >
                  {MEMBER_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Full Name <span className="text-rose-500">*</span></Label>
                <Input 
                  placeholder="e.g. Muhammad Ali"
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="h-10 rounded-xl" 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Phone Number</Label>
                <Input 
                  placeholder="e.g. 03001234567"
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  className="h-10 rounded-xl" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Email Address</Label>
                <Input 
                  type="email"
                  placeholder="e.g. member@school.edu"
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  className="h-10 rounded-xl" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Membership Expiry</Label>
                <Input 
                  type="date"
                  value={formData.membershipExpiry} 
                  onChange={e => setFormData({ ...formData, membershipExpiry: e.target.value })} 
                  className="h-10 rounded-xl" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Address / Department</Label>
                <Input 
                  placeholder="e.g. Class 10-A / Science Dept"
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  className="h-10 rounded-xl" 
                />
              </div>

              <Button 
                disabled={submitting} 
                type="submit" 
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-xl shadow-xs cursor-pointer"
              >
                {submitting ? 'Enrolling...' : 'Enroll Member'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Table: Member List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div className="flex items-center gap-2">
                {/* Role Filter Tabs */}
                <div className="flex items-center bg-white border border-zinc-200 rounded-xl p-0.5 text-xs font-semibold">
                  {['ALL', 'STUDENT', 'TEACHER', 'STAFF'].map(st => (
                    <button
                      key={st}
                      onClick={() => setTypeFilter(st)}
                      style={typeFilter === st ? { backgroundColor: '#084A86', color: '#ffffff' } : {}}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        typeFilter === st ? 'font-bold shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search name/phone..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="pl-8 h-8 text-xs bg-white border-zinc-200 rounded-xl" 
                  />
                </div>

                <TableExportToolbar
                  data={exportData}
                  columns={exportColumns}
                  filename="Library_Members_Report"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3.5 font-bold w-12">#</th>
                    <th className="px-4 py-3.5 font-bold">Member Name</th>
                    <th className="px-4 py-3.5 font-bold">Type</th>
                    <th className="px-4 py-3.5 font-bold">Contact</th>
                    <th className="px-4 py-3.5 font-bold">Expiry Date</th>
                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          Loading members...
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                        No library members found. Enroll a member using the form.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m, idx) => (
                      <tr key={m._id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="px-4 py-3.5 text-zinc-500 text-xs">#{idx + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-zinc-950">{m.name}</div>
                          {m.address && <div className="text-[11px] text-zinc-400">{m.address}</div>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            (m.memberType || '').toLowerCase() === 'student'
                              ? 'bg-blue-50 text-[#084A86] border-blue-200'
                              : (m.memberType || '').toLowerCase() === 'teacher'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                            {m.memberType || 'Student'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-zinc-700">
                          <div>{m.phone || '—'}</div>
                          {m.email && <div className="text-[11px] text-zinc-400">{m.email}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-600 text-xs">
                          {m.membershipExpiry ? new Date(m.membershipExpiry).toLocaleDateString() : 'Lifetime'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              onClick={() => handleOpenEdit(m)} 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Edit Member"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => handleDelete(m._id)} 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-zinc-200 text-xs text-zinc-500 bg-zinc-50/30">
              Showing {filtered.length} members
            </div>
          </div>
        </div>
      </div>

      {/* Edit Member Modal */}
      {isEditOpen && editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 text-zinc-950 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Edit className="h-4 w-4 text-[#084A86]" />
                Edit Library Member
              </h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Role / Type</Label>
                <select
                  value={editFormData.memberType}
                  onChange={e => setEditFormData({ ...editFormData, memberType: e.target.value })}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:outline-none font-semibold cursor-pointer"
                >
                  {MEMBER_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Full Name *</Label>
                <Input 
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="h-10 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Phone Number</Label>
                <Input 
                  value={editFormData.phone}
                  onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Email Address</Label>
                <Input 
                  type="email"
                  value={editFormData.email}
                  onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Expiry Date</Label>
                <Input 
                  type="date"
                  value={editFormData.membershipExpiry}
                  onChange={e => setEditFormData({ ...editFormData, membershipExpiry: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-700 uppercase block mb-1">Address / Class Info</Label>
                <Input 
                  value={editFormData.address}
                  onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs h-9 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editSaving}
                  style={{ backgroundColor: '#084A86' }}
                  className="hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-xl cursor-pointer"
                >
                  {editSaving ? 'Updating...' : 'Update Member'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
