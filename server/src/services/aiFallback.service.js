const { executeTool } = require('./aiTools.service');

/**
 * Intelligent Stoofi Assistant Fallback Engine
 * Handles natural language intent parsing & real database data retrieval
 * when OpenAI API quota is exhausted (429) or offline.
 */
async function generateIntelligentFallbackResponse(userMessage, user, pageContext) {
  const query = userMessage.toLowerCase().trim();
  const role = user?.role || 'User';
  const name = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'there';

  let navAction = null;
  let content = '';

  // 1. GREETINGS
  if (/^(hi|hello|hey|salam|assalam|aoa|hola|good morning|good afternoon|good evening|who are you|what is stoofi ai)/i.test(query)) {
    content = `Hello **${name}**! 👋 I am **Stoofi AI**, your school management personal assistant.\n\nI can help you check your **attendance**, **homework assignments**, **fee vouchers**, **school statistics**, or navigate anywhere in Stoofi.\n\nHow can I assist you right now?`;
    return { content, navAction };
  }

  // 2. ATTENDANCE INTENT
  if (/attendance|present|absent|late|hazri/i.test(query)) {
    const res = await executeTool('get_my_attendance', {}, user);
    if (res.type === 'student_attendance') {
      const s = res.summary;
      content = `📊 **Your Attendance Record:**\n\n- **Overall Attendance Rate:** **${s.attendanceRate}**\n- **Present Days:** ${s.present}\n- **Absent Days:** ${s.absent}\n- **Late Days:** ${s.late}\n- **Half Days:** ${s.halfDay}\n- **Total Recorded Days:** ${s.totalRecords}\n\n`;
      if (res.recentRecords && res.recentRecords.length > 0) {
        content += `**Recent Days:**\n` + res.recentRecords.slice(0, 5).map(r => `• ${r.date}: **${r.status}**`).join('\n');
      }
      navAction = { route: '/dashboard/student/attendance', label: 'Attendance Page' };
    } else if (res.type === 'admin_attendance_overview') {
      content = `📊 **Today's Institutional Attendance Overview:**\n\n- **Total Marked Today:** ${res.todayCount}\n- **Present:** ${res.presentCount}\n- **Absent:** ${res.absentCount}`;
      navAction = { route: '/dashboard/students/attendance', label: 'Student Attendance' };
    } else {
      content = `You have **${res.totalRecords || 0}** attendance logs recorded on your account.`;
      navAction = { route: '/dashboard', label: 'Dashboard' };
    }
    return { content, navAction };
  }

  // 3. HOMEWORK INTENT
  if (/homework|assignment|task|kaam|submission/i.test(query)) {
    const res = await executeTool('get_my_homework', {}, user);
    if (role === 'Student') {
      if (!res.homeworks || res.homeworks.length === 0) {
        content = `🎉 **Great news!** You currently have **0 pending homework assignments** for ${res.studentClass || 'your class'}.`;
      } else {
        content = `📚 **Your Active Homework Assignments (${res.count}):**\n\n`;
        res.homeworks.slice(0, 5).forEach((hw, idx) => {
          content += `**${idx + 1}. ${hw.subject}** (${hw.className} - Section ${hw.section})\n`;
          content += `   • **Due Date:** ${hw.submissionDate || 'N/A'} (Marks: ${hw.marks})\n`;
          content += `   • **Details:** ${hw.description}\n\n`;
        });
      }
      navAction = { route: '/dashboard/student/homework', label: 'My Homework' };
    } else {
      content = `📚 **School Homework List:**\nThere are currently **${res.count}** homework assignments in the system.`;
      navAction = { route: '/dashboard/academic/homework', label: 'Homework Manager' };
    }
    return { content, navAction };
  }

  // 4. FEES & INVOICE INTENT
  if (/fee|fees|invoice|dues|balance|challan|voucher|payment/i.test(query)) {
    const res = await executeTool('get_my_fees', {}, user);
    if (role === 'Student' || role === 'Parent') {
      const s = res.summary;
      content = `💳 **Your Tuition Fee Summary:**\n\n- **Total Billed:** ${s.totalBilled}\n- **Total Paid:** ${s.totalPaid}\n- **Outstanding Balance:** **${s.outstandingBalance}**\n\n`;
      if (res.invoices && res.invoices.length > 0) {
        content += `**Recent Invoices:**\n`;
        res.invoices.slice(0, 3).forEach(inv => {
          content += `• **${inv.feeType}**: PKR ${inv.amount} | Status: **${inv.status}** (${inv.date})\n`;
        });
      }
      navAction = { route: '/dashboard/student/fees', label: 'Fee Invoices' };
    } else if (res.adminFeeSummary) {
      content = `💳 **Fee Collection Summary:**\n\n- **Recent Invoices Recorded:** ${res.adminFeeSummary.recentInvoicesCount}\n- **Total Outstanding Amount:** **${res.adminFeeSummary.recentOutstanding}**`;
      navAction = { route: '/dashboard/fees', label: 'Fees Management' };
    } else {
      content = res.message || 'Fee details are restricted to students and school accountants.';
    }
    return { content, navAction };
  }

  // 5. SCHOOL STATISTICS & ENROLMENT INTENT
  if (/statistic|analytics|how many student|how many teacher|total student|enrolment|overview|school summary/i.test(query)) {
    if (role === 'Student' || role === 'Parent') {
      content = `🔒 School-wide institutional statistics are only accessible to School Administrators. You can check your own academic details, attendance, and homework anytime!`;
      navAction = { route: '/dashboard/student', label: 'Student Portal' };
    } else {
      const res = await executeTool('get_school_statistics', {}, user);
      if (res.success) {
        const s = res.stats;
        content = `🏫 **${res.schoolName} — Live Overview:**\n\n` +
                  `- 👨‍🎓 **Total Enrolled Students:** **${s.totalEnrolledStudents}**\n` +
                  `- 👩‍🏫 **Total Faculty Teachers:** **${s.totalFacultyTeachers}**\n` +
                  `- 🏢 **Total Support Staff:** **${s.totalSupportStaff}**\n` +
                  `- 📚 **Active Classes:** **${s.activeClasses}**\n` +
                  `- 💰 **Fee Collection:** ${s.recentCollectedFees} (Pending: ${s.recentOutstandingFees})`;
        navAction = { route: '/dashboard', label: 'Main Dashboard' };
      } else {
        content = res.message;
      }
    }
    return { content, navAction };
  }

  // 6. NAVIGATION INTENTS
  if (/open student|show student|go to student|manage student/i.test(query)) {
    const target = role === 'Student' ? 'profile' : 'students';
    const res = await executeTool('navigate_to_page', { target }, user);
    content = `I'll take you to the **${res.label}** section right now.`;
    navAction = { route: res.route, label: res.label };
    return { content, navAction };
  }

  if (/add student|create student|new admission/i.test(query)) {
    const res = await executeTool('navigate_to_page', { target: 'add_student' }, user);
    content = `Opening the **New Student Admission Form** for you.`;
    navAction = { route: res.route, label: res.label };
    return { content, navAction };
  }

  if (/open homework|go to homework/i.test(query)) {
    const res = await executeTool('navigate_to_page', { target: 'homework' }, user);
    content = `Opening **Homework Management** for you.`;
    navAction = { route: res.route, label: res.label };
    return { content, navAction };
  }

  if (/open settings|general settings|change settings/i.test(query)) {
    const res = await executeTool('navigate_to_page', { target: 'settings' }, user);
    content = `Opening **General System Settings**.`;
    navAction = { route: res.route, label: res.label };
    return { content, navAction };
  }

  if (/profile|my account|my details/i.test(query)) {
    const res = await executeTool('get_my_profile', {}, user);
    const u = res.user;
    content = `👤 **Account Profile:**\n\n- **Name:** ${u.name}\n- **Username:** ${u.username}\n- **Email:** ${u.email}\n- **Role:** **${u.role}**\n- **Phone:** ${u.phone || 'N/A'}\n- **Institution:** ${u.schoolName}\n`;
    if (u.academicDetails) {
      const a = u.academicDetails;
      if (a.className) content += `- **Class & Section:** ${a.className} (${a.section || 'A'})\n- **Admission No:** ${a.admissionNo || 'N/A'}\n- **Roll No:** ${a.rollNo || 'N/A'}\n`;
      if (a.designation) content += `- **Designation:** ${a.designation} (${a.department || 'Academic'})\n`;
    }
    navAction = { route: role === 'Student' ? '/dashboard/student/profile' : '/dashboard', label: 'View Profile' };
    return { content, navAction };
  }

  if (/notice|announcement|notification/i.test(query)) {
    const res = await executeTool('get_notifications_and_notices', { limit: 3 }, user);
    content = `📢 **Recent Notices & Announcements:**\n\n`;
    if (res.notices && res.notices.length > 0) {
      res.notices.forEach(n => {
        content += `• **${n.title}** (${n.date || 'Recent'}):\n  ${n.notice || ''}\n\n`;
      });
    } else {
      content += `No new notices published today.`;
    }
    navAction = { route: '/dashboard/utilities/communicate/notice-board', label: 'Notice Board' };
    return { content, navAction };
  }

  // 7. GENERAL STOOFI HELP / FALLBACK
  content = `I am **Stoofi AI**, your built-in assistant for Stoofi School Management.\n\nHere are some things you can ask me:\n- **"What is my attendance?"**\n- **"Show my homework assignments"**\n- **"Check fee status"**\n- **"How many students are enrolled?"** *(Admin only)*\n- **"Open student management"**\n- **"Show my profile"**\n\nHow can I help you today?`;
  navAction = { route: role === 'Student' ? '/dashboard/student' : '/dashboard', label: 'Dashboard' };

  return { content, navAction };
}

module.exports = {
  generateIntelligentFallbackResponse
};
