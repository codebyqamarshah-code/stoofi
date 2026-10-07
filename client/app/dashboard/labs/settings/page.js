'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  ChevronRight,
  Settings,
  Save,
  RotateCcw,
  Sliders,
  Clock,
  Boxes,
  ArrowLeftRight,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LabSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [settings, setSettings] = useState({
    // General & Timetable
    defaultOpeningTime: '08:00 AM',
    defaultClosingTime: '05:00 PM',
    defaultSlotDuration: '120', // in minutes
    allowOverlappingBookings: false,
    academicSession: 'Fall 2026',
    autoApproveFacultyBookings: true,

    // Inventory & Assets
    assetPrefix: 'STF-LAB-',
    autoGenerateAssetCode: true,
    reorderThresholdPercent: '20',
    depreciationRateAnnual: '15',
    requireSerialNumberForAssets: true,

    // Borrowing & Issue
    maxStudentBorrowItems: '3',
    studentBorrowDurationDays: '3',
    facultyBorrowDurationDays: '14',
    dailyLateFinePKR: '50',
    requireSafetyConsentForEquipment: true,

    // Safety & Maintenance
    preventiveMaintenanceDays: '90',
    mandatoryPpeEnforcement: true,
    emergencySosEmail: 'safety.officer@stoofi-edu.com',
    emergencySosPhone: '+92 (051) 900-1199',
    autoNotifyLowChemicals: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Reset all lab module settings to system default configuration?')) {
      setSettings({
        defaultOpeningTime: '08:00 AM',
        defaultClosingTime: '05:00 PM',
        defaultSlotDuration: '120',
        allowOverlappingBookings: false,
        academicSession: 'Fall 2026',
        autoApproveFacultyBookings: true,
        assetPrefix: 'STF-LAB-',
        autoGenerateAssetCode: true,
        reorderThresholdPercent: '20',
        depreciationRateAnnual: '15',
        requireSerialNumberForAssets: true,
        maxStudentBorrowItems: '3',
        studentBorrowDurationDays: '3',
        facultyBorrowDurationDays: '14',
        dailyLateFinePKR: '50',
        requireSafetyConsentForEquipment: true,
        preventiveMaintenanceDays: '90',
        mandatoryPpeEnforcement: true,
        emergencySosEmail: 'safety.officer@stoofi-edu.com',
        emergencySosPhone: '+92 (051) 900-1199',
        autoNotifyLowChemicals: true
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-zinc-600">
          <Link href="/dashboard" className="hover:text-emerald-700 font-medium">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <Link href="/dashboard/labs" className="hover:text-emerald-700 font-medium">Labs</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Labs Settings</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Configuration & Policies</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Laboratories Module Settings</h1>
          <p className="text-emerald-200/90 text-sm mt-1">
            Configure default operating hours, inventory tagging rules, equipment circulation fines, and safety policies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-2 text-xs font-semibold"
          >
            <Save className="w-4 h-4" /> Save Settings
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Lab module configuration settings saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          General & Timetable
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Asset & Inventory Rules
        </button>
        <button
          onClick={() => setActiveTab('borrowing')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'borrowing'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          Circulation & Late Fines
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'safety'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Safety & Maintenance
        </button>
      </div>

      {/* Settings Form Body */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              General Operating & Timetable Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-zinc-700">Default Lab Opening Time</Label>
                <Input
                  value={settings.defaultOpeningTime}
                  onChange={(e) => setSettings({ ...settings, defaultOpeningTime: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Default Lab Closing Time</Label>
                <Input
                  value={settings.defaultClosingTime}
                  onChange={(e) => setSettings({ ...settings, defaultClosingTime: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Default Session Slot Duration (Minutes)</Label>
                <Input
                  type="number"
                  value={settings.defaultSlotDuration}
                  onChange={(e) => setSettings({ ...settings, defaultSlotDuration: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Active Academic Session / Term</Label>
                <Input
                  value={settings.academicSession}
                  onChange={(e) => setSettings({ ...settings, academicSession: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowOverlappingBookings}
                  onChange={(e) => setSettings({ ...settings, allowOverlappingBookings: e.target.checked })}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-zinc-800">
                  Allow Concurrent Multi-Group Bookings in large capacity labs
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoApproveFacultyBookings}
                  onChange={(e) => setSettings({ ...settings, autoApproveFacultyBookings: e.target.checked })}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-zinc-800">
                  Auto-Approve Timetable Sessions requested by permanent Faculty members
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Inventory & Assets */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-600" />
              Asset Tagging & Inventory Control
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-zinc-700">Institutional Asset ID Prefix</Label>
                <Input
                  value={settings.assetPrefix}
                  onChange={(e) => setSettings({ ...settings, assetPrefix: e.target.value })}
                  className="text-xs mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Low Stock Reorder Alert Threshold (%)</Label>
                <Input
                  type="number"
                  value={settings.reorderThresholdPercent}
                  onChange={(e) => setSettings({ ...settings, reorderThresholdPercent: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Annual Depreciation Rate (%)</Label>
                <Input
                  type="number"
                  value={settings.depreciationRateAnnual}
                  onChange={(e) => setSettings({ ...settings, depreciationRateAnnual: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoGenerateAssetCode}
                  onChange={(e) => setSettings({ ...settings, autoGenerateAssetCode: e.target.checked })}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-zinc-800">
                  Automatically generate unique barcodes / asset tags on saving new equipment
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireSerialNumberForAssets}
                  onChange={(e) => setSettings({ ...settings, requireSerialNumberForAssets: e.target.checked })}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-zinc-800">
                  Require Manufacturer Serial Number for high-value electronic & optical assets
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Borrowing & Issue */}
        {activeTab === 'borrowing' && (
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
              Equipment Circulation & Late Fines Policy
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-zinc-700">Max Concurrent Items per Student</Label>
                <Input
                  type="number"
                  value={settings.maxStudentBorrowItems}
                  onChange={(e) => setSettings({ ...settings, maxStudentBorrowItems: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Student Max Borrow Duration (Days)</Label>
                <Input
                  type="number"
                  value={settings.studentBorrowDurationDays}
                  onChange={(e) => setSettings({ ...settings, studentBorrowDurationDays: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Faculty Borrow Duration (Days)</Label>
                <Input
                  type="number"
                  value={settings.facultyBorrowDurationDays}
                  onChange={(e) => setSettings({ ...settings, facultyBorrowDurationDays: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Daily Overdue Late Fine (PKR/Day)</Label>
                <Input
                  type="number"
                  value={settings.dailyLateFinePKR}
                  onChange={(e) => setSettings({ ...settings, dailyLateFinePKR: e.target.value })}
                  className="text-xs mt-1 font-semibold text-amber-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireSafetyConsentForEquipment}
                  onChange={(e) => setSettings({ ...settings, requireSafetyConsentForEquipment: e.target.checked })}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-zinc-800">
                  Require Signed Digital Safety & Liability Undertaking before issuing power tools or lasers
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 4: Safety & Maintenance */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Safety Protocols & Calibration Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold text-zinc-700">Preventive Maintenance Interval (Days)</Label>
                <Input
                  type="number"
                  value={settings.preventiveMaintenanceDays}
                  onChange={(e) => setSettings({ ...settings, preventiveMaintenanceDays: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Emergency Incident Notification Email</Label>
                <Input
                  type="email"
                  value={settings.emergencySosEmail}
                  onChange={(e) => setSettings({ ...settings, emergencySosEmail: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Emergency SOS Hotline</Label>
                <Input
                  value={settings.emergencySosPhone}
                  onChange={(e) => setSettings({ ...settings, emergencySosPhone: e.target.value })}
                  className="text-xs mt-1 font-bold text-red-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.mandatoryPpeEnforcement}
                  onChange={(e) => setSettings({ ...settings, mandatoryPpeEnforcement: e.target.checked })}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-zinc-800">
                  Mandatory PPE (Lab Coat & Goggles) verification prompt prior to practical attendance logging
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoNotifyLowChemicals}
                  onChange={(e) => setSettings({ ...settings, autoNotifyLowChemicals: e.target.checked })}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-zinc-800">
                  Send automated procurement alert when hazardous reagents reach critical minimum reserve
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6"
          >
            Save Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
