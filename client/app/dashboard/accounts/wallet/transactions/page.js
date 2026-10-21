'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, CreditCard, Download, Printer, Filter, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';

const DEMO = [
  { _id: 't1', date: '2026-10-15', student: 'Muhammad Abdullah', admNo: 'PRC-081', type: 'Deposit', method: 'Bank Transfer', amount: 15000, balanceAfter: 45000, ref: 'TXN-20261015-001', status: 'Completed' },
  { _id: 't2', date: '2026-10-15', student: 'Ayesha Fatima', admNo: 'PRC-082', type: 'Fee Payment', method: 'Wallet', amount: -12000, balanceAfter: 18000, ref: 'TXN-20261015-002', status: 'Completed' },
  { _id: 't3', date: '2026-10-15', student: 'Hamza Farooq', admNo: 'PRC-084', type: 'Deposit', method: 'Cash', amount: 20000, balanceAfter: 32000, ref: 'TXN-20261015-003', status: 'Completed' },
  { _id: 't4', date: '2026-10-14', student: 'Zainab Bibi', admNo: 'PRC-083', type: 'Refund', method: 'Bank Transfer', amount: -5000, balanceAfter: 7500, ref: 'TXN-20261014-001', status: 'Completed' },
  { _id: 't5', date: '2026-10-14', student: 'Bilal Hussain', admNo: 'PRC-086', type: 'Deposit', method: 'Online', amount: 10000, balanceAfter: 22000, ref: 'TXN-20261014-002', status: 'Pending' },
  { _id: 't6', date: '2026-10-14', student: 'Fatima Noor', admNo: 'PRC-085', type: 'Fee Payment', method: 'Wallet', amount: -8500, balanceAfter: 11500, ref: 'TXN-20261014-003', status: 'Completed' },
  { _id: 't7', date: '2026-10-13', student: 'Saad Ur Rehman', admNo: 'PRC-087', type: 'Deposit', method: 'Cash', amount: 25000, balanceAfter: 55000, ref: 'TXN-20261013-001', status: 'Completed' },
  { _id: 't8', date: '2026-10-13', student: 'Mariam Zahra', admNo: 'PRC-088', type: 'Withdrawal', method: 'Cash', amount: -3000, balanceAfter: 9000, ref: 'TXN-20261013-002', status: 'Completed' },
  { _id: 't9', date: '2026-10-12', student: 'Ali Raza', admNo: 'PRC-089', type: 'Deposit', method: 'Bank Transfer', amount: 18000, balanceAfter: 38000, ref: 'TXN-20261012-001', status: 'Completed' },
  { _id: 't10', date: '2026-10-12', student: 'Hira Malik', admNo: 'PRC-090', type: 'Fee Payment', method: 'Wallet', amount: -15000, balanceAfter: 5000, ref: 'TXN-20261012-002', status: 'Completed' },
  { _id: 't11', date: '2026-10-11', student: 'Usman Ali', admNo: 'PRC-091', type: 'Deposit', method: 'Online', amount: 30000, balanceAfter: 60000, ref: 'TXN-20261011-001', status: 'Completed' },
  { _id: 't12', date: '2026-10-11', student: 'Rabia Naz', admNo: 'PRC-092', type: 'Refund', method: 'Bank Transfer', amount: -7500, balanceAfter: 12500, ref: 'TXN-20261011-002', status: 'Completed' },
  { _id: 't13', date: '2026-10-10', student: 'Hassan Shah', admNo: 'PRC-093', type: 'Deposit', method: 'Cash', amount: 12000, balanceAfter: 27000, ref: 'TXN-20261010-001', status: 'Completed' },
  { _id: 't14', date: '2026-10-10', student: 'Sana Bibi', admNo: 'PRC-094', type: 'Fee Payment', method: 'Wallet', amount: -9500, balanceAfter: 3500, ref: 'TXN-20261010-002', status: 'Completed' },
  { _id: 't15', date: '2026-10-09', student: 'Kamran Ahmed', admNo: 'PRC-095', type: 'Deposit', method: 'Bank Transfer', amount: 22000, balanceAfter: 42000, ref: 'TXN-20261009-001', status: 'Completed' },
];

const fmt = (n) => 'PKR ' + Math.abs(n).toLocaleString('en-PK');

export default function WalletTransactionsPage() {
  const [records, setRecords] = useState(DEMO);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    api.get('/wallet/transaction').then(res => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) setRecords(res.data);
    }).catch(() => {});
  }, []);

  const filtered = records.filter(r => {
    if (search && !r.student.toLowerCase().includes(search.toLowerCase()) && !r.admNo.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo && r.date > dateTo) return false;
    return true;
  });

  const totalCredits = filtered.filter(r => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const totalDebits = filtered.filter(r => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]"><CreditCard className="h-6 w-6" /></span>
            Wallet Transactions
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Complete transaction history with filters &amp; export</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/accounts/wallet" className="hover:text-zinc-600">Wallet</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Transactions</span>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ArrowUpRight className="w-5 h-5" /></div>
          <div><span className="text-[11px] font-bold text-zinc-400 uppercase block">Total Credits</span><div className="text-lg font-black text-emerald-600">{fmt(totalCredits)}</div></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><ArrowDownRight className="w-5 h-5" /></div>
          <div><span className="text-[11px] font-bold text-zinc-400 uppercase block">Total Debits</span><div className="text-lg font-black text-rose-600">{fmt(totalDebits)}</div></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#084A86] flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
          <div><span className="text-[11px] font-bold text-zinc-400 uppercase block">Net Balance</span><div className="text-lg font-black text-[#084A86]">{fmt(totalCredits - totalDebits)}</div></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-zinc-200/80 shadow-xs rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input placeholder="Search student name or admission no..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white border-zinc-200 text-xs" />
          </div>
          <SearchableSelect value={typeFilter} onChange={setTypeFilter} placeholder="All Types" options={[{label:'All Types',value:''},{label:'Deposit',value:'Deposit'},{label:'Fee Payment',value:'Fee Payment'},{label:'Refund',value:'Refund'},{label:'Withdrawal',value:'Withdrawal'}]} />
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-xs bg-white border-zinc-200" />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-xs bg-white border-zinc-200" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 shadow-xs rounded-2xl overflow-hidden">
        <div className="p-3 border-b border-zinc-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-600">{filtered.length} transactions found</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-[11px] h-7"><Download className="w-3 h-3 mr-1" />Export CSV</Button>
            <Button variant="outline" size="sm" className="text-[11px] h-7" onClick={() => window.print()}><Printer className="w-3 h-3 mr-1" />Print</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Date</th><th className="p-3">Student</th><th className="p-3">Adm #</th><th className="p-3">Type</th><th className="p-3">Method</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Balance After</th><th className="p-3">Reference</th><th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(t => (
                <tr key={t._id} className="hover:bg-slate-50/70">
                  <td className="p-3 text-zinc-500">{formatDateDMY(t.date)}</td>
                  <td className="p-3 font-bold text-zinc-900">{t.student}</td>
                  <td className="p-3 font-mono text-zinc-600">{t.admNo}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.type==='Deposit'?'bg-emerald-100 text-emerald-800':t.type==='Fee Payment'?'bg-sky-100 text-[#084A86]':t.type==='Refund'?'bg-amber-100 text-amber-800':'bg-rose-100 text-rose-800'}`}>{t.type}</span></td>
                  <td className="p-3 text-zinc-600">{t.method}</td>
                  <td className={`p-3 text-right font-bold font-mono ${t.amount>=0?'text-emerald-600':'text-rose-600'}`}>{t.amount>=0?'+':''}{fmt(t.amount)}</td>
                  <td className="p-3 text-right font-mono text-zinc-700">{fmt(t.balanceAfter)}</td>
                  <td className="p-3 font-mono text-zinc-500">{t.ref}</td>
                  <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status==='Completed'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
