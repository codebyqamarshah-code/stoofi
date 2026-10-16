'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  DollarSign, 
  Receipt, 
  Clock, 
  Scale, 
  Percent, 
  Wallet, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const FEES_REPORTS = [
  { title: 'Fee Payment Collection Report', href: '/dashboard/report/fees/payment', icon: Receipt, desc: 'Real-time ledger of received fees, receipt numbers, payment gateways, and daily cashier cash' },
  { title: 'Student Fee Balance Report', href: '/dashboard/report/fees/balance', icon: Scale, desc: 'Class-wise receivables summary, total invoiced amounts, cleared fees, and remaining balance' },
  { title: 'Due & Overdue Fees Report', href: '/dashboard/report/fees/due', icon: Clock, desc: 'Identify delinquent fee accounts, aging analysis (30/60/90 days), and parent contact list' },
  { title: 'Fine & Late Surcharge Collection', href: '/dashboard/report/fees/fine', icon: AlertCircle, desc: 'Audit log of late fee penalties, library damages, disciplinary charges, and collected fines' },
  { title: 'Fee Waiver & Scholarship Report', href: '/dashboard/report/fees/waiver', icon: Percent, desc: 'Approved concessions, sibling discounts, merit scholarships, and need-based fee reductions' },
  { title: 'Student Digital Wallet Report', href: '/dashboard/report/fees/wallet', icon: Wallet, desc: 'Prepaid student wallet balances, top-up deposits, cafeteria/canteen debits, and transaction logs' },
];

export default function FeesReportHubPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <DollarSign className="h-6 w-6" />
            </span>
            Fee &amp; Financial Reports Center
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Institutional fee collections, receivables, dues, waivers, and wallet summaries • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Reports</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Fees Reports</span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEES_REPORTS.map((rep, idx) => (
          <Link
            key={idx}
            href={rep.href}
            className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs hover:border-[#084A86]/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center group-hover:bg-[#084A86] group-hover:text-white transition-colors">
                  <rep.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#084A86] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-extrabold text-sm text-zinc-950 mt-4 group-hover:text-[#084A86] transition-colors">{rep.title}</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{rep.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">Export Ready</span>
              <span className="font-bold text-[#084A86] group-hover:underline">Open Report →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
