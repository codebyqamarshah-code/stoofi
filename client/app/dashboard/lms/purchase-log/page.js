'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PurchaseLogPage() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { fetchRecords(); }, []);
  const fetchRecords = async () => { try { const res = await api.get('/lms-purchase-log'); if(res.success) setLogs(res.data); } catch(e){} };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-950">Purchase Log</h1>
        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Purchase Log</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl p-5">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-950">Select Criteria</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Class</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Class *</option>
              <option value="1">Class 1</option>
              <option value="2">Class 2</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Section</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Payment Date</Label>
            <Input type="date" className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 focus-visible:ring-zinc-600 [color-scheme:dark]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Status</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-semibold">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>

      {/* Purchase Log Table */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-950">Purchase Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 dark:text-zinc-700 uppercase font-bold bg-white dark:bg-zinc-50 border-b border-zinc-200 dark:border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Note</th>
                <th className="px-4 py-3 font-semibold">File</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((l, i) => (
                <tr key={i} className="border-b border-zinc-200 dark:border-zinc-200/50 hover:bg-zinc-50 dark:hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-4 text-zinc-950">{l.studentName}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.date}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.amount}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.note}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.file}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.status}</td>
                  <td className="px-4 py-4 text-right">
                    <Button variant="outline" size="sm" className="h-8 text-xs text-zinc-600 border-zinc-300 dark:border-zinc-600/50 hover:bg-zinc-600/10">SELECT</Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">No Data Available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}






