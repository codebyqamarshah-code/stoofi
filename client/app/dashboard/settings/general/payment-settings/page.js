'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function PaymentSettings() {
  const [gateways, setGateways] = useState({
    Cash: true,
    Cheque: false,
    Bank: false,
    PayPal: true,
    Stripe: false,
    Paystack: false,
    Wallet: true,
  });

  const [activeTab, setActiveTab] = useState('PAYPAL');
  
  const handleGatewayChange = (gateway) => {
    setGateways({ ...gateways, [gateway]: !gateways[gateway] });
  };

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950">
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>General Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Payment Method Settings</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Payment Method Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-fit">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-bold text-zinc-950">Select Payment Gateways</h2>
          </div>
          <div className="p-6 space-y-4">
            {Object.keys(gateways).map((gateway) => (
              <label key={gateway} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gateways[gateway]}
                  onChange={() => handleGatewayChange(gateway)}
                  className="w-4 h-4 rounded accent-zinc-950 cursor-pointer"
                />
                <span className="text-sm font-medium text-zinc-900">{gateway}</span>
              </label>
            ))}
            <div className="pt-4">
              <button className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer">
                UPDATE GATEWAYS
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-fit">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-bold text-zinc-950">Gateway Credentials</h2>
          </div>
          
          <div className="p-6">
            <div className="flex gap-2 border-b border-zinc-200 mb-6 overflow-x-auto pb-2">
              {['PAYPAL', 'STRIPE', 'PAYSTACK', 'BANK', 'CHEQUE'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {activeTab === 'PAYPAL' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">Gateway Name</label>
                  <input type="text" defaultValue="PayPal" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">Gateway Username</label>
                  <input type="text" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">Gateway Password</label>
                  <input type="password" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">Gateway Signature</label>
                  <input type="text" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">Gateway Client ID</label>
                  <input type="text" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">Gateway Mode</label>
                  <select className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600">
                    <option>Sandbox (Testing)</option>
                    <option>Live (Production)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">Gateway Secret Key</label>
                  <input type="password" className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
                </div>
                <div className="col-span-1 md:col-span-2 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-zinc-950 cursor-pointer" />
                    <span className="text-sm font-medium text-zinc-900">Enable Service Charge</span>
                  </label>
                </div>
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-zinc-200 mt-2">
                  <button className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer">
                    UPDATE CREDENTIALS
                  </button>
                </div>
              </div>
            )}
            {activeTab !== 'PAYPAL' && (
              <div className="text-zinc-500 text-sm py-8 text-center font-medium">Settings for {activeTab} will appear here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
