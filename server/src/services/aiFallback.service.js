const { executeTool } = require('./aiTools.service');

/**
 * Detect query language
 * Returns: 'urdu_script' | 'roman_urdu' | 'english'
 */
function detectLanguage(text = '') {
  if (!text) return 'english';

  // 1. Check for Arabic/Urdu Script unicode
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) {
    return 'urdu_script';
  }

  // 2. Common Pakistani Roman Urdu keywords and particles
  const romanUrduPatterns = [
    /\b(mera|meri|meray|mere|mujhe|mujhko|hum|humein|aap|aapki|aapka|aapke|tum|tumhara|tumhari|apna|apni)\b/i,
    /\b(kya|kyun|kyu|kaise|kese|kahan|kidhar|kab|kitna|kitni|kitne|kitny|kon|kis|kisko)\b/i,
    /\b(hai|hain|ho|hoon|hun|tha|thi|the|hoga|hogi|hogay|hoge)\b/i,
    /\b(karo|kardo|karna|karein|kare|karta|karti|karte|dekho|dikhao|batao|btao|bhejo|bhej|dekhna)\b/i,
    /\b(acha|theek|thik|shukriya|shukria|zabardast|bhai|sahib|janab|hazir|ji|jee|haan|nahi|nhi|mat)\b/i,
    /\b(hazri|chutti|chuttiyan|kaam|parhai|dakhla|paisa|paise|mahina|mahine|pichlay|pichle|agle|aaj|kal|parso)\b/i,
    /\b(salam|assalam|walekum|walaikum|aoa|kholo|khul|le jao|chalo|bata|bataen)\b/i,
    /\b(mein|me|se|say|ko|ka|ki|ke|kay|par|pe|aur|or|bhi|tak|wala|wali|wale)\b/i
  ];

  let matches = 0;
  for (const pattern of romanUrduPatterns) {
    if (pattern.test(text)) {
      matches++;
    }
  }

  if (matches >= 1) {
    return 'roman_urdu';
  }

  return 'english';
}

/**
 * Extract context from recent message history
 */
function extractContextFromHistory(recentMessages = []) {
  if (!Array.isArray(recentMessages) || recentMessages.length === 0) {
    return { lastTopic: null, lastRoute: null };
  }

  let lastTopic = null;
  let lastRoute = null;

  for (let i = recentMessages.length - 1; i >= 0; i--) {
    const msg = recentMessages[i];
    const text = (msg.content || '').toLowerCase();

    if (msg.navAction && msg.navAction.route) {
      lastRoute = msg.navAction.route;
    }

    if (!lastTopic) {
      if (/attendance|hazri|present|absent|late/i.test(text)) lastTopic = 'attendance';
      else if (/homework|assignment|kaam|task/i.test(text)) lastTopic = 'homework';
      else if (/fee|fees|invoice|challan|voucher|balance|dues/i.test(text)) lastTopic = 'fees';
      else if (/mark|marks|grade|result|exam/i.test(text)) lastTopic = 'marks';
      else if (/student|admission|enrolment/i.test(text)) lastTopic = 'students';
      else if (/teacher|faculty/i.test(text)) lastTopic = 'teachers';
    }

    if (lastTopic && lastRoute) break;
  }

  return { lastTopic, lastRoute };
}

/**
 * Intelligent Stoofi Natural Conversational NLP & Live Data Engine
 */
async function generateIntelligentFallbackResponse(userMessage, user, pageContext, recentMessages = []) {
  const query = (userMessage || '').trim().toLowerCase();
  const rawQuery = (userMessage || '').trim();
  const lang = detectLanguage(rawQuery);
  const role = user?.role || 'User';
  const name = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || (lang === 'roman_urdu' ? 'Aap' : 'there');

  let navAction = null;
  let content = '';

  const { lastTopic } = extractContextFromHistory(recentMessages);

  // ─────────────────────────────────────────────────────────────
  // 1. COURTESY / GRATITUDE / CLOSINGS
  // ─────────────────────────────────────────────────────────────
  if (/^(thanks|thank you|thx|shukriya|shukria|bht shukriya|bohot shukriya|ok|okay|theek|thik|theek hai|thik hai|acha theek hai|great|zabardast|good|nice|perfect|done|done ho gaya|bohot achay|shukran|jazakallah)\b/i.test(query)) {
    if (lang === 'urdu_script') {
      content = `خوش آمدید! جزاک اللہ۔ اگر آپ کو مزید کوئی معلومات یا مدد درکار ہو تو ضرور بتائیے۔`;
    } else if (lang === 'roman_urdu') {
      const replies = [
        `Koi baat nahi! Khush rahein. Agar koi aur cheez check karni ho toh batayein. 😊`,
        `Ji bilkul! Agar aapko mazeed kisi information ya help ki zaroorat ho toh main hazir hoon.`,
        `Zabardast! Agar koi aur sawaal ho toh zaroor poochiye.`
      ];
      content = replies[Math.floor(Math.random() * replies.length)];
    } else {
      content = `You're very welcome, **${name}**! Let me know if you need any other assistance.`;
    }
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. GREETINGS & SMALL TALK
  // ─────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|salam|assalam|aoa|assalam o alaikum|assalamualaikum|good morning|good afternoon|good evening|kya haal hai|kese ho|kaise ho|how are you|kya chal raha hai)\b/i.test(query)) {
    if (lang === 'urdu_script') {
      content = `وعلیکم السلام **${name}**! میں بالکل خیریت سے ہوں۔ فرمائیے، آج میں آپ کی کیا مدد کر سکتا ہوں؟`;
    } else if (lang === 'roman_urdu') {
      if (/salam|assalam|aoa/i.test(query)) {
        content = `Walaikum Assalam **${name}**! Main theek hoon, shukriya. Batayein aaj main aapki kya madad kar sakta hoon?`;
      } else if (/kya haal|kese ho|kaise ho/i.test(query)) {
        content = `Alhamdulillah main bilkul theek hoon! Aap batayein **${name}**, school records ya portal ke hawalay se kya check karna hai?`;
      } else {
        content = `Hello **${name}**! 👋 Batayein main aapki kya help kar sakta hoon?`;
      }
    } else {
      if (/how are you/i.test(query)) {
        content = `I'm doing great, thank you! How can I help you with Stoofi today, **${name}**?`;
      } else {
        content = `Hello **${name}**! 👋 How can I assist you with your school records today?`;
      }
    }
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. CAPABILITY / IDENTITY / HELP REQUESTS
  // ─────────────────────────────────────────────────────────────
  if (/(who are you|what can you do|tum kya kar sakte ho|tum kon ho|ap kon ho|kya kar sakty ho|what is stoofi ai|help me|meri madad karo|guide me)/i.test(query)) {
    if (lang === 'urdu_script') {
      if (role === 'Student') {
        content = `میں **Stoofi AI** ہوں، آپ کا ذہین اسکول اسسٹنٹ۔ میں آپ کی **حاضری**، **ہوم ورک اسائنمنٹس**، **فیس واؤچرز** اور **امتحانی نمبرات** چیک کرنے میں مدد کر سکتا ہوں۔ آپ اردو یا انگلش میں کچھ بھی پوچھ سکتے ہیں۔`;
      } else if (role === 'Teacher') {
        content = `میں **Stoofi AI** ہوں، آپ کا اسسٹنٹ۔ میں آپ کے لیے **کلاس حاضری**، **ہوم ورک مینجمنٹ**، اور **طلباء کی تفصیلات** تلاش کر سکتا ہوں۔`;
      } else {
        content = `میں **Stoofi AI** ہوں، آپ کا اسکول مینجمنٹ اسسٹنٹ۔ میں آپ کو **اسکول کے مجموعی اعدادوشمار**، **فیس ریکوری**، **طلباء اور اساتذہ کی فہرستیں** فراہم کر سکتا ہوں۔`;
      }
    } else if (lang === 'roman_urdu') {
      if (role === 'Student') {
        content = `Main **Stoofi AI** hoon, aapka smart school assistant! 🤖\n\nMain aapki **attendance (hazri)**, **homework**, **fees invoices & balance**, **exam marks**, aur portal navigation mein madad kar sakta hoon. Aap aam zuban mein jo chahein pooch saktay hain!`;
      } else if (role === 'Teacher') {
        content = `Main **Stoofi AI** hoon, aapka teaching & academic assistant! 📚\n\nMain classes ki **attendance**, **homework creation/review**, aur **student directory** manage karnay mein aapki help kar sakta hoon.`;
      } else {
        content = `Main **Stoofi AI** hoon, aapka school management assistant! 🏫\n\nMain **total students/teachers statistics**, **fee collection reports**, **student directories**, aur **notices** check karnay mein aapki madad karta hoon.`;
      }
    } else {
      if (role === 'Student') {
        content = `I am **Stoofi AI**, your smart school assistant. I can check your **attendance percentage**, **homework assignments**, **fee invoices**, and help you navigate Stoofi.`;
      } else if (role === 'Teacher') {
        content = `I am **Stoofi AI**, your academic assistant. I can help manage your **classes**, **attendance records**, **homework assignments**, and student details.`;
      } else {
        content = `I am **Stoofi AI**, your administrative assistant. I provide instant access to **school enrolment stats**, **fee collection summaries**, **student directories**, and settings.`;
      }
    }
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. ATTENDANCE INTENTS (Including Follow-up Context!)
  // ─────────────────────────────────────────────────────────────
  const isAttendanceQuery = /attendance|hazri|present|absent|late|half day|chutti|chuttiyan|kitne din aya|kitny din aya/i.test(query) ||
    (lastTopic === 'attendance' && /(last month|pichlay mahine|pichle month|this month|is mahine|last week|pichlay hafte|this week|is hafte|yesterday|kal|today|aaj|absent|kitny|percentage|rate)/i.test(query));

  if (isAttendanceQuery) {
    let timeframe = 'all';
    if (/last month|pichlay mahine|pichle mahine|pichle month|pichlay month/i.test(query)) {
      timeframe = 'last_month';
    } else if (/this month|is mahine|is month/i.test(query)) {
      timeframe = 'this_month';
    } else if (/last week|pichlay hafte|pichle hafte/i.test(query)) {
      timeframe = 'last_week';
    } else if (/this week|is hafte/i.test(query)) {
      timeframe = 'this_week';
    } else if (/today|aaj|aj/i.test(query)) {
      timeframe = 'today';
    } else if (/yesterday|kal/i.test(query)) {
      timeframe = 'yesterday';
    }

    const res = await executeTool('get_my_attendance', { timeframe, limit: 15 }, user);

    if (res.type === 'student_attendance') {
      const s = res.summary;
      const tfLabel = timeframe === 'last_month' ? (lang === 'roman_urdu' ? 'Pichlay mahine' : 'Last month')
                    : timeframe === 'this_month' ? (lang === 'roman_urdu' ? 'Is mahine' : 'This month')
                    : timeframe === 'this_week' ? (lang === 'roman_urdu' ? 'Is hafte' : 'This week')
                    : timeframe === 'last_week' ? (lang === 'roman_urdu' ? 'Pichlay hafte' : 'Last week')
                    : timeframe === 'today' ? (lang === 'roman_urdu' ? 'Aaj' : 'Today')
                    : (lang === 'roman_urdu' ? 'Overall' : 'Overall');

      if (lang === 'urdu_script') {
        content = `آپ کی کل حاضری **${s.attendanceRate}** ہے (${s.present} دن حاضر، ${s.absent} دن غیر حاضر، ${s.late} دن لیٹ)۔`;
      } else if (lang === 'roman_urdu') {
        if (s.totalRecords === 0) {
          content = `${tfLabel} aapka koi attendance record nahi mila.`;
        } else if (timeframe === 'today') {
          const todayStatus = res.recentRecords[0]?.status || 'Present';
          content = `Aaj aapki attendance **${todayStatus}** mark hai.`;
        } else if (timeframe === 'last_month') {
          content = `Pichlay mahine aapki attendance **${s.attendanceRate}** thi (${s.present} Present, ${s.absent} Absent).`;
        } else {
          content = `Aapki overall attendance **${s.attendanceRate}** hai (${s.present} Present, ${s.absent} Absent, ${s.late} Late).`;
        }
      } else {
        if (s.totalRecords === 0) {
          content = `No attendance records found for ${tfLabel.toLowerCase()}.`;
        } else if (timeframe === 'today') {
          const todayStatus = res.recentRecords[0]?.status || 'Present';
          content = `Today your attendance is recorded as **${todayStatus}**.`;
        } else if (timeframe === 'last_month') {
          content = `Last month your attendance rate was **${s.attendanceRate}** (${s.present} Present, ${s.absent} Absent).`;
        } else {
          content = `Your overall attendance is **${s.attendanceRate}** (${s.present} Present, ${s.absent} Absent, ${s.late} Late).`;
        }
      }
      navAction = { route: '/dashboard/student/attendance', label: 'Attendance Page' };
      return { content, navAction };
    }

    if (res.type === 'admin_attendance_overview') {
      if (lang === 'urdu_script') {
        content = `آج اسکول میں کل **${res.todayCount}** طلباء کی حاضری لگی، جس میں سے **${res.presentCount}** حاضر اور **${res.absentCount}** غیر حاضر ہیں۔`;
      } else if (lang === 'roman_urdu') {
        content = `Aaj school mein total **${res.todayCount}** attendance records hain: **${res.presentCount} Present** aur **${res.absentCount} Absent**.`;
      } else {
        content = `Today's school attendance: **${res.presentCount} Present**, **${res.absentCount} Absent** out of **${res.todayCount}** marked.`;
      }
      navAction = { route: '/dashboard/students/attendance', label: 'Attendance Management' };
      return { content, navAction };
    }

    if (res.type === 'staff_attendance') {
      const s = res.summary;
      if (lang === 'roman_urdu') {
        content = `Aapki staff attendance rate **${s.attendanceRate}** hai (${s.present} Present, ${s.absent} Absent).`;
      } else {
        content = `Your staff attendance rate is **${s.attendanceRate}** (${s.present} Present, ${s.absent} Absent).`;
      }
      navAction = { route: '/dashboard', label: 'Dashboard' };
      return { content, navAction };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. HOMEWORK INTENTS (Including Follow-up Context!)
  // ─────────────────────────────────────────────────────────────
  const isHomeworkQuery = /homework|assignment|kaam|task|submit|submission/i.test(query) ||
    (lastTopic === 'homework' && /(pending|complete|completed|maths|science|english|urdu|physics|chemistry|biology|computer|islamiat|deadline|due|kab tak)/i.test(query));

  if (isHomeworkQuery) {
    let subject = null;
    const subjects = ['mathematics', 'maths', 'math', 'science', 'english', 'urdu', 'physics', 'chemistry', 'biology', 'computer', 'islamiat', 'pak studies'];
    for (const sub of subjects) {
      if (new RegExp(`\\b${sub}\\b`, 'i').test(query)) {
        subject = sub;
        break;
      }
    }

    const res = await executeTool('get_my_homework', { subject, status: 'all' }, user);

    if (role === 'Student') {
      if (!res.homeworks || res.homeworks.length === 0) {
        if (lang === 'urdu_script') {
          content = subject 
            ? `آپ کے لیے **${subject}** کا کوئی پینڈنگ ہوم ورک نہیں ہے۔`
            : `آپ کا اس وقت کوئی پینڈنگ ہوم ورک نہیں ہے! تمام کام مکمل ہیں۔`;
        } else if (lang === 'roman_urdu') {
          content = subject
            ? `Aapka **${subject}** ka koi pending homework nahi mila.`
            : `Aapka is waqt koi pending homework nahi hai! Sab complete hai. 👍`;
        } else {
          content = subject
            ? `No pending homework found for **${subject}**.`
            : `You currently have 0 pending homework assignments. All caught up! 🎉`;
        }
      } else {
        const count = res.homeworks.length;
        if (lang === 'urdu_script') {
          content = `آپ کے **${count} ہوم ورک اسائنمنٹس** موجود ہیں:\n\n`;
          res.homeworks.slice(0, 4).forEach((hw, idx) => {
            content += `${idx + 1}. **${hw.subject}**: ${hw.description} (آخری تاریخ: ${hw.submissionDate || 'N/A'})\n`;
          });
        } else if (lang === 'roman_urdu') {
          content = `Aapke **${count} homework assignments** hain:\n\n`;
          res.homeworks.slice(0, 4).forEach((hw, idx) => {
            content += `• **${hw.subject}** (${hw.className}): ${hw.description} — *Submission: ${hw.submissionDate || 'N/A'}*\n`;
          });
        } else {
          content = `You have **${count} active homework assignment(s)**:\n\n`;
          res.homeworks.slice(0, 4).forEach((hw, idx) => {
            content += `• **${hw.subject}** (${hw.className}): ${hw.description} (Due: ${hw.submissionDate || 'N/A'})\n`;
          });
        }
      }
      navAction = { route: '/dashboard/student/homework', label: 'My Homework' };
      return { content, navAction };
    } else {
      if (lang === 'roman_urdu') {
        content = `School system mein is waqt total **${res.count}** homework assignments registered hain.`;
      } else {
        content = `There are currently **${res.count}** homework assignments in the system.`;
      }
      navAction = { route: '/dashboard/academic/homework', label: 'Homework Manager' };
      return { content, navAction };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. FEES & INVOICE INTENTS
  // ─────────────────────────────────────────────────────────────
  if (/fee|fees|invoice|dues|balance|challan|voucher|payment|paise|baki|kitne paise/i.test(query)) {
    const res = await executeTool('get_my_fees', {}, user);

    if (role === 'Student' || role === 'Parent') {
      const s = res.summary;
      if (lang === 'urdu_script') {
        content = `آپ کی فیس کی تفصیل درج ذیل ہے:\n- کل فیس: **${s.totalBilled}**\n- ادا شدہ: **${s.totalPaid}**\n- واجب الادا رقم: **${s.outstandingBalance}**`;
      } else if (lang === 'roman_urdu') {
        if (!s.hasPending) {
          content = `Aapki tamam fees clear hain! Total paid: **${s.totalPaid}**, outstanding balance **PKR 0** hai.`;
        } else {
          content = `Aapki total billed fees **${s.totalBilled}** hai, jis mein se **${s.totalPaid}** paid hai aur outstanding balance **${s.outstandingBalance}** hai.`;
        }
      } else {
        content = `Your tuition fee status:\n- Total Billed: **${s.totalBilled}**\n- Total Paid: **${s.totalPaid}**\n- Outstanding Balance: **${s.outstandingBalance}**`;
      }
      navAction = { route: '/dashboard/student/fees', label: 'Fee Invoices' };
      return { content, navAction };
    } else if (res.adminFeeSummary) {
      const a = res.adminFeeSummary;
      if (lang === 'roman_urdu') {
        content = `Fee collection summary: Total billed **${a.totalBilled}**, total collected **${a.totalCollected}**, aur pending balance **${a.recentOutstanding}** hai.`;
      } else {
        content = `Fee collection overview: Total Billed **${a.totalBilled}**, Collected **${a.totalCollected}**, Pending **${a.recentOutstanding}**.`;
      }
      navAction = { route: '/dashboard/fees', label: 'Fees Management' };
      return { content, navAction };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 7. EXAM MARKS & RESULTS INTENTS
  // ─────────────────────────────────────────────────────────────
  if (/mark|marks|result|exam|grade|gpa|number|paper|imtihan/i.test(query)) {
    if (role === 'Student') {
      const res = await executeTool('get_my_marks', {}, user);
      if (res.records && res.records.length > 0) {
        if (lang === 'roman_urdu') {
          content = `Aapke exam marks records:\n` + res.records.slice(0, 5).map(m => `• Marks: **${m.marks}/${m.totalMarks}** (Grade: ${m.grade || 'N/A'}, GPA: ${m.gpa || 'N/A'})`).join('\n');
        } else {
          content = `Your exam marks records:\n` + res.records.slice(0, 5).map(m => `• Marks: **${m.marks}/${m.totalMarks}** (Grade: ${m.grade || 'N/A'}, GPA: ${m.gpa || 'N/A'})`).join('\n');
        }
      } else {
        if (lang === 'roman_urdu') {
          content = `Aapke exam marks abhi system mein upload nahi huay hain.`;
        } else {
          content = `Your examination marks have not been published yet.`;
        }
      }
      navAction = { route: '/dashboard/student', label: 'Student Dashboard' };
      return { content, navAction };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 8. SCHOOL STATISTICS & ENROLMENT INTENTS
  // ─────────────────────────────────────────────────────────────
  if (/statistic|statistics|analytics|total student|total teacher|how many student|kitne student|kitne bache|kitny student|enrolment|overview/i.test(query)) {
    if (role === 'Student' || role === 'Parent') {
      content = lang === 'roman_urdu'
        ? `School institutional analytics sirf Administrators ke liye hain. Aap apna personal attendance, homework, aur fees check kar saktay hain.`
        : `School-wide analytics are restricted to School Administrators. You can check your own academic records anytime!`;
      navAction = { route: '/dashboard/student', label: 'Student Portal' };
      return { content, navAction };
    }

    const res = await executeTool('get_school_statistics', {}, user);
    if (res.success) {
      const s = res.stats;
      if (lang === 'urdu_script') {
        content = `اسکول کے اعدادوشمار:\n- کل طلباء: **${s.totalEnrolledStudents}**\n- اساتذہ: **${s.totalFacultyTeachers}**\n- عملہ: **${s.totalSupportStaff}**\n- کلاسز: **${s.activeClasses}**\n- فیس ریکوری: ${s.recentCollectedFees}`;
      } else if (lang === 'roman_urdu') {
        content = `🏫 **${res.schoolName} — Live Overview:**\n\n- 👨‍🎓 Total Students: **${s.totalEnrolledStudents}**\n- 👩‍🏫 Faculty Teachers: **${s.totalFacultyTeachers}**\n- 🏢 Support Staff: **${s.totalSupportStaff}**\n- 📚 Active Classes: **${s.activeClasses}**\n- 💰 Fee Collected: **${s.recentCollectedFees}** (Pending: ${s.recentOutstandingFees})`;
      } else {
        content = `🏫 **${res.schoolName} — Live Overview:**\n\n- Total Students: **${s.totalEnrolledStudents}**\n- Faculty Teachers: **${s.totalFacultyTeachers}**\n- Support Staff: **${s.totalSupportStaff}**\n- Active Classes: **${s.activeClasses}**\n- Fee Collection: **${s.recentCollectedFees}** (Pending: ${s.recentOutstandingFees})`;
      }
      navAction = { route: '/dashboard', label: 'Dashboard' };
      return { content, navAction };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 9. NAVIGATION INTENTS (Safe 1-click Page Jumps)
  // ─────────────────────────────────────────────────────────────
  const navMatches = [
    { pattern: /open student|show student|go to student|manage student|student list|students page|student directory|students dikhao/i, target: role === 'Student' ? 'profile' : 'students' },
    { pattern: /add student|new student|create student|new admission|admission form|dakhla/i, target: 'add_student' },
    { pattern: /open teacher|manage teacher|teacher list|teachers/i, target: 'teachers' },
    { pattern: /open homework|go to homework|homework page/i, target: 'homework' },
    { pattern: /open attendance|go to attendance|attendance page/i, target: 'attendance' },
    { pattern: /open fees|fees page|fee vouchers/i, target: 'fees' },
    { pattern: /my profile|profile page|account details|mera profile/i, target: 'profile' },
    { pattern: /notice board|notices|announcements/i, target: 'notice_board' },
    { pattern: /events|calendar|school events/i, target: 'events' },
    { pattern: /settings|general settings|setting page/i, target: 'settings' },
    { pattern: /lms|courses|online courses/i, target: 'lms_courses' }
  ];

  for (const item of navMatches) {
    if (item.pattern.test(query)) {
      const res = await executeTool('navigate_to_page', { target: item.target }, user);
      if (lang === 'urdu_script') {
        content = `جی، میں آپ کو **${res.label}** پیج پر لے جا رہا ہوں۔`;
      } else if (lang === 'roman_urdu') {
        content = `Ji bilkul! Main aapko **${res.label}** section par le chal raha hoon.`;
      } else {
        content = `Opening **${res.label}** for you.`;
      }
      navAction = { route: res.route, label: res.label };
      return { content, navAction };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 10. PROFILE DETAILS INTENT
  // ─────────────────────────────────────────────────────────────
  if (/my profile|my account|my details|mera account|mera data|meri information/i.test(query)) {
    const res = await executeTool('get_my_profile', {}, user);
    const u = res.user;
    if (lang === 'roman_urdu') {
      content = `👤 **Aapki Profile Details:**\n\n- **Name:** ${u.name}\n- **Role:** ${u.role}\n- **Email:** ${u.email}\n- **Institution:** ${u.schoolName}\n`;
      if (u.academicDetails?.className) {
        content += `- **Class & Section:** ${u.academicDetails.className} (${u.academicDetails.section || 'A'})\n- **Roll No:** ${u.academicDetails.rollNo || 'N/A'}\n- **Admission No:** ${u.academicDetails.admissionNo || 'N/A'}\n`;
      }
    } else {
      content = `👤 **Profile Details:**\n\n- **Name:** ${u.name}\n- **Role:** ${u.role}\n- **Email:** ${u.email}\n- **Institution:** ${u.schoolName}\n`;
      if (u.academicDetails?.className) {
        content += `- **Class:** ${u.academicDetails.className} (${u.academicDetails.section || 'A'})\n- **Roll No:** ${u.academicDetails.rollNo || 'N/A'}\n`;
      }
    }
    navAction = { route: role === 'Student' ? '/dashboard/student/profile' : '/dashboard', label: 'View Profile' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 11. GENERAL KNOWLEDGE / DIRECT CONVERSATION FALLBACK
  // ─────────────────────────────────────────────────────────────
  // Handle math queries like "25 * 4", "100 / 5", "square root of 144"
  const mathMatch = query.match(/(\d+)\s*([\+\-\*\/xX])\s*(\d+)/);
  if (mathMatch) {
    const n1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const n2 = parseFloat(mathMatch[3]);
    let result = 0;
    if (op === '+') result = n1 + n2;
    else if (op === '-') result = n1 - n2;
    else if (op === '*' || op.toLowerCase() === 'x') result = n1 * n2;
    else if (op === '/') result = n2 !== 0 ? (n1 / n2) : 'Undefined (cannot divide by zero)';

    if (lang === 'roman_urdu') {
      content = `**${n1} ${op} ${n2}** ka answer **${result}** hai.`;
    } else {
      content = `The result of **${n1} ${op} ${n2}** is **${result}**.`;
    }
    return { content, navAction };
  }

  // Natural final conversational response (NO robotic capability dumps!)
  if (lang === 'urdu_script') {
    content = `میں نے آپ کا پیغام سمجھ لیا ہے۔ آپ اپنی حاضری، ہوم ورک، فیس واؤچرز، یا اسکول ریکارڈز کے بارے میں کچھ بھی پوچھ سکتے ہیں۔`;
  } else if (lang === 'roman_urdu') {
    content = `Main aapki baat samajh raha hoon. Aap Stoofi portal par apni **attendance**, **homework**, **fees**, ya kisi bhi page ke hawalay se direct pooch saktay hain. Main foran check karke bataoonga!`;
  } else {
    content = `I understand your request. You can ask me about your **attendance records**, **homework assignments**, **fee invoices**, or request to navigate anywhere in Stoofi.`;
  }

  navAction = { route: role === 'Student' ? '/dashboard/student' : '/dashboard', label: 'Dashboard' };
  return { content, navAction };
}

module.exports = {
  generateIntelligentFallbackResponse,
  detectLanguage
};
