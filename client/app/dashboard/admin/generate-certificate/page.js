'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Loader2 } from 'lucide-react';

export default function GenerateCertificatePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin/certificate?action=issue');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Award className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Redirecting to Certificate Generator...</h2>
        <p className="text-sm text-slate-500 mb-6">
          Taking you to the Certificate Issuing & Template Management Studio.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium mb-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Opening Certificate Studio...</span>
        </div>
        <a 
          href="/dashboard/admin/certificate?action=issue" 
          className="inline-block px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl shadow-md transition-all text-sm"
        >
          Click here to proceed immediately
        </a>
      </div>
    </div>
  );
}
