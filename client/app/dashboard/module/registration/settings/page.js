'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Save, 
  Settings, 
  UserPlus, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  DollarSign, 
  ShieldCheck,
  ToggleLeft
} from 'lucide-react';

export default function RegistrationSettingsPage() {
  const [settings, setSettings] = useState({
    academicYear: '2026-2027',
    startDate: '2026-08-01',
    endDate: '2026-10-31',
    feeAmount: '1500',
    currency: 'PKR',
    autoApprove: false,
    requirePaymentProof: true,
    isOpen: true,
    terms: 'Candidates must provide genuine transcripts and verified B-Form / CNIC copies. Incomplete registrations will be subject to cancellation.',
    documents: {
      birthCert: true,
      bForm: true,
      previousReport: true,
      characterCert: false,
      photographs: true
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Online Registration Settings
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Configure admission cycles, application fees, required documentation, and rules.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/registration" className="hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">
            Registration
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-emerald-400 font-medium">Settings</span>
        </div>
      </div>

      {/* Success Alert */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-zinc-100 dark:bg-emerald-950/50 border border-zinc-300 dark:border-emerald-800 text-zinc-900 dark:text-emerald-300 flex items-center gap-3 text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-zinc-800 flex-shrink-0" />
          <span>Online admission portal settings have been successfully updated.</span>
        </div>
      )}

      {/* Settings Form Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Admission Session & Schedule */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <Calendar className="h-5 w-5 text-zinc-800 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Admission Cycle & Schedule
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Academic Session <span className="text-rose-500">*</span>
                </label>
                <select
                  value={settings.academicYear}
                  onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                >
                  <option value="2026-2027">2026 - 2027</option>
                  <option value="2025-2026">2025 - 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Registration Opening Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={settings.startDate}
                  onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Registration Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={settings.endDate}
                  onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Fee & Approval Policy */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <DollarSign className="h-5 w-5 text-zinc-800 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Registration Processing Fee
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Application Fee Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">PKR</span>
                  <input
                    type="number"
                    min="0"
                    value={settings.feeAmount}
                    onChange={(e) => setSettings({ ...settings, feeAmount: e.target.value })}
                    className="w-full pl-14 pr-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Portal Status
                </label>
                <select
                  value={settings.isOpen ? 'true' : 'false'}
                  onChange={(e) => setSettings({ ...settings, isOpen: e.target.value === 'true' })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                >
                  <option value="true">Open & Accepting Applications</option>
                  <option value="false">Closed (Submissions Suspended)</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.autoApprove}
                  onChange={(e) => setSettings({ ...settings, autoApprove: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-600"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase">Auto-Approve Applicants</div>
                  <div className="text-[11px] text-zinc-500">Automatically mark submitted forms as approved.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.requirePaymentProof}
                  onChange={(e) => setSettings({ ...settings, requirePaymentProof: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-600"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase">Require Fee Receipt Upload</div>
                  <div className="text-[11px] text-zinc-500">Applicants must attach proof of fee payment.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Document Checklist & Terms */}
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-zinc-100 dark:border-zinc-800">
              <FileText className="h-5 w-5 text-zinc-800 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Mandatory Documentation & Policy Terms
              </h2>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Required Applicant Documents:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'birthCert', label: 'Birth Certificate' },
                  { key: 'bForm', label: 'NADRA B-Form / CNIC' },
                  { key: 'previousReport', label: 'Previous Report Card' },
                  { key: 'characterCert', label: 'Character Certificate' },
                  { key: 'photographs', label: 'Passport Size Photos (x4)' }
                ].map((doc) => (
                  <label key={doc.key} className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.documents[doc.key]}
                      onChange={(e) => setSettings({
                        ...settings,
                        documents: { ...settings.documents, [doc.key]: e.target.checked }
                      })}
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-800 focus:ring-zinc-600"
                    />
                    <span>{doc.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Terms & Conditions / Guidelines
                </label>
                <textarea
                  rows={3}
                  value={settings.terms}
                  onChange={(e) => setSettings({ ...settings, terms: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" />
              Save Registration Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
