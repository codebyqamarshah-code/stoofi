'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  ShieldAlert,
  FileSpreadsheet,
  FileCheck,
  ArrowRight,
  Clock,
  Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const REPORTS = [
  {
    title: 'Daily Collection Report',
    desc: 'Audit daily cash desk collections, bank deposits and online inflows.',
    href: '/dashboard/accountant/reports/daily',
    icon: Calendar,
    color: 'emerald'
  },
  {
    title: 'Weekly Collection Report',
    desc: 'Weekly aggregation of institutional fees, receipts and cashier settlements.',
    href: '/dashboard/accountant/reports/weekly',
    icon: Clock,
    color: 'blue'
  },
  {
    title: 'Monthly Collection Report',
    desc: 'Full monthly fee recovery, billing cycle performance and outstanding ratios.',
    href: '/dashboard/accountant/reports/monthly',
    icon: FileSpreadsheet,
    color: 'indigo'
  },
  {
    title: 'Annual Collection Report',
    desc: 'Year-to-date and fiscal annual collection summary across all academic terms.',
    href: '/dashboard/accountant/reports/annual',
    icon: TrendingUp,
    color: 'violet'
  },
  {
    title: 'Institutional Income Report',
    desc: 'Detailed breakdown of tuition, examination, admission and miscellaneous revenue.',
    href: '/dashboard/accountant/reports/income',
    icon: DollarSign,
    color: 'emerald'
  },
  {
    title: 'Operational Expense Report',
    desc: 'Campus utility, maintenance, supplier and laboratory expenditure ledger.',
    href: '/dashboard/accountant/reports/expenses',
    icon: TrendingDown,
    color: 'rose'
  },
  {
    title: 'Profit / Loss & Net Income Report',
    desc: 'Complete financial statement comparing gross revenue against operational expenses and payroll.',
    href: '/dashboard/accountant/reports/profit-loss',
    icon: PieChart,
    color: 'amber'
  },
  {
    title: 'Outstanding Fees Report',
    desc: 'Aging report of unpaid student balances and overdue fee collections.',
    href: '/dashboard/accountant/reports/outstanding',
    icon: ShieldAlert,
    color: 'red'
  },
  {
    title: 'Student Payment Report',
    desc: 'Student-by-student fee payment history and reconciliation statements.',
    href: '/dashboard/accountant/reports/student-payments',
    icon: FileText,
    color: 'cyan'
  },
  {
    title: 'Staff Salary & Payroll Report',
    desc: 'Monthly and annual compensation records, allowances, and tax deductions.',
    href: '/dashboard/accountant/reports/salary',
    icon: FileCheck,
    color: 'teal'
  }
];

export default function ReportsHubPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Financial & Accounting Reports
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Audit Ready
          </span>
        </div>
        <p className="text-sm text-zinc-500 mt-1">
          Generate comprehensive audit, collection, profit & loss, and operational reports backed by real database records.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Card
              key={r.title}
              className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {r.title}
                </CardTitle>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {r.desc}
                </p>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Button
                  onClick={() => router.push(r.href)}
                  className="w-full rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800"
                >
                  Generate Report
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
