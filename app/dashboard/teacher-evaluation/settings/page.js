'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TeacherEvaluationSettingsPage() {
  const [formData, setFormData] = useState({ criteria: 'Punctuality, Subject Knowledge, Communication', maxRating: 5, isActive: true });
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Evaluation Settings</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard/teacher-evaluation/approved-report" className="hover:text-emerald-400 transition-colors">Teacher Evaluation</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Settings</span>
        </div>
      </div>
      
      <div className="max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">General Settings</h2>
        </div>
        <form className="p-6 space-y-6" onSubmit={handleSave}>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Evaluation Criteria (Comma separated)</Label>
            <textarea value={formData.criteria} onChange={e => setFormData({...formData, criteria: e.target.value})} className="flex min-h-[100px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" required />
            <p className="text-xs text-zinc-500 mt-1">These criteria will be displayed to evaluators.</p>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Max Rating Score</Label>
            <Input type="number" value={formData.maxRating} onChange={e => setFormData({...formData, maxRating: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500 max-w-xs" required />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
            <Label className="text-sm font-medium text-white cursor-pointer">Enable Teacher Evaluation Module</Label>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <Button disabled={saving} type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8">
              {saving ? 'SAVING...' : 'SAVE SETTINGS'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
