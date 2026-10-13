'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeachersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/hr/staff-directory?role=Teacher');
  }, [router]);

  return (
    <div className="flex h-[60vh] items-center justify-center bg-white">
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2 relative">
        <div className="absolute inset-0 border-[3px] rounded-full border-t-transparent animate-spin" style={{ borderColor: '#084A86', borderTopColor: 'transparent' }}></div>
        <img src="/logo.png" alt="Loading" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
      </div>
    </div>
  );
}
