'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  School, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Lock, 
  Zap, 
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import StoofiLogo from '@/components/StoofiLogo';
import { useAuth } from '@/hooks/useAuth';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const queryPlan = searchParams.get('plan') || 'professional';
  const queryCycle = searchParams.get('cycle') || 'monthly';
  const queryStudents = Number(searchParams.get('students')) || 150;
  const isTrialRequest = searchParams.get('trial') === 'true';

  // State
  const [selectedPlan, setSelectedPlan] = useState(queryPlan);
  const [billingCycle, setBillingCycle] = useState(queryCycle);
  const [studentCount, setStudentCount] = useState(queryStudents);

  const [schoolName, setSchoolName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loadingPay, setLoadingPay] = useState(false);
  const [loadingTrial, setLoadingTrial] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill from authenticated user if available
  useEffect(() => {
    if (user) {
      if (user.name && !adminName) setAdminName(user.name);
      if (user.email && !adminEmail) setAdminEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.schoolName && !schoolName) setSchoolName(user.schoolName);
    }
  }, [user]);

  // Plan catalog rates
  const PLAN_RATES = {
    starter: { name: 'Starter Plan', rate: 15, min: 50 },
    professional: { name: 'Professional Plan', rate: 12, min: 100 },
    enterprise: { name: 'Enterprise Plan', rate: 10, min: 200 }
  };

  const currentPlanMeta = PLAN_RATES[selectedPlan] || PLAN_RATES.professional;

  // Ensure student count meets minimum
  useEffect(() => {
    if (studentCount < currentPlanMeta.min) {
      setStudentCount(currentPlanMeta.min);
    }
  }, [selectedPlan]);

  // Calculation
  const priceCalculation = useMemo(() => {
    const effectiveStudents = Math.max(Number(studentCount) || currentPlanMeta.min, currentPlanMeta.min);
    const rate = currentPlanMeta.rate;
    const monthlyBase = effectiveStudents * rate;

    if (billingCycle === 'monthly') {
      return {
        effectiveStudents,
        ratePerStudent: rate,
        monthsBilled: 1,
        subtotal: monthlyBase,
        discount: 0,
        total: monthlyBase
      };
    } else {
      // Annual: 10 months billed (2 months free)
      const subtotal = monthlyBase * 12;
      const total = monthlyBase * 10;
      const discount = subtotal - total;
      return {
        effectiveStudents,
        ratePerStudent: rate,
        monthsBilled: 12,
        subtotal,
        discount,
        total
      };
    }
  }, [selectedPlan, billingCycle, studentCount, currentPlanMeta]);

  // Validate form
  const validateInputs = () => {
    if (!schoolName.trim()) {
      setErrorMessage('Please enter your School / Institute Name.');
      return false;
    }
    if (!adminName.trim()) {
      setErrorMessage('Please enter the Administrator Full Name.');
      return false;
    }
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setErrorMessage('Please enter a valid Administrator Email Address.');
      return false;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMessage('Please enter a valid Pakistani Phone / Mobile Number (e.g. 03001234567).');
      return false;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service to proceed.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // ── 1. Pay with Safepay ───────────────────────────────────────────
  const handleSafepayCheckout = async () => {
    if (!validateInputs()) return;

    setLoadingPay(true);
    setErrorMessage('');

    try {
      const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const baseApi = rawApi.replace(/\/api\/?$/, '');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const payload = {
        planKey: selectedPlan,
        billingCycle,
        studentCount: priceCalculation.effectiveStudents,
        schoolName: schoolName.trim(),
        branchName: branchName.trim() || 'Main Campus',
        city: city.trim() || 'Pakistan',
        address: address.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        phone: phone.trim()
      };

      const res = await fetch(`${baseApi}/api/payments/checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to initialize payment session with Safepay.');
      }

      if (data.checkoutUrl) {
        // Redirect to Safepay hosted checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from payment server.');
      }
    } catch (err) {
      console.error('Safepay checkout error:', err);
      setErrorMessage(err.message || 'An error occurred while connecting to Safepay. Please try again.');
      setLoadingPay(false);
    }
  };

  // ── 2. Start Free Trial ──────────────────────────────────────────
  const handleStartFreeTrial = async () => {
    if (!validateInputs()) return;

    setLoadingTrial(true);
    setErrorMessage('');

    try {
      const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const baseApi = rawApi.replace(/\/api\/?$/, '');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const payload = {
        planKey: selectedPlan,
        billingCycle,
        studentCount: priceCalculation.effectiveStudents,
        schoolName: schoolName.trim(),
        branchName: branchName.trim() || 'Main Campus',
        city: city.trim() || 'Pakistan',
        address: address.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        phone: phone.trim()
      };

      const res = await fetch(`${baseApi}/api/payments/start-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to activate 1-Month Free Trial.');
      }

      // Route to success page
      router.push(`/payment/success?trial=true&plan=${selectedPlan}&students=${priceCalculation.effectiveStudents}`);
    } catch (err) {
      console.error('Free trial activation error:', err);
      setErrorMessage(err.message || 'Failed to start free trial. Please try again.');
      setLoadingTrial(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] dark:bg-[#090d16] dark:text-[#f1f5f9] transition-colors pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <StoofiLogo />
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Lock className="w-3.5 h-3.5" />
              <span>Safepay 256-Bit Secure SSL</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Complete Your School Registration & Subscription
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose your plan, enter your school information, and proceed with Safepay (Raast, Cards, Wallets) or start your 1-Month Free Trial.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Please check the required details:</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: School Information */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#087f77] dark:text-[#2dd4bf] flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  School / Institute Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    School / Institute Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Army Public School & College"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087f77]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Campus / Branch Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Main Campus / Gulberg"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087f77]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087f77]"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector H-8/4, Islamabad"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087f77]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Administrator Information */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#087f77] dark:text-[#2dd4bf] flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Administrator / Billing Contact
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Admin Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Prof. Tariq Mahmood"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087f77]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="principal@school.edu.pk"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087f77]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mobile / WhatsApp (Pakistan) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="03001234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087f77]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Plan & Quota Customization */}
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#087f77] dark:text-[#2dd4bf] flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Plan & Quota Selection
                </h2>
              </div>

              <div className="space-y-4 mt-5">
                {/* Plan Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'starter', name: 'Starter', rate: 'Rs. 15/mo', min: '50 min' },
                    { key: 'professional', name: 'Professional', rate: 'Rs. 12/mo', min: '100 min', badge: 'Popular' },
                    { key: 'enterprise', name: 'Enterprise', rate: 'Rs. 10/mo', min: '200 min' }
                  ].map((p) => {
                    const isSelected = selectedPlan === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setSelectedPlan(p.key)}
                        className={`relative p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#087f77] bg-emerald-50/50 dark:bg-emerald-950/30 text-slate-900 dark:text-white ring-2 ring-[#087f77]/20'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {p.badge && (
                          <span className="absolute -top-2 right-2 text-[9px] font-black uppercase bg-[#64e2bc] text-[#0c322f] px-1.5 py-0.5 rounded">
                            {p.badge}
                          </span>
                        )}
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-[11px] font-semibold text-[#087f77] dark:text-[#2dd4bf] mt-0.5">
                          {p.rate}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {p.min}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Billing Cycle Radio */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Billing Interval
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {billingCycle === 'annual' ? '12 months access with 2 months FREE' : 'Billed monthly with flexible cancellation'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        billingCycle === 'monthly'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        billingCycle === 'annual'
                          ? 'bg-[#087f77] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>Annual</span>
                      <span className="bg-emerald-300 text-emerald-950 text-[9px] font-black px-1 rounded">
                        2 Mo Free
                      </span>
                    </button>
                  </div>
                </div>

                {/* Students Quota Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Total Enrolled Students Quota
                    </label>
                    <span className="text-xs font-bold text-[#087f77]">
                      {priceCalculation.effectiveStudents} Students
                    </span>
                  </div>
                  <input
                    type="range"
                    min={currentPlanMeta.min}
                    max="2000"
                    step="10"
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#087f77]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Min: {currentPlanMeta.min}</span>
                    <span>500</span>
                    <span>1,000</span>
                    <span>2,000+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md sticky top-24">
              <h3 className="text-base font-bold text-slate-900 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  PKR Currency
                </span>
              </h3>

              {/* Line Items */}
              <div className="space-y-3.5 my-5 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Selected Plan:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {currentPlanMeta.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Student Capacity:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {priceCalculation.effectiveStudents} Students
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Rate per Student:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Rs. {priceCalculation.ratePerStudent} / mo
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Billing Interval:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {billingCycle} ({priceCalculation.monthsBilled} Months)
                  </span>
                </div>

                {billingCycle === 'annual' && priceCalculation.discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded-lg">
                    <span>Annual Discount (2 Mo Free):</span>
                    <span>- Rs. {priceCalculation.discount.toLocaleString()}</span>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-4" />

                {/* Total */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Total Payable Now
                    </div>
                    <div className="text-[11px] text-slate-400">
                      All taxes & gateway fees included
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      Rs. {priceCalculation.total.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#087f77] dark:text-[#2dd4bf] font-semibold">
                      PKR (Pakistani Rupee)
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported Payment Channels */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#087f77]" />
                    Safepay Gateway Accepted Methods:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    Visa
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    Mastercard
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    Raast Instant
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    EasyPaisa
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    JazzCash
                  </span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#087f77] focus:ring-[#087f77] cursor-pointer"
                />
                <span>
                  I agree to the <Link href="/terms" className="underline text-[#087f77]">Terms of Service</Link> and understand that payment is processed securely via Safepay.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSafepayCheckout}
                  disabled={loadingPay || loadingTrial}
                  className="w-full h-12 text-sm font-bold bg-[#087f77] hover:bg-[#06655f] text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {loadingPay ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting to Safepay...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay Rs. {priceCalculation.total.toLocaleString()} with Safepay</span>
                    </>
                  )}
                </Button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                  <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">or</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                </div>

                <Button
                  variant="outline"
                  onClick={handleStartFreeTrial}
                  disabled={loadingPay || loadingTrial}
                  className="w-full h-11 text-xs sm:text-sm font-bold border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loadingTrial ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating Trial...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Start 1-Month Free Trial (No Card Required)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#090d16]">
        <Loader2 className="w-8 h-8 animate-spin text-[#087f77]" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
