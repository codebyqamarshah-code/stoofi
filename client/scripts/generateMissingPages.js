const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'app', 'dashboard');

const pages = [
  // Wallet
  { path: 'accounts/wallet/pending-deposit/page.js', title: 'Pending Deposit', breadcrumbs: ['Accounts', 'Wallet', 'Pending Deposit'], type: 'table', columns: ['User Name', 'Amount', 'Date', 'Payment Method', 'Status', 'Action'] },
  { path: 'accounts/wallet/approve-deposit/page.js', title: 'Approve Deposit', breadcrumbs: ['Accounts', 'Wallet', 'Approve Deposit'], type: 'table', columns: ['User Name', 'Amount', 'Date', 'Payment Method', 'Status'] },
  { path: 'accounts/wallet/reject-deposit/page.js', title: 'Reject Deposit', breadcrumbs: ['Accounts', 'Wallet', 'Reject Deposit'], type: 'table', columns: ['User Name', 'Amount', 'Date', 'Payment Method', 'Status'] },
  { path: 'accounts/wallet/transactions/page.js', title: 'Wallet Transaction', breadcrumbs: ['Accounts', 'Wallet', 'Wallet Transaction'], type: 'table', columns: ['User Name', 'Amount', 'Type', 'Balance', 'Date', 'Description'] },
  { path: 'accounts/wallet/refund-request/page.js', title: 'Refund Request', breadcrumbs: ['Accounts', 'Wallet', 'Refund Request'], type: 'form-table', formTitle: 'Add Refund Request', fields: [{ name: 'userName', label: 'User Name', type: 'text' }, { name: 'amount', label: 'Amount', type: 'number' }, { name: 'reason', label: 'Reason', type: 'textarea' }], columns: ['User Name', 'Amount', 'Reason', 'Status', 'Action'] },

  // Accounts
  { path: 'accounts/accounts/profit-loss/page.js', title: 'Profit & Loss', breadcrumbs: ['Accounts', 'Accounts', 'Profit & Loss'], type: 'stats-table', columns: ['Month', 'Income', 'Expense', 'Net Profit/Loss'] },
  { path: 'accounts/accounts/income/page.js', title: 'Income', breadcrumbs: ['Accounts', 'Accounts', 'Income'], type: 'form-table', formTitle: 'Add Income', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'amount', label: 'Amount', type: 'number' }, { name: 'category', label: 'Category', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Title', 'Amount', 'Category', 'Date', 'Action'] },
  { path: 'accounts/accounts/expense/page.js', title: 'Expense', breadcrumbs: ['Accounts', 'Accounts', 'Expense'], type: 'form-table', formTitle: 'Add Expense', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'amount', label: 'Amount', type: 'number' }, { name: 'category', label: 'Category', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Title', 'Amount', 'Category', 'Date', 'Action'] },
  { path: 'accounts/accounts/chart-of-account/page.js', title: 'Chart Of Account', breadcrumbs: ['Accounts', 'Accounts', 'Chart Of Account'], type: 'form-table', formTitle: 'Add Account', fields: [{ name: 'name', label: 'Account Name', type: 'text' }, { name: 'code', label: 'Code', type: 'text' }, { name: 'type', label: 'Type', type: 'select', options: ['Asset', 'Liability', 'Equity', 'Income', 'Expense'] }], columns: ['Account Name', 'Code', 'Type', 'Action'] },
  { path: 'accounts/accounts/bank-account/page.js', title: 'Bank Account', breadcrumbs: ['Accounts', 'Accounts', 'Bank Account'], type: 'form-table', formTitle: 'Add Bank Account', fields: [{ name: 'bankName', label: 'Bank Name', type: 'text' }, { name: 'accountTitle', label: 'Account Title', type: 'text' }, { name: 'accountNumber', label: 'Account Number', type: 'text' }, { name: 'openingBalance', label: 'Opening Balance', type: 'number' }], columns: ['Bank Name', 'Account Title', 'Account Number', 'Opening Balance', 'Action'] },
  { path: 'accounts/accounts/fund-transfer/page.js', title: 'Fund Transfer', breadcrumbs: ['Accounts', 'Accounts', 'Fund Transfer'], type: 'form-table', formTitle: 'Add Fund Transfer', fields: [{ name: 'fromAccount', label: 'From Account', type: 'text' }, { name: 'toAccount', label: 'To Account', type: 'text' }, { name: 'amount', label: 'Amount', type: 'number' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['From Account', 'To Account', 'Amount', 'Date', 'Action'] },

  // Inventory
  { path: 'accounts/inventory/item-category/page.js', title: 'Item Category', breadcrumbs: ['Accounts', 'Inventory', 'Item Category'], type: 'form-table', formTitle: 'Add Category', fields: [{ name: 'name', label: 'Category Name', type: 'text' }, { name: 'description', label: 'Description', type: 'textarea' }], columns: ['Category Name', 'Description', 'Action'] },
  { path: 'accounts/inventory/item-list/page.js', title: 'Item List', breadcrumbs: ['Accounts', 'Inventory', 'Item List'], type: 'form-table', formTitle: 'Add Item', fields: [{ name: 'name', label: 'Item Name', type: 'text' }, { name: 'category', label: 'Category', type: 'text' }, { name: 'unit', label: 'Unit', type: 'text' }, { name: 'stock', label: 'Stock', type: 'number' }], columns: ['Item Name', 'Category', 'Unit', 'Stock', 'Action'] },
  { path: 'accounts/inventory/item-store/page.js', title: 'Item Store', breadcrumbs: ['Accounts', 'Inventory', 'Item Store'], type: 'form-table', formTitle: 'Add Store', fields: [{ name: 'name', label: 'Store Name', type: 'text' }, { name: 'location', label: 'Location', type: 'text' }], columns: ['Store Name', 'Location', 'Action'] },
  { path: 'accounts/inventory/supplier/page.js', title: 'Supplier', breadcrumbs: ['Accounts', 'Inventory', 'Supplier'], type: 'form-table', formTitle: 'Add Supplier', fields: [{ name: 'name', label: 'Supplier Name', type: 'text' }, { name: 'phone', label: 'Phone', type: 'text' }, { name: 'email', label: 'Email', type: 'text' }], columns: ['Supplier Name', 'Phone', 'Email', 'Action'] },
  { path: 'accounts/inventory/item-receive/page.js', title: 'Item Receive', breadcrumbs: ['Accounts', 'Inventory', 'Item Receive'], type: 'form-table', formTitle: 'Receive Item', fields: [{ name: 'item', label: 'Item Name', type: 'text' }, { name: 'supplier', label: 'Supplier', type: 'text' }, { name: 'quantity', label: 'Quantity', type: 'number' }, { name: 'price', label: 'Price', type: 'number' }], columns: ['Item Name', 'Supplier', 'Quantity', 'Price', 'Action'] },
  { path: 'accounts/inventory/item-receive-list/page.js', title: 'Item Receive List', breadcrumbs: ['Accounts', 'Inventory', 'Item Receive List'], type: 'table', columns: ['Item Name', 'Supplier', 'Quantity', 'Price', 'Date'] },
  { path: 'accounts/inventory/item-sell/page.js', title: 'Item Sell', breadcrumbs: ['Accounts', 'Inventory', 'Item Sell'], type: 'form-table', formTitle: 'Sell Item', fields: [{ name: 'item', label: 'Item Name', type: 'text' }, { name: 'customer', label: 'Customer', type: 'text' }, { name: 'quantity', label: 'Quantity', type: 'number' }, { name: 'price', label: 'Price', type: 'number' }], columns: ['Item Name', 'Customer', 'Quantity', 'Price', 'Action'] },
  { path: 'accounts/inventory/item-issue/page.js', title: 'Item Issue', breadcrumbs: ['Accounts', 'Inventory', 'Item Issue'], type: 'form-table', formTitle: 'Issue Item', fields: [{ name: 'item', label: 'Item Name', type: 'text' }, { name: 'issuedTo', label: 'Issued To', type: 'text' }, { name: 'quantity', label: 'Quantity', type: 'number' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Item Name', 'Issued To', 'Quantity', 'Date', 'Action'] },

  // Chat & Communicate & Style
  { path: 'utilities/chat/chat-box/page.js', title: 'Chat Box', breadcrumbs: ['Utilities', 'Chat', 'Chat Box'], type: 'chat' },
  { path: 'utilities/chat/invitation/page.js', title: 'Invitation', breadcrumbs: ['Utilities', 'Chat', 'Invitation'], type: 'form-table', formTitle: 'Send Invitation', fields: [{ name: 'sentTo', label: 'Send To', type: 'text' }, { name: 'message', label: 'Message', type: 'textarea' }], columns: ['Sent To', 'Message', 'Status', 'Action'] },
  { path: 'utilities/chat/blocked-user/page.js', title: 'Blocked User', breadcrumbs: ['Utilities', 'Chat', 'Blocked User'], type: 'table', columns: ['User Name', 'Email', 'Blocked Date', 'Reason', 'Action'] },
  { path: 'utilities/communicate/notice-board/page.js', title: 'Notice Board', breadcrumbs: ['Utilities', 'Communicate', 'Notice Board'], type: 'form-table', formTitle: 'Add Notice', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'noticeFor', label: 'Notice For', type: 'select', options: ['All', 'Teachers', 'Students', 'Parents'] }, { name: 'notice', label: 'Notice', type: 'textarea' }], columns: ['Title', 'Notice For', 'Date', 'Action'] },
  { path: 'utilities/communicate/send-email-sms/page.js', title: 'Send Email / Sms', breadcrumbs: ['Utilities', 'Communicate', 'Send Email / Sms'], type: 'send-message' },
  { path: 'utilities/communicate/email-sms-log/page.js', title: 'Email / Sms Log', breadcrumbs: ['Utilities', 'Communicate', 'Email / Sms Log'], type: 'table', columns: ['Subject / Message', 'Sent To', 'Recipients', 'Status', 'Date'] },
  { path: 'utilities/communicate/event/page.js', title: 'Event', breadcrumbs: ['Utilities', 'Communicate', 'Event'], type: 'form-table', formTitle: 'Add Event', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'eventFor', label: 'Event For', type: 'select', options: ['All', 'Teachers', 'Students', 'Parents'] }, { name: 'startDate', label: 'Start Date', type: 'date' }, { name: 'endDate', label: 'End Date', type: 'date' }], columns: ['Title', 'Event For', 'Start Date', 'End Date', 'Action'] },
  { path: 'utilities/communicate/calendar/page.js', title: 'Calendar', breadcrumbs: ['Utilities', 'Communicate', 'Calendar'], type: 'calendar' },
  { path: 'utilities/communicate/email-template/page.js', title: 'Email Template', breadcrumbs: ['Utilities', 'Communicate', 'Email Template'], type: 'form-table', formTitle: 'Add Email Template', fields: [{ name: 'name', label: 'Template Name', type: 'text' }, { name: 'subject', label: 'Subject', type: 'text' }, { name: 'body', label: 'Body', type: 'textarea' }], columns: ['Template Name', 'Subject', 'Action'] },
  { path: 'utilities/communicate/sms-template/page.js', title: 'Sms Template', breadcrumbs: ['Utilities', 'Communicate', 'Sms Template'], type: 'form-table', formTitle: 'Add Sms Template', fields: [{ name: 'name', label: 'Template Name', type: 'text' }, { name: 'message', label: 'Message', type: 'textarea' }], columns: ['Template Name', 'Message', 'Action'] },
  { path: 'utilities/style/background-settings/page.js', title: 'BackGround Settings', breadcrumbs: ['Utilities', 'Style', 'BackGround Settings'], type: 'settings', fields: [{ label: 'Sidebar Background', type: 'text' }, { label: 'Header Background', type: 'text' }] },
  { path: 'utilities/style/color-theme/page.js', title: 'Color Theme', breadcrumbs: ['Utilities', 'Style', 'Color Theme'], type: 'settings', fields: [{ label: 'Primary Accent Color', type: 'text' }, { label: 'Secondary Theme Color', type: 'text' }] },

  // Reports - Student
  { path: 'report/student/attendance/page.js', title: 'Student Attendance Report', breadcrumbs: ['Report', 'Student Report', 'Student Attendance Report'], type: 'report-filter', columns: ['Admission No', 'Name', 'Class', 'Section', 'Attendance Status', 'Percentage'] },
  { path: 'report/student/subject-attendance/page.js', title: 'Subject Attendance Report', breadcrumbs: ['Report', 'Student Report', 'Subject Attendance Report'], type: 'report-filter', columns: ['Admission No', 'Name', 'Subject', 'Attended', 'Total Classes', 'Percentage'] },
  { path: 'report/student/homework-evaluation/page.js', title: 'Homework Evaluation Report', breadcrumbs: ['Report', 'Student Report', 'Homework Evaluation Report'], type: 'report-filter', columns: ['Subject', 'Homework Date', 'Submission Date', 'Complete', 'Incomplete', 'Percentage'] },
  { path: 'report/student/transport/page.js', title: 'Student Transport Report', breadcrumbs: ['Report', 'Student Report', 'Student Transport Report'], type: 'report-filter', columns: ['Student Name', 'Class', 'Route Title', 'Vehicle No', 'Driver Name', 'Fare'] },
  { path: 'report/student/dormitory/page.js', title: 'Student Dormitory Report', breadcrumbs: ['Report', 'Student Report', 'Student Dormitory Report'], type: 'report-filter', columns: ['Student Name', 'Class', 'Dormitory Name', 'Room No', 'Room Type', 'Cost'] },
  { path: 'report/student/guardian/page.js', title: 'Guardian Reports', breadcrumbs: ['Report', 'Student Report', 'Guardian Reports'], type: 'report-filter', columns: ['Guardian Name', 'Phone', 'Email', 'Student Name', 'Class', 'Relation'] },
  { path: 'report/student/history/page.js', title: 'Student History', breadcrumbs: ['Report', 'Student Report', 'Student History'], type: 'report-filter', columns: ['Student Name', 'Admission No', 'Admission Date', 'Class', 'Academic Year', 'Mobile'] },
  { path: 'report/student/login/page.js', title: 'Student Login Report', breadcrumbs: ['Report', 'Student Report', 'Student Login Report'], type: 'report-filter', columns: ['User Name', 'Role', 'IP Address', 'Login Time', 'User Agent'] },
  { path: 'report/student/class/page.js', title: 'Class Report', breadcrumbs: ['Report', 'Student Report', 'Class Report'], type: 'report-filter', columns: ['Class Name', 'Section', 'Capacity', 'Total Students', 'Boys', 'Girls'] },
  { path: 'report/student/routine/page.js', title: 'Class Routine', breadcrumbs: ['Report', 'Student Report', 'Class Routine'], type: 'report-filter', columns: ['Day', 'Subject', 'Teacher', 'Time', 'Room'] },
  { path: 'report/student/user-log/page.js', title: 'User Log', breadcrumbs: ['Report', 'Student Report', 'User Log'], type: 'report-filter', columns: ['User Name', 'Role', 'IP Address', 'Login Date & Time', 'User Agent'] },
  { path: 'report/student/general/page.js', title: 'Student Report', breadcrumbs: ['Report', 'Student Report', 'Student Report'], type: 'report-filter', columns: ['Admission No', 'Student Name', 'Class(Section)', 'Father Name', 'Gender', 'Phone'] },
  { path: 'report/student/previous-record/page.js', title: 'Previous Record', breadcrumbs: ['Report', 'Student Report', 'Previous Record'], type: 'report-filter', columns: ['Student Name', 'Admission No', 'Previous Class', 'Year', 'Status', 'Action'] },

  // Reports - Exam
  { path: 'report/exam/routine/page.js', title: 'Exam Routine', breadcrumbs: ['Report', 'Exam Report', 'Exam Routine'], type: 'report-filter', columns: ['Exam Type', 'Class', 'Subject', 'Date', 'Time', 'Room'] },
  { path: 'report/exam/merit-list/page.js', title: 'Merit List Report', breadcrumbs: ['Report', 'Exam Report', 'Merit List Report'], type: 'report-filter', columns: ['Rank', 'Admission No', 'Student Name', 'Total Marks', 'GPA', 'Result'] },
  { path: 'report/exam/online-exam/page.js', title: 'Online Exam Report', breadcrumbs: ['Report', 'Exam Report', 'Online Exam Report'], type: 'report-filter', columns: ['Exam Title', 'Student Name', 'Total Marks', 'Obtained Marks', 'Result', 'Date'] },
  { path: 'report/exam/mark-sheet/page.js', title: 'Mark Sheet Report', breadcrumbs: ['Report', 'Exam Report', 'Mark Sheet Report'], type: 'report-filter', columns: ['Student Name', 'Roll No', 'Class', 'Exam', 'Total Score', 'Grade'] },
  { path: 'report/exam/tabulation-sheet/page.js', title: 'Tabulation Sheet Report', breadcrumbs: ['Report', 'Exam Report', 'Tabulation Sheet Report'], type: 'report-filter', columns: ['Student Name', 'Roll No', 'Subject Marks', 'Total', 'GPA', 'Grade'] },
  { path: 'report/exam/progress-card/page.js', title: 'Progress Card Report', breadcrumbs: ['Report', 'Exam Report', 'Progress Card Report'], type: 'report-filter', columns: ['Student Name', 'Class', 'Exam Term', 'Attendance', 'Behavior', 'Grade'] },
  { path: 'report/exam/progress-card-100/page.js', title: 'Progress Card Report 100 Percent', breadcrumbs: ['Report', 'Exam Report', 'Progress Card Report 100 Percent'], type: 'report-filter', columns: ['Student Name', 'Class', 'Percentage Score', 'Overall Rank', 'Result'] },
  { path: 'report/exam/previous-result/page.js', title: 'Previous Result', breadcrumbs: ['Report', 'Exam Report', 'Previous Result'], type: 'report-filter', columns: ['Student Name', 'Year', 'Class', 'Exam Name', 'Total Marks', 'Grade'] },

  // Reports - Staff
  { path: 'report/staff/attendance/page.js', title: 'Staff Attendance Report', breadcrumbs: ['Report', 'Staff Report', 'Staff Attendance Report'], type: 'report-filter', columns: ['Staff ID', 'Name', 'Department', 'Designation', 'Present', 'Absent', 'Percentage'] },
  { path: 'report/staff/payroll/page.js', title: 'Payroll Report', breadcrumbs: ['Report', 'Staff Report', 'Payroll Report'], type: 'report-filter', columns: ['Staff Name', 'Role', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status'] },

  // Reports - Accounts
  { path: 'report/accounts/payroll/page.js', title: 'Payroll Report', breadcrumbs: ['Report', 'Accounts Report', 'Payroll Report'], type: 'report-filter', columns: ['Staff Name', 'Role', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Payment Date'] },
  { path: 'report/accounts/transaction/page.js', title: 'Transaction', breadcrumbs: ['Report', 'Accounts Report', 'Transaction'], type: 'report-filter', columns: ['Transaction ID', 'Account Title', 'Type', 'Amount', 'Date', 'Description'] },

  // Settings - Custom Field
  { path: 'settings/custom-field/student-registration/page.js', title: 'Student Registration', breadcrumbs: ['Settings', 'Custom Field', 'Student Registration'], type: 'form-table', formTitle: 'Add Custom Field', fields: [{ name: 'label', label: 'Field Label', type: 'text' }, { name: 'type', label: 'Field Type', type: 'select', options: ['Text', 'Number', 'Dropdown', 'Date'] }], columns: ['Field Label', 'Field Type', 'Action'] },
  { path: 'settings/custom-field/staff-registration/page.js', title: 'Staff Registration', breadcrumbs: ['Settings', 'Custom Field', 'Staff Registration'], type: 'form-table', formTitle: 'Add Custom Field', fields: [{ name: 'label', label: 'Field Label', type: 'text' }, { name: 'type', label: 'Field Type', type: 'select', options: ['Text', 'Number', 'Dropdown', 'Date'] }], columns: ['Field Label', 'Field Type', 'Action'] },

  // Settings - General Settings
  { path: 'settings/general/student-settings/page.js', title: 'Student Settings', breadcrumbs: ['Settings', 'General Settings', 'Student Settings'], type: 'settings', fields: [{ label: 'Auto Student Roll Generator', type: 'text' }, { label: 'Default Student Password', type: 'text' }] },
  { path: 'settings/general/two-factor-setting/page.js', title: 'Two Factor Setting', breadcrumbs: ['Settings', 'General Settings', 'Two Factor Setting'], type: 'settings', fields: [{ label: 'Enable 2FA for Admin', type: 'text' }, { label: 'Enable 2FA for Staff', type: 'text' }] },
  { path: 'settings/general/lesson-plan-setting/page.js', title: 'Lesson Plan Setting', breadcrumbs: ['Settings', 'General Settings', 'Lesson Plan Setting'], type: 'settings', fields: [{ label: 'Enable Topic Approval', type: 'text' }] },
  { path: 'settings/general/staff-settings/page.js', title: 'Staff Settings', breadcrumbs: ['Settings', 'General Settings', 'Staff Settings'], type: 'settings', fields: [{ label: 'Default Staff Password', type: 'text' }] },
  { path: 'settings/general/chat-settings/page.js', title: 'Chat Settings', breadcrumbs: ['Settings', 'General Settings', 'Chat Settings'], type: 'settings', fields: [{ label: 'Enable Open Chat', type: 'text' }] },
  { path: 'settings/general/general-settings/page.js', title: 'General Settings', breadcrumbs: ['Settings', 'General Settings', 'General Settings'], type: 'settings', fields: [{ label: 'School Name', type: 'text' }, { label: 'Phone', type: 'text' }, { label: 'Address', type: 'text' }] },
  { path: 'settings/general/optional-subject/page.js', title: 'Optional Subject', breadcrumbs: ['Settings', 'General Settings', 'Optional Subject'], type: 'settings', fields: [{ label: 'Max Optional Subjects per Student', type: 'text' }] },
  { path: 'settings/general/academic-year/page.js', title: 'Academic Year', breadcrumbs: ['Settings', 'General Settings', 'Academic Year'], type: 'form-table', formTitle: 'Add Academic Year', fields: [{ name: 'year', label: 'Academic Year', type: 'text' }, { name: 'title', label: 'Title', type: 'text' }], columns: ['Academic Year', 'Title', 'Action'] },
  { path: 'settings/general/holiday/page.js', title: 'Holiday', breadcrumbs: ['Settings', 'General Settings', 'Holiday'], type: 'form-table', formTitle: 'Add Holiday', fields: [{ name: 'title', label: 'Holiday Title', type: 'text' }, { name: 'fromDate', label: 'From Date', type: 'date' }, { name: 'toDate', label: 'To Date', type: 'date' }], columns: ['Holiday Title', 'From Date', 'To Date', 'Action'] },
  { path: 'settings/general/module-manager/page.js', title: 'Module Manager', breadcrumbs: ['Settings', 'General Settings', 'Module Manager'], type: 'table', columns: ['Module Name', 'Version', 'Status', 'Action'] },
  { path: 'settings/general/notification-setting/page.js', title: 'Notification Setting', breadcrumbs: ['Settings', 'General Settings', 'Notification Setting'], type: 'settings', fields: [{ label: 'Email Notification', type: 'text' }, { label: 'SMS Notification', type: 'text' }] },
  { path: 'settings/general/tawk-to-chat/page.js', title: 'Tawk To Chat', breadcrumbs: ['Settings', 'General Settings', 'Tawk To Chat'], type: 'settings', fields: [{ label: 'Tawk Property ID', type: 'text' }, { label: 'Tawk Widget ID', type: 'text' }] },
  { path: 'settings/general/messenger-chat/page.js', title: 'Messenger Chat', breadcrumbs: ['Settings', 'General Settings', 'Messenger Chat'], type: 'settings', fields: [{ label: 'Page ID', type: 'text' }] },
  { path: 'settings/general/manage-currency/page.js', title: 'Manage Currency', breadcrumbs: ['Settings', 'General Settings', 'Manage Currency'], type: 'form-table', formTitle: 'Add Currency', fields: [{ name: 'name', label: 'Currency Name', type: 'text' }, { name: 'code', label: 'Code', type: 'text' }, { name: 'symbol', label: 'Symbol', type: 'text' }], columns: ['Name', 'Code', 'Symbol', 'Action'] },
  { path: 'settings/general/email-settings/page.js', title: 'Email Settings', breadcrumbs: ['Settings', 'General Settings', 'Email Settings'], type: 'settings', fields: [{ label: 'SMTP Host', type: 'text' }, { label: 'SMTP Port', type: 'text' }, { label: 'Sender Email', type: 'text' }] },
  { path: 'settings/general/payment-settings/page.js', title: 'Payment Settings', breadcrumbs: ['Settings', 'General Settings', 'Payment Settings'], type: 'settings', fields: [{ label: 'Stripe Key', type: 'text' }, { label: 'PayPal Client ID', type: 'text' }] },
  { path: 'settings/general/base-setup/page.js', title: 'Base Setup', breadcrumbs: ['Settings', 'General Settings', 'Base Setup'], type: 'form-table', formTitle: 'Add Base Setup', fields: [{ name: 'baseGroup', label: 'Group', type: 'text' }, { name: 'name', label: 'Name', type: 'text' }], columns: ['Group', 'Name', 'Action'] },
  { path: 'settings/general/sms-settings/page.js', title: 'Sms Settings', breadcrumbs: ['Settings', 'General Settings', 'Sms Settings'], type: 'settings', fields: [{ label: 'Twilio SID', type: 'text' }, { label: 'Auth Token', type: 'text' }] },
  { path: 'settings/general/weekend/page.js', title: 'Weekend', breadcrumbs: ['Settings', 'General Settings', 'Weekend'], type: 'table', columns: ['Day', 'Is Weekend', 'Action'] },
  { path: 'settings/general/language-settings/page.js', title: 'Language Settings', breadcrumbs: ['Settings', 'General Settings', 'Language Settings'], type: 'table', columns: ['Language', 'Code', 'Default', 'Action'] },
  { path: 'settings/general/backup/page.js', title: 'Backup', breadcrumbs: ['Settings', 'General Settings', 'Backup'], type: 'table', columns: ['Backup File', 'Date', 'Size', 'Action'] },
  { path: 'settings/general/dashboard/page.js', title: 'Dashboard Settings', breadcrumbs: ['Settings', 'General Settings', 'Dashboard'], type: 'settings', fields: [{ label: 'Show Quick Stats', type: 'text' }] },
  { path: 'settings/general/about-update/page.js', title: 'About & Update', breadcrumbs: ['Settings', 'General Settings', 'About & Update'], type: 'settings', fields: [{ label: 'Software Version', type: 'text' }, { label: 'License Code', type: 'text' }] },
  { path: 'settings/general/api-permission/page.js', title: 'Api Permission', breadcrumbs: ['Settings', 'General Settings', 'Api Permission'], type: 'table', columns: ['API Endpoint', 'Permission Key', 'Status', 'Action'] },
  { path: 'settings/general/language/page.js', title: 'Language', breadcrumbs: ['Settings', 'General Settings', 'Language'], type: 'form-table', formTitle: 'Add Language', fields: [{ name: 'name', label: 'Language Name', type: 'text' }, { name: 'code', label: 'Code', type: 'text' }], columns: ['Language Name', 'Code', 'Action'] },
  { path: 'settings/general/preloader-settings/page.js', title: 'Preloader Settings', breadcrumbs: ['Settings', 'General Settings', 'Preloader Settings'], type: 'settings', fields: [{ label: 'Enable Preloader', type: 'text' }, { label: 'Preloader Text', type: 'text' }] },
  { path: 'settings/general/utilities/page.js', title: 'Utilities Settings', breadcrumbs: ['Settings', 'General Settings', 'Utilities'], type: 'table', columns: ['Utility Name', 'Description', 'Status', 'Action'] },

  // Settings - Frontend CMS
  { path: 'settings/frontend-cms/manage-theme/page.js', title: 'Manage Theme', breadcrumbs: ['Settings', 'Frontend CMS', 'Manage Theme'], type: 'table', columns: ['Theme Name', 'Preview', 'Status', 'Action'] },
  { path: 'settings/frontend-cms/home-slider/page.js', title: 'Home Slider', breadcrumbs: ['Settings', 'Frontend CMS', 'Home Slider'], type: 'form-table', formTitle: 'Add Slider', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'subTitle', label: 'Sub Title', type: 'text' }], columns: ['Title', 'Sub Title', 'Action'] },
  { path: 'settings/frontend-cms/aora-pagebuilder/page.js', title: 'Aora Pagebuilder', breadcrumbs: ['Settings', 'Frontend CMS', 'Aora Pagebuilder'], type: 'table', columns: ['Page Title', 'Slug', 'Updated At', 'Action'] },
  { path: 'settings/frontend-cms/expert-teacher/page.js', title: 'Expert Teacher', breadcrumbs: ['Settings', 'Frontend CMS', 'Expert Teacher'], type: 'form-table', formTitle: 'Add Teacher', fields: [{ name: 'name', label: 'Teacher Name', type: 'text' }, { name: 'designation', label: 'Designation', type: 'text' }], columns: ['Teacher Name', 'Designation', 'Action'] },
  { path: 'settings/frontend-cms/photo-gallery/page.js', title: 'Photo Gallery', breadcrumbs: ['Settings', 'Frontend CMS', 'Photo Gallery'], type: 'form-table', formTitle: 'Add Photo', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'category', label: 'Category', type: 'text' }], columns: ['Title', 'Category', 'Action'] },
  { path: 'settings/frontend-cms/video-gallery/page.js', title: 'Video Gallery', breadcrumbs: ['Settings', 'Frontend CMS', 'Video Gallery'], type: 'form-table', formTitle: 'Add Video', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'url', label: 'Video URL', type: 'text' }], columns: ['Title', 'Video URL', 'Action'] },
  { path: 'settings/frontend-cms/result/page.js', title: 'Result CMS', breadcrumbs: ['Settings', 'Frontend CMS', 'Result'], type: 'table', columns: ['Title', 'Class', 'File', 'Action'] },
  { path: 'settings/frontend-cms/class-routine/page.js', title: 'Class Routine CMS', breadcrumbs: ['Settings', 'Frontend CMS', 'Class Routine'], type: 'table', columns: ['Class', 'Section', 'File', 'Action'] },
  { path: 'settings/frontend-cms/exam-routine/page.js', title: 'Exam Routine CMS', breadcrumbs: ['Settings', 'Frontend CMS', 'Exam Routine'], type: 'table', columns: ['Exam Name', 'Class', 'File', 'Action'] },
  { path: 'settings/frontend-cms/academic-calendar/page.js', title: 'Academic Calendar CMS', breadcrumbs: ['Settings', 'Frontend CMS', 'Academic Calendar'], type: 'table', columns: ['Title', 'Year', 'File', 'Action'] },
  { path: 'settings/frontend-cms/header-content/page.js', title: 'Header Content', breadcrumbs: ['Settings', 'Frontend CMS', 'Header Content'], type: 'settings', fields: [{ label: 'Header Phone', type: 'text' }, { label: 'Header Email', type: 'text' }] },
  { path: 'settings/frontend-cms/footer-content/page.js', title: 'Footer Content', breadcrumbs: ['Settings', 'Frontend CMS', 'Footer Content'], type: 'settings', fields: [{ label: 'Copyright Text', type: 'text' }, { label: 'About Text', type: 'text' }] },
  { path: 'settings/frontend-cms/news-list/page.js', title: 'News List', breadcrumbs: ['Settings', 'Frontend CMS', 'News List'], type: 'form-table', formTitle: 'Add News', fields: [{ name: 'title', label: 'News Title', type: 'text' }, { name: 'category', label: 'Category', type: 'text' }], columns: ['News Title', 'Category', 'Date', 'Action'] },
  { path: 'settings/frontend-cms/news-category/page.js', title: 'News Category', breadcrumbs: ['Settings', 'Frontend CMS', 'News Category'], type: 'form-table', formTitle: 'Add Category', fields: [{ name: 'name', label: 'Category Name', type: 'text' }], columns: ['Category Name', 'Action'] },
  { path: 'settings/frontend-cms/news-comments/page.js', title: 'News Comments', breadcrumbs: ['Settings', 'Frontend CMS', 'News Comments'], type: 'table', columns: ['Commenter', 'Comment', 'News Title', 'Status', 'Action'] },
  { path: 'settings/frontend-cms/testimonial/page.js', title: 'Testimonial', breadcrumbs: ['Settings', 'Frontend CMS', 'Testimonial'], type: 'form-table', formTitle: 'Add Testimonial', fields: [{ name: 'name', label: 'Name', type: 'text' }, { name: 'designation', label: 'Designation', type: 'text' }], columns: ['Name', 'Designation', 'Action'] },
  { path: 'settings/frontend-cms/course-list/page.js', title: 'Course List', breadcrumbs: ['Settings', 'Frontend CMS', 'Course List'], type: 'form-table', formTitle: 'Add Course', fields: [{ name: 'title', label: 'Course Title', type: 'text' }, { name: 'price', label: 'Price', type: 'number' }], columns: ['Course Title', 'Price', 'Action'] },
  { path: 'settings/frontend-cms/contact-message/page.js', title: 'Contact Message', breadcrumbs: ['Settings', 'Frontend CMS', 'Contact Message'], type: 'table', columns: ['Name', 'Email', 'Subject', 'Message', 'Date', 'Action'] },
  { path: 'settings/frontend-cms/menu/page.js', title: 'Menu CMS', breadcrumbs: ['Settings', 'Frontend CMS', 'Menu'], type: 'form-table', formTitle: 'Add Menu Item', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'link', label: 'Link', type: 'text' }], columns: ['Title', 'Link', 'Action'] },
  { path: 'settings/frontend-cms/pages/page.js', title: 'Pages CMS', breadcrumbs: ['Settings', 'Frontend CMS', 'Pages'], type: 'form-table', formTitle: 'Add Page', fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'slug', label: 'Slug', type: 'text' }], columns: ['Title', 'Slug', 'Action'] },
  { path: 'settings/frontend-cms/course-category/page.js', title: 'Course Category', breadcrumbs: ['Settings', 'Frontend CMS', 'Course Category'], type: 'form-table', formTitle: 'Add Category', fields: [{ name: 'name', label: 'Category Name', type: 'text' }], columns: ['Category Name', 'Action'] },
  // Settings - Fees Settings
  { path: 'settings/fees/fees-invoice-settings/page.js', title: 'Fees Invoice Settings', breadcrumbs: ['Settings', 'Fees Settings', 'Fees Invoice Settings'], type: 'settings', fields: [{ label: 'Invoice Prefix', type: 'text' }, { label: 'Terms & Conditions', type: 'text' }] },

  // Settings - Exam Settings
  { path: 'settings/exam/format-settings/page.js', title: 'Format Settings', breadcrumbs: ['Settings', 'Exam Settings', 'Format Settings'], type: 'settings', fields: [{ label: 'Mark Sheet Format', type: 'text' }, { label: 'Admit Card Format', type: 'text' }] },
  { path: 'settings/exam/setup-exam-rule/page.js', title: 'Setup Exam Rule', breadcrumbs: ['Settings', 'Exam Settings', 'Setup Exam Rule'], type: 'form-table', formTitle: 'Add Exam Rule', fields: [{ name: 'ruleName', label: 'Rule Name', type: 'text' }, { name: 'passMarks', label: 'Pass Marks %', type: 'number' }], columns: ['Rule Name', 'Pass Marks %', 'Action'] },
  { path: 'settings/exam/position/page.js', title: 'Position', breadcrumbs: ['Settings', 'Exam Settings', 'Position'], type: 'table', columns: ['Class', 'Section', 'Student Name', 'Rank', 'GPA'] },
  { path: 'settings/exam/all-exam-position/page.js', title: 'All Exam Position', breadcrumbs: ['Settings', 'Exam Settings', 'All Exam Position'], type: 'table', columns: ['Class', 'Exam Name', 'Student Name', 'Position', 'Total Score'] },
  { path: 'settings/exam/exam-signature-settings/page.js', title: 'Exam Signature Settings', breadcrumbs: ['Settings', 'Exam Settings', 'Exam Signature Settings'], type: 'settings', fields: [{ label: 'Principal Signature Title', type: 'text' }, { label: 'Teacher Signature Title', type: 'text' }] },
  { path: 'settings/exam/admit-card-setting/page.js', title: 'Admit Card Setting', breadcrumbs: ['Settings', 'Exam Settings', 'Admit Card Setting'], type: 'settings', fields: [{ label: 'Show Exam Instructions', type: 'text' }, { label: 'Student Photo Visible', type: 'text' }] },
  { path: 'settings/exam/seat-plan-setting/page.js', title: 'Seat Plan Setting', breadcrumbs: ['Settings', 'Exam Settings', 'Seat Plan Setting'], type: 'settings', fields: [{ label: 'Seats per Bench', type: 'text' }] },

  // Module - Jitsi
  { path: 'module/jitsi/virtual-class/page.js', title: 'Jitsi Virtual Class', breadcrumbs: ['Module', 'Jitsi', 'Virtual Class'], type: 'form-table', formTitle: 'Add Virtual Class', fields: [{ name: 'topic', label: 'Class Topic', type: 'text' }, { name: 'class', label: 'Class', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Class Topic', 'Class', 'Date', 'Action'] },
  { path: 'module/jitsi/virtual-meeting/page.js', title: 'Jitsi Virtual Meeting', breadcrumbs: ['Module', 'Jitsi', 'Virtual Meeting'], type: 'form-table', formTitle: 'Add Meeting', fields: [{ name: 'topic', label: 'Meeting Topic', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Meeting Topic', 'Date', 'Action'] },
  { path: 'module/jitsi/class-reports/page.js', title: 'Jitsi Class Reports', breadcrumbs: ['Module', 'Jitsi', 'Class Reports'], type: 'table', columns: ['Topic', 'Class', 'Date', 'Duration', 'Participants'] },
  { path: 'module/jitsi/meeting-reports/page.js', title: 'Jitsi Meeting Reports', breadcrumbs: ['Module', 'Jitsi', 'Meeting Reports'], type: 'table', columns: ['Topic', 'Host', 'Date', 'Duration', 'Participants'] },
  { path: 'module/jitsi/settings/page.js', title: 'Jitsi Settings', breadcrumbs: ['Module', 'Jitsi', 'Settings'], type: 'settings', fields: [{ label: 'Jitsi Domain', type: 'text' }, { label: 'API Key', type: 'text' }] },

  // Module - Virtual Class
  { path: 'module/virtual-class/virtual-class/page.js', title: 'Virtual Class', breadcrumbs: ['Module', 'Virtual Class', 'Virtual Class'], type: 'form-table', formTitle: 'Add Class', fields: [{ name: 'topic', label: 'Topic', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Topic', 'Date', 'Action'] },
  { path: 'module/virtual-class/virtual-meeting/page.js', title: 'Virtual Meeting', breadcrumbs: ['Module', 'Virtual Class', 'Virtual Meeting'], type: 'form-table', formTitle: 'Add Meeting', fields: [{ name: 'topic', label: 'Topic', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Topic', 'Date', 'Action'] },
  { path: 'module/virtual-class/class-reports/page.js', title: 'Class Reports', breadcrumbs: ['Module', 'Virtual Class', 'Class Reports'], type: 'table', columns: ['Topic', 'Date', 'Participants'] },
  { path: 'module/virtual-class/meeting-reports/page.js', title: 'Meeting Reports', breadcrumbs: ['Module', 'Virtual Class', 'Meeting Reports'], type: 'table', columns: ['Topic', 'Date', 'Participants'] },
  { path: 'module/virtual-class/settings/page.js', title: 'Virtual Class Settings', breadcrumbs: ['Module', 'Virtual Class', 'Settings'], type: 'settings', fields: [{ label: 'Server Secret', type: 'text' }] },

  // Module - BigBlueButton
  { path: 'module/bigbluebutton/virtual-class/page.js', title: 'BBB Virtual Class', breadcrumbs: ['Module', 'BigBlueButton', 'Virtual Class'], type: 'form-table', formTitle: 'Add Class', fields: [{ name: 'topic', label: 'Topic', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Topic', 'Date', 'Action'] },
  { path: 'module/bigbluebutton/virtual-meeting/page.js', title: 'BBB Virtual Meeting', breadcrumbs: ['Module', 'BigBlueButton', 'Virtual Meeting'], type: 'form-table', formTitle: 'Add Meeting', fields: [{ name: 'topic', label: 'Topic', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Topic', 'Date', 'Action'] },
  { path: 'module/bigbluebutton/class-reports/page.js', title: 'BBB Class Reports', breadcrumbs: ['Module', 'BigBlueButton', 'Class Reports'], type: 'table', columns: ['Topic', 'Date', 'Duration'] },
  { path: 'module/bigbluebutton/meeting-reports/page.js', title: 'BBB Meeting Reports', breadcrumbs: ['Module', 'BigBlueButton', 'Meeting Reports'], type: 'table', columns: ['Topic', 'Date', 'Duration'] },
  { path: 'module/bigbluebutton/settings/page.js', title: 'BBB Settings', breadcrumbs: ['Module', 'BigBlueButton', 'Settings'], type: 'settings', fields: [{ label: 'BBB Salt', type: 'text' }, { label: 'BBB Server URL', type: 'text' }] },
  { path: 'module/bigbluebutton/class-record-list/page.js', title: 'BBB Class Record List', breadcrumbs: ['Module', 'BigBlueButton', 'Class Record List'], type: 'table', columns: ['Class Topic', 'Recorded Date', 'Play URL', 'Action'] },
  { path: 'module/bigbluebutton/meeting-record-list/page.js', title: 'BBB Meeting Record List', breadcrumbs: ['Module', 'BigBlueButton', 'Meeting Record List'], type: 'table', columns: ['Meeting Topic', 'Recorded Date', 'Play URL', 'Action'] },

  // Module - Gmeet
  { path: 'module/gmeet/virtual-class/page.js', title: 'Gmeet Virtual Class', breadcrumbs: ['Module', 'Gmeet', 'Virtual Class'], type: 'form-table', formTitle: 'Add Class', fields: [{ name: 'topic', label: 'Topic', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Topic', 'Date', 'Action'] },
  { path: 'module/gmeet/virtual-meeting/page.js', title: 'Gmeet Virtual Meeting', breadcrumbs: ['Module', 'Gmeet', 'Virtual Meeting'], type: 'form-table', formTitle: 'Add Meeting', fields: [{ name: 'topic', label: 'Topic', type: 'text' }, { name: 'date', label: 'Date', type: 'date' }], columns: ['Topic', 'Date', 'Action'] },
  { path: 'module/gmeet/class-reports/page.js', title: 'Gmeet Class Reports', breadcrumbs: ['Module', 'Gmeet', 'Class Reports'], type: 'table', columns: ['Topic', 'Date', 'Duration'] },
  { path: 'module/gmeet/meeting-reports/page.js', title: 'Gmeet Meeting Reports', breadcrumbs: ['Module', 'Gmeet', 'Meeting Reports'], type: 'table', columns: ['Topic', 'Date', 'Duration'] },
  { path: 'module/gmeet/settings/page.js', title: 'Gmeet Settings', breadcrumbs: ['Module', 'Gmeet', 'Settings'], type: 'settings', fields: [{ label: 'Gmeet Client ID', type: 'text' }, { label: 'Client Secret', type: 'text' }] },

  // Module - Registration
  { path: 'module/registration/student-list/page.js', title: 'Registration Student List', breadcrumbs: ['Module', 'Registration', 'Student List'], type: 'table', columns: ['Name', 'Class', 'Date', 'Status', 'Action'] },
  { path: 'module/registration/settings/page.js', title: 'Registration Settings', breadcrumbs: ['Module', 'Registration', 'Settings'], type: 'settings', fields: [{ label: 'Enable Registration', type: 'text' }, { label: 'Terms and Conditions', type: 'text' }] }
];

function generateJSX(p) {
  const breadcrumbLinks = p.breadcrumbs.map((b, idx) => {
    if (idx === p.breadcrumbs.length - 1) {
      return `<span className="text-emerald-500">${b}</span>`;
    }
    return `<Link href="/dashboard" className="hover:text-emerald-400 transition-colors">${b}</Link>`;
  }).join('<ChevronRight className="h-4 w-4 mx-1" />');

  if (p.type === 'report-filter') {
    const tableHeaders = (p.columns || []).map(c => `<th className="px-4 py-3 font-semibold">${c}</th>`).join('');
    return `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ${p.title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">${p.title}</h1>
        <div className="flex items-center text-sm text-zinc-400">
          ${breadcrumbLinks}
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
        <h2 className="text-lg font-semibold text-white">Select Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Search Keywords</Label>
            <Input 
              placeholder="Search..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-white" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class / Group</Label>
            <select 
              value={classFilter} 
              onChange={(e) => setClassFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Classes</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
            </select>
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> SEARCH REPORT
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">${p.title} List</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"><Download className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 text-emerald-500 hover:text-white"><FileText className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 text-rose-500 hover:text-white"><Printer className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">SL</th>
                ${tableHeaders}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr><td colSpan="${(p.columns || []).length + 1}" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="${(p.columns || []).length + 1}" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;
  }

  if (p.type === 'form-table') {
    const formFieldsHTML = (p.fields || []).map(f => {
      if (f.type === 'textarea') {
        return `
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">${f.label}</Label>
            <textarea 
              name="${f.name}"
              value={formData.${f.name} || ''} 
              onChange={handleChange}
              className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" 
            />
          </div>`;
      }
      if (f.type === 'select') {
        const opts = (f.options || []).map(o => `<option value="${o}">${o}</option>`).join('');
        return `
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">${f.label}</Label>
            <select 
              name="${f.name}"
              value={formData.${f.name} || ''} 
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select ${f.label}</option>
              ${opts}
            </select>
          </div>`;
      }
      return `
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-400 uppercase">${f.label}</Label>
          <Input 
            type="${f.type || 'text'}"
            name="${f.name}"
            value={formData.${f.name} || ''} 
            onChange={handleChange}
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500" 
          />
        </div>`;
    }).join('');

    const tableHeaders = (p.columns || []).map(c => `<th className="px-4 py-3 font-semibold">${c}</th>`).join('');

    return `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Edit, Trash2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ${p.title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setRecords(records.map(r => r.id === editId ? { ...r, ...formData } : r));
      setEditId(null);
    } else {
      setRecords([{ id: Date.now(), ...formData }, ...records]);
    }
    setFormData({});
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const cancelEdit = () => {
    setFormData({});
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">${p.title}</h1>
        <div className="flex items-center text-sm text-zinc-400">
          ${breadcrumbLinks}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editId ? 'Edit' : 'Add'} ${p.title}</h2>
              {editId && <button onClick={cancelEdit} className="text-zinc-400 hover:text-white"><X className="h-4 w-4" /></button>}
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              ${formFieldsHTML}
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {editId ? 'UPDATE' : 'SAVE'}
                </Button>
                {editId && (
                  <Button type="button" onClick={cancelEdit} variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">Cancel</Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">${p.title} List</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500 text-white" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">SL</th>
                    ${tableHeaders}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {records.length === 0 ? (
                    <tr><td colSpan="${(p.columns || []).length + 1}" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : records.map((r, i) => (
                    <tr key={r.id} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 text-emerald-500">+{i+1}</td>
                      ${(p.fields || []).map(f => `<td className="px-4 py-3 text-zinc-300">{r.${f.name} || '-'}</td>`).join('')}
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleEdit(r)} variant="ghost" size="sm" className="h-8 text-blue-500 hover:bg-blue-500/10"><Edit className="h-4 w-4" /></Button>
                          <Button onClick={() => handleDelete(r.id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
  }

  // Default fallback component
  const tableHeaders = (p.columns || ['Name', 'Details', 'Status', 'Action']).map(c => `<th className="px-4 py-3 font-semibold">${c}</th>`).join('');
  return `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ${p.title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">${p.title}</h1>
        <div className="flex items-center text-sm text-zinc-400">
          ${breadcrumbLinks}
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">${p.title} Overview</h2>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs text-white" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">SL</th>
                ${tableHeaders}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              <tr><td colSpan="5" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;
}

console.log('Generating missing pages...');

pages.forEach(p => {
  const fullPath = path.join(baseDir, p.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const content = generateJSX(p);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Created: ${p.path}`);
});

console.log('All missing pages generated successfully!');
