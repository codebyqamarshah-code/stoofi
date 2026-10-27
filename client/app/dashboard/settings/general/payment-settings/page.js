'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Save, CheckCircle2, Loader2, Wallet, CreditCard, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const DEFAULT_GATEWAYS = {
  Cash: true,
  Bank: true,
  JazzCash: true,
  EasyPaisa: true,
  Safepay: true,
  Stripe: false,
  PayPal: false,
  Wallet: true,
};

export default function PaymentSettings() {
  const [gateways, setGateways] = useState(DEFAULT_GATEWAYS);
  const [activeTab, setActiveTab] = useState('BANK');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [credentials, setCredentials] = useState({
    bankDetails: {
      bankName: 'Habib Bank Limited (HBL)',
      accountTitle: 'Pak Royal College Sharaqpur',
      accountNumber: '01234567890123',
      iban: 'PK36HABB0000123456789012',
      branchCode: '0452',
      branchName: 'Main Bazaar Sharaqpur'
    },
    jazzcashDetails: {
      merchantId: '',
      password: '',
      integritySalt: '',
      returnUrl: 'https://pakroyalcollege.edu.pk/api/payments/jazzcash/callback'
    },
    easypaisaDetails: {
      storeId: '',
      hashKey: '',
      accountNumber: ''
    },
    safepayDetails: {
      apiKey: process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY || 'sec_755ace99-7963-4c35-82c5-858caebfd0c0',
      environment: 'sandbox'
    },
    paypalDetails: {
      clientId: '',
      secret: '',
      mode: 'sandbox'
    },
    stripeDetails: {
      publishableKey: '',
      secretKey: ''
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/setting');
      if (res?.success && res.data?.paymentSettings) {
        const p = res.data.paymentSettings;
        if (p.gateways) setGateways(p.gateways);
        setCredentials(prev => ({
          bankDetails: { ...prev.bankDetails, ...(p.bankDetails || {}) },
          jazzcashDetails: { ...prev.jazzcashDetails, ...(p.jazzcashDetails || {}) },
          easypaisaDetails: { ...prev.easypaisaDetails, ...(p.easypaisaDetails || {}) },
          safepayDetails: { ...prev.safepayDetails, ...(p.safepayDetails || {}) },
          paypalDetails: { ...prev.paypalDetails, ...(p.paypalDetails || {}) },
          stripeDetails: { ...prev.stripeDetails, ...(p.stripeDetails || {}) }
        }));
      }
    } catch (e) {
      console.error('Failed to load payment settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      const payload = {
        paymentSettings: {
          gateways,
          ...credentials
        }
      };
      const res = await api.put('/setting', payload);
      if (res?.success) {
        setSuccessMsg('Payment Gateways and credentials updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3500);
      } else {
        alert(res?.message || 'Failed to save payment settings');
      }
    } catch (err) {
      console.error('Save payment settings error:', err);
      alert('Error saving payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGatewayToggle = (gateway) => {
    setGateways(prev => ({ ...prev, [gateway]: !prev[gateway] }));
  };

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950">
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>General Settings</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-950 font-bold">Payment Method Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950">Fee Collection & Online Payment Gateways</h1>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold flex items-center gap-2 shadow-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving...' : 'Save Payment Gateways'}</span>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading payment gateway settings...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Active Gateways */}
          <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-fit">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950">Active Gateways</h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {Object.values(gateways).filter(Boolean).length} Active
              </span>
            </div>
            <div className="p-6 space-y-3.5">
              {Object.keys(gateways).map((gateway) => (
                <label key={gateway} className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/80 transition-colors cursor-pointer">
                  <span className="text-xs font-bold text-zinc-900">{gateway}</span>
                  <input
                    type="checkbox"
                    checked={!!gateways[gateway]}
                    onChange={() => handleGatewayToggle(gateway)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </label>
              ))}
              <div className="pt-3">
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg shadow-sm"
                >
                  {saving ? 'Updating...' : 'APPLY ACTIVE GATEWAYS'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel: Gateway Credentials */}
          <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-fit">
            <div className="px-6 py-4 border-b border-zinc-200">
              <h2 className="text-sm font-bold text-zinc-950">Gateway Credentials & Bank Instructions</h2>
            </div>
            
            <div className="p-6">
              <div className="flex gap-2 border-b border-zinc-200 mb-6 overflow-x-auto pb-2">
                {['BANK', 'JAZZCASH', 'EASYPAISA', 'SAFEPAY', 'STRIPE', 'PAYPAL'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === tab ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              {activeTab === 'BANK' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">BANK NAME *</label>
                      <input
                        type="text"
                        value={credentials.bankDetails.bankName}
                        onChange={(e) => setCredentials({ ...credentials, bankDetails: { ...credentials.bankDetails, bankName: e.target.value } })}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">ACCOUNT TITLE / BENEFICIARY *</label>
                      <input
                        type="text"
                        value={credentials.bankDetails.accountTitle}
                        onChange={(e) => setCredentials({ ...credentials, bankDetails: { ...credentials.bankDetails, accountTitle: e.target.value } })}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">ACCOUNT NUMBER *</label>
                      <input
                        type="text"
                        value={credentials.bankDetails.accountNumber}
                        onChange={(e) => setCredentials({ ...credentials, bankDetails: { ...credentials.bankDetails, accountNumber: e.target.value } })}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-zinc-950 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">IBAN NUMBER (24 DIGITS)</label>
                      <input
                        type="text"
                        value={credentials.bankDetails.iban}
                        onChange={(e) => setCredentials({ ...credentials, bankDetails: { ...credentials.bankDetails, iban: e.target.value } })}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-zinc-950 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'JAZZCASH' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">JAZZCASH MERCHANT ID</label>
                      <input
                        type="text"
                        value={credentials.jazzcashDetails.merchantId}
                        onChange={(e) => setCredentials({ ...credentials, jazzcashDetails: { ...credentials.jazzcashDetails, merchantId: e.target.value } })}
                        placeholder="MC12345"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">PASSWORD</label>
                      <input
                        type="password"
                        value={credentials.jazzcashDetails.password}
                        onChange={(e) => setCredentials({ ...credentials, jazzcashDetails: { ...credentials.jazzcashDetails, password: e.target.value } })}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">INTEGRITY SALT / HASH KEY</label>
                    <input
                      type="password"
                      value={credentials.jazzcashDetails.integritySalt}
                      onChange={(e) => setCredentials({ ...credentials, jazzcashDetails: { ...credentials.jazzcashDetails, integritySalt: e.target.value } })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'EASYPAISA' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">EASYPAISA STORE ID</label>
                      <input
                        type="text"
                        value={credentials.easypaisaDetails.storeId}
                        onChange={(e) => setCredentials({ ...credentials, easypaisaDetails: { ...credentials.easypaisaDetails, storeId: e.target.value } })}
                        placeholder="12345"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">EASYPAISA WALLET NUMBER</label>
                      <input
                        type="text"
                        value={credentials.easypaisaDetails.accountNumber}
                        onChange={(e) => setCredentials({ ...credentials, easypaisaDetails: { ...credentials.easypaisaDetails, accountNumber: e.target.value } })}
                        placeholder="03xxxxxxxx"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">SECRET HASH KEY</label>
                    <input
                      type="password"
                      value={credentials.easypaisaDetails.hashKey}
                      onChange={(e) => setCredentials({ ...credentials, easypaisaDetails: { ...credentials.easypaisaDetails, hashKey: e.target.value } })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'SAFEPAY' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">SAFEPAY PUBLIC KEY</label>
                    <input
                      type="text"
                      value={credentials.safepayDetails.apiKey}
                      onChange={(e) => setCredentials({ ...credentials, safepayDetails: { ...credentials.safepayDetails, apiKey: e.target.value } })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">ENVIRONMENT</label>
                    <select
                      value={credentials.safepayDetails.environment}
                      onChange={(e) => setCredentials({ ...credentials, safepayDetails: { ...credentials.safepayDetails, environment: e.target.value } })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:border-zinc-900"
                    >
                      <option value="sandbox">Sandbox (Testing)</option>
                      <option value="production">Production (Live)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'STRIPE' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">STRIPE PUBLISHABLE KEY</label>
                    <input
                      type="text"
                      value={credentials.stripeDetails.publishableKey}
                      onChange={(e) => setCredentials({ ...credentials, stripeDetails: { ...credentials.stripeDetails, publishableKey: e.target.value } })}
                      placeholder="pk_live_..."
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">STRIPE SECRET KEY</label>
                    <input
                      type="password"
                      value={credentials.stripeDetails.secretKey}
                      onChange={(e) => setCredentials({ ...credentials, stripeDetails: { ...credentials.stripeDetails, secretKey: e.target.value } })}
                      placeholder="sk_live_..."
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'PAYPAL' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">PAYPAL CLIENT ID</label>
                    <input
                      type="text"
                      value={credentials.paypalDetails.clientId}
                      onChange={(e) => setCredentials({ ...credentials, paypalDetails: { ...credentials.paypalDetails, clientId: e.target.value } })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">PAYPAL SECRET KEY</label>
                    <input
                      type="password"
                      value={credentials.paypalDetails.secret}
                      onChange={(e) => setCredentials({ ...credentials, paypalDetails: { ...credentials.paypalDetails, secret: e.target.value } })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono text-zinc-950 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-sm"
                >
                  {saving ? 'Updating...' : 'SAVE GATEWAY CREDENTIALS'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
