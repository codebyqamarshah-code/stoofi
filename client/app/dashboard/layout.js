'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import PageTransitionLoader from '@/components/PageTransitionLoader';
import StoofiAiFloating from '@/components/ai/StoofiAiFloating';
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
  User,
  Maximize2,
  Minimize,
  Search,
  ArrowRight,
  CornerDownLeft,
  Sparkles
} from 'lucide-react';
import { DEFAULT_MENU_STRUCTURE, ICON_MAP, getStoredSidebar } from '@/lib/sidebarConfig';
import { Button } from '@/components/ui/button';
import { searchRoutes } from '@/lib/searchConfig';
import { isRouteAllowed } from '@/lib/routeProtection';


export default function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading, checkAuth, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStructure, setMenuStructure] = useState(() => getStoredSidebar(user?.role || 'Super Admin'));
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'Student' && user.subscription?.endDate) {
        if (new Date() > new Date(user.subscription.endDate)) {
          router.push('/subscription-expired');
        }
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Accordion state: only one menu dropdown open at a time for smooth UX
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // ── Fullscreen ──────────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);
  // ────────────────────────────────────────────────────────────────────────

  // Auto-expand the active submenu on load and when pathname changes
  useEffect(() => {
    if (menuStructure && pathname) {
      let activeGroupName = null;
      for (const group of menuStructure) {
        if (group.items) {
          for (const item of group.items) {
            if (item.hasSubmenu && item.subItems) {
              const isActive = item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'));
              if (isActive) {
                activeGroupName = item.name;
                break;
              }
            } else {
              const targetHref = item.href || '/dashboard';
              if (pathname === targetHref || (targetHref !== '/dashboard' && pathname.startsWith(targetHref + '/'))) {
                activeGroupName = null; 
                break;
              }
            }
          }
        }
        if (activeGroupName) break;
      }
      
      if (activeGroupName && openSubmenu !== activeGroupName) {
        setOpenSubmenu(activeGroupName);
      }
    }
  }, [pathname, menuStructure]);

  const [liveNotifications, setLiveNotifications] = useState([]);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(false);

  const [showNoticePopup, setShowNoticePopup] = useState(false);
  const [latestNotice, setLatestNotice] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchNoticesAndEvents = async () => {
        try {
          const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const baseApi = rawApi.replace(/\/api\/?$/, '');
          const token = localStorage.getItem('token');
          const headers = { 'Authorization': 'Bearer ' + token };

          // Fetch notices and events in parallel
          const [noticeRes, eventRes] = await Promise.allSettled([
            fetch(baseApi + '/api/dashboard/notices', { headers }),
            fetch(baseApi + '/api/dashboard/events', { headers })
          ]);

          let combined = [];

          if (noticeRes.status === 'fulfilled') {
            const result = await noticeRes.value.json();
            if (result.success && result.data) {
              const filtered = result.data.filter(n => n.audience === 'All' || n.audience === user.role);
              combined = [...combined, ...filtered.map(n => ({ ...n, _popupType: 'Notice' }))];
            }
          }

          if (eventRes.status === 'fulfilled') {
            const result = await eventRes.value.json();
            if (result.success && result.data) {
              const filtered = result.data.filter(e => e.eventFor === 'All' || e.eventFor === user.role);
              combined = [...combined, ...filtered.map(e => ({ ...e, _popupType: 'Event', audience: e.eventFor, date: e.startDate }))];
            }
          }

          // Sort by newest
          combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          // Show first unseen item
          for (const item of combined) {
            const seenKey = 'seenPopup_' + item._id;
            const seen = sessionStorage.getItem(seenKey);
            if (!seen) {
              setLatestNotice(item);
              setShowNoticePopup(true);
              sessionStorage.setItem(seenKey, 'true');
              break;
            }
          }
        } catch(e) {}
      };
      fetchNoticesAndEvents();
    }
  }, [user]);


  useEffect(() => {
    if (user) {
      const fetchLiveUpdates = async () => {
        try {
          let token = '';
          if (typeof window !== 'undefined') {
            token = sessionStorage.getItem('token') || localStorage.getItem('token') || '';
          }
          const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const baseApi = rawApi.replace(/\/api\/?$/, '');
          const res = await fetch(baseApi + '/api/dashboard/live-updates', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            const result = await res.json();
            if (result.success) {
              const apiNotifs = result.data.notifications || [];
              let deletedIds = [];
              let readIds = [];
              if (typeof window !== 'undefined') {
                try {
                  deletedIds = JSON.parse(localStorage.getItem('deleted_notifs') || '[]');
                  readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
                } catch(e){}
              }

              // Filter out deleted ones
              const visibleNotifs = apiNotifs.filter(n => !deletedIds.includes(n._id));
              
              // Apply read state
              const processedNotifs = visibleNotifs.map(n => ({
                ...n,
                isRead: n.isRead || n.read || readIds.includes(n._id)
              }));
              
              setLiveNotifications(processedNotifs);
              setActiveStudentsCount(result.data.activeStudents || 0);
              
              const hasUnread = processedNotifs.some(n => !n.isRead && !n.read);
              setHasUnreadNotif(hasUnread);
            }
          } catch (error) {
          console.error('Failed to fetch live updates', error);
        }
      };
      fetchLiveUpdates();
      const interval = setInterval(fetchLiveUpdates, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);



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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const [studentSearchStr, setStudentSearchStr] = useState('');
  const [session, setSession] = useState('2026');
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

  // Live search suggestions filtered by user role
  const searchResults = useMemo(() => {
    if (!globalSearchStr || !globalSearchStr.trim()) return [];
    return searchRoutes(globalSearchStr, user?.role || 'Super Admin', 8);
  }, [globalSearchStr, user?.role]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (!event.target.closest('.dropdown-container') && !event.target.closest('.relative')) {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateToRoute = (route) => {
    if (!route) return;
    setIsSearchOpen(false);
    setGlobalSearchStr('');
    setSelectedSearchIndex(-1);
    router.push(route);
  };

  const handleGlobalSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isSearchOpen && searchResults.length > 0) {
        setIsSearchOpen(true);
        return;
      }
      setSelectedSearchIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isSearchOpen && searchResults.length > 0) {
        setIsSearchOpen(true);
        return;
      }
      setSelectedSearchIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults && searchResults.length > 0) {
        const target = selectedSearchIndex >= 0 ? searchResults[selectedSearchIndex] : searchResults[0];
        navigateToRoute(target.route);
      } else if (globalSearchStr.trim()) {
        const directResults = searchRoutes(globalSearchStr.trim(), user?.role || 'Super Admin', 1);
        if (directResults && directResults.length > 0) {
          navigateToRoute(directResults[0].route);
        } else if (user?.role === 'Super Admin' || user?.role === 'Admin') {
          router.push(`/dashboard/students?search=${encodeURIComponent(globalSearchStr.trim())}`);
          setIsSearchOpen(false);
          setGlobalSearchStr('');
        }
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const highlightMatch = (text, query) => {
    if (!query || !query.trim() || !text) return text;
    const cleanQuery = query.trim();
    const parts = String(text).split(new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === cleanQuery.toLowerCase() ? (
            <span key={i} className="text-[#084A86] bg-sky-100 font-bold px-0.5 rounded">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const handleStudentSearch = (e) => {
    if (e.key === 'Enter' && studentSearchStr && user) {
      // Only Admin/Super Admin can search manage-students page
      if (user.role === 'Super Admin' || user.role === 'Admin') {
        router.push(`/dashboard/students?search=${encodeURIComponent(studentSearchStr)}`);
      } else {
        // For other roles, use the role-aware search
        const results = searchRoutes(studentSearchStr, user.role);
        if (results && results.length > 0) {
          router.push(results[0].route);
          setStudentSearchStr('');
        }
      }
    }
  };


  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  // Guard ref so we only ever redirect once
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!mounted || isLoading) return;
    if (redirectedRef.current) return;

    const storedToken =
      (typeof window !== 'undefined' && (
        localStorage.getItem('token') ||
        sessionStorage.getItem('token') ||
        (() => {
          try {
            const raw = localStorage.getItem('auth-storage') || sessionStorage.getItem('auth-storage');
            if (raw) return JSON.parse(raw)?.state?.token || '';
          } catch (e) {}
          return '';
        })() ||
        (() => {
          try {
            const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
            return match ? match[2] : '';
          } catch (e) {}
          return '';
        })()
      )) || '';

    if (storedToken && typeof document !== 'undefined') {
      try {
        if (!document.cookie.includes('token=')) {
          document.cookie = `token=${storedToken}; path=/; max-age=604800; SameSite=Lax`;
        }
      } catch (e) {}
    }

    // If unauthenticated or missing token, redirect immediately to login
    if (!storedToken || (!user && !isAuthenticated)) {
      redirectedRef.current = true;
      router.replace('/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [mounted, isAuthenticated, isLoading, user, router, pathname]);

  // Route protection check based on role
  useEffect(() => {
    if (!isLoading && user && mounted) {
      if (!isRouteAllowed(user.role, pathname)) {
        if (user.role === 'Student') {
          router.replace('/dashboard/student');
        } else if (user.role === 'Teacher') {
          router.replace('/dashboard/teacher');
        } else {
          router.replace('/dashboard');
        }
      }
    }
  }, [pathname, user, isLoading, mounted, router]);

  // Loading & Protection state: NEVER render dashboard contents until authenticated!
  if (!mounted || isLoading || !isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-white transition-colors duration-300">
        <div className="relative flex items-center justify-center w-32 h-32 mb-6">
          <div className="absolute inset-0 border-[3px] border-sky-100 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-[#084A86] rounded-full border-t-transparent animate-spin"></div>
          
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2">
            <img src="/logo.png" alt="Loading" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="text-[#084A86] font-bold tracking-[0.3em] text-xs sm:text-sm animate-pulse">
          VERIFYING ACCESS...
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/';
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

    if (langCode === 'EN') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + window.location.hostname;
    } else {
      document.cookie = `googtrans=/en/${targetLang}; path=/`;
      document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${window.location.hostname}`;
    }
    
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-white dark:bg-white overflow-hidden">
      <PageTransitionLoader />
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-xs md:hidden transition-opacity duration-300 cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Sidebar with Accordion Animation */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 flex h-full max-h-screen w-72 sm:w-80 md:w-64 flex-col border-r border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white transition-transform duration-300 md:relative md:translate-x-0 ${sidebarCollapsed ? 'md:hidden' : 'md:flex'} shrink-0 overflow-hidden`}
      >
        {/* Brand Header */}
        <div className="flex h-[70px] items-center justify-between border-b border-zinc-200 dark:border-zinc-200 px-5 shrink-0 bg-white dark:bg-white">
          <div className="flex items-center select-none cursor-default">
            <img src="/logo.png" alt="Stoofi ERP" className="h-12 sm:h-14 max-w-[200px] w-auto object-contain pointer-events-none" />
          </div>
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-3 pb-16 space-y-5 overscroll-contain">
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
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer sidebar-item ${isOpen ? "active" : ""}`}
                          >
                            <div className="flex items-center space-x-3">
                              {item.iconImg ? (
                                <img src={item.iconImg} alt={item.name} className="h-4 w-4 object-contain sidebar-icon shrink-0" />
                              ) : (
                                <IconComponent className="h-4 w-4 sidebar-icon" />
                              )}
                              <span>{item.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.badge && (
                                <span className="text-[9px] font-bold uppercase bg-zinc-200 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 px-1.5 py-0.2 rounded border border-zinc-300 dark:border-zinc-200">
                                  {item.badge}
                                </span>
                              )}
                              <ChevronDown 
                                className={`h-3.5 w-3.5 sidebar-chevron ${isOpen ? "rotate-180" : ""}`} 
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
                              {visibleSubItems.map((sub, sIdx) => {
                                const SubIcon = (sub.iconName && ICON_MAP[sub.iconName]) || null;
                                return (
                                  <Link
                                    key={sub.id || sIdx}
                                    href={sub.href}
                                    prefetch={true}
                                    onMouseEnter={() => router.prefetch(sub.href)}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer sidebar-subitem ${pathname === sub.href ? "active" : ""}`}
                                  >
                                    {sub.iconImg ? (
                                      <img src={sub.iconImg} alt={sub.name} className="h-3.5 w-3.5 object-contain shrink-0 sidebar-icon" />
                                    ) : SubIcon ? (
                                      <SubIcon className="h-3.5 w-3.5 shrink-0 sidebar-icon" />
                                    ) : null}
                                    <span>{sub.name}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const isDashItem = item.id === 'item-dash' || item.name === 'Dashboard';
                    const targetHref = item.href || '/dashboard';
                    const isItemActive = pathname === targetHref;

                    return (
                      <Link
                        key={item.id || iIdx}
                        href={targetHref}
                        prefetch={true}
                        onMouseEnter={() => router.prefetch(targetHref)}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer sidebar-item ${isItemActive ? "active" : ""}`}
                      >
                        <div className="flex items-center space-x-3">
                          {item.iconImg ? (
                            <img src={item.iconImg} alt={item.name} className="h-4 w-4 object-contain sidebar-icon shrink-0" />
                          ) : (
                            <IconComponent className="h-4 w-4 sidebar-icon" />
                          )}
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
            <div ref={searchContainerRef} className="relative w-full max-w-xs sm:max-w-sm hidden sm:block">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search pages, attendance, labs..."
                  value={globalSearchStr}
                  onFocus={() => {
                    if (globalSearchStr.trim()) setIsSearchOpen(true);
                  }}
                  onChange={(e) => {
                    setGlobalSearchStr(e.target.value);
                    setIsSearchOpen(true);
                    setSelectedSearchIndex(-1);
                  }}
                  onKeyDown={handleGlobalSearchKeyDown}
                  className="w-full bg-zinc-100/40 dark:bg-zinc-50 border border-zinc-300/80 dark:border-zinc-200 rounded-xl pl-9 pr-8 py-1.5 text-xs text-zinc-900 dark:text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-[#084A86] focus:ring-2 focus:ring-sky-100 transition-all cursor-text"
                />
                {globalSearchStr && (
                  <button
                    onClick={() => {
                      setGlobalSearchStr('');
                      setIsSearchOpen(false);
                      setSelectedSearchIndex(-1);
                    }}
                    className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-900 rounded-full hover:bg-zinc-200/60 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Auto-complete Dropdown */}
              {isSearchOpen && globalSearchStr.trim().length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-[340px] sm:w-[400px] max-w-[90vw] bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-300 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-150">
                  {/* Header */}
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-200 bg-zinc-50/80 dark:bg-zinc-100/80 text-[11px] font-semibold text-zinc-500">
                    <span className="flex items-center gap-1.5 text-zinc-700 font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-[#084A86]" />
                      {searchResults.length > 0 ? `Results (${searchResults.length})` : 'Search Pages'}
                    </span>
                    <span className="text-[10px] text-zinc-400">ESC to close</span>
                  </div>

                  {/* Results List */}
                  <div className="max-h-80 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                    {searchResults.length > 0 ? (
                      searchResults.map((item, idx) => {
                        const isSelected = idx === selectedSearchIndex;
                        const ItemIcon = (item.iconName && ICON_MAP[item.iconName]) || LayoutDashboard;

                        return (
                          <div
                            key={item.route + idx}
                            onMouseEnter={() => setSelectedSearchIndex(idx)}
                            onClick={() => navigateToRoute(item.route)}
                            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
                              isSelected
                                ? 'bg-sky-50 dark:bg-sky-50/80 border-l-4 border-[#084A86] text-[#084A86] shadow-sm'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-100 text-zinc-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-white border-sky-200 text-[#084A86]'
                                    : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                                }`}
                              >
                                {item.iconImg ? (
                                  <img src={item.iconImg} alt={item.label} className="h-4 w-4 object-contain" />
                                ) : (
                                  <ItemIcon className="h-4 w-4" />
                                )}
                              </div>
                              <div className="min-w-0 text-left">
                                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-900 truncate">
                                  {highlightMatch(item.label, globalSearchStr)}
                                </div>
                                <div className="text-[10px] text-zinc-500 font-medium truncate flex items-center gap-1">
                                  <span>{item.groupTitle || 'Menu'}</span>
                                  <span>›</span>
                                  <span>{item.category || item.label}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.badge ? (
                                <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                                  {item.badge}
                                </span>
                              ) : item.category ? (
                                <span className="text-[9px] font-semibold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                                  {item.category}
                                </span>
                              ) : null}
                              <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-[#084A86]' : 'text-zinc-400 opacity-60'}`} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 px-4 text-center">
                        <div className="mx-auto h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2">
                          <Search className="h-5 w-5" />
                        </div>
                        <div className="text-xs font-bold text-zinc-800">
                          No matching pages found for &quot;{globalSearchStr}&quot;
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1 mb-3">
                          Try searching by page title or keyword
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {['Attendance', 'Fees', 'Labs', 'Optional Subject', 'Homework', 'Events', 'Exam'].map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => {
                                setGlobalSearchStr(suggestion);
                                setSelectedSearchIndex(-1);
                                searchInputRef.current?.focus();
                              }}
                              className="px-2 py-0.5 text-[10px] font-medium bg-zinc-100 hover:bg-sky-100 text-zinc-700 hover:text-[#084A86] border border-zinc-200 rounded-md transition-colors cursor-pointer"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Instructions */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-100 text-[10px] text-zinc-500">
                    <span>Quick Navigation</span>
                    <div className="flex items-center gap-2">
                      <span><kbd className="px-1 py-0.5 bg-white border border-zinc-200 rounded text-[9px]">↑↓</kbd> Move</span>
                      <span><kbd className="px-1 py-0.5 bg-white border border-zinc-200 rounded text-[9px]">↵</kbd> Select</span>
                    </div>
                  </div>
                </div>
              )}
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
            
            
            {(user?.role === 'Super Admin' || user?.role === 'Admin') && (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full cursor-default" title="Active Students (Logged in last 10 mins)">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-800">{activeStudentsCount} Active</span>
              </div>
            )}
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Fullscreen (F11)'}
              className="hidden sm:flex items-center justify-center p-2 rounded-lg bg-zinc-100/40 dark:bg-zinc-50 border border-zinc-300/80 dark:border-zinc-200 text-zinc-950 dark:text-zinc-600 hover:text-zinc-800 hover:border-zinc-950 transition-colors cursor-pointer"
            >
              {isFullscreen
                ? <Minimize className="h-4 w-4" />
                : <Maximize2 className="h-4 w-4" />
              }
            </button>

            <ThemeToggle />


            {/* Notifications Dropdown */}
            <div className="relative">
              {(() => {
                const unreadNotifs = liveNotifications.filter(n => !n.isRead && !n.read);
                const unreadCount = unreadNotifs.length;

                return (
                  <>
                                          <button 
                        onClick={() => {
                          setIsNotifOpen(!isNotifOpen);
                          if (!isNotifOpen) {
                            const currentIds = liveNotifications.map(n => n._id).filter(Boolean);
                            if (typeof window !== 'undefined') {
                              try {
                                const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
                                const newReadIds = [...new Set([...readIds, ...currentIds])];
                                localStorage.setItem('read_notifs', JSON.stringify(newReadIds));
                              } catch(e){}
                            }
                            setLiveNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
                            setHasUnreadNotif(false);
                          }
                        }}
                        className="relative p-2 rounded-lg bg-zinc-100/40 dark:bg-zinc-50 border border-zinc-300/80 dark:border-zinc-200 text-zinc-950 dark:text-zinc-600 hover:text-zinc-800 hover:border-zinc-950 transition-colors cursor-pointer"
                      >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>
                      {isNotifOpen && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-50 border border-zinc-300 dark:border-zinc-200 rounded-xl shadow-2xl overflow-hidden z-50">
                          <div className="p-3 border-b border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-900">Notifications</span>
                            <span 
                              onClick={() => {
                                const currentIds = liveNotifications.map(n => n._id).filter(Boolean);
                                if (typeof window !== 'undefined') {
                                  try {
                                    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
                                    const newReadIds = [...new Set([...readIds, ...currentIds])];
                                    localStorage.setItem('read_notifs', JSON.stringify(newReadIds));
                                  } catch(e){}
                                }
                                setLiveNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
                                setHasUnreadNotif(false);
                              }} 
                              className="text-[10px] text-emerald-600 font-bold cursor-pointer hover:underline"
                            >
                              Mark all read
                            </span>
                          </div>
                          <div className="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                            {liveNotifications.length > 0 ? liveNotifications.map(notif => (
                              <div key={notif._id || notif.id || Math.random()} className={`p-2.5 rounded-lg border cursor-pointer hover:bg-zinc-100 transition-colors ${notif.isRead || notif.read ? 'bg-zinc-50 dark:bg-zinc-100 border-zinc-200' : 'bg-white dark:bg-white border-zinc-300 shadow-sm'}`}>
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-xs text-zinc-900 ${notif.isRead || notif.read ? 'font-semibold' : 'font-bold'}`}>{notif.title || 'System Notification'}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-zinc-500 font-medium">{notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (notif._id && typeof window !== 'undefined') {
                                          try {
                                            const delIds = JSON.parse(localStorage.getItem('deleted_notifs') || '[]');
                                            delIds.push(notif._id);
                                            localStorage.setItem('deleted_notifs', JSON.stringify([...new Set(delIds)]));
                                          } catch(err){}
                                        }
                                        setLiveNotifications(prev => prev.filter(n => n._id !== notif._id));
                                      }}
                                      className="text-zinc-400 hover:text-rose-600 transition-colors p-0.5 rounded-md hover:bg-rose-50"
                                      title="Delete notification"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="text-[11px] text-zinc-600 dark:text-zinc-600 mt-0.5 leading-snug">{notif.message}</div>
                              </div>
                            )) : (
                              <div className="p-6 text-center text-xs text-zinc-500 font-medium">
                                No new notifications
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </>
                );
              })()}
            </div>

            {/* Profile Dropdown */}
            {(() => {
              const isAdmRoute = pathname.startsWith('/dashboard/admin');
              const isAdmUser = user?.role === 'Admin' || user?.email === 'admin@gmail.com';
              const isSuperUser = user?.role === 'Super Admin' || user?.email === 'super@gmail.com';

              const displayUsername = user?.fullName || user?.firstName || user?.name || (
                isSuperUser ? 'Super Admin' : (isAdmUser ? 'Admin' : (user?.username || 'User'))
              );

              const displayRole = (isAdmRoute || isAdmUser) && !isSuperUser
                ? 'ADMIN'
                : (user?.role || (isAdmRoute ? 'ADMIN' : 'SUPER ADMIN'));

              const displayInitial = displayUsername.charAt(0).toUpperCase() || 'A';
              const displayEmail = (isAdmRoute || isAdmUser) && !isSuperUser
                ? (user?.email || 'admin@gmail.com')
                : (user?.email || 'super@gmail.com');

              const userAvatar = user?.avatar || user?.picture;

              return (
                <div className="relative flex items-center space-x-3 border-l border-zinc-200 dark:border-zinc-200 pl-3">
                  <div 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-100 border border-zinc-400 dark:border-zinc-200 flex items-center justify-center text-zinc-950 dark:text-zinc-900 font-bold text-xs cursor-pointer hover:bg-zinc-300/60 transition-colors overflow-hidden"
                  >
                    {userAvatar ? (
                      <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
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
                        {user?.username && (
                          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-700">@{user.username}</div>
                        )}
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
                        onClick={() => { setIsProfileOpen(false); router.push('/dashboard/settings/billing'); }}
                        className="px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 cursor-pointer flex items-center gap-2 transition-colors"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Subscription & Billing
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

      {/* Popup Modal for Notice / Event */}
      {showNoticePopup && latestNotice && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-300 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-300">
            <div className={`flex items-center justify-between px-5 py-4 ${latestNotice._popupType === 'Event' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
              <div className="flex items-center gap-2 text-zinc-950">
                {latestNotice._popupType === 'Event' ? (
                  <CalendarDays className="h-5 w-5 animate-bounce" />
                ) : (
                  <Bell className="h-5 w-5 animate-bounce" />
                )}
                <h3 className="font-bold text-sm tracking-wide">
                  {latestNotice._popupType === 'Event' ? '🎉 New Event Announced' : '📢 New Notice'}
                </h3>
              </div>
              <button 
                onClick={() => setShowNoticePopup(false)}
                className="text-zinc-950/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h4 className="text-lg font-bold text-zinc-900 mb-2">{latestNotice.title}</h4>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-500 mb-4">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">For: {latestNotice.audience || latestNotice.noticeTo || latestNotice.eventFor}</span>
                <span>•</span>
                <span>{latestNotice.date ? new Date(latestNotice.date).toLocaleDateString() : latestNotice.startDate}</span>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar font-medium whitespace-pre-wrap">
                {latestNotice.description}
              </p>
              
              {latestNotice.location && (
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-600 bg-zinc-100 p-2 rounded-lg border border-zinc-200">
                  <span className="font-bold text-zinc-900">Location:</span> {latestNotice.location}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
              <Button 
                onClick={() => setShowNoticePopup(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Stoofi AI Floating Assistant */}
      <StoofiAiFloating />
    </div>
  );
}






