'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  BookOpen, 
  Building2, 
  ArrowLeftRight 
} from 'lucide-react';

const accountsRoutes = [
  {
    name: 'Profit & Loss',
    href: '/dashboard/accounts/accounts/profit-loss',
    icon: TrendingUp,
    badge: 'Report'
  },
  {
    name: 'Income',
    href: '/dashboard/accounts/accounts/income',
    icon: ArrowDownLeft,
  },
  {
    name: 'Expense',
    href: '/dashboard/accounts/accounts/expense',
    icon: ArrowUpRight,
  },
  {
    name: 'Chart of Account',
    href: '/dashboard/accounts/accounts/chart-of-account',
    icon: BookOpen,
  },
  {
    name: 'Bank Account',
    href: '/dashboard/accounts/accounts/bank-account',
    icon: Building2,
  },
  {
    name: 'Fund Transfer',
    href: '/dashboard/accounts/accounts/fund-transfer',
    icon: ArrowLeftRight,
  },
];

export default function AccountsNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-1.5 shadow-xs overflow-x-auto">
      <nav className="flex space-x-1 min-w-max" aria-label="Accounts navigation">
        {accountsRoutes.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-[#009966] text-white shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
              <span>{tab.name}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-[#009966] border border-emerald-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
