'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  DollarSign, 
  Layers, 
  Tag, 
  FileText, 
  Building, 
  ArrowRightLeft, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Download, 
  Printer, 
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FeesDashboardPage() {
  const [invoices, setInvoices] = useState([]);
  const [bankPayments, setBankPayments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTxn, setSearchTxn] = useState('');

  const fetchFeesData = async () => {
    try {
      setLoading(true);
      const [invRes, bankRes, grpRes, typeRes] = await Promise.all([
        api.get('/fees-invoice?limit=50').catch(() => null),
        api.get('/bank-payment').catch(() => null),
        api.get('/fees/group').catch(() => null),
        api.get('/fees/type').catch(() => null)
      ]);

      if (invRes?.success && Array.isArray(invRes.data)) {
        setInvoices(invRes.data);
      }
      if (bankRes?.success && Array.isArray(bankRes.data)) {
        setBankPayments(bankRes.data);
      }
      if (grpRes?.success && Array.isArray(grpRes.data)) {
        setGroups(grpRes.data);
      }
      if (typeRes?.success && Array.isArray(typeRes.data)) {
        setTypes(typeRes.data);
      }
    } catch (e) {
      console.error('Fees overview fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeesData();
  }, []);

  // Compute live stats
  const stats = useMemo(() => {
    const totalCollected = invoices.reduce((sum, inv) => sum + (Number(inv.paid) || 0), 0);
    const totalPending = invoices.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);
    const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const pendingBankCount = bankPayments.filter(b => b.status === 'Pending').length;
    const paidInvoicesCount = invoices.filter(inv => String(inv.status).toLowerCase() === 'paid').length;

    return {
      totalCollected,
      totalPending,
      totalAmount,
      totalInvoices: invoices.length,
      paidInvoicesCount,
      pendingBankCount,
      totalGroups: groups.length,
      totalTypes: types.length
    };
  }, [invoices, bankPayments, groups, types]);

  // Filtered recent transactions
  const filteredRecent = useMemo(() => {
    if (!searchTxn.trim()) return invoices.slice(0, 10);
    const q = searchTxn.toLowerCase().trim();
    return invoices.filter(inv => 
      (inv.student || '').toLowerCase().includes(q) ||
      (inv.admissionNo || '').toLowerCase().includes(q) ||
      (inv.invoiceNo || '').toLowerCase().includes(q) ||
      (inv.feeType || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [invoices, searchTxn]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Fees Management Overview</h1>
          <p className="text-xs text-zinc-500 mt-1">Live analytics, fee collection tracking, invoices, and payment structures.</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="font-semibold text-zinc-950">Fees</span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Collected</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              PKR {stats.totalCollected.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">
              {stats.paidInvoicesCount} invoices fully settled
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pending Balance</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              PKR {stats.totalPending.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">
              Outstanding student dues
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Issued</span>
            <div className="text-2xl font-black text-[#084A86] mt-1">
              PKR {stats.totalAmount.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">
              Across {stats.totalInvoices} generated vouchers
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bank Approvals</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {stats.pendingBankCount} Pending
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">
              Online & bank slip verifications
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Building className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards (6 Modules) */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 mb-3">Fees Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {[
            {
              title: 'Fees Collection',
              desc: 'Collect & record student payments',
              href: '/dashboard/fees/collection',
              icon: Wallet,
              badge: `${stats.totalInvoices} Invoices`
            },
            {
              title: 'Fees Invoice',
              desc: 'Generate & print fee vouchers',
              href: '/dashboard/fees/invoice',
              icon: FileText,
              badge: 'Vouchers'
            },
            {
              title: 'Fees Group',
              desc: 'Class & session fee categories',
              href: '/dashboard/fees/group',
              icon: Layers,
              badge: `${stats.totalGroups} Groups`
            },
            {
              title: 'Fees Type',
              desc: 'Tuition, exam, transport types',
              href: '/dashboard/fees/type',
              icon: Tag,
              badge: `${stats.totalTypes} Types`
            },
            {
              title: 'Bank Payment',
              desc: 'Approve online & bank transfers',
              href: '/dashboard/fees/bank-payment',
              icon: Building,
              badge: `${stats.pendingBankCount} Awaiting`
            },
            {
              title: 'Carry Forward',
              desc: 'Forward previous session dues',
              href: '/dashboard/fees/carry-forward',
              icon: ArrowRightLeft,
              badge: 'Session Dues'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={idx} href={item.href}>
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs hover:border-[#084A86] hover:shadow-md transition-all flex flex-col justify-between h-36 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 group-hover:bg-blue-50 text-zinc-800 group-hover:text-[#084A86] flex items-center justify-center transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-[#084A86] transition-colors" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-zinc-950 group-hover:text-[#084A86] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Collected Fees Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Recent Fee Invoices & Transactions</h2>
            <p className="text-xs text-zinc-500">Live records from system database</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                value={searchTxn}
                onChange={e => setSearchTxn(e.target.value)}
                placeholder="Search student or voucher..."
                className="pl-8 h-8 text-xs w-48 sm:w-60 bg-white border-zinc-300 rounded-xl"
              />
            </div>
            <TableExportToolbar />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-zinc-600 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3">Voucher #</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Class & Adm</th>
                <th className="px-4 py-3">Fee Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-zinc-500 font-medium">
                    Loading fee records...
                  </td>
                </tr>
              ) : filteredRecent.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-zinc-500 font-medium">
                    No fee records found. Use Fees Collection or Invoice to issue vouchers.
                  </td>
                </tr>
              ) : (
                filteredRecent.map((inv, idx) => (
                  <tr key={inv._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-zinc-950">
                      {inv.invoiceNo || `INV-${1000 + idx}`}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-900">
                      {inv.student}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {inv.className || 'Class 10'} &bull; <span className="font-mono text-[10px] text-zinc-500">{inv.admissionNo || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700">
                      {inv.feeType || 'Tuition Fee'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-950">
                      PKR {Number(inv.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-600">
                      PKR {Number(inv.paid || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-rose-600">
                      PKR {Number(inv.balance || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        String(inv.status).toLowerCase() === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : String(inv.status).toLowerCase() === 'partial'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {inv.status || 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500">
                      {inv.date ? new Date(inv.date).toLocaleDateString() : new Date().toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href="/dashboard/fees/invoice">
                        <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5 rounded-lg border-zinc-200 text-zinc-800">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
