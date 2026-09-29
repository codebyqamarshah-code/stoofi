'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Building, Save, CheckCircle2, Globe, Phone, Mail, MapPin, DollarSign, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolCode: '',
    phone: '',
    email: '',
    address: '',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    academicYear: '2026',
    sessionStartMonth: 'January',
    tagline: '',
    footerText: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/setting');
        if (res.success && res.data) {
          setFormData({
            schoolName: res.data.schoolName || '',
            schoolCode: res.data.schoolCode || '',
            phone: res.data.phone || '',
            email: res.data.email || '',
            address: res.data.address || '',
            currency: res.data.currency || 'PKR',
            currencySymbol: res.data.currencySymbol || 'Rs.',
            academicYear: res.data.academicYear || '2026',
            sessionStartMonth: res.data.sessionStartMonth || 'January',
            tagline: res.data.tagline || '',
            footerText: res.data.footerText || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      const res = await api.put('/setting', formData);
      if (res.success) {
        setSuccessMsg('School Settings updated successfully! All invoices, headers, and reports will now reflect these details.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(res.message || 'Failed to update settings');
      }
    } catch (err) {
      alert(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building className="h-6 w-6 text-indigo-500" />
            General School Settings
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Configure your institution branding, identity, contact information, and currency standards.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Settings</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">General</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School Identity Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">School Identity & Branding</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">School / College Name *</Label>
              <Input
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="e.g. Stoofi Public School & College"
                required
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">School Code / Reg No</Label>
              <Input
                name="schoolCode"
                value={formData.schoolCode}
                onChange={handleChange}
                placeholder="e.g. SCH-2026-LHR"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Tagline / Motto</Label>
              <Input
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. Excellence in Education & Character Building"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
            <Phone className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Contact & Location Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Official Phone Number *</Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +92 300 1234567"
                required
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Official Email Address *</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. info@school.com"
                required
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Campus / Postal Address *</Label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Full campus street address, city, and country"
                required
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Academic & Currency Settings */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Academic Session & Currency Configuration</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Current Academic Year</Label>
              <Input
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                placeholder="2026"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Session Start Month</Label>
              <select
                name="sessionStartMonth"
                value={formData.sessionStartMonth}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Currency Code</Label>
              <Input
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                placeholder="PKR, USD, SAR, etc."
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Currency Symbol</Label>
              <Input
                name="currencySymbol"
                value={formData.currencySymbol}
                onChange={handleChange}
                placeholder="Rs., $, AED, etc."
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-4">
              <Label className="text-xs font-semibold text-zinc-400 uppercase">Portal Footer Copyright Notice</Label>
              <Input
                name="footerText"
                value={formData.footerText}
                onChange={handleChange}
                placeholder="e.g. © 2026 Stoofi ERP. All Rights Reserved."
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-10 shadow-md"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'SAVING SETTINGS...' : 'SAVE ALL SETTINGS'}
          </Button>
        </div>
      </form>
    </div>
  );
}
