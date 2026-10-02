'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Plus, Download, Printer, FileText, CheckCircle2, DollarSign, BookOpen, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const INITIAL_INVOICES = [
  {
    id: 'LMS-INV-2026-001',
    studentName: 'Muhammad Rayyan',
    email: 'rayyan@example.com',
    courseName: 'Complete Web Development Bootcamp 2026',
    instructor: 'Mudassir Bajwa',
    amount: 15000,
    paymentMethod: 'Credit / Debit Card',
    status: 'Paid',
    date: '2026-09-20'
  },
  {
    id: 'LMS-INV-2026-002',
    studentName: 'Zoya Fatima',
    email: 'zoya@example.com',
    courseName: 'Advanced Physics & Robotics Masterclass',
    instructor: 'Dr. Bilal Siddiqui',
    amount: 12000,
    paymentMethod: 'JazzCash / EasyPaisa',
    status: 'Paid',
    date: '2026-09-21'
  },
  {
    id: 'LMS-INV-2026-003',
    studentName: 'Bilal Hassan',
    email: 'bilal@example.com',
    courseName: 'Mathematics Olympiad Preparation',
    instructor: 'Fatima Zahra',
    amount: 8000,
    paymentMethod: 'Direct Bank Transfer',
    status: 'Pending',
    date: '2026-09-23'
  },
  {
    id: 'LMS-INV-2026-004',
    studentName: 'Ayesha Noor',
    email: 'ayesha@example.com',
    courseName: 'Spoken English & Communication Skills',
    instructor: 'Sarah Khan',
    amount: 6500,
    paymentMethod: 'Credit / Debit Card',
    status: 'Paid',
    date: '2026-09-24'
  }
];

export default function LmsInvoicePage() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await api.get('/lms-fees-invoice');
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setInvoices(res.data);
        }
        // else keep INITIAL_INVOICES as demo data
      } catch (e) {
        console.error('Failed to fetch LMS invoices:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchSearch = !search || 
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.studentName.toLowerCase().includes(search.toLowerCase()) ||
      inv.courseName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handlePrintModal = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-indigo-400" />
            LMS Course Invoices & Transactions
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Track student course enrollment purchases, digital payments, and fee invoices.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-500">Course Invoices</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search by student, invoice ID, course..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus-visible:ring-indigo-500 text-sm"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
              Total Revenue: <strong className="text-emerald-400 font-mono font-bold">PKR {invoices.filter(i => i.status === 'Paid').reduce((a,b)=>a+b.amount,0).toLocaleString()}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm print:hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900/40">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-900 dark:text-zinc-200 uppercase tracking-wider">
            Invoices List ({filteredInvoices.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 dark:text-zinc-400 uppercase bg-white dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Invoice ID</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Course Title</th>
                <th className="px-4 py-3 font-semibold">Instructor</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    No course invoices match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white dark:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-indigo-400 font-semibold">{inv.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-zinc-900 dark:text-white">{inv.studentName}</div>
                      <div className="text-[11px] text-zinc-500">{inv.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-900 dark:text-zinc-900 dark:text-zinc-200 max-w-xs truncate font-medium">{inv.courseName}</td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-xs">{inv.instructor}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-900 dark:text-white">PKR {inv.amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-xs">{inv.paymentMethod}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        inv.status === 'Paid' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 text-xs font-mono">{inv.date}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setSelectedInvoice(inv)}
                        className="h-8 text-xs border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal / Printable Receipt */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white text-zinc-900 rounded-2xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative overflow-hidden border border-zinc-200">
            {/* Modal Header */}
            <div className="border-b-2 border-zinc-900 pb-4 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">OFFICIAL PAYMENT RECEIPT</span>
                <h3 className="text-xl font-extrabold text-zinc-900">Stoofi LMS Academy</h3>
                <p className="text-xs text-zinc-600">Online Learning & Skills Platform</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">PAID</span>
                <p className="font-mono text-xs font-bold text-zinc-800 mt-1">{selectedInvoice.id}</p>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-zinc-200">
                <div><span className="text-zinc-500">Student Name:</span> <strong className="text-zinc-900 block">{selectedInvoice.studentName}</strong></div>
                <div><span className="text-zinc-500">Email:</span> <strong className="text-zinc-900 block">{selectedInvoice.email}</strong></div>
                <div><span className="text-zinc-500">Transaction Date:</span> <span className="text-zinc-900 block">{selectedInvoice.date}</span></div>
                <div><span className="text-zinc-500">Payment Gateway:</span> <span className="text-zinc-900 block">{selectedInvoice.paymentMethod}</span></div>
              </div>

              <div className="border-t border-b border-zinc-200 py-3">
                <div className="flex justify-between font-bold text-sm mb-1 text-zinc-900">
                  <span>{selectedInvoice.courseName}</span>
                  <span className="font-mono">PKR {selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-zinc-500">Instructor: {selectedInvoice.instructor}</p>
              </div>

              <div className="flex justify-between items-center text-sm font-extrabold text-zinc-900 pt-1">
                <span>Total Amount Paid:</span>
                <span className="text-base text-indigo-700 font-mono">PKR {selectedInvoice.amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 print:hidden">
              <Button onClick={() => setSelectedInvoice(null)} variant="outline" className="text-zinc-700 border-zinc-300">
                Close
              </Button>
              <Button onClick={handlePrintModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2">
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






