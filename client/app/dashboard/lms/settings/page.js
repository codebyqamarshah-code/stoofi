'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, Sliders, DollarSign, MessageSquare, ShoppingCart, Clock, Server, Settings2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const ALL_HOSTS = ['Self', 'Youtube', 'URL', 'Vimeo', 'Iframe', 'Image', 'PDF', 'Word', 'Excel', 'PowerPoint', 'Text', 'Zip'];

const DEFAULT_SETTINGS = {
  adminCommission: '15',
  teacherCommission: '85',
  showReviewOption: 'Enable',
  showInstructorReview: 'Enable',
  showQaOption: 'Enable',
  lmsCheckout: 'Enable',
  payLater: 'Enable',
  payLaterDueDay: '10',
  payLaterMessage: 'Course fee will be added to your monthly school challan invoice.',
  hosts: ['Self', 'Youtube', 'URL', 'Vimeo', 'PDF', 'Word'],
  showInstructorEnrolled: 'Enable',
  autoApproveCourse: 'Disable',
  showInstructorCourses: 'Enable',
  lessonCompleteManually: 'Disable',
  videoSeekBar: 'Enable',
  youtubeDefaultPlayer: 'No'
};

export default function LmsSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [notification, setNotification] = useState('');
  const [saving, setSaving] = useState(false);

  // Load from API on mount, fallback to localStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/setting');
        if (res?.success && res.data?.lms && Object.keys(res.data.lms).length > 0) {
          setSettings({ ...DEFAULT_SETTINGS, ...res.data.lms });
          return;
        }
      } catch (e) {}
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('stoofi_lms_settings');
        if (saved) setSettings(JSON.parse(saved));
      } catch (e) {}
    };
    loadSettings();
  }, []);

  const saveSettings = async (newSettings, sectionName) => {
    setSettings(newSettings);
    setSaving(true);
    try {
      await api.put('/setting', { lms: newSettings });
      // Also cache locally
      try { localStorage.setItem('stoofi_lms_settings', JSON.stringify(newSettings)); } catch (e) {}
      setNotification(`✓ ${sectionName} updated and saved successfully!`);
    } catch (e) {
      // Fallback to localStorage-only save
      try { localStorage.setItem('stoofi_lms_settings', JSON.stringify(newSettings)); } catch (err) {}
      setNotification(`✓ ${sectionName} saved locally!`);
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(''), 3500);
    }
  };

  const handleUpdateSection = (sectionName) => {
    saveSettings(settings, sectionName);
  };

  const toggleHost = (host) => {
    const current = settings.hosts || [];
    const updated = current.includes(host)
      ? current.filter(h => h !== host)
      : [...current, host];
    setSettings({ ...settings, hosts: updated });
  };

  const RadioGroup = ({ value, onChange }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange('Enable')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
          value === 'Enable' 
            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
        }`}
      >
        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${value === 'Enable' ? 'border-indigo-400 bg-indigo-500' : 'border-zinc-600'}`}>
          {value === 'Enable' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <span>Enable</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('Disable')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
          value === 'Disable' 
            ? 'bg-rose-600/20 border-rose-500 text-rose-400' 
            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
        }`}
      >
        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${value === 'Disable' ? 'border-rose-400 bg-rose-500' : 'border-zinc-600'}`}>
          {value === 'Disable' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <span>Disable</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sliders className="h-6 w-6 text-indigo-400" />
            LMS Platform & Course Configuration
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage commissions, video players, course permissions, reviews, and payment settings.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-500">Settings</span>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {notification}
        </div>
      )}

      {/* 1. Commission Settings */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Revenue & Commission Splits</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Admin / Platform Commission (%)</Label>
              <Input 
                type="number"
                value={settings.adminCommission}
                onChange={(e) => setSettings({ ...settings, adminCommission: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white font-mono text-sm focus-visible:ring-indigo-500" 
              />
              <p className="text-[11px] text-zinc-500">Percentage retained by school administration.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Instructor / Teacher Commission (%)</Label>
              <Input 
                type="number"
                value={settings.teacherCommission}
                onChange={(e) => setSettings({ ...settings, teacherCommission: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white font-mono text-sm focus-visible:ring-indigo-500" 
              />
              <p className="text-[11px] text-zinc-500">Percentage paid out to course teacher.</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleUpdateSection('Commission Settings')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> Save Commission Settings
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Review & QA Setting */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Student Reviews & Q&A Discussion</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-300 uppercase">Public Course Reviews</span>
              <RadioGroup 
                value={settings.showReviewOption} 
                onChange={(val) => setSettings({ ...settings, showReviewOption: val })} 
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-300 uppercase">Instructor Ratings</span>
              <RadioGroup 
                value={settings.showInstructorReview} 
                onChange={(val) => setSettings({ ...settings, showInstructorReview: val })} 
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 md:col-span-2">
              <span className="text-xs font-semibold text-zinc-300 uppercase">Live Q&A Forum Inside Lessons</span>
              <RadioGroup 
                value={settings.showQaOption} 
                onChange={(val) => setSettings({ ...settings, showQaOption: val })} 
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleUpdateSection('Review & QA Settings')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> Save Review Settings
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Checkout & Pay Later Settings */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Checkout & Pay Later Options</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-300 uppercase">Direct LMS Checkout</span>
              <RadioGroup 
                value={settings.lmsCheckout} 
                onChange={(val) => setSettings({ ...settings, lmsCheckout: val })} 
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-300 uppercase">Pay Later Option</span>
              <RadioGroup 
                value={settings.payLater} 
                onChange={(val) => setSettings({ ...settings, payLater: val })} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Pay Later Grace Period (Days)</Label>
              <Input 
                type="number"
                value={settings.payLaterDueDay}
                onChange={(e) => setSettings({ ...settings, payLaterDueDay: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white font-mono text-sm focus-visible:ring-indigo-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Pay Later Notice Message</Label>
              <Input 
                value={settings.payLaterMessage}
                onChange={(e) => setSettings({ ...settings, payLaterMessage: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white text-sm focus-visible:ring-indigo-500" 
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => handleUpdateSection('Checkout & Pay Later')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> Save Payment Settings
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Supported Video & Media Hosts */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
          <Server className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Supported Video & Media Hosts</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ALL_HOSTS.map((host) => {
              const isChecked = (settings.hosts || []).includes(host);
              return (
                <button
                  key={host}
                  type="button"
                  onClick={() => toggleHost(host)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                    isChecked
                      ? 'bg-purple-600/20 border-purple-500/60 text-purple-300 shadow-xs'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-600 bg-zinc-950'}`}>
                    {isChecked && <Check className="h-3 w-3" />}
                  </div>
                  <span>{host}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleUpdateSection('Media Host Settings')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> Save Media Hosts
            </Button>
          </div>
        </div>
      </div>

      {/* 5. General & Security Settings */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/30 flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">General LMS Rules & Player</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-300 uppercase">Auto Approve New Courses</span>
              <RadioGroup 
                value={settings.autoApproveCourse} 
                onChange={(val) => setSettings({ ...settings, autoApproveCourse: val })} 
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-300 uppercase">Enable Video Seekbar</span>
              <RadioGroup 
                value={settings.videoSeekBar} 
                onChange={(val) => setSettings({ ...settings, videoSeekBar: val })} 
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-300 uppercase">Show Enrolled Students Count</span>
              <RadioGroup 
                value={settings.showInstructorEnrolled} 
                onChange={(val) => setSettings({ ...settings, showInstructorEnrolled: val })} 
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-300 uppercase">Lesson Manual Completion</span>
              <RadioGroup 
                value={settings.lessonCompleteManually} 
                onChange={(val) => setSettings({ ...settings, lessonCompleteManually: val })} 
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => handleUpdateSection('General LMS Settings')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
              <Check className="h-4 w-4" /> Save General Rules
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
