'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Building,
  Upload,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const DEFAULT_CATEGORIES = [
  'Electricity',
  'Water',
  'Internet',
  'Stationery',
  'Maintenance',
  'Transportation',
  'Cleaning',
  'Furniture',
  'Laboratory',
  'Events',
  'Other'
];

export default function AddExpensePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    categoryName: 'Electricity',
    amount: '',
    paymentMethod: 'Cash',
    date: new Date().toISOString().slice(0, 10),
    payeeName: '',
    invoiceNo: '',
    referenceNo: '',
    description: '',
    attachment: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Expense title is required');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/expense', {
        ...formData,
        amount: Number(formData.amount)
      });

      if (res?.success) {
        router.push('/dashboard/accountant/expenses');
      } else {
        setErrorMsg(res?.message || 'Failed to record expense');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while saving expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/accountant/expenses')}
          className="h-10 w-10 p-0 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Record New Institutional Expense
          </h1>
          <p className="text-sm text-zinc-500">Record bill payments, repairs, vendor purchases, and operational outflows.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-rose-600" />
            Expense Particulars & Disbursement Voucher
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Expense Title / Head *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WAPDA Electricity Bill - Campus Block A"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Expense Category *
                </label>
                <select
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-medium"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Amount Disbursed (PKR) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Amount in PKR"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-black text-rose-600 text-base"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-medium"
                >
                  <option value="Cash">Cash in Safe</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Online Payment">Online / Card</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Disbursement Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Vendor / Supplier / Recipient
                </label>
                <input
                  type="text"
                  placeholder="e.g. LESCO, Local Stationers, Allied Hardware..."
                  value={formData.payeeName}
                  onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Vendor Invoice / Bill Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-9821 or Consumer No."
                  value={formData.invoiceNo}
                  onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Description / Purpose
              </label>
              <textarea
                rows={3}
                placeholder="Provide detailed breakdown or notes regarding this expense..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/accountant/expenses')}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 px-6"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Record Expense
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
