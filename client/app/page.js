"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { translations } from "@/utils/translations";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle2, Monitor, Users, GraduationCap, Calculator,
  ShieldCheck, Menu, X, Star, ArrowRight, Zap, BarChart3,
  Bell, BookOpen, CreditCard, Clock, Globe, Phone, Mail, MapPin,
  Settings2, UserPlus, FileSpreadsheet, Award, HelpCircle, ChevronDown, Search,
  LogOut, LayoutDashboard, User
} from "lucide-react";

export default function LandingPage() {
  const { user, isAuthenticated, logout, checkAuth } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState("admin");
  const [openFaq, setOpenFaq] = useState(0);
  const [lang, setLang] = useState("EN");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [recentUser, setRecentUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('recent_user');
        if (stored) {
          setRecentUser(JSON.parse(stored));
        }
      } catch (e) {}
    }
  }, []);

  const activeUser = user || (mounted ? recentUser : null);
  const isUserAvailable = (isAuthenticated && !!user) || (mounted && !!recentUser);

  const getDashboardUrl = (targetUser = activeUser) => {
    const r = (targetUser?.role || '').toLowerCase();
    if (r.includes('student')) return '/dashboard/student';
    if (r.includes('teacher')) return '/dashboard/teacher';
    if (r.includes('super admin') || r.includes('superadmin')) return '/dashboard';
    if (r.includes('admin')) return '/dashboard';
    return '/dashboard';
  };

  // Notices state
  const [publicNotices, setPublicNotices] = useState([]);
  const [selectedPublicNotice, setSelectedPublicNotice] = useState(null);
  const [noticeSearch, setNoticeSearch] = useState("");
  const [selectedNoticeTab, setSelectedNoticeTab] = useState("All");

  // Today Event Popup state
  const [todayEvent, setTodayEvent] = useState(null);
  const [showTodayEventModal, setShowTodayEventModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedEvents = localStorage.getItem('dashboard_events');
        if (storedEvents) {
          const parsed = JSON.parse(storedEvents);
          const todayStr = new Date().toDateString();
          
          const todaysEvent = parsed.find(ev => {
            if (!ev.date) return false;
            return new Date(ev.date).toDateString() === todayStr;
          });

          if (todaysEvent) {
            setTodayEvent(todaysEvent);
            const timer = setTimeout(() => {
              setShowTodayEventModal(true);
            }, 2000);
            return () => clearTimeout(timer);
          }
        }
      } catch (_) {}
    }
  }, []);

  const t = translations[lang] || translations['EN'];

  const changeLanguage = (langCode) => {
    setLang(langCode);
    setIsLangDropdownOpen(false);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('stoofi_lang', langCode);
      
      let googleLang = 'en';
      if (langCode === 'UR') googleLang = 'ur';
      if (langCode === 'AR') googleLang = 'ar';
      
      document.cookie = `googtrans=/en/${googleLang}; path=/`;
      window.location.reload();
    }
  };


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Notices
  useEffect(() => {
    const fetchPublicNotices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/notices`);
        const result = await res.json();
        if (result.success && result.data) {
          const noticesOnly = result.data.filter(item => item.type === 'Notice');
          setPublicNotices(noticesOnly);
        } else {
          setPublicNotices([]);
        }
      } catch (error) {
        console.error("Failed to fetch public notices:", error);
        setPublicNotices([]);
      }
    };

    fetchPublicNotices();
  }, []);

  const formatNoticeDate = (dateStr) => {
    try {
      const d = new Date(dateStr || Date.now());
      if (isNaN(d.getTime())) return { day: '15', month: 'SEP', year: '2026' };
      const day = d.getDate().toString().padStart(2, '0');
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = d.getFullYear();
      return { day, month, year };
    } catch (_) {
      return { day: '15', month: 'SEP', year: '2026' };
    }
  };

  const filteredPublicNotices = publicNotices.filter((n) => {
    const titleMatch = (n.title || '').toLowerCase().includes(noticeSearch.toLowerCase()) || (n.description || '').toLowerCase().includes(noticeSearch.toLowerCase());
    const audienceMatch = selectedNoticeTab === 'All' || (n.noticeTo && (n.noticeTo === selectedNoticeTab || n.noticeTo === 'All')) || (n.audience && (n.audience === selectedNoticeTab || n.audience === 'All'));
    return titleMatch && audienceMatch;
  });


  // Animated counter
  const [countersStarted, setCountersStarted] = useState(false);
  const [counts, setCounts] = useState({ schools: 0, students: 0, uptime: 0, rating: 0 });
  const statsRef = useRef(null);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check auth on mount to restore session
  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersStarted) {
          setCountersStarted(true);
          const targets = { schools: 500, students: 200, uptime: 99.9, rating: 5 };
          const duration = 2000;
          const steps = 60;
          const interval = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setCounts({
              schools: Math.floor(targets.schools * eased),
              students: Math.floor(targets.students * eased),
              uptime: Math.min((targets.uptime * eased).toFixed(1), targets.uptime),
              rating: Math.min((targets.rating * eased).toFixed(1), targets.rating),
            });
            if (step >= steps) clearInterval(timer);
          }, interval);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [countersStarted]);

  const portals = [
    { title: "Super Admin", desc: "Full control over the entire system, settings, branches, and all users.", icon: ShieldCheck, color: "text-zinc-800 dark:text-zinc-900", bg: "bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200" },
    { title: "Teacher", desc: "Manage classes, attendance, homework, assignments, and student grades.", icon: Monitor, color: "text-zinc-800 dark:text-zinc-900", bg: "bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200" },
    { title: "Student", desc: "Access homework, schedules, exam results, study material, and fees.", icon: GraduationCap, color: "text-zinc-800 dark:text-zinc-900", bg: "bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200" },
    { title: "Accountant", desc: "Handle fee collection, payroll, expenses, invoices, and bank payments.", icon: Calculator, color: "text-zinc-800 dark:text-zinc-900", bg: "bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200" },
    { title: "Parents", desc: "Track child progress, attendance, fee status and communicate with teachers.", icon: Users, color: "text-zinc-800 dark:text-zinc-900", bg: "bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200" },
  ];

  const howToUseSteps = [
    {
      role: "admin",
      roleTitle: "School Setup & Onboarding",
      badge: "Quick Setup (Day 1)",
      steps: [
        { number: "01", title: "General Settings & Academic Year", desc: "Set up school name, logo, currency, grading systems, and define the active academic session (e.g. 2026).", icon: Settings2 },
        { number: "02", title: "Classes, Sections & Subjects", desc: "Create classes (e.g., Class 1 to 10), assign sections (A, B, C), and map curriculum subjects with teacher allocations.", icon: BookOpen },
        { number: "03", title: "Staff & Student Enrollment", desc: "Add teachers, assign roles/permissions, and enroll students with parent contact info or bulk import via Excel/CSV.", icon: UserPlus },
        { number: "04", title: "System Activation & Live Go", desc: "Enable automated SMS gateway, issue portal credentials to parents & staff, and monitor live dashboard analytics.", icon: ShieldCheck }
      ]
    },
    {
      role: "accountant",
      roleTitle: "Fee & Financial Management",
      badge: "Accounting Workflow",
      steps: [
        { number: "01", title: "Configure Fee Structure", desc: "Define monthly tuition fees, admission charges, transport fees, and customized concession/discount rules.", icon: Calculator },
        { number: "02", title: "Bulk Invoicing & Carry Forward", desc: "Auto-generate monthly fee invoice vouchers for entire classes with previous unpaid balance carry-forward.", icon: CreditCard },
        { number: "03", title: "Collect & Reconcile Payments", desc: "Record cash, bank transfers, or online payment submissions with instant printed & digital receipts.", icon: FileSpreadsheet },
        { number: "04", title: "Profit & Loss / Payroll", desc: "Process monthly staff payroll, record daily school expenses, and generate detailed profit/loss balance sheets.", icon: BarChart3 }
      ]
    },
    {
      role: "teacher",
      roleTitle: "Daily Teaching & Academic Flow",
      badge: "Classroom Workflow",
      steps: [
        { number: "01", title: "Class Timetable & Roster", desc: "Access the teacher portal to view daily schedule, class timetable, and student lists with contact details.", icon: Monitor },
        { number: "02", title: "1-Tap Attendance with SMS", desc: "Mark student attendance (Present/Absent/Late) in under 30 seconds with automatic instant SMS alert to parents.", icon: Clock },
        { number: "03", title: "Homework & Syllabus Sharing", desc: "Publish daily homework assignments, lecture notes, syllabus files, and study materials for students.", icon: BookOpen },
        { number: "04", title: "Online Exams & Auto Grading", desc: "Build MCQ/descriptive question banks, conduct online tests, and publish report cards with auto grade ranking.", icon: Award }
      ]
    },
    {
      role: "student",
      roleTitle: "Student & Parent Self-Service",
      badge: "Portal Experience",
      steps: [
        { number: "01", title: "Instant Mobile/Web Login", desc: "Login securely using student admission ID or registered parent phone number across web and mobile browsers.", icon: GraduationCap },
        { number: "02", title: "Daily Homework & Notices", desc: "Review daily homework deadlines, download teacher study notes, and check school event announcements.", icon: FileSpreadsheet },
        { number: "03", title: "Fee Slips & Online Receipts", desc: "View due fee vouchers, download official stamp receipts, and verify submitted bank payment proofs.", icon: CreditCard },
        { number: "04", title: "Progress & Exam Report Cards", desc: "Track subject-wise term marks, class position ranks, percentage graphs, and daily attendance percentages.", icon: Award }
      ]
    }
  ];

  const features = [
    { icon: CreditCard, title: "Comprehensive Fee Management", slug: "fee-management", desc: "Auto-generate fee invoices, track partial & full payments, apply dynamic discounts, add late fines, and print detailed fee receipts instantly." },
    { icon: Clock, title: "Smart Attendance System", slug: "attendance", desc: "1-Tap student & staff attendance tracking with instant absentee SMS alerts for parents. Supports future RFID/Biometric integration." },
    { icon: Award, title: "Advanced Exam & Results", slug: "exam-results", desc: "Create dynamic exam schedules, manage subject-wise marks, print beautiful customized report cards, and auto-calculate grades & positions." },
    { icon: BookOpen, title: "LMS & Online E-Learning", slug: "lms-elearning", desc: "Upload detailed study notes, assign and grade digital homework, manage class syllabus, and conduct secure online exams with auto-grading." },
    { icon: Users, title: "HR & Payroll Administration", slug: "hr-payroll", desc: "Maintain complete staff profiles, handle leave requests, track daily employee attendance, and generate automated custom salary slips." },
    { icon: BarChart3, title: "Live Financial Accounting", slug: "financial-accounting", desc: "Monitor daily school cash flows, record income/expenses, manage chart of accounts, and generate real-time Profit & Loss balance sheets." },
    { icon: Globe, title: "Multi-Branch Central Control", slug: "multi-branch", desc: "Manage multiple school campuses from a single Super Admin login. Compare branch revenues, standardize data, and track global analytics." },
    { icon: Bell, title: "Automated Communication", slug: "communication", desc: "Send bulk SMS and email notifications to parents and staff regarding fee dues, exam results, holiday notices, and emergency alerts." },
    { icon: ShieldCheck, title: "Role-Based Access Security", slug: "security", desc: "Secure data with strict permission locks. Ensure Accountants only see finances, Teachers only see academics, and Parents only see their child's data." },
  ];

  const testimonials = [
    { name: "Khalid Mehmood", role: "Principal, Al-Noor School System", text: "Stoofi transformed how we manage our 1200+ students. The fee collection and attendance system alone saves us 3 hours daily.", stars: 5 },
    { name: "Sara Ahmed", role: "Admin, Bright Future Academy", text: "The multi-portal design is brilliant. Teachers love it, parents love it, and our admin team can finally breathe!", stars: 5 },
    { name: "Usman Tariq", role: "Director, Scholars Institute", text: "Switching from manual registers to Stoofi was the best decision. Reports that used to take days now take seconds.", stars: 5 },
  ];

  const faqs = [
    { q: "How quickly can our school get up and running on Stoofi ERP?", a: "Most schools go live in less than 24 hours. Our step-by-step onboarding wizard lets you configure classes, assign teachers, and bulk import student records via Excel in minutes." },
    { q: "How do automated SMS notifications work?", a: "Stoofi integrates with SMS gateways. Whenever attendance is marked, fee vouchers are generated, or exam results are published, the system automatically dispatches customized SMS alerts to parents' mobile numbers." },
    { q: "Can we manage multi-branch campuses with single billing?", a: "Yes! Super Admin accounts have multi-branch capabilities to oversee branch finances, compare campus performance, and transfer students between branches seamlessly." },
    { q: "Is our student and financial data safe?", a: "Absolutely. Stoofi ERP features end-to-end encryption, role-based permission locks, daily automated cloud database backups, and 99.9% uptime reliability." }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-white text-zinc-900 dark:text-zinc-900 font-poppins selection:bg-zinc-600 selection:text-white transition-colors duration-300">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 dark:bg-white/90 backdrop-blur-lg border-b border-zinc-100 dark:border-zinc-200 py-3 shadow-sm" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/stoofi light.png" alt="Stoofi" className="h-10 sm:h-11 w-auto object-contain transform hover:scale-105 transition-transform duration-300" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#home" className="text-sm font-semibold text-zinc-600 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">{t.nav.home}</Link>
            <Link href="#notices" className="text-sm font-semibold text-zinc-600 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">{t.nav.notices || "Notice Board"}</Link>
            <Link href="#how-it-works" className="text-sm font-semibold text-zinc-600 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">{t.nav.howToUse}</Link>
            <Link href="#about" className="text-sm font-semibold text-zinc-600 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">{t.nav.portals}</Link>
            <Link href="#features" className="text-sm font-semibold text-zinc-600 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">{t.nav.features}</Link>
            <Link href="#pricing" className="text-sm font-semibold text-zinc-600 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">{t.nav.pricing}</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <div 
                className="flex items-center justify-between gap-1.5 bg-zinc-100 dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-800 font-bold cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors min-w-[54px]"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              >
                <span>{lang}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {isLangDropdownOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-28 bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-xl shadow-2xl overflow-hidden p-1 z-50">
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
                          ? 'bg-zinc-100 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 font-bold' 
                          : 'text-zinc-700 dark:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-100 hover:text-zinc-800 font-medium'
                      }`}
                    >
                      {l.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ThemeToggle />
            {isUserAvailable && activeUser ? (
              <div className="flex items-center gap-2">
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-full py-1.5 px-3 transition-colors"
                  >
                    {activeUser?.avatar || activeUser?.picture ? (
                      <img loading="lazy" src={activeUser.avatar || activeUser.picture} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-zinc-300" />
                    ) : (
                      <div className="w-7 h-7 bg-zinc-900 rounded-full flex items-center justify-center text-white text-xs font-black">
                        {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : <User size={14} color="#ffffff" />}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-xs font-bold text-zinc-900 leading-tight truncate max-w-[100px]">
                        {activeUser?.name || activeUser?.fullName || activeUser?.email?.split('@')[0]}
                      </p>
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase leading-none">
                        {activeUser?.role || 'Member'}
                      </p>
                    </div>
                    <ChevronDown size={14} className={`text-zinc-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-zinc-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-zinc-100 mb-1">
                        <p className="text-sm font-bold text-zinc-900 truncate">{activeUser?.name || activeUser?.fullName || activeUser?.email}</p>
                        <p className="text-xs text-zinc-500 truncate">{activeUser?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {activeUser?.role || 'User'}
                        </span>
                      </div>
                      <Link 
                        href={getDashboardUrl(activeUser)}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          if (typeof window !== 'undefined') {
                            localStorage.removeItem('recent_user');
                          }
                          setIsProfileOpen(false);
                          window.location.href = '/';
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut size={16} />
                        Logout / Switch
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-full px-6 shadow-sm" style={{ color: '#ffffff' }}>
                  Login
                </Button>
              </Link>
            )}
          </div>
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Language Button */}
            <div className="relative">
              <button 
                className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 dark:text-zinc-800"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              >
                <span>{lang}</span>
                <ChevronDown size={12} className={isLangDropdownOpen ? 'rotate-180' : ''} />
              </button>
              {isLangDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-28 bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-xl shadow-xl p-1 z-50">
                  {[
                    { code: 'EN', name: 'English' },
                    { code: 'UR', name: 'Urdu' },
                    { code: 'AR', name: 'Arabic' }
                  ].map((l) => (
                    <div 
                      key={l.code} 
                      onClick={() => changeLanguage(l.code)}
                      className={`px-3 py-2 text-xs rounded-lg cursor-pointer ${
                        lang === l.code ? 'bg-zinc-100 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 font-bold' : 'text-zinc-700 dark:text-zinc-700 font-medium'
                      }`}
                    >
                      {l.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ThemeToggle />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-700 dark:text-zinc-700">{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-white border-b border-zinc-100 dark:border-zinc-200 px-6 py-4 flex flex-col gap-3">
            <Link href="#home" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-700 dark:text-zinc-700 py-1.5">Home</Link>
            <Link href="#notices" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-700 dark:text-zinc-700 py-1.5">Notice Board</Link>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-700 dark:text-zinc-700 py-1.5">How To Use</Link>
            <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-700 dark:text-zinc-700 py-1.5">Portals</Link>
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-700 dark:text-zinc-700 py-1.5">Features</Link>
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-zinc-700 dark:text-zinc-700 py-1.5">Pricing</Link>
            {isUserAvailable && activeUser ? (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                  {activeUser?.avatar || activeUser?.picture ? (
                    <img loading="lazy" src={activeUser.avatar || activeUser.picture} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-zinc-300 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0">
                      {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : <User size={16} color="#ffffff" />}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-zinc-900 truncate">{activeUser?.name || activeUser?.fullName || activeUser?.email}</p>
                    <p className="text-xs text-zinc-500 truncate">{activeUser?.email}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800">
                      {activeUser?.role || 'Member'}
                    </span>
                  </div>
                </div>
                <Link 
                  href={getDashboardUrl(activeUser)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white justify-start gap-2 rounded-xl py-3 font-bold">
                    <LayoutDashboard size={16} />
                    Go to Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => {
                    logout();
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('recent_user');
                    }
                    setMobileMenuOpen(false);
                    window.location.href = '/';
                  }}
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 justify-start gap-2 rounded-xl"
                >
                  <LogOut size={16} />
                  Logout / Switch
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-zinc-100">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl mt-2" style={{ color: '#ffffff' }}>Login</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <section id="home" className="relative pt-36 pb-20 lg:pt-48 lg:pb-28 bg-white dark:bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-50 text-zinc-800 dark:text-zinc-900 text-xs font-bold uppercase tracking-wider mb-8 border border-zinc-200 dark:border-zinc-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600"></span>
            </span>
            {t.hero.badge}
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-zinc-900 dark:text-zinc-900">
            {t.hero.title1} <br /><span className="text-zinc-800 dark:text-zinc-900">{t.hero.title2}</span> {t.hero.title3}
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.hero.desc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isUserAvailable && activeUser ? (
              <Link href={getDashboardUrl(activeUser)}>
                <Button className="h-14 px-10 text-base bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-bold shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  Go to Dashboard <ArrowRight size={16} />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="h-14 px-10 text-base bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-bold shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  Login <ArrowRight size={16} />
                </Button>
              </Link>
            )}
            <Link href="#how-it-works">
              <Button variant="outline" className="h-14 px-10 text-base rounded-full font-bold border-2 border-zinc-800 text-zinc-800 bg-transparent hover:bg-zinc-100 transition-all">
                {t.hero.howItWorks} <ArrowRight size={16} className="ml-2 inline" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar with Animated Number Counters ── */}
      <section ref={statsRef} className="py-12 bg-zinc-50 dark:bg-white border-y border-zinc-200 dark:border-zinc-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 shadow-sm">
              <div className="text-4xl font-extrabold text-zinc-800 dark:text-zinc-900 mb-1 tabular-nums">{counts.schools}+</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-600 font-bold uppercase tracking-wider">{t.stats.schools}</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 shadow-sm">
              <div className="text-4xl font-extrabold text-zinc-800 dark:text-zinc-900 mb-1 tabular-nums">{counts.students}K+</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-600 font-bold uppercase tracking-wider">{t.stats.students}</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 shadow-sm">
              <div className="text-4xl font-extrabold text-zinc-800 dark:text-zinc-900 mb-1 tabular-nums">{counts.uptime}%</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-600 font-bold uppercase tracking-wider">{t.stats.uptime}</div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 shadow-sm">
              <div className="text-4xl font-extrabold text-zinc-800 dark:text-zinc-900 mb-1 tabular-nums">{counts.rating} ★</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-600 font-bold uppercase tracking-wider">{t.stats.rating}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Public Notice Board Section ── */}
      {publicNotices.length > 0 && (
        <section id="notices" className="py-24 bg-white dark:bg-white border-b border-zinc-200 dark:border-zinc-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-900 uppercase tracking-widest mb-3 block">School Announcements</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-900 mb-4">Latest Circulars & Notices</h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-600 max-w-2xl mx-auto">
                Stay updated with the latest news, events, and important announcements from the school administration.
              </p>
            </div>

            {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-50 rounded-lg p-1 w-full md:w-auto overflow-x-auto no-scrollbar">
              {['All', 'Students', 'Parents', 'Teachers', 'Staff'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedNoticeTab(tab)}
                  className={`px-5 py-2 text-sm font-bold rounded-md whitespace-nowrap transition-all ${selectedNoticeTab === tab ? 'bg-white dark:bg-zinc-800 text-zinc-800 shadow-sm' : 'text-zinc-600 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-950'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search notices..."
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Notices Grid */}
          {filteredPublicNotices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicNotices.map((notice) => {
                const dateParts = formatNoticeDate(notice.noticeDate || notice.date);
                return (
                  <div key={notice._id} onClick={() => setSelectedPublicNotice(notice)} className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-zinc-600/10 to-transparent rounded-bl-full -z-0"></div>
                    <div className="flex items-start gap-4 mb-4 relative z-10">
                      {/* Date Badge */}
                      <div className="bg-zinc-100 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-200 rounded-xl p-2 text-center min-w-[60px] shrink-0">
                        <div className="text-xl font-black text-zinc-800 dark:text-zinc-900 leading-none">{dateParts.day}</div>
                        <div className="text-[10px] font-bold text-zinc-800 dark:text-zinc-900 uppercase mt-1 tracking-wider">{dateParts.month}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-600">
                            {notice.noticeTo || notice.audience || 'All'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-900 line-clamp-2 leading-snug group-hover:text-zinc-800 transition-colors">
                          {notice.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-600 line-clamp-3 mb-5 flex-1 relative z-10">
                      {notice.description}
                    </p>
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-200 flex items-center justify-between mt-auto relative z-10">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-700">By:</span> {notice.createdBy || 'Admin'}
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-200">
              <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Bell size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-900 mb-2">No Notices Found</h3>
              <p className="text-zinc-500 dark:text-zinc-600 text-sm">There are no active circulars or announcements matching your criteria right now.</p>
            </div>
          )}
        </div>
      </section>
      )}

      {/* ── How To Use / Step-by-Step Guide Section ── */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-900 uppercase tracking-widest mb-3 block">Step-by-Step System Guide</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-900 mb-4">How To Use Stoofi ERP</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-600 max-w-2xl mx-auto">
              Follow these simple, streamlined workflows designed for every user role in your institution.
            </p>

            {/* Role Switcher Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { id: "admin", label: "Super Admin Flow", icon: ShieldCheck, badge: "Setup" },
                { id: "accountant", label: "Accountant Flow", icon: Calculator, badge: "Finance" },
                { id: "teacher", label: "Teacher Flow", icon: Monitor, badge: "Academic" },
                { id: "student", label: "Student & Parent Flow", icon: GraduationCap, badge: "Portal" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStepTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    activeStepTab === tab.id
                      ? "bg-zinc-800 text-white shadow-md shadow-zinc-800/20"
                      : "bg-zinc-100 dark:bg-zinc-50 text-zinc-700 dark:text-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-100"
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${activeStepTab === tab.id ? "bg-white/20 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-600"}`}>
                    {tab.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Workflow Sub-heading */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-900 uppercase tracking-wider">
                {(howToUseSteps.find(s => s.role === activeStepTab) || howToUseSteps[0]).badge}
              </span>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-900">
                {(howToUseSteps.find(s => s.role === activeStepTab) || howToUseSteps[0]).roleTitle}
              </h3>
            </div>
            <span className="text-xs font-semibold text-zinc-500 hidden sm:block">4 Simple Consecutive Steps</span>
          </div>

          {/* Workflow Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(howToUseSteps.find(s => s.role === activeStepTab) || howToUseSteps[0]).steps.map((step, idx) => (
              <div
                key={idx}
                className="relative p-7 rounded-2xl bg-zinc-50 dark:bg-zinc-50/60 border border-zinc-200 dark:border-zinc-200 hover:border-zinc-600/50 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-zinc-800/40 dark:text-zinc-900 group-hover:text-zinc-800 transition-colors">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-200 flex items-center justify-center text-zinc-800 dark:text-zinc-900 shadow-sm">
                      <step.icon size={22} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-600 leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-200/60 flex items-center text-xs font-bold text-zinc-800 dark:text-zinc-900">
                  <span>Step {idx + 1} of 4</span>
                  <ArrowRight size={14} className="ml-auto" />
                </div>
              </div>
            ))}
          </div>

          {/* Button linking to Detailed Guide Page */}
          <div className="mt-12 text-center">
            <Link href="/guide">
              <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:text-white font-bold rounded-full px-8 h-12 shadow-lg transition-colors">
                Read Detailed User Guide <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* FAQ Accordion Section */}
          <div className="mt-20 pt-16 border-t border-zinc-200 dark:border-zinc-200">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-900 uppercase tracking-widest block mb-2">Common Questions</span>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-900">Frequently Asked Questions</h3>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-50/50 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-5 text-left font-bold text-zinc-900 dark:text-zinc-900 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-zinc-800 dark:text-zinc-900 text-lg font-black shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-96 opacity-100 mb-5' : 'max-h-0 opacity-0 mb-0'}`}
                  >
                    <div className="px-5 text-sm text-zinc-600 dark:text-zinc-600 leading-relaxed border-t border-zinc-200/60 dark:border-zinc-200/60 pt-4">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-zinc-50 dark:bg-white border-t border-zinc-200 dark:border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-900 uppercase tracking-widest mb-3 block">Dedicated Portals</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-900 mb-4">One System, Five Portals</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-600 max-w-2xl mx-auto">Every role gets their own tailored dashboard — no clutter, just the right tools.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals.map((p, i) => (
              <div key={i} className={`p-8 rounded-2xl ${p.bg} hover:-translate-y-2 transition-all duration-300 group`}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-white dark:bg-zinc-50 shadow-sm group-hover:scale-110 transition-transform">
                  <p.icon size={26} className={p.color} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-900 mb-3">{p.title} Portal</h3>
                <p className="text-zinc-600 dark:text-zinc-600 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-white dark:bg-white border-t border-zinc-200 dark:border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-900 uppercase tracking-widest mb-3 block">Everything You Need</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-600 max-w-2xl mx-auto">Built for modern schools with all the tools needed to run efficiently.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Link key={i} href={`/guide/${f.slug}`} className="block">
                <div className="p-7 bg-zinc-50 dark:bg-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-200 hover:border-zinc-600/50 hover:shadow-lg transition-all group cursor-pointer h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-200 flex items-center justify-center mb-5">
                    <f.icon size={22} className="text-zinc-800 dark:text-zinc-900" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-900 mb-2">{f.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-600 text-sm leading-relaxed flex-1">{f.desc}</p>
                  <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-200 flex items-center text-xs font-bold text-zinc-800 dark:text-zinc-900 group-hover:gap-2 transition-all">
                    <span>Read Full Guide</span>
                    <ArrowRight size={13} className="ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-zinc-50 dark:bg-white border-t border-zinc-200 dark:border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-900 uppercase tracking-widest mb-3 block">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-900 mb-4">Loved By Schools</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-600">What educators are saying about Stoofi PRO.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 bg-white dark:bg-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-200">
                <div className="flex gap-1 mb-5">{Array.from({length: t.stars}).map((_, j) => <Star key={j} size={16} className="fill-amber-400 text-amber-400" />)}</div>
                <p className="text-zinc-700 dark:text-zinc-700 text-sm leading-relaxed mb-6 italic">&quot;{t.text}&quot;</p>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-900 text-sm">{t.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-white dark:bg-white border-t border-zinc-200 dark:border-zinc-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-900 uppercase tracking-widest mb-3 block">Pricing Plans</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-600">Start free for 1 month. No credit card required. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-900 mb-1">Basic</h3>
              <p className="text-sm text-zinc-500 mb-6">For small primary schools.</p>
              <div className="mb-6"><span className="text-5xl font-black text-zinc-900 dark:text-zinc-900">$29</span><span className="text-zinc-500">/mo</span></div>
              <ul className="space-y-4 mb-8">{["Up to 500 Students","Basic Attendance","Fee Management","Admin & Teacher Portals","Email Support"].map((f,i) => <li key={i} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-700"><CheckCircle2 size={18} className="text-zinc-600 shrink-0" />{f}</li>)}</ul>
              <Link href="/login"><Button variant="outline" className="w-full rounded-xl h-12 font-bold border-zinc-200 dark:border-zinc-200 text-zinc-700 dark:text-zinc-700">Start Free Trial</Button></Link>
            </div>
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-50 border-2 border-zinc-600 shadow-xl relative md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-zinc-800 text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">Most Popular</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-900 mb-1">Professional</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-600 mb-6">For growing high schools.</p>
              <div className="mb-6"><span className="text-5xl font-black text-zinc-900 dark:text-zinc-900">$79</span><span className="text-zinc-500">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {["Up to 2000 Students", "All 5 Portals Included", "Advanced Payroll & HR", "LMS & Online Exams", "SMS Notifications", "Priority Support"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-700">
                    <CheckCircle2 size={18} className="text-zinc-600 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/login"><Button className="w-full rounded-xl h-12 bg-zinc-800 hover:bg-zinc-800 text-white font-black shadow-md">Start 1 Month Free</Button></Link>
            </div>
            <div className="p-8 rounded-3xl bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-900 mb-1">Enterprise</h3>
              <p className="text-sm text-zinc-500 mb-6">For large school networks.</p>
              <div className="mb-6"><span className="text-5xl font-black text-zinc-900 dark:text-zinc-900">$199</span><span className="text-zinc-500">/mo</span></div>
              <ul className="space-y-4 mb-8">{["Unlimited Students","Multi-Branch Support","Custom Domain","White-label Mobile App","Dedicated Account Manager"].map((f,i) => <li key={i} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-700"><CheckCircle2 size={18} className="text-zinc-600 shrink-0" />{f}</li>)}</ul>
              <Link href="/login"><Button variant="outline" className="w-full rounded-xl h-12 font-bold border-zinc-200 dark:border-zinc-200 text-zinc-700 dark:text-zinc-700">Contact Sales</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Clean Dark / Neutral CTA Section (No Solid Green Banner) ── */}
      <section className="py-24 bg-zinc-50 dark:bg-white border-y border-zinc-200 dark:border-zinc-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Zap size={48} className="text-zinc-800 dark:text-zinc-900 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-900 mb-5">Ready to Digitize Your School?</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-600 mb-10 max-w-xl mx-auto">Join 500+ schools already running on Stoofi PRO. Get started with a full 1-month free trial — no credit card needed.</p>
          {isUserAvailable && activeUser ? (
            <Link href={getDashboardUrl(activeUser)}>
              <Button className="h-14 px-12 text-lg bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-black shadow-lg shadow-zinc-800/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto">
                <LayoutDashboard size={20} />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button className="h-14 px-12 text-lg bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-black shadow-lg shadow-zinc-800/20 hover:-translate-y-0.5 transition-all">
                Get Started Free Today
              </Button>
            </Link>
          )}
        </div>
      </section>

      <section id="contact" className="py-24 bg-white dark:bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-900 uppercase tracking-widest mb-3 block">Contact Us</span>
            <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-900 mb-4">Get In Touch</h2>
            <p className="text-zinc-600 dark:text-zinc-600">Have questions? Our team is here to help you get started.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Phone, title: "Call Us", info: "+92 300 1234567", sub: "Mon-Fri, 9am-6pm" },
              { icon: Mail, title: "Email Us", info: "support@stoofi.com", sub: "We reply within 24 hours" },
              { icon: MapPin, title: "Visit Us", info: "Lahore, Pakistan", sub: "Head Office" },
            ].map((c, i) => (
              <div key={i} className="text-center p-8 bg-zinc-50 dark:bg-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-200">
                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-5">
                  <c.icon size={24} className="text-zinc-800 dark:text-zinc-900" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-900 mb-1">{c.title}</h3>
                <p className="text-zinc-800 dark:text-zinc-900 font-semibold text-sm mb-1">{c.info}</p>
                <p className="text-xs text-zinc-500">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-200 py-16 bg-zinc-50 dark:bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Link href="/" className="inline-block mb-6">
            <img loading="lazy" src="/stoofi light.png" alt="Stoofi PRO" className="h-10 sm:h-12 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-base text-zinc-600 dark:text-zinc-600 font-medium mb-3">The ultimate school management ERP solution for modern educational institutes.</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-9000">&copy; {new Date().getFullYear()} Stoofi PRO. All rights reserved.</p>
        </div>
      </footer>

      {/* Notice Details Modal */}
      {selectedPublicNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPublicNotice(null)}></div>
          <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-3xl w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header pattern */}
            <div className="h-24 bg-gradient-to-r from-zinc-800 to-zinc-500 relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <button onClick={() => setSelectedPublicNotice(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-8 pt-0 relative">
              {/* Floating Date Badge */}
              <div className="w-20 h-20 bg-white dark:bg-zinc-50 border-4 border-white dark:border-zinc-950 rounded-2xl shadow-lg absolute -top-10 left-8 flex flex-col items-center justify-center">
                <div className="text-2xl font-black text-zinc-800 dark:text-zinc-900 leading-none">{formatNoticeDate(selectedPublicNotice.noticeDate || selectedPublicNotice.date).day}</div>
                <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-900 uppercase mt-1 tracking-wider">{formatNoticeDate(selectedPublicNotice.noticeDate || selectedPublicNotice.date).month}</div>
              </div>

              <div className="mt-14 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-50 text-zinc-800 dark:text-zinc-900 border border-zinc-200 dark:border-zinc-200">
                    Notice For: {selectedPublicNotice.noticeTo || selectedPublicNotice.audience || 'All'}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-500">
                    Published: {selectedPublicNotice.noticeDate || selectedPublicNotice.date || 'N/A'}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-900 leading-tight">
                  {selectedPublicNotice.title}
                </h2>
              </div>
              
              <div className="bg-zinc-50 dark:bg-zinc-50/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-200 mb-8">
                <p className="text-zinc-700 dark:text-zinc-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {selectedPublicNotice.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-100 flex items-center justify-center text-zinc-800 dark:text-zinc-900">
                    <UserPlus size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-900 leading-none">By: {selectedPublicNotice.createdBy || 'Admin'}</p>
                    <p className="text-xs text-zinc-500 mt-1">Official Circular</p>
                  </div>
                </div>
                <Button onClick={() => setSelectedPublicNotice(null)} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:text-white rounded-xl px-8 font-bold transition-all">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today&apos;s Event POPUP MODAL */}
      {showTodayEventModal && todayEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 text-zinc-900 relative">
            {/* Close button */}
            <button
              onClick={() => setShowTodayEventModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center transition-colors shadow-sm"
              title="Close"
            >
              <X size={18} />
            </button>

            {/* Header banner */}
            <div className="h-28 bg-zinc-900 flex items-center justify-center relative">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-300 bg-white/10 px-3.5 py-1 rounded-full border border-white/10">
                Today&apos;s Event & Announcement
              </span>
            </div>

            {/* Content Body with date badge */}
            <div className="p-6 pt-0 flex flex-col items-center text-center">
              {/* Date Badge - centered & overlapping top banner cleanly */}
              <div className="-mt-10 mb-4 w-20 h-20 bg-white rounded-2xl shadow-lg border border-zinc-200 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  {new Date(todayEvent.date).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-3xl font-black text-zinc-900 leading-none mt-0.5">
                  {new Date(todayEvent.date).getDate()}
                </span>
              </div>

              {/* Event Title */}
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-1.5 px-2">
                {todayEvent.title}
              </h2>

              <p className="text-xs font-bold text-zinc-500 mb-3">
                {new Date(todayEvent.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>

              <span className="inline-block bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-zinc-200 mb-6">
                Target Audience: {todayEvent.audience || 'All'}
              </span>

              <Button
                onClick={() => setShowTodayEventModal(false)}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all text-sm"
                style={{ color: '#ffffff' }}
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

