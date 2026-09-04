'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FolderOpen,
  Settings, 
  LogOut, 
  Menu,
  X,
  School,
  DollarSign,
  Bell,
  ChevronDown,
  Shield,
  FileText,
  CreditCard,
  Award,
  Layers,
  GraduationCap,
  CalendarDays,
  Printer,
  Download,
  BookMarked,
  ListTodo,
  Video,
  FileSpreadsheet,
  CheckSquare,
  Wallet,
  Building,
  Box,
  MessageSquare,
  Megaphone,
  Paintbrush,
  PieChart,
  List,
  Monitor,
  User
} from 'lucide-react';
import { DEFAULT_MENU_STRUCTURE, ICON_MAP, getStoredSidebar } from '@/lib/sidebarConfig';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading, checkAuth, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStructure, setMenuStructure] = useState(DEFAULT_MENU_STRUCTURE);
  
  // Accordion state: only one menu dropdown open at a time for smooth UX
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Sync sidebar configuration from localStorage and event listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredSidebar('Super Admin');
      if (stored && Array.isArray(stored)) {
        setMenuStructure(stored);
      }

      const handleUpdate = (e) => {
        if (e.detail?.menuData && Array.isArray(e.detail.menuData)) {
          setMenuStructure(e.detail.menuData);
        }
      };

      window.addEventListener('eskooly_sidebar_updated', handleUpdate);
      return () => window.removeEventListener('eskooly_sidebar_updated', handleUpdate);
    }
  }, []);

  // Navbar interactive states
  const [globalSearchStr, setGlobalSearchStr] = useState('');
  const [studentSearchStr, setStudentSearchStr] = useState('');
  const [session, setSession] = useState('2026 [Jan-Dec]');
  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close dropdowns on outside click (simple effect for professional feel)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setIsSessionDropdownOpen(false);
        setIsLangDropdownOpen(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && globalSearchStr) {
      router.push(`/dashboard/students?search=${encodeURIComponent(globalSearchStr)}`);
    }
  };
  
  const handleStudentSearch = (e) => {
    if (e.key === 'Enter' && studentSearchStr) {
      router.push(`/dashboard/students?search=${encodeURIComponent(studentSearchStr)}`);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated && !user) {
      const hasStoredToken = typeof window !== 'undefined' && (
        localStorage.getItem('token') || 
        localStorage.getItem('auth-storage') ||
        (typeof document !== 'undefined' && document.cookie.includes('token='))
      );
      if (!hasStoredToken) {
        router.push('/login');
      }
    }
  }, [mounted, isAuthenticated, isLoading, user, router]);

  if (!mounted || (isLoading && !user) || (!isAuthenticated && !user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="relative flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
          {/* Glowing ambient background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full animate-pulse pointer-events-none"></div>
          
          <div className="mb-10 relative z-10 transform hover:scale-105 transition-transform duration-500">
            <img src="/eskooly light.png" alt="eSkooly PRO" className="h-24 sm:h-32 w-auto object-contain drop-shadow-2xl dark:hidden" />
            <img src="/logo dark.png" alt="eSkooly PRO" className="h-24 sm:h-32 w-auto object-contain drop-shadow-2xl hidden dark:block" />
          </div>
          
          <div className="flex flex-col items-center gap-4 relative z-10">
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500/80 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 w-2 rounded-full bg-emerald-500/80 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2 w-2 rounded-full bg-emerald-500/80 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-zinc-500 dark:text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase">Loading Workspace</p>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleSubmenu = (menuName) => {
    // Smooth auto-close: if clicked menu is already open, close it; otherwise open clicked and close other
    setOpenSubmenu(prev => (prev === menuName ? null : menuName));
  };

  const changeLanguage = (langCode) => {
    setLang(langCode);
    setIsLangDropdownOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('eskooly_lang', langCode);
      let googleLang = 'en';
      if (langCode === 'UR') googleLang = 'ur';
      if (langCode === 'AR') googleLang = 'ar';
      document.cookie = `googtrans=/en/${googleLang}; path=/`;
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar with Accordion Animation */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-transform duration-300 md:relative md:translate-x-0 ${sidebarCollapsed ? 'md:hidden' : 'md:flex'} flex-col shrink-0`}
      >
        {/* Brand Header */}
        <div className="flex h-[100px] items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 shrink-0 bg-white dark:bg-zinc-950">
          <Link href="/dashboard" className="flex items-center cursor-pointer">
            <img src="/eskooly light.png" alt="eSkooly PRO" className="h-20 sm:h-[85px] w-auto object-contain dark:hidden transform hover:scale-105 transition-transform duration-300" />
            <img src="/logo dark.png" alt="eSkooly PRO" className="h-20 sm:h-[85px] w-auto object-contain hidden dark:block transform hover:scale-105 transition-transform duration-300" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
          {menuStructure.filter(g => g.visible !== false).map((group, gIdx) => {
            const visibleItems = (group.items || []).filter(item => item.visible !== false);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.id || gIdx}>
                <h4 className="mb-2 px-3 text-[11px] font-bold text-[#009966] dark:text-emerald-400 uppercase tracking-wider">
                  {group.groupTitle}
                </h4>
                <div className="space-y-1">
                  {visibleItems.map((item, iIdx) => {
                    const isOpen = openSubmenu === item.name;
                    const IconComponent = (item.iconName && ICON_MAP[item.iconName]) || item.icon || Settings;

                    if (item.hasSubmenu) {
                      const visibleSubItems = (item.subItems || []).filter(s => s.visible !== false);
                      if (visibleSubItems.length === 0) return null;

                      return (
                        <div key={item.id || iIdx} className="space-y-1">
                          <button
                            onClick={() => toggleSubmenu(item.name)}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-all duration-200 group ${
                              isOpen 
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 text-[#009966] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold' 
                                : 'text-[#009966] dark:text-zinc-400 hover:bg-emerald-50/70 dark:hover:bg-zinc-900/80 hover:text-[#007a52] dark:hover:text-emerald-400'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <IconComponent className={`h-4 w-4 transition-colors ${isOpen ? 'text-[#009966] dark:text-emerald-400' : 'text-[#009966] dark:text-zinc-400 group-hover:text-[#007a52] dark:group-hover:text-emerald-400'}`} />
                              <span>{item.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.badge && (
                                <span className="text-[9px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800/40">
                                  {item.badge}
                                </span>
                              )}
                              <ChevronDown 
                                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                  isOpen ? 'rotate-180 text-[#009966] dark:text-emerald-400' : 'text-[#009966] dark:text-zinc-500 group-hover:text-[#007a52] dark:group-hover:text-emerald-400'
                                }`} 
                              />
                            </div>
                          </button>

                          {/* Smooth animated accordion dropdown */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                            }`}
                          >
                            <div className="pl-7 pr-2 py-1 space-y-0.5 border-l border-emerald-100 dark:border-zinc-800 ml-5 my-1">
                              {visibleSubItems.map((sub, sIdx) => (
                                <Link
                                  key={sub.id || sIdx}
                                  href={sub.href}
                                  prefetch={true}
                                  onMouseEnter={() => router.prefetch(sub.href)}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`block rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                    pathname === sub.href
                                      ? 'text-[#007a52] dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 font-bold border border-emerald-200/80 dark:border-emerald-500/20'
                                      : 'text-[#009966] dark:text-zinc-400 hover:text-[#007a52] dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-zinc-900/60'
                                  }`}
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.id || iIdx}
                        href={item.href}
                        prefetch={true}
                        onMouseEnter={() => router.prefetch(item.href)}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-all duration-200 group ${
                          pathname === item.href
                            ? 'border border-[#009966] dark:border-emerald-400 bg-white dark:bg-emerald-950/30 text-[#009966] dark:text-emerald-400 font-bold shadow-xs'
                            : 'text-[#009966] dark:text-zinc-400 hover:bg-emerald-50/70 dark:hover:bg-zinc-900/80 hover:text-[#007a52] dark:hover:text-emerald-400 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-4 w-4 transition-colors ${pathname === item.href ? 'text-[#009966] dark:text-emerald-400' : 'text-[#009966] dark:text-zinc-400 group-hover:text-[#007a52] dark:group-hover:text-emerald-400'}`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 sm:px-6 shrink-0 gap-4 relative z-50 dropdown-container">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#009966] dark:text-zinc-400 hover:text-[#007a52] dark:hover:text-zinc-50 cursor-pointer hidden md:flex" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#009966] dark:text-zinc-400 hover:text-[#007a52] dark:hover:text-zinc-50 cursor-pointer md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative w-full max-w-xs hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                value={globalSearchStr}
                onChange={(e) => setGlobalSearchStr(e.target.value)}
                onKeyDown={handleGlobalSearch}
                className="w-full bg-emerald-50/30 dark:bg-zinc-900 border border-emerald-200/80 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-300 placeholder-[#009966]/60 focus:outline-none focus:border-[#009966] transition-colors cursor-text"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block w-48">
              <input
                type="text"
                placeholder="Name/Admission No..."
                value={studentSearchStr}
                onChange={(e) => setStudentSearchStr(e.target.value)}
                onKeyDown={handleStudentSearch}
                className="w-full bg-emerald-50/30 dark:bg-zinc-900 border border-emerald-200/80 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-300 placeholder-[#009966]/60 focus:outline-none focus:border-[#009966] transition-colors cursor-text"
              />
            </div>

            {/* Academic Session Dropdown */}
            <div className="relative hidden lg:block">
              <div 
                className="flex items-center justify-between gap-2 bg-emerald-50/40 dark:bg-zinc-900 border border-emerald-200/80 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-[#009966] dark:text-zinc-300 font-semibold cursor-pointer hover:border-[#009966] w-auto min-w-[110px] whitespace-nowrap"
                onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
              >
                <span>{session}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isSessionDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isSessionDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden py-1">
                  {['2026 [Jan-Dec]', '2025 [Jan-Dec]', '2024 [Jan-Dec]'].map((s) => (
                    <div 
                      key={s} 
                      onClick={() => { setSession(s); setIsSessionDropdownOpen(false); }}
                      className="px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-[#009966] dark:hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Language Dropdown */}
            <div className="relative hidden sm:block">
              <div 
                className="flex items-center justify-between gap-1.5 bg-emerald-50/40 dark:bg-zinc-900 border border-emerald-200/80 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-[#009966] dark:text-zinc-200 font-bold cursor-pointer hover:border-[#009966] transition-colors min-w-[54px]"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              >
                <span>{lang}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isLangDropdownOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-28 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-1 z-50">
                  {[
                    { code: 'EN', name: 'English' },
                    { code: 'UR', name: 'Urdu' },
                    { code: 'AR', name: 'Arabic' }
                  ].map((l) => (
                    <div 
                      key={l.code} 
                      onClick={() => changeLanguage(l.code)}
                      className={`px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                        lang === l.code 
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#009966] dark:text-emerald-400 font-bold' 
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 hover:text-[#009966] font-medium'
                      }`}
                    >
                      {l.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <ThemeToggle />

            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-lg bg-emerald-50/40 dark:bg-zinc-900 border border-emerald-200/80 dark:border-zinc-800 text-[#009966] dark:text-zinc-400 hover:text-[#007a52] hover:border-[#009966] transition-colors cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#009966] text-[10px] font-bold text-white flex items-center justify-center">
                  2
                </span>
              </button>
              {isNotifOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-emerald-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Notifications</span>
                    <span className="text-[10px] text-[#009966] cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-md border border-emerald-200 dark:border-emerald-500/10 cursor-pointer hover:bg-emerald-100/50">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">New Admission</div>
                      <div className="text-[10px] text-[#009966] dark:text-zinc-400">John Doe just enrolled in Class 10.</div>
                    </div>
                    <div className="p-2 rounded-md cursor-pointer hover:bg-emerald-50 dark:hover:bg-zinc-800/50">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Fee Received</div>
                      <div className="text-[10px] text-[#009966] dark:text-zinc-400">$450 received from Jane Smith.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative flex items-center space-x-3 border-l border-emerald-100 dark:border-zinc-800 pl-3">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-600/20 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-[#009966] dark:text-emerald-400 font-bold text-xs cursor-pointer hover:bg-emerald-200/60 transition-colors"
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : 'S'}
              </div>
              <div 
                className="hidden sm:block text-left cursor-pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-200 leading-none hover:text-[#009966] transition-colors">{user?.username || 'Super Admin'}</div>
                <div className="text-[10px] text-[#009966] dark:text-emerald-400 font-bold mt-1 uppercase">{user?.role || 'SUPER ADMIN'}</div>
              </div>
              
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden py-1">
                  <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 mb-1">
                    <div className="text-xs font-bold text-white">{user?.username || 'Super Admin'}</div>
                    <div className="text-[10px] text-zinc-600 dark:text-zinc-400">{user?.email || 'admin@eskooly.com'}</div>
                  </div>
                  <div 
                    onClick={() => { setIsProfileOpen(false); router.push('/dashboard/settings/general'); }}
                    className="px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-emerald-950/50 hover:text-emerald-400 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </div>
                  <div 
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 cursor-pointer flex items-center gap-2 transition-colors border-t border-zinc-200 dark:border-zinc-800 mt-1 pt-1.5"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-white dark:bg-zinc-950 p-4 sm:p-6 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

