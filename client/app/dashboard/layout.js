'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import PageTransitionLoader from '@/components/PageTransitionLoader';
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
      const stored = getStoredSidebar(user?.role || 'Super Admin');
      if (stored && Array.isArray(stored)) {
        setMenuStructure(stored);
      }

      const handleUpdate = (e) => {
        if (e.detail?.menuData && Array.isArray(e.detail.menuData)) {
          setMenuStructure(e.detail.menuData);
        }
      };

      window.addEventListener('stoofi_sidebar_updated', handleUpdate);
      return () => window.removeEventListener('stoofi_sidebar_updated', handleUpdate);
    }
  }, [user?.role]);

  // Navbar interactive states
  const [globalSearchStr, setGlobalSearchStr] = useState('');
  const [studentSearchStr, setStudentSearchStr] = useState('');
  const [session, setSession] = useState('2026 [Jan-Dec]');
  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('stoofi_lang') || 'EN';
    }
    return 'EN';
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isInitialAppLoading, setIsInitialAppLoading] = useState(true);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Artificial Global Loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialAppLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
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

    // Check for a REAL token (not a mock/fake token)
    const storedToken =
      localStorage.getItem('token') ||
      (() => {
        try {
          const raw = localStorage.getItem('auth-storage');
          if (raw) return JSON.parse(raw)?.state?.token || '';
        } catch (e) {}
        return '';
      })();

    const isMockToken = typeof storedToken === 'string' && storedToken.startsWith('mock_');
    const hasRealToken = storedToken && !isMockToken;

    if (!hasRealToken) {
      // No valid token — redirect to 404 immediately
      router.replace('/404');
      return;
    }

    checkAuth();

    // Safety timeout: if still loading after 3s, force check
    const timer = setTimeout(() => {
      const stillToken = localStorage.getItem('token');
      if (!stillToken || stillToken.startsWith('mock_')) {
        router.replace('/404');
      }
    }, 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated || !user) {
        const storedToken = localStorage.getItem('token');
        const isMock = typeof storedToken === 'string' && storedToken.startsWith('mock_');
        if (!storedToken || isMock) {
          router.replace('/404');
        }
      } else {
        // Enforce RBAC on client side
        const role = user.role;
        const p = pathname;
        
        const isAdminRoute = p === '/dashboard/admin' || p.startsWith('/dashboard/admin/');
        const isTeacherRoute = p === '/dashboard/teacher' || p.startsWith('/dashboard/teacher/');
        const isStudentRoute = p === '/dashboard/student' || p.startsWith('/dashboard/student/');
        const isParentRoute = p === '/dashboard/parent' || p.startsWith('/dashboard/parent/');
        const isAccountantRoute = p === '/dashboard/accountant' || p.startsWith('/dashboard/accountant/');
        
        const isSuperAdminRoute = !isAdminRoute && !isTeacherRoute && !isStudentRoute && !isParentRoute && !isAccountantRoute;
        
        let allowed = true;
        if (role === 'Super Admin' && !isSuperAdminRoute) allowed = false;
        else if (role === 'Admin' && !isAdminRoute) allowed = false;
        else if (role === 'Teacher' && !isTeacherRoute) allowed = false;
        else if (role === 'Student' && !isStudentRoute) allowed = false;
        else if (role === 'Parent' && !isParentRoute) allowed = false;
        else if (role === 'Accountant' && !isAccountantRoute) allowed = false;
        
        if (!allowed) {
          router.replace('/404');
        }
      }
    }
  }, [mounted, isAuthenticated, isLoading, user, router, pathname]);

  // Check if we have a stored token (trust persisted state immediately)
  const hasStoredSession = typeof window !== 'undefined' && Boolean(
    localStorage.getItem('token') ||
    localStorage.getItem('auth-storage')
  );


  // If mounted and definitely no session or token, immediately render 404 page
  if (mounted && !hasStoredSession && !user && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900 p-6">
        <h1 className="text-6xl font-black mb-4">404</h1>
        <p className="text-lg text-zinc-600 mb-6">Page Not Found</p>
        <Link href="/" className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-colors">
          Go to Home
        </Link>
      </div>
    );
  }

  // After mounting, if we still don't have a session, we also show it while checking auth.
  if (!mounted || (!hasStoredSession && (isLoading && !user)) || isInitialAppLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-50 dark:bg-white transition-colors duration-300">
        <div className="relative flex items-center justify-center w-32 h-32 mb-6">
          {/* Background Border */}
          <div className="absolute inset-0 border-[3px] border-zinc-200 dark:border-zinc-200 rounded-full"></div>
          {/* Spinning Ring */}
          <div className="absolute inset-0 border-[3px] border-zinc-950 dark:border-zinc-200 rounded-full border-t-transparent dark:border-t-transparent animate-spin"></div>
          
          {/* Center Mascot Logo */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2">
            <img src="/stoofi light.png" alt="Loading" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="text-zinc-950 dark:text-zinc-900 font-bold tracking-[0.3em] text-xs sm:text-sm animate-pulse">
          LOADING ERP...
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
    if (typeof window === 'undefined') return;

    localStorage.setItem('stoofi_lang', langCode);

    const googleLangMap = { EN: 'en', UR: 'ur', AR: 'ar' };
    const targetLang = googleLangMap[langCode] || 'en';

    // Method 1: Use doGTranslate (standard Google Translate widget API)
    if (typeof window.doGTranslate === 'function') {
      window.doGTranslate(`en|${targetLang}`);
      return;
    }

    // Method 2: Find Google Translate select element and trigger change
    const tryTriggerGT = () => {
      const gtFrame = document.querySelector('.goog-te-combo') ||
                      document.querySelector('select.goog-te-combo') ||
                      document.querySelector('iframe.goog-te-menu-frame');

      if (gtFrame && gtFrame.tagName === 'SELECT') {
        gtFrame.value = targetLang;
        gtFrame.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }

      // Try inside iframe
      try {
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
          const sel = iframe.contentDocument?.querySelector('.goog-te-combo');
          if (sel) {
            sel.value = targetLang;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
      } catch (_) {}

      return false;
    };

    // Try immediately, then retry after GT loads
    if (!tryTriggerGT()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (tryTriggerGT() || attempts > 20) {
          clearInterval(interval);
        }
      }, 300);
    }

    // Method 3: Fallback — set cookie and reload only if EN (reset)
    if (langCode === 'EN') {
      // Clear translation
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname;
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-white overflow-hidden">
      <PageTransitionLoader />
      {/* Sidebar with Accordion Animation */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white transition-transform duration-300 md:relative md:translate-x-0 ${sidebarCollapsed ? 'md:hidden' : 'md:flex'} flex-col shrink-0`}
      >
        {/* Brand Header */}
        <div className="flex h-[70px] items-center justify-between border-b border-zinc-200 dark:border-zinc-200 px-5 shrink-0 bg-white dark:bg-white">
          <Link href="/dashboard" className="flex items-center cursor-pointer">
            <img src="/stoofi light.png" alt="Stoofi PRO" className="h-10 sm:h-11 max-w-[155px] w-auto object-contain transform hover:scale-105 transition-transform duration-300" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-zinc-600 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-950 cursor-pointer"
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
                <h4 className="mb-2 px-3 text-[11px] font-bold text-zinc-950 dark:text-zinc-900 uppercase tracking-wider">
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
                                ? 'bg-zinc-100/70 dark:bg-zinc-100 text-zinc-950 dark:text-zinc-900 border border-zinc-300 dark:border-zinc-200 font-bold' 
                                : 'text-zinc-950 dark:text-zinc-600 hover:bg-emerald-50 dark:hover:bg-emerald-50/50 hover:text-emerald-700 dark:hover:text-emerald-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <IconComponent className={`h-4 w-4 transition-colors ${isOpen ? 'text-zinc-950 dark:text-zinc-900' : 'text-zinc-950 dark:text-zinc-600 group-hover:text-zinc-800 dark:group-hover:text-zinc-950'}`} />
                              <span>{item.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.badge && (
                                <span className="text-[9px] font-bold uppercase bg-zinc-200 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 px-1.5 py-0.2 rounded border border-zinc-300 dark:border-zinc-200">
                                  {item.badge}
                                </span>
                              )}
                              <ChevronDown 
                                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                  isOpen ? 'rotate-180 text-zinc-950 dark:text-zinc-900' : 'text-zinc-950 dark:text-zinc-900 group-hover:text-zinc-800 dark:group-hover:text-zinc-950'
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
                            <div className="pl-7 pr-2 py-1 space-y-0.5 border-l border-zinc-200 dark:border-zinc-200 ml-5 my-1">
                              {visibleSubItems.map((sub, sIdx) => (
                                <Link
                                  key={sub.id || sIdx}
                                  href={sub.href}
                                  prefetch={true}
                                  onMouseEnter={() => router.prefetch(sub.href)}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`block rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                    pathname === sub.href
                                      ? 'text-zinc-800 dark:text-zinc-900 bg-zinc-200/70 dark:bg-zinc-100 font-bold border border-zinc-300/80 dark:border-zinc-200'
                                      : 'text-zinc-950 dark:text-zinc-600 hover:text-emerald-700 dark:hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-50/50'
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

                    const isDashItem = item.id === 'item-dash' || item.name === 'Dashboard';
                    const targetHref = isDashItem
                      ? (user?.role === 'Admin' || user?.email === 'admin@gmail.com' ? '/dashboard/admin' : '/dashboard')
                      : item.href;
                    const isItemActive = isDashItem
                      ? (pathname === '/dashboard' || pathname === '/dashboard/admin')
                      : pathname === item.href;

                    return (
                      <Link
                        key={item.id || iIdx}
                        href={targetHref}
                        prefetch={true}
                        onMouseEnter={() => router.prefetch(targetHref)}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-all duration-200 group ${
                          isItemActive
                            ? 'border border-zinc-950 dark:border-zinc-200 bg-white dark:bg-zinc-100 text-zinc-950 dark:text-zinc-900 font-bold shadow-xs'
                            : 'text-zinc-950 dark:text-zinc-600 hover:bg-emerald-50 dark:hover:bg-emerald-50/50 hover:text-emerald-700 dark:hover:text-emerald-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-4 w-4 transition-colors ${isItemActive ? 'text-zinc-950 dark:text-zinc-900' : 'text-zinc-950 dark:text-zinc-600 group-hover:text-zinc-800 dark:group-hover:text-zinc-950'}`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-bold uppercase bg-zinc-200 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-200">
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
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-4 sm:px-6 shrink-0 gap-4 relative z-50 dropdown-container">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-950 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-950 cursor-pointer hidden md:flex" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-zinc-950 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-950 cursor-pointer md:hidden"
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
                className="w-full bg-zinc-100/30 dark:bg-zinc-50 border border-zinc-300/80 dark:border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-700 placeholder-zinc-950/60 focus:outline-none focus:border-zinc-950 transition-colors cursor-text"
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
                className="w-full bg-zinc-100/30 dark:bg-zinc-50 border border-zinc-300/80 dark:border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-700 placeholder-zinc-950/60 focus:outline-none focus:border-zinc-950 transition-colors cursor-text"
              />
            </div>

            {/* Academic Session Dropdown */}
            <div className="relative hidden lg:block">
              <div 
                className="flex items-center justify-between gap-2 bg-zinc-100/40 dark:bg-zinc-50 border border-zinc-300/80 dark:border-zinc-200 rounded-lg px-2.5 py-1 text-[11px] text-zinc-950 dark:text-zinc-700 font-semibold cursor-pointer hover:border-zinc-950 w-auto min-w-[110px] whitespace-nowrap"
                onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
              >
                <span>{session}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isSessionDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isSessionDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-32 bg-white dark:bg-zinc-50 border border-zinc-300 dark:border-zinc-200 rounded-lg shadow-xl overflow-hidden py-1">
                  {['2026 [Jan-Dec]', '2025 [Jan-Dec]', '2024 [Jan-Dec]'].map((s) => (
                    <div 
                      key={s} 
                      onClick={() => { setSession(s); setIsSessionDropdownOpen(false); }}
                      className="px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-950 cursor-pointer transition-colors"
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
                className="flex items-center justify-between gap-1.5 bg-zinc-100/40 dark:bg-zinc-50 border border-zinc-300/80 dark:border-zinc-200 rounded-lg px-2.5 py-1 text-xs text-zinc-950 dark:text-zinc-800 font-bold cursor-pointer hover:border-zinc-950 transition-colors min-w-[54px]"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              >
                <span>{lang}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isLangDropdownOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-28 bg-white dark:bg-zinc-50 border border-zinc-300 dark:border-zinc-200 rounded-xl shadow-2xl overflow-hidden p-1 z-50">
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
                          ? 'bg-zinc-100 dark:bg-zinc-100 text-zinc-950 dark:text-zinc-900 font-bold' 
                          : 'text-zinc-700 dark:text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-medium'
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
                className="relative p-2 rounded-lg bg-zinc-100/40 dark:bg-zinc-50 border border-zinc-300/80 dark:border-zinc-200 text-zinc-950 dark:text-zinc-600 hover:text-zinc-800 hover:border-zinc-950 transition-colors cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zinc-950 text-[10px] font-bold text-white flex items-center justify-center">
                  2
                </span>
              </button>
              {isNotifOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-50 border border-zinc-300 dark:border-zinc-200 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-900">Notifications</span>
                    <span className="text-[10px] text-zinc-950 cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    <div className="p-2 bg-zinc-100/50 dark:bg-zinc-100 rounded-md border border-zinc-300 dark:border-zinc-200 cursor-pointer hover:bg-zinc-200/50">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-800">New Admission</div>
                      <div className="text-[10px] text-zinc-950 dark:text-zinc-600">John Doe just enrolled in Class 10.</div>
                    </div>
                    <div className="p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-100/50">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-800">Fee Received</div>
                      <div className="text-[10px] text-zinc-950 dark:text-zinc-600">$450 received from Jane Smith.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {(() => {
              const isAdmRoute = pathname.startsWith('/dashboard/admin');
              const isAdmUser = user?.role === 'Admin' || user?.email === 'admin@gmail.com';
              const isSuperUser = user?.role === 'Super Admin' || user?.email === 'super@gmail.com';

              const displayUsername = (isAdmRoute || isAdmUser) && !isSuperUser
                ? 'Admin'
                : (user?.username || (isAdmRoute ? 'Admin' : 'Super Admin'));

              const displayRole = (isAdmRoute || isAdmUser) && !isSuperUser
                ? 'ADMIN'
                : (user?.role || (isAdmRoute ? 'ADMIN' : 'SUPER ADMIN'));

              const displayInitial = displayUsername.charAt(0).toUpperCase() || 'A';
              const displayEmail = (isAdmRoute || isAdmUser) && !isSuperUser
                ? (user?.email || 'admin@gmail.com')
                : (user?.email || 'super@gmail.com');

              return (
                <div className="relative flex items-center space-x-3 border-l border-zinc-200 dark:border-zinc-200 pl-3">
                  <div 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-100 border border-zinc-400 dark:border-zinc-200 flex items-center justify-center text-zinc-950 dark:text-zinc-900 font-bold text-xs cursor-pointer hover:bg-zinc-300/60 transition-colors overflow-hidden"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      displayInitial
                    )}
                  </div>
                  <div 
                    className="hidden sm:block text-left cursor-pointer"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-800 leading-none hover:text-zinc-950 transition-colors">{displayUsername}</div>
                    <div className="text-[10px] text-zinc-950 dark:text-zinc-900 font-bold mt-1 uppercase">{displayRole}</div>
                  </div>
                  
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-100 dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-lg shadow-xl overflow-hidden py-1">
                      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-200 mb-1">
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-900">{displayUsername}</div>
                        <div className="text-[10px] text-zinc-600 dark:text-zinc-600">{displayEmail}</div>
                      </div>
                      <div 
                        onClick={() => { setIsProfileOpen(false); router.push('/dashboard/profile'); }}
                        className="px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 cursor-pointer flex items-center gap-2 transition-colors"
                      >
                        <User className="h-3.5 w-3.5" /> Profile
                      </div>
                      <div 
                        onClick={() => { setIsProfileOpen(false); router.push('/dashboard/settings/general'); }}
                        className="px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 cursor-pointer flex items-center gap-2 transition-colors"
                      >
                        <Settings className="h-3.5 w-3.5" /> Settings
                      </div>
                      <div 
                        onClick={handleLogout}
                        className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 cursor-pointer flex items-center gap-2 transition-colors border-t border-zinc-200 dark:border-zinc-200 mt-1 pt-1.5"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Logout
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-white dark:bg-white p-4 sm:p-6 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}


