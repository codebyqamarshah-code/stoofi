'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Printer, 
  Download, 
  ShieldCheck, 
  Calendar, 
  Building, 
  User, 
  CreditCard,
  Layers,
  Loader2,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StoofiLogo from '@/components/StoofiLogo';
import InvoiceReceiptModal from '@/components/InvoiceReceiptModal';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isTrial = searchParams.get('trial') === 'true';
  const orderId = searchParams.get('order_id');
  const tracker = searchParams.get('tracker');
  const sig = searchParams.get('sig');
  const planParam = searchParams.get('plan');
  const studentsParam = searchParams.get('students');

  const [verifying, setVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    const verifyTransaction = async () => {
      // If it's a direct free trial activation
      if (isTrial) {
        setVerifying(false);
        setSubscriptionData({
          plan: planParam || 'professional',
          status: 'trialing',
          studentQuota: Number(studentsParam) || 100,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
        return;
      }

      // Safepay redirect with order_id and tracker
      try {
        const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const baseApi = rawApi.replace(/\/api\/?$/, '');
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const res = await fetch(`${baseApi}/api/payments/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            orderId: orderId || tracker,
            tracker,
            sig
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setPaymentData(data.payment);
          setSubscriptionData(data.subscription);
        } else {
          // If verification has already succeeded or returned a mild response
          if (data.payment) {
            setPaymentData(data.payment);
            setSubscriptionData(data.subscription);
          } else {
            setErrorMessage(data.message || 'Payment received. Your subscription is being activated.');
          }
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setErrorMessage('Your payment was received and is processing. You can check your status in Billing settings.');
      } finally {
        setVerifying(false);
      }
    };

    verifyTransaction();
  }, [isTrial, orderId, tracker, sig, planParam, studentsParam]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-[#0f172a] dark:text-[#f1f5f9] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <StoofiLogo />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button className="bg-[#087f77] hover:bg-[#06655f] text-white text-xs font-semibold rounded-lg px-4 h-9">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Success Content */}
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16 w-full">
        {verifying ? (
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center shadow-lg">
            <Loader2 className="w-10 h-10 text-[#087f77] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Verifying Your Payment with Safepay...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Please wait while we confirm your transaction and activate your school subscription.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
            {/* Top Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#087f77] via-[#64e2bc] to-[#087f77]" />

            {/* Header Icon */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-sm animate-in zoom-in">
                {isTrial ? <Sparkles className="w-8 h-8 text-emerald-500" /> : <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-[#087f77] dark:text-[#2dd4bf] block mb-1">
                {isTrial ? 'TRIAL ACTIVATED' : 'PAYMENT SUCCESSFUL'}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {isTrial ? 'Welcome to Your 30-Day Free Trial!' : 'Thank You for Subscribing to Stoofi!'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                {isTrial 
                  ? 'Your school account is fully activated with unlimited feature access for the next 30 days.'
                  : 'Your payment has been verified successfully and your school subscription is now active.'
                }
              </p>
            </div>

            {/* Summary Details Card */}
            <div className="bg-slate-50 dark:bg-slate-900/70 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 mb-8 text-xs sm:text-sm space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Subscription Status:</span>
                <span className="font-bold text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 capitalize">
                  {subscriptionData?.status || (isTrial ? 'Trialing (Active)' : 'Active')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Plan:</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">
                  {paymentData?.plan || subscriptionData?.plan || planParam || 'Professional'} Plan
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Student Capacity:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {paymentData?.studentCount || subscriptionData?.studentQuota || studentsParam || 100} Students
                </span>
              </div>

              {!isTrial && paymentData && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Invoice Number:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {paymentData.invoiceNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Amount Paid:</span>
                    <span className="font-black text-slate-900 dark:text-white text-base">
                      Rs. {paymentData.amount?.toLocaleString()} PKR
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Payment Gateway:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Safepay Pakistan ({paymentData.paymentMethod || 'Online Gateway'})
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <span className="text-slate-500">Valid Until / Renewal:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {new Date(subscriptionData?.currentPeriodEnd || Date.now() + 30 * 86400000).toLocaleDateString('en-PK', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              {!isTrial && paymentData && (
                <Button
                  onClick={() => setShowReceiptModal(true)}
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-5 border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                >
                  <Receipt className="w-4 h-4 text-[#087f77]" />
                  <span>View & Print Official Receipt</span>
                </Button>
              )}

              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto h-11 px-7 bg-[#087f77] hover:bg-[#06655f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>Enter School Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      {paymentData && (
        <InvoiceReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          invoice={paymentData}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Stoofi Educational ERP. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#090d16]">
        <Loader2 className="w-8 h-8 animate-spin text-[#087f77]" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
