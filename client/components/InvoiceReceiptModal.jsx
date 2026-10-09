"use client";
import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvoiceReceiptModal({ invoice, isOpen, onClose }) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNum = invoice.invoiceNumber || `INV-${invoice.providerReference || '2026-001'}`;
  const dateStr = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-2xl w-full overflow-hidden my-8 print:shadow-none print:border-none print:m-0 print:w-full">
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Official Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold h-8 px-3 rounded-lg"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Print / PDF
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-invoice" className="p-8 sm:p-10 space-y-8 bg-white text-zinc-900">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
            <div>
              <img src="/logo.png" alt="Stoofi ERP" className="h-10 sm:h-12 w-auto object-contain mb-2" />
              <p className="text-xs text-zinc-500 font-medium">Next-Gen School Management Platform</p>
              <p className="text-xs text-zinc-500">support@stoofi.com | www.stoofi.com</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider mb-1.5">
                PAID & VERIFIED
              </div>
              <p className="text-sm font-bold text-zinc-900">{invoiceNum}</p>
              <p className="text-xs text-zinc-500">Date: {dateStr}</p>
            </div>
          </div>

          {/* Billed To / School Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <div>
              <p className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-1">Billed To (School)</p>
              <h4 className="text-sm font-bold text-zinc-900">{invoice.schoolName || 'School Partner'}</h4>
              <p className="text-xs text-zinc-600 mt-0.5">Admin: {invoice.adminName || 'Administrator'}</p>
              <p className="text-xs text-zinc-600">{invoice.adminEmail}</p>
              {invoice.phone && <p className="text-xs text-zinc-600">Ph: {invoice.phone}</p>}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-1">Payment Method & Gateway</p>
              <p className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5 mt-1">
                <CreditCard className="h-3.5 w-3.5 text-zinc-600" />
                Safepay Secure Gateway (Cards, Raast, Wallets)
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Order Ref: <span className="font-mono text-zinc-900 font-bold">{invoice.providerReference}</span>
              </p>
              {invoice.providerTransactionId && (
                <p className="text-[11px] text-zinc-500 font-mono truncate max-w-[240px]">
                  Trx ID: {invoice.providerTransactionId}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Billing Cycle</th>
                  <th className="py-3 px-4 text-center">Students</th>
                  <th className="py-3 px-4 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="py-4 px-4 font-semibold text-zinc-900">
                    Stoofi {invoice.plan || 'Professional'} Subscription
                    <span className="block text-[11px] font-normal text-zinc-500 mt-0.5">
                      Full ERP access, student management, LMS, attendance, and all portals.
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center capitalize font-medium text-zinc-700">
                    {invoice.billingCycle || 'monthly'}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-zinc-900">
                    {invoice.studentCount || 100}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-zinc-900 text-sm">
                    Rs. {Number(invoice.amount || 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary / Total */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-xs text-zinc-600">
                <span>Subtotal:</span>
                <span>Rs. {Number(invoice.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-600">
                <span>Taxes & Fees:</span>
                <span>Rs. 0.00</span>
              </div>
              <div className="border-t border-zinc-300 pt-2 flex justify-between text-sm font-black text-zinc-950">
                <span>Total Paid:</span>
                <span>Rs. {Number(invoice.amount || 0).toLocaleString()} PKR</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 space-y-1">
            <p className="font-semibold text-zinc-700 flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Thank you for choosing Stoofi to empower your school!
            </p>
            <p className="text-[11px]">This is a computer-generated electronic invoice valid without signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
