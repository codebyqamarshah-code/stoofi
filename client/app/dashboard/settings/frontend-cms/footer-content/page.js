'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCmsSection, mutateCmsSection } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Copyright,
  CheckCircle2,
  ExternalLink,
  Save
} from 'lucide-react';

const DEFAULT_FOOTER = {
  about:
    'Stoofi Pro is a comprehensive multi-purpose educational institution management system providing modern student and faculty automation.',
  copyright: 'Copyright © 2026 All rights reserved | Stoofi Education ERP',
  address: 'Sector F-7/2, Islamabad, Pakistan',
  phone: '+92 51 111 222 333',
  email: 'support@stoofi.edu.pk',
  showNewsletter: true
};

export default function FooterContentPage() {
  const [form, setForm] = useState(DEFAULT_FOOTER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCmsSection('footerContent', DEFAULT_FOOTER);
      if (data && typeof data === 'object') {
        setForm({ ...DEFAULT_FOOTER, ...data });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await mutateCmsSection('footerContent', 'saveObject', { data: form });
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">Footer Content</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950">Website Footer Content</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Configure campus address, support contacts, about blurb, and copyright text on the public website.
          </p>
        </div>
        <Link
          href="/#contact"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View Live Footer
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Website Footer Description & Address Information
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-800 font-bold">SHOW NEWSLETTER:</span>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, showNewsletter: !p.showNewsletter }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                form.showNewsletter ? 'bg-[#009966]' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  form.showNewsletter ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-zinc-500 text-sm">Loading footer settings...</div>
        ) : (
          <>
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">
                ABOUT FOOTER DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={form.about}
                onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966] resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">
                COPYRIGHT TEXT
              </label>
              <div className="relative">
                <Copyright className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={form.copyright}
                  onChange={(e) => setForm((p) => ({ ...p, copyright: e.target.value }))}
                  className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#009966]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">
                  CAMPUS ADDRESS
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#009966]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">
                  SUPPORT PHONE
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#009966]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">
                  SUPPORT EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#009966]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="bg-[#009966] hover:bg-[#008055] disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" /> {saving ? 'SAVING...' : 'UPDATE FOOTER'}
              </button>
              {saved && (
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Footer content saved & synced to Home Page!
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
