'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  Download, 
  Printer, 
  ArrowUpRight, 
  ShieldCheck, 
  Users, 
  Building2, 
  Calendar, 
  RefreshCcw, 
  Plus,
  Loader2,
  XCircle,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import InvoiceReceiptModal from '@/components/InvoiceReceiptModal';

export default function BillingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Active selected invoice for receipt modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Cancellation state
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const fetchBillingData = async () => {
    setLoading(true);
    setError('');

    try {
      const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const baseApi = rawApi.replace(/\/api\/?$/, '');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const [subRes, histRes] = await Promise.allSettled([
        fetch(`${baseApi}/api/payments/subscription`, { headers }),
        fetch(`${baseApi}/api/payments/history`, { headers })
      ]);

      if (subRes.status === 'fulfilled' && subRes.value.ok) {
        const subData = await subRes.value.json();
        if (subData.success) {
          setSubscription(subData.subscription);
        }
      }

      if (histRes.status === 'fulfilled' && histRes.value.ok) {
        const histData = await histRes.value.json();
        if (histData.success) {
          setPayments(histData.payments || []);
        }
      }
    } catch (err) {
      console.error('Error loading billing data:', err);
      setError('Could not load billing history. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const baseApi = rawApi.replace(/\/api\/?$/, '');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch(`${baseApi}/api/payments/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowCancelConfirm(false);
        fetchBillingData();
      } else {
        alert(data.message || 'Failed to cancel subscription.');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Error communicating with server.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleViewReceipt = (invoice) => {
    setSelectedInvoice(invoice);
    setShowReceiptModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Subscription
          </span>
        );
      case 'trialing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Free Trial Period
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            Payment Past Due
          </span>
        );
      case 'canceled':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status || 'Trial'}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Subscription & Billing
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Safepay Gateway
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your school SaaS plan, student capacity quota, renewal billing, and printable invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/pricing">
            <Button variant="outline" className="text-xs font-semibold h-9 rounded-lg border-slate-300 dark:border-slate-700">
              View All Plans
            </Button>
          </Link>
          <Link href={`/checkout?plan=${subscription?.plan || 'professional'}&students=${subscription?.studentQuota || 150}`}>
            <Button className="bg-[#087f77] hover:bg-[#06655f] text-white text-xs font-bold h-9 rounded-lg shadow-sm flex items-center gap-1.5">
              <span>Upgrade / Renew Plan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#087f77] mb-3" />
          <span className="text-xs font-medium">Loading subscription details...</span>
        </div>
      ) : (
        <>
          {/* Top Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Current Plan */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Plan
                </span>
                <CreditCard className="w-5 h-5 text-[#087f77]" />
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white capitalize">
                  {subscription?.plan || 'Professional'} Plan
                </span>
              </div>

              <div className="mt-2 mb-4">
                {getStatusBadge(subscription?.status || 'trialing')}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>Billing Interval:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {subscription?.billingCycle || 'Monthly'}
                </span>
              </div>
            </div>

            {/* Card 2: Student Quota */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Student Quota Capacity
                </span>
                <Users className="w-5 h-5 text-emerald-500" />
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {subscription?.studentQuota || 150}
                </span>
                <span className="text-xs text-slate-400">Students Allowed</span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 mb-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[45%]" />
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2">
                <span>Enrolled Active:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Active in ERP
                </span>
              </div>
            </div>

            {/* Card 3: Renewal / Expiry */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Next Renewal / Expiry
                </span>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>

              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {subscription?.currentPeriodEnd 
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
                  : new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4">
                {subscription?.status === 'trialing' ? 'Free trial ends on this date' : 'Recurring renewal through Safepay'}
              </p>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>Auto-Renew:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {subscription?.status === 'active' ? 'Enabled' : 'Off'}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Action & Upgrade Banner */}
          <div className="bg-gradient-to-r from-[#0c2436] to-[#123854] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#64e2bc]/20 text-[#64e2bc] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom School Quota Scaling</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Need to add more students or upgrade your plan?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Scale your student quota anytime. Our per-student pricing automatically adjusts with instant Safepay confirmation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href={`/checkout?plan=${subscription?.plan || 'professional'}&students=${(subscription?.studentQuota || 100) + 50}`}>
                <Button className="bg-[#64e2bc] hover:bg-[#85edce] text-[#0c322f] font-bold text-xs sm:text-sm h-11 px-5 rounded-xl shadow-md">
                  Scale Student Quota
                </Button>
              </Link>

              {subscription && subscription.status === 'active' && (
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(true)}
                  className="border-slate-600 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold h-11 px-4 rounded-xl"
                >
                  Cancel Plan
                </Button>
              )}
            </div>
          </div>

          {/* Payment & Invoice History Table */}
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Payment & Invoice History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official GST-compliant receipts and transaction records processed via Safepay.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchBillingData}
                className="text-xs font-semibold h-8 border-slate-200 dark:border-slate-700"
              >
                <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Refresh
              </Button>
            </div>

            {payments.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Receipt className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  No payment records found
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When you complete a subscription payment through Safepay, your official receipt will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Invoice #</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Plan & Quota</th>
                      <th className="px-6 py-3.5">Amount (PKR)</th>
                      <th className="px-6 py-3.5">Payment Method</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {payments.map((item) => (
                      <tr key={item._id || item.invoiceNumber} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                          {item.invoiceNumber || 'INV-0000'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(item.createdAt || Date.now()).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold capitalize text-slate-900 dark:text-white">
                            {item.plan} Plan
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {item.studentCount} Students ({item.billingCycle || 'monthly'})
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          Rs. {item.amount?.toLocaleString()} PKR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                            {item.paymentMethod || 'Safepay'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.status === 'completed' || item.status === 'paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : item.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span className="capitalize">{item.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReceipt(item)}
                            className="text-xs font-bold text-[#087f77] dark:text-[#2dd4bf] hover:bg-emerald-50 dark:hover:bg-emerald-950/50 h-8 px-3 rounded-lg"
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1.5" />
                            <span>View Receipt</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Cancel Stoofi Subscription?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Your subscription will remain active until the end of the current billing cycle. After that, your school will be switched to view-only mode.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowCancelConfirm(false)}
                className="text-xs font-semibold"
              >
                Keep Subscription
              </Button>
              <Button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}
