'use client';

import React, { useState } from 'react';

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
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <h1 className="text-2xl font-semibold mb-6">Payment Method Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-4 bg-white border border-zinc-200 shadow-xs rounded-lg overflow-hidden shadow-sm h-fit">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-lg font-medium">Select A Payment Gateway</h2>
          </div>
          <div className="p-6 space-y-4">
            {Object.keys(gateways).map((gateway) => (
              <label key={gateway} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gateways[gateway]}
                  onChange={() => handleGatewayChange(gateway)}
                  className="w-4 h-4 rounded border-zinc-200 text-zinc-800 focus:ring-zinc-600 bg-zinc-800 cursor-pointer accent-zinc-800"
                />
                <span className="text-sm text-zinc-950">{gateway}</span>
              </label>
            ))}
            <div className="pt-4">
              <button className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 px-4 py-2 rounded text-sm transition-colors">
                UPDATE
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-zinc-200 shadow-xs rounded-lg overflow-hidden shadow-sm h-fit">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h2 className="text-lg font-medium">Gateway Setting</h2>
          </div>
          
          <div className="p-6">
            <div className="flex gap-4 border-b border-zinc-200 mb-6 overflow-x-auto pb-2">
              {['PAYPAL', 'STRIPE', 'PAYSTACK', 'BANK', 'CHEQUE'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab ? 'border-zinc-600 text-zinc-600' : 'border-transparent text-zinc-400 hover:text-zinc-950'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {activeTab === 'PAYPAL' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-950 mb-1">Gateway Name</label>
                  <input type="text" defaultValue="PayPal" className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-950 mb-1">Gateway Username</label>
                  <input type="text" className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-950 mb-1">Gateway Password</label>
                  <input type="password" className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-950 mb-1">Gateway Signature</label>
                  <input type="text" className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-950 mb-1">Gateway Client ID</label>
                  <input type="text" className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-950 mb-1">Gateway Mode</label>
                  <select className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600">
                    <option>Sandbox</option>
                    <option>Live</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-950 mb-1">Gateway Secret Key</label>
                  <input type="password" className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600" />
                </div>
                <div className="col-span-1 md:col-span-2 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-zinc-200 text-zinc-800 focus:ring-zinc-600 bg-white cursor-pointer accent-zinc-800" />
                    <span className="text-sm text-zinc-950">Service Charge</span>
                  </label>
                </div>
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-zinc-200 mt-2">
                  <button className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 px-6 py-2 rounded text-sm transition-colors">
                    UPDATE
                  </button>
                </div>
              </div>
            )}
            {activeTab !== 'PAYPAL' && (
              <div className="text-zinc-700 text-sm py-8 text-center">Settings for {activeTab} will appear here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
