"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { translations } from "@/utils/translations";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle2, Monitor, Users, GraduationCap,
  ShieldCheck, Menu, X, Star, ArrowRight, Zap, BarChart3,
  Bell, BookOpen, CreditCard, Clock, Globe, Phone, Mail, MapPin,
  Settings2, UserPlus, FileSpreadsheet, Award, ChevronDown, Search,
  LogOut, LayoutDashboard, User, Pause, Play
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
  const [isMotionPaused, setIsMotionPaused] = useState(false);

  // Dialog State
  const [activeDialog, setActiveDialog] = useState(null); // { title, content, type }

  // Notices state
  const [publicNotices, setPublicNotices] = useState([]);
  const [selectedPublicNotice, setSelectedPublicNotice] = useState(null);
  const [noticeSearch, setNoticeSearch] = useState("");
  const [selectedNoticeTab, setSelectedNoticeTab] = useState("All");

  // Today Event Popup state
  const [todayEvent, setTodayEvent] = useState(null);
  const [showTodayEventModal, setShowTodayEventModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("recent_user");
        if (stored) {
          setRecentUser(JSON.parse(stored));
        }
        const storedMotion = localStorage.getItem("stoofi_motion_paused");
        if (storedMotion === "true") {
          setIsMotionPaused(true);
        }
      } catch (e) {}
    }
  }, []);

  const toggleMotion = () => {
    setIsMotionPaused(prev => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("stoofi_motion_paused", String(next));
      }
      return next;
    });
  };

  const activeUser = user || (mounted ? recentUser : null);
  const isUserAvailable = (isAuthenticated && !!user) || (mounted && !!recentUser);

  const getDashboardUrl = (targetUser = activeUser) => {
    const r = (targetUser?.role || "").toLowerCase();
    if (r.includes("student")) return "/dashboard/student";
    if (r.includes("teacher")) return "/dashboard/teacher";
    if (r.includes("super admin") || r.includes("superadmin")) return "/dashboard";
    if (r.includes("admin")) return "/dashboard";
    return "/dashboard";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedEvents = localStorage.getItem("dashboard_events");
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

  const t = translations[lang] || translations["EN"];

  const changeLanguage = (langCode) => {
    setLang(langCode);
    setIsLangDropdownOpen(false);

    if (typeof window !== "undefined") {
      localStorage.setItem("stoofi_lang", langCode);
      let googleLang = "en";
      if (langCode === "UR") googleLang = "ur";
      if (langCode === "AR") googleLang = "ar";

      document.cookie = `googtrans=/en/${googleLang}; path=/`;
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Notices
  useEffect(() => {
    const fetchPublicNotices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/dashboard/notices`);
        const result = await res.json();
        if (result.success && result.data) {
          const noticesOnly = result.data.filter(item => item.type === "Notice");
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
      if (isNaN(d.getTime())) return { day: "15", month: "SEP", year: "2026" };
      const day = d.getDate().toString().padStart(2, "0");
      const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const year = d.getFullYear();
      return { day, month, year };
    } catch (_) {
      return { day: "15", month: "SEP", year: "2026" };
    }
  };

  const filteredPublicNotices = publicNotices.filter((n) => {
    const titleMatch = (n.title || "").toLowerCase().includes(noticeSearch.toLowerCase()) || (n.description || "").toLowerCase().includes(noticeSearch.toLowerCase());
    const audienceMatch = selectedNoticeTab === "All" || (n.noticeTo && (n.noticeTo === selectedNoticeTab || n.noticeTo === "All")) || (n.audience && (n.audience === selectedNoticeTab || n.audience === "All"));
    return titleMatch && audienceMatch;
  });

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

  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3D Tilt Hook for Cards
  const handleTiltMove = (e, depth = 6) => {
    if (isMotionPaused) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));
    card.style.transform = `perspective(1100px) rotateX(${-y * depth}deg) rotateY(${x * depth}deg) translateY(-4px)`;
  };

  const handleTiltLeave = (e) => {
    const card = e.currentTarget;
    card.style.removeProperty("transform");
  };

  const steps = [
    {
      number: "01",
      icon: Settings2,
      title: "General Settings & Academic Year",
      desc: "Set up school name, logo, currency, grading systems, and define the active academic session (e.g. 2026)."
    },
    {
      number: "02",
      icon: BookOpen,
      title: "Classes, Sections & Subjects",
      desc: "Create classes (e.g., Class 1 to 10), assign sections (A, B, C), and map curriculum subjects with teacher allocations."
    },
    {
      number: "03",
      icon: Users,
      title: "Staff & Student Enrollment",
      desc: "Add teachers, assign roles/permissions, and enroll students with parent contact info or bulk import via Excel/CSV."
    },
    {
      number: "04",
      icon: ShieldCheck,
      title: "System Activation & Live Go",
      desc: "Enable automated SMS gateway, issue portal credentials to parents & staff, and monitor live dashboard analytics."
    }
  ];

  const teacherFlowItems = [
    {
      icon: Monitor,
      title: "Teacher Portal",
      desc: "Manage classes, attendance, homework, assignments, and student grades effortlessly from any browser or mobile device."
    },
    {
      icon: BookOpen,
      title: "LMS & Online E-Learning",
      desc: "Upload detailed study notes, assign and grade digital homework, manage class syllabus, and conduct secure online exams with auto-grading."
    }
  ];

  const studentFlowItems = [
    {
      icon: GraduationCap,
      title: "Student Portal",
      desc: "Access homework, lecture notes, daily schedules, exam results, downloadable study material, and track fee payment history."
    },
    {
      icon: Users,
      title: "Parents Portal",
      desc: "Track real-time child attendance, monitor academic performance, view monthly fee vouchers, and communicate directly with teachers."
    }
  ];

  const portals = [
    {
      num: "01",
      icon: ShieldCheck,
      title: "Super Admin Portal",
      desc: "Full control over the entire system, settings, branches, and all users."
    },
    {
      num: "02",
      icon: Monitor,
      title: "Teacher Portal",
      desc: "Manage classes, attendance, homework, assignments, and student grades."
    },
    {
      num: "03",
      icon: GraduationCap,
      title: "Student Portal",
      desc: "Access homework, schedules, exam results, study material, and fees."
    },
    {
      num: "04",
      icon: Users,
      title: "Parents Portal",
      desc: "Track child progress, attendance, fee status and communicate with teachers."
    }
  ];

  const features = [
    {
      icon: CreditCard,
      title: "Comprehensive Fee Management",
      desc: "Auto-generate fee invoices, track partial & full payments, apply dynamic discounts, add late fines, and print detailed fee receipts instantly.",
      guideText: "Stoofi Fee Management handles complex tuition structures, multiple fee categories, concessions, late fee calculations, and instant branded thermal/A4 voucher printing with one-click bank challan generation."
    },
    {
      icon: Clock,
      title: "Smart Attendance System",
      desc: "1-Tap student & staff attendance tracking with instant absentee SMS alerts for parents. Supports future RFID/Biometric integration.",
      guideText: "Take daily roll call in under 30 seconds. Parents receive immediate absentee notifications via SMS or WhatsApp, reducing unexcused absences and keeping guardians in sync."
    },
    {
      icon: Award,
      title: "Advanced Exam & Results",
      desc: "Create dynamic exam schedules, manage subject-wise marks, print beautiful customized report cards, and auto-calculate grades & positions.",
      guideText: "Design customized grading criteria, GPA matrices, weighted term averages, position rankings, and printable report cards with school crest and principal signature."
    },
    {
      icon: BookOpen,
      title: "LMS & Online E-Learning",
      desc: "Upload detailed study notes, assign and grade digital homework, manage class syllabus, and conduct secure online exams with auto-grading.",
      guideText: "Provide students with 24/7 access to curriculum materials, lesson plans, downloadable PDFs, homework submission portals, and timed online quizzes."
    },
    {
      icon: Users,
      title: "HR & Payroll Administration",
      desc: "Maintain complete staff profiles, handle leave requests, track daily employee attendance, and generate automated custom salary slips.",
      guideText: "Manage teacher contracts, track biometric staff check-in/out, process leave balances, calculate allowances & deductions, and print monthly pay slips."
    },
    {
      icon: BarChart3,
      title: "Live Financial Accounting",
      desc: "Monitor daily school cash flows, record income/expenses, manage chart of accounts, and generate real-time Profit & Loss balance sheets.",
      guideText: "Stay on top of school finances with general ledger entries, vendor expense tracking, day-book cash summaries, fee reconciliation, and annual profit/loss reports."
    },
    {
      icon: Globe,
      title: "Multi-Branch Central Control",
      desc: "Manage multiple school campuses from a single Super Admin login. Compare branch revenues, standardize data, and track global analytics.",
      guideText: "For growing school systems: unify multiple city campuses under one headquarters dashboard, standardize curriculum, and compare branch revenues side-by-side."
    },
    {
      icon: Bell,
      title: "Automated Communication",
      desc: "Send bulk SMS and email notifications to parents and staff regarding fee dues, exam results, holiday notices, and emergency alerts.",
      guideText: "Dispatch instant group announcements, fee reminders, result alerts, holiday notices, and emergency weather broadcast SMS to thousands of parents in seconds."
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access Security",
      desc: "Secure data with strict permission locks. Ensure Teachers only see academics, and Parents only see their child's data.",
      guideText: "Every user role has granular permissions. Sensitive financial records are locked from teachers, while parents strictly view records belonging to their enrolled children."
    }
  ];

  const testimonials = [
    {
      name: "Khalid Mehmood",
      role: "Principal, Al-Noor School System",
      text: "Stoofi transformed how we manage our 1200+ students. The fee collection and attendance system alone saves us 3 hours daily.",
      initials: "KM",
      avatarClass: "bg-[#dff1ea] text-[#408873]"
    },
    {
      name: "Sara Ahmed",
      role: "Admin, Bright Future Academy",
      text: "The multi-portal design is brilliant. Teachers love it, parents love it, and our admin team can finally breathe!",
      initials: "SA",
      avatarClass: "bg-[#e4edf7] text-[#557b9e]"
    },
    {
      name: "Usman Tariq",
      role: "Director, Scholars Institute",
      text: "Switching from manual registers to Stoofi was the best decision. Reports that used to take days now take seconds.",
      initials: "UT",
      avatarClass: "bg-[#eeebf6] text-[#87779e]"
    }
  ];

  const faqs = [
    {
      q: "How quickly can our school get up and running on Stoofi ERP?",
      a: "Most schools go live in less than 24 hours. Our step-by-step onboarding wizard lets you configure classes, assign teachers, and bulk import student records via Excel in minutes."
    },
    {
      q: "How do automated SMS notifications work?",
      a: "Send bulk SMS and email notifications to parents and staff regarding fee dues, exam results, holiday notices, and emergency alerts instantly from the communication center."
    },
    {
      q: "Can we manage multi-branch campuses with single billing?",
      a: "Manage multiple school campuses from a single Super Admin login. Compare branch revenues, standardize data, and track global analytics seamlessly across all campuses."
    },
    {
      q: "Is our student and financial data safe?",
      a: "Secure data with strict permission locks. Ensure Teachers only see academics, and Parents only see their child's data with bank-grade cloud backups and 99.9% uptime."
    }
  ];

  return (
    <div className={`min-h-screen bg-white text-[#102e43] font-sans selection:bg-[#64e2bc] selection:text-[#0c322f] ${isMotionPaused ? "motion-paused" : ""}`}>
      {/* ── Sticky Header Navigation ── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md border-b border-[#dfe7eb] shadow-sm py-3" : "bg-white/95 backdrop-blur-md border-b border-[#dfe7eb] py-4"}`}>
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 flex items-center justify-between min-h-[56px]">
          {/* Brand Logo */}
          <Link href="#home" className="flex items-center shrink-0" aria-label="Stoofi ERP home">
            <img
              src="/logo.png"
              alt="Stoofi ERP — Smarter Education, Simple Management"
              className="h-10 sm:h-12 w-auto object-contain hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#102e43]">
            <Link href="#home" className="hover:text-[#087f77] transition-colors py-1">Home</Link>
            <button
              onClick={() => {
                if (publicNotices.length > 0) {
                  const el = document.getElementById("notices");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                } else {
                  setActiveDialog({
                    title: "Notice Board",
                    content: "No public circulars or notices have been posted yet. Check back soon for institution announcements.",
                    isHtml: false
                  });
                }
              }}
              className="hover:text-[#087f77] transition-colors py-1 cursor-pointer"
            >
              Notice Board
            </button>
            <Link href="#how-it-works" className="hover:text-[#087f77] transition-colors py-1">How To Use</Link>
            <Link href="#portals" className="hover:text-[#087f77] transition-colors py-1">Portals</Link>
            <Link href="#features" className="hover:text-[#087f77] transition-colors py-1">Features</Link>
            <Link href="#pricing" className="hover:text-[#087f77] transition-colors py-1">Pricing</Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 text-xs font-bold text-[#102e43] hover:text-[#087f77] px-2 py-1.5 rounded-md border border-[#dfe7eb] hover:bg-[#f3f7f8] transition-colors"
              >
                <span>{lang}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${isLangDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isLangDropdownOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-28 bg-white border border-[#dfe7eb] rounded-xl shadow-xl overflow-hidden p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { code: "EN", name: "English" },
                    { code: "UR", name: "Urdu" },
                    { code: "AR", name: "Arabic" }
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                        lang === l.code
                          ? "bg-[#eaf6f2] text-[#087f77] font-bold"
                          : "text-[#667987] hover:bg-[#f3f7f8] hover:text-[#102e43]"
                      }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Animation Toggle */}
            <button
              onClick={toggleMotion}
              className="grid place-items-center w-8 h-8 rounded-md border border-[#dfe7eb] text-[#087f77] hover:bg-[#e9f7f1] transition-colors"
              title={isMotionPaused ? "Resume animations" : "Pause animations"}
              aria-label={isMotionPaused ? "Resume animations" : "Pause animations"}
            >
              {isMotionPaused ? <Play size={15} /> : <Pause size={15} />}
            </button>

            {/* Auth Button or User Profile */}
            {isUserAvailable && activeUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 bg-[#f3f7f8] hover:bg-[#eaf0f3] border border-[#dfe7eb] rounded-full py-1 px-3 transition-colors"
                >
                  {activeUser?.avatar || activeUser?.picture ? (
                    <img src={activeUser.avatar || activeUser.picture} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-[#dfe7eb]" />
                  ) : (
                    <div className="w-7 h-7 bg-[#102e43] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : <User size={14} />}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#102e43] leading-tight truncate max-w-[90px]">
                      {activeUser?.name || activeUser?.fullName || activeUser?.email?.split("@")[0]}
                    </p>
                    <p className="text-[10px] font-semibold text-[#667987] uppercase leading-none">
                      {activeUser?.role || "Member"}
                    </p>
                  </div>
                  <ChevronDown size={13} className={`text-[#667987] transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-[#dfe7eb] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-[#dfe7eb] mb-1">
                      <p className="text-sm font-bold text-[#102e43] truncate">{activeUser?.name || activeUser?.fullName || activeUser?.email}</p>
                      <p className="text-xs text-[#667987] truncate">{activeUser?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#eaf6f2] text-[#087f77] border border-[#7ebba566]">
                        {activeUser?.role || "User"}
                      </span>
                    </div>
                    <Link
                      href={getDashboardUrl(activeUser)}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#102e43] hover:bg-[#f3f7f8]"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("recent_user");
                        }
                        setIsProfileOpen(false);
                        window.location.href = "/";
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={16} />
                      Logout / Switch
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-[#102e43] hover:bg-[#1b425a] text-white font-bold rounded-lg px-6 h-10 shadow-sm transition-transform hover:-translate-y-0.5">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#102e43] hover:bg-[#f3f7f8] rounded-md transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#dfe7eb] px-6 py-4 flex flex-col gap-3 shadow-lg">
            <Link href="#home" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#102e43] py-2 border-b border-[#f3f7f8]">Home</Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (publicNotices.length > 0) {
                  const el = document.getElementById("notices");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                } else {
                  setActiveDialog({
                    title: "Notice Board",
                    content: "No public circulars or notices have been posted yet.",
                    isHtml: false
                  });
                }
              }}
              className="text-left text-sm font-semibold text-[#102e43] py-2 border-b border-[#f3f7f8]"
            >
              Notice Board
            </button>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#102e43] py-2 border-b border-[#f3f7f8]">How To Use</Link>
            <Link href="#portals" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#102e43] py-2 border-b border-[#f3f7f8]">Portals</Link>
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#102e43] py-2 border-b border-[#f3f7f8]">Features</Link>
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#102e43] py-2 border-b border-[#f3f7f8]">Pricing</Link>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-[#667987]">Animations:</span>
              <button
                onClick={toggleMotion}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded border border-[#dfe7eb] text-[#087f77]"
              >
                {isMotionPaused ? <Play size={12} /> : <Pause size={12} />}
                {isMotionPaused ? "Disabled" : "Active"}
              </button>
            </div>
            {isUserAvailable && activeUser ? (
              <Link href={getDashboardUrl(activeUser)} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#102e43] hover:bg-[#1b425a] text-white font-bold py-3 rounded-lg mt-2">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#102e43] hover:bg-[#1b425a] text-white font-bold py-3 rounded-lg mt-2">
                  Login
                </Button>
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ── HERO SECTION (#home) ── */}
      <section id="home" className="relative bg-[#0c2436] text-white overflow-hidden">
        {/* Teal Ambient Radial Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_87%_30%,#15606166,transparent_48%)]"></div>

        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 py-16 sm:py-24 lg:py-28 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="flex flex-col items-start text-left">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2.5 border border-[#56728080] rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-[#b7d0da] mb-8 bg-white/5 backdrop-blur-sm">
              <span className="text-[#64e2bc]">STOOFI PRO IS LIVE</span>
              <span className="h-3 w-px bg-[#507080]"></span>
              <span>30 DAYS FREE TRIAL</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
              The Complete<br />
              <em className="not-italic text-[#64e2bc]">School Management</em><br />
              ERP<span className="text-[#64e2bc]">.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#b7cbd4] max-w-xl mt-6 leading-relaxed">
              Manage your entire institution from one unified platform. Tailored portals for Admins, Teachers, Students and Parents.
            </p>

            {/* Hero Actions */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              {isUserAvailable && activeUser ? (
                <Link href={getDashboardUrl(activeUser)}>
                  <Button className="bg-[#64e2bc] hover:bg-[#85edce] text-[#0c322f] font-bold text-sm sm:text-base px-8 h-13 rounded-lg shadow-lg hover:-translate-y-1 transition-all border-0 flex items-center gap-2">
                    <LayoutDashboard size={18} />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="#pricing">
                  <Button className="bg-[#64e2bc] hover:bg-[#85edce] text-[#0c322f] font-bold text-sm sm:text-base px-8 h-13 rounded-lg shadow-lg hover:-translate-y-1 transition-all border-0">
                    Get Started
                  </Button>
                </Link>
              )}
              <Link href="#how-it-works">
                <Button variant="outline" className="border border-[#66818f] text-white bg-transparent hover:bg-white/10 font-bold text-sm sm:text-base px-7 h-13 rounded-lg transition-all flex items-center gap-2">
                  <Play size={16} className="fill-white" />
                  How It Works
                </Button>
              </Link>
            </div>

            {/* Note Guarantee */}
            <div className="flex items-center gap-2 text-xs text-[#9fb8c6] mt-6">
              <span className="text-[#64e2bc] font-bold">✓</span>
              <span>Start free for 1 month</span>
              <span className="text-[#536d7e]">/</span>
              <span>No credit card required</span>
            </div>
          </div>

          {/* Right Column: 3D Visual with Classroom Photo & Floating Badges */}
          <div className="relative w-full max-w-[600px] mx-auto lg:max-w-none pt-4 pb-8 perspective-1200">
            <div
              onPointerMove={(e) => handleTiltMove(e, 6)}
              onPointerLeave={handleTiltLeave}
              className="relative h-[360px] sm:h-[460px] lg:h-[480px] rounded-tl-[22px] rounded-tr-[22px] rounded-bl-[22px] rounded-br-[75px] sm:rounded-br-[85px] overflow-hidden border border-[#7ebba566] shadow-[0_24px_70px_rgba(0,0,0,0.35)] bg-[#204b53] transition-transform duration-400 ease-out"
            >
              {/* Drift Photo */}
              <div className="w-full h-full animate-photo-breathe">
                <img
                  src="/classroom.webp"
                  alt="A teacher supporting students learning on laptops"
                  className="w-full h-full object-cover object-[50%_45%] scale-105"
                />
              </div>

              {/* Photo Vignette Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#082631dc] via-transparent to-transparent pointer-events-none"></div>

              {/* Photo Caption */}
              <div className="absolute bottom-8 left-6 sm:left-8 right-6 text-white pointer-events-none">
                <span className="text-[11px] font-bold tracking-widest text-[#64e2bc] uppercase block mb-1.5">
                  STOOFI ERP
                </span>
                <strong className="text-xl sm:text-2xl font-extrabold leading-snug tracking-tight block">
                  Smarter Education.<br />Simpler Management.
                </strong>
              </div>
            </div>

            {/* Floating Badge 1: Smart Attendance (Top Left) */}
            <Link
              href="#features"
              className="absolute -top-3 sm:top-2 -left-2 sm:-left-4 bg-white/95 backdrop-blur-md border border-[#eff8f5] rounded-xl p-3.5 sm:p-4 shadow-[0_18px_45px_rgba(0,22,34,0.22)] hover:shadow-[0_22px_50px_rgba(0,22,34,0.35)] text-[#102e43] flex items-center gap-3 transition-all z-20 animate-float-a group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#e3f7ec] text-[#087f77] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Clock size={20} />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-bold block leading-tight">Smart Attendance</strong>
                <small className="text-[10px] sm:text-xs text-[#6c8793] block">Students & staff, connected.</small>
              </div>
              <span className="w-5 h-5 rounded-full bg-[#d9f6e9] text-[#258965] text-xs font-bold flex items-center justify-center ml-1">✓</span>
            </Link>

            {/* Floating Badge 2: One System Every Role (Bottom Right) */}
            <Link
              href="#portals"
              className="absolute -bottom-3 sm:bottom-2 right-2 sm:right-6 bg-white/95 backdrop-blur-md border border-[#eff8f5] rounded-xl p-3.5 sm:p-4 shadow-[0_18px_45px_rgba(0,22,34,0.22)] hover:shadow-[0_22px_50px_rgba(0,22,34,0.35)] text-[#102e43] flex items-center gap-3 transition-all z-20 animate-float-b group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#e3f7ec] text-[#087f77] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-bold block leading-tight">One system. Every role.</strong>
                <small className="text-[10px] sm:text-xs text-[#6c8793] block">Admins · Teachers · Students · Parents</small>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#f8fafb] border-b border-[#dfe7eb] py-8 sm:py-10" aria-label="School statistics">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-2 transition-transform hover:-translate-y-1">
            <strong className="text-3xl sm:text-4xl font-extrabold text-[#102e43] tracking-tight block">
              155<span className="text-[#087f77]">+</span>
            </strong>
            <p className="text-xs sm:text-sm font-medium text-[#667987] mt-1">Schools onboarded</p>
          </div>
          <div className="p-2 border-l border-[#dfe7eb] transition-transform hover:-translate-y-1">
            <strong className="text-3xl sm:text-4xl font-extrabold text-[#102e43] tracking-tight block">
              62K<span className="text-[#087f77]">+</span>
            </strong>
            <p className="text-xs sm:text-sm font-medium text-[#667987] mt-1">Active students</p>
          </div>
          <div className="p-2 md:border-l border-[#dfe7eb] transition-transform hover:-translate-y-1">
            <strong className="text-3xl sm:text-4xl font-extrabold text-[#102e43] tracking-tight block">
              99.9<span className="text-[#087f77]">%</span>
            </strong>
            <p className="text-xs sm:text-sm font-medium text-[#667987] mt-1">Uptime guarantee</p>
          </div>
          <div className="p-2 border-l border-[#dfe7eb] transition-transform hover:-translate-y-1">
            <strong className="text-3xl sm:text-4xl font-extrabold text-[#102e43] tracking-tight block">
              4.9 <span className="text-amber-500 text-2xl">★</span>
            </strong>
            <p className="text-xs sm:text-sm font-medium text-[#667987] mt-1">Customer rating</p>
          </div>
        </div>
      </section>

      {/* ── HOW TO USE SECTION (#how-it-works) ── */}
      <section id="how-it-works" className="py-20 sm:py-28 max-w-[1240px] mx-auto px-6 sm:px-10">
        {/* Section Heading & Administrator Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#087f77] uppercase block mb-3">
              STEP-BY-STEP SYSTEM GUIDE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102e43] tracking-tight leading-tight">
              How To Use<br />Stoofi ERP<span className="text-[#087f77]">.</span>
            </h2>
            <p className="text-base text-[#667987] mt-5 max-w-lg leading-relaxed">
              Follow these simple, streamlined workflows designed for every user role in your institution.
            </p>
          </div>

          {/* Administration Visual Photo with Figcaption */}
          <figure
            onPointerMove={(e) => handleTiltMove(e, 4)}
            onPointerLeave={handleTiltLeave}
            className="relative rounded-2xl overflow-hidden shadow-[0_12px_35px_rgba(16,53,40,0.1)] bg-[#e4ecef] transition-all duration-400 group"
          >
            <img
              src="/administration.webp"
              alt="School administrator and teacher reviewing school records"
              className="w-full h-[240px] sm:h-[280px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <figcaption className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-md border border-white/70 text-xs font-bold text-[#102e43] shadow-sm">
              School Setup & Onboarding
            </figcaption>
          </figure>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-[#dfe7eb] gap-4 sm:gap-6 mb-8 overflow-x-auto no-scrollbar" role="tablist">
          {[
            { id: "admin", label: "Super Admin Flow", badge: "SETUP" },
            { id: "teacher", label: "Teacher Flow", badge: "ACADEMIC" },
            { id: "student", label: "Student & Parent Flow", badge: "PORTAL" }
          ].map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeStepTab === tab.id}
              onClick={() => setActiveStepTab(tab.id)}
              className={`pb-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeStepTab === tab.id
                  ? "border-[#087f77] text-[#087f77]"
                  : "border-transparent text-[#667987] hover:text-[#102e43]"
              }`}
            >
              {tab.label}
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded ml-2 uppercase font-bold tracking-wider ${
                activeStepTab === tab.id ? "bg-[#def3eb] text-[#127d67]" : "bg-[#eaf0f3] text-[#738894]"
              }`}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        {activeStepTab === "admin" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold text-[#087f77] uppercase tracking-wider block">QUICK SETUP (DAY 1)</span>
                <h3 className="text-lg font-bold text-[#102e43]">School Setup & Onboarding</h3>
              </div>
              <span className="text-xs text-[#8b9aa4] hidden sm:block">4 Simple Consecutive Steps</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {steps.map((s, idx) => (
                <article
                  key={idx}
                  onPointerMove={(e) => handleTiltMove(e, 3)}
                  onPointerLeave={handleTiltLeave}
                  className="p-6 rounded-xl border border-[#dfe7eb] bg-white shadow-sm hover:border-[#9bcfbe] hover:shadow-[0_15px_35px_rgba(16,53,40,0.08)] hover:-translate-y-1.5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-extrabold text-[#bacbd2] group-hover:text-[#087f77] transition-colors">
                        {s.number}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-[#eaf6f2] text-[#087f77] flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <s.icon size={20} />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[#102e43] leading-snug mb-2">{s.title}</h3>
                    <p className="text-xs sm:text-sm text-[#667987] leading-relaxed">{s.desc}</p>
                  </div>
                  <small className="block text-xs font-bold text-[#087f77] mt-6 pt-3 border-t border-[#edf1f3]">
                    Step {idx + 1} of 4
                  </small>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeStepTab === "teacher" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {teacherFlowItems.map((item, idx) => (
              <article
                key={idx}
                onPointerMove={(e) => handleTiltMove(e, 3)}
                onPointerLeave={handleTiltLeave}
                className="p-8 rounded-xl border border-[#dfe7eb] bg-[#f8fafb] hover:bg-white hover:border-[#9bcfbe] hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#eaf6f2] text-[#087f77] flex items-center justify-center mb-5">
                  <item.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#102e43] mb-2">{item.title}</h3>
                <p className="text-sm text-[#667987] leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        )}

        {activeStepTab === "student" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {studentFlowItems.map((item, idx) => (
              <article
                key={idx}
                onPointerMove={(e) => handleTiltMove(e, 3)}
                onPointerLeave={handleTiltLeave}
                className="p-8 rounded-xl border border-[#dfe7eb] bg-[#f8fafb] hover:bg-white hover:border-[#9bcfbe] hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#eaf6f2] text-[#087f77] flex items-center justify-center mb-5">
                  <item.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#102e43] mb-2">{item.title}</h3>
                <p className="text-sm text-[#667987] leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        )}

        {/* Read Detailed User Guide Dialog Button */}
        <div className="text-center mt-6">
          <Button
            onClick={() => {
              setActiveDialog({
                title: "School Setup & Onboarding Guide",
                content: steps.map((s, i) => `<h3>${s.number} — ${s.title}</h3><p>${s.desc}</p>`).join(""),
                isHtml: true
              });
            }}
            className="bg-[#102e43] hover:bg-[#1b425a] text-white font-bold rounded-lg px-8 h-12 shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer"
          >
            Read Detailed User Guide
          </Button>
        </div>
      </section>

      {/* ── PORTALS SECTION (#portals) ── */}
      <section id="portals" className="bg-[#0c2436] text-white py-20 sm:py-28">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-14">
            <div>
              <span className="text-xs font-extrabold tracking-widest text-[#64e2bc] uppercase block mb-3">
                DEDICATED PORTALS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                One System,<br />
                <span className="text-[#64e2bc]">Five Portals.</span>
              </h2>
              <p className="text-base text-[#a4bac7] mt-5 max-w-md leading-relaxed">
                Every role gets their own tailored dashboard — no clutter, just the right tools.
              </p>
            </div>

            {/* 3D Artwork Illustration */}
            <div
              onPointerMove={(e) => handleTiltMove(e, 8)}
              onPointerLeave={handleTiltLeave}
              className="max-w-[460px] w-full lg:justify-self-end overflow-hidden rounded-2xl transition-transform duration-400"
            >
              <img
                src="/education-3d.webp"
                alt="3D illustration of graduation cap, open book, and educational modules"
                className="w-full h-[250px] sm:h-[300px] object-cover rounded-2xl animate-art-float"
              />
            </div>
          </div>

          {/* 4 Portal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((p, idx) => (
              <article
                key={idx}
                onPointerMove={(e) => handleTiltMove(e, 5)}
                onPointerLeave={handleTiltLeave}
                className="p-7 rounded-xl border-t border-[#3f5766] bg-white/[0.03] hover:bg-[#174051] hover:border-[#65dcbc] hover:-translate-y-2 transition-all duration-300 group"
              >
                <span className="text-xs font-bold text-[#6f8b9c] block mb-4">{p.num}</span>
                <div className="w-12 h-12 rounded-xl bg-[#153c4c] border border-[#3a5b69] text-[#64e2bc] flex items-center justify-center mb-6 group-hover:-translate-y-1 group-hover:-rotate-6 transition-transform">
                  <p.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">{p.title}</h3>
                <p className="text-xs sm:text-sm text-[#a4bac7] leading-relaxed">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── POWERFUL FEATURES SECTION (#features) ── */}
      <section id="features" className="py-20 sm:py-28 max-w-[1240px] mx-auto px-6 sm:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#087f77] uppercase block mb-3">
              EVERYTHING YOU NEED
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102e43] tracking-tight">
              Powerful Features<span className="text-[#087f77]">.</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#667987] max-w-sm">
            Built for modern schools with all the tools needed to run efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <article
              key={idx}
              onPointerMove={(e) => handleTiltMove(e, 3)}
              onPointerLeave={handleTiltLeave}
              className="p-7 rounded-xl border border-[#dfe7eb] bg-white hover:border-[#8ac7b7] hover:shadow-[0_15px_30px_rgba(16,46,67,0.06)] hover:-translate-y-1 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#eaf6f2] text-[#087f77] flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-105 group-hover:bg-[#d5f1e5] transition-all">
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#102e43] leading-snug mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-[#667987] leading-relaxed mb-6">{f.desc}</p>
              </div>
              <button
                onClick={() => {
                  setActiveDialog({
                    title: f.title,
                    content: `<p class="mb-4">${f.desc}</p><p class="mb-4 text-xs text-[#667987]">${f.guideText}</p><a class="inline-block bg-[#102e43] text-white font-bold px-6 py-2.5 rounded-lg text-sm" href="mailto:support@stoofi.com?subject=${encodeURIComponent(f.title + " — Detailed Guide")}">Request Complete Guide</a>`,
                    isHtml: true
                  });
                }}
                className="pt-4 border-t border-[#e8edef] text-left text-xs font-bold text-[#087f77] hover:underline flex items-center justify-between cursor-pointer"
              >
                <span>Read Full Guide</span>
                <ArrowRight size={14} />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="bg-[#f2f7f6] py-20 sm:py-28">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-extrabold tracking-widest text-[#087f77] uppercase block mb-3">
                TESTIMONIALS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102e43] tracking-tight">
                Loved By Schools<span className="text-[#087f77]">.</span>
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#667987]">What educators are saying about Stoofi PRO.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <figure
                key={idx}
                className="p-8 rounded-xl bg-white border border-[#e1eae7] flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(21,60,48,0.06)] transition-all"
              >
                <div>
                  <div className="text-amber-500 text-base tracking-widest mb-6">★★★★★</div>
                  <blockquote className="text-sm sm:text-base text-[#375260] leading-relaxed mb-8 italic">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="flex items-center gap-3 pt-4 border-t border-[#f2f7f6]">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${t.avatarClass}`}>
                    {t.initials}
                  </span>
                  <div>
                    <strong className="text-xs sm:text-sm font-bold text-[#102e43] block leading-tight">{t.name}</strong>
                    <small className="text-[11px] text-[#80939d] block mt-0.5">{t.role}</small>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION (#pricing) ── */}
      <section id="pricing" className="py-20 sm:py-28 max-w-[1100px] mx-auto px-6 sm:px-10">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-extrabold tracking-widest text-[#087f77] uppercase block mb-3">
            PRICING PLANS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102e43] tracking-tight">
            Simple, Transparent Pricing<span className="text-[#087f77]">.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#667987] mt-4">
            Start free for 1 month. No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
          {/* Basic Plan */}
          <article className="p-8 rounded-2xl border border-[#dfe7eb] bg-white flex flex-col justify-between hover:-translate-y-2 hover:shadow-xl transition-all">
            <div>
              <h3 className="text-xl font-bold text-[#102e43] mb-1">Basic</h3>
              <p className="text-xs text-[#667987] mb-6">For small primary schools.</p>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#102e43] tracking-tight mb-6">
                $29<span className="text-xs sm:text-sm font-normal text-[#7e929e] ml-1">/mo</span>
              </div>
              <ul className="space-y-3.5 mb-8 text-xs sm:text-sm text-[#617886]">
                {["Up to 500 Students", "Basic Attendance", "Fee Management", "Admin & Teacher Portals", "Email Support"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="text-[#087f77] font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href="mailto:support@stoofi.com?subject=Stoofi%20Basic%20-%20Free%20Trial"
              className="w-full text-center py-3 rounded-lg border border-[#c9d6dc] text-[#102e43] font-bold text-xs sm:text-sm hover:bg-[#f3f7f8] transition-colors"
            >
              Start Free Trial
            </a>
          </article>

          {/* Professional Plan (Featured) */}
          <article className="p-8 rounded-2xl bg-[#0c2436] text-white border-2 border-[#0c2436] shadow-[0_20px_50px_rgba(12,36,54,0.25)] flex flex-col justify-between relative md:-translate-y-3 hover:-translate-y-4 transition-all">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#64e2bc] text-[#104439] text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
              MOST POPULAR
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Professional</h3>
              <p className="text-xs text-[#b3c8d2] mb-6">For growing high schools.</p>
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
                $79<span className="text-xs sm:text-sm font-normal text-[#b3c8d2] ml-1">/mo</span>
              </div>
              <ul className="space-y-3.5 mb-8 text-xs sm:text-sm text-[#b3c8d2]">
                {[
                  "Up to 2000 Students",
                  "All 5 Portals Included",
                  "Advanced Payroll & HR",
                  "LMS & Online Exams",
                  "SMS Notifications",
                  "Priority Support"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="text-[#64e2bc] font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href="mailto:support@stoofi.com?subject=Stoofi%20Professional%20-%201%20Month%20Free%20Trial"
              className="w-full text-center py-3.5 rounded-lg bg-[#64e2bc] text-[#0c322f] font-bold text-xs sm:text-sm hover:bg-[#85edce] shadow-md transition-all"
            >
              Start 1 Month Free
            </a>
          </article>

          {/* Enterprise Plan */}
          <article className="p-8 rounded-2xl border border-[#dfe7eb] bg-white flex flex-col justify-between hover:-translate-y-2 hover:shadow-xl transition-all">
            <div>
              <h3 className="text-xl font-bold text-[#102e43] mb-1">Enterprise</h3>
              <p className="text-xs text-[#667987] mb-6">For large school networks.</p>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#102e43] tracking-tight mb-6">
                $199<span className="text-xs sm:text-sm font-normal text-[#7e929e] ml-1">/mo</span>
              </div>
              <ul className="space-y-3.5 mb-8 text-xs sm:text-sm text-[#617886]">
                {[
                  "Unlimited Students",
                  "Multi-Branch Support",
                  "Custom Domain",
                  "White-label Mobile App",
                  "Dedicated Account Manager"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="text-[#087f77] font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href="mailto:support@stoofi.com?subject=Stoofi%20Enterprise%20-%20Sales%20Enquiry"
              className="w-full text-center py-3 rounded-lg border border-[#c9d6dc] text-[#102e43] font-bold text-xs sm:text-sm hover:bg-[#f3f7f8] transition-colors"
            >
              Contact Sales
            </a>
          </article>
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section className="bg-[#f6f8fa] border-y border-[#dfe7eb] py-20 sm:py-28">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#087f77] uppercase block mb-3">
              COMMON QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102e43] tracking-tight leading-tight">
              Frequently<br />Asked Questions<span className="text-[#087f77]">.</span>
            </h2>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border-b border-[#d8e3e9] pb-4 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-3 text-left font-bold text-[#102e43] text-sm sm:text-base flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className={`text-[#087f77] text-xl font-normal shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="text-xs sm:text-sm text-[#667987] leading-relaxed pt-2 pr-6 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 sm:py-20 max-w-[1240px] mx-auto px-6 sm:px-10">
        <div className="bg-[#0c2436] text-white rounded-2xl p-8 sm:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#64e2bc] uppercase block mb-2">
              GET STARTED
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
              Ready to Digitize<br />Your School?
            </h2>
            <p className="text-sm sm:text-base text-[#aec5d0] mt-3 max-w-lg leading-relaxed">
              Join 500+ schools already running on Stoofi PRO. Get started with a full 1-month free trial — no credit card needed.
            </p>
          </div>
          {isUserAvailable && activeUser ? (
            <Link href={getDashboardUrl(activeUser)} className="shrink-0">
              <Button className="bg-[#64e2bc] hover:bg-[#85edce] text-[#0c322f] font-bold text-sm sm:text-base px-8 h-13 rounded-lg shadow-lg hover:-translate-y-0.5 transition-all border-0">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="#pricing" className="shrink-0">
              <Button className="bg-[#64e2bc] hover:bg-[#85edce] text-[#0c322f] font-bold text-sm sm:text-base px-8 h-13 rounded-lg shadow-lg hover:-translate-y-0.5 transition-all border-0">
                Get Started Free Today
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* ── CONTACT US SECTION (#contact) ── */}
      <section id="contact" className="py-16 sm:py-20 max-w-[1240px] mx-auto px-6 sm:px-10">
        <div className="text-center max-w-md mx-auto mb-14">
          <span className="text-xs font-extrabold tracking-widest text-[#087f77] uppercase block mb-3">
            CONTACT US
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102e43] tracking-tight">
            Get In Touch<span className="text-[#087f77]">.</span>
          </h2>
          <p className="text-sm text-[#667987] mt-3">
            Have questions? Our team is here to help you get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="tel:+923001234567"
            className="p-6 rounded-xl border-t border-[#dfe7eb] flex items-start gap-4 hover:bg-[#f8fafb] transition-colors group"
          >
            <div className="w-11 h-11 rounded-lg bg-[#eaf6f2] text-[#087f77] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#667987] uppercase tracking-wider mb-1">Call Us</h3>
              <strong className="text-sm font-bold text-[#102e43] group-hover:text-[#087f77] transition-colors block">
                +92 300 1234567
              </strong>
              <p className="text-xs text-[#80939d] mt-1">Mon-Fri, 9am-6pm</p>
            </div>
          </a>

          <a
            href="mailto:support@stoofi.com"
            className="p-6 rounded-xl border-t border-[#dfe7eb] flex items-start gap-4 hover:bg-[#f8fafb] transition-colors group"
          >
            <div className="w-11 h-11 rounded-lg bg-[#eaf6f2] text-[#087f77] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#667987] uppercase tracking-wider mb-1">Email Us</h3>
              <strong className="text-sm font-bold text-[#102e43] group-hover:text-[#087f77] transition-colors block">
                support@stoofi.com
              </strong>
              <p className="text-xs text-[#80939d] mt-1">We reply within 24 hours</p>
            </div>
          </a>

          <div className="p-6 rounded-xl border-t border-[#dfe7eb] flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#eaf6f2] text-[#087f77] flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#667987] uppercase tracking-wider mb-1">Visit Us</h3>
              <strong className="text-sm font-bold text-[#102e43] block">Lahore, Pakistan</strong>
              <p className="text-xs text-[#80939d] mt-1">Head Office</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#dfe7eb] bg-[#f8fafb] py-10">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <Link href="#home" className="shrink-0" aria-label="Stoofi ERP home">
            <img
              src="/logo.png"
              alt="Stoofi ERP"
              className="h-10 w-auto object-contain mx-auto md:mx-0"
            />
          </Link>
          <p className="text-xs sm:text-sm text-[#667987] max-w-sm">
            The ultimate school management ERP solution for modern educational institutes.
          </p>
          <small className="text-xs text-[#83949e]">
            &copy; {new Date().getFullYear()} Stoofi PRO. All rights reserved.
          </small>
        </div>
      </footer>

      {/* ── GLOBAL INFO / GUIDE DIALOG ── */}
      {activeDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#dfe7eb] rounded-2xl w-full max-w-xl shadow-2xl p-8 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveDialog(null)}
              className="absolute top-4 right-4 text-2xl text-[#718790] hover:text-[#102e43] w-8 h-8 flex items-center justify-center cursor-pointer"
              aria-label="Close dialog"
            >
              ×
            </button>
            <span className="text-[11px] font-bold text-[#087f77] uppercase tracking-widest block mb-2">
              STOOFI ERP
            </span>
            <h2 className="text-2xl font-bold text-[#102e43] mb-4">{activeDialog.title}</h2>
            {activeDialog.isHtml ? (
              <div
                className="text-sm text-[#667987] leading-relaxed space-y-3"
                dangerouslySetInnerHTML={{ __html: activeDialog.content }}
              />
            ) : (
              <p className="text-sm text-[#667987] leading-relaxed">{activeDialog.content}</p>
            )}
            <div className="mt-6 pt-4 border-t border-[#dfe7eb] flex justify-end">
              <Button
                onClick={() => setActiveDialog(null)}
                className="bg-[#102e43] hover:bg-[#1b425a] text-white font-bold px-6 rounded-lg text-sm cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── TODAY'S EVENT POPUP MODAL ── */}
      {showTodayEventModal && todayEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#dfe7eb] text-[#102e43] relative">
            <button
              onClick={() => setShowTodayEventModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#f3f7f8] hover:bg-[#dfe7eb] text-[#102e43] flex items-center justify-center transition-colors shadow-sm"
              title="Close"
            >
              <X size={18} />
            </button>
            <div className="h-28 bg-[#0c2436] flex items-center justify-center relative">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#64e2bc] bg-white/10 px-3.5 py-1 rounded-full border border-white/10">
                Today&apos;s Event & Announcement
              </span>
            </div>
            <div className="p-6 pt-0 flex flex-col items-center text-center">
              <div className="-mt-10 mb-4 w-20 h-20 bg-white rounded-2xl shadow-lg border border-[#dfe7eb] flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  {new Date(todayEvent.date).toLocaleString("default", { month: "short" })}
                </span>
                <span className="text-3xl font-black text-[#102e43] leading-none mt-0.5">
                  {new Date(todayEvent.date).getDate()}
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#102e43] tracking-tight mb-1.5 px-2">
                {todayEvent.title}
              </h2>
              <p className="text-xs font-bold text-[#667987] mb-3">
                {new Date(todayEvent.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
              <span className="inline-block bg-[#f3f7f8] text-[#102e43] text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-[#dfe7eb] mb-6">
                Target Audience: {todayEvent.audience || "All"}
              </span>
              <Button
                onClick={() => setShowTodayEventModal(false)}
                className="w-full bg-[#102e43] hover:bg-[#1b425a] text-white font-bold py-3.5 rounded-xl shadow-md text-sm"
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
