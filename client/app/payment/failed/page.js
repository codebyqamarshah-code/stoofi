'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  AlertOctagon, 
  RefreshCcw, 
  Sparkles, 
  Headphones, 
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StoofiLogo from '@/components/StoofiLogo';

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-[#0f172a] dark:text-[#f1f5f9] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <StoofiLogo />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/pricing">
              <Button variant="ghost" className="text-xs font-semibold">
                Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Card */}
      <main className="max-w-xl mx-auto px-4 py-16 w-full">
        <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-5">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 block mb-1">
            TRANSACTION FAILED
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Payment Could Not Be Processed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            Your bank or payment provider declined the transaction. No charges were made.
          </p>

          <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
            <div className="font-bold text-slate-700 dark:text-slate-300">
              Common reasons for payment issues in Pakistan:
            </div>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>• Internet / E-Commerce transactions might be disabled on your bank card.</li>
              <li>• Daily transaction limit exceeded or insufficient account balance.</li>
              <li>• OTP verification timed out.</li>
              <li>• We suggest trying <strong>Raast Instant Pay</strong> or <strong>EasyPaisa / JazzCash</strong>.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/checkout')}
              className="w-full h-11 bg-[#087f77] hover:bg-[#06655f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Retry Payment with Another Method</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/checkout?trial=true')}
              className="w-full h-11 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Activate 1-Month Free Trial Instead</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Stoofi Educational ERP. All rights reserved.</p>
      </footer>
    </div>
  );
}
