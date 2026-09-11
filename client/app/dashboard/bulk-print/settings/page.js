'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function FeesInvoiceBulkPrintSettingsPage() {
  const [invoiceType, setInvoiceType] = useState('Invoice');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Fees Invoice Settings</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Bulk Print</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">Fees Invoice Settings</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 text-center">
          <h2 className="text-base font-semibold text-white">Fees invoice Settings</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Label className="text-xs font-semibold text-zinc-400 uppercase w-32 shrink-0">Invoice Type</Label>
            <div className="flex items-center gap-8">
              {['Invoice', 'Slip'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setInvoiceType(type)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                      invoiceType === type
                        ? 'border-zinc-600 bg-zinc-600'
                        : 'border-zinc-500 bg-transparent'
                    }`}
                  >
                    {invoiceType === type && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-zinc-300 font-medium">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button className="bg-zinc-800 hover:bg-zinc-800 text-white font-semibold px-8">
              UPDATE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
