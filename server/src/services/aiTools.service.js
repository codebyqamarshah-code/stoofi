const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');
const Attendance = require('../models/Attendance');
const StaffAttendance = require('../models/StaffAttendance');
const Homework = require('../models/Homework');
const FeesInvoice = require('../models/FeesInvoice');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Setting = require('../models/Setting');

// Define OpenAI Tools Definitions
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
      description: 'Get the attendance records and overall attendance percentage for the current user.',
      parameters: {
        type: 'object',
        properties: {
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
      description: 'Get homework assignments for the student or homework created by the teacher.',
      parameters: {
        type: 'object',
        properties: {
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
      description: 'Get tuition fee invoices, due balances, and payment status for the student.',
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
          className: { type: 'string', description: 'Name of the class, e.g. "Class 10" or "O-Levels"' },
          section: { type: 'string', description: 'Optional section, e.g. "A" or "Blue"' }
        },
        required: ['className']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_notifications_and_notices',
      description: 'Get recent school notice board announcements and personal system notifications.',
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
      description: 'Trigger a safe page navigation in the Stoofi web app to help the user jump directly to a feature or section.',
      parameters: {
        type: 'object',
        properties: {
          target: { 
            type: 'string', 
            enum: [
              'dashboard', 'homework', 'attendance', 'students', 'add_student',
              'teachers', 'fees', 'fees_invoice', 'profile', 'classes', 
              'sections', 'subjects', 'notice_board', 'events', 'settings',
              'lms_courses', 'download_center'
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

// System Prompt Generator
function getStoofiSystemPrompt(user) {
  const role = user?.role || 'User';
  const name = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'User';
  const email = user?.email || '';

  return `You are Stoofi AI, the built-in intelligent assistant for the Stoofi school management platform (https://stoofi.vercel.app).

CURRENT AUTHENTICATED USER CONTEXT:
- Name: ${name}
- Email: ${email}
- Role: ${role}
- User ID: ${user?._id || 'unknown'}

CORE PRINCIPLES & RULES:
1. Friendly, professional, concise, respectful, and helpful tone.
2. You are role-aware:
   - For Students: Help with their homework, attendance, fees, timetable, profile, and study queries.
   - For Teachers: Help manage classes, homework, attendance records, curriculum, and evaluations.
   - For Admins / Super Admins: Provide school-wide analytics, manage students, teachers, fee reports, and system settings.
3. PRIVACY & SECURITY IS PARAMOUNT:
   - NEVER invent or guess database data (attendance percentages, marks, fee amounts, student details).
   - ALWAYS use the provided backend tools to look up real information.
   - Never reveal private data (such as passwords, CNIC numbers of others, private financial records) to unauthorized users.
   - If a student asks for another student's private data or overall school financial stats, politely inform them that they do not have permission.
4. If a user asks a general education or knowledge question (e.g. "Explain photosynthesis", "Help me solve 2x + 5 = 15", "What is an API?"), answer directly with high clarity and helpful examples.
5. If the user asks to navigate to a page or open a feature (e.g. "Open my homework", "Take me to fee payment"), call the 'navigate_to_page' tool and confirm it in your response.
6. If data is not found in the database, honestly inform the user without guessing. Format responses cleanly using markdown (bullet points, bold text, concise tables where helpful).`;
}

// Secure Tool Execution Handlers with Strict RBAC
async function executeTool(toolName, toolArgs, user) {
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
          schoolName: user.schoolName || 'Stoofi Model School',
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
      const limit = Math.min(Number(toolArgs?.limit) || 15, 50);

      if (role === 'Student') {
        const student = await Student.findOne({ email: user.email }).lean() ||
                        (user.referenceId ? await Student.findById(user.referenceId).lean() : null);
        
        const query = student 
          ? { $or: [{ recordId: student._id }, { name: new RegExp(student.firstName, 'i') }] }
          : { recordId: user._id };

        const records = await Attendance.find(query).sort({ date: -1 }).limit(limit).lean();
        const total = records.length;
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const halfDay = records.filter(r => r.status === 'Half Day').length;
        const percentage = total > 0 ? Math.round(((present + late * 0.5 + halfDay * 0.5) / total) * 100) : 100;

        return {
          success: true,
          type: 'student_attendance',
          summary: { totalRecords: total, present, absent, late, halfDay, attendanceRate: `${percentage}%` },
          recentRecords: records.map(r => ({
            date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
            status: r.status
          }))
        };
      }

      if (role === 'Teacher' || role === 'Staff') {
        const staff = await Teacher.findOne({ email: user.email }).lean() ||
                      await Staff.findOne({ email: user.email }).lean();
        const query = staff ? { $or: [{ staffId: staff._id }, { recordId: staff._id }] } : { recordId: user._id };
        const records = await StaffAttendance.find(query).sort({ date: -1 }).limit(limit).lean();

        return {
          success: true,
          type: 'staff_attendance',
          totalRecords: records.length,
          recentRecords: records.map(r => ({
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
          absentCount: todayRecords.filter(r => r.status === 'Absent').length
        };
      }

      return { success: true, message: 'No attendance records found for this role.' };
    }

    case 'get_my_homework': {
      if (role === 'Student') {
        const student = await Student.findOne({ email: user.email }).lean() ||
                        (user.referenceId ? await Student.findById(user.referenceId).lean() : null);
        
        let query = {};
        if (student?.className) {
          query.className = student.className;
        }

        const homeworks = await Homework.find(query).sort({ submissionDate: -1 }).limit(10).lean();
        const formatted = homeworks.map(hw => ({
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

        return {
          success: true,
          studentClass: student?.className || 'All',
          count: formatted.length,
          homeworks: formatted
        };
      }

      if (role === 'Teacher' || role === 'Admin' || role === 'Super Admin') {
        const homeworks = await Homework.find().sort({ createdAt: -1 }).limit(15).lean();
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

      return { success: false, message: 'Homework not applicable for this role.' };
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
            outstandingBalance: `PKR ${totalBalance.toLocaleString()}`
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
        const invoices = await FeesInvoice.find().sort({ createdAt: -1 }).limit(10).lean();
        const totalBalance = invoices.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);
        return {
          success: true,
          adminFeeSummary: {
            recentInvoicesCount: invoices.length,
            recentOutstanding: `PKR ${totalBalance.toLocaleString()}`
          }
        };
      }

      return { success: false, message: 'Fee records are only visible to students and school administrators.' };
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
      if (toolArgs.section) query.section = toolArgs.section;

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
        download_center: { route: '/dashboard/download-center/content-list', label: 'Download Center' }
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
