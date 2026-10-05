const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');
const Attendance = require('../models/Attendance');
const StaffAttendance = require('../models/StaffAttendance');
const Homework = require('../models/Homework');
const FeesInvoice = require('../models/FeesInvoice');
const MarksRegister = require('../models/MarksRegister');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');

// ─────────────────────────────────────────────────────────────
// OpenAI / Gemini Function Tools Schema Definitions
// ─────────────────────────────────────────────────────────────
const AI_TOOLS_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'get_my_profile',
      description: 'Get profile details and account information of the currently authenticated user.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_my_attendance',
      description: 'Get attendance records, summary statistics, and percentage for the current user. Supports time filtering such as this_month, last_month, this_week, today, all.',
      parameters: {
        type: 'object',
        properties: {
          timeframe: { 
            type: 'string', 
            enum: ['all', 'today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month'],
            description: 'Timeframe filter for attendance'
          },
          status: {
            type: 'string',
            enum: ['all', 'Present', 'Absent', 'Late', 'Half Day'],
            description: 'Filter by specific attendance status'
          },
          limit: { type: 'number', description: 'Number of recent records to return (default: 15)' }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_my_homework',
      description: 'Get homework assignments for the student or homework created by the teacher. Supports subject filtering and status filtering.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Subject name to filter (e.g. Mathematics, Science, English)' },
          status: { type: 'string', enum: ['all', 'pending', 'completed'], description: 'Filter homework status' }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_my_fees',
      description: 'Get tuition fee invoices, balance dues, payment status, and vouchers for the current student.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_my_marks',
      description: 'Get exam marks, report cards, grades, and GPA for the current student.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Optional subject filter' }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_school_statistics',
      description: 'Get overall school statistics (total students, teachers, staff, classes, fee collection). ONLY authorized for Admin and Super Admin.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_class_students',
      description: 'Get list of students in a specific class and section. ONLY authorized for Teachers and Administrators.',
      parameters: {
        type: 'object',
        properties: {
          className: { type: 'string', description: 'Name of the class, e.g. "Class 10" or "Class 9"' },
          section: { type: 'string', description: 'Optional section, e.g. "A" or "B"' }
        },
        required: ['className']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_notifications_and_notices',
      description: 'Get recent school notice board circulars and personal system notifications.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of items to fetch (default: 5)' }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_events',
      description: 'Get upcoming school events and calendar activities.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to_page',
      description: 'Trigger a safe page navigation in the Stoofi web app to jump directly to a feature or section.',
      parameters: {
        type: 'object',
        properties: {
          target: { 
            type: 'string', 
            enum: [
              'dashboard', 'homework', 'attendance', 'students', 'add_student',
              'teachers', 'fees', 'fees_invoice', 'profile', 'classes', 
              'sections', 'subjects', 'notice_board', 'events', 'settings',
              'lms_courses', 'download_center', 'exam_marks'
            ],
            description: 'The target module or feature to open'
          }
        },
        required: ['target']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_homework',
      description: 'Create a new homework assignment for a class. ONLY authorized for Teachers and Administrators.',
      parameters: {
        type: 'object',
        properties: {
          className: { type: 'string', description: 'Target class name (e.g. "Class 9")' },
          section: { type: 'string', description: 'Target section (e.g. "A" or "All")' },
          subject: { type: 'string', description: 'Subject name (e.g. "Mathematics")' },
          submissionDate: { type: 'string', description: 'Submission deadline date YYYY-MM-DD' },
          marks: { type: 'number', description: 'Total marks (default: 100)' },
          description: { type: 'string', description: 'Homework instructions or questions' }
        },
        required: ['className', 'subject', 'description']
      }
    }
  }
];

// ─────────────────────────────────────────────────────────────
// System Prompt Generator with Language Mirroring & Strict Rules
// ─────────────────────────────────────────────────────────────
function getStoofiSystemPrompt(user) {
  const role = user?.role || 'User';
  const name = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'User';
  const email = user?.email || '';

  return `You are Stoofi AI, the intelligent, natural assistant for the Stoofi school management ERP platform (https://stoofi.vercel.app).

CURRENT AUTHENTICATED USER CONTEXT:
- Name: ${name}
- Email: ${email}
- Role: ${role}
- User ID: ${user?._id || 'unknown'}

CRITICAL BEHAVIORAL & LANGUAGE RULES:
1. NATURAL CONVERSATIONAL AGENT (NO ROBOTIC TEMPLATES):
   - You are a real conversational AI agent, NOT a static FAQ bot.
   - DO NOT start every response with generic intro text like "I am Stoofi AI, your built-in assistant..." or dump a huge 20-bullet menu of things you can do unless the user explicitly asks for help/capabilities.
   - When the user greets you ("hello", "salam", "hi"), give a short, friendly, natural reply in 1-2 lines (e.g. "Walaikum Assalam [Name]! Main aapki kya madad kar sakta hoon?" or "Hello [Name]! How can I help you today?").
   - Answer the user's question directly, accurately, and conversationally.

2. AUTOMATIC LANGUAGE DETECTION & MIRRORING (CRITICAL):
   - If the user talks to you in **Roman Urdu** (e.g. "mera attendance kitna hai", "kya haal hai", "homework dikhao", "fees kitni baki hai"), YOU MUST RESPOND IN NATURAL PAKISTANI ROMAN URDU (e.g. "Aapki attendance 92% hai.", "Aapka 1 pending homework hai...", "Main check karta hoon").
   - If the user talks to you in **Urdu Script** (اردو), respond in natural, grammatically correct Urdu script.
   - If the user talks to you in **English**, respond in fluent, natural English.
   - If the user uses **mixed Roman Urdu + English**, respond in natural conversational mixed Roman Urdu.
   - If the user switches language mid-conversation, dynamically switch your language to match them.

3. CONVERSATIONAL MEMORY & FOLLOW-UP CONTEXT:
   - Always remember the recent messages in context.
   - For follow-up queries like "acha last month ki?", "aur science ka?", "khol do isko", understand that it refers to the subject previously discussed.

4. REAL DATABASE DATA & ZERO FABRICATION:
   - NEVER guess or invent database information (attendance percentages, marks, fee vouchers, student lists).
   - ALWAYS call the appropriate tool to query real live data.
   - If data is empty or not found, honestly inform the user.
   - Respect Role-Based Access Control (RBAC): If a student asks for school financial statistics or other students' private records, politely inform them that they do not have permission.

5. ACTIONABLE NAVIGATION:
   - When the user asks to open or visit a page (e.g. "take me to fees", "student management kholo"), call the 'navigate_to_page' tool so the interface shows a 1-click jump button.

6. GENERAL KNOWLEDGE & ACADEMICS:
   - If a student or teacher asks academic or general knowledge questions (e.g. math problem, science concept, essay help), explain clearly, step-by-step, with helpful examples.`;
}

// ─────────────────────────────────────────────────────────────
// Secure Tool Execution Handlers with Strict RBAC
// ─────────────────────────────────────────────────────────────
async function executeTool(toolName, toolArgs = {}, user) {
  const role = user?.role || 'User';
  const userId = user?._id;

  switch (toolName) {
    case 'get_my_profile': {
      let linkedDoc = null;
      if (role === 'Student') {
        linkedDoc = await Student.findOne({ email: user.email }).lean() ||
                    (user.referenceId ? await Student.findById(user.referenceId).lean() : null);
      } else if (role === 'Teacher') {
        linkedDoc = await Teacher.findOne({ email: user.email }).lean() ||
                    (user.referenceId ? await Teacher.findById(user.referenceId).lean() : null);
      } else if (role === 'Staff') {
        linkedDoc = await Staff.findOne({ email: user.email }).lean() ||
                    (user.referenceId ? await Staff.findById(user.referenceId).lean() : null);
      }

      return {
        success: true,
        user: {
          id: user._id,
          name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone || linkedDoc?.phone,
          schoolName: user.schoolName || 'Stoofi Smart Academy',
          academicDetails: linkedDoc ? {
            className: linkedDoc.className,
            section: linkedDoc.section,
            rollNo: linkedDoc.rollNo,
            admissionNo: linkedDoc.admissionNo,
            designation: linkedDoc.designation,
            department: linkedDoc.department,
            joiningDate: linkedDoc.joiningDate
          } : null
        }
      };
    }

    case 'get_my_attendance': {
      const timeframe = toolArgs?.timeframe || 'all';
      const statusFilter = toolArgs?.status || 'all';
      const limit = Math.min(Number(toolArgs?.limit) || 30, 100);

      // Compute date filters
      let dateQuery = {};
      const now = new Date();
      if (timeframe === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        dateQuery = { date: { $gte: start, $lte: end } };
      } else if (timeframe === 'yesterday') {
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        const start = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate());
        const end = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate(), 23, 59, 59, 999);
        dateQuery = { date: { $gte: start, $lte: end } };
      } else if (timeframe === 'this_week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateQuery = { date: { $gte: startOfWeek } };
      } else if (timeframe === 'last_week') {
        const startOfLastWeek = new Date(now);
        startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
        startOfLastWeek.setHours(0, 0, 0, 0);
        const endOfLastWeek = new Date(now);
        endOfLastWeek.setDate(now.getDate() - now.getDay() - 1);
        endOfLastWeek.setHours(23, 59, 59, 999);
        dateQuery = { date: { $gte: startOfLastWeek, $lte: endOfLastWeek } };
      } else if (timeframe === 'this_month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        dateQuery = { date: { $gte: start } };
      } else if (timeframe === 'last_month') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        dateQuery = { date: { $gte: start, $lte: end } };
      }

      if (role === 'Student') {
        const student = await Student.findOne({ email: user.email }).lean() ||
                        (user.referenceId ? await Student.findById(user.referenceId).lean() : null);
        
        let matchQuery = student 
          ? { $or: [{ recordId: student._id }, { name: new RegExp(student.firstName, 'i') }] }
          : { recordId: user._id };

        if (Object.keys(dateQuery).length > 0) {
          matchQuery = { $and: [matchQuery, dateQuery] };
        }

        if (statusFilter !== 'all') {
          matchQuery.status = statusFilter;
        }

        const records = await Attendance.find(matchQuery).sort({ date: -1 }).limit(limit).lean();
        const total = records.length;
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const halfDay = records.filter(r => r.status === 'Half Day').length;
        const percentage = total > 0 ? Math.round(((present + late * 0.5 + halfDay * 0.5) / total) * 100) : 100;

        return {
          success: true,
          type: 'student_attendance',
          timeframe,
          summary: { 
            totalRecords: total, 
            present, 
            absent, 
            late, 
            halfDay, 
            attendanceRate: `${percentage}%` 
          },
          recentRecords: records.slice(0, 10).map(r => ({
            date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
            status: r.status
          }))
        };
      }

      if (role === 'Teacher' || role === 'Staff') {
        const staff = await Teacher.findOne({ email: user.email }).lean() ||
                      await Staff.findOne({ email: user.email }).lean();
        let matchQuery = staff ? { $or: [{ staffId: staff._id }, { recordId: staff._id }] } : { recordId: user._id };
        if (Object.keys(dateQuery).length > 0) {
          matchQuery = { $and: [matchQuery, dateQuery] };
        }

        const records = await StaffAttendance.find(matchQuery).sort({ date: -1 }).limit(limit).lean();
        const total = records.length;
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

        return {
          success: true,
          type: 'staff_attendance',
          timeframe,
          summary: { totalRecords: total, present, absent, late, attendanceRate: `${percentage}%` },
          recentRecords: records.slice(0, 10).map(r => ({
            date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
            status: r.status
          }))
        };
      }

      if (role === 'Super Admin' || role === 'Admin') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRecords = await Attendance.find({ date: { $gte: today } }).lean();
        return {
          success: true,
          type: 'admin_attendance_overview',
          todayCount: todayRecords.length,
          presentCount: todayRecords.filter(r => r.status === 'Present').length,
          absentCount: todayRecords.filter(r => r.status === 'Absent').length,
          lateCount: todayRecords.filter(r => r.status === 'Late').length
        };
      }

      return { success: true, message: 'No attendance records found.' };
    }

    case 'get_my_homework': {
      const subjectFilter = toolArgs?.subject ? toolArgs.subject.trim() : null;
      const statusFilter = toolArgs?.status || 'all';

      if (role === 'Student') {
        const student = await Student.findOne({ email: user.email }).lean() ||
                        (user.referenceId ? await Student.findById(user.referenceId).lean() : null);
        
        let query = {};
        if (student?.className) {
          query.className = student.className;
        }
        if (subjectFilter) {
          query.subject = { $regex: new RegExp(subjectFilter, 'i') };
        }

        const homeworks = await Homework.find(query).sort({ submissionDate: -1 }).limit(15).lean();
        let formatted = homeworks.map(hw => ({
          id: hw._id,
          subject: hw.subject,
          className: hw.className,
          section: hw.section,
          homeworkDate: hw.homeworkDate ? new Date(hw.homeworkDate).toISOString().split('T')[0] : '',
          submissionDate: hw.submissionDate ? new Date(hw.submissionDate).toISOString().split('T')[0] : '',
          marks: hw.marks,
          description: hw.description,
          isCompleted: (hw.completedBy || []).some(id => id.toString() === user._id.toString())
        }));

        if (statusFilter === 'pending') {
          formatted = formatted.filter(h => !h.isCompleted);
        } else if (statusFilter === 'completed') {
          formatted = formatted.filter(h => h.isCompleted);
        }

        return {
          success: true,
          studentClass: student?.className || 'Class',
          count: formatted.length,
          homeworks: formatted
        };
      }

      if (role === 'Teacher' || role === 'Admin' || role === 'Super Admin') {
        let query = {};
        if (subjectFilter) {
          query.subject = { $regex: new RegExp(subjectFilter, 'i') };
        }
        const homeworks = await Homework.find(query).sort({ createdAt: -1 }).limit(20).lean();
        return {
          success: true,
          count: homeworks.length,
          homeworks: homeworks.map(hw => ({
            id: hw._id,
            subject: hw.subject,
            className: hw.className,
            section: hw.section,
            submissionDate: hw.submissionDate ? new Date(hw.submissionDate).toISOString().split('T')[0] : '',
            marks: hw.marks,
            description: hw.description
          }))
        };
      }

      return { success: false, message: 'Homework is not applicable for this role.' };
    }

    case 'get_my_fees': {
      if (role === 'Student' || role === 'Parent') {
        const student = await Student.findOne({ email: user.email }).lean() ||
                        (user.referenceId ? await Student.findById(user.referenceId).lean() : null);

        const query = student
          ? { $or: [{ admissionNo: student.admissionNo }, { student: student.firstName }] }
          : { student: user.fullName || user.username };

        const invoices = await FeesInvoice.find(query).sort({ date: -1 }).limit(10).lean();
        const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + (Number(inv.paid) || 0), 0);
        const totalBalance = invoices.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);

        return {
          success: true,
          summary: {
            totalInvoices: invoices.length,
            totalBilled: `PKR ${totalAmount.toLocaleString()}`,
            totalPaid: `PKR ${totalPaid.toLocaleString()}`,
            outstandingBalance: `PKR ${totalBalance.toLocaleString()}`,
            hasPending: totalBalance > 0
          },
          invoices: invoices.map(inv => ({
            id: inv._id,
            feeType: inv.feeType || 'Monthly Tuition',
            amount: inv.amount,
            paid: inv.paid,
            balance: inv.balance,
            status: inv.status,
            date: inv.date ? new Date(inv.date).toISOString().split('T')[0] : ''
          }))
        };
      }

      if (role === 'Admin' || role === 'Super Admin' || role === 'Accountant') {
        const invoices = await FeesInvoice.find().sort({ createdAt: -1 }).limit(20).lean();
        const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + (Number(inv.paid) || 0), 0);
        const totalBalance = invoices.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);
        return {
          success: true,
          adminFeeSummary: {
            recentInvoicesCount: invoices.length,
            totalBilled: `PKR ${totalBilled.toLocaleString()}`,
            totalCollected: `PKR ${totalPaid.toLocaleString()}`,
            recentOutstanding: `PKR ${totalBalance.toLocaleString()}`
          }
        };
      }

      return { success: false, message: 'Fee records are only visible to students and school administrators.' };
    }

    case 'get_my_marks': {
      if (role === 'Student') {
        const student = await Student.findOne({ email: user.email }).lean() ||
                        (user.referenceId ? await Student.findById(user.referenceId).lean() : null);
        
        if (!student) {
          return { success: false, message: 'Student profile not linked.' };
        }

        const marks = await MarksRegister.find({ studentId: student._id.toString() }).limit(20).lean();
        return {
          success: true,
          studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
          class: student.className,
          records: marks.map(m => ({
            marks: m.marks,
            totalMarks: m.totalMarks,
            grade: m.grade,
            gpa: m.gpa,
            remarks: m.remarks
          }))
        };
      }
      return { success: false, message: 'Marks lookup is available for students.' };
    }

    case 'get_school_statistics': {
      if (role !== 'Super Admin' && role !== 'Admin') {
        return {
          success: false,
          message: 'Permission Denied: Only School Administrators can view overall institutional analytics.'
        };
      }

      const [totalStudents, totalTeachers, totalStaff, totalClasses, recentInvoices] = await Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Staff.countDocuments(),
        Class.countDocuments(),
        FeesInvoice.find().limit(50).lean()
      ]);

      const totalFeeCollected = recentInvoices.reduce((sum, i) => sum + (Number(i.paid) || 0), 0);
      const totalFeePending = recentInvoices.reduce((sum, i) => sum + (Number(i.balance) || 0), 0);

      return {
        success: true,
        schoolName: user.schoolName || 'Stoofi Smart Academy',
        stats: {
          totalEnrolledStudents: totalStudents,
          totalFacultyTeachers: totalTeachers,
          totalSupportStaff: totalStaff,
          activeClasses: totalClasses,
          recentCollectedFees: `PKR ${totalFeeCollected.toLocaleString()}`,
          recentOutstandingFees: `PKR ${totalFeePending.toLocaleString()}`
        }
      };
    }

    case 'get_class_students': {
      if (role === 'Student' || role === 'Parent') {
        return {
          success: false,
          message: 'Permission Denied: Students and Parents cannot inspect the complete student directory.'
        };
      }

      const query = { className: toolArgs.className };
      if (toolArgs.section && toolArgs.section !== 'All') query.section = toolArgs.section;

      const students = await Student.find(query).select('firstName lastName admissionNo rollNo className section gender phone').limit(50).lean();

      return {
        success: true,
        className: toolArgs.className,
        section: toolArgs.section || 'All',
        count: students.length,
        students: students.map(s => ({
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          admissionNo: s.admissionNo,
          rollNo: s.rollNo,
          class: s.className,
          section: s.section
        }))
      };
    }

    case 'get_notifications_and_notices': {
      const limit = Math.min(Number(toolArgs?.limit) || 5, 20);
      const [notices, notifications] = await Promise.all([
        Notice.find().sort({ createdAt: -1 }).limit(limit).lean(),
        Notification.find({
          $or: [
            { audience: 'All' },
            { audience: role },
            { recipientId: userId }
          ]
        }).sort({ createdAt: -1 }).limit(limit).lean()
      ]);

      return {
        success: true,
        notices: notices.map(n => ({
          title: n.title,
          date: n.publishOn ? new Date(n.publishOn).toISOString().split('T')[0] : (n.createdAt ? new Date(n.createdAt).toISOString().split('T')[0] : ''),
          notice: n.notice || n.description
        })),
        notifications: notifications.map(notif => ({
          title: notif.title,
          message: notif.message,
          type: notif.type,
          isRead: notif.isRead,
          date: notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''
        }))
      };
    }

    case 'get_upcoming_events': {
      const events = await Event.find().sort({ fromDate: 1 }).limit(5).lean();
      return {
        success: true,
        count: events.length,
        events: events.map(e => ({
          title: e.title,
          location: e.location,
          fromDate: e.fromDate ? new Date(e.fromDate).toISOString().split('T')[0] : '',
          toDate: e.toDate ? new Date(e.toDate).toISOString().split('T')[0] : '',
          description: e.description
        }))
      };
    }

    case 'navigate_to_page': {
      const target = toolArgs.target;
      const routeMap = {
        dashboard: { route: role === 'Student' ? '/dashboard/student' : role === 'Teacher' ? '/dashboard/teacher' : '/dashboard', label: 'Dashboard' },
        homework: { route: role === 'Student' ? '/dashboard/student/homework' : '/dashboard/academic/homework', label: 'Homework' },
        attendance: { route: role === 'Student' ? '/dashboard/student/attendance' : '/dashboard/students/attendance', label: 'Attendance' },
        students: { route: '/dashboard/students', label: 'Student Directory' },
        add_student: { route: '/dashboard/students/add', label: 'Add Student' },
        teachers: { route: '/dashboard/teachers', label: 'Teachers' },
        fees: { route: role === 'Student' ? '/dashboard/student/fees' : '/dashboard/fees', label: 'Fees & Invoices' },
        fees_invoice: { route: '/dashboard/fees/invoice', label: 'Fees Invoice' },
        profile: { route: role === 'Student' ? '/dashboard/student/profile' : role === 'Teacher' ? '/dashboard/teacher/profile' : '/dashboard/super-admin-profile', label: 'My Profile' },
        classes: { route: '/dashboard/class', label: 'Class Management' },
        sections: { route: '/dashboard/section', label: 'Sections' },
        subjects: { route: '/dashboard/subject', label: 'Subjects' },
        notice_board: { route: '/dashboard/utilities/communicate/notice-board', label: 'Notice Board' },
        events: { route: '/dashboard/utilities/communicate/event', label: 'Events' },
        settings: { route: '/dashboard/settings/general', label: 'Settings' },
        lms_courses: { route: '/dashboard/lms/courses', label: 'LMS Courses' },
        download_center: { route: '/dashboard/download-center/content-list', label: 'Download Center' },
        exam_marks: { route: '/dashboard/examinations/marks-register', label: 'Marks Register' }
      };

      const selected = routeMap[target] || { route: '/dashboard', label: 'Dashboard' };
      return {
        success: true,
        action: 'navigate',
        route: selected.route,
        label: selected.label,
        message: `Navigating to ${selected.label} (${selected.route})`
      };
    }

    case 'create_homework': {
      if (role !== 'Teacher' && role !== 'Admin' && role !== 'Super Admin') {
        return {
          success: false,
          message: 'Permission Denied: Only teachers and administrators can create homework.'
        };
      }

      const homework = await Homework.create({
        className: toolArgs.className,
        section: toolArgs.section || 'A',
        subject: toolArgs.subject,
        homeworkDate: new Date(),
        submissionDate: toolArgs.submissionDate ? new Date(toolArgs.submissionDate) : new Date(Date.now() + 86400000 * 3),
        marks: Number(toolArgs.marks) || 100,
        description: toolArgs.description,
        completedBy: []
      });

      return {
        success: true,
        message: `Homework for ${toolArgs.subject} (${toolArgs.className}) has been successfully created!`,
        homeworkId: homework._id
      };
    }

    default:
      return { success: false, message: `Tool ${toolName} is not recognized.` };
  }
}

module.exports = {
  AI_TOOLS_DEFINITIONS,
  getStoofiSystemPrompt,
  executeTool
};
