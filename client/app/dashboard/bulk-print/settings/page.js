'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Printer, Save, Check, Sliders, FileText, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function BulkPrintSettingsPage() {
  const [settings, setSettings] = useState({
    invoiceFormat: '3-Part Challan',
    pageSize: 'A4',
    orientation: 'Portrait',
    copiesCount: '3',
    headerTitle: 'Stoofi International Public School',
    subTitle: 'Empowering Future Leaders | Reg # EDU-PK-8921',
    footerNote: 'Payment due on or before the 10th of each month. Late surcharge applies thereafter.',
    authorizedSignatory: 'Accounts Officer / Bursar',
    showQrCode: true,
    showStudentPhoto: true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('stoofi_print_settings');
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('stoofi_print_settings', JSON.stringify(settings));
      await api.put('/setting', { bulkPrint: settings }).catch(() => null);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Sliders className="h-6 w-6 text-[#084A86]" />
            Bulk Print Settings
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Configure layout, headers, copies, and formats for fee invoices, cards, and slips</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Bulk Print</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Print Settings</span>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>Print configuration settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Layout & Format Card */}
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#084A86]" />
              <h2 className="text-base font-semibold text-zinc-950">Challan & Invoice Layout</h2>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Default Voucher Layout Format</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: '3-Part Challan', label: '3-Part Bank Challan', desc: 'School, Bank & Student Copy' },
                    { id: 'Single Slip', label: 'Single Receipt Slip', desc: 'Compact thermal or half-A4 slip' },
                    { id: 'Full Invoice', label: 'Detailed Tax Invoice', desc: 'Full-page breakdown with table' },
                  ].map(fmt => (
                    <div
                      key={fmt.id}
                      onClick={() => setSettings({ ...settings, invoiceFormat: fmt.id })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        settings.invoiceFormat === fmt.id
                          ? 'border-[#084A86] bg-blue-50/60 ring-2 ring-[#084A86]/20'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50'
                      }`}
                    >
                      <div className="font-bold text-sm text-zinc-950">{fmt.label}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{fmt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Paper Size</Label>
                  <select 
                    value={settings.pageSize}
                    onChange={(e) => setSettings({ ...settings, pageSize: e.target.value })}
                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                  >
                    <option value="A4">A4 (Standard 210 x 297mm)</option>
                    <option value="Letter">Letter (8.5 x 11 in)</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Page Orientation</Label>
                  <select 
                    value={settings.orientation}
                    onChange={(e) => setSettings({ ...settings, orientation: e.target.value })}
                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                  >
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Copies Per Sheet</Label>
                  <select 
                    value={settings.copiesCount}
                    onChange={(e) => setSettings({ ...settings, copiesCount: e.target.value })}
                    className="w-full h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                  >
                    <option value="1">1 Copy</option>
                    <option value="2">2 Copies</option>
                    <option value="3">3 Copies (Recommended)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Information Card */}
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#084A86]" />
              <h2 className="text-base font-semibold text-zinc-950">Printed Header & Footer Content</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Institutional Header Title</Label>
                <Input 
                  value={settings.headerTitle}
                  onChange={(e) => setSettings({ ...settings, headerTitle: e.target.value })}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Sub-Title / Registration Reg Number</Label>
                <Input 
                  value={settings.subTitle}
                  onChange={(e) => setSettings({ ...settings, subTitle: e.target.value })}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Signatory Designation Line</Label>
                <Input 
                  value={settings.authorizedSignatory}
                  onChange={(e) => setSettings({ ...settings, authorizedSignatory: e.target.value })}
                  className="bg-white border-zinc-300 text-zinc-950 focus-visible:ring-[#084A86]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Footer Terms & Policy Note</Label>
                <textarea 
                  rows={3}
                  value={settings.footerNote}
                  onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden p-5">
            <h3 className="font-bold text-zinc-950 text-sm mb-3">Live Print Preview Sample</h3>
            <div className="border border-dashed border-zinc-300 rounded-xl p-4 bg-zinc-50/50 space-y-3 text-center">
              <div className="font-extrabold text-[#084A86] text-xs uppercase">{settings.headerTitle}</div>
              <div className="text-[10px] text-zinc-500">{settings.subTitle}</div>
              <div className="h-px bg-zinc-200 my-2"></div>
              <div className="text-left text-[11px] space-y-1 font-mono text-zinc-700">
                <div className="flex justify-between"><span>Format:</span><b>{settings.invoiceFormat}</b></div>
                <div className="flex justify-between"><span>Size:</span><b>{settings.pageSize} ({settings.orientation})</b></div>
                <div className="flex justify-between"><span>Copies:</span><b>{settings.copiesCount} per sheet</b></div>
              </div>
              <div className="h-px bg-zinc-200 my-2"></div>
              <div className="text-[10px] text-zinc-500 italic text-left">
                &ldquo;{settings.footerNote}&rdquo;
              </div>
              <div className="pt-2 text-right text-[10px] font-bold text-zinc-700">
                ______________________<br />
                {settings.authorizedSignatory}
              </div>
            </div>

            <Button 
              type="submit"
              disabled={saving}
              className="w-full mt-5 bg-[#084A86] hover:bg-[#073b6b] text-white font-semibold py-2.5 shadow-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'SAVING SETTINGS...' : 'SAVE PRINT PREFERENCES'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
