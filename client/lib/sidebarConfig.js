import { 
  LayoutDashboard,
  FlaskConical,
  Cpu,
  Beaker,
  FileCheck,
  ArrowLeftRight,
  Wrench,
  ShieldAlert,
  Boxes,
  CalendarClock,
  Laptop, 
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
  Phone,
  BookCopy,
  UploadCloud,
  MapPin,
  Truck,
  BedDouble,
  BarChart2,
  BadgeCheck,
  UserCheck,
  UserPlus,
  UserX,
  Banknote,
  ArrowRightLeft,
  PackagePlus,
  ShoppingCart,
  Tag,
  Warehouse,
  Globe,
  SlidersHorizontal,
  PenLine,
  Hash,
  Lock,
  LogIn,
  MailOpen,
  MessagesSquare,
  Send,
  Star,
  Trophy,
  ClipboardList,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';

export const ICON_MAP = {
  Sparkles,
  LayoutDashboard,
  Users,
  BookOpen,
  FolderOpen,
  Settings,
  School,
  DollarSign,
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
  Phone,
  BookCopy,
  UploadCloud,
  MapPin,
  Truck,
  BedDouble,
  BarChart2,
  BadgeCheck,
  UserCheck,
  UserPlus,
  UserX,
  Banknote,
  ArrowRightLeft,
  PackagePlus,
  ShoppingCart,
  Tag,
  Warehouse,
  Globe,
  SlidersHorizontal,
  PenLine,
  Hash,
  Lock,
  LogIn,
  MailOpen,
  MessagesSquare,
  Send,
  Star,
  Trophy,
  Bell
};

export const DEFAULT_MENU_STRUCTURE = [
  {
    id: 'grp-dashboard',
    groupTitle: 'DASHBOARD',
    visible: true,
    items: [
      { id: 'item-dash', name: 'Dashboard', href: '/dashboard', iconName: 'LayoutDashboard', visible: true },
    ]
  },
  {
    id: 'grp-administration',
    groupTitle: 'ADMINISTRATION',
    visible: true,
    items: [
      {
        id: 'item-admin-sec',
        name: 'Admin Section',
        iconName: 'Users',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-adm-query', name: 'Admission Query', href: '/dashboard/admin/admission-query', iconName: 'ClipboardList', visible: true },
          { id: 'sub-adm-visitor', name: 'Visitor Book', href: '/dashboard/admin/visitor-book', iconName: 'BookOpen', visible: true },
          { id: 'sub-adm-complaint', name: 'Complaint', href: '/dashboard/admin/complaint', iconName: 'MessageSquare', visible: true },
          { id: 'sub-adm-postal-rec', name: 'Postal Receive', href: '/dashboard/admin/postal-receive', iconName: 'Download', visible: true },
          { id: 'sub-adm-postal-disp', name: 'Postal Dispatch', href: '/dashboard/admin/postal-dispatch', iconName: 'Send', visible: true },
          { id: 'sub-adm-phone-call', name: 'Phone Call Log', href: '/dashboard/admin/phone-call-log', iconName: 'Phone', visible: true },
          { id: 'sub-adm-id-card', name: 'ID Card', href: '/dashboard/admin/id-card', iconName: 'CreditCard', visible: true },
          { id: 'sub-adm-cert', name: 'Certificate', href: '/dashboard/admin/certificate', iconName: 'Award', visible: true },
          { id: 'sub-adm-gen-cert', name: 'Generate Certificate', href: '/dashboard/admin/generate-certificate', iconName: 'BadgeCheck', visible: true },
          { id: 'sub-adm-gen-id', name: 'Generate ID Card', href: '/dashboard/admin/generate-id-card', iconName: 'CreditCard', visible: true },
          { id: 'sub-adm-setup', name: 'Admin Setup', href: '/dashboard/admin/setup', iconName: 'Settings', visible: true },
        ]
      },
      {
        id: 'item-academics',
        name: 'Academics',
        iconName: 'GraduationCap',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-acad-opt-subj', name: 'Optional Subject', href: '/dashboard/academics/optional-subject', iconName: 'BookCopy', visible: true },
          { id: 'sub-acad-section', name: 'Section', href: '/dashboard/academics/section', iconName: 'Layers', visible: true },
          { id: 'sub-acad-class', name: 'Class', href: '/dashboard/academics/class', iconName: 'School', visible: true },
          { id: 'sub-acad-subjects', name: 'Subjects', href: '/dashboard/academics/subjects', iconName: 'BookMarked', visible: true },
          { id: 'sub-acad-assign-teacher', name: 'Assign Class Teacher', href: '/dashboard/academics/assign-class-teacher', iconName: 'UserCheck', visible: true },
          { id: 'sub-acad-assign-subj', name: 'Assign Subject', href: '/dashboard/academics/assign-subject', iconName: 'CheckSquare', visible: true },
          { id: 'sub-acad-classroom', name: 'Class Room', href: '/dashboard/academics/classroom', iconName: 'Building', visible: true },
          { id: 'sub-acad-routine', name: 'Class Routine', href: '/dashboard/academics/routine', iconName: 'CalendarDays', visible: true },
        ]
      },
      {
        id: 'item-study-mat',
        name: 'Study Material',
        iconName: 'FolderOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-study-upload', name: 'Upload Content', href: '/dashboard/study/upload', iconName: 'UploadCloud', visible: true },
          { id: 'sub-study-assign', name: 'Assignment', href: '/dashboard/study/assignment', iconName: 'FileSpreadsheet', visible: true },
          { id: 'sub-study-syllabus', name: 'Syllabus', href: '/dashboard/study/syllabus', iconName: 'ListTodo', visible: true },
          { id: 'sub-study-downloads', name: 'Other Downloads', href: '/dashboard/study/downloads', iconName: 'Download', visible: true },
        ]
      },
      {
        id: 'item-labs',
        name: 'Labs',
        iconName: 'FlaskConical',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-lab-dash', name: 'Dashboard', href: '/dashboard/labs', iconName: 'LayoutDashboard', visible: true },
          { id: 'sub-lab-cats', name: 'Lab Categories', href: '/dashboard/labs/categories', iconName: 'Boxes', visible: true },
          { id: 'sub-lab-manage', name: 'Manage Labs', href: '/dashboard/labs/manage', iconName: 'FlaskConical', visible: true },
          { id: 'sub-lab-equip', name: 'Equipment & Assets', href: '/dashboard/labs/equipment', iconName: 'Cpu', visible: true },
          { id: 'sub-lab-consumables', name: 'Consumables', href: '/dashboard/labs/consumables', iconName: 'Beaker', visible: true },
          { id: 'sub-lab-schedule', name: 'Lab Schedule', href: '/dashboard/labs/schedule', iconName: 'CalendarDays', visible: true },
          { id: 'sub-lab-practicals', name: 'Practicals', href: '/dashboard/labs/practicals', iconName: 'FileCheck', visible: true },
          { id: 'sub-lab-issue', name: 'Equipment Issue/Return', href: '/dashboard/labs/issue-return', iconName: 'ArrowLeftRight', visible: true },
          { id: 'sub-lab-maint', name: 'Maintenance', href: '/dashboard/labs/maintenance', iconName: 'Wrench', visible: true },
          { id: 'sub-lab-safety', name: 'Safety & Incidents', href: '/dashboard/labs/safety', iconName: 'ShieldAlert', visible: true },
          { id: 'sub-lab-reports', name: 'Reports', href: '/dashboard/labs/reports', iconName: 'BarChart2', visible: true },
          { id: 'sub-lab-settings', name: 'Settings', href: '/dashboard/labs/settings', iconName: 'Settings', visible: true },
        ]
      },
      {
        id: 'item-lesson-plan',
        name: 'Lesson Plan',
        iconName: 'BookMarked',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-lesson-item', name: 'Lesson', href: '/dashboard/lesson-plan/lesson', iconName: 'BookOpen', visible: true },
          { id: 'sub-lesson-topic', name: 'Topic', href: '/dashboard/lesson-plan/topic', iconName: 'Hash', visible: true },
          { id: 'sub-lesson-topic-ov', name: 'Topic Overview', href: '/dashboard/lesson-plan/topic-overview', iconName: 'FileText', visible: true },
          { id: 'sub-lesson-plan-item', name: 'Lesson Plan', href: '/dashboard/lesson-plan/plan', iconName: 'BookMarked', visible: true },
          { id: 'sub-lesson-plan-ov', name: 'Lesson Plan Overview', href: '/dashboard/lesson-plan/overview', iconName: 'FileSpreadsheet', visible: true },
        ]
      },
    ]
  },
  {
    id: 'grp-student',
    groupTitle: 'STUDENT',
    visible: true,
    items: [
      {
        id: 'item-student-info',
        name: 'Student Info',
        iconName: 'Users',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-stu-cat', name: 'Student Category', href: '/dashboard/students/category', iconName: 'Tag', visible: true },
          { id: 'sub-stu-add', name: 'Add Student', href: '/dashboard/students/add', iconName: 'UserPlus', visible: true },
          { id: 'sub-stu-list', name: 'Student List', href: '/dashboard/students', iconName: 'Users', visible: true },
          { id: 'sub-stu-multi', name: 'Multi Class Student', href: '/dashboard/students/multi-class', iconName: 'Users', visible: true },
          { id: 'sub-stu-del', name: 'Delete Student Record', href: '/dashboard/students/delete-record', iconName: 'UserX', visible: true },
          { id: 'sub-stu-unassign', name: 'Unassigned Student', href: '/dashboard/students/unassigned', iconName: 'UserX', visible: true },
          { id: 'sub-stu-att', name: 'Student Attendance', href: '/dashboard/students/attendance', iconName: 'CalendarCheck', visible: true },
          { id: 'sub-stu-grp', name: 'Student Group', href: '/dashboard/students/groups', iconName: 'Users', visible: true },
          { id: 'sub-stu-promote', name: 'Student Promote', href: '/dashboard/students/promote', iconName: 'Star', visible: true },
          { id: 'sub-stu-disable', name: 'Disabled Students', href: '/dashboard/students/disabled', iconName: 'Lock', visible: true },
          { id: 'sub-stu-subj-att', name: 'Subject Wise Attendance', href: '/dashboard/students/subject-attendance', iconName: 'BookOpen', visible: true },
          { id: 'sub-stu-export', name: 'Student Export', href: '/dashboard/students/export', iconName: 'Download', visible: true },
          { id: 'sub-stu-sms', name: 'SMS Sending Time', href: '/dashboard/students/sms-sending-time', iconName: 'MessagesSquare', visible: true },
        ]
      },
      {
        id: 'item-behaviour',
        name: 'Behaviour Records',
        iconName: 'Shield',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-beh-incidents', name: 'Incidents', href: '/dashboard/behaviour/incidents', iconName: 'Shield', visible: true },
          { id: 'sub-beh-assign', name: 'Assign Incident', href: '/dashboard/behaviour/assign', iconName: 'UserCheck', visible: true },
          { id: 'sub-beh-stu-rep', name: 'Student Incident Report', href: '/dashboard/behaviour/student-report', iconName: 'FileText', visible: true },
          { id: 'sub-beh-rep', name: 'Behaviour Report', href: '/dashboard/behaviour/report', iconName: 'BarChart2', visible: true },
          { id: 'sub-beh-class-sec', name: 'Class Section Report', href: '/dashboard/behaviour/class-section', iconName: 'School', visible: true },
          { id: 'sub-beh-inc-wise', name: 'Incident Wise Report', href: '/dashboard/behaviour/incident-wise', iconName: 'List', visible: true },
          { id: 'sub-beh-settings', name: 'Settings', href: '/dashboard/behaviour/settings', iconName: 'Settings', visible: true },
        ]
      },
      {
        id: 'item-fees',
        name: 'Fees',
        iconName: 'DollarSign',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-fees-collection', name: 'Fees Collection', href: '/dashboard/fees/collection', iconName: 'Banknote', visible: true },
          { id: 'sub-fees-grp', name: 'Fees Group', href: '/dashboard/fees/group', iconName: 'Layers', visible: true },
          { id: 'sub-fees-type', name: 'Fees Type', href: '/dashboard/fees/type', iconName: 'Tag', visible: true },
          { id: 'sub-fees-inv', name: 'Fees Invoice', href: '/dashboard/fees/invoice', iconName: 'FileText', visible: true },
          { id: 'sub-fees-bank', name: 'Bank Payment', href: '/dashboard/fees/bank-payment', iconName: 'Building', visible: true },
          { id: 'sub-fees-carry', name: 'Fees Carry Forward', href: '/dashboard/fees/carry-forward', iconName: 'ArrowRightLeft', visible: true },
        ]
      },
      {
        id: 'item-homework',
        name: 'Homework',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-hw-add', name: 'Add Homework', href: '/dashboard/homework/add', iconName: 'PenLine', visible: true },
          { id: 'sub-hw-list', name: 'Homework List', href: '/dashboard/homework/list', iconName: 'ListTodo', visible: true },
          { id: 'sub-hw-rep', name: 'Homework Report', href: '/dashboard/homework/report', iconName: 'BarChart2', visible: true },
        ]
      },
      {
        id: 'item-library',
        name: 'Library',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-lib-add', name: 'Add Book', href: '/dashboard/library/add-book', iconName: 'BookMarked', visible: true },
          { id: 'sub-lib-list', name: 'Book List', href: '/dashboard/library/book-list', iconName: 'List', visible: true },
          { id: 'sub-lib-cat', name: 'Book Categories', href: '/dashboard/library/book-categories', iconName: 'FolderOpen', visible: true },
          { id: 'sub-lib-member', name: 'Add Member', href: '/dashboard/library/add-member', iconName: 'UserPlus', visible: true },
          { id: 'sub-lib-issue', name: 'Issue/Return Book', href: '/dashboard/library/issue-return-book', iconName: 'ArrowRightLeft', visible: true },
          { id: 'sub-lib-issued-all', name: 'All Issued Book', href: '/dashboard/library/all-issued-books', iconName: 'CheckSquare', visible: true },
          { id: 'sub-lib-subj', name: 'Subject', href: '/dashboard/library/subject', iconName: 'BookOpen', visible: true },
        ]
      },
      {
        id: 'item-transport',
        name: 'Transport',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-trans-routes', name: 'Routes', href: '/dashboard/transport/routes', iconName: 'MapPin', visible: true },
          { id: 'sub-trans-veh', name: 'Vehicle', href: '/dashboard/transport/vehicle', iconName: 'Truck', visible: true },
          { id: 'sub-trans-assign', name: 'Assign Vehicle', href: '/dashboard/transport/assign-vehicle', iconName: 'UserCheck', visible: true },
        ]
      },
      {
        id: 'item-dormitory',
        name: 'Dormitory',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-dorm-rooms', name: 'Dormitory Rooms', href: '/dashboard/dormitory/dormitory-rooms', iconName: 'BedDouble', visible: true },
          { id: 'sub-dorm-dorm', name: 'Dormitory', href: '/dashboard/dormitory', iconName: 'Building', visible: true },
          { id: 'sub-dorm-type', name: 'Room Type', href: '/dashboard/dormitory/room-type', iconName: 'Tag', visible: true },
        ]
      }
    ]
  },
  {
    id: 'grp-exam',
    groupTitle: 'EXAM',
    visible: true,
    items: [
      {
        id: 'item-exam-main',
        name: 'Examination',
        iconName: 'Award',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-ex-type', name: 'Exam Type', href: '/dashboard/examination/exam-type', iconName: 'Tag', visible: true },
          { id: 'sub-ex-setup', name: 'Exam Setup', href: '/dashboard/examination/exam-setup', iconName: 'Settings', visible: true },
          { id: 'sub-ex-sched', name: 'Exam Schedule', href: '/dashboard/examination/exam-schedule', iconName: 'CalendarDays', visible: true },
          { id: 'sub-ex-att', name: 'Exam Attendance', href: '/dashboard/examination/exam-attendance', iconName: 'CalendarCheck', visible: true },
          { id: 'sub-ex-marks', name: 'Marks Register', href: '/dashboard/examination/marks-register', iconName: 'FileSpreadsheet', visible: true },
          { id: 'sub-ex-grade', name: 'Marks Grade', href: '/dashboard/examination/marks-grade', iconName: 'Award', visible: true },
          { id: 'sub-ex-sms', name: 'Send Marks By Sms', href: '/dashboard/examination/send-marks-by-sms', iconName: 'MessagesSquare', visible: true },
          { id: 'sub-ex-sheet', name: 'Marksheet Report', href: '/dashboard/examination/marksheet-report', iconName: 'FileText', visible: true },
        ]
      },
      {
        id: 'item-exam-plan',
        name: 'Exam Plan',
        iconName: 'CalendarDays',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-plan-admit', name: 'Admit Card', href: '/dashboard/exam-plan/admit-card', iconName: 'CreditCard', visible: true },
          { id: 'sub-plan-seat', name: 'Seat Plan', href: '/dashboard/exam-plan/seat-plan', iconName: 'LayoutDashboard', visible: true },
        ]
      },
      {
        id: 'item-online-exam',
        name: 'Online Exam',
        iconName: 'Monitor',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-on-grp', name: 'Question Group', href: '/dashboard/online-exam/question-group', iconName: 'Layers', visible: true },
          { id: 'sub-on-bank', name: 'Question Bank', href: '/dashboard/online-exam/question-bank', iconName: 'FileText', visible: true },
          { id: 'sub-on-exam', name: 'Online Exam', href: '/dashboard/online-exam', iconName: 'Monitor', visible: true },
        ]
      }
    ]
  },
  {
    id: 'grp-hr',
    groupTitle: 'HR',
    visible: true,
    items: [
      {
        id: 'item-hr-main',
        name: 'Human Resource',
        iconName: 'Users',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-hr-desig', name: 'Designation', href: '/dashboard/hr/designation', iconName: 'Tag', visible: true },
          { id: 'sub-hr-dept', name: 'Department', href: '/dashboard/hr/department', iconName: 'Building', visible: true },
          { id: 'sub-hr-add-staff', name: 'Add Staff', href: '/dashboard/hr/add-staff', iconName: 'UserPlus', visible: true },
          { id: 'sub-hr-dir', name: 'Staff Directory', href: '/dashboard/hr/staff-directory', iconName: 'Users', visible: true },
          { id: 'sub-hr-att', name: 'Staff Attendance', href: '/dashboard/hr/staff-attendance', iconName: 'CalendarCheck', visible: true },
          { id: 'sub-hr-payroll', name: 'Payroll', href: '/dashboard/hr/payroll', iconName: 'Banknote', visible: true },
        ]
      },
      {
        id: 'item-teacher-eval',
        name: 'Teacher Evaluation',
        iconName: 'Award',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-te-approved', name: 'Approved Report', href: '/dashboard/teacher-evaluation/approved-report', iconName: 'Trophy', visible: true },
          { id: 'sub-te-pending', name: 'Pending Report', href: '/dashboard/teacher-evaluation/pending-report', iconName: 'ListTodo', visible: true },
          { id: 'sub-te-wise', name: 'Teacher Wise Report', href: '/dashboard/teacher-evaluation/teacher-wise-report', iconName: 'BarChart2', visible: true },
          { id: 'sub-te-settings', name: 'Settings', href: '/dashboard/teacher-evaluation/settings', iconName: 'Settings', visible: true },
        ]
      },
      {
        id: 'item-leave',
        name: 'Leave',
        iconName: 'CalendarDays',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-leave-apply', name: 'Apply Leave', href: '/dashboard/leave/apply', iconName: 'PenLine', visible: true },
          { id: 'sub-leave-approve', name: 'Approve Leave Request', href: '/dashboard/leave/approve', iconName: 'CheckSquare', visible: true },
          { id: 'sub-leave-pending', name: 'Pending Leave Request', href: '/dashboard/leave/pending', iconName: 'ListTodo', visible: true },
          { id: 'sub-leave-define', name: 'Leave Define', href: '/dashboard/leave/define', iconName: 'Settings', visible: true },
          { id: 'sub-leave-type', name: 'Leave Type', href: '/dashboard/leave/type', iconName: 'Tag', visible: true },
        ]
      },
      {
        id: 'item-roles',
        name: 'Role & Permission',
        iconName: 'Shield',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-role-login', name: 'Login Permission', href: '/dashboard/roles/login-permission', iconName: 'LogIn', visible: true },
          { id: 'sub-role-role', name: 'Role', href: '/dashboard/roles/role', iconName: 'Shield', visible: true },
          { id: 'sub-role-due', name: 'Due Fees Login Permission', href: '/dashboard/roles/due-fees-permission', iconName: 'Lock', visible: true },
        ]
      },
      {
        id: 'item-bulk-print',
        name: 'Bulk Print',
        iconName: 'Printer',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-bulk-id', name: 'ID Card', href: '/dashboard/bulk-print/id-card', iconName: 'CreditCard', visible: true },
          { id: 'sub-bulk-cert', name: 'Certificate', href: '/dashboard/bulk-print/certificate', iconName: 'Award', visible: true },
          { id: 'sub-bulk-pay', name: 'Payroll Bulk Print', href: '/dashboard/bulk-print/payroll', iconName: 'Printer', visible: true },
          { id: 'sub-bulk-fees', name: 'Fees Invoice Bulk Print', href: '/dashboard/bulk-print/fees-invoice', iconName: 'FileText', visible: true },
          { id: 'sub-bulk-settings', name: 'Fees Invoice Bulk Print Settings', href: '/dashboard/bulk-print/settings', iconName: 'SlidersHorizontal', visible: true },
        ]
      },
      {
        id: 'item-download-center',
        name: 'Download Center',
        iconName: 'Download',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-dl-type', name: 'Content Type', href: '/dashboard/download-center/content-type', iconName: 'Tag', visible: true },
          { id: 'sub-dl-list', name: 'Content List', href: '/dashboard/download-center/content-list', iconName: 'List', visible: true },
          { id: 'sub-dl-shared', name: 'Shared Content List', href: '/dashboard/download-center/shared-content', iconName: 'FolderOpen', visible: true },
          { id: 'sub-dl-videos', name: 'Video List', href: '/dashboard/download-center/videos', iconName: 'Video', visible: true },
        ]
      },
      {
        id: 'item-lms',
        name: 'LMS',
        iconName: 'Layers',
        badge: 'ADDON',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-lms-all', name: 'All Courses', href: '/dashboard/lms/courses', iconName: 'BookOpen', visible: true },
          { id: 'sub-lms-add', name: 'Add Course', href: '/dashboard/lms/add-course', iconName: 'BookMarked', visible: true },
          { id: 'sub-lms-pending', name: 'Pending Course', href: '/dashboard/lms/pending', iconName: 'ListTodo', visible: true },
          { id: 'sub-lms-history', name: 'Enroll History', href: '/dashboard/lms/enroll-history', iconName: 'CalendarDays', visible: true },
          { id: 'sub-lms-log', name: 'Purchase Log', href: '/dashboard/lms/purchase-log', iconName: 'FileText', visible: true },
          { id: 'sub-lms-inv', name: 'LMS Fees Invoice', href: '/dashboard/lms/invoice', iconName: 'DollarSign', visible: true },
          { id: 'sub-lms-cat', name: 'Category List', href: '/dashboard/lms/categories', iconName: 'List', visible: true },
          { id: 'sub-lms-lvl', name: 'Course Level', href: '/dashboard/lms/levels', iconName: 'Layers', visible: true },
          { id: 'sub-lms-vimeo', name: 'Vimeo Settings', href: '/dashboard/lms/vimeo', iconName: 'Video', visible: true },
          { id: 'sub-lms-set', name: 'Settings', href: '/dashboard/lms/settings', iconName: 'Settings', visible: true },
        ]
      }
    ]
  },
  {
    id: 'grp-accounts',
    groupTitle: 'ACCOUNTS',
    visible: true,
    items: [
      {
        id: 'item-acc-wallet',
        name: 'Wallet',
        iconName: 'Wallet',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-wallet-pending', name: 'Pending Deposit', href: '/dashboard/accounts/wallet/pending-deposit', iconName: 'ListTodo', visible: true },
          { id: 'sub-wallet-approve', name: 'Approve Deposit', href: '/dashboard/accounts/wallet/approve-deposit', iconName: 'CheckSquare', visible: true },
          { id: 'sub-wallet-reject', name: 'Reject Deposit', href: '/dashboard/accounts/wallet/reject-deposit', iconName: 'UserX', visible: true },
          { id: 'sub-wallet-txn', name: 'Wallet Transaction', href: '/dashboard/accounts/wallet/transactions', iconName: 'ArrowRightLeft', visible: true },
          { id: 'sub-wallet-refund', name: 'Refund Request', href: '/dashboard/accounts/wallet/refund-request', iconName: 'Banknote', visible: true },
        ]
      },
      {
        id: 'item-acc-accounts',
        name: 'Accounts',
        iconName: 'Building',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-acc-pl', name: 'Profit & Loss', href: '/dashboard/accounts/accounts/profit-loss', iconName: 'BarChart2', visible: true },
          { id: 'sub-acc-income', name: 'Income', href: '/dashboard/accounts/accounts/income', iconName: 'Banknote', visible: true },
          { id: 'sub-acc-expense', name: 'Expense', href: '/dashboard/accounts/accounts/expense', iconName: 'DollarSign', visible: true },
          { id: 'sub-acc-chart', name: 'Chart Of Account', href: '/dashboard/accounts/accounts/chart-of-account', iconName: 'PieChart', visible: true },
          { id: 'sub-acc-bank', name: 'Bank Account', href: '/dashboard/accounts/accounts/bank-account', iconName: 'Building', visible: true },
          { id: 'sub-acc-fund', name: 'Fund Transfer', href: '/dashboard/accounts/accounts/fund-transfer', iconName: 'ArrowRightLeft', visible: true },
        ]
      },
      {
        id: 'item-acc-inventory',
        name: 'Inventory',
        iconName: 'Box',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-inv-cat', name: 'Item Category', href: '/dashboard/accounts/inventory/item-category', iconName: 'Tag', visible: true },
          { id: 'sub-inv-list', name: 'Item List', href: '/dashboard/accounts/inventory/item-list', iconName: 'List', visible: true },
          { id: 'sub-inv-store', name: 'Item Store', href: '/dashboard/accounts/inventory/item-store', iconName: 'Warehouse', visible: true },
          { id: 'sub-inv-supplier', name: 'Supplier', href: '/dashboard/accounts/inventory/supplier', iconName: 'Users', visible: true },
          { id: 'sub-inv-receive', name: 'Item Receive', href: '/dashboard/accounts/inventory/item-receive', iconName: 'PackagePlus', visible: true },
          { id: 'sub-inv-receive-list', name: 'Item Receive List', href: '/dashboard/accounts/inventory/item-receive-list', iconName: 'List', visible: true },
          { id: 'sub-inv-sell', name: 'Item Sell', href: '/dashboard/accounts/inventory/item-sell', iconName: 'ShoppingCart', visible: true },
          { id: 'sub-inv-issue', name: 'Item Issue', href: '/dashboard/accounts/inventory/item-issue', iconName: 'ArrowRightLeft', visible: true },
        ]
      },
    ]
  },
  {
    id: 'grp-utilities',
    groupTitle: 'UTILITIES',
    visible: true,
    items: [
      {
        id: 'item-ut-chat',
        name: 'Chat',
        iconName: 'MessageSquare',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-chat-box', name: 'Stoofi AI', href: '/dashboard/utilities/chat/chat-box', iconName: 'Sparkles', visible: true },
          { id: 'sub-chat-inv', name: 'Invitation', href: '/dashboard/utilities/chat/invitation', iconName: 'MailOpen', visible: true },
          { id: 'sub-chat-blocked', name: 'Blocked User', href: '/dashboard/utilities/chat/blocked-user', iconName: 'Lock', visible: true },
        ]
      },
      {
        id: 'item-ut-comm',
        name: 'Communicate',
        iconName: 'Megaphone',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-comm-notice', name: 'Notice Board', href: '/dashboard/utilities/communicate/notice-board', iconName: 'Bell', visible: true },
          { id: 'sub-comm-send', name: 'Send Email / Sms', href: '/dashboard/utilities/communicate/send-email-sms', iconName: 'Send', visible: true },
          { id: 'sub-comm-log', name: 'Email / Sms Log', href: '/dashboard/utilities/communicate/email-sms-log', iconName: 'List', visible: true },
          { id: 'sub-comm-event', name: 'Event', href: '/dashboard/utilities/communicate/event', iconName: 'CalendarDays', visible: true },
          { id: 'sub-comm-cal', name: 'Calendar', href: '/dashboard/utilities/communicate/calendar', iconName: 'CalendarCheck', visible: true },
          { id: 'sub-comm-email-tpl', name: 'Email Template', href: '/dashboard/utilities/communicate/email-template', iconName: 'MailOpen', visible: true },
          { id: 'sub-comm-sms-tpl', name: 'Sms Template', href: '/dashboard/utilities/communicate/sms-template', iconName: 'MessagesSquare', visible: true },
        ]
      },
      {
        id: 'item-ut-style',
        name: 'Style',
        iconName: 'Paintbrush',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-style-bg', name: 'BackGround Settings', href: '/dashboard/utilities/style/background-settings', iconName: 'Globe', visible: true },
          { id: 'sub-style-color', name: 'Color Theme', href: '/dashboard/utilities/style/color-theme', iconName: 'Paintbrush', visible: true },
        ]
      },
    ]
  },
  {
    id: 'grp-report',
    groupTitle: 'REPORT',
    visible: true,
    items: [
      {
        id: 'item-rep-student',
        name: 'Student Report',
        iconName: 'Users',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-rep-stu-att', name: 'Student Attendance Report', href: '/dashboard/report/student/attendance', iconName: 'CalendarCheck', visible: true },
          { id: 'sub-rep-stu-subj-att', name: 'Subject Attendance Report', href: '/dashboard/report/student/subject-attendance', iconName: 'BookOpen', visible: true },
          { id: 'sub-rep-stu-hw', name: 'Homework Evaluation Report', href: '/dashboard/report/student/homework-evaluation', iconName: 'FileText', visible: true },
          { id: 'sub-rep-stu-trans', name: 'Student Transport Report', href: '/dashboard/report/student/transport', iconName: 'Truck', visible: true },
          { id: 'sub-rep-stu-dorm', name: 'Student Dormitory Report', href: '/dashboard/report/student/dormitory', iconName: 'BedDouble', visible: true },
          { id: 'sub-rep-stu-guard', name: 'Guardian Reports', href: '/dashboard/report/student/guardian', iconName: 'Users', visible: true },
          { id: 'sub-rep-stu-hist', name: 'Student History', href: '/dashboard/report/student/history', iconName: 'List', visible: true },
          { id: 'sub-rep-stu-login', name: 'Student Login Report', href: '/dashboard/report/student/login', iconName: 'LogIn', visible: true },
          { id: 'sub-rep-stu-class', name: 'Class Report', href: '/dashboard/report/student/class', iconName: 'School', visible: true },
          { id: 'sub-rep-stu-routine', name: 'Class Routine', href: '/dashboard/report/student/routine', iconName: 'CalendarDays', visible: true },
          { id: 'sub-rep-stu-userlog', name: 'User Log', href: '/dashboard/report/student/user-log', iconName: 'FileText', visible: true },
          { id: 'sub-rep-stu-gen', name: 'Student Report', href: '/dashboard/report/student/general', iconName: 'BarChart2', visible: true },
          { id: 'sub-rep-stu-prev', name: 'Previous Record', href: '/dashboard/report/student/previous-record', iconName: 'FileSpreadsheet', visible: true },
        ]
      },
      {
        id: 'item-rep-exam',
        name: 'Exam Report',
        iconName: 'Award',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-rep-ex-routine', name: 'Exam Routine', href: '/dashboard/report/exam/routine', iconName: 'CalendarDays', visible: true },
          { id: 'sub-rep-ex-merit', name: 'Merit List Report', href: '/dashboard/report/exam/merit-list', iconName: 'Trophy', visible: true },
          { id: 'sub-rep-ex-online', name: 'Online Exam Report', href: '/dashboard/report/exam/online-exam', iconName: 'Monitor', visible: true },
          { id: 'sub-rep-ex-marksheet', name: 'Mark Sheet Report', href: '/dashboard/report/exam/mark-sheet', iconName: 'FileSpreadsheet', visible: true },
          { id: 'sub-rep-ex-tabulation', name: 'Tabulation Sheet Report', href: '/dashboard/report/exam/tabulation-sheet', iconName: 'FileText', visible: true },
          { id: 'sub-rep-ex-progress', name: 'Progress Card Report', href: '/dashboard/report/exam/progress-card', iconName: 'BarChart2', visible: true },
          { id: 'sub-rep-ex-progress100', name: 'Progress Card Report 100 Percent', href: '/dashboard/report/exam/progress-card-100', iconName: 'BarChart2', visible: true },
          { id: 'sub-rep-ex-prev', name: 'Previous Result', href: '/dashboard/report/exam/previous-result', iconName: 'FileText', visible: true },
        ]
      },
      {
        id: 'item-rep-staff',
        name: 'Staff Report',
        iconName: 'User',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-rep-stf-att', name: 'Staff Attendance Report', href: '/dashboard/report/staff/attendance', iconName: 'CalendarCheck', visible: true },
          { id: 'sub-rep-stf-payroll', name: 'Payroll Report', href: '/dashboard/report/staff/payroll', iconName: 'Banknote', visible: true },
        ]
      },
      {
        id: 'item-rep-fees',
        name: 'Fees Report',
        iconName: 'DollarSign',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-rep-fee-due', name: 'Fees Due Report', href: '/dashboard/report/fees/due', iconName: 'ListTodo', visible: true },
          { id: 'sub-rep-fee-fine', name: 'Fine Report', href: '/dashboard/report/fees/fine', iconName: 'DollarSign', visible: true },
          { id: 'sub-rep-fee-pay', name: 'Payment Report', href: '/dashboard/report/fees/payment', iconName: 'Banknote', visible: true },
          { id: 'sub-rep-fee-bal', name: 'Balance Report', href: '/dashboard/report/fees/balance', iconName: 'BarChart2', visible: true },
          { id: 'sub-rep-fee-waiver', name: 'Waiver Report', href: '/dashboard/report/fees/waiver', iconName: 'Tag', visible: true },
          { id: 'sub-rep-fee-wallet', name: 'Wallet Report', href: '/dashboard/report/fees/wallet', iconName: 'Wallet', visible: true },
        ]
      },
      {
        id: 'item-rep-accounts',
        name: 'Accounts Report',
        iconName: 'PieChart',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-rep-acc-payroll', name: 'Payroll Report', href: '/dashboard/report/accounts/payroll', iconName: 'Banknote', visible: true },
          { id: 'sub-rep-acc-txn', name: 'Transaction', href: '/dashboard/report/accounts/transaction', iconName: 'ArrowRightLeft', visible: true },
        ]
      },
    ]
  },
  {
    id: 'grp-settings',
    groupTitle: 'SETTINGS SECTION',
    visible: true,
    items: [
      {
        id: 'item-set-custom-field',
        name: 'Custom Field',
        iconName: 'List',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-cf-stu', name: 'Student Registration', href: '/dashboard/settings/custom-field/student-registration', iconName: 'Users', visible: true },
          { id: 'sub-cf-stf', name: 'Staff Registration', href: '/dashboard/settings/custom-field/staff-registration', iconName: 'User', visible: true },
        ]
      },
      {
        id: 'item-set-general',
        name: 'General Settings',
        iconName: 'Settings',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-gen-stu', name: 'Student Settings', href: '/dashboard/settings/general/student-settings', iconName: 'Users', visible: true },
          { id: 'sub-gen-2fa', name: 'Two Factor Setting', href: '/dashboard/settings/general/two-factor-setting', iconName: 'Shield', visible: true },
          { id: 'sub-gen-lp', name: 'Lesson Plan Setting', href: '/dashboard/settings/general/lesson-plan-setting', iconName: 'BookMarked', visible: true },
          { id: 'sub-gen-stf', name: 'Staff Settings', href: '/dashboard/settings/general/staff-settings', iconName: 'User', visible: true },
          { id: 'sub-gen-chat', name: 'Chat Settings', href: '/dashboard/settings/general/chat-settings', iconName: 'MessageSquare', visible: true },
          { id: 'sub-gen-gen', name: 'General Settings', href: '/dashboard/settings/general/general-settings', iconName: 'Settings', visible: true },
          { id: 'sub-gen-opt', name: 'Optional Subject', href: '/dashboard/settings/general/optional-subject', iconName: 'BookOpen', visible: true },
          { id: 'sub-gen-acad', name: 'Academic Year', href: '/dashboard/settings/general/academic-year', iconName: 'CalendarDays', visible: true },
          { id: 'sub-gen-hol', name: 'Holiday', href: '/dashboard/settings/general/holiday', iconName: 'CalendarDays', visible: true },
          { id: 'sub-gen-mod', name: 'Module Manager', href: '/dashboard/settings/general/module-manager', iconName: 'Layers', visible: true },
          { id: 'sub-gen-notif', name: 'Notification Setting', href: '/dashboard/settings/general/notification-setting', iconName: 'Bell', visible: true },
          { id: 'sub-gen-tawk', name: 'Tawk To Chat', href: '/dashboard/settings/general/tawk-to-chat', iconName: 'MessageSquare', visible: true },
          { id: 'sub-gen-msg', name: 'Messenger Chat', href: '/dashboard/settings/general/messenger-chat', iconName: 'MessagesSquare', visible: true },
          { id: 'sub-gen-curr', name: 'Manage Currency', href: '/dashboard/settings/general/manage-currency', iconName: 'DollarSign', visible: true },
          { id: 'sub-gen-email', name: 'Email Settings', href: '/dashboard/settings/general/email-settings', iconName: 'MailOpen', visible: true },
          { id: 'sub-gen-pay', name: 'Payment Settings', href: '/dashboard/settings/general/payment-settings', iconName: 'Banknote', visible: true },
          { id: 'sub-gen-base', name: 'Base Setup', href: '/dashboard/settings/general/base-setup', iconName: 'Settings', visible: true },
          { id: 'sub-gen-sms', name: 'Sms Settings', href: '/dashboard/settings/general/sms-settings', iconName: 'MessagesSquare', visible: true },
          { id: 'sub-gen-wknd', name: 'Weekend', href: '/dashboard/settings/general/weekend', iconName: 'CalendarDays', visible: true },
          { id: 'sub-gen-langset', name: 'Language Settings', href: '/dashboard/settings/general/language-settings', iconName: 'Globe', visible: true },
          { id: 'sub-gen-bkp', name: 'Backup', href: '/dashboard/settings/general/backup', iconName: 'Download', visible: true },
          { id: 'sub-gen-dash', name: 'Dashboard', href: '/dashboard/settings/general/dashboard', iconName: 'LayoutDashboard', visible: true },
          { id: 'sub-gen-abt', name: 'About & Update', href: '/dashboard/settings/general/about-update', iconName: 'Star', visible: true },
          { id: 'sub-gen-api', name: 'Api Permission', href: '/dashboard/settings/general/api-permission', iconName: 'Lock', visible: true },
          { id: 'sub-gen-lang', name: 'Language', href: '/dashboard/settings/general/language', iconName: 'Globe', visible: true },
          { id: 'sub-gen-pre', name: 'Preloader Settings', href: '/dashboard/settings/general/preloader-settings', iconName: 'Settings', visible: true },
          { id: 'sub-gen-util', name: 'Utilities', href: '/dashboard/settings/general/utilities', iconName: 'Layers', visible: true },
        ]
      },
      {
        id: 'item-set-frontend-cms',
        name: 'Frontend CMS',
        iconName: 'Monitor',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-cms-theme', name: 'Manage Theme', href: '/dashboard/settings/frontend-cms/manage-theme', iconName: 'Paintbrush', visible: true },
          { id: 'sub-cms-slide', name: 'Home Slider', href: '/dashboard/settings/frontend-cms/home-slider', iconName: 'Globe', visible: true },
          { id: 'sub-cms-aora', name: 'Aora Pagebuilder', href: '/dashboard/settings/frontend-cms/aora-pagebuilder', iconName: 'Globe', visible: true },
          { id: 'sub-cms-tch', name: 'Expert Teacher', href: '/dashboard/settings/frontend-cms/expert-teacher', iconName: 'User', visible: true },
          { id: 'sub-cms-photo', name: 'Photo Gallery', href: '/dashboard/settings/frontend-cms/photo-gallery', iconName: 'Globe', visible: true },
          { id: 'sub-cms-video', name: 'Video Gallery', href: '/dashboard/settings/frontend-cms/video-gallery', iconName: 'Video', visible: true },
          { id: 'sub-cms-res', name: 'Result', href: '/dashboard/settings/frontend-cms/result', iconName: 'Trophy', visible: true },
          { id: 'sub-cms-rout', name: 'Class Routine', href: '/dashboard/settings/frontend-cms/class-routine', iconName: 'CalendarDays', visible: true },
          { id: 'sub-cms-exam', name: 'Exam Routine', href: '/dashboard/settings/frontend-cms/exam-routine', iconName: 'Award', visible: true },
          { id: 'sub-cms-cal', name: 'Academic Calendar', href: '/dashboard/settings/frontend-cms/academic-calendar', iconName: 'CalendarCheck', visible: true },
          { id: 'sub-cms-head', name: 'Header Content', href: '/dashboard/settings/frontend-cms/header-content', iconName: 'Globe', visible: true },
          { id: 'sub-cms-foot', name: 'Footer Content', href: '/dashboard/settings/frontend-cms/footer-content', iconName: 'Globe', visible: true },
          { id: 'sub-cms-news', name: 'News List', href: '/dashboard/settings/frontend-cms/news-list', iconName: 'FileText', visible: true },
          { id: 'sub-cms-newscat', name: 'News Category', href: '/dashboard/settings/frontend-cms/news-category', iconName: 'FolderOpen', visible: true },
          { id: 'sub-cms-newscomm', name: 'News Comments', href: '/dashboard/settings/frontend-cms/news-comments', iconName: 'MessageSquare', visible: true },
          { id: 'sub-cms-testi', name: 'Testimonial', href: '/dashboard/settings/frontend-cms/testimonial', iconName: 'Star', visible: true },
          { id: 'sub-cms-course', name: 'Course List', href: '/dashboard/settings/frontend-cms/course-list', iconName: 'BookOpen', visible: true },
          { id: 'sub-cms-contact', name: 'Contact Message', href: '/dashboard/settings/frontend-cms/contact-message', iconName: 'MailOpen', visible: true },
          { id: 'sub-cms-menu', name: 'Menu', href: '/dashboard/settings/frontend-cms/menu', iconName: 'List', visible: true },
          { id: 'sub-cms-pages', name: 'Pages', href: '/dashboard/settings/frontend-cms/pages', iconName: 'FileText', visible: true },
          { id: 'sub-cms-courcat', name: 'Course Category', href: '/dashboard/settings/frontend-cms/course-category', iconName: 'FolderOpen', visible: true },
          { id: 'sub-cms-speech', name: 'Speech Slider', href: '/dashboard/settings/frontend-cms/speech-slider', iconName: 'Megaphone', visible: true },
          { id: 'sub-cms-donor', name: 'Donor', href: '/dashboard/settings/frontend-cms/donor', iconName: 'Users', visible: true },
          { id: 'sub-cms-dl', name: 'Form Download', href: '/dashboard/settings/frontend-cms/form-download', iconName: 'Download', visible: true },
        ]
      },
      {
        id: 'item-set-fees',
        name: 'Fees Settings',
        iconName: 'DollarSign',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-feeset-inv', name: 'Fees Invoice Settings', href: '/dashboard/settings/fees/fees-invoice-settings', iconName: 'FileText', visible: true },
        ]
      },
      {
        id: 'item-set-exam',
        name: 'Exam Settings',
        iconName: 'Award',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-examset-fmt', name: 'Format Settings', href: '/dashboard/settings/exam/format-settings', iconName: 'FileSpreadsheet', visible: true },
          { id: 'sub-examset-rule', name: 'Setup Exam Rule', href: '/dashboard/settings/exam/setup-exam-rule', iconName: 'Shield', visible: true },
          { id: 'sub-examset-pos', name: 'Position', href: '/dashboard/settings/exam/position', iconName: 'Trophy', visible: true },
          { id: 'sub-examset-allpos', name: 'All Exam Position', href: '/dashboard/settings/exam/all-exam-position', iconName: 'List', visible: true },
          { id: 'sub-examset-sig', name: 'Exam Signature Settings', href: '/dashboard/settings/exam/exam-signature-settings', iconName: 'PenLine', visible: true },
          { id: 'sub-examset-admit', name: 'Admit Card Setting', href: '/dashboard/settings/exam/admit-card-setting', iconName: 'CreditCard', visible: true },
          { id: 'sub-examset-seat', name: 'Seat Plan Setting', href: '/dashboard/settings/exam/seat-plan-setting', iconName: 'LayoutDashboard', visible: true },
        ]
      },
    ]
  },
  {
    id: 'grp-module',
    groupTitle: 'MODULE',
    visible: true,
    items: [
      {
        id: 'item-mod-jitsi',
        name: 'Jitsi',
        iconName: 'Video',
        badge: 'ADDON',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-jitsi-vclass', name: 'Virtual Class', href: '/dashboard/module/jitsi/virtual-class', iconName: 'Video', visible: true },
          { id: 'sub-jitsi-vmeet', name: 'Virtual Meeting', href: '/dashboard/module/jitsi/virtual-meeting', iconName: 'Video', visible: true },
          { id: 'sub-jitsi-clsrep', name: 'Class Reports', href: '/dashboard/module/jitsi/class-reports', iconName: 'BarChart2', visible: true },
          { id: 'sub-jitsi-mtrep', name: 'Meeting Reports', href: '/dashboard/module/jitsi/meeting-reports', iconName: 'BarChart2', visible: true },
          { id: 'sub-jitsi-set', name: 'Settings', href: '/dashboard/module/jitsi/settings', iconName: 'Settings', visible: true },
        ]
      },
      {
        id: 'item-mod-vclass',
        name: 'Virtual Class',
        iconName: 'Video',
        badge: 'ADDON',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-vc-vclass', name: 'Virtual Class', href: '/dashboard/module/virtual-class/virtual-class', iconName: 'Video', visible: true },
          { id: 'sub-vc-vmeet', name: 'Virtual Meeting', href: '/dashboard/module/virtual-class/virtual-meeting', iconName: 'Video', visible: true },
          { id: 'sub-vc-clsrep', name: 'Class Reports', href: '/dashboard/module/virtual-class/class-reports', iconName: 'BarChart2', visible: true },
          { id: 'sub-vc-mtrep', name: 'Meeting Reports', href: '/dashboard/module/virtual-class/meeting-reports', iconName: 'BarChart2', visible: true },
          { id: 'sub-vc-set', name: 'Settings', href: '/dashboard/module/virtual-class/settings', iconName: 'Settings', visible: true },
        ]
      },
      {
        id: 'item-mod-reg',
        name: 'Registration',
        iconName: 'Users',
        badge: 'ADDON',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-reg-std', name: 'Student List', href: '/dashboard/module/registration/student-list', iconName: 'Users', visible: true },
          { id: 'sub-reg-set', name: 'Settings', href: '/dashboard/module/registration/settings', iconName: 'Settings', visible: true },
        ]
      },
      {
        id: 'item-mod-bbb',
        name: 'BigBlueButton',
        iconName: 'Video',
        badge: 'ADDON',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-bbb-vclass', name: 'Virtual Class', href: '/dashboard/module/bigbluebutton/virtual-class', iconName: 'Video', visible: true },
          { id: 'sub-bbb-vmeet', name: 'Virtual Meeting', href: '/dashboard/module/bigbluebutton/virtual-meeting', iconName: 'Video', visible: true },
          { id: 'sub-bbb-clsrep', name: 'Class Reports', href: '/dashboard/module/bigbluebutton/class-reports', iconName: 'BarChart2', visible: true },
          { id: 'sub-bbb-mtrep', name: 'Meeting Reports', href: '/dashboard/module/bigbluebutton/meeting-reports', iconName: 'BarChart2', visible: true },
          { id: 'sub-bbb-set', name: 'Settings', href: '/dashboard/module/bigbluebutton/settings', iconName: 'Settings', visible: true },
          { id: 'sub-bbb-clsrec', name: 'Class Record List', href: '/dashboard/module/bigbluebutton/class-record-list', iconName: 'List', visible: true },
          { id: 'sub-bbb-mtrec', name: 'Meeting Record List', href: '/dashboard/module/bigbluebutton/meeting-record-list', iconName: 'List', visible: true },
        ]
      },
      {
        id: 'item-mod-gmeet',
        name: 'Gmeet',
        iconName: 'Video',
        badge: 'ADDON',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-gmeet-vclass', name: 'Virtual Class', href: '/dashboard/module/gmeet/virtual-class', iconName: 'Video', visible: true },
          { id: 'sub-gmeet-vmeet', name: 'Virtual Meeting', href: '/dashboard/module/gmeet/virtual-meeting', iconName: 'Video', visible: true },
          { id: 'sub-gmeet-clsrep', name: 'Class Reports', href: '/dashboard/module/gmeet/class-reports', iconName: 'BarChart2', visible: true },
          { id: 'sub-gmeet-mtrep', name: 'Meeting Reports', href: '/dashboard/module/gmeet/meeting-reports', iconName: 'BarChart2', visible: true },
          { id: 'sub-gmeet-set', name: 'Settings', href: '/dashboard/module/gmeet/settings', iconName: 'Settings', visible: true },
        ]
      },
    ]
  },
  {
    id: 'grp-sidebar-mgr',
    groupTitle: 'SIDEBAR',
    visible: true,
    items: [
      { id: 'item-sidebar-mgr', name: 'Sidebar Manager', href: '/dashboard/sidebar-manager', iconName: 'Settings', visible: true },
    ]
  }
];
// Teacher specific sidebar menu
export const TEACHER_MENU_STRUCTURE = [
  {
    id: 'grp-dashboard',
    groupTitle: 'DASHBOARD',
    visible: true,
    items: [
      { id: 'item-dash', name: 'Dashboard', href: '/dashboard/teacher', iconName: 'LayoutDashboard', visible: true },
    ],
  },
  {
    id: 'grp-administration',
    groupTitle: 'ADMINISTRATION',
    visible: true,
    items: [
      {
        id: 'item-academics',
        name: 'Academics',
        iconName: 'GraduationCap',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-acad-opt-subj', name: 'Optional Subject', href: '/dashboard/academics/optional-subject', iconName: 'BookCopy', visible: true },
          { id: 'sub-acad-section', name: 'Section', href: '/dashboard/academics/section', iconName: 'Layers', visible: true },
          { id: 'sub-acad-class', name: 'Class', href: '/dashboard/academics/class', iconName: 'School', visible: true },
          { id: 'sub-acad-subjects', name: 'Subjects', href: '/dashboard/academics/subjects', iconName: 'BookMarked', visible: true },
          { id: 'sub-acad-assign-teacher', name: 'Assign Class Teacher', href: '/dashboard/academics/assign-class-teacher', iconName: 'UserCheck', visible: true },
          { id: 'sub-acad-assign-subj', name: 'Assign Subject', href: '/dashboard/academics/assign-subject', iconName: 'CheckSquare', visible: true },
          { id: 'sub-acad-classroom', name: 'Class Room', href: '/dashboard/academics/classroom', iconName: 'Building', visible: true },
          { id: 'sub-acad-routine', name: 'Class Routine', href: '/dashboard/academics/routine', iconName: 'CalendarDays', visible: true },
          { id: 'sub-acad-teacher-routine', name: 'Teacher Class Routine', href: '/dashboard/academics/routine', visible: true },
        ],
      },
      {
        id: 'item-study-mat',
        name: 'Study Material',
        iconName: 'FolderOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-study-upload', name: 'Upload Content', href: '/dashboard/study/upload', iconName: 'UploadCloud', visible: true },
          { id: 'sub-study-assign', name: 'Assignment', href: '/dashboard/study/assignment', iconName: 'FileSpreadsheet', visible: true },
          { id: 'sub-study-syllabus', name: 'Syllabus', href: '/dashboard/study/syllabus', iconName: 'ListTodo', visible: true },
          { id: 'sub-study-downloads', name: 'Other Downloads', href: '/dashboard/study/downloads', iconName: 'Download', visible: true },
        ],
      },
      {
        id: 'item-lesson-plan',
        name: 'Lesson Plan',
        iconName: 'BookMarked',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-lesson-item', name: 'Lesson', href: '/dashboard/lesson-plan/lesson', iconName: 'BookOpen', visible: true },
          { id: 'sub-lesson-topic', name: 'Topic', href: '/dashboard/lesson-plan/topic', iconName: 'Hash', visible: true },
          { id: 'sub-lesson-topic-ov', name: 'Topic Overview', href: '/dashboard/lesson-plan/topic-overview', iconName: 'FileText', visible: true },
          { id: 'sub-lesson-plan-item', name: 'Lesson Plan', href: '/dashboard/lesson-plan/plan', iconName: 'BookMarked', visible: true },
          { id: 'sub-lesson-plan-ov', name: 'Lesson Plan Overview', href: '/dashboard/lesson-plan/overview', iconName: 'FileSpreadsheet', visible: true },
        ],
      },
    ],
  },
  {
    id: 'grp-student',
    groupTitle: 'STUDENT',
    visible: true,
    items: [
      {
        id: 'item-stu-info',
        name: 'Student Info',
        iconName: 'Users',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-stu-cat', name: 'Student Category', href: '/dashboard/students/category', iconName: 'Tag', visible: true },
          { id: 'sub-stu-add', name: 'Add Student', href: '/dashboard/students/add', iconName: 'UserPlus', visible: true },
          { id: 'sub-stu-list', name: 'Student List', href: '/dashboard/students', iconName: 'Users', visible: true },
          { id: 'sub-stu-att', name: 'Student Attendance', href: '/dashboard/students/attendance', iconName: 'CalendarCheck', visible: true },
          { id: 'sub-stu-subj-att', name: 'Subject Wise Attendance', href: '/dashboard/students/subject-attendance', iconName: 'BookOpen', visible: true },
          { id: 'sub-stu-grp', name: 'Student Group', href: '/dashboard/students/groups', iconName: 'Users', visible: true },
          { id: 'sub-stu-promote', name: 'Student Promote', href: '/dashboard/students/promote', iconName: 'Star', visible: true },
          { id: 'sub-stu-disable', name: 'Disabled Students', href: '/dashboard/students/disabled', iconName: 'Lock', visible: true },
        ],
      },
      {
        id: 'item-homework',
        name: 'HomeWork',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-hw-rep', name: 'Homework Report', href: '/dashboard/homework/report', iconName: 'BarChart2', visible: true },
          { id: 'sub-hw-add', name: 'Add Homework', href: '/dashboard/homework/add', iconName: 'PenLine', visible: true },
          { id: 'sub-hw-list', name: 'Homework List', href: '/dashboard/homework/list', iconName: 'ListTodo', visible: true },
        ],
      },
      {
        id: 'item-transport',
        name: 'Transport',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-trans-routes', name: 'Routes', href: '/dashboard/transport/routes', iconName: 'MapPin', visible: true },
          { id: 'sub-trans-veh', name: 'Vehicle', href: '/dashboard/transport/vehicle', iconName: 'Truck', visible: true },
          { id: 'sub-trans-assign', name: 'Assign Vehicle', href: '/dashboard/transport/assign-vehicle', iconName: 'UserCheck', visible: true },
        ],
      },
      {
        id: 'item-dormitory',
        name: 'Dormitory',
        iconName: 'Building',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-dorm-type', name: 'Room Type', href: '/dashboard/dormitory/room-type', iconName: 'Tag', visible: true },
          { id: 'sub-dorm-dorm', name: 'Dormitory', href: '/dashboard/dormitory', iconName: 'Building', visible: true },
          { id: 'sub-dorm-rooms', name: 'Dormitory Rooms', href: '/dashboard/dormitory/dormitory-rooms', iconName: 'BedDouble', visible: true },
        ],
      },
    ],
  },
  {
    id: 'grp-exam',
    groupTitle: 'EXAM',
    visible: true,
    items: [
      {
        id: 'item-exam-main',
        name: 'Examination',
        iconName: 'Award',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-ex-grade', name: 'Marks Grade', href: '/dashboard/examination/marks-grade', iconName: 'Award', visible: true },
          { id: 'sub-ex-type', name: 'Exam Type', href: '/dashboard/examination/exam-type', iconName: 'Tag', visible: true },
          { id: 'sub-ex-setup', name: 'Exam Setup', href: '/dashboard/examination/exam-setup', iconName: 'Settings', visible: true },
          { id: 'sub-ex-sms', name: 'Send Marks By Sms', href: '/dashboard/examination/send-marks-by-sms', iconName: 'MessagesSquare', visible: true },
        ],
      },
    ],
  },
  {
    id: 'grp-hr',
    groupTitle: 'HR',
    visible: true,
    items: [
      {
        id: 'item-teacher-eval',
        name: 'Teacher Evaluation',
        iconName: 'Award',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-te-my-report', name: 'My Report', href: '/dashboard/teacher-evaluation/teacher-wise-report', iconName: 'BarChart2', visible: true },
        ],
      },
    ],
  },
  {
    id: 'grp-utilities',
    groupTitle: 'UTILITIES',
    visible: true,
    items: [
      {
        id: 'item-ut-comm',
        name: 'Communicate',
        iconName: 'Megaphone',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-comm-notice', name: 'Notice Board', href: '/dashboard/utilities/communicate/notice-board', iconName: 'Bell', visible: true },
          { id: 'sub-comm-send', name: 'Send Email / Sms', href: '/dashboard/utilities/communicate/send-email-sms', iconName: 'Send', visible: true },
          { id: 'sub-comm-log', name: 'Email / Sms Log', href: '/dashboard/utilities/communicate/email-sms-log', iconName: 'List', visible: true },
          { id: 'sub-comm-event', name: 'Event', href: '/dashboard/utilities/communicate/event', iconName: 'CalendarDays', visible: true },
          { id: 'sub-comm-cal', name: 'Calendar', href: '/dashboard/utilities/communicate/calendar', iconName: 'CalendarCheck', visible: true },
        ],
      },
    ],
  },
  {
    id: 'grp-module',
    groupTitle: 'MODULE',
    visible: true,
    items: [
      {
        id: 'item-mod-vclass',
        name: 'Virtual Class',
        iconName: 'Video',
        badge: 'ADDON',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-vc-vclass', name: 'Virtual Class', href: '/dashboard/module/virtual-class/virtual-class', iconName: 'Video', visible: true },
          { id: 'sub-vc-vmeet', name: 'Virtual Meeting', href: '/dashboard/module/virtual-class/virtual-meeting', iconName: 'Video', visible: true },
          { id: 'sub-vc-clsrep', name: 'Class Reports', href: '/dashboard/module/virtual-class/class-reports', iconName: 'BarChart2', visible: true },
          { id: 'sub-vc-mtrep', name: 'Meeting Reports', href: '/dashboard/module/virtual-class/meeting-reports', iconName: 'BarChart2', visible: true },
        ],
      },
    ],
  },
];

export const STUDENT_MENU_STRUCTURE = [
  {
    id: 'grp-student-main',
    groupTitle: 'STUDENT PORTAL',
    visible: true,
    items: [
      { id: 'st-dash', name: 'Dashboard', href: '/dashboard/student', iconName: 'LayoutDashboard', visible: true },
      { id: 'st-profile', name: 'Student Info', href: '/dashboard/student/profile', iconName: 'User', visible: true },
      {
        id: 'st-lms',
        name: 'LMS',
        iconName: 'GraduationCap',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'st-lms-course', name: 'Course', href: '/dashboard/student/lms/course', visible: true },
          { id: 'st-lms-my-course', name: 'My Course', href: '/dashboard/student/lms/my-course', visible: true },
          { id: 'st-lms-purchase', name: 'Purchase History', href: '/dashboard/student/lms/purchase-history', visible: true },
          { id: 'st-lms-quiz', name: 'My Quiz', href: '/dashboard/student/lms/my-quiz', visible: true },
          { id: 'st-lms-cert', name: 'My Certificates', href: '/dashboard/student/lms/my-certificates', visible: true },
        ]
      },
      {
        id: 'st-lesson',
        name: 'Lesson Plan',
        iconName: 'BookMarked',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'st-lp-plan', name: 'Lesson Plan', href: '/dashboard/student/lesson-plan/plan', visible: true },
          { id: 'st-lp-overview', name: 'Lesson Plan Overview', href: '/dashboard/student/lesson-plan/overview', visible: true },
        ]
      },
      {
        id: 'st-study',
        name: 'Study Material',
        iconName: 'FolderOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'st-study-assign', name: 'Assignment', href: '/dashboard/student/study-material/assignment', visible: true },
          { id: 'st-study-syllabus', name: 'Syllabus', href: '/dashboard/student/study-material/syllabus', visible: true },
          { id: 'st-study-downloads', name: 'Others Download', href: '/dashboard/student/study-material/others-download', visible: true },
        ]
      },
      {
        id: 'st-leave',
        name: 'Leave',
        iconName: 'FileSpreadsheet',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'st-leave-apply', name: 'Apply Leave', href: '/dashboard/student/leave/apply', visible: true },
          { id: 'st-leave-pending', name: 'Pending Leave Request', href: '/dashboard/student/leave/pending', visible: true },
        ]
      },
      {
        id: 'st-chat',
        name: 'Chat',
        iconName: 'MessageSquare',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'st-chat-box', name: 'Chat Box', href: '/dashboard/student/chat/chat-box', visible: true },
          { id: 'st-chat-inv', name: 'Invitation', href: '/dashboard/student/chat/invitation', visible: true },
          { id: 'st-chat-blocked', name: 'Blocked User', href: '/dashboard/student/chat/blocked-user', visible: true },
        ]
      },
      {
        id: 'st-exam',
        name: 'Examinations',
        iconName: 'Award',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'st-exam-res', name: 'Result', href: '/dashboard/student/examinations/result', visible: true },
          { id: 'st-exam-sched', name: 'Exam Schedule', href: '/dashboard/student/examinations/schedule', visible: true },
        ]
      },
      {
        id: 'st-online-exam',
        name: 'Online Exam',
        iconName: 'Monitor',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'st-oe-active', name: 'Active Exams', href: '/dashboard/student/online-exam/active', visible: true },
          { id: 'st-oe-res', name: 'View Result', href: '/dashboard/student/online-exam/view-result', visible: true },
        ]
      },
      {
        id: 'st-library',
        name: 'Library',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'st-lib-books', name: 'Book List', href: '/dashboard/student/library/book-list', visible: true },
          { id: 'st-lib-issued', name: 'Book Issue', href: '/dashboard/student/library/book-issue', visible: true },
        ]
      },
      {
        id: 'st-virtual-class',
        name: 'Virtual Class',
        iconName: 'Video',
        badge: 'ADDON',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'st-vc-cls', name: 'Virtual Class', href: '/dashboard/student/virtual-class/virtual-class', visible: true },
        ]
      }
    ]
  }
];

export const STORAGE_KEY = 'stoofi_custom_sidebar_v8';

// Keep Admin Setup as the last entry of Admin Section in saved layouts.
function moveAdminSetupToEnd(menu) {
  if (!Array.isArray(menu)) return menu;
  menu.forEach(group => {
    (group.items || []).forEach(item => {
      if (item.id !== 'item-admin-sec' || !Array.isArray(item.subItems)) return;
      const index = item.subItems.findIndex(sub => sub.id === 'sub-adm-setup');
      if (index > -1 && index !== item.subItems.length - 1) {
        const [setup] = item.subItems.splice(index, 1);
        item.subItems.push(setup);
      }
    });
  });
  return menu;
}

export function getStoredSidebar(role = 'Super Admin') {
  let defaultForRole = DEFAULT_MENU_STRUCTURE;
  if (role === 'Student') defaultForRole = STUDENT_MENU_STRUCTURE;
  else if (role === 'Teacher') defaultForRole = TEACHER_MENU_STRUCTURE;

  if (typeof window === 'undefined') {
    return defaultForRole;
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${role}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (role === 'Teacher' && Array.isArray(parsed)) {
        const hasAdminGroups = parsed.some(g => ['grp-accounts', 'grp-settings', 'grp-report'].includes(g.id));
        if (hasAdminGroups) {
          localStorage.removeItem(`${STORAGE_KEY}_${role}`);
          return TEACHER_MENU_STRUCTURE;
        }
      }
      return moveAdminSetupToEnd(parsed);
    }
  } catch (e) {
    console.error('Failed to parse sidebar data:', e);
  }
  return defaultForRole;
}

export function saveStoredSidebar(menuData, role = 'Super Admin') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_${role}`, JSON.stringify(menuData));
    window.dispatchEvent(new CustomEvent('stoofi_sidebar_updated', { detail: { role, menuData } }));
  } catch (e) {
    console.error('Failed to save sidebar data:', e);
  }
}

export function resetStoredSidebar(role = 'Super Admin') {
  let defaultMenu = DEFAULT_MENU_STRUCTURE;
  if (role === 'Student') defaultMenu = STUDENT_MENU_STRUCTURE;
  else if (role === 'Teacher') defaultMenu = TEACHER_MENU_STRUCTURE;

  if (typeof window === 'undefined') return defaultMenu;
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${role}`);
    window.dispatchEvent(new CustomEvent('stoofi_sidebar_updated', { detail: { role, menuData: defaultMenu } }));
  } catch (e) {
    console.error('Failed to reset sidebar data:', e);
  }
  return defaultMenu;
}
