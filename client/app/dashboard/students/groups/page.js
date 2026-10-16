'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Edit, Trash2, Users, Plus, X, 
  CheckCircle2, UserPlus, FolderOpen, Tag, Info, Eye 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

const DEMO_GROUPS = [
  { _id: 'g1', name: 'Science Group', description: 'Students studying Physics, Chemistry, Biology', students: 45 },
  { _id: 'g2', name: 'Arts Group', description: 'Students studying Humanities & Social Sciences', students: 38 },
  { _id: 'g3', name: 'Commerce Group', description: 'Students studying Business & Accounting', students: 32 },
  { _id: 'g4', name: 'Computer Science', description: 'Students studying IT & CS subjects', students: 28 },
  { _id: 'g5', name: 'Pre-Medical', description: 'Students pursuing MBBS / Medical careers', students: 52 },
  { _id: 'g6', name: 'Pre-Engineering', description: 'Students pursuing Engineering careers', students: 41 },
  { _id: 'g7', name: 'General Group', description: 'Default group for all newly admitted students', students: 67 },
  { _id: 'g8', name: 'FSC Nursing', description: 'Students enrolled in FSC Nursing program', students: 24 },
];

export default function StudentGroupPage() {
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/student-group');
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setGroups(res.data);
      } else {
        setGroups(DEMO_GROUPS);
      }
    } catch (err) {
      console.error(err);
      setGroups(DEMO_GROUPS);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('⚠️ Group name is required!');
      return;
    }

    try {
      if (editingId) {
        const res = await api.put(`/student-group/${editingId}`, { 
          name: formData.name.trim(),
          description: formData.description.trim()
        });
        if (res?.success) {
          setGroups(groups.map(g => g._id === editingId ? { ...g, name: res.data.name, description: res.data.description || formData.description } : g));
          showToast('✓ Group updated successfully!');
        }
      } else {
        const res = await api.post('/student-group', { 
          name: formData.name.trim(),
          description: formData.description.trim()
        });
        if (res?.success) {
          setGroups([{ ...res.data, students: 0 }, ...groups]);
          showToast('✓ New group created successfully!');
        } else {
          // Demo mode: add locally
          const newGroup = { _id: `g-${Date.now()}`, name: formData.name.trim(), description: formData.description.trim(), students: 0 };
          setGroups([newGroup, ...groups]);
          showToast('✓ Group added (demo mode)');
        }
      }
      setEditingId(null);
      setFormData({ name: '', description: '' });
    } catch (err) {
      showToast('⚠️ ' + (err?.response?.data?.message || err?.message || 'Error saving group'));
    }
  };

  const handleEdit = (groupObj) => {
    setEditingId(groupObj._id);
    setFormData({ name: groupObj.name, description: groupObj.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const res = await api.delete(`/student-group/${deleteModal._id}`);
      if (res?.success) {
        setGroups(groups.filter(g => g._id !== deleteModal._id));
        showToast('✓ Group deleted successfully!');
      }
    } catch (err) {
      showToast('⚠️ ' + (err?.response?.data?.message || 'Cannot delete group with assigned students'));
    }
    setDeleteModal(null);
  };

  const handleViewStudents = async (group) => {
    setViewModal(group);
    try {
      const res = await api.get(`/student?studentGroup=${group._id}`);
      if (res?.success && Array.isArray(res.data)) {
        setGroupStudents(res.data);
      } else {
        setGroupStudents([]);
      }
    } catch {
      setGroupStudents([]);
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
  };

  const filteredGroups = useMemo(() => {
    return groups.filter(g =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  const totalStudents = groups.reduce((s, g) => s + (g.students || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#084A86] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-sky-400/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{toast}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-zinc-900">Delete Student Group?</h3>
            <p className="text-sm text-zinc-600">
              Are you sure you want to delete <strong className="text-rose-700">{deleteModal.name}</strong>? 
              {(deleteModal.students || 0) > 0 && (
                <span className="block mt-1 text-amber-700 font-semibold">
                  ⚠️ This group has {deleteModal.students} students assigned. They must be reassigned first.
                </span>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteModal(null)} className="text-xs">Cancel</Button>
              <Button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">Delete Group</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Students Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-zinc-900">{viewModal.name}</h3>
                <p className="text-xs text-zinc-500">{viewModal.description || 'No description'}</p>
              </div>
              <button onClick={() => { setViewModal(null); setGroupStudents([]); }} className="p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"><X className="w-5 h-5 text-zinc-500" /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {groupStudents.length > 0 ? (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-zinc-200 font-bold uppercase text-zinc-600">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Student Name</th>
                      <th className="p-2">Adm No</th>
                      <th className="p-2">Class</th>
                      <th className="p-2">Section</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {groupStudents.map((st, i) => (
                      <tr key={st._id} className="hover:bg-slate-50/70">
                        <td className="p-2 text-zinc-400">{i + 1}</td>
                        <td className="p-2 font-bold text-zinc-900">{st.firstName} {st.lastName}</td>
                        <td className="p-2 font-mono text-zinc-600">{st.admissionNo}</td>
                        <td className="p-2 text-zinc-700">{st.className}</td>
                        <td className="p-2 text-zinc-700">{st.section}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <Users className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                  <p className="font-bold">No students in this group yet</p>
                  <p className="text-xs mt-1">Students can be assigned to groups from the Student Admission form</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]"><FolderOpen className="h-6 w-6" /></span>
            Student Groups
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Create &amp; manage student groups for academic classification</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/students" className="hover:text-zinc-600">Student Info</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Student Group</span>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center"><FolderOpen className="w-5 h-5" /></div>
          <div><span className="text-[11px] font-bold text-zinc-400 uppercase">Total Groups</span><div className="text-xl font-black text-zinc-900">{groups.length}</div></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
          <div><span className="text-[11px] font-bold text-zinc-400 uppercase">Total Students Assigned</span><div className="text-xl font-black text-emerald-600">{totalStudents}</div></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Tag className="w-5 h-5" /></div>
          <div><span className="text-[11px] font-bold text-zinc-400 uppercase">Avg Students / Group</span><div className="text-xl font-black text-amber-700">{groups.length > 0 ? Math.round(totalStudents / groups.length) : 0}</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add/Edit Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden sticky top-4">
            <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex justify-between items-center">
              <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                {editingId ? <><Edit className="w-4 h-4 text-[#084A86]" /> Edit Group</> : <><Plus className="w-4 h-4 text-[#084A86]" /> Add New Group</>}
              </h2>
              {editingId && (
                <button onClick={cancelEdit} className="text-zinc-400 hover:text-zinc-900 cursor-pointer"><X className="h-4 w-4" /></button>
              )}
            </div>
            <form className="p-5 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                  Group Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Science Group, Pre-Medical..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white border-zinc-200 text-zinc-950 text-sm focus-visible:ring-[#084A86]/20 focus-visible:border-[#084A86]"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-extrabold text-zinc-700 uppercase tracking-wide">
                  Description
                </Label>
                <textarea
                  placeholder="Brief description of this student group..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#084A86]/20 focus-visible:border-[#084A86] resize-none"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full bg-[#084A86] hover:bg-[#063866] text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-all active:scale-95">
                  {editingId ? 'UPDATE GROUP' : 'SAVE GROUP'}
                </Button>
                {editingId && (
                  <Button type="button" onClick={cancelEdit} variant="outline" className="w-full mt-2 text-xs">
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Student Group List</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white border-zinc-200 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-10">#</th>
                    <th className="p-3">Group Name</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Students</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center text-zinc-500">Loading groups...</td></tr>
                  ) : filteredGroups.length > 0 ? filteredGroups.map((g, i) => (
                    <tr key={g._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-zinc-400 font-mono">{i + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-zinc-900">{g.name}</div>
                      </td>
                      <td className="p-3 text-zinc-500 max-w-xs truncate">{g.description || '—'}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleViewStudents(g)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#084A86]/10 text-[#084A86] hover:bg-[#084A86]/20 transition-colors cursor-pointer"
                        >
                          <Users className="w-3 h-3" />
                          {g.students || 0}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleViewStudents(g)}
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
                            title="View Students"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(g)}
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#084A86] transition-colors cursor-pointer"
                            title="Edit Group"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal(g)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete Group"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-zinc-500">
                        <FolderOpen className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                        <p className="font-bold">{searchQuery ? 'No matching groups found' : 'No groups created yet'}</p>
                        <p className="text-xs mt-1">Use the form to create your first student group</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-zinc-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Showing {filteredGroups.length} of {groups.length} groups</span>
              <span className="font-bold text-zinc-700">{totalStudents} total students assigned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#084A86] mt-0.5 shrink-0" />
        <div className="text-xs text-zinc-700 space-y-1">
          <p className="font-bold text-[#084A86]">How Student Groups Work</p>
          <p>Student groups (Science, Arts, Commerce, Pre-Medical etc.) are used to classify students by their academic track. When you admit a new student, you can assign them to a group from the admission form. Groups help in generating class-wise reports, assigning subjects, and managing examination routing.</p>
        </div>
      </div>
    </div>
  );
}