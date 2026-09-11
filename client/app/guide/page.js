"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, Calculator, Monitor, GraduationCap, ArrowLeft, 
  CheckCircle2, PlayCircle, Settings2, Users, FileSpreadsheet,
  Clock, BookOpen, Award, CreditCard, BarChart3
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState("admin");

  const guides = {
    admin: {
      title: "Super Admin Workflow",
      badge: "System Setup & Control",
      icon: ShieldCheck,
      description: "The Super Admin is the core controller of the Stoofi ERP. Learn how to configure the system, manage branches, and oversee all operations.",
      sections: [
        {
          title: "1. Basic System Configuration",
          icon: Settings2,
          content: "Start by setting up your school profile in the 'Settings' menu. Upload your school logo, configure academic sessions (e.g., 2026 Jan-Dec), and define global settings like currency and time zone. This is crucial as all reports and invoices will use this data."
        },
        {
          title: "2. Defining Academic Structure",
          icon: BookOpen,
          content: "Before adding students, define the academic structure. Go to 'Academics' -> 'Classes' to create classes. Then, create 'Sections' (e.g., Section A, B) and 'Subjects'. Assign subjects to respective classes so teachers know what to teach."
        },
        {
          title: "3. Onboarding Staff & Teachers",
          icon: Users,
          content: "Navigate to the 'Human Resource' module. First, define 'Departments' (e.g., Science, Admin) and 'Designations' (e.g., Senior Teacher, Accountant). Then, go to 'Add Staff' to create profiles for your employees. Their login credentials will be generated automatically."
        },
        {
          title: "4. Student Enrollment & Import",
          icon: GraduationCap,
          content: "You can add students one by one via 'Student Admission' or use the 'Bulk Import' feature to upload an Excel CSV file. Once admitted, students are assigned an Admission Number which acts as their unique ID throughout the ERP."
        }
      ]
    },
    accountant: {
      title: "Accountant Workflow",
      badge: "Finance & Fee Management",
      icon: Calculator,
      description: "Accountants manage the financial health of the institution. Learn how to generate fee vouchers, collect payments, and track expenses.",
      sections: [
        {
          title: "1. Setting Up Fee Types & Groups",
          icon: Settings2,
          content: "Go to the 'Accounts' module. Create 'Fee Types' (e.g., Tuition Fee, Transport Fee, Lab Fee). Group them into 'Fee Groups' so they can be assigned to classes collectively."
        },
        {
          title: "2. Generating Monthly Fee Invoices",
          icon: FileSpreadsheet,
          content: "Use the 'Fee Invoice' generator. Select a Class and Month, and the system will automatically calculate the total fees for all students in that class, including any previous arrears or applied discounts. Vouchers are generated instantly."
        },
        {
          title: "3. Collecting Payments",
          icon: CreditCard,
          content: "When a student pays, go to 'Collect Fees'. Search by Admission No. or Name. The system shows all pending invoices. You can process full or partial payments, and the system will generate a printable PDF receipt with a 'PAID' stamp."
        },
        {
          title: "4. Managing Expenses & Reporting",
          icon: BarChart3,
          content: "Record daily school expenses (e.g., Electricity, Maintenance) in the 'Expense' module. At the end of the month, generate the 'Profit & Loss Statement' to view total fee collections versus total expenses in a clean, visual report."
        }
      ]
    },
    teacher: {
      title: "Teacher Workflow",
      badge: "Academic Management",
      icon: Monitor,
      description: "Teachers use the portal to manage daily classroom activities, attendance, homework, and exams.",
      sections: [
        {
          title: "1. Taking Daily Attendance",
          icon: Clock,
          content: "Log into the Teacher Portal and go to 'Attendance'. Select your assigned class. The system lists all students. Simply mark absent/late students. Once submitted, an automatic SMS alert is instantly sent to the parents of absent students."
        },
        {
          title: "2. Assigning Homework & Study Material",
          icon: BookOpen,
          content: "Use the 'Homework' module to assign daily tasks. You can attach PDF notes, images, or links. Students and parents will instantly see this homework on their respective portals with the submission deadline."
        },
        {
          title: "3. Creating Online Exams",
          icon: ShieldCheck,
          content: "Go to 'Online Exams'. Build a question bank (MCQs or Descriptive). Create a new exam, select questions, set a time limit, and publish it. Students will take the test online, and objective questions are graded automatically."
        },
        {
          title: "4. Grading & Report Cards",
          icon: Award,
          content: "For offline exams, enter the subjective marks into the 'Marks Register'. The ERP automatically calculates percentages, assigns grades based on your grading scale, and determines the student's position in class. Report cards are generated in one click."
        }
      ]
    },
    student: {
      title: "Student & Parent Workflow",
      badge: "Portal Experience",
      icon: GraduationCap,
      description: "Students and parents stay updated with real-time access to academics, fees, and attendance.",
      sections: [
        {
          title: "1. Real-time Attendance Tracking",
          icon: Clock,
          content: "Parents can log in to view a calendar of their child's attendance. Green days indicate present, red indicate absent. The overall attendance percentage is shown prominently on the dashboard."
        },
        {
          title: "2. Viewing & Submitting Homework",
          icon: BookOpen,
          content: "Students can view pending homework assignments from all subjects. They can download attached study materials, complete the work, and even upload their completed assignments back to the teacher for grading."
        },
        {
          title: "3. Downloading Fee Vouchers & Receipts",
          icon: CreditCard,
          content: "Parents no longer need to wait for printed slips. They can view due invoices, download PDF fee vouchers to pay at the bank, or view digital receipts for past payments directly from their portal."
        },
        {
          title: "4. Result Cards & Progress Graphs",
          icon: Award,
          content: "Once teachers publish results, students and parents can view detailed subject-wise marks. The portal provides visual progress graphs comparing current term performance with previous terms to track academic growth."
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-poppins selection:bg-zinc-600 selection:text-white transition-colors duration-300">
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-emerald-400 transition-colors">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-100 dark:group-hover:bg-emerald-950/50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="font-bold text-sm hidden sm:block">Back to Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button className="bg-zinc-800 hover:bg-zinc-800 text-white font-bold rounded-full px-6">Login to ERP</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block py-1.5 px-4 rounded-full bg-zinc-200 dark:bg-emerald-900/30 text-zinc-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            Comprehensive User Guide
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6">
            How to Use Stoofi ERP
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Everything you need to know to get your school running smoothly. Select a role below to see exactly how the platform works for them.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {Object.entries(guides).map(([key, guide]) => {
            const Icon = guide.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-xl shadow-zinc-800/20 scale-105"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-600 hover:text-zinc-800 dark:hover:text-emerald-400"
                }`}
              >
                <Icon size={24} className={isActive ? "text-white" : ""} />
                <div className="text-left">
                  <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${isActive ? "text-zinc-200" : "text-zinc-400"}`}>
                    {guide.badge}
                  </div>
                  <div className="text-sm">{guide.title}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Guide Content */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row gap-12">
            
            <div className="md:w-1/3">
              <div className="sticky top-28">
                <div className="w-16 h-16 rounded-2xl bg-zinc-200 dark:bg-emerald-900/40 flex items-center justify-center text-zinc-800 dark:text-emerald-400 mb-6">
                  {(() => {
                    const ActiveIcon = guides[activeTab].icon;
                    return <ActiveIcon size={32} />;
                  })()}
                </div>
                <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-4">
                  {guides[activeTab].title}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                  {guides[activeTab].description}
                </p>
                
                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    <PlayCircle size={18} className="text-zinc-600" /> Quick Tips
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 size={16} className="text-zinc-600 shrink-0 mt-0.5" />
                      Keep your login credentials secure.
                    </li>
                    <li className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 size={16} className="text-zinc-600 shrink-0 mt-0.5" />
                      Use the search bar to find records quickly.
                    </li>
                    <li className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 size={16} className="text-zinc-600 shrink-0 mt-0.5" />
                      Contact Super Admin for permission issues.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="space-y-8">
                {guides[activeTab].sections.map((section, idx) => (
                  <div key={idx} className="relative pl-10 md:pl-14">
                    {/* Timeline Line */}
                    {idx !== guides[activeTab].sections.length - 1 && (
                      <div className="absolute left-4 md:left-6 top-10 bottom-[-2rem] w-px bg-zinc-200 dark:bg-zinc-800"></div>
                    )}
                    
                    {/* Number / Icon Badge */}
                    <div className="absolute left-0 md:left-2 top-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-600 flex items-center justify-center text-zinc-800 dark:text-emerald-400 shadow-sm z-10">
                      <section.icon size={16} />
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-600/30 transition-colors">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                        {section.title}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
                        {section.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 pt-10 border-t border-zinc-200 dark:border-zinc-800 text-center">
                <h4 className="font-bold text-zinc-900 dark:text-white mb-4">Ready to put this into action?</h4>
                <Link href="/login">
                  <Button className="bg-zinc-800 hover:bg-zinc-800 text-white font-bold rounded-full px-8 h-12 shadow-lg shadow-zinc-800/20">
                    Open {guides[activeTab].title}
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
