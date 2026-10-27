'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, CreditCard, ArrowRight, Wallet, Receipt, ShieldCheck } from 'lucide-react';

export default function FeesSettingsHubPage() {
  const sections = [
    {
      title: 'Fees Invoice & Voucher Settings',
      description: 'Configure automated fee voucher numbering patterns, campus prefixes, digit limits, and barcode position tags.',
      href: '/dashboard/settings/fees/fees-invoice-settings',
      icon: FileText,
      badge: 'Core Configuration',
    },
    {
      title: 'Subscription & Platform Billing',
      description: 'Manage institution license, cloud hosting renewal, active plan quotas, invoice payment receipts, and automated card billing.',
      href: '/dashboard/settings/billing',
      icon: CreditCard,
      badge: 'Billing & Plan',
    },
    {
      title: 'Payment Gateways & Bank Accounts',
      description: 'Setup bank deposit accounts, JazzCash, EasyPaisa, Safepay, and cash counter collection channels for instant student fee clearance.',
      href: '/dashboard/settings/general/payment-settings',
      icon: Wallet,
      badge: 'Gateways',
    }
  ];

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950 space-y-6">
      <div className="flex items-center text-xs text-zinc-500 mb-2">
        <Link href="/dashboard" className="hover:text-zinc-800 transition-colors">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <Link href="/dashboard/settings" className="hover:text-zinc-800 transition-colors">Settings</Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <span className="text-zinc-950 font-bold">Fees Settings</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-zinc-800" />
            <span>Fees & Finance Settings</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Control fee invoice structures, collection accounts, online payment gateways, and system licensing rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group block p-6 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-900 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white flex items-center justify-center text-zinc-800 transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {s.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-950 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                <span>{s.title}</span>
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed mt-2">
                {s.description}
              </p>
              <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-900 group-hover:text-emerald-600">
                <span>Open Configuration</span>
                <span className="text-zinc-400 group-hover:text-emerald-600">&rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-950">Bank Deposit Challan & 1Link Sync Enabled</h4>
            <p className="text-xs text-zinc-500">Every printed fee invoice includes unique barcode and sequence credentials for automated reconciliation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
