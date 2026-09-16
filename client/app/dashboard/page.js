'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DashboardUI from '@/components/DashboardUI';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'Student') {
        router.replace('/dashboard/student');
      } else if (user.role === 'Teacher') {
        router.replace('/dashboard/teacher');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || (user && ['Student', 'Teacher'].includes(user.role))) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-white dark:bg-white">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2 relative">
          <div className="absolute inset-0 border-[3px] border-zinc-950 dark:border-zinc-200 rounded-full border-t-transparent dark:border-t-transparent animate-spin"></div>
          <img src="/stoofi light.png" alt="Loading" className="w-full h-full object-contain" />
        </div>
      </div>
    );
  }

  return <DashboardUI user={user} />;
}
