import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { 
  User, 
  Student, 
  Teacher, 
  Staff, 
  Class, 
  Section, 
  FeesInvoice, 
  FeePayment, 
  Attendance, 
  StaffAttendance, 
  ExamSchedule, 
  ExamType, 
  Event, 
  Setting, 
  AIConversation, 
  AIMessage 
} from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_eskooly_2026';

/**
 * Extract authenticated user if token is present
 */
async function getAuthUser(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.id) return null;
    const user = await User.findById(decoded.id).select('-password').lean();
    return user || null;
  } catch (err) {
    return null;
  }
}

/**
 * Detect language: 'urdu_script' | 'roman_urdu' | 'english'
 */
function detectLanguage(text = '') {
  if (!text) return 'english';
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) {
    return 'urdu_script';
  }
  const romanPatterns = [
    /\b(mera|meri|mere|meray|mujhe|mujhy|mujhko|hum|humein|aap|aapki|aapka|aapke|tum|tumhara|tumhari|apna|apni)\b/i,
    /\b(kya|kyun|kyu|kaise|kese|kahan|kidhar|kab|kitna|kitni|kitne|kitny|kon|kis|kisko)\b/i,
    /\b(hai|hain|ho|hoon|hun|tha|thi|the|hoga|hogi|hogay|hoge)\b/i,
    /\b(karo|kardo|karna|karein|kare|karta|karti|karte|dekho|dikhao|batao|btao|bhejo|bhej|dekhna)\b/i,
    /\b(acha|theek|thik|shukriya|shukria|zabardast|bhai|sahib|janab|hazir|ji|jee|haan|nahi|nhi|mat)\b/i,
    /\b(salam|assalam|walekum|walaikum|aoa|kholo|khul|le jao|chalo|bata|bataen|bhool|bhul)\b/i,
    /\b(mein|me|mai|se|say|ko|ka|ki|ke|kay|par|pe|aur|or|bhi|tak|wala|wali|wale|gy|gaya|gaye)\b/i
  ];
  let matches = 0;
  for (const p of romanPatterns) {
    if (p.test(text)) matches++;
  }
  return matches >= 1 ? 'roman_urdu' : 'english';
}

/**
 * Generate intelligent live ERP answer grounded directly in live MongoDB Atlas data
 */
async function resolveErpQuery(rawQuery, user, pageContext) {
  const q = (rawQuery || '').trim().toLowerCase();
  const lang = detectLanguage(rawQuery);
  const userName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || (lang === 'roman_urdu' ? 'Janab' : 'there');
  const role = user?.role || 'User';

  let content = '';
  let navAction = null;

  // ─────────────────────────────────────────────────────────────
  // 1. GREETINGS & INTRODUCTIONS
  // ─────────────────────────────────────────────────────────────
  const isGreeting = /^(hello|hi|hey|salam|assalam|aslam|aoa|hola|welcome|kese ho|kaise ho|kya hal hai|kia hal hai|subha bakhair|shab bakhair)\b/i.test(q) ||
    /^(assalam[ -]?o[ -]?alaikum|salam[ -]?o[ -]?alaikum|walaikum[ -]?assalam)/i.test(q);

  if (isGreeting) {
    if (lang === 'urdu_script') {
      content = `وعلیکم السلام ${userName} صاحب! 👋\n\nمیں **اسٹو فی اے آئی (Stoofi AI)** ہوں — پاک رائل کالج شرقپور کا سمارٹ ای آر پی اسسٹنٹ۔\n\nمیں آپ کے لائیو کالج ریکارڈز میں معاونت کر سکتا ہوں:\n• **طلباء کی کل تعداد اور تفاصیل** (Students count & directory)\n• **اساتذہ و اسٹاف ریکارڈ** (Faculty & Staff)\n• **فیس اور چالان کا حساب کتاب** (Fees & Billing)\n• **حاضری اور کلاس ٹائم ٹیبل** (Attendance & Timetable)\n• **امتحانی نتائج اور اسکول سیٹنگز**\n\nفرمائیے، آج میں آپ کی کیا مدد کر سکتا ہوں؟`;
    } else if (lang === 'roman_urdu') {
      content = `Walaikum Assalam ${userName}! 👋\n\nMain **Stoofi AI Assistant** hoon — Pak Royal College Sharaqpur Sharif ka official smart ERP assistant.\n\nMain live database se linked hoon aur aapki in cheezon mein madad kar sakta hoon:\n• **Students ki tadad aur records** (e.g. *"total kitny student hai"*)\n• **Teachers & Staff directory**\n• **Fees collection, pending dues & vouchers**\n• **Classes, Attendance & Routine**\n• **Exams, Events & Settings navigation**\n\nBataiye, aaj main aapki kya madad karoon?`;
    } else {
      content = `Hello ${userName}! 👋\n\nI am **Stoofi AI Assistant**, the official intelligent assistant for Pak Royal College Sharaqpur Sharif.\n\nI am directly connected to the live college ERP database and can provide real-time information on:\n• **Student counts & directory** (e.g. ask *"how many students are enrolled?"*)\n• **Teachers and Staff records**\n• **Fee collection, outstanding dues & challans**\n• **Attendance & class timetables**\n• **Examinations, events and system settings**\n\nHow can I assist you today?`;
    }
    navAction = { route: '/dashboard', label: 'Dashboard Overview' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. WHO ARE YOU / IDENTITY / CAPABILITIES
  // ─────────────────────────────────────────────────────────────
  if (/who are you|tum kon ho|aap kon ho|kya kar sakte ho|kia kar sakty ho|what can you do|about you|help me/i.test(q)) {
    if (lang === 'roman_urdu') {
      content = `Main **Stoofi AI** hoon — Pak Royal College Sharaqpur Sharif ERP ka dedicated AI assistant.\n\nMera kaam college ke administrative aur academic workflows ko aasan banana hai. Main direct MongoDB Atlas se live data fetch karta hoon taake aapko hamesha accurate aur verified information milay.\n\n**Aap mujh se yeh pooch saktay hain:**\n1. *"Total kitny student hain?"*\n2. *"FSC OTT ya Nursing mein kitne students hain?"*\n3. *"College mein kitnay teachers hain?"*\n4. *"Fee collection ka status kya hai?"*\n5. *"Student admission form open karo."*`;
    } else {
      content = `I am **Stoofi AI**, the intelligent pair-assistant designed specifically for **Pak Royal College Sharaqpur Sharif ERP**.\n\nI have direct, real-time access to live database records for students, teachers, fees, attendance, examinations, and college settings.\n\n**Common questions you can ask:**\n• *"How many total students are enrolled?"*\n• *"Show me FSC OTT student count."*\n• *"What is the faculty / staff count?"*\n• *"What is the fee collection status?"*\n• *"Open student admission form."*`;
    }
    navAction = { route: '/dashboard', label: 'College Dashboard' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. STUDENT STATISTICS & TOTAL STUDENT COUNT (LIVE DB QUERY)
  // ─────────────────────────────────────────────────────────────
  const isStudentCountQuery = /student.*(total|kitn|count|how many|tadad|list|all|record)|(total|kitn|how many|all).*(student|talib)/i.test(q) ||
    /kitny student|kitne student|total student|students count|how many student/i.test(q);

  if (isStudentCountQuery) {
    try {
      const totalStudents = await Student.countDocuments();
      const allStudents = await Student.find({}, 'className academicYear status').lean();

      // Aggregate by Academic Year
      const yearCounts = {};
      const classCounts = {};
      let activeCount = 0;

      for (const st of allStudents) {
        const yr = st.academicYear || 'Not Specified';
        yearCounts[yr] = (yearCounts[yr] || 0) + 1;

        const cls = (st.className || 'Unassigned').trim();
        classCounts[cls] = (classCounts[cls] || 0) + 1;

        if (!st.status || st.status === 'Active' || st.status === 'Enrolled') {
          activeCount++;
        }
      }

      // Sort classes by highest enrolled
      const sortedClasses = Object.entries(classCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      if (lang === 'urdu_script') {
        content = `📊 **پاک رائل کالج شرقپور — اسٹوڈنٹس کا لائیو ریکارڈ:**\n\nکالج پورٹل پر اس وقت **کل ${totalStudents} طلباء (Students)** رجسٹرڈ ہیں۔\n\n` +
          `• **ایکٹو ریکارڈز:** ${activeCount} طلباء\n` +
          `• **تعلیمی سال کے اعتبار سے:**\n` +
          Object.entries(yearCounts).map(([y, c]) => `  - ${y}: **${c} طلباء**`).join('\n') +
          `\n\n**اہم شعبہ جات (Class Breakdown):**\n` +
          sortedClasses.map(([cls, c]) => `• ${cls}: **${c} طلباء**`).join('\n') +
          `\n\nمکمل فہرست دیکھنے یا نیا داخلہ کرنے کے لیے نیچے دیے گئے بٹن پر کلک کریں۔`;
      } else if (lang === 'roman_urdu') {
        content = `📊 **Pak Royal College Sharaqpur — Live Student Record:**\n\nPortal par is waqt **total ${totalStudents} students** enrolled hain.\n\n` +
          `• **Active Students:** ${activeCount}\n` +
          `• **Session Wise Breakdown:**\n` +
          Object.entries(yearCounts).map(([y, c]) => `  - Session ${y}: **${c} students**`).join('\n') +
          `\n\n**Top Programs & Classes:**\n` +
          sortedClasses.map(([cls, c]) => `• **${cls}**: ${c} students`).join('\n') +
          `\n\nTamam students ki mukammal directory dekhne ke liye neechay button par click karein.`;
      } else {
        content = `📊 **Pak Royal College Sharaqpur — Live Student Statistics:**\n\nCurrently, there are **${totalStudents} total students** enrolled in the live ERP database.\n\n` +
          `• **Active Enrolment:** ${activeCount} students\n` +
          `• **Academic Session Breakdown:**\n` +
          Object.entries(yearCounts).map(([y, c]) => `  - Session ${y}: **${c} students**`).join('\n') +
          `\n\n**Class-wise Distribution:**\n` +
          sortedClasses.map(([cls, c]) => `• **${cls}**: ${c} students`).join('\n') +
          `\n\nYou can view the full student directory or register a new admission below.`;
      }

      navAction = { route: '/dashboard/student/list', label: 'Student Directory' };
      return { content, navAction };
    } catch (dbErr) {
      console.error('Error fetching student count:', dbErr);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. SPECIFIC CLASS / PROGRAM STUDENT QUERY (e.g. FSC OTT, Nursing, DPT, etc.)
  // ─────────────────────────────────────────────────────────────
  const programMatch = q.match(/\b(fsc ott|ott|fsc nursing|nursing|dental|bs psy|psy|bs dpt|dpt|bs rit|rit|bs cs|cs|bs it|it|lhv|cmw|b category|pharmacy|fa|fsc)\b/i);
  if (programMatch && /student|kitn|how many|count|tadad|list/i.test(q)) {
    try {
      const term = programMatch[1];
      const regex = new RegExp(term, 'i');
      const students = await Student.find({ className: regex }, 'name studentName rollNo admissionNo academicYear className section').limit(15).lean();
      const count = await Student.countDocuments({ className: regex });

      if (lang === 'roman_urdu') {
        content = `🎓 **${term.toUpperCase()} Program Enrolment:**\n\nIs waqt **${term.toUpperCase()}** mein total **${count} students** enrolled hain.\n\n`;
        if (students.length > 0) {
          content += `**Kuch Students ke Records:**\n`;
          students.slice(0, 6).forEach((s, idx) => {
            const stName = s.studentName || s.name || 'Student';
            content += `${idx + 1}. **${stName}** (Roll: ${s.rollNo || 'N/A'}, Adm: ${s.admissionNo || 'N/A'}) - ${s.className}\n`;
          });
        }
      } else {
        content = `🎓 **${term.toUpperCase()} Enrolment Details:**\n\nThere are **${count} students** currently enrolled in **${term.toUpperCase()}**.\n\n`;
        if (students.length > 0) {
          content += `**Sample Enrolled Students:**\n`;
          students.slice(0, 6).forEach((s, idx) => {
            const stName = s.studentName || s.name || 'Student';
            content += `${idx + 1}. **${stName}** (Roll: ${s.rollNo || 'N/A'}, Adm: ${s.admissionNo || 'N/A'}) - ${s.className}\n`;
          });
        }
      }

      navAction = { route: '/dashboard/student/list', label: 'View in Directory' };
      return { content, navAction };
    } catch (e) {
      console.warn('Program student query error:', e);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. TEACHER & STAFF COUNTS & DIRECTORY
  // ─────────────────────────────────────────────────────────────
  if (/teacher|faculty|staff|ustad|mulazim|kitny teacher|kitne teacher|total teacher|total staff/i.test(q)) {
    try {
      const [teacherCount, staffCount, teachers, staffList] = await Promise.all([
        Teacher.countDocuments(),
        Staff.countDocuments(),
        Teacher.find({}, 'name email designation phone department').limit(5).lean(),
        Staff.find({}, 'name staffName email designation department role').limit(5).lean()
      ]);

      const totalFaculty = teacherCount + staffCount;

      if (lang === 'urdu_script') {
        content = `👨‍🏫 **پاک رائل کالج شرقپور — اساتذہ و عملہ کا لائیو ریکارڈ:**\n\nپورٹل پر اس وقت کل **${totalFaculty} فیکلٹی و اسٹاف ممبرز** موجود ہیں:\n` +
          `• **اساتذہ (Teachers):** ${teacherCount}\n` +
          `• **انتظامی اسٹاف (Administrative Staff):** ${staffCount}\n\n` +
          `مزید معلومات یا نیا اسٹاف رجسٹر کرنے کے لیے اسٹاف ڈائریکٹری وزٹ کریں۔`;
      } else if (lang === 'roman_urdu') {
        content = `👨‍🏫 **Pak Royal College — Faculty & Staff Overview:**\n\nCollege portal par is waqt **${totalFaculty} active faculty & staff** registered hain:\n` +
          `• **Registered Teachers:** ${teacherCount}\n` +
          `• **Support & Admin Staff:** ${staffCount}\n\n`;
        
        if (teachers.length > 0) {
          content += `**Active Teachers:**\n`;
          teachers.forEach((t) => {
            content += `• **${t.name}** (${t.designation || 'Faculty Member'} - ${t.department || 'Academics'})\n`;
          });
        }
      } else {
        content = `👨‍🏫 **Faculty & Staff Overview:**\n\nThere are **${totalFaculty} total faculty & staff members** active in the portal:\n` +
          `• **Registered Teachers:** ${teacherCount}\n` +
          `• **Administrative Staff:** ${staffCount}\n\n`;
        
        if (teachers.length > 0) {
          content += `**Faculty Profiles:**\n`;
          teachers.forEach((t) => {
            content += `• **${t.name}** (${t.designation || 'Faculty Member'} - ${t.department || 'Academics'})\n`;
          });
        }
      }

      navAction = { route: '/dashboard/staff/list', label: 'Staff Management' };
      return { content, navAction };
    } catch (err) {
      console.warn('Teacher count error:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. CLASSES & ACADEMIC SECTIONS
  // ─────────────────────────────────────────────────────────────
  if (/class|classes|section|sections|kitni class|total class|kamre/i.test(q)) {
    try {
      const [classCount, sectionCount, classesList] = await Promise.all([
        Class.countDocuments(),
        Section.countDocuments(),
        Class.find({}, 'name class_name academicYear').limit(15).lean()
      ]);

      const classNames = classesList.map(c => c.name || c.class_name).filter(Boolean);

      if (lang === 'roman_urdu') {
        content = `🏫 **Academic Classes & Sections:**\n\nCollege mein **${classCount} classes** aur **${sectionCount} sections** configure hain.\n\n` +
          `**Configured Classes:**\n${classNames.length ? classNames.map(c => `• ${c}`).join('\n') : 'FSC OTT, FSC Nursing, BS PSY, BS RIT, B Category, etc.'}`;
      } else {
        content = `🏫 **Academic Classes & Sections:**\n\nThe ERP has **${classCount} classes** and **${sectionCount} sections** configured.\n\n` +
          `**Registered Classes:**\n${classNames.length ? classNames.map(c => `• ${c}`).join('\n') : 'FSC OTT, FSC Nursing, BS PSY, BS RIT, B Category, etc.'}`;
      }

      navAction = { route: '/dashboard/academics/class', label: 'Class Management' };
      return { content, navAction };
    } catch (err) {
      console.warn('Class query error:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 7. FEES, INVOICES, VOUCHERS & BALANCE
  // ─────────────────────────────────────────────────────────────
  if (/fee|fees|challan|voucher|dues|balance|payment|invoice|kitny paise|jama/i.test(q)) {
    try {
      const [invoices, totalInvoices] = await Promise.all([
        FeesInvoice.find({}).lean(),
        FeesInvoice.countDocuments()
      ]);

      let totalBilled = 0;
      let totalPaid = 0;
      let totalBalance = 0;

      for (const inv of invoices) {
        totalBilled += Number(inv.amount || 0);
        totalPaid += Number(inv.paid || 0);
        totalBalance += Number(inv.balance || (Number(inv.amount || 0) - Number(inv.paid || 0)));
      }

      if (lang === 'roman_urdu') {
        content = `💳 **School Fees & Finance Overview:**\n\n` +
          `• **Total Generated Invoices:** ${totalInvoices}\n` +
          `• **Total Billed Amount:** Rs. ${totalBilled.toLocaleString()}\n` +
          `• **Total Collected / Paid:** Rs. ${totalPaid.toLocaleString()}\n` +
          `• **Outstanding Balance / Dues:** Rs. ${totalBalance.toLocaleString()}\n\n` +
          `Aap Fee Collection portal se kisi bhi student ka fee voucher print ya download kar saktay hain.`;
      } else {
        content = `💳 **Fee Collection & Finance Overview:**\n\n` +
          `• **Total Invoices Generated:** ${totalInvoices}\n` +
          `• **Total Billed:** PKR ${totalBilled.toLocaleString()}\n` +
          `• **Total Collected:** PKR ${totalPaid.toLocaleString()}\n` +
          `• **Outstanding Balance:** PKR ${totalBalance.toLocaleString()}\n\n` +
          `You can generate vouchers, collect payments, and review reports in the Fees section.`;
      }

      navAction = { route: '/dashboard/fees', label: 'Fees Collection' };
      return { content, navAction };
    } catch (err) {
      console.warn('Fee query error:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 8. ATTENDANCE & HAZRI
  // ─────────────────────────────────────────────────────────────
  if (/attendance|hazri|present|absent|late|leave|chutti|chuttiyan/i.test(q)) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [studentAttCount, staffAttCount] = await Promise.all([
        Attendance.countDocuments(),
        StaffAttendance.countDocuments()
      ]);

      if (lang === 'roman_urdu') {
        content = `📋 **Attendance System Record:**\n\nStoofi ERP mein student aur staff attendance modules fully active hain.\n` +
          `• **Total Student Attendance Records:** ${studentAttCount}\n` +
          `• **Total Staff Attendance Records:** ${staffAttCount}\n\n` +
          `Aap daily attendance mark karne ya class-wise report dekhne ke liye neechay diye gaye button par click karein.`;
      } else {
        content = `📋 **Attendance Tracking Overview:**\n\nAttendance modules for both students and staff are operational:\n` +
          `• **Total Student Attendance Logs:** ${studentAttCount}\n` +
          `• **Total Staff Attendance Logs:** ${staffAttCount}\n\n` +
          `Click below to record daily attendance or generate monthly attendance reports.`;
      }

      navAction = { route: '/dashboard/students/attendance', label: 'Attendance Management' };
      return { content, navAction };
    } catch (err) {
      console.warn('Attendance query error:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 9. EXAMINATIONS, DATESHEET & RESULTS
  // ─────────────────────────────────────────────────────────────
  if (/exam|result|marks|grade|datesheet|routine|schedule|paper|imtihan/i.test(q)) {
    try {
      const [examTypes, schedules] = await Promise.all([
        ExamType.countDocuments(),
        ExamSchedule.countDocuments()
      ]);

      if (lang === 'roman_urdu') {
        content = `📝 **Examinations & Results Hub:**\n\nCollege ERP mein **${examTypes} Exam Types** aur **${schedules} Schedules** configure hain.\n\n` +
          `Aap yahan se datesheets generate kar saktay hain, marks register fill kar saktay hain, aur students ke automated printable result cards tayyar kar saktay hain.`;
      } else {
        content = `📝 **Examinations & Grading Hub:**\n\nThe examination module currently has **${examTypes} Exam Types** configured.\n\n` +
          `You can manage exam schedules, input marks, and print comprehensive term result cards.`;
      }

      navAction = { route: '/dashboard/examination/exam-setup', label: 'Examination Portal' };
      return { content, navAction };
    } catch (err) {
      console.warn('Exam query error:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 10. ADMISSIONS & ROLL NUMBER ASSIGNMENT
  // ─────────────────────────────────────────────────────────────
  if (/admission|dakhla|new student|add student|roll no|roll number|adm25|adm26/i.test(q)) {
    if (lang === 'roman_urdu') {
      content = `🎓 **Student Admission & Auto Roll Number System:**\n\nPak Royal College ERP mein student admission form par auto roll number assignment ka advance system active hai:\n\n` +
        `1. **Academic Year Selection:** Form par jaise hi aap session select kartay hain (e.g. **2025** ya **2026**):\n` +
        `   • 2025 ke liye **ADM25 / 2500xx** series assign hoti hai.\n` +
        `   • 2026 ke liye **ADM26 / 2600xx** series assign hoti hai.\n` +
        `2. **Real-Time Next Sequence:** Database se highest roll number check karke agla number auto-suggest hota hai.\n` +
        `3. **Data Sequence:** Form submit hotay waqt Student Name, Father Name, Mother, Address aur Academics ka data mukammal sequence se save hota hai.`;
    } else {
      content = `🎓 **Student Admission & Auto-Sequencing:**\n\nThe admission module features automatic sequential roll and admission numbers:\n\n` +
        `• **Session-Based Prefix:** Selecting **2025** generates the **ADM25 / 2500xx** series; selecting **2026** generates the **ADM26 / 2600xx** series.\n` +
        `• **Live Gap Detection:** Automatically detects existing numbers to assign the correct next sequence.\n` +
        `• **Structured Hierarchy:** Data is strictly stored in sequence (Student, Father, Mother, Guardian, Address, Academics).`;
    }

    navAction = { route: '/dashboard/student/admission', label: 'Open Admission Form' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 11. SETTINGS & CONFIGURATIONS
  // ─────────────────────────────────────────────────────────────
  if (/setting|settings|general settings|base setup|holiday|weekend|email setting|sms setting/i.test(q)) {
    let settingData = null;
    try {
      settingData = await Setting.findOne({}).lean();
    } catch (e) {}

    const schoolName = settingData?.schoolName || 'Pak Royal College Sharaqpur';
    const address = settingData?.address || 'Lal Puli Stop Main Jaranwala Road Sharaqpur Sharif District Sheikhupura';
    const phone = settingData?.phone || '03 111 444 810';

    if (lang === 'roman_urdu') {
      content = `⚙️ **College Settings & System Management:**\n\n• **Institution:** ${schoolName}\n• **Address:** ${address}\n• **Helpline:** ${phone}\n• **Active Session:** ${settingData?.session || '2026'}\n\nTamam modules (Student Settings, Staff Settings, Weekend, Holidays, Base Setup, Fees Settings, Email, SMS & Payment) Settings Hub mein live hain.`;
    } else {
      content = `⚙️ **System Configuration & Settings:**\n\n• **Institution:** ${schoolName}\n• **Address:** ${address}\n• **Contact:** ${phone}\n• **Active Session:** ${settingData?.session || '2026'}\n\nAccess Student Settings, Staff Settings, Weekends, Holidays, Base Setup, Invoices, and Integrations in the Settings Hub.`;
    }

    navAction = { route: '/dashboard/settings', label: 'Settings Hub' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 12. LABS & PRACTICAL FACILITIES
  // ─────────────────────────────────────────────────────────────
  if (/lab|laboratory|practical|apparatus|equipment/i.test(q)) {
    if (lang === 'roman_urdu') {
      content = `🔬 **College Laboratories Management:**\n\nPak Royal College ke tamam practical labs (Physics Lab, Chemistry Lab, Biology Lab, Computer Lab aur Allied Health OTT/MLT Labs) ka record aur practical schedules system mein active hain.`;
    } else {
      content = `🔬 **Laboratory Management System:**\n\nAccess schedules, apparatus inventory, and student practical logs for Physics, Chemistry, Biology, Computer, and Allied Health Labs.`;
    }
    navAction = { route: '/dashboard/labs', label: 'Labs Management' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 13. DIRECT PAGE NAVIGATION REQUESTS
  // ─────────────────────────────────────────────────────────────
  const navTargets = [
    { regex: /student list|students list|show students|view students/i, route: '/dashboard/student/list', label: 'Student Directory' },
    { regex: /new student|add student|admission form/i, route: '/dashboard/student/admission', label: 'Add Student Form' },
    { regex: /teacher list|staff list|manage staff/i, route: '/dashboard/staff/list', label: 'Staff Directory' },
    { regex: /fee portal|fees list|collect fee/i, route: '/dashboard/fees', label: 'Fee Collection' },
    { regex: /attendance page|mark attendance/i, route: '/dashboard/students/attendance', label: 'Attendance' },
    { regex: /exam setup|exam page|datesheet page/i, route: '/dashboard/examination/exam-setup', label: 'Examinations' },
    { regex: /notice board|announcements/i, route: '/dashboard/communicate/notice-board', label: 'Notice Board' },
    { regex: /events page|calendar/i, route: '/dashboard/events', label: 'College Events' },
    { regex: /settings page|open settings/i, route: '/dashboard/settings', label: 'Settings Hub' }
  ];

  for (const item of navTargets) {
    if (item.regex.test(q)) {
      content = lang === 'roman_urdu'
        ? `Ji bilkul! Main aapko **${item.label}** par le chal raha hoon.`
        : `Opening **${item.label}** for you now.`;
      navAction = { route: item.route, label: item.label };
      return { content, navAction };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 14. DEFAULT INTELLIGENT HELPFUL FALLBACK (Never Canned, Always Helpful)
  // ─────────────────────────────────────────────────────────────
  try {
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();

    if (lang === 'urdu_script') {
      content = `میں آپ کے سوال کا لائیو ڈیٹا سے جائزہ لے رہا ہوں۔\n\nاس وقت کالج پورٹل پر **${studentCount} طلباء** اور **${teacherCount} اساتذہ** کے ریکارڈز موجود ہیں۔\n\nآپ مجھ سے براہ راست پوچھ سکتے ہیں:\n• *"ٹوٹل اسٹوڈنٹس کتنے ہیں؟"*\n• *"فیس کلیکشن کا اسٹیٹس کیا ہے؟"*\n• *"اسٹاف یا اساتذہ کی لسٹ دکھاؤ"*`;
    } else if (lang === 'roman_urdu') {
      content = `Main aapka sawaal samajh raha hoon. Is waqt Pak Royal College ERP portal par **total ${studentCount} students** aur **${teacherCount} teachers** live registered hain.\n\nAap mujh se specifically in topics par pooch saktay hain:\n• *"Total kitny student hai?"* (Ya kisi specific class ke baray mein)\n• *"College mein kitnay teachers hain?"*\n• *"Fees collection aur pending dues ka status"*\n• *"Admission aur Roll number assignment kaise hota hai"*\n• *"Attendance aur exams schedule"*`;
    } else {
      content = `I understand your inquiry. The live college portal currently tracks **${studentCount} enrolled students** and **${teacherCount} faculty members**.\n\nYou can ask me directly for:\n• Student enrolments by session or program\n• Teacher and staff counts\n• Fee collection and outstanding dues\n• Attendance and daily routines\n• Examination schedules and report cards`;
    }

    navAction = { route: '/dashboard', label: 'Dashboard Overview' };
    return { content, navAction };
  } catch (err) {
    content = `Stoofi AI live ERP assistant active hai. Aap student count, teachers, fees, attendance ya settings ke hawalay se kuch bhi pooch saktay hain.`;
    return { content, navAction: { route: '/dashboard', label: 'Dashboard' } };
  }
}

/**
 * POST /api/ai/chat
 */
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { message, conversationId, pageContext } = body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message text is required.' },
        { status: 400 }
      );
    }

    const rawMessage = message.trim();
    const user = await getAuthUser(req);
    const userId = user?._id || null;
    const userRole = user?.role || 'Super Admin';

    // 1. Manage Conversation (Find existing or create new)
    let conv = null;
    if (conversationId && conversationId !== 'new') {
      try {
        conv = await AIConversation.findById(conversationId);
      } catch (e) {}
    }

    if (!conv) {
      const autoTitle = rawMessage.slice(0, 36) + (rawMessage.length > 36 ? '...' : '');
      conv = await AIConversation.create({
        userId,
        title: autoTitle,
        role: userRole
      });
    }

    // 2. Persist User Message
    try {
      await AIMessage.create({
        conversationId: conv._id,
        userId,
        role: 'user',
        content: rawMessage
      });
    } catch (e) {
      console.warn('AI: User message save failed (non-fatal):', e?.message);
    }

    // 3. Resolve Query using Intelligent Live ERP Engine
    const { content, navAction } = await resolveErpQuery(rawMessage, user, pageContext);

    // 4. Persist Assistant Response
    let assistantMsgDoc = null;
    try {
      assistantMsgDoc = await AIMessage.create({
        conversationId: conv._id,
        userId,
        role: 'assistant',
        content,
        navAction
      });
    } catch (e) {
      console.warn('AI: Assistant message save failed (non-fatal):', e?.message);
    }

    const msgPayload = {
      id: assistantMsgDoc?._id?.toString() || `ai-${Date.now()}`,
      _id: assistantMsgDoc?._id?.toString() || `ai-${Date.now()}`,
      role: 'assistant',
      content,
      navAction,
      createdAt: assistantMsgDoc?.createdAt || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      conversationId: conv._id.toString(),
      message: msgPayload,
      data: {
        conversationId: conv._id.toString(),
        message: msgPayload
      }
    });
  } catch (error) {
    console.error('API /api/ai/chat error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Stoofi AI service error.'
      },
      { status: 500 }
    );
  }
}
