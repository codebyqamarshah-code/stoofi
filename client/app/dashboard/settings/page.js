'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings, Sliders, Receipt, Award, Mail, Shield, Globe, 
  Search, ArrowRight, CheckCircle2, Calendar, Wallet, Users, 
  User, Database, Sparkles, Building, Lock, Bell, MessageSquare, 
  PhoneCall, Paintbrush, FileSpreadsheet, LayoutTemplate, Layers,
  ChevronRight
} from 'lucide-react';
import api from '@/services/api';

export default function SettingsHubPage() {
  const [search, setSearch] = useState('');
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: 'Pak Royal College Sharaqpur',
    academicYear: '2026',
    currency: 'PKR',
    currencySymbol: 'Rs.',
  });

  useEffect(() => {
    async function loadInfo() {
      try {
        const res = await api.get('/setting');
        if (res?.success && res.data) {
          setSchoolInfo({
            schoolName: res.data.schoolName || 'Pak Royal College Sharaqpur',
            academicYear: res.data.academicYear || '2026',
            currency: res.data.currency || 'PKR',
            currencySymbol: res.data.currencySymbol || 'Rs.',
          });
        }
      } catch (_) {}
    }
    loadInfo();
  }, []);

  const CATEGORIES = [
    {
      id: 'general',
      title: 'General & Campus Settings',
      badge: 'Institution Core',
      icon: Building,
      items: [
        { name: 'General Settings', desc: 'School name, campus address, logo, header and footer slogans.', href: '/dashboard/settings/general/general-settings' },
        { name: 'Academic Year', desc: 'Configure educational sessions, active term, and start/end dates.', href: '/dashboard/settings/general/academic-year' },
        { name: 'Holiday Calendar', desc: 'Schedule official off-days, public holidays, and vacations.', href: '/dashboard/settings/general/holiday' },
        { name: 'Weekend Setup', desc: 'Designate working days versus Saturday/Sunday off-days.', href: '/dashboard/settings/general/weekend' },
        { name: 'Manage Currency', desc: 'Currency symbol (Rs. / PKR), formatting, and live exchange rates.', href: '/dashboard/settings/general/manage-currency' },
        { name: 'Base Setup', desc: 'Genders, religions, blood groups, castes, and categories.', href: '/dashboard/settings/general/base-setup' },
        { name: 'Notification Settings', desc: 'Push notifications, sound alerts, and channel preferences.', href: '/dashboard/settings/general/notification-setting' },
      ]
    },
    {
      id: 'custom-fields',
      title: 'Custom Fields & Permissions',
      badge: 'Dynamic Schema',
      icon: Sliders,
      items: [
        { name: 'Student Registration Fields', desc: 'Add custom inputs, board roll numbers, and hostel tags.', href: '/dashboard/settings/custom-field/student-registration' },
        { name: 'Staff Registration Fields', desc: 'Biometric user IDs, PEC numbers, and payroll accounts.', href: '/dashboard/settings/custom-field/staff-registration' },
        { name: 'Student Field Permissions', desc: 'Control which admission fields are visible, required, or student-editable.', href: '/dashboard/settings/general/student-settings' },
        { name: 'Staff Field Permissions', desc: 'Control staff profile editing privileges and mandatory fields.', href: '/dashboard/settings/general/staff-settings' },
      ]
    },
    {
      id: 'fees',
      title: 'Fees & Platform Billing',
      badge: 'Finance & ERP',
      icon: Receipt,
      items: [
        { name: 'Fees Invoice Settings', desc: 'Automated invoice numbering pattern, prefixes, and digit padding.', href: '/dashboard/settings/fees/fees-invoice-settings' },
        { name: 'Payment Gateways & Accounts', desc: 'Bank accounts, JazzCash, EasyPaisa, Safepay, and cash counter.', href: '/dashboard/settings/general/payment-settings' },
        { name: 'Subscription & Billing', desc: 'Campus license renewal, cloud storage quota, and payment history.', href: '/dashboard/settings/billing' },
      ]
    },
    {
      id: 'exams',
      title: 'Examination & Assessments',
      badge: 'Academics',
      icon: Award,
      items: [
        { name: 'Setup Exam Rules', desc: 'Passing percentages, merit ranking algorithms, and photo inclusion.', href: '/dashboard/settings/exam/setup-exam-rule' },
        { name: 'Format Settings', desc: 'Report card styling, borders, watermark, and remarks templates.', href: '/dashboard/settings/exam/format-settings' },
        { name: 'Position & Merit System', desc: 'Class and section ranking, GPA calculations, and tiebreakers.', href: '/dashboard/settings/exam/position' },
        { name: 'All Exam Combined Position', desc: 'Multi-term cumulative assessment position generator.', href: '/dashboard/settings/exam/all-exam-position' },
        { name: 'Digital Signatures', desc: 'Principal, Controller of Exams, and Class Incharge official signatures.', href: '/dashboard/settings/exam/exam-signature-settings' },
        { name: 'Admit Card Settings', desc: 'Roll number slip layouts, exam center directions, and QR verification.', href: '/dashboard/settings/exam/admit-card-setting' },
        { name: 'Seat Plan Configuration', desc: 'Examination hall desk allocations, roll spacing, and invigilator sheets.', href: '/dashboard/settings/exam/seat-plan-setting' },
      ]
    },
    {
      id: 'communication',
      title: 'Communication & Messaging',
      badge: 'Outreach',
      icon: Mail,
      items: [
        { name: 'Email Settings (SMTP)', desc: 'Configure SMTP credentials, host, port, TLS/SSL, and test email.', href: '/dashboard/settings/general/email-settings' },
        { name: 'SMS Gateways', desc: 'Twilio, MSG91, Pakistan Telco API, brand sender ID, and test SMS.', href: '/dashboard/settings/general/sms-settings' },
        { name: 'Live Chat Settings', desc: 'Configure internal chat, message archiving, and online status.', href: '/dashboard/settings/general/chat-settings' },
        { name: 'Tawk.to Integration', desc: 'Embed live visitor support widget on student and parent portals.', href: '/dashboard/settings/general/tawk-to-chat' },
        { name: 'Messenger Chat', desc: 'Connect Facebook Messenger business page for instant parent inquiries.', href: '/dashboard/settings/general/messenger-chat' },
      ]
    },
    {
      id: 'security-system',
      title: 'Security, Backups & System',
      badge: 'Admin & Maintenance',
      icon: Shield,
      items: [
        { name: 'Two-Factor Authentication', desc: 'Enforce 2FA via email or SMS for Super Admins and Staff.', href: '/dashboard/settings/general/two-factor-setting' },
        { name: 'Database Backup & Restore', desc: 'Export full database snapshot, backup download, and integrity check.', href: '/dashboard/settings/general/backup' },
        { name: 'API Permissions', desc: 'Manage access keys, token lifetimes, and mobile app endpoint permissions.', href: '/dashboard/settings/general/api-permission' },
        { name: 'System Utilities', desc: 'Cache purge, session cleanup, database optimization, and error logs.', href: '/dashboard/settings/general/utilities' },
        { name: 'Language & Localization', desc: 'Manage active languages, translations, and regional locale.', href: '/dashboard/settings/general/language-settings' },
        { name: 'About & System Updates', desc: 'View software version, release notes, license status, and system health.', href: '/dashboard/settings/general/about-update' },
      ]
    },
    {
      id: 'cms',
      title: 'Frontend CMS & Public Portal',
      badge: 'Public Website',
      icon: Globe,
      items: [
        { name: 'Manage Theme & Colors', desc: 'Branding primary colors, accent colors, and dark mode presets.', href: '/dashboard/settings/frontend-cms/manage-theme' },
        { name: 'Home Slider Banners', desc: 'Upload hero banners, headlines, and calls-to-action for the website.', href: '/dashboard/settings/frontend-cms/home-slider' },
        { name: 'Photo Gallery', desc: 'Manage campus event photo albums, sports gala, and ceremony pictures.', href: '/dashboard/settings/frontend-cms/photo-gallery' },
        { name: 'Video Gallery', desc: 'Curate YouTube and Vimeo campus highlight reels and seminars.', href: '/dashboard/settings/frontend-cms/video-gallery' },
        { name: 'Expert Faculty / Teachers', desc: 'Showcase distinguished professors and heads of departments.', href: '/dashboard/settings/frontend-cms/expert-teacher' },
        { name: 'Form Downloads', desc: 'Upload downloadable admission prospectus, syllabus, and challan forms.', href: '/dashboard/settings/frontend-cms/form-download' },
        { name: 'News & Announcements', desc: 'Publish public campus news, press releases, and circulars.', href: '/dashboard/settings/frontend-cms/news-list' },
      ]
    }
  ];

  const filteredCategories = CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase()) ||
      cat.title.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const totalSettingsCount = CATEGORIES.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950 space-y-6">
      {/* Top Breadcrumb & Live System Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center text-xs text-zinc-500 mb-2">
            <Link href="/dashboard" className="hover:text-zinc-800 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-950 font-bold">Settings Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Settings className="h-6 w-6 text-zinc-900" />
            <span>Settings Command Center</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete administration over institutional rules, examination policies, online fee gateways, custom fields, and public portals.
          </p>
        </div>

        {/* Live System State Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Live DB: Atlas</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800">
            <Calendar className="h-3.5 w-3.5 text-zinc-600" />
            <span>Session: {schoolInfo.academicYear}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800">
            <Wallet className="h-3.5 w-3.5 text-zinc-600" />
            <span>{schoolInfo.currency} ({schoolInfo.currencySymbol})</span>
          </div>
        </div>
      </div>

      {/* Global Quick Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search across all ${totalSettingsCount} system settings, modules, and rules (e.g. SMTP, fees prefix, weekend, exam rule, custom fields)...`}
          className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all shadow-xs"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Settings Categories List */}
      <div className="space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <p className="text-sm font-bold text-zinc-700">No settings found matching &quot;{search}&quot;</p>
            <p className="text-xs text-zinc-400 mt-1">Try searching for keywords like &quot;fees&quot;, &quot;exam&quot;, &quot;email&quot;, or &quot;staff&quot;</p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const CatIcon = category.icon;
            return (
              <div key={category.id} className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-zinc-50/70 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-800 shadow-2xs">
                      <CatIcon className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">{category.title}</h2>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-500 bg-white border border-zinc-200 px-2.5 py-0.5 rounded-full">
                    {category.items.length} {category.items.length === 1 ? 'Setting' : 'Settings'}
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-white hover:border-zinc-900 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className="text-sm font-bold text-zinc-950 group-hover:text-emerald-700 transition-colors">
                            {item.name}
                          </h3>
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-zinc-200/60 flex items-center justify-between text-[11px] font-semibold text-zinc-400 group-hover:text-emerald-700">
                        <span>Configure</span>
                        <span>&rarr;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
