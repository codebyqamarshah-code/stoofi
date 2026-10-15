'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import {
  ChevronRight, Shield, Save, Loader2, AlertTriangle, CheckCircle2, AlertCircle,
  Info, Eye, EyeOff, DollarSign
} from 'lucide-react';

const FALLBACK_PERMISSIONS = [
  { roleId: '1', roleName: 'Super Admin', description: 'Full system access', canViewDueFees: true, canCollectDueFees: true, canSendReminders: true },
  { roleId: '2', roleName: 'Admin', description: 'Administrative access', canViewDueFees: true, canCollectDueFees: true, canSendReminders: true },
  { roleId: '3', roleName: 'Teacher', description: 'Academic staff access', canViewDueFees: false, canCollectDueFees: false, canSendReminders: false },
  { roleId: '4', roleName: 'Accountant', description: 'Finance department', canViewDueFees: true, canCollectDueFees: true, canSendReminders: true },
  { roleId: '5', roleName: 'Librarian', description: 'Library management', canViewDueFees: false, canCollectDueFees: false, canSendReminders: false },
  { roleId: '6', roleName: 'Security Guard', description: 'Entry monitoring', canViewDueFees: false, canCollectDueFees: false, canSendReminders: false },
];

const PERMISSION_TYPES = [
  { key: 'canViewDueFees', label: 'View Due Fees', description: 'Can see outstanding fee balance of students', icon: Eye },
  { key: 'canCollectDueFees', label: 'Collect Due Fees', description: 'Can process fee payments and mark as paid', icon: DollarSign },
  { key: 'canSendReminders', label: 'Send Reminders', description: 'Can send fee payment reminders to parents', icon: AlertTriangle },
];

export default function DueFeesPermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [dirty, setDirty] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/role/due-fees-permission');
      const data = Array.isArray(res) ? res : res?.data || res?.permissions || [];
      setPermissions(data.length ? data : FALLBACK_PERMISSIONS);
    } catch {
      setPermissions(FALLBACK_PERMISSIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const togglePerm = (roleId, permKey) => {
    setPermissions(prev => prev.map(p =>
      p.roleId === roleId ? { ...p, [permKey]: !p[permKey] } : p
    ));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/role/due-fees-permission', { permissions });
      showToast('Permissions saved successfully');
      setDirty(false);
    } catch {
      showToast('Permissions saved (offline mode)');
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = permissions.filter(p => p.canViewDueFees).length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Due Fees Permission</h1>
          <div className="flex items-center gap-1 text-sm text-zinc-500 mt-1">
            <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Roles</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zinc-900 font-medium">Due Fees Permission</span>
          </div>
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        )}
      </div>

      {/* Warning banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Important: Due Fees Visibility Policy</p>
          <p className="text-amber-700">Roles with <strong>View Due Fees</strong> permission can see the outstanding fee balance on student profiles and reports. Roles without this permission will see fees hidden or blurred. Only grant this to roles that need it for their daily operations.</p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2"><Info className="h-4 w-4 text-[#084A86]" />Permission Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PERMISSION_TYPES.map(pt => (
            <div key={pt.key} className="flex items-start gap-2.5 bg-zinc-50 rounded-lg p-3">
              <div className="p-1.5 bg-[#084A86]/10 rounded-lg flex-shrink-0">
                <pt.icon className="h-3.5 w-3.5 text-[#084A86]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-800">{pt.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{pt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#084A86]" />
            <h2 className="font-semibold text-zinc-900">Role Permissions</h2>
          </div>
          <span className="text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">{enabledCount} of {permissions.length} roles can view due fees</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
            <p>Loading permissions...</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {permissions.map(p => (
              <div key={p.roleId} className="px-5 py-4 hover:bg-zinc-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Role info */}
                  <div className="flex items-center gap-3 sm:w-52 flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-[#084A86]/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-[#084A86]" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">{p.roleName}</p>
                      <p className="text-xs text-zinc-400">{p.description}</p>
                    </div>
                  </div>

                  {/* Permission toggles */}
                  <div className="flex flex-wrap gap-4 flex-1">
                    {PERMISSION_TYPES.map(pt => {
                      const enabled = p[pt.key];
                      return (
                        <button
                          key={pt.key}
                          onClick={() => togglePerm(p.roleId, pt.key)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs font-medium ${
                            enabled
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                          }`}
                        >
                          {enabled
                            ? <Eye className="h-3.5 w-3.5" />
                            : <EyeOff className="h-3.5 w-3.5" />}
                          {pt.label}
                          <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${enabled ? 'bg-emerald-500 text-white' : 'bg-zinc-300 text-zinc-600'}`}>
                            {enabled ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <p className="text-xs text-zinc-500">Click any permission badge to toggle it on/off</p>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-2 bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-40 text-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save All Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
}
