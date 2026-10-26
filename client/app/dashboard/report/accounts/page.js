'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Banknote, 
  CreditCard, 
  ArrowRight, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  ArrowRightLeft,
  Wallet,
  Scale
} from 'lucide-react';

const ACCOUNTS_REPORTS = [
  { title: 'General Transaction & Ledger Report', href: '/dashboard/report/accounts/transaction', icon: ArrowRightLeft, desc: 'Complete audit of income vouchers, student fee credits, expense debits, and closing bank balances' },
  { title: 'Income & Revenue Receipts Report', href: '/dashboard/report/accounts/income', icon: TrendingUp, desc: 'Student tuition fees, lab charges, hostel collections, prospectus sales, and bank/cash inflows' },
  { title: 'Expenditure & Operating Expenses', href: '/dashboard/report/accounts/expense', icon: TrendingDown, desc: 'Campus utilities, lab equipment, IT infrastructure, maintenance, and administrative vendor disbursements' },
  { title: 'Profit & Loss Statement (P&L)', href: '/dashboard/report/accounts/profit-loss', icon: Scale, desc: 'Statutory institutional profit & loss statement, revenue vs operating costs, and net fiscal margin' },
  { title: 'Faculty & Staff Payroll Ledger', href: '/dashboard/report/accounts/payroll', icon: Banknote, desc: 'Monthly salary disbursement register with tax withholdings, allowances, and banking references' },
  { title: 'Student Fees Due & Collection', href: '/dashboard/report/fees/due', icon: Wallet, desc: 'Student term dues, balance summaries, and institutional revenue recovery tracking' },
];

export default function AccountsReportHubPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <Banknote className="h-6 w-6" />
            </span>
            Accounts &amp; Financial Reports Center
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            General ledger audit logs, income streams, expenditures, and P&amp;L margins • Pak Royal College Sharaqpur
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ACCOUNTS_REPORTS.map((rep, idx) => (
          <Link
            key={idx}
            href={rep.href}
            className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs hover:border-[#084A86]/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center group-hover:bg-[#084A86] group-hover:text-white transition-colors">
                  <rep.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#084A86] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-extrabold text-sm text-zinc-950 mt-4 group-hover:text-[#084A86] transition-colors">{rep.title}</h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{rep.desc}</p>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">Export CSV &amp; Official Print</span>
              <span className="font-bold text-[#084A86] group-hover:underline">Open Report →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
