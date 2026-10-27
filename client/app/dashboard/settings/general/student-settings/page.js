'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const admissionFields = [
  'Session', 'Class', 'Section', 'Roll Number', 'First Name', 'Last Name',
  'Gender', 'Date of Birth', 'Category', 'Religion', 'Mobile Number',
  'Email', 'Admission Date', 'Student Photo', 'Blood Group', 'House',
  'Height', 'Weight', 'As on Date', 'Parent Name', 'Father Name'
];

const teacherFieldsList = ['Email', 'Phone', 'Address', 'Qualification'];

export default function StudentSettingsPage() {
  const [studentFields, setStudentFields] = useState(
    admissionFields.map(f => ({ name: f, show: true, studentEdit: false, parentEdit: false, required: false }))
  );
  
  const [teacherFields, setTeacherFields] = useState(
    teacherFieldsList.map(f => ({ name: f, view: false }))
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
      if (res?.success && res.data) {
        if (Array.isArray(res.data.studentFieldSettings) && res.data.studentFieldSettings.length > 0) {
          setStudentFields(res.data.studentFieldSettings);
        }
        if (Array.isArray(res.data.teacherFieldSettings) && res.data.teacherFieldSettings.length > 0) {
          setTeacherFields(res.data.teacherFieldSettings);
        }
      }
    } catch (e) {
      console.error('Failed to load student settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      const res = await api.put('/setting', {
        studentFieldSettings: studentFields,
        teacherFieldSettings: teacherFields
      });
      if (res?.success) {
        setSuccessMsg('Student Settings saved and applied successfully!');
        setTimeout(() => setSuccessMsg(''), 3500);
      } else {
        alert(res?.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving student settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleStudentField = (index, key) => {
    const newFields = [...studentFields];
    newFields[index][key] = !newFields[index][key];
    setStudentFields(newFields);
  };

  const toggleTeacherField = (index, key) => {
    const newFields = [...teacherFields];
    newFields[index][key] = !newFields[index][key];
    setTeacherFields(newFields);
  };

  const renderToggle = (checked, onChange) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
        checked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-zinc-300 hover:bg-zinc-400'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        } mt-0.5`}
      />
    </button>
  );

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
            <span>Settings</span>
            <ChevronRight className="mx-2 h-3.5 w-3.5" />
            <span className="text-zinc-950 font-bold">Student Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950">Student Settings & Permissions</h1>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold flex items-center gap-2 shadow-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
        </Button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs mb-6">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Student Admission Field Controls</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Control which fields appear on admission forms and whether students/parents can edit them.</p>
          </div>
          <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
            {studentFields.length} Fields Configured
          </span>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading settings...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {studentFields.map((field, index) => (
                <div key={field.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-sm font-bold text-zinc-950 w-1/3 truncate" title={field.name}>{field.name}</span>
                  <div className="flex gap-4 w-2/3 justify-end">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-700 font-bold tracking-wider">SHOW</span>
                      {renderToggle(field.show, () => toggleStudentField(index, 'show'))}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-700 font-bold tracking-wider text-center">STUDENT<br/>EDIT</span>
                      {renderToggle(field.studentEdit, () => toggleStudentField(index, 'studentEdit'))}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-700 font-bold tracking-wider text-center">PARENT<br/>EDIT</span>
                      {renderToggle(field.parentEdit, () => toggleStudentField(index, 'parentEdit'))}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-zinc-700 font-bold tracking-wider text-center">REQUIRED</span>
                      {renderToggle(field.required, () => toggleStudentField(index, 'required'))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs mb-8">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-sm font-bold text-zinc-950">Teacher Information View Permissions</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Control which teacher details are visible to students and parents on portals.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {teacherFields.map((field, index) => (
              <div key={field.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="text-sm font-bold text-zinc-950">{field.name}</span>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-zinc-700 font-bold tracking-wider">VIEW</span>
                    {renderToggle(field.view, () => toggleTeacherField(index, 'view'))}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
