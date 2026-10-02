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
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <Building className="h-6 w-6 text-zinc-900" />
            General School Settings
          </h1>
          <p className="text-sm text-zinc-600 mt-1">Configure your institution branding, identity, contact information, and currency standards.</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Settings</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-semibold">General</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School Identity Card */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <Globe className="h-4 w-4 text-zinc-900" />
            <h2 className="text-base font-bold text-zinc-950">School Identity & Branding</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">School / College Name *</Label>
              <Input
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="e.g. Stoofi Public School & College"
                required
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">School Code / Reg No</Label>
              <Input
                name="schoolCode"
                value={formData.schoolCode}
                onChange={handleChange}
                placeholder="e.g. SCH-2026-LHR"
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Tagline / Motto</Label>
              <Input
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. Excellence in Education & Character Building"
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <Phone className="h-4 w-4 text-zinc-900" />
            <h2 className="text-base font-bold text-zinc-950">Contact & Location Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Official Phone Number *</Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +92 300 1234567"
                required
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Official Email Address *</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. info@school.com"
                required
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Campus / Postal Address *</Label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="Full campus street address, city, and country"
                required
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Academic & Currency Settings */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-zinc-900" />
            <h2 className="text-base font-bold text-zinc-950">Academic Session & Currency Configuration</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Current Academic Year</Label>
              <Input
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                placeholder="2026"
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Session Start Month</Label>
              <select
                name="sessionStartMonth"
                value={formData.sessionStartMonth}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-400 font-medium"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Currency Code</Label>
              <Input
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                placeholder="PKR, USD, SAR, etc."
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Currency Symbol</Label>
              <Input
                name="currencySymbol"
                value={formData.currencySymbol}
                onChange={handleChange}
                placeholder="Rs., $, AED, etc."
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium"
              />
            </div>

            <div className="space-y-1.5 md:col-span-4">
              <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Portal Footer Copyright Notice</Label>
              <Input
                name="footerText"
                value={formData.footerText}
                onChange={handleChange}
                placeholder="e.g. © Stoofi ERP. All Rights Reserved."
                className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-zinc-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-8 h-10 shadow-xs"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'SAVING SETTINGS...' : 'SAVE ALL SETTINGS'}
          </Button>
        </div>
      </form>
    </div>
  );
}
