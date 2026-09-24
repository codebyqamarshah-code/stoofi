'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { ShieldAlert, CreditCard, Building, Smartphone, CheckCircle, LogOut } from 'lucide-react';

export default function SubscriptionExpired() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('jazzcash');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/payment', {
        method: activeTab,
        amount: 5000,
        trxId
      });
      
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          // Force a full reload to fetch fresh user data and clear the router cache
          window.location.href = '/dashboard/student';
        }, 2000);
      } else {
        setError(res.data.message || 'Payment verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-zinc-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Payment Successful!</h1>
          <p className="text-zinc-600 mb-6">Your Premium plan has been activated. Redirecting you to the dashboard...</p>
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-zinc-100 flex flex-col md:flex-row">
        
        {/* Left Side: Info */}
        <div className="bg-zinc-900 p-8 text-white md:w-5/12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="h-8 w-8 text-rose-500" />
              <h1 className="text-xl font-bold">Access Locked</h1>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">
              Your Free Trial has Expired
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              Hi {user?.name || 'Student'}, your 1-month free trial period has concluded. To regain full access to your dashboard, assignments, and records, please upgrade to the Premium Plan.
            </p>
            
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
              <div className="text-sm text-zinc-400 mb-1">Premium Plan</div>
              <div className="text-3xl font-bold">Rs 5,000<span className="text-sm font-normal text-zinc-500"> / month</span></div>
            </div>
          </div>

          <button 
            onClick={() => logout()} 
            className="flex items-center gap-2 text-zinc-400 hover:text-white mt-8 text-sm transition-colors w-fit"
          >
            <LogOut className="h-4 w-4" /> Logout instead
          </button>
        </div>

        {/* Right Side: Payment Form */}
        <div className="p-8 md:w-7/12">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Select Payment Method</h3>
          
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('jazzcash')}
              className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all ${
                activeTab === 'jazzcash' 
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' 
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Smartphone className="h-5 w-5" />
              JazzCash
            </button>
            <button
              onClick={() => setActiveTab('easypaisa')}
              className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all ${
                activeTab === 'easypaisa' 
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-md' 
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Smartphone className="h-5 w-5" />
              EasyPaisa
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all ${
                activeTab === 'bank' 
                  ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Building className="h-5 w-5" />
              Bank Transfer
            </button>
          </div>

          <div className="bg-zinc-50 rounded-xl p-5 mb-6 border border-zinc-200">
            {activeTab === 'jazzcash' && (
              <div className="text-sm text-zinc-700">
                <p className="mb-2">Send <strong>Rs 5,000</strong> to the following JazzCash Account:</p>
                <div className="font-mono bg-white p-2 rounded border font-bold text-lg text-center mb-2">0300-1234567</div>
                <p className="text-xs text-zinc-500 text-center">Account Title: Stoofi ERP</p>
              </div>
            )}
            {activeTab === 'easypaisa' && (
              <div className="text-sm text-zinc-700">
                <p className="mb-2">Send <strong>Rs 5,000</strong> to the following EasyPaisa Account:</p>
                <div className="font-mono bg-white p-2 rounded border font-bold text-lg text-emerald-700 text-center mb-2">0345-7654321</div>
                <p className="text-xs text-zinc-500 text-center">Account Title: Stoofi Education</p>
              </div>
            )}
            {activeTab === 'bank' && (
              <div className="text-sm text-zinc-700">
                <p className="mb-2">Transfer <strong>Rs 5,000</strong> to our Bank Account:</p>
                <div className="font-mono bg-white p-2 rounded border font-bold text-blue-700 text-center mb-1">PK34MEZN000123456789</div>
                <p className="text-xs text-zinc-500 text-center">Meezan Bank Ltd.<br/>Title: Stoofi Pvt Ltd</p>
              </div>
            )}
          </div>

          <form onSubmit={handlePayment}>
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Enter Transaction ID (TID)
              </label>
              <input 
                type="text" 
                required
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="e.g. 01234567890"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-sm text-black bg-white"
              />
            </div>
            
            {error && <div className="mb-4 text-xs font-semibold text-rose-500 bg-rose-50 p-2 rounded border border-rose-200">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {loading ? 'Verifying Payment...' : 'Verify & Upgrade Now'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
