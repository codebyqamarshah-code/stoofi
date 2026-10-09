'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DashboardUI from '@/components/DashboardUI';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
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

  if (isLoading || !isAuthenticated || !user || ['Student', 'Teacher'].includes(user.role)) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-white dark:bg-white">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2 relative">
          <div className="absolute inset-0 border-[3px] rounded-full border-t-transparent animate-spin" style={{borderColor:'#084A86',borderTopColor:'transparent'}}></div>
          <img src="/logo.png" alt="Loading" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
        </div>
      </div>
    );
  }

  return <DashboardUI user={user} />;
}
