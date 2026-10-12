'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Save, CheckCircle2, Settings as SettingsIcon, 
  Bell, Shield, Eye, FileText, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import behaviourService from '@/services/behaviourService';

export default function BehaviourSettingsPage() {
  const [settings, setSettings] = useState({
    commentOption: 'Optional',
    viewOption: 'Student & Parent',
    viewIncidentInStudentPortal: true,
    viewIncidentInParentPortal: true,
    viewIncidentInTeacherPortal: true,
    notifyParentsOnNegative: true,
    warningLetterThreshold: -15,
    awardCertificateThreshold: 30
  });

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await behaviourService.getSettings();
    setSettings(s);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await behaviourService.saveSettings(settings);
      setToastMessage('Behaviour settings saved successfully!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-950 text-white px-4 py-2.5 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span style={{ color: '#ffffff' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 tracking-tight">Behaviour Settings</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Configure portal visibility, notification triggers & discipline scoring rules</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-400">Behaviour</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Settings</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Portal Visibility Settings */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-950">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Portal Visibility & Permissions</h2>
              <p className="text-[11px] text-zinc-500">Control who can view assigned incident records and conduct scores</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-zinc-950">Student Portal Visibility</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Allow students to view their points in their dashboard</p>
              </div>
              <input
                type="checkbox"
                checked={settings.viewIncidentInStudentPortal}
                onChange={(e) => setSettings({ ...settings, viewIncidentInStudentPortal: e.target.checked })}
                className="w-4 h-4 rounded text-zinc-950 focus:ring-zinc-950 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-zinc-950">Parent Portal Visibility</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Show behavior cards and conduct history to parents</p>
              </div>
              <input
                type="checkbox"
                checked={settings.viewIncidentInParentPortal}
                onChange={(e) => setSettings({ ...settings, viewIncidentInParentPortal: e.target.checked })}
                className="w-4 h-4 rounded text-zinc-950 focus:ring-zinc-950 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-zinc-950">Teacher Portal Assignment</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Allow subject & class teachers to assign incidents</p>
              </div>
              <input
                type="checkbox"
                checked={settings.viewIncidentInTeacherPortal}
                onChange={(e) => setSettings({ ...settings, viewIncidentInTeacherPortal: e.target.checked })}
                className="w-4 h-4 rounded text-zinc-950 focus:ring-zinc-950 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div>
                <p className="font-bold text-zinc-950">Parent Alerts on Negative Infractions</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Notify parents automatically when negative points occur</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyParentsOnNegative}
                onChange={(e) => setSettings({ ...settings, notifyParentsOnNegative: e.target.checked })}
                className="w-4 h-4 rounded text-zinc-950 focus:ring-zinc-950 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Automated Disciplinary Thresholds */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-950">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Discipline Triggers & Award Thresholds</h2>
              <p className="text-[11px] text-zinc-500">Define point scores that trigger warning letters or certificate awards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold text-zinc-800">
                Warning Letter Trigger (Negative Points)
              </Label>
              <p className="text-[11px] text-zinc-500">When student total reaches this score, a formal warning is flagged.</p>
              <Input 
                type="number"
                value={settings.warningLetterThreshold}
                onChange={(e) => setSettings({ ...settings, warningLetterThreshold: Number(e.target.value) })}
                className="bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl font-bold text-rose-600"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-zinc-800">
                Character Certificate Trigger (Positive Points)
              </Label>
              <p className="text-[11px] text-zinc-500">When student accumulates this score, they qualify for conduct awards.</p>
              <Input 
                type="number"
                value={settings.awardCertificateThreshold}
                onChange={(e) => setSettings({ ...settings, awardCertificateThreshold: Number(e.target.value) })}
                className="bg-zinc-50 border-zinc-200 text-xs h-9 rounded-xl font-bold text-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-zinc-800">Comment / Remarks Requirement</Label>
              <select
                value={settings.commentOption}
                onChange={(e) => setSettings({ ...settings, commentOption: e.target.value })}
                className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
              >
                <option value="Optional">Optional (Comments not mandatory)</option>
                <option value="Mandatory">Mandatory (Must provide reason)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-zinc-800">Default Visibility Scope</Label>
              <select
                value={settings.viewOption}
                onChange={(e) => setSettings({ ...settings, viewOption: e.target.value })}
                className="w-full h-9 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
              >
                <option value="Student & Parent">Student & Parent</option>
                <option value="Internal Administration Only">Internal Administration Only</option>
                <option value="School Staff & Teachers">School Staff & Teachers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span style={{ color: '#ffffff' }}>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
