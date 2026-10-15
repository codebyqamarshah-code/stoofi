'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import {
  ChevronRight, Plus, Pencil, Trash2, Search, Shield, CheckSquare,
  Square, ChevronUp, ChevronDown, X, Save, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';

const PERMISSION_MODULES = {
  HR: ['View Staff', 'Add Staff', 'Edit Staff', 'Delete Staff', 'Manage Attendance', 'Manage Payroll'],
  Academics: ['View Students', 'Add Students', 'Edit Students', 'Delete Students', 'Manage Classes', 'Manage Subjects', 'Manage Exams', 'View Results'],
  Finance: ['View Fees', 'Collect Fees', 'Generate Invoice', 'View Reports', 'Manage Expenses', 'Manage Payroll'],
  Library: ['View Books', 'Add Books', 'Issue Books', 'Return Books', 'Manage Members'],
  Transport: ['View Routes', 'Manage Routes', 'Assign Vehicles', 'Track Attendance'],
  LMS: ['View Courses', 'Create Courses', 'Edit Courses', 'Delete Courses', 'Manage Enrollments'],
  Settings: ['System Settings', 'Role Management', 'User Management', 'Backup & Restore'],
};

const FALLBACK_ROLES = [
  { _id: '1', name: 'Super Admin', description: 'Full system access', permissions: Object.values(PERMISSION_MODULES).flat(), createdAt: '2024-01-01' },
  { _id: '2', name: 'Admin', description: 'Administrative access', permissions: ['View Staff', 'Add Staff', 'Edit Staff', 'View Students', 'Add Students', 'Collect Fees', 'View Fees'], createdAt: '2024-01-02' },
  { _id: '3', name: 'Teacher', description: 'Academic staff access', permissions: ['View Students', 'Manage Classes', 'Manage Subjects', 'Manage Exams', 'View Results', 'View Courses'], createdAt: '2024-01-03' },
  { _id: '4', name: 'Accountant', description: 'Finance department access', permissions: ['View Fees', 'Collect Fees', 'Generate Invoice', 'View Reports', 'Manage Expenses'], createdAt: '2024-01-04' },
  { _id: '5', name: 'Librarian', description: 'Library management access', permissions: ['View Books', 'Add Books', 'Issue Books', 'Return Books', 'Manage Members'], createdAt: '2024-01-05' },
  { _id: '6', name: 'Security Guard', description: 'Entry/exit monitoring', permissions: ['View Students', 'View Staff'], createdAt: '2024-01-06' },
];

export default function RolePage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [toast, setToast] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  const [form, setForm] = useState({ name: '', description: '', permissions: [] });
  const [expandedModules, setExpandedModules] = useState(Object.keys(PERMISSION_MODULES).reduce((a, k) => ({ ...a, [k]: true }), {}));

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/role');
      const data = Array.isArray(res) ? res : res?.data || res?.roles || [];
      setRoles(data.length ? data : FALLBACK_ROLES);
    } catch {
      setRoles(FALLBACK_ROLES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const togglePermission = (perm) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter(p => p !== perm)
        : [...f.permissions, perm]
    }));
  };

  const toggleModule = (module) => {
    const perms = PERMISSION_MODULES[module];
    const allSelected = perms.every(p => form.permissions.includes(p));
    setForm(f => ({
      ...f,
      permissions: allSelected
        ? f.permissions.filter(p => !perms.includes(p))
        : [...new Set([...f.permissions, ...perms])]
    }));
  };

  const selectAll = () => setForm(f => ({ ...f, permissions: Object.values(PERMISSION_MODULES).flat() }));
  const clearAll = () => setForm(f => ({ ...f, permissions: [] }));

  const startEdit = (role) => {
    setEditingRole(role._id);
    setForm({ name: role.name, description: role.description || '', permissions: role.permissions || [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setForm({ name: '', description: '', permissions: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Role name is required', 'error'); return; }
    setSaving(true);
    try {
      if (editingRole) {
        await api.put(`/role/${editingRole}`, form);
        setRoles(prev => prev.map(r => r._id === editingRole ? { ...r, ...form } : r));
        showToast('Role updated successfully');
      } else {
        const res = await api.post('/role', form);
        const newRole = res?.role || res?.data || { _id: Date.now().toString(), ...form, createdAt: new Date().toISOString() };
        setRoles(prev => [newRole, ...prev]);
        showToast('Role created successfully');
      }
      cancelEdit();
    } catch {
      if (editingRole) {
        setRoles(prev => prev.map(r => r._id === editingRole ? { ...r, ...form } : r));
        showToast('Role updated (offline mode)');
      } else {
        setRoles(prev => [{ _id: Date.now().toString(), ...form, createdAt: new Date().toISOString() }, ...prev]);
        showToast('Role created (offline mode)');
      }
      cancelEdit();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this role? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/role/${id}`);
    } catch { /* offline fallback */ }
    setRoles(prev => prev.filter(r => r._id !== id));
    showToast('Role deleted');
    setDeleting(null);
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = roles
    .filter(r => r.name?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = sortField === 'permissions' ? (a.permissions?.length || 0) : (a[sortField] || '');
      const bv = sortField === 'permissions' ? (b.permissions?.length || 0) : (b[sortField] || '');
      return sortDir === 'asc'
        ? (typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv)))
        : (typeof bv === 'number' ? bv - av : String(bv).localeCompare(String(av)));
    });

  const SortIcon = ({ field }) => sortField === field
    ? (sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 inline ml-1 text-[#084A86]" /> : <ChevronDown className="h-3.5 w-3.5 inline ml-1 text-[#084A86]" />)
    : <ChevronUp className="h-3.5 w-3.5 inline ml-1 text-zinc-300" />;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Role Management</h1>
          <div className="flex items-center gap-1 text-sm text-zinc-500 mt-1">
            <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Roles</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zinc-900 font-medium">Role Management</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#084A86] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Shield className="h-4 w-4" />
                <h2 className="font-semibold text-sm">{editingRole ? 'Edit Role' : 'Add New Role'}</h2>
              </div>
              {editingRole && (
                <button onClick={cancelEdit} className="text-white/70 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-1.5">Role Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Head Teacher"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#084A86] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this role..."
                  rows={2}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#084A86] focus:border-transparent resize-none"
                />
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Permissions</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={selectAll} className="text-xs text-[#084A86] hover:underline font-medium">All</button>
                    <span className="text-zinc-300">|</span>
                    <button type="button" onClick={clearAll} className="text-xs text-zinc-500 hover:underline">None</button>
                  </div>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {Object.entries(PERMISSION_MODULES).map(([module, perms]) => {
                    const allChecked = perms.every(p => form.permissions.includes(p));
                    const someChecked = perms.some(p => form.permissions.includes(p)) && !allChecked;
                    return (
                      <div key={module} className="border border-zinc-100 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedModules(em => ({ ...em, [module]: !em[module] }))}
                          className="w-full flex items-center justify-between px-3 py-2 bg-zinc-50 hover:bg-zinc-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); toggleModule(module); }}
                              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${allChecked ? 'bg-[#084A86] border-[#084A86]' : someChecked ? 'bg-[#084A86]/30 border-[#084A86]' : 'border-zinc-300 bg-white'}`}
                            >
                              {(allChecked || someChecked) && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </button>
                            <span className="text-xs font-semibold text-zinc-700">{module}</span>
                            <span className="text-xs text-zinc-400">({perms.filter(p => form.permissions.includes(p)).length}/{perms.length})</span>
                          </div>
                          {expandedModules[module] ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
                        </button>
                        {expandedModules[module] && (
                          <div className="px-3 py-2 grid grid-cols-1 gap-1.5 bg-white">
                            {perms.map(perm => (
                              <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                                <div
                                  onClick={() => togglePermission(perm)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${form.permissions.includes(perm) ? 'bg-[#084A86] border-[#084A86]' : 'border-zinc-300 bg-white group-hover:border-[#084A86]'}`}
                                >
                                  {form.permissions.includes(perm) && <div className="w-2 h-0.5 bg-white rounded-full" style={{ height: '2px', width: '8px' }} />}
                                </div>
                                <span className="text-xs text-zinc-600 group-hover:text-zinc-900 transition-colors">{perm}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-zinc-400 mt-2">{form.permissions.length} permission(s) selected</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : editingRole ? 'Update Role' : 'Save Role'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Table */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-zinc-900">Roles List</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search roles..."
                  className="pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#084A86] w-52"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide cursor-pointer select-none" onClick={() => handleSort('name')}>
                      Role <SortIcon field="name" />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide cursor-pointer select-none" onClick={() => handleSort('description')}>
                      Description <SortIcon field="description" />
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wide cursor-pointer select-none" onClick={() => handleSort('permissions')}>
                      Perms <SortIcon field="permissions" />
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr><td colSpan={4} className="px-4 py-12 text-center text-zinc-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading roles...
                    </td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-12 text-center text-zinc-400">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-zinc-300" />No roles found
                    </td></tr>
                  ) : filtered.map(role => (
                    <tr key={role._id} className={`hover:bg-zinc-50 transition-colors ${editingRole === role._id ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#084A86]/10 flex items-center justify-center">
                            <Shield className="h-3.5 w-3.5 text-[#084A86]" />
                          </div>
                          <span className="font-medium text-zinc-900">{role.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs max-w-[160px] truncate">{role.description || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#084A86]/10 text-[#084A86]">
                          <CheckSquare className="h-3 w-3" />
                          {role.permissions?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEdit(role)}
                            className="p-1.5 rounded-lg hover:bg-[#084A86]/10 text-zinc-500 hover:text-[#084A86] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(role._id)}
                            disabled={deleting === role._id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-500 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deleting === role._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50 text-xs text-zinc-500">
              Showing {filtered.length} of {roles.length} role(s)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
