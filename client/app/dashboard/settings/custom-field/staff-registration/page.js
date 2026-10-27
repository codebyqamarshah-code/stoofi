'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Edit, Trash2, X, Plus, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEFAULT_STAFF_CUSTOM_FIELDS = [
  { id: 'scf-1', label: 'PEC / Faculty Registration License', type: 'Text', required: 'Yes', visibleToStaff: 'Yes' },
  { id: 'scf-2', label: 'Biometric Attendance ID', type: 'Number', required: 'Yes', visibleToStaff: 'Yes' },
  { id: 'scf-3', label: 'Bank Account IBAN for Payroll', type: 'Text', required: 'Yes', visibleToStaff: 'Yes' },
];

export default function StaffRegistrationPage() {
  const [formData, setFormData] = useState({ label: '', type: 'Text', required: 'No', visibleToStaff: 'Yes' });
  const [editId, setEditId] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/setting');
      if (res?.success && Array.isArray(res.data?.customFieldsStaff) && res.data.customFieldsStaff.length > 0) {
        setRecords(res.data.customFieldsStaff);
      } else {
        setRecords(DEFAULT_STAFF_CUSTOM_FIELDS);
      }
    } catch (e) {
      console.error('Failed to load staff custom fields:', e);
      setRecords(DEFAULT_STAFF_CUSTOM_FIELDS);
    } finally {
      setLoading(false);
    }
  };

  const persistFields = async (newRecords) => {
    try {
      setSaving(true);
      const res = await api.put('/setting', {
        customFieldsStaff: newRecords
      });
      if (res?.success) {
        setSuccessMsg('Staff custom fields saved to database!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to persist staff custom fields:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.label || !formData.label.trim()) {
      return alert('Please enter a Field Label');
    }

    let updated;
    if (editId) {
      updated = records.map(r => r.id === editId ? { ...r, ...formData } : r);
      setEditId(null);
    } else {
      updated = [{ id: 'scf-' + Date.now(), ...formData }, ...records];
    }
    setRecords(updated);
    setFormData({ label: '', type: 'Text', required: 'No', visibleToStaff: 'Yes' });
    await persistFields(updated);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this custom field?')) {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      await persistFields(updated);
    }
  };

  const cancelEdit = () => {
    setFormData({ label: '', type: 'Text', required: 'No', visibleToStaff: 'Yes' });
    setEditId(null);
  };

  const filtered = records.filter(r => 
    (r.label || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center text-xs text-zinc-500 mb-2">
            <Link href="/dashboard" className="hover:text-zinc-800 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <Link href="/dashboard/settings" className="hover:text-zinc-800 transition-colors">Settings</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-bold">Staff Custom Fields</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950">Staff Registration Custom Fields</h1>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg h-fit">
          {records.length} Custom Fields Active
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950">{editId ? 'Edit Custom Field' : 'Add New Custom Field'}</h2>
              {editId && <button onClick={cancelEdit} className="text-zinc-400 hover:text-zinc-950"><X className="h-4 w-4" /></button>}
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Field Label *</Label>
                <Input 
                  type="text"
                  required
                  name="label"
                  placeholder="e.g. Biometric Device User ID"
                  value={formData.label || ''} 
                  onChange={handleChange}
                  className="bg-zinc-50 border-zinc-300 text-zinc-950 focus-visible:ring-zinc-600" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Field Type *</Label>
                <select 
                  name="type"
                  value={formData.type || 'Text'} 
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                >
                  <option value="Text">Text (Single Line)</option>
                  <option value="Number">Number</option>
                  <option value="Dropdown">Dropdown (Select Option)</option>
                  <option value="Date">Date</option>
                  <option value="Textarea">Long Textarea</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 block">Required?</Label>
                  <select 
                    name="required"
                    value={formData.required || 'No'} 
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 text-xs font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  >
                    <option value="No">No (Optional)</option>
                    <option value="Yes">Yes (Mandatory)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-zinc-700 uppercase mb-1.5 block">Staff Profile View?</Label>
                  <select 
                    name="visibleToStaff"
                    value={formData.visibleToStaff || 'Yes'} 
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 text-xs font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  >
                    <option value="Yes">Visible</option>
                    <option value="No">Admin Only</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving} className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase">
                  {saving ? 'Saving...' : (editId ? 'UPDATE FIELD' : 'SAVE FIELD')}
                </Button>
                {editId && (
                  <Button type="button" onClick={cancelEdit} variant="outline" className="border-zinc-300 text-zinc-600 hover:text-zinc-950">Cancel</Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-bold text-zinc-950">Configured Staff Fields</h2>
              <div className="flex items-center gap-2 border border-zinc-300 rounded-lg px-2.5 py-1.5 bg-zinc-50">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search staff fields..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-36"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading fields...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs">
                No custom fields defined for staff yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs font-bold text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="px-4 py-2.5">Field Label</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Required</th>
                      <th className="px-4 py-2.5">Staff View</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-900">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-zinc-950">{item.label}</td>
                        <td className="px-4 py-3 font-mono text-xs">{item.type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.required === 'Yes' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'}`}>
                            {item.required}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">{item.visibleToStaff}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 text-zinc-500 hover:text-zinc-900 rounded hover:bg-zinc-100"
                              title="Edit Field"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-zinc-500 hover:text-rose-600 rounded hover:bg-rose-50"
                              title="Delete Field"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
