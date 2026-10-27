'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const staffFields = [
  'Staff No', 'Role', 'Department', 'Designation', 'First Name', 'Last Name',
  'Father Name', 'Mother Name', 'Email', 'Gender', 'Date Of Birth',
  'Date Of Joining', 'Phone', 'Emergency Contact', 'Marital Status',
  'Photo', 'Current Address', 'Permanent Address', 'Qualification', 'Work Experience'
];

export default function StaffSettingsPage() {
  const [fields, setFields] = useState(
    staffFields.map(f => ({ name: f, staffEdit: false, required: false }))
  );
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
      if (res?.success && Array.isArray(res.data?.staffFieldSettings) && res.data.staffFieldSettings.length > 0) {
        setFields(res.data.staffFieldSettings);
      }
    } catch (e) {
      console.error('Failed to load staff settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      const res = await api.put('/setting', {
        staffFieldSettings: fields
      });
      if (res?.success) {
        setSuccessMsg('Staff Settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3500);
      } else {
        alert(res?.message || 'Failed to save staff settings');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving staff settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleField = (index, key) => {
    const newFields = [...fields];
    newFields[index][key] = !newFields[index][key];
    setFields(newFields);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center text-xs font-semibold text-zinc-600">
            <span>Dashboard</span>
            <ChevronRight className="mx-2 h-3.5 w-3.5" />
            <span>General Settings</span>
            <ChevronRight className="mx-2 h-3.5 w-3.5" />
            <span className="text-zinc-950 font-bold">Staff Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950">Staff Settings & Field Permissions</h1>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold flex items-center gap-2 shadow-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs mb-8">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Staff Information Field Permissions</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Control whether staff can edit specific profile fields and whether they are required.</p>
          </div>
          <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
            {fields.length} Fields Configured
          </span>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading settings...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {fields.map((field, index) => (
                <div key={field.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-sm font-bold text-zinc-950">{field.name}</span>
                  <div className="flex gap-4">
                    <label className="flex flex-col items-center gap-1 cursor-pointer">
                      <span className="text-[10px] text-zinc-700 font-bold tracking-wider">STAFF EDIT</span>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={field.staffEdit}
                          onChange={() => toggleField(index, 'staffEdit')}
                        />
                        <div className={`block w-9 h-5 rounded-full transition-colors ${field.staffEdit ? 'bg-zinc-950' : 'bg-zinc-300'}`}></div>
                        <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${field.staffEdit ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                    <label className="flex flex-col items-center gap-1 cursor-pointer">
                      <span className="text-[10px] text-zinc-700 font-bold tracking-wider">REQUIRED</span>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={field.required}
                          onChange={() => toggleField(index, 'required')}
                        />
                        <div className={`block w-9 h-5 rounded-full transition-colors ${field.required ? 'bg-zinc-950' : 'bg-zinc-300'}`}></div>
                        <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${field.required ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-8 shadow-sm flex items-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>
    </div>
  );
}
