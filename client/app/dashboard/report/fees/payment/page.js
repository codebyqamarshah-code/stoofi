'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function PaymentReportPage() {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/fees-invoice?search=${search}&limit=1000`);
      if (res.success) {
        // filter for Paid or Partial (where paid amount > 0)
        const payments = res.data.filter(r => r.status === 'Paid' || r.status === 'Partial' || (r.paid && r.paid > 0));
        setRecords(payments);
      }
    } catch (e) {
      console.error(e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-950">Payment Report</h1>
        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Report</Link><ChevronRight className="h-4 w-4 mx-1" /><Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Fees Report</Link><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-950 font-bold">Payment Report</span>
        </div>
      </div>

      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl p-4 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-950">Select Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Search Keywords</Label>
            <Input 
              placeholder="Search..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 focus-visible:ring-zinc-600 text-zinc-900 dark:text-zinc-950" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Class / Group</Label>
            <select 
              value={classFilter} 
              onChange={(e) => setClassFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 text-sm text-zinc-900 dark:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              <option value="">All Classes</option>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={handleSearch} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH REPORT
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-950">Payment Report List</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-200 dark:border-zinc-200 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white"><Download className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-200 dark:border-zinc-200 bg-white dark:bg-zinc-900 text-zinc-600 hover:text-zinc-900 dark:text-white"><FileText className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-200 dark:border-zinc-200 bg-white dark:bg-zinc-900 text-rose-500 hover:text-zinc-900 dark:text-white"><Printer className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 dark:text-zinc-700 uppercase font-bold bg-zinc-50 dark:bg-white dark:bg-zinc-50 border-b border-zinc-200 dark:border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">SL</th>
                <th className="px-4 py-3 font-semibold">Receipt No</th><th className="px-4 py-3 font-semibold">Student Name</th><th className="px-4 py-3 font-semibold">Fee Type</th><th className="px-4 py-3 font-semibold">Payment Mode</th><th className="px-4 py-3 font-semibold">Paid Amount</th><th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-100">
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              ) : records.map((r, i) => (
                <tr key={r._id} className="hover:bg-zinc-50 dark:bg-white dark:bg-zinc-900/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-700">{i + 1}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-950">{r.invoiceNo || '-'}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-950">{r.student}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-950">{r.feeType || '-'}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-950">
                    <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded text-xs">{r.paymentMethod || 'Cash'}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-400">
                    ${Number(r.paid || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-700 text-xs">
                    {r.date ? new Date(r.date).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

