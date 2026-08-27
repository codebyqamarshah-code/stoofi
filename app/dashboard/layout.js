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
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading, checkAuth, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Accordion state: only one menu dropdown open at a time for smooth UX
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="relative flex flex-col items-center justify-center">
          <div className="h-16 w-16 relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-zinc-900 rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">
            eSkooly<span className="text-[10px] font-bold text-zinc-900 bg-emerald-500 rounded px-1.5 py-0.5 ml-1 align-top inline-block">PRO</span>
          </h2>
          <p className="text-zinc-500 text-sm animate-pulse">Loading Workspace...</p>
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

  const menuStructure = [
    {
      groupTitle: 'DASHBOARD',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Sidebar Manager', href: '/dashboard/sidebar-manager', icon: Settings },
      ]
    },
    {
      groupTitle: 'ADMINISTRATION',
      items: [
        {
          name: 'Admin Section',
          icon: Users,
          hasSubmenu: true,
          subItems: [
            { name: 'Admission Query', href: '/dashboard/admin/admission-query' },
            { name: 'Visitor Book', href: '/dashboard/admin/visitor-book' },
            { name: 'Complaint', href: '/dashboard/admin/complaint' },
            { name: 'Postal Receive', href: '/dashboard/admin/postal-receive' },
            { name: 'Postal Dispatch', href: '/dashboard/admin/postal-dispatch' },
            { name: 'Phone Call Log', href: '/dashboard/admin/phone-call-log' },
            { name: 'Admin Setup', href: '/dashboard/admin/setup' },
            { name: 'ID Card', href: '/dashboard/admin/id-card' },
            { name: 'Certificate', href: '/dashboard/admin/certificate' },
            { name: 'Generate Certificate', href: '/dashboard/admin/generate-certificate' },
            { name: 'Generate ID Card', href: '/dashboard/admin/generate-id-card' },
          ]
        },
        {
          name: 'Academics',
          icon: GraduationCap,
          hasSubmenu: true,
          subItems: [
            { name: 'Optional Subject', href: '/dashboard/academics/optional-subject' },
            { name: 'Section', href: '/dashboard/academics/section' },
            { name: 'Class', href: '/dashboard/academics/class' },
            { name: 'Subjects', href: '/dashboard/academics/subjects' },
            { name: 'Assign Class Teacher', href: '/dashboard/academics/assign-class-teacher' },
            { name: 'Assign Subject', href: '/dashboard/academics/assign-subject' },
            { name: 'Class Room', href: '/dashboard/academics/classroom' },
            { name: 'Class Routine', href: '/dashboard/academics/routine' },
          ]
        },
        {
          name: 'Study Material',
          icon: FolderOpen,
          hasSubmenu: true,
          subItems: [
            { name: 'Upload Content', href: '/dashboard/study/upload' },
            { name: 'Assignment', href: '/dashboard/study/assignment' },
            { name: 'Syllabus', href: '/dashboard/study/syllabus' },
            { name: 'Other Downloads', href: '/dashboard/study/downloads' },
          ]
        },
        {
          name: 'Lesson Plan',
          icon: BookMarked,
          hasSubmenu: true,
          subItems: [
            { name: 'Lesson', href: '/dashboard/lesson-plan/lesson' },
            { name: 'Topic', href: '/dashboard/lesson-plan/topic' },
            { name: 'Topic Overview', href: '/dashboard/lesson-plan/topic-overview' },
            { name: 'Lesson Plan', href: '/dashboard/lesson-plan/plan' },
            { name: 'Lesson Plan Overview', href: '/dashboard/lesson-plan/overview' },
          ]
        },
        {
          name: 'Bulk Print',
          icon: Printer,
          hasSubmenu: true,
          subItems: [
            { name: 'ID Card', href: '/dashboard/bulk-print/id-card' },
            { name: 'Certificate', href: '/dashboard/bulk-print/certificate' },
            { name: 'Payroll Bulk Print', href: '/dashboard/bulk-print/payroll' },
            { name: 'Fees Invoice Bulk Print', href: '/dashboard/bulk-print/fees-invoice' },
            { name: 'Fees Invoice Bulk Print Settings', href: '/dashboard/bulk-print/settings' },
          ]
        },
        {
          name: 'Download Center',
          icon: Download,
          hasSubmenu: true,
          subItems: [
            { name: 'Content Type', href: '/dashboard/download-center/content-type' },
            { name: 'Content List', href: '/dashboard/download-center/content-list' },
            { name: 'Shared Content List', href: '/dashboard/download-center/shared-content' },
            { name: 'Video List', href: '/dashboard/download-center/videos' },
          ]
        },
        {
          name: 'LMS',
          icon: Layers,
          badge: 'ADDON',
          hasSubmenu: true,
          subItems: [
            { name: 'All Courses', href: '/dashboard/lms/courses' },
            { name: 'Add Course', href: '/dashboard/lms/add-course' },
            { name: 'Pending Course', href: '/dashboard/lms/pending' },
            { name: 'Enroll History', href: '/dashboard/lms/enroll-history' },
            { name: 'Purchase Log', href: '/dashboard/lms/purchase-log' },
            { name: 'LMS Fees Invoice', href: '/dashboard/lms/invoice' },
            { name: 'Category List', href: '/dashboard/lms/categories' },
            { name: 'Course Level', href: '/dashboard/lms/levels' },
            { name: 'Vimeo Settings', href: '/dashboard/lms/vimeo' },
            { name: 'Settings', href: '/dashboard/lms/settings' },
          ]
        },
      ]
    },
    {
      groupTitle: 'STUDENT',
      items: [
        {
          name: 'Student Info',
          icon: Users,
          hasSubmenu: true,
          subItems: [
            { name: 'Student Category', href: '/dashboard/students/category' },
            { name: 'Add Student', href: '/dashboard/students/add' },
            { name: 'Student List', href: '/dashboard/students' },
            { name: 'Multi Class Student', href: '/dashboard/students/multi-class' },
            { name: 'Delete Student Record', href: '/dashboard/students/delete-record' },
            { name: 'Unassigned Student', href: '/dashboard/students/unassigned' },
            { name: 'Student Attendance', href: '/dashboard/students/attendance' },
            { name: 'Student Group', href: '/dashboard/students/groups' },
            { name: 'Student Promote', href: '/dashboard/students/promote' },
            { name: 'Disabled Students', href: '/dashboard/students/disabled' },
            { name: 'Subject Wise Attendance', href: '/dashboard/students/subject-attendance' },
            { name: 'Student Export', href: '/dashboard/students/export' },
            { name: 'SMS Sending Time', href: '/dashboard/students/sms-sending-time' },
          ]
        },
        {
          name: 'Behaviour Records',
          icon: Shield,
          hasSubmenu: true,
          subItems: [
            { name: 'Incidents', href: '/dashboard/behaviour/incidents' },
            { name: 'Assign Incident', href: '/dashboard/behaviour/assign' },
            { name: 'Student Incident Report', href: '/dashboard/behaviour/student-report' },
            { name: 'Behaviour Report', href: '/dashboard/behaviour/report' },
            { name: 'Class Section Report', href: '/dashboard/behaviour/class-section' },
            { name: 'Incident Wise Report', href: '/dashboard/behaviour/incident-wise' },
            { name: 'Settings', href: '/dashboard/behaviour/settings' },
          ]
        },
        {
          name: 'Fees',
          icon: DollarSign,
          hasSubmenu: true,
          subItems: [
            { name: 'Fees Group', href: '/dashboard/fees/group' },
            { name: 'Fees Type', href: '/dashboard/fees/type' },
            { name: 'Fees Invoice', href: '/dashboard/fees/invoice' },
            { name: 'Bank Payment', href: '/dashboard/fees/bank-payment' },
            { name: 'Fees Carry Forward', href: '/dashboard/fees/carry-forward' },
          ]
        },
        {
          name: 'Homework',
          icon: BookOpen,
          hasSubmenu: true,
          subItems: [
            { name: 'Add Homework', href: '/dashboard/homework/add' },
            { name: 'Homework List', href: '/dashboard/homework/list' },
            { name: 'Homework Report', href: '/dashboard/homework/report' },
          ]
        },
        {
          name: 'Library',
          icon: BookOpen,
          hasSubmenu: true,
          subItems: [
            { name: 'Add Book', href: '/dashboard/library/add-book' },
            { name: 'Book List', href: '/dashboard/library/book-list' },
            { name: 'Book Categories', href: '/dashboard/library/book-categories' },
            { name: 'Add Member', href: '/dashboard/library/add-member' },
            { name: 'Issue/Return Book', href: '/dashboard/library/issue-return-book' },
            { name: 'All Issued Book', href: '/dashboard/library/all-issued-books' },
            { name: 'Subject', href: '/dashboard/library/subject' },
          ]
        },
        {
          name: 'Transport',
          icon: BookOpen,
          hasSubmenu: true,
          subItems: [
            { name: 'Routes', href: '/dashboard/transport/routes' },
            { name: 'Vehicle', href: '/dashboard/transport/vehicle' },
            { name: 'Assign Vehicle', href: '/dashboard/transport/assign-vehicle' },
          ]
        },
        {
          name: 'Dormitory',
          icon: BookOpen,
          hasSubmenu: true,
          subItems: [
            { name: 'Dormitory Rooms', href: '/dashboard/dormitory/dormitory-rooms' },
            { name: 'Dormitory', href: '/dashboard/dormitory' },
            { name: 'Room Type', href: '/dashboard/dormitory/room-type' },
          ]
        },      ]
    },
    {
      groupTitle: 'EXAM',
      items: [
        {
          name: 'Examination',
          icon: Award,
          hasSubmenu: true,
          subItems: [
            { name: 'Exam Type', href: '/dashboard/examination/exam-type' },
            { name: 'Exam Setup', href: '/dashboard/examination/exam-setup' },
            { name: 'Exam Schedule', href: '/dashboard/examination/exam-schedule' },
            { name: 'Exam Attendance', href: '/dashboard/examination/exam-attendance' },
            { name: 'Marks Register', href: '/dashboard/examination/marks-register' },
            { name: 'Marks Grade', href: '/dashboard/examination/marks-grade' },
            { name: 'Send Marks By Sms', href: '/dashboard/examination/send-marks-by-sms' },
            { name: 'Marksheet Report', href: '/dashboard/examination/marksheet-report' },
          ]
        },
        {
          name: 'Exam Plan',
          icon: CalendarDays,
          hasSubmenu: true,
          subItems: [
            { name: 'Admit Card', href: '/dashboard/exam-plan/admit-card' },
            { name: 'Seat Plan', href: '/dashboard/exam-plan/seat-plan' },
          ]
        },
        {
          name: 'Online Exam',
          icon: Monitor,
          hasSubmenu: true,
          subItems: [
            { name: 'Question Group', href: '/dashboard/online-exam/question-group' },
            { name: 'Question Bank', href: '/dashboard/online-exam/question-bank' },
            { name: 'Online Exam', href: '/dashboard/online-exam' },
          ]
        },
      ]
    },
    {
      groupTitle: 'HR',
      items: [
        {
          name: 'Human Resource',
          icon: Users,
          hasSubmenu: true,
          subItems: [
            { name: 'Designation', href: '/dashboard/hr/designation' },
            { name: 'Department', href: '/dashboard/hr/department' },
            { name: 'Add Staff', href: '/dashboard/hr/add-staff' },
            { name: 'Staff Directory', href: '/dashboard/hr/staff-directory' },
            { name: 'Staff Attendance', href: '/dashboard/hr/staff-attendance' },
            { name: 'Payroll', href: '/dashboard/hr/payroll' },
          ]
        },
        {
          name: 'Teacher Evaluation',
          icon: Award,
          hasSubmenu: true,
          subItems: [
            { name: 'Approved Report', href: '/dashboard/teacher-evaluation/approved-report' },
            { name: 'Pending Report', href: '/dashboard/teacher-evaluation/pending-report' },
            { name: 'Teacher Wise Report', href: '/dashboard/teacher-evaluation/teacher-wise-report' },
            { name: 'Settings', href: '/dashboard/teacher-evaluation/settings' },
          ]
        },
        {
          name: 'Leave',
          icon: CalendarDays,
          hasSubmenu: true,
          subItems: [
            { name: 'Apply Leave', href: '/dashboard/leave/apply' },
            { name: 'Approve Leave Request', href: '/dashboard/leave/approve' },
            { name: 'Pending Leave Request', href: '/dashboard/leave/pending' },
            { name: 'Leave Define', href: '/dashboard/leave/define' },
            { name: 'Leave Type', href: '/dashboard/leave/type' },
          ]
        },
        {
          name: 'Role & Permission',
          icon: Shield,
          hasSubmenu: true,
          subItems: [
            { name: 'Login Permission', href: '/dashboard/roles/login-permission' },
            { name: 'Role', href: '/dashboard/roles/role' },
            { name: 'Due Fees Login Permission', href: '/dashboard/roles/due-fees-permission' },
          ]
        },
      ]
    },
    {
      groupTitle: 'ACCOUNTS',
      items: [
        { name: 'Wallet', href: '/dashboard/accounts/wallet', icon: Wallet },
        { name: 'Accounts', href: '/dashboard/accounts/accounts', icon: Building },
        { name: 'Inventory', href: '/dashboard/accounts/inventory', icon: Box },
      ]
    },
    {
      groupTitle: 'UTILITIES',
      items: [
        { name: 'Chat', href: '/dashboard/utilities/chat', icon: MessageSquare },
        { name: 'Communicate', href: '/dashboard/utilities/communicate', icon: Megaphone },
        { name: 'Style', href: '/dashboard/utilities/style', icon: Paintbrush },
      ]
    },
    {
      groupTitle: 'REPORT',
      items: [
        { name: 'Student Report', href: '/dashboard/report/student', icon: Users },
        { name: 'Exam Report', href: '/dashboard/report/exam', icon: Award },
        { name: 'Staff Report', href: '/dashboard/report/staff', icon: User },
        { name: 'Fees Report', href: '/dashboard/report/fees', icon: DollarSign },
        { name: 'Accounts Report', href: '/dashboard/report/accounts', icon: PieChart },
      ]
    },
    {
      groupTitle: 'SETTINGS SECTION',
      items: [
        { name: 'Custom Field', href: '/dashboard/settings/custom-field', icon: List },
        { name: 'General Settings', href: '/dashboard/settings/general', icon: Settings },
        { name: 'Frontend CMS', href: '/dashboard/settings/frontend-cms', icon: Monitor },
        { name: 'Fees Settings', href: '/dashboard/settings/fees', icon: DollarSign },
        { name: 'Exam Settings', href: '/dashboard/settings/exam', icon: Award },
      ]
    },
    {
      groupTitle: 'MODULE',
      items: [
        { name: 'Jitsi', href: '/dashboard/module/jitsi', icon: Video, badge: 'ADDON' },
        { name: 'Virtual Class', href: '/dashboard/module/virtual-class', icon: Video, badge: 'ADDON' },
        { name: 'Registration', href: '/dashboard/module/registration', icon: Users, badge: 'ADDON' },
        { name: 'BigBlueButton', href: '/dashboard/module/bigbluebutton', icon: Video, badge: 'ADDON' },
        { name: 'Gmeet', href: '/dashboard/module/gmeet', icon: Video, badge: 'ADDON' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar with Accordion Animation */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 md:relative md:translate-x-0 flex flex-col shrink-0`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-6 shrink-0 bg-zinc-950">
          <Link href="/dashboard" className="flex items-center text-emerald-500 cursor-pointer">
            <School className="h-8 w-8" />
            <span className="text-xl font-extrabold tracking-tight text-zinc-50 ml-2">eSkooly</span>
            <span className="text-[10px] font-bold text-zinc-900 bg-emerald-500 rounded px-1.5 py-0.5 ml-1 translate-y-[-6px]">PRO</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-zinc-400 hover:text-zinc-50 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
          {menuStructure.map((group, gIdx) => (
            <div key={gIdx}>
              <h4 className="mb-2 px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                {group.groupTitle}
              </h4>
              <div className="space-y-1">
                {group.items.map((item, iIdx) => {
                  const isOpen = openSubmenu === item.name;

                  if (item.hasSubmenu) {
                    return (
                      <div key={iIdx} className="space-y-1">
                        <button
                          onClick={() => toggleSubmenu(item.name)}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-all duration-200 ${
                            isOpen 
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' 
                              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className={`h-4 w-4 ${isOpen ? 'text-emerald-400' : 'text-zinc-400'}`} />
                            <span>{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className="text-[9px] font-bold uppercase bg-emerald-900/40 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800/40">
                                {item.badge}
                              </span>
                            )}
                            <ChevronDown 
                              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                isOpen ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
                              }`} 
                            />
                          </div>
                        </button>

                        {/* Smooth animated accordion dropdown */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? 'max-h-[450px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                          }`}
                        >
                          <div className="pl-7 pr-2 py-1 space-y-0.5 border-l border-zinc-800 ml-5 my-1">
                            {item.subItems.map((sub, sIdx) => (
                              <Link
                                key={sIdx}
                                href={sub.href}
                                className={`block rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                                  pathname === sub.href
                                    ? 'text-emerald-400 bg-emerald-950/50 font-bold'
                                    : 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900/60'
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
                      key={iIdx}
                      href={item.href}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-colors group ${
                        pathname === item.href
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-bold'
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-emerald-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-4 w-4 group-hover:text-emerald-400 transition-colors text-zinc-400" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold uppercase bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6 shrink-0 gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-zinc-50 cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative w-full max-w-xs hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors cursor-text"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block w-48">
              <input
                type="text"
                placeholder="Name/Admission No..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors cursor-text"
              />
            </div>

            <div className="hidden lg:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 font-medium cursor-pointer hover:border-zinc-700">
              2026 [Jan-Dec]
            </div>

            <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 font-semibold cursor-pointer hover:border-zinc-700">
              EN
            </div>
            
            <ThemeToggle />

            <button className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
                0
              </span>
            </button>

            <div className="flex items-center space-x-3 border-l border-zinc-800 pl-3">
              <div className="h-8 w-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs cursor-pointer">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-zinc-200 leading-none">{user?.username || 'Super Admin'}</div>
                <div className="text-[10px] text-zinc-500 font-medium mt-1 uppercase">{user?.role || 'SUPER ADMIN'}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-rose-400 h-8 w-8 cursor-pointer">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-zinc-950 p-4 sm:p-6 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
