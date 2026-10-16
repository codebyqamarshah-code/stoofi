'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  DollarSign, 
  FileText, 
  CreditCard, 
  ArrowRight, 
  PieChart, 
  TrendingUp, 
  ArrowRightLeft
} from 'lucide-react';

const ACCOUNTS_REPORTS = [
  { title: 'General Transaction & Ledger Report', href: '/dashboard/report/accounts/transaction', icon: FileText, desc: 'Complete audit of income vouchers, expense debits, inter-account transfers, and closing balances' },
  { title: 'Faculty & Staff Payroll Ledger', href: '/dashboard/report/accounts/payroll', icon: DollarSign, desc: 'Detailed salary disbursement register with tax withholdings, allowances, and banking references' },
];

export default function AccountsReportHubPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <DollarSign className="h-6 w-6" />
            </span>
            Accounts &amp; Financial Reports
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            General ledger audit logs, bank statements, and salary payroll registries • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Reports</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Accounts Reports</span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ACCOUNTS_REPORTS.map((rep, idx) => (
          <Link
            key={idx}
            href={rep.href}
            className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs hover:border-[#084A86]/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center group-hover:bg-[#084A86] group-hover:text-white transition-colors">
                  <rep.icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-[#084A86] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-extrabold text-base text-zinc-950 mt-5 group-hover:text-[#084A86] transition-colors">{rep.title}</h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{rep.desc}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Export to CSV / PDF / Print</span>
              <span className="font-bold text-[#084A86] group-hover:underline">Open Report →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
