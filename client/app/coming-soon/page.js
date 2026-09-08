'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Clock } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ComingSoonPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!mounted) return null;

  const roleName = user?.role || 'User';
  const userName = user?.username || user?.fullName || 'User';

  const roleMessages = {
    'Student': 'Student',
    'Teacher': 'Teacher',
    'Parent': 'Parent',
    'Accountant': 'Accountant',
    'Staff': 'Staff',
  };
  const displayRole = roleMessages[roleName] || roleName;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors p-6 text-center relative">

      <div className="absolute top-6 right-6 flex items-center gap-3">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-700 border border-rose-300 dark:border-rose-800 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="mb-8">
        <img src="/stoofi light.png" alt="Stoofi" className="h-20 w-auto object-contain dark:hidden" />
        <img src="/stoofi dark.png" alt="Stoofi" className="h-20 w-auto object-contain hidden dark:block" />
      </div>

      <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 border-[3px] border-zinc-200 dark:border-zinc-800 rounded-full"></div>
        <div className="absolute inset-0 border-[3px] border-[#009966] dark:border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
        <Clock size={36} className="text-[#009966] dark:text-emerald-500" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">
        Dashboard <span className="text-[#009966]">Ban Raha Hai!</span>
      </h1>

      <div className="inline-flex items-center gap-2 bg-[#009966]/10 border border-[#009966]/30 rounded-full px-5 py-2 mb-6">
        {user?.avatar ? (
          <img src={user.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#009966] flex items-center justify-center text-white text-xs font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-bold text-[#009966] dark:text-emerald-400">{userName}</span>
        <span className="text-xs bg-[#009966] text-white rounded-full px-2 py-0.5 font-bold">{displayRole}</span>
      </div>

      <p className="text-zinc-600 dark:text-zinc-400 text-base max-w-md mb-4 leading-relaxed">
        Aapka <span className="font-bold text-zinc-900 dark:text-white">{displayRole} Dashboard</span> abhi under construction hai.
        Jab ye tayyar ho jayega, aap seedha is se apna kaam kar sakenge.
      </p>

      <p className="text-zinc-400 dark:text-zinc-600 text-sm">
        Jald aata hai &mdash; <span className="font-bold text-[#009966]">Stoofi ERP Team</span>
      </p>

    </div>
  );
}
