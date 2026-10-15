'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { ChevronRight, Search, ShoppingBag, Download, Printer, CheckCircle2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_PURCHASES = [
  { _id: 'p1', studentName: 'Muhammad Rayyan', course: 'Complete Secondary Physics 2026', date: '2026-09-20', amount: 3500, note: 'Online Card Payment', file: 'Receipt-101.pdf', status: 'Paid' },
  { _id: 'p2', studentName: 'Zoya Fatima', course: 'Higher Algebra & Trigonometry Mastery', date: '2026-09-21', amount: 4000, note: 'JazzCash Payment', file: 'Receipt-102.pdf', status: 'Paid' },
  { _id: 'p3', studentName: 'Bilal Hassan', course: 'Organic & Inorganic Chemistry Essentials', date: '2026-09-23', amount: 3200, note: 'Bank Challan verified', file: 'Challan-301.pdf', status: 'Paid' },
  { _id: 'p4', studentName: 'Ayesha Noor', course: 'Modern Web Development & Python Basics', date: '2026-09-24', amount: 4500, note: 'School Counter Cash Payment', file: 'CashReceipt-404.pdf', status: 'Paid' },
];

export default function PurchaseLogPage() {
  const [logs, setLogs] = useState(DEFAULT_PURCHASES);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lms-purchase-log').catch(() => null);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setLogs(res.data);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l => 
    (l.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.course || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.note || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-[#084A86]" />
            LMS Purchase Log
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Audit log of course enrollments, digital payments, and student fee clearance</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Purchase Log</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search student, course, or receipt note..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 h-9.5 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-[#084A86]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => window.print()}
            variant="outline" 
            className="h-9.5 text-xs text-zinc-700 border-zinc-300 hover:bg-zinc-50 flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Ledger
          </Button>
        </div>
      </div>

      {/* Purchase Log Table */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950">Transaction History</h2>
          <span className="text-xs bg-zinc-200/70 text-zinc-700 px-2.5 py-0.5 rounded-full font-bold">
            {filtered.length} Purchases
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-100/70 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">Course Enrolled</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                <th className="px-4 py-3 font-semibold">Payment Details</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-zinc-500 font-medium">
                    No purchase records match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map((l, i) => (
                  <tr key={l._id || i} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center text-xs text-zinc-400 font-medium">{i + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-zinc-950">{l.studentName}</td>
                    <td className="px-4 py-3.5 text-xs text-[#084A86] font-semibold">{l.course}</td>
                    <td className="px-4 py-3.5 text-xs text-zinc-600">{l.date}</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-sm text-zinc-900">
                      Rs. {Number(l.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-600 font-medium">{l.note}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        {l.status}
                      </span>
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
