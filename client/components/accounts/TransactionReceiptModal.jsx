'use client';

import React, { useRef } from 'react';
import { X, Printer, CheckCircle, ArrowRight, Building, Calendar, Hash, User, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/exportAccounts';

export default function TransactionReceiptModal({ isOpen, onClose, data, type = 'income' }) {
  const printRef = useRef(null);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  const isTransfer = type === 'transfer';

  const title = isIncome 
    ? 'Official Income Receipt' 
    : isExpense 
    ? 'Expense Payment Voucher' 
    : 'Fund Transfer Slip';

  const voucherColor = isIncome 
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
    : isExpense 
    ? 'bg-rose-50 text-rose-800 border-rose-200' 
    : 'bg-teal-50 text-teal-800 border-teal-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Print-specific style */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-voucher, #printable-voucher * {
            visibility: visible;
          }
          #printable-voucher {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50 no-print">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900">Financial Voucher Preview</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${voucherColor}`}>
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#009966] text-white text-xs font-semibold rounded-lg hover:bg-[#008055] transition shadow-xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div id="printable-voucher" ref={printRef} className="p-8 space-y-6 bg-white">
          {/* Header */}
          <div className="border-b-2 border-[#009966] pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#009966] inline-block"></span>
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 uppercase">
                  Pak Royal College
                </h1>
              </div>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">
                Stoofi ERP Accounting & Financial Management
              </p>
              <p className="text-[11px] text-zinc-400">
                Official Treasury & Cash Flow Record
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-md border uppercase tracking-wider ${voucherColor}`}>
                {title}
              </span>
              <p className="text-xs font-mono font-bold text-zinc-800 mt-2">
                {data.referenceNo || data.voucherNo || data.transferNo || 'REF-N/A'}
              </p>
              <p className="text-[11px] text-zinc-500">
                Date: {data.date ? new Date(data.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50/80 p-4 rounded-xl border border-zinc-200">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                {isTransfer ? 'From Bank Account' : isExpense ? 'Paid From' : 'Deposited To'}
              </span>
              <span className="font-semibold text-zinc-900 text-sm">
                {data.bankAccountName || (isTransfer ? data.fromAccountName : data.bankAccount?.name) || 'Main Cash / Petty'}
              </span>
              {data.paymentMethod && (
                <span className="text-zinc-500 text-[11px] block mt-0.5">
                  Method: <strong className="text-zinc-700">{data.paymentMethod}</strong>
                </span>
              )}
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                {isTransfer ? 'To Bank Account' : isExpense ? 'Payee / Vendor' : 'Received From / Payer'}
              </span>
              <span className="font-semibold text-zinc-900 text-sm">
                {isTransfer 
                  ? data.toAccountName || data.toAccount?.name || 'Destination Bank'
                  : isExpense 
                  ? data.vendor || 'Authorized Vendor'
                  : data.receivedFrom || 'Authorized Payer'}
              </span>
              <span className="text-zinc-500 text-[11px] block mt-0.5">
                Status: <strong className="text-[#009966]">{data.status || 'Verified / Recorded'}</strong>
              </span>
            </div>

            <div className="col-span-2 pt-2 border-t border-zinc-200">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                {isTransfer ? 'Transfer Particulars' : 'Title / Account Category'}
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-semibold text-zinc-900 text-sm">
                  {data.title || (isTransfer ? `Internal Fund Transfer from ${data.fromAccountName} to ${data.toAccountName}` : 'General Transaction')}
                </span>
                {data.category && (
                  <span className="text-xs bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded font-medium">
                    {data.category}
                  </span>
                )}
              </div>
              {data.description && (
                <p className="text-xs text-zinc-600 mt-1 italic">
                  "{data.description}"
                </p>
              )}
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider block">
                Total Transaction Amount
              </span>
              <span className="text-xs text-emerald-700">
                Pakistani Rupees (PKR)
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#009966]">
                {formatCurrency(data.amount)}
              </span>
            </div>
          </div>

          {/* Verification Stamps / Signatures */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="border-t border-zinc-300 pt-2">
              <span className="font-semibold text-zinc-700 block">Cashier / Prepared By</span>
              <span className="text-[10px] text-zinc-400">System Operator</span>
            </div>
            <div className="border-t border-zinc-300 pt-2">
              <span className="font-semibold text-zinc-700 block">Checked By</span>
              <span className="text-[10px] text-zinc-400">Accounts Department</span>
            </div>
            <div className="border-t border-zinc-300 pt-2">
              <span className="font-semibold text-zinc-700 block">Approved By</span>
              <span className="text-[10px] text-zinc-400">Principal / Director</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-zinc-400 pt-4 border-t border-zinc-100">
            This is an authentic computer-generated financial document generated by Stoofi ERP for Pak Royal College.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#009966] hover:bg-[#008055] rounded-lg transition shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
