"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const guideData = {
  "fee-management": {
    title: "Comprehensive Fee Management",
    subtitle: "Collect fees, manage invoices, apply discounts and print receipts",
    icon: "💳",
    color: "emerald",
    overview: "The Fee Management module is the financial backbone of eSkooly ERP. It lets you create fee structures, generate monthly invoices for entire classes in one click, collect payments, and maintain a full audit trail — all without any manual calculation.",
    steps: [
      {
        step: "1",
        title: "Set Up Fee Types",
        desc: "Go to Accounts → Fee Type. Create all the fees your school charges: Tuition Fee, Transport Fee, Lab Fee, Book Fee, etc. Give each a clear name so parents can identify them on their invoices.",
        tip: "You can create as many fee types as needed. Keep names concise."
      },
      {
        step: "2",
        title: "Create Fee Groups",
        desc: "Go to Accounts → Fee Group. A fee group bundles multiple fee types together. For example, 'Primary Class Package' might include Tuition + Book + Activity fees. You will assign this group to classes.",
        tip: "Different classes often have different fee packages — create a group for each."
      },
      {
        step: "3",
        title: "Assign Fee Groups to Classes",
        desc: "Go to Accounts → Assign Fee. Select a class and assign the matching fee group. From now on, whenever you generate an invoice for that class, the correct fees are automatically calculated.",
        tip: "This saves hours — you never manually calculate a fee again."
      },
      {
        step: "4",
        title: "Generate Monthly Invoices",
        desc: "Go to Accounts → Fee Invoice. Select the class and month. Click Generate. The system instantly creates invoices for every student in that class, including any previous arrears or active discounts.",
        tip: "You can generate invoices in bulk for all classes at once."
      },
      {
        step: "5",
        title: "Collect Payments",
        desc: "Go to Accounts → Collect Fee. Search a student by name or admission number. The system shows all their pending invoices. Select which invoice(s) to pay, enter the amount, and click Collect. A printed receipt is generated instantly.",
        tip: "Partial payment is supported — you can collect whatever the parent brings."
      },
      {
        step: "6",
        title: "Apply Discounts",
        desc: "Go to Accounts → Discount. Assign percentage or fixed-amount discounts to specific students. The discount is automatically applied to their next invoice generation.",
        tip: "Sibling discounts, scholarship waivers — all configurable here."
      }
    ],
    warnings: [
      "Always assign fee groups to classes BEFORE generating invoices, otherwise invoices will be empty.",
      "Editing a paid invoice is not recommended — it may affect the student's payment history."
    ],
    tips: [
      "Use the 'Due Fee Report' to see all students with outstanding balances at a glance.",
      "The system auto-carries forward unpaid amounts to the next month as 'Arrears'.",
      "Fee receipts can be printed directly from the payment confirmation screen."
    ]
  },

  "attendance": {
    title: "Smart Attendance System",
    subtitle: "1-tap attendance with instant SMS alerts to parents",
    icon: "⏰",
    color: "sky",
    overview: "The Attendance module allows teachers to mark student attendance in under 30 seconds for an entire class. The moment a student is marked Absent or Late, an automated SMS is sent to their parent's registered mobile number — no manual effort required.",
    steps: [
      {
        step: "1",
        title: "Configure SMS Gateway (Admin)",
        desc: "Super Admin goes to Settings → SMS Settings. Enter your SMS gateway API credentials (e.g., Twilio, BulkSMS, or local Pakistan SMS APIs). This is a one-time setup done at the start.",
        tip: "Pakistan-based SMS gateways like Zong Business or Ufone SMS are natively supported."
      },
      {
        step: "2",
        title: "Ensure Student Parent Phone Numbers Are Saved",
        desc: "When admitting a student, make sure the Father's or Mother's phone number is saved under Student Info → Parents & Guardian Info. This is the number that receives the SMS alert.",
        tip: "You can update parent numbers anytime from the Student List → Edit Student page."
      },
      {
        step: "3",
        title: "Teacher Logs In",
        desc: "The teacher logs into their portal using the credentials provided by the Super Admin. They will see their assigned classes on the dashboard.",
        tip: "Teachers can log in on any device — mobile browser, tablet, or desktop."
      },
      {
        step: "4",
        title: "Open Attendance for Today",
        desc: "Go to Attendance → Student Attendance. Select the class and date (defaults to today). The system loads all students in that class automatically.",
        tip: "The class list is pre-loaded — you never type student names manually."
      },
      {
        step: "5",
        title: "Mark Attendance",
        desc: "For each student, click their status: Present (P), Absent (A), Late (L), or Half Day (H). When you mark Absent or Late, the SMS is queued instantly. Submit the attendance when done.",
        tip: "You can mark 'All Present' first, then only change the few who are absent — saves time."
      },
      {
        step: "6",
        title: "View Attendance Reports",
        desc: "Go to Attendance → Attendance Report. Filter by class, date range, or student name. Generate a full monthly attendance register or individual student report.",
        tip: "Parents can also view their child's attendance history from their own portal."
      }
    ],
    warnings: [
      "SMS will not send if the parent phone number is not saved on the student profile.",
      "Attendance once submitted for the day can be edited but changes log the editing teacher's name."
    ],
    tips: [
      "You can see total Present / Absent / Late counts at the bottom of the attendance screen.",
      "Export attendance report as Excel or PDF for official school records.",
      "Student portal shows a visual calendar with green/red days."
    ]
  },

  "exam-results": {
    title: "Advanced Exam & Results",
    subtitle: "Manage exams, enter marks, and auto-generate report cards",
    icon: "🏆",
    color: "amber",
    overview: "The Exam module handles everything from scheduling exams to printing final report cards. Subjects, classes, grading scales, and marks registers are all managed here. Report cards can be printed with your school logo and custom design in one click.",
    steps: [
      {
        step: "1",
        title: "Create Exam (Schedule)",
        desc: "Go to Exams → Exam. Create a new exam event (e.g., 'Mid Term 2026'). Select which classes it applies to. Assign exam dates for each subject.",
        tip: "You can run multiple exam schedules simultaneously for different classes."
      },
      {
        step: "2",
        title: "Set Grading Scale",
        desc: "Go to Settings → Grade System. Define your grading scale: e.g., 90-100 = A+, 80-89 = A, 70-79 = B, etc. The system uses this to auto-calculate grades once marks are entered.",
        tip: "Pakistani schools typically use a 100-mark scale — this is the default setting."
      },
      {
        step: "3",
        title: "Enter Marks (Marks Register)",
        desc: "Go to Exams → Marks Register. Select class, subject, and exam. A list of all students appears. Enter each student's obtained marks. The system auto-calculates percentage and grade.",
        tip: "You can import marks from Excel if you already have them in a spreadsheet."
      },
      {
        step: "4",
        title: "Tabulation Sheet (Class Results)",
        desc: "After all subjects are entered, go to Exams → Tabulation Sheet. This shows a full class-wise marks sheet with subject totals, percentage, grade, and class position/rank for every student.",
        tip: "The rank is calculated automatically based on total marks."
      },
      {
        step: "5",
        title: "Generate Report Cards",
        desc: "Go to Exams → Report Card. Select class and exam. Click Print/Generate. Individual student report cards are generated with subject-wise marks, grade, position, and attendance percentage.",
        tip: "Report cards can be downloaded as PDF or bulk-printed for the entire class."
      },
      {
        step: "6",
        title: "Publish Results to Student Portal",
        desc: "Once results are finalized, click 'Publish'. Students and parents can now see the full result card from their portal — no need for physical result slips.",
        tip: "Parents receive an SMS notification when results are published."
      }
    ],
    warnings: [
      "Results cannot be published until all subjects have marks entered.",
      "Once published, marks can still be corrected by the Super Admin if a mistake is found."
    ],
    tips: [
      "Use the class position feature to identify top performers for merit certificates.",
      "Marks Register shows all previous exams too — you can compare student progress across terms.",
      "Failed students can be highlighted automatically based on minimum passing marks."
    ]
  },

  "lms-elearning": {
    title: "LMS & Online E-Learning",
    subtitle: "Homework, study notes, online exams and syllabus management",
    icon: "📚",
    color: "violet",
    overview: "The Learning Management System (LMS) transforms eSkooly into a complete digital classroom. Teachers can share study material, assign and grade homework digitally, manage the class syllabus, and conduct full online examinations — all within the platform.",
    steps: [
      {
        step: "1",
        title: "Upload Study Material",
        desc: "Go to Study Material → Add Material. Select the class and subject, write a title, and upload your file (PDF, Word, PowerPoint, images). Students see this material instantly on their portal.",
        tip: "Organize materials by chapter or topic for easy navigation."
      },
      {
        step: "2",
        title: "Assign Homework",
        desc: "Go to Homework → Add Homework. Select class, subject, and due date. Write the homework description and optionally attach a file. Students and parents see it immediately with a countdown to the deadline.",
        tip: "Teachers can also mark homework as 'urgent' to highlight it on the student portal."
      },
      {
        step: "3",
        title: "Manage Syllabus",
        desc: "Go to LMS → Syllabus. Create a chapter-by-chapter syllabus for each subject. Mark chapters as 'Covered' as you teach them. Parents can see real-time syllabus progress.",
        tip: "This helps keep parents informed about what has been taught and what is upcoming."
      },
      {
        step: "4",
        title: "Create Question Bank",
        desc: "Go to Online Exam → Question Bank. Add MCQ questions for each subject. For each question, enter the question text, 4 options (A, B, C, D), and mark the correct answer.",
        tip: "Build your question bank gradually — it grows over time and reuses across exams."
      },
      {
        step: "5",
        title: "Create & Publish Online Exam",
        desc: "Go to Online Exam → Create Exam. Select a class, subject, question bank. Set the time limit. Set start and end date/time for the exam window. Click Publish — students can now take the test.",
        tip: "Set a tight exam window (e.g., 1 hour slot) to prevent sharing of answers."
      },
      {
        step: "6",
        title: "View Auto-Graded Results",
        desc: "After the exam window closes, go to Online Exam → Results. MCQ results are 100% auto-graded. See each student's score, time taken, and answers. Descriptive questions can be manually reviewed.",
        tip: "Export results as a PDF report card for your records."
      }
    ],
    warnings: [
      "Online exams are timed — once a student starts, the timer cannot be paused.",
      "Always test the exam from a student account before publishing to the full class."
    ],
    tips: [
      "Combine LMS + Homework + Online Exams for a fully paperless classroom experience.",
      "Use question bank categories to quickly build subject-specific exams.",
      "Students can download uploaded study material files for offline studying."
    ]
  },

  "hr-payroll": {
    title: "HR & Payroll Administration",
    subtitle: "Manage staff, leave, attendance, and auto-generate salary slips",
    icon: "👥",
    color: "rose",
    overview: "The HR & Payroll module handles the complete employee lifecycle. From hiring and attendance to leave management and monthly salary processing — everything runs automatically. Salary slips can be generated in PDF format with a single click.",
    steps: [
      {
        step: "1",
        title: "Define Departments & Designations",
        desc: "Go to HR → Department. Create your school's departments (e.g., Academic, Admin, Finance). Then go to HR → Designation and create job titles (e.g., Senior Teacher, Accountant, Peon).",
        tip: "These are used throughout the HR module for filtering and reporting."
      },
      {
        step: "2",
        title: "Add Staff Members",
        desc: "Go to HR → Add Staff. Fill in the employee's personal info, assign their Department and Designation, set their joining date and basic salary. A login account is created for them automatically.",
        tip: "Upload a profile photo for each staff member for a professional staff directory."
      },
      {
        step: "3",
        title: "Track Staff Attendance",
        desc: "Go to HR → Staff Attendance. Mark each staff member as Present, Absent, Late, or Half Day for each day. This data feeds directly into the payroll calculation at month end.",
        tip: "You can mark attendance for all staff at once using the bulk attendance feature."
      },
      {
        step: "4",
        title: "Manage Leave Requests",
        desc: "Staff members can apply for leave from their portal. Go to Leave → Approve Leave Request to review and approve or reject. Approved leaves are automatically deducted from attendance.",
        tip: "Set maximum allowed leave days per type in Leave → Leave Type."
      },
      {
        step: "5",
        title: "Process Monthly Payroll",
        desc: "Go to HR → Payroll. Select the staff member, month, and year. Enter the basic salary, allowances, and deductions. The system auto-calculates Net Salary = Basic + Allowances - Deductions. Save the payroll record.",
        tip: "You can process payroll for all staff members in one session at month end."
      },
      {
        step: "6",
        title: "Generate & Print Salary Slips",
        desc: "Once payroll is processed, go to HR → Salary Slip. Select an employee and month. Click Print/Download. A professional PDF salary slip is generated with the school letterhead, salary breakdown, and signature line.",
        tip: "Staff can also view and download their own salary slips from their personal portal."
      }
    ],
    warnings: [
      "Payroll calculations depend on accurate attendance — mark attendance daily.",
      "Salary records are permanent — double-check all amounts before finalizing."
    ],
    tips: [
      "Use the Staff Directory for a quick view of all employees with photos and contact info.",
      "Set up allowance types (e.g., Transport, Medical) to include them consistently each month.",
      "Pending leave requests show on your dashboard as notifications."
    ]
  },

  "financial-accounting": {
    title: "Live Financial Accounting",
    subtitle: "Track income, expenses and generate Profit & Loss reports",
    icon: "📊",
    color: "emerald",
    overview: "The Financial Accounting module gives the school management a real-time view of all money coming in and going out. Every fee collected automatically enters the income register. Expenses are tracked manually. A live Profit & Loss statement is always available.",
    steps: [
      {
        step: "1",
        title: "Understand Income Sources",
        desc: "Income in eSkooly comes automatically from fee collections. Every time a fee is collected via Accounts → Collect Fee, that amount is recorded in the income ledger under the appropriate fee type.",
        tip: "You do not need to manually enter fee income — it's 100% automated."
      },
      {
        step: "2",
        title: "Record School Expenses",
        desc: "Go to Accounts → Expense. Click Add Expense. Select the expense category (e.g., Utilities, Salaries, Maintenance), enter the amount, date, and a short description. Save it.",
        tip: "Record expenses as they happen — daily entry keeps your P&L report accurate."
      },
      {
        step: "3",
        title: "Manage Expense Categories",
        desc: "Go to Accounts → Expense Category. Create categories like: Electricity Bill, Internet, Rent, Cleaning Supplies, Teaching Aids. This organizes your expenses for cleaner reporting.",
        tip: "Use specific category names — vague names make reports hard to analyze."
      },
      {
        step: "4",
        title: "View Income vs Expense Report",
        desc: "Go to Reports → Income vs Expense. Select a date range (daily, monthly, or custom). The system generates a visual chart and table showing total income, total expenses, and net profit/loss.",
        tip: "Run this report at end of month to present a financial summary to school management."
      },
      {
        step: "5",
        title: "Check Due Fees (Outstanding)",
        desc: "Go to Accounts → Due Fee Report. This shows all students who have unpaid invoices. Filter by class or date. Use this to follow up with parents about overdue fees.",
        tip: "You can send bulk SMS reminders to all students with outstanding dues."
      },
      {
        step: "6",
        title: "Generate Balance Sheet",
        desc: "Go to Reports → Balance Sheet. This provides a formal accounting summary of assets (collected fees), liabilities (pending dues), and school equity. Useful for annual audits or management reviews.",
        tip: "Export the balance sheet as PDF for your accountant or annual audit records."
      }
    ],
    warnings: [
      "Expenses must be entered manually — the system cannot auto-detect physical spending.",
      "Deleting a fee payment record will affect the student's financial history and P&L accuracy."
    ],
    tips: [
      "Run the Profit & Loss report weekly to stay on top of the school's financial health.",
      "Categorize all expenses from day 1 — retroactive categorization is difficult.",
      "The dashboard shows live today's income — check it every morning."
    ]
  },

  "multi-branch": {
    title: "Multi-Branch Central Control",
    subtitle: "Manage multiple school campuses from one Super Admin account",
    icon: "🌐",
    color: "blue",
    overview: "If your school operates multiple campuses or branches, eSkooly lets you manage all of them from a single Super Admin account. Each branch has its own students, staff, fees, and data — but you can compare and consolidate everything from the central dashboard.",
    steps: [
      {
        step: "1",
        title: "Add School Branches",
        desc: "Go to Settings → Branch. Click Add Branch. Enter the branch name, address, contact number, and assign a Branch Admin. Each branch gets its own isolated data environment.",
        tip: "You can add unlimited branches — ideal for large school networks."
      },
      {
        step: "2",
        title: "Assign Branch Admins",
        desc: "Create a staff account for the Branch Manager. Go to Roles → Role and create a 'Branch Admin' role. Assign the specific branch to this user. They will only see and manage their own branch.",
        tip: "Branch Admins cannot access other branches' data — data security is maintained."
      },
      {
        step: "3",
        title: "Manage Each Branch",
        desc: "When logging in as Super Admin, switch between branches using the Branch Selector in the top navigation bar. All data (students, staff, fees) shown will be for the selected branch.",
        tip: "Switching branches is instant — no need to log out and back in."
      },
      {
        step: "4",
        title: "Compare Branch Performance",
        desc: "Go to Reports → Multi-Branch Report. See side-by-side comparisons of student enrollment, fee collection, attendance rates, and exam performance across all branches.",
        tip: "Use this to identify which branch needs more attention or resources."
      },
      {
        step: "5",
        title: "Standardize Settings Across Branches",
        desc: "Fee structures, exam formats, and grading scales can be set globally from the Super Admin and applied to all branches. This ensures consistency across campuses.",
        tip: "Individual branches can still have minor customizations if needed."
      },
      {
        step: "6",
        title: "Student Transfer Between Branches",
        desc: "Go to Student Info → Transfer Student. Select the student and the destination branch. All their academic history, attendance, and fee records transfer with them automatically.",
        tip: "Transferred students retain their admission number to maintain data continuity."
      }
    ],
    warnings: [
      "Never delete a branch if it has active students — archive it instead.",
      "Branch Admin accounts should have strong passwords as they hold sensitive branch data."
    ],
    tips: [
      "Use the multi-branch dashboard widget for a live snapshot of all campuses at once.",
      "Report cards can show the specific branch name and address automatically.",
      "SMS and notifications are branch-specific — a parent in Branch A won't get messages from Branch B."
    ]
  },

  "communication": {
    title: "Automated Communication",
    subtitle: "Send bulk SMS and email alerts to parents and staff",
    icon: "🔔",
    color: "orange",
    overview: "eSkooly has a powerful built-in communication engine. You can send instant or scheduled SMS messages to parents, staff, or both. Automated triggers (fee due, exam result, attendance) send messages without any manual action — the system does it for you.",
    steps: [
      {
        step: "1",
        title: "Set Up SMS Gateway (Once)",
        desc: "Go to Settings → SMS Settings. Enter your SMS API key from your provider (e.g., Twilio, Jazz Business SMS, etc.). Test the connection with a sample message. You only do this once.",
        tip: "Jazz and Telenor have business SMS APIs commonly used by Pakistani schools."
      },
      {
        step: "2",
        title: "Automatic Attendance SMS",
        desc: "Once the gateway is set, attendance SMS works automatically. When a teacher marks a student absent, the system sends a real-time SMS to the parent: 'Your child [Name] was absent today [Date].'",
        tip: "No action needed from you after setup — it's 100% automatic."
      },
      {
        step: "3",
        title: "Send Fee Reminder SMS",
        desc: "Go to Accounts → Send Fee SMS. Select the class or individual students with due fees. Click Send Reminder. A customizable message is sent to all selected parents with the due amount.",
        tip: "Sending reminders reduces late fee collection significantly."
      },
      {
        step: "4",
        title: "Send Bulk Custom SMS",
        desc: "Go to SMS → Send SMS. Select recipients (All Students, Specific Class, All Staff, or individual numbers). Type your custom message. Click Send. Useful for holiday announcements, meeting notices, emergencies.",
        tip: "Save message templates for recurring messages (e.g., exam schedule reminders)."
      },
      {
        step: "5",
        title: "Result & Event Notifications",
        desc: "When exam results are published or a school event is created, the system automatically sends notification SMS to relevant parents. You can customize the message template in Settings → SMS Templates.",
        tip: "Personalize messages with student name, class, and school name using template variables."
      },
      {
        step: "6",
        title: "View SMS Logs",
        desc: "Go to SMS → SMS Logs. See every message sent — the recipient, content, timestamp, and delivery status (Delivered / Failed). Use this to track communication and debug delivery issues.",
        tip: "Failed SMS usually means the parent number is incorrect — update it in student profile."
      }
    ],
    warnings: [
      "SMS charges apply based on your gateway plan — monitor usage to avoid unexpected bills.",
      "Always get parent consent to send promotional/announcement SMS per Pakistan PEMRA regulations."
    ],
    tips: [
      "Keep all parent phone numbers up to date — outdated numbers mean missed alerts.",
      "WhatsApp Business API integration is also available via the eSkooly add-on module.",
      "Use the SMS balance widget on the dashboard to monitor remaining SMS credits."
    ]
  },

  "security": {
    title: "Role-Based Access Security",
    subtitle: "Control who can see and do what in the ERP system",
    icon: "🛡️",
    color: "red",
    overview: "eSkooly uses a strict Role-Based Access Control (RBAC) system. Every user is assigned a role (Super Admin, Accountant, Teacher, Student, Parent). Each role can only access the parts of the system they need — protecting sensitive data and preventing unauthorized actions.",
    steps: [
      {
        step: "1",
        title: "Understanding Default Roles",
        desc: "eSkooly comes with built-in roles: Super Admin (full access), Accountant (finance only), Teacher (academics only), Student (own portal only), Parent (child's data only). Each role has pre-configured permissions.",
        tip: "Most schools can operate with just these 5 default roles."
      },
      {
        step: "2",
        title: "Create Custom Roles",
        desc: "Go to Roles → Role. Click Add Role. Name your custom role (e.g., 'Librarian', 'Transport Manager'). Save it. Then go to Roles → Permissions and select exactly which modules and actions this role can access.",
        tip: "Custom roles are useful for specialized staff with unique responsibilities."
      },
      {
        step: "3",
        title: "Assign Roles to Users",
        desc: "When creating a staff account in HR → Add Staff, select their role from the dropdown. Their login will automatically be restricted to only the modules allowed for that role.",
        tip: "You can change a user's role at any time without creating a new account."
      },
      {
        step: "4",
        title: "Set Login Permissions",
        desc: "Go to Roles → Login Permission. Enable or disable login for specific roles. For example, if you want to prevent students from logging in during exam preparation period, disable the Student role login here.",
        tip: "This is a quick school-wide toggle — no need to disable individual accounts."
      },
      {
        step: "5",
        title: "Due Fees Login Control",
        desc: "Go to Roles → Due Fees Login Permission. If enabled for a role, users with that role (e.g., Students) cannot log in if they have overdue fees. This acts as a strong nudge for fee collection.",
        tip: "Commonly used by schools to ensure fees are paid before accessing portals."
      },
      {
        step: "6",
        title: "Monitor User Activity",
        desc: "Go to Settings → Activity Log. See a chronological log of who logged in, what they viewed, and what changes they made. This audit trail is essential for security compliance.",
        tip: "Review activity logs periodically to detect unusual access patterns."
      }
    ],
    warnings: [
      "Never share the Super Admin login credentials — this account has unrestricted access.",
      "Disable accounts of staff who have left the school immediately to prevent unauthorized access."
    ],
    tips: [
      "Use strong passwords (minimum 8 characters with numbers and symbols) for all accounts.",
      "Enable 2-factor authentication from Settings → Security if your SMS gateway supports it.",
      "The Super Admin can reset any user's password from the Users Management section."
    ]
  }
};

export default function GuideDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const guide = guideData[slug];

  if (!guide) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Guide Not Found</h1>
          <p className="text-zinc-500 mb-6">This guide page doesn&apos;t exist yet.</p>
          <Link href="/guide">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Back to Guides</Button>
          </Link>
        </div>
      </div>
    );
  }

  const colorMap = {
    emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-600", border: "border-emerald-500" },
    sky: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-600 dark:text-sky-400", badge: "bg-sky-600", border: "border-sky-500" },
    amber: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-600", border: "border-amber-500" },
    violet: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", badge: "bg-violet-600", border: "border-violet-500" },
    rose: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400", badge: "bg-rose-600", border: "border-rose-500" },
    blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", badge: "bg-blue-600", border: "border-blue-500" },
    orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-600", border: "border-orange-500" },
    red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", badge: "bg-red-600", border: "border-red-500" },
  };
  const c = colorMap[guide.color] || colorMap.emerald;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-poppins">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/guide" className="flex items-center gap-2 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                <ArrowLeft size={16} />
              </div>
              <span className="text-sm font-semibold hidden sm:block">All Guides</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">{guide.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full px-5 text-sm">Login to ERP</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12">
          <div className={`w-20 h-20 rounded-3xl ${c.bg} flex items-center justify-center text-4xl mb-6`}>
            {guide.icon}
          </div>
          <div className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white ${c.badge} mb-4`}>
            Feature Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-3">
            {guide.title}
          </h1>
          <p className={`text-lg font-semibold ${c.text} mb-4`}>{guide.subtitle}</p>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl text-base">
            {guide.overview}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Steps — takes 2/3 */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <span className={`w-1 h-6 rounded-full ${c.badge}`}></span>
              Step-by-Step Instructions
            </h2>
            <div className="space-y-6">
              {guide.steps.map((step, idx) => (
                <div key={idx} className="relative flex gap-5">
                  {/* Timeline connector */}
                  {idx < guide.steps.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-[-1.5rem] w-px bg-zinc-200 dark:bg-zinc-800"></div>
                  )}
                  {/* Step number */}
                  <div className={`w-10 h-10 rounded-full ${c.badge} text-white font-extrabold text-sm flex items-center justify-center shrink-0 z-10 shadow-lg`}>
                    {step.step}
                  </div>
                  <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-base">{step.title}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-3">{step.desc}</p>
                    {step.tip && (
                      <div className="flex gap-2 items-start bg-zinc-50 dark:bg-zinc-950 rounded-xl px-3 py-2 border border-zinc-200 dark:border-zinc-800">
                        <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{step.tip}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar — Tips & Warnings */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" /> Pro Tips
              </h3>
              <ul className="space-y-3">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="text-emerald-500 font-bold shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-6">
              <h3 className="font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                <AlertCircle size={18} /> Important Warnings
              </h3>
              <ul className="space-y-3">
                {guide.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2 text-sm text-red-600 dark:text-red-400">
                    <span className="font-bold shrink-0">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Ready to use this feature?</p>
              <Link href="/login">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
                  Open ERP Dashboard <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
