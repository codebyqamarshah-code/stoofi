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

export const ICON_MAP = {
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
  User
};

export const DEFAULT_MENU_STRUCTURE = [
  {
    id: 'grp-dashboard',
    groupTitle: 'DASHBOARD',
    visible: true,
    items: [
      { id: 'item-dash', name: 'Dashboard', href: '/dashboard', iconName: 'LayoutDashboard', visible: true },
      { id: 'item-sidebar-mgr', name: 'Sidebar Manager', href: '/dashboard/sidebar-manager', iconName: 'Settings', visible: true },
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
          { id: 'sub-adm-query', name: 'Admission Query', href: '/dashboard/admin/admission-query', visible: true },
          { id: 'sub-adm-visitor', name: 'Visitor Book', href: '/dashboard/admin/visitor-book', visible: true },
          { id: 'sub-adm-complaint', name: 'Complaint', href: '/dashboard/admin/complaint', visible: true },
          { id: 'sub-adm-postal-rec', name: 'Postal Receive', href: '/dashboard/admin/postal-receive', visible: true },
          { id: 'sub-adm-postal-disp', name: 'Postal Dispatch', href: '/dashboard/admin/postal-dispatch', visible: true },
          { id: 'sub-adm-phone-call', name: 'Phone Call Log', href: '/dashboard/admin/phone-call-log', visible: true },
          { id: 'sub-adm-setup', name: 'Admin Setup', href: '/dashboard/admin/setup', visible: true },
          { id: 'sub-adm-id-card', name: 'ID Card', href: '/dashboard/admin/id-card', visible: true },
          { id: 'sub-adm-cert', name: 'Certificate', href: '/dashboard/admin/certificate', visible: true },
          { id: 'sub-adm-gen-cert', name: 'Generate Certificate', href: '/dashboard/admin/generate-certificate', visible: true },
          { id: 'sub-adm-gen-id', name: 'Generate ID Card', href: '/dashboard/admin/generate-id-card', visible: true },
        ]
      },
      {
        id: 'item-academics',
        name: 'Academics',
        iconName: 'GraduationCap',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-acad-opt-subj', name: 'Optional Subject', href: '/dashboard/academics/optional-subject', visible: true },
          { id: 'sub-acad-section', name: 'Section', href: '/dashboard/academics/section', visible: true },
          { id: 'sub-acad-class', name: 'Class', href: '/dashboard/academics/class', visible: true },
          { id: 'sub-acad-subjects', name: 'Subjects', href: '/dashboard/academics/subjects', visible: true },
          { id: 'sub-acad-assign-teacher', name: 'Assign Class Teacher', href: '/dashboard/academics/assign-class-teacher', visible: true },
          { id: 'sub-acad-assign-subj', name: 'Assign Subject', href: '/dashboard/academics/assign-subject', visible: true },
          { id: 'sub-acad-classroom', name: 'Class Room', href: '/dashboard/academics/classroom', visible: true },
          { id: 'sub-acad-routine', name: 'Class Routine', href: '/dashboard/academics/routine', visible: true },
        ]
      },
      {
        id: 'item-study-mat',
        name: 'Study Material',
        iconName: 'FolderOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-study-upload', name: 'Upload Content', href: '/dashboard/study/upload', visible: true },
          { id: 'sub-study-assign', name: 'Assignment', href: '/dashboard/study/assignment', visible: true },
          { id: 'sub-study-syllabus', name: 'Syllabus', href: '/dashboard/study/syllabus', visible: true },
          { id: 'sub-study-downloads', name: 'Other Downloads', href: '/dashboard/study/downloads', visible: true },
        ]
      },
      {
        id: 'item-lesson-plan',
        name: 'Lesson Plan',
        iconName: 'BookMarked',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-lesson-item', name: 'Lesson', href: '/dashboard/lesson-plan/lesson', visible: true },
          { id: 'sub-lesson-topic', name: 'Topic', href: '/dashboard/lesson-plan/topic', visible: true },
          { id: 'sub-lesson-topic-ov', name: 'Topic Overview', href: '/dashboard/lesson-plan/topic-overview', visible: true },
          { id: 'sub-lesson-plan-item', name: 'Lesson Plan', href: '/dashboard/lesson-plan/plan', visible: true },
          { id: 'sub-lesson-plan-ov', name: 'Lesson Plan Overview', href: '/dashboard/lesson-plan/overview', visible: true },
        ]
      },
      {
        id: 'item-bulk-print',
        name: 'Bulk Print',
        iconName: 'Printer',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-bulk-id', name: 'ID Card', href: '/dashboard/bulk-print/id-card', visible: true },
          { id: 'sub-bulk-cert', name: 'Certificate', href: '/dashboard/bulk-print/certificate', visible: true },
          { id: 'sub-bulk-pay', name: 'Payroll Bulk Print', href: '/dashboard/bulk-print/payroll', visible: true },
          { id: 'sub-bulk-fees', name: 'Fees Invoice Bulk Print', href: '/dashboard/bulk-print/fees-invoice', visible: true },
          { id: 'sub-bulk-settings', name: 'Fees Invoice Bulk Print Settings', href: '/dashboard/bulk-print/settings', visible: true },
        ]
      },
      {
        id: 'item-download-center',
        name: 'Download Center',
        iconName: 'Download',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-dl-type', name: 'Content Type', href: '/dashboard/download-center/content-type', visible: true },
          { id: 'sub-dl-list', name: 'Content List', href: '/dashboard/download-center/content-list', visible: true },
          { id: 'sub-dl-shared', name: 'Shared Content List', href: '/dashboard/download-center/shared-content', visible: true },
          { id: 'sub-dl-videos', name: 'Video List', href: '/dashboard/download-center/videos', visible: true },
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
          { id: 'sub-lms-all', name: 'All Courses', href: '/dashboard/lms/courses', visible: true },
          { id: 'sub-lms-add', name: 'Add Course', href: '/dashboard/lms/add-course', visible: true },
          { id: 'sub-lms-pending', name: 'Pending Course', href: '/dashboard/lms/pending', visible: true },
          { id: 'sub-lms-history', name: 'Enroll History', href: '/dashboard/lms/enroll-history', visible: true },
          { id: 'sub-lms-log', name: 'Purchase Log', href: '/dashboard/lms/purchase-log', visible: true },
          { id: 'sub-lms-inv', name: 'LMS Fees Invoice', href: '/dashboard/lms/invoice', visible: true },
          { id: 'sub-lms-cat', name: 'Category List', href: '/dashboard/lms/categories', visible: true },
          { id: 'sub-lms-lvl', name: 'Course Level', href: '/dashboard/lms/levels', visible: true },
          { id: 'sub-lms-vimeo', name: 'Vimeo Settings', href: '/dashboard/lms/vimeo', visible: true },
          { id: 'sub-lms-set', name: 'Settings', href: '/dashboard/lms/settings', visible: true },
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
          { id: 'sub-stu-cat', name: 'Student Category', href: '/dashboard/students/category', visible: true },
          { id: 'sub-stu-add', name: 'Add Student', href: '/dashboard/students/add', visible: true },
          { id: 'sub-stu-list', name: 'Student List', href: '/dashboard/students', visible: true },
          { id: 'sub-stu-multi', name: 'Multi Class Student', href: '/dashboard/students/multi-class', visible: true },
          { id: 'sub-stu-del', name: 'Delete Student Record', href: '/dashboard/students/delete-record', visible: true },
          { id: 'sub-stu-unassign', name: 'Unassigned Student', href: '/dashboard/students/unassigned', visible: true },
          { id: 'sub-stu-att', name: 'Student Attendance', href: '/dashboard/students/attendance', visible: true },
          { id: 'sub-stu-grp', name: 'Student Group', href: '/dashboard/students/groups', visible: true },
          { id: 'sub-stu-promote', name: 'Student Promote', href: '/dashboard/students/promote', visible: true },
          { id: 'sub-stu-disable', name: 'Disabled Students', href: '/dashboard/students/disabled', visible: true },
          { id: 'sub-stu-subj-att', name: 'Subject Wise Attendance', href: '/dashboard/students/subject-attendance', visible: true },
          { id: 'sub-stu-export', name: 'Student Export', href: '/dashboard/students/export', visible: true },
          { id: 'sub-stu-sms', name: 'SMS Sending Time', href: '/dashboard/students/sms-sending-time', visible: true },
        ]
      },
      {
        id: 'item-behaviour',
        name: 'Behaviour Records',
        iconName: 'Shield',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-beh-incidents', name: 'Incidents', href: '/dashboard/behaviour/incidents', visible: true },
          { id: 'sub-beh-assign', name: 'Assign Incident', href: '/dashboard/behaviour/assign', visible: true },
          { id: 'sub-beh-stu-rep', name: 'Student Incident Report', href: '/dashboard/behaviour/student-report', visible: true },
          { id: 'sub-beh-rep', name: 'Behaviour Report', href: '/dashboard/behaviour/report', visible: true },
          { id: 'sub-beh-class-sec', name: 'Class Section Report', href: '/dashboard/behaviour/class-section', visible: true },
          { id: 'sub-beh-inc-wise', name: 'Incident Wise Report', href: '/dashboard/behaviour/incident-wise', visible: true },
          { id: 'sub-beh-settings', name: 'Settings', href: '/dashboard/behaviour/settings', visible: true },
        ]
      },
      {
        id: 'item-fees',
        name: 'Fees',
        iconName: 'DollarSign',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-fees-grp', name: 'Fees Group', href: '/dashboard/fees/group', visible: true },
          { id: 'sub-fees-type', name: 'Fees Type', href: '/dashboard/fees/type', visible: true },
          { id: 'sub-fees-inv', name: 'Fees Invoice', href: '/dashboard/fees/invoice', visible: true },
          { id: 'sub-fees-bank', name: 'Bank Payment', href: '/dashboard/fees/bank-payment', visible: true },
          { id: 'sub-fees-carry', name: 'Fees Carry Forward', href: '/dashboard/fees/carry-forward', visible: true },
        ]
      },
      {
        id: 'item-homework',
        name: 'Homework',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-hw-add', name: 'Add Homework', href: '/dashboard/homework/add', visible: true },
          { id: 'sub-hw-list', name: 'Homework List', href: '/dashboard/homework/list', visible: true },
          { id: 'sub-hw-rep', name: 'Homework Report', href: '/dashboard/homework/report', visible: true },
        ]
      },
      {
        id: 'item-library',
        name: 'Library',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-lib-add', name: 'Add Book', href: '/dashboard/library/add-book', visible: true },
          { id: 'sub-lib-list', name: 'Book List', href: '/dashboard/library/book-list', visible: true },
          { id: 'sub-lib-cat', name: 'Book Categories', href: '/dashboard/library/book-categories', visible: true },
          { id: 'sub-lib-member', name: 'Add Member', href: '/dashboard/library/add-member', visible: true },
          { id: 'sub-lib-issue', name: 'Issue/Return Book', href: '/dashboard/library/issue-return-book', visible: true },
          { id: 'sub-lib-issued-all', name: 'All Issued Book', href: '/dashboard/library/all-issued-books', visible: true },
          { id: 'sub-lib-subj', name: 'Subject', href: '/dashboard/library/subject', visible: true },
        ]
      },
      {
        id: 'item-transport',
        name: 'Transport',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-trans-routes', name: 'Routes', href: '/dashboard/transport/routes', visible: true },
          { id: 'sub-trans-veh', name: 'Vehicle', href: '/dashboard/transport/vehicle', visible: true },
          { id: 'sub-trans-assign', name: 'Assign Vehicle', href: '/dashboard/transport/assign-vehicle', visible: true },
        ]
      },
      {
        id: 'item-dormitory',
        name: 'Dormitory',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-dorm-rooms', name: 'Dormitory Rooms', href: '/dashboard/dormitory/dormitory-rooms', visible: true },
          { id: 'sub-dorm-dorm', name: 'Dormitory', href: '/dashboard/dormitory', visible: true },
          { id: 'sub-dorm-type', name: 'Room Type', href: '/dashboard/dormitory/room-type', visible: true },
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
          { id: 'sub-ex-type', name: 'Exam Type', href: '/dashboard/examination/exam-type', visible: true },
          { id: 'sub-ex-setup', name: 'Exam Setup', href: '/dashboard/examination/exam-setup', visible: true },
          { id: 'sub-ex-sched', name: 'Exam Schedule', href: '/dashboard/examination/exam-schedule', visible: true },
          { id: 'sub-ex-att', name: 'Exam Attendance', href: '/dashboard/examination/exam-attendance', visible: true },
          { id: 'sub-ex-marks', name: 'Marks Register', href: '/dashboard/examination/marks-register', visible: true },
          { id: 'sub-ex-grade', name: 'Marks Grade', href: '/dashboard/examination/marks-grade', visible: true },
          { id: 'sub-ex-sms', name: 'Send Marks By Sms', href: '/dashboard/examination/send-marks-by-sms', visible: true },
          { id: 'sub-ex-sheet', name: 'Marksheet Report', href: '/dashboard/examination/marksheet-report', visible: true },
        ]
      },
      {
        id: 'item-exam-plan',
        name: 'Exam Plan',
        iconName: 'CalendarDays',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-plan-admit', name: 'Admit Card', href: '/dashboard/exam-plan/admit-card', visible: true },
          { id: 'sub-plan-seat', name: 'Seat Plan', href: '/dashboard/exam-plan/seat-plan', visible: true },
        ]
      },
      {
        id: 'item-online-exam',
        name: 'Online Exam',
        iconName: 'Monitor',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-on-grp', name: 'Question Group', href: '/dashboard/online-exam/question-group', visible: true },
          { id: 'sub-on-bank', name: 'Question Bank', href: '/dashboard/online-exam/question-bank', visible: true },
          { id: 'sub-on-exam', name: 'Online Exam', href: '/dashboard/online-exam', visible: true },
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
          { id: 'sub-hr-desig', name: 'Designation', href: '/dashboard/hr/designation', visible: true },
          { id: 'sub-hr-dept', name: 'Department', href: '/dashboard/hr/department', visible: true },
          { id: 'sub-hr-add-staff', name: 'Add Staff', href: '/dashboard/hr/add-staff', visible: true },
          { id: 'sub-hr-dir', name: 'Staff Directory', href: '/dashboard/hr/staff-directory', visible: true },
          { id: 'sub-hr-att', name: 'Staff Attendance', href: '/dashboard/hr/staff-attendance', visible: true },
          { id: 'sub-hr-payroll', name: 'Payroll', href: '/dashboard/hr/payroll', visible: true },
        ]
      },
      {
        id: 'item-teacher-eval',
        name: 'Teacher Evaluation',
        iconName: 'Award',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-te-approved', name: 'Approved Report', href: '/dashboard/teacher-evaluation/approved-report', visible: true },
          { id: 'sub-te-pending', name: 'Pending Report', href: '/dashboard/teacher-evaluation/pending-report', visible: true },
          { id: 'sub-te-wise', name: 'Teacher Wise Report', href: '/dashboard/teacher-evaluation/teacher-wise-report', visible: true },
          { id: 'sub-te-settings', name: 'Settings', href: '/dashboard/teacher-evaluation/settings', visible: true },
        ]
      },
      {
        id: 'item-leave',
        name: 'Leave',
        iconName: 'CalendarDays',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-leave-apply', name: 'Apply Leave', href: '/dashboard/leave/apply', visible: true },
          { id: 'sub-leave-approve', name: 'Approve Leave Request', href: '/dashboard/leave/approve', visible: true },
          { id: 'sub-leave-pending', name: 'Pending Leave Request', href: '/dashboard/leave/pending', visible: true },
          { id: 'sub-leave-define', name: 'Leave Define', href: '/dashboard/leave/define', visible: true },
          { id: 'sub-leave-type', name: 'Leave Type', href: '/dashboard/leave/type', visible: true },
        ]
      },
      {
        id: 'item-roles',
        name: 'Role & Permission',
        iconName: 'Shield',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-role-login', name: 'Login Permission', href: '/dashboard/roles/login-permission', visible: true },
          { id: 'sub-role-role', name: 'Role', href: '/dashboard/roles/role', visible: true },
          { id: 'sub-role-due', name: 'Due Fees Login Permission', href: '/dashboard/roles/due-fees-permission', visible: true },
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
          { id: 'sub-wallet-pending', name: 'Pending Deposit', href: '/dashboard/accounts/wallet/pending-deposit', visible: true },
          { id: 'sub-wallet-approve', name: 'Approve Deposit', href: '/dashboard/accounts/wallet/approve-deposit', visible: true },
          { id: 'sub-wallet-reject', name: 'Reject Deposit', href: '/dashboard/accounts/wallet/reject-deposit', visible: true },
          { id: 'sub-wallet-txn', name: 'Wallet Transaction', href: '/dashboard/accounts/wallet/transactions', visible: true },
          { id: 'sub-wallet-refund', name: 'Refund Request', href: '/dashboard/accounts/wallet/refund-request', visible: true },
        ]
      },
      {
        id: 'item-acc-accounts',
        name: 'Accounts',
        iconName: 'Building',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-acc-pl', name: 'Profit & Loss', href: '/dashboard/accounts/accounts/profit-loss', visible: true },
          { id: 'sub-acc-income', name: 'Income', href: '/dashboard/accounts/accounts/income', visible: true },
          { id: 'sub-acc-expense', name: 'Expense', href: '/dashboard/accounts/accounts/expense', visible: true },
          { id: 'sub-acc-chart', name: 'Chart Of Account', href: '/dashboard/accounts/accounts/chart-of-account', visible: true },
          { id: 'sub-acc-bank', name: 'Bank Account', href: '/dashboard/accounts/accounts/bank-account', visible: true },
          { id: 'sub-acc-fund', name: 'Fund Transfer', href: '/dashboard/accounts/accounts/fund-transfer', visible: true },
        ]
      },
      {
        id: 'item-acc-inventory',
        name: 'Inventory',
        iconName: 'Box',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-inv-cat', name: 'Item Category', href: '/dashboard/accounts/inventory/item-category', visible: true },
          { id: 'sub-inv-list', name: 'Item List', href: '/dashboard/accounts/inventory/item-list', visible: true },
          { id: 'sub-inv-store', name: 'Item Store', href: '/dashboard/accounts/inventory/item-store', visible: true },
          { id: 'sub-inv-supplier', name: 'Supplier', href: '/dashboard/accounts/inventory/supplier', visible: true },
          { id: 'sub-inv-receive', name: 'Item Receive', href: '/dashboard/accounts/inventory/item-receive', visible: true },
          { id: 'sub-inv-receive-list', name: 'Item Receive List', href: '/dashboard/accounts/inventory/item-receive-list', visible: true },
          { id: 'sub-inv-sell', name: 'Item Sell', href: '/dashboard/accounts/inventory/item-sell', visible: true },
          { id: 'sub-inv-issue', name: 'Item Issue', href: '/dashboard/accounts/inventory/item-issue', visible: true },
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
          { id: 'sub-chat-box', name: 'Chat Box', href: '/dashboard/utilities/chat/chat-box', visible: true },
          { id: 'sub-chat-inv', name: 'Invitation', href: '/dashboard/utilities/chat/invitation', visible: true },
          { id: 'sub-chat-blocked', name: 'Blocked User', href: '/dashboard/utilities/chat/blocked-user', visible: true },
        ]
      },
      {
        id: 'item-ut-comm',
        name: 'Communicate',
        iconName: 'Megaphone',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-comm-notice', name: 'Notice Board', href: '/dashboard/utilities/communicate/notice-board', visible: true },
          { id: 'sub-comm-send', name: 'Send Email / Sms', href: '/dashboard/utilities/communicate/send-email-sms', visible: true },
          { id: 'sub-comm-log', name: 'Email / Sms Log', href: '/dashboard/utilities/communicate/email-sms-log', visible: true },
          { id: 'sub-comm-event', name: 'Event', href: '/dashboard/utilities/communicate/event', visible: true },
          { id: 'sub-comm-cal', name: 'Calendar', href: '/dashboard/utilities/communicate/calendar', visible: true },
          { id: 'sub-comm-email-tpl', name: 'Email Template', href: '/dashboard/utilities/communicate/email-template', visible: true },
          { id: 'sub-comm-sms-tpl', name: 'Sms Template', href: '/dashboard/utilities/communicate/sms-template', visible: true },
        ]
      },
      {
        id: 'item-ut-style',
        name: 'Style',
        iconName: 'Paintbrush',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-style-bg', name: 'BackGround Settings', href: '/dashboard/utilities/style/background-settings', visible: true },
          { id: 'sub-style-color', name: 'Color Theme', href: '/dashboard/utilities/style/color-theme', visible: true },
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
          { id: 'sub-rep-stu-att', name: 'Student Attendance Report', href: '/dashboard/report/student/attendance', visible: true },
          { id: 'sub-rep-stu-subj-att', name: 'Subject Attendance Report', href: '/dashboard/report/student/subject-attendance', visible: true },
          { id: 'sub-rep-stu-hw', name: 'Homework Evaluation Report', href: '/dashboard/report/student/homework-evaluation', visible: true },
          { id: 'sub-rep-stu-trans', name: 'Student Transport Report', href: '/dashboard/report/student/transport', visible: true },
          { id: 'sub-rep-stu-dorm', name: 'Student Dormitory Report', href: '/dashboard/report/student/dormitory', visible: true },
          { id: 'sub-rep-stu-guard', name: 'Guardian Reports', href: '/dashboard/report/student/guardian', visible: true },
          { id: 'sub-rep-stu-hist', name: 'Student History', href: '/dashboard/report/student/history', visible: true },
          { id: 'sub-rep-stu-login', name: 'Student Login Report', href: '/dashboard/report/student/login', visible: true },
          { id: 'sub-rep-stu-class', name: 'Class Report', href: '/dashboard/report/student/class', visible: true },
          { id: 'sub-rep-stu-routine', name: 'Class Routine', href: '/dashboard/report/student/routine', visible: true },
          { id: 'sub-rep-stu-userlog', name: 'User Log', href: '/dashboard/report/student/user-log', visible: true },
          { id: 'sub-rep-stu-gen', name: 'Student Report', href: '/dashboard/report/student/general', visible: true },
          { id: 'sub-rep-stu-prev', name: 'Previous Record', href: '/dashboard/report/student/previous-record', visible: true },
        ]
      },
      {
        id: 'item-rep-exam',
        name: 'Exam Report',
        iconName: 'Award',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-rep-ex-routine', name: 'Exam Routine', href: '/dashboard/report/exam/routine', visible: true },
          { id: 'sub-rep-ex-merit', name: 'Merit List Report', href: '/dashboard/report/exam/merit-list', visible: true },
          { id: 'sub-rep-ex-online', name: 'Online Exam Report', href: '/dashboard/report/exam/online-exam', visible: true },
          { id: 'sub-rep-ex-marksheet', name: 'Mark Sheet Report', href: '/dashboard/report/exam/mark-sheet', visible: true },
          { id: 'sub-rep-ex-tabulation', name: 'Tabulation Sheet Report', href: '/dashboard/report/exam/tabulation-sheet', visible: true },
          { id: 'sub-rep-ex-progress', name: 'Progress Card Report', href: '/dashboard/report/exam/progress-card', visible: true },
          { id: 'sub-rep-ex-progress100', name: 'Progress Card Report 100 Percent', href: '/dashboard/report/exam/progress-card-100', visible: true },
          { id: 'sub-rep-ex-prev', name: 'Previous Result', href: '/dashboard/report/exam/previous-result', visible: true },
        ]
      },
      {
        id: 'item-rep-staff',
        name: 'Staff Report',
        iconName: 'User',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-rep-stf-att', name: 'Staff Attendance Report', href: '/dashboard/report/staff/attendance', visible: true },
          { id: 'sub-rep-stf-payroll', name: 'Payroll Report', href: '/dashboard/report/staff/payroll', visible: true },
        ]
      },
      {
        id: 'item-rep-fees',
        name: 'Fees Report',
        iconName: 'DollarSign',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-rep-fee-due', name: 'Fees Due Report', href: '/dashboard/report/fees/due', visible: true },
          { id: 'sub-rep-fee-fine', name: 'Fine Report', href: '/dashboard/report/fees/fine', visible: true },
          { id: 'sub-rep-fee-pay', name: 'Payment Report', href: '/dashboard/report/fees/payment', visible: true },
          { id: 'sub-rep-fee-bal', name: 'Balance Report', href: '/dashboard/report/fees/balance', visible: true },
          { id: 'sub-rep-fee-waiver', name: 'Waiver Report', href: '/dashboard/report/fees/waiver', visible: true },
          { id: 'sub-rep-fee-wallet', name: 'Wallet Report', href: '/dashboard/report/fees/wallet', visible: true },
        ]
      },
      {
        id: 'item-rep-accounts',
        name: 'Accounts Report',
        iconName: 'PieChart',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-rep-acc-payroll', name: 'Payroll Report', href: '/dashboard/report/accounts/payroll', visible: true },
          { id: 'sub-rep-acc-txn', name: 'Transaction', href: '/dashboard/report/accounts/transaction', visible: true },
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
          { id: 'sub-cf-stu', name: 'Student Registration', href: '/dashboard/settings/custom-field/student-registration', visible: true },
          { id: 'sub-cf-stf', name: 'Staff Registration', href: '/dashboard/settings/custom-field/staff-registration', visible: true },
        ]
      },
      {
        id: 'item-set-general',
        name: 'General Settings',
        iconName: 'Settings',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-gen-stu', name: 'Student Settings', href: '/dashboard/settings/general/student-settings', visible: true },
          { id: 'sub-gen-2fa', name: 'Two Factor Setting', href: '/dashboard/settings/general/two-factor-setting', visible: true },
          { id: 'sub-gen-lp', name: 'Lesson Plan Setting', href: '/dashboard/settings/general/lesson-plan-setting', visible: true },
          { id: 'sub-gen-stf', name: 'Staff Settings', href: '/dashboard/settings/general/staff-settings', visible: true },
          { id: 'sub-gen-chat', name: 'Chat Settings', href: '/dashboard/settings/general/chat-settings', visible: true },
          { id: 'sub-gen-gen', name: 'General Settings', href: '/dashboard/settings/general/general-settings', visible: true },
          { id: 'sub-gen-opt', name: 'Optional Subject', href: '/dashboard/settings/general/optional-subject', visible: true },
          { id: 'sub-gen-acad', name: 'Academic Year', href: '/dashboard/settings/general/academic-year', visible: true },
          { id: 'sub-gen-hol', name: 'Holiday', href: '/dashboard/settings/general/holiday', visible: true },
          { id: 'sub-gen-mod', name: 'Module Manager', href: '/dashboard/settings/general/module-manager', visible: true },
          { id: 'sub-gen-notif', name: 'Notification Setting', href: '/dashboard/settings/general/notification-setting', visible: true },
          { id: 'sub-gen-tawk', name: 'Tawk To Chat', href: '/dashboard/settings/general/tawk-to-chat', visible: true },
          { id: 'sub-gen-msg', name: 'Messenger Chat', href: '/dashboard/settings/general/messenger-chat', visible: true },
          { id: 'sub-gen-curr', name: 'Manage Currency', href: '/dashboard/settings/general/manage-currency', visible: true },
          { id: 'sub-gen-email', name: 'Email Settings', href: '/dashboard/settings/general/email-settings', visible: true },
          { id: 'sub-gen-pay', name: 'Payment Settings', href: '/dashboard/settings/general/payment-settings', visible: true },
          { id: 'sub-gen-base', name: 'Base Setup', href: '/dashboard/settings/general/base-setup', visible: true },
          { id: 'sub-gen-sms', name: 'Sms Settings', href: '/dashboard/settings/general/sms-settings', visible: true },
          { id: 'sub-gen-wknd', name: 'Weekend', href: '/dashboard/settings/general/weekend', visible: true },
          { id: 'sub-gen-langset', name: 'Language Settings', href: '/dashboard/settings/general/language-settings', visible: true },
          { id: 'sub-gen-bkp', name: 'Backup', href: '/dashboard/settings/general/backup', visible: true },
          { id: 'sub-gen-dash', name: 'Dashboard', href: '/dashboard/settings/general/dashboard', visible: true },
          { id: 'sub-gen-abt', name: 'About & Update', href: '/dashboard/settings/general/about-update', visible: true },
          { id: 'sub-gen-api', name: 'Api Permission', href: '/dashboard/settings/general/api-permission', visible: true },
          { id: 'sub-gen-lang', name: 'Language', href: '/dashboard/settings/general/language', visible: true },
          { id: 'sub-gen-pre', name: 'Preloader Settings', href: '/dashboard/settings/general/preloader-settings', visible: true },
          { id: 'sub-gen-util', name: 'Utilities', href: '/dashboard/settings/general/utilities', visible: true },
        ]
      },
      {
        id: 'item-set-frontend-cms',
        name: 'Frontend CMS',
        iconName: 'Monitor',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-cms-theme', name: 'Manage Theme', href: '/dashboard/settings/frontend-cms/manage-theme', visible: true },
          { id: 'sub-cms-slide', name: 'Home Slider', href: '/dashboard/settings/frontend-cms/home-slider', visible: true },
          { id: 'sub-cms-aora', name: 'Aora Pagebuilder', href: '/dashboard/settings/frontend-cms/aora-pagebuilder', visible: true },
          { id: 'sub-cms-tch', name: 'Expert Teacher', href: '/dashboard/settings/frontend-cms/expert-teacher', visible: true },
          { id: 'sub-cms-photo', name: 'Photo Gallery', href: '/dashboard/settings/frontend-cms/photo-gallery', visible: true },
          { id: 'sub-cms-video', name: 'Video Gallery', href: '/dashboard/settings/frontend-cms/video-gallery', visible: true },
          { id: 'sub-cms-res', name: 'Result', href: '/dashboard/settings/frontend-cms/result', visible: true },
          { id: 'sub-cms-rout', name: 'Class Routine', href: '/dashboard/settings/frontend-cms/class-routine', visible: true },
          { id: 'sub-cms-exam', name: 'Exam Routine', href: '/dashboard/settings/frontend-cms/exam-routine', visible: true },
          { id: 'sub-cms-cal', name: 'Academic Calendar', href: '/dashboard/settings/frontend-cms/academic-calendar', visible: true },
          { id: 'sub-cms-head', name: 'Header Content', href: '/dashboard/settings/frontend-cms/header-content', visible: true },
          { id: 'sub-cms-foot', name: 'Footer Content', href: '/dashboard/settings/frontend-cms/footer-content', visible: true },
          { id: 'sub-cms-news', name: 'News List', href: '/dashboard/settings/frontend-cms/news-list', visible: true },
          { id: 'sub-cms-newscat', name: 'News Category', href: '/dashboard/settings/frontend-cms/news-category', visible: true },
          { id: 'sub-cms-newscomm', name: 'News Comments', href: '/dashboard/settings/frontend-cms/news-comments', visible: true },
          { id: 'sub-cms-testi', name: 'Testimonial', href: '/dashboard/settings/frontend-cms/testimonial', visible: true },
          { id: 'sub-cms-course', name: 'Course List', href: '/dashboard/settings/frontend-cms/course-list', visible: true },
          { id: 'sub-cms-contact', name: 'Contact Message', href: '/dashboard/settings/frontend-cms/contact-message', visible: true },
          { id: 'sub-cms-menu', name: 'Menu', href: '/dashboard/settings/frontend-cms/menu', visible: true },
          { id: 'sub-cms-pages', name: 'Pages', href: '/dashboard/settings/frontend-cms/pages', visible: true },
          { id: 'sub-cms-courcat', name: 'Course Category', href: '/dashboard/settings/frontend-cms/course-category', visible: true },
          { id: 'sub-cms-speech', name: 'Speech Slider', href: '/dashboard/settings/frontend-cms/speech-slider', visible: true },
          { id: 'sub-cms-donor', name: 'Donor', href: '/dashboard/settings/frontend-cms/donor', visible: true },
          { id: 'sub-cms-dl', name: 'Form Download', href: '/dashboard/settings/frontend-cms/form-download', visible: true },
        ]
      },
      {
        id: 'item-set-fees',
        name: 'Fees Settings',
        iconName: 'DollarSign',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-feeset-inv', name: 'Fees Invoice Settings', href: '/dashboard/settings/fees/fees-invoice-settings', visible: true },
        ]
      },
      {
        id: 'item-set-exam',
        name: 'Exam Settings',
        iconName: 'Award',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-examset-fmt', name: 'Format Settings', href: '/dashboard/settings/exam/format-settings', visible: true },
          { id: 'sub-examset-rule', name: 'Setup Exam Rule', href: '/dashboard/settings/exam/setup-exam-rule', visible: true },
          { id: 'sub-examset-pos', name: 'Position', href: '/dashboard/settings/exam/position', visible: true },
          { id: 'sub-examset-allpos', name: 'All Exam Position', href: '/dashboard/settings/exam/all-exam-position', visible: true },
          { id: 'sub-examset-sig', name: 'Exam Signature Settings', href: '/dashboard/settings/exam/exam-signature-settings', visible: true },
          { id: 'sub-examset-admit', name: 'Admit Card Setting', href: '/dashboard/settings/exam/admit-card-setting', visible: true },
          { id: 'sub-examset-seat', name: 'Seat Plan Setting', href: '/dashboard/settings/exam/seat-plan-setting', visible: true },
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
          { id: 'sub-jitsi-vclass', name: 'Virtual Class', href: '/dashboard/module/jitsi/virtual-class', visible: true },
          { id: 'sub-jitsi-vmeet', name: 'Virtual Meeting', href: '/dashboard/module/jitsi/virtual-meeting', visible: true },
          { id: 'sub-jitsi-clsrep', name: 'Class Reports', href: '/dashboard/module/jitsi/class-reports', visible: true },
          { id: 'sub-jitsi-mtrep', name: 'Meeting Reports', href: '/dashboard/module/jitsi/meeting-reports', visible: true },
          { id: 'sub-jitsi-set', name: 'Settings', href: '/dashboard/module/jitsi/settings', visible: true },
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
          { id: 'sub-vc-vclass', name: 'Virtual Class', href: '/dashboard/module/virtual-class/virtual-class', visible: true },
          { id: 'sub-vc-vmeet', name: 'Virtual Meeting', href: '/dashboard/module/virtual-class/virtual-meeting', visible: true },
          { id: 'sub-vc-clsrep', name: 'Class Reports', href: '/dashboard/module/virtual-class/class-reports', visible: true },
          { id: 'sub-vc-mtrep', name: 'Meeting Reports', href: '/dashboard/module/virtual-class/meeting-reports', visible: true },
          { id: 'sub-vc-set', name: 'Settings', href: '/dashboard/module/virtual-class/settings', visible: true },
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
          { id: 'sub-reg-std', name: 'Student List', href: '/dashboard/module/registration/student-list', visible: true },
          { id: 'sub-reg-set', name: 'Settings', href: '/dashboard/module/registration/settings', visible: true },
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
          { id: 'sub-bbb-vclass', name: 'Virtual Class', href: '/dashboard/module/bigbluebutton/virtual-class', visible: true },
          { id: 'sub-bbb-vmeet', name: 'Virtual Meeting', href: '/dashboard/module/bigbluebutton/virtual-meeting', visible: true },
          { id: 'sub-bbb-clsrep', name: 'Class Reports', href: '/dashboard/module/bigbluebutton/class-reports', visible: true },
          { id: 'sub-bbb-mtrep', name: 'Meeting Reports', href: '/dashboard/module/bigbluebutton/meeting-reports', visible: true },
          { id: 'sub-bbb-set', name: 'Settings', href: '/dashboard/module/bigbluebutton/settings', visible: true },
          { id: 'sub-bbb-clsrec', name: 'Class Record List', href: '/dashboard/module/bigbluebutton/class-record-list', visible: true },
          { id: 'sub-bbb-mtrec', name: 'Meeting Record List', href: '/dashboard/module/bigbluebutton/meeting-record-list', visible: true },
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
          { id: 'sub-gmeet-vclass', name: 'Virtual Class', href: '/dashboard/module/gmeet/virtual-class', visible: true },
          { id: 'sub-gmeet-vmeet', name: 'Virtual Meeting', href: '/dashboard/module/gmeet/virtual-meeting', visible: true },
          { id: 'sub-gmeet-clsrep', name: 'Class Reports', href: '/dashboard/module/gmeet/class-reports', visible: true },
          { id: 'sub-gmeet-mtrep', name: 'Meeting Reports', href: '/dashboard/module/gmeet/meeting-reports', visible: true },
          { id: 'sub-gmeet-set', name: 'Settings', href: '/dashboard/module/gmeet/settings', visible: true },
        ]
      },
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
          { id: 'sub-acad-opt-subj', name: 'Optional Subject', href: '/dashboard/academics/optional-subject', visible: true },
          { id: 'sub-acad-section', name: 'Section', href: '/dashboard/academics/section', visible: true },
          { id: 'sub-acad-class', name: 'Class', href: '/dashboard/academics/class', visible: true },
          { id: 'sub-acad-subjects', name: 'Subjects', href: '/dashboard/academics/subjects', visible: true },
          { id: 'sub-acad-assign-teacher', name: 'Assign Class Teacher', href: '/dashboard/academics/assign-class-teacher', visible: true },
          { id: 'sub-acad-assign-subj', name: 'Assign Subject', href: '/dashboard/academics/assign-subject', visible: true },
          { id: 'sub-acad-classroom', name: 'Class Room', href: '/dashboard/academics/classroom', visible: true },
          { id: 'sub-acad-routine', name: 'Class Routine', href: '/dashboard/academics/routine', visible: true },
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
          { id: 'sub-study-upload', name: 'Upload Content', href: '/dashboard/study/upload', visible: true },
          { id: 'sub-study-assign', name: 'Assignment', href: '/dashboard/study/assignment', visible: true },
          { id: 'sub-study-syllabus', name: 'Syllabus', href: '/dashboard/study/syllabus', visible: true },
          { id: 'sub-study-downloads', name: 'Other Downloads', href: '/dashboard/study/downloads', visible: true },
        ],
      },
      {
        id: 'item-lesson-plan',
        name: 'Lesson Plan',
        iconName: 'BookMarked',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-lesson-item', name: 'Lesson', href: '/dashboard/lesson-plan/lesson', visible: true },
          { id: 'sub-lesson-topic', name: 'Topic', href: '/dashboard/lesson-plan/topic', visible: true },
          { id: 'sub-lesson-topic-ov', name: 'Topic Overview', href: '/dashboard/lesson-plan/topic-overview', visible: true },
          { id: 'sub-lesson-plan-item', name: 'Lesson Plan', href: '/dashboard/lesson-plan/plan', visible: true },
          { id: 'sub-lesson-plan-ov', name: 'Lesson Plan Overview', href: '/dashboard/lesson-plan/overview', visible: true },
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
          { id: 'sub-stu-cat', name: 'Student Category', href: '/dashboard/students/category', visible: true },
          { id: 'sub-stu-add', name: 'Add Student', href: '/dashboard/students/add', visible: true },
          { id: 'sub-stu-list', name: 'Student List', href: '/dashboard/students', visible: true },
          { id: 'sub-stu-att', name: 'Student Attendance', href: '/dashboard/students/attendance', visible: true },
          { id: 'sub-stu-subj-att', name: 'Subject Wise Attendance', href: '/dashboard/students/subject-attendance', visible: true },
          { id: 'sub-stu-grp', name: 'Student Group', href: '/dashboard/students/groups', visible: true },
          { id: 'sub-stu-promote', name: 'Student Promote', href: '/dashboard/students/promote', visible: true },
          { id: 'sub-stu-disable', name: 'Disabled Students', href: '/dashboard/students/disabled', visible: true },
        ],
      },
      {
        id: 'item-homework',
        name: 'HomeWork',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-hw-rep', name: 'Homework Report', href: '/dashboard/homework/report', visible: true },
          { id: 'sub-hw-add', name: 'Add Homework', href: '/dashboard/homework/add', visible: true },
          { id: 'sub-hw-list', name: 'Homework List', href: '/dashboard/homework/list', visible: true },
        ],
      },
      {
        id: 'item-transport',
        name: 'Transport',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-trans-routes', name: 'Routes', href: '/dashboard/transport/routes', visible: true },
          { id: 'sub-trans-veh', name: 'Vehicle', href: '/dashboard/transport/vehicle', visible: true },
          { id: 'sub-trans-assign', name: 'Assign Vehicle', href: '/dashboard/transport/assign-vehicle', visible: true },
        ],
      },
      {
        id: 'item-dormitory',
        name: 'Dormitory',
        iconName: 'Building',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-dorm-type', name: 'Room Type', href: '/dashboard/dormitory/room-type', visible: true },
          { id: 'sub-dorm-dorm', name: 'Dormitory', href: '/dashboard/dormitory', visible: true },
          { id: 'sub-dorm-rooms', name: 'Dormitory Rooms', href: '/dashboard/dormitory/dormitory-rooms', visible: true },
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
          { id: 'sub-ex-grade', name: 'Marks Grade', href: '/dashboard/examination/marks-grade', visible: true },
          { id: 'sub-ex-type', name: 'Exam Type', href: '/dashboard/examination/exam-type', visible: true },
          { id: 'sub-ex-setup', name: 'Exam Setup', href: '/dashboard/examination/exam-setup', visible: true },
          { id: 'sub-ex-sms', name: 'Send Marks By Sms', href: '/dashboard/examination/send-marks-by-sms', visible: true },
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
          { id: 'sub-te-my-report', name: 'My Report', href: '/dashboard/teacher-evaluation/teacher-wise-report', visible: true },
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
          { id: 'sub-comm-notice', name: 'Notice Board', href: '/dashboard/utilities/communicate/notice-board', visible: true },
          { id: 'sub-comm-send', name: 'Send Email / Sms', href: '/dashboard/utilities/communicate/send-email-sms', visible: true },
          { id: 'sub-comm-log', name: 'Email / Sms Log', href: '/dashboard/utilities/communicate/email-sms-log', visible: true },
          { id: 'sub-comm-event', name: 'Event', href: '/dashboard/utilities/communicate/event', visible: true },
          { id: 'sub-comm-cal', name: 'Calendar', href: '/dashboard/utilities/communicate/calendar', visible: true },
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
          { id: 'sub-vc-vclass', name: 'Virtual Class', href: '/dashboard/module/virtual-class/virtual-class', visible: true },
          { id: 'sub-vc-vmeet', name: 'Virtual Meeting', href: '/dashboard/module/virtual-class/virtual-meeting', visible: true },
          { id: 'sub-vc-clsrep', name: 'Class Reports', href: '/dashboard/module/virtual-class/class-reports', visible: true },
          { id: 'sub-vc-mtrep', name: 'Meeting Reports', href: '/dashboard/module/virtual-class/meeting-reports', visible: true },
        ],
      },
    ],
  },
];

export const STORAGE_KEY = 'stoofi_custom_sidebar_v5';


export function getStoredSidebar(role = 'Super Admin') {
  if (typeof window === 'undefined') {
    return role === 'Teacher' ? TEACHER_MENU_STRUCTURE : DEFAULT_MENU_STRUCTURE;
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${role}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse sidebar data:', e);
  }
  return role === 'Teacher' ? TEACHER_MENU_STRUCTURE : DEFAULT_MENU_STRUCTURE;
}


export function saveStoredSidebar(menuData, role = 'Super Admin') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_${role}`, JSON.stringify(menuData));
    // Dispatch custom event for real-time live sync across components
    window.dispatchEvent(new CustomEvent('stoofi_sidebar_updated', { detail: { role, menuData } }));
  } catch (e) {
    console.error('Failed to save sidebar data:', e);
  }
}

export function resetStoredSidebar(role = 'Super Admin') {
  const defaultMenu = role === 'Teacher' ? TEACHER_MENU_STRUCTURE : DEFAULT_MENU_STRUCTURE;
  if (typeof window === 'undefined') return defaultMenu;
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${role}`);
    window.dispatchEvent(new CustomEvent('stoofi_sidebar_updated', { detail: { role, menuData: defaultMenu } }));
  } catch (e) {
    console.error('Failed to reset sidebar data:', e);
  }
  return defaultMenu;
}
