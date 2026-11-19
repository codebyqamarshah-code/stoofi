'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AccountantDashboardUI from '@/components/AccountantDashboardUI';
import { Loader2 } from 'lucide-react';

export default function AccountantMainDashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-950 dark:text-zinc-50" />
        <p className="text-sm font-medium text-zinc-500">Loading Accountant Financial Portal...</p>
      </div>
    );
  }

  return <AccountantDashboardUI user={user} />;
}
