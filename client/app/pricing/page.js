'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  School, 
  Users, 
  CreditCard, 
  Check, 
  ChevronRight,
  Calculator,
  Lock,
  Headphones,
  FileSpreadsheet,
  Award,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import StoofiLogo from '@/components/StoofiLogo';
import { useAuth } from '@/hooks/useAuth';

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [studentCount, setStudentCount] = useState(150);
  const [openFaq, setOpenFaq] = useState(null);

  // Pricing constants (PKR)
  const PLANS = [
    {
      key: 'starter',
      name: 'Starter Plan',
      tagline: 'Ideal for small schools & growing academies',
      ratePerStudent: 15,
      minStudents: 50,
      featured: false,
      badge: 'Getting Started',
      color: 'blue',
      features: [
        'Up to 300 Students capacity',
        'Student & Teacher Portals',
        'Daily Attendance & SMS Alerts',
        'Fee Invoicing & Receipt Generator',
        'ID Card & Certificate Printing',
        'Standard Email & Chat Support'
      ],
      notIncluded: [
        'LMS & Online Exams',
        'Virtual Live Classrooms',
        'Custom Domain & School Branding'
      ]
    },
    {
      key: 'professional',
      name: 'Professional Plan',
      tagline: 'Comprehensive ERP for modern high schools & colleges',
      ratePerStudent: 12,
      minStudents: 100,
      featured: true,
      badge: 'Most Popular 🎉',
      color: 'emerald',
      features: [
        'Up to 1,500 Students capacity',
        'All 5 Specialized Portals (Admin, Teacher, Student, Parent, Staff)',
        'Automated Fee Management & Raast / Cards Checkout',
        'Full LMS, Homework & Exam Grading System',
        'Virtual Classroom (Jitsi, Google Meet & BigBlueButton)',
        'Custom Certificate & ID Card Template Builder',
        'Priority Phone, WhatsApp & Email Support'
      ],
      notIncluded: [
        'Multi-Campus Central Management'
      ]
    },
    {
      key: 'enterprise',
      name: 'Enterprise Plan',
      tagline: 'For large educational institutions & multi-branch chains',
      ratePerStudent: 10,
      minStudents: 200,
      featured: false,
      badge: 'Best Value',
      color: 'purple',
      features: [
        'Unlimited Students capacity',
        'Multi-Branch & Campus Central Dashboard',
        'Custom School Domain (e.g. portal.yourschool.edu.pk)',
        'Full White-labeling with Custom Logo & Theme',
        'Automated Database Backups & Export APIs',
        'Dedicated Account Manager & 24/7 Priority SLA',
        'On-site or Remote Staff Training Sessions'
      ],
      notIncluded: []
    }
  ];

  // Calculate pricing for a given plan
  const getPlanPrice = (plan) => {
    const effectiveStudents = Math.max(studentCount, plan.minStudents);
    if (billingCycle === 'monthly') {
      const monthlyTotal = effectiveStudents * plan.ratePerStudent;
      return {
        monthlyTotal,
        displayTotal: monthlyTotal,
        perMonthEquivalent: monthlyTotal,
        savings: 0,
        monthsBilled: 1,
        effectiveStudents
      };
    } else {
      // Annual: 2 months free (pay for 10 months)
      const annualTotal = effectiveStudents * plan.ratePerStudent * 10;
      const originalAnnual = effectiveStudents * plan.ratePerStudent * 12;
      const perMonthEquivalent = Math.round(annualTotal / 12);
      const savings = originalAnnual - annualTotal;
      return {
        annualTotal,
        displayTotal: annualTotal,
        perMonthEquivalent,
        savings,
        monthsBilled: 12,
        effectiveStudents
      };
    }
  };

  const handleSelectPlan = (planKey) => {
    router.push(`/checkout?plan=${planKey}&cycle=${billingCycle}&students=${studentCount}`);
  };

  const faqs = [
    {
      q: 'Which payment methods are accepted in Pakistan?',
      a: 'Through our official Safepay integration, we support Pakistani Debit/Credit cards (Visa, Mastercard, PayPak), Raast instant inter-bank payments, EasyPaisa, JazzCash, and direct online bank transfers in PKR.'
    },
    {
      q: 'How does the 1-Month Free Trial work?',
      a: 'You get complete access to all Stoofi features for 30 days without any upfront charges or credit card required. You can upgrade anytime or switch to a paid plan seamlessly when you are ready.'
    },
    {
      q: 'How does per-student pricing work if my student count changes?',
      a: 'Stoofi gives you full flexibility. You can adjust your student quota anytime from your Dashboard Billing settings. Upgrades take effect immediately with pro-rated billing.'
    },
    {
      q: 'What is the discount on Annual Billing?',
      a: 'When you choose Annual Billing, you get 2 Months completely FREE! You only pay for 10 months and receive a full 12-month subscription.'
    },
    {
      q: 'Do I get an official tax invoice and receipt for my school accounts?',
      a: 'Yes! Instant downloadable and printable GST-compliant invoices with unique invoice numbers and payment verification timestamps are available in your billing portal.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] dark:bg-[#090d16] dark:text-[#f1f5f9] transition-colors">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <StoofiLogo />
          </Link>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-[#087f77] hover:bg-[#06655f] text-white text-xs sm:text-sm font-semibold rounded-lg px-4 h-9">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-xs sm:text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/checkout?plan=professional&cycle=monthly&students=100">
                  <Button className="bg-[#087f77] hover:bg-[#06655f] text-white text-xs sm:text-sm font-semibold rounded-lg px-4 h-9">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pay Per Student • Fair & Transparent Pricing for Pakistan</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Flexible Plans Built for <span className="text-[#087f77] dark:text-[#2dd4bf]">Schools of Every Size</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Start with a 1-month free trial. Pay only for the active students you enroll, with local Pakistani payments via Safepay, Raast & Wallets.
        </p>

        {/* Interactive Student Calculator & Billing Switcher */}
        <div className="mt-10 bg-white dark:bg-[#131b2e] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#087f77]" />
                Estimated Number of Students
              </label>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {studentCount.toLocaleString()} <span className="text-xs font-medium text-slate-500">Students</span>
              </div>
            </div>

            {/* Billing Cycle Switch */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-[#087f77] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Annual</span>
                <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  2 Mo FREE
                </span>
              </button>
            </div>
          </div>

          {/* Range Slider */}
          <div className="pt-6">
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#087f77]"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2">
              <span>50 Students</span>
              <span>500 Students</span>
              <span>1,000 Students</span>
              <span>2,000+ Students</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            const pricing = getPlanPrice(plan);
            const isFeatured = plan.featured;

            return (
              <div
                key={plan.key}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? 'bg-[#0c2436] text-white shadow-2xl border-2 border-[#64e2bc] ring-4 ring-[#64e2bc]/10 lg:-translate-y-2'
                    : 'bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#64e2bc] text-[#0c322f] text-[11px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-xl font-bold ${isFeatured ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {plan.name}
                    </h3>
                    {!isFeatured && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs min-h-[32px] ${isFeatured ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {plan.tagline}
                  </p>

                  {/* Price display */}
                  <div className="my-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black tracking-tight ${isFeatured ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        Rs. {pricing.perMonthEquivalent.toLocaleString()}
                      </span>
                      <span className={`text-xs ${isFeatured ? 'text-slate-300' : 'text-slate-500'}`}>
                        /month
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold space-y-1">
                      <div className={isFeatured ? 'text-emerald-300' : 'text-[#087f77] dark:text-[#2dd4bf]'}>
                        Rs. {plan.ratePerStudent} / student / month ({pricing.effectiveStudents} students)
                      </div>
                      {billingCycle === 'annual' && (
                        <div className="text-[11px] text-amber-500 dark:text-amber-400 font-medium">
                          Billed annually: Rs. {pricing.displayTotal.toLocaleString()} (Saved Rs. {pricing.savings.toLocaleString()})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <div className={`text-xs font-bold uppercase tracking-wider ${isFeatured ? 'text-slate-300' : 'text-slate-400'}`}>
                      What's Included:
                    </div>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isFeatured ? 'text-[#64e2bc]' : 'text-[#087f77]'}`} />
                        <span className={isFeatured ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Actions */}
                <div className="space-y-2.5 pt-4">
                  <Button
                    onClick={() => handleSelectPlan(plan.key)}
                    className={`w-full h-11 font-bold text-sm rounded-xl transition-all ${
                      isFeatured
                        ? 'bg-[#64e2bc] hover:bg-[#85edce] text-[#0c322f] shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                        : 'bg-[#087f77] hover:bg-[#06655f] text-white'
                    }`}
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  <button
                    type="button"
                    onClick={() => router.push(`/checkout?plan=${plan.key}&cycle=${billingCycle}&students=${studentCount}&trial=true`)}
                    className={`w-full py-2 text-xs font-semibold text-center rounded-lg transition-colors ${
                      isFeatured
                        ? 'text-slate-300 hover:text-white hover:bg-white/10'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Or Start 1-Month Free Trial
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment Security & Trust Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 my-12">
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                100% Secure Checkout with Safepay Pakistan
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bank-grade 256-bit encryption. Pay via Raast, Debit/Credit cards, or Mobile Wallets with instant activation.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold text-slate-400">Supported Channels:</span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Raast
              </span>
              <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Visa / Master
              </span>
              <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                EasyPaisa
              </span>
              <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                JazzCash
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Everything you need to know about Stoofi pricing, billing, and trial.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#131b2e] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <span className={`text-slate-400 transition-transform duration-200 text-lg font-bold ${openFaq === index ? 'rotate-45 text-[#087f77]' : ''}`}>
                  +
                </span>
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Stoofi Educational ERP. All rights reserved. Powered by Safepay Payment Gateway.</p>
      </footer>
    </div>
  );
}
