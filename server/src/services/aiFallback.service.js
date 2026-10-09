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
    /\b(mera|meri|meray|mere|mujhe|mujhy|mujhko|hum|humein|aap|aapki|aapka|aapke|tum|tumhara|tumhari|apna|apni)\b/i,
    /\b(kya|kyun|kyu|kaise|kese|kahan|kidhar|kab|kitna|kitni|kitne|kitny|kon|kis|kisko)\b/i,
    /\b(hai|hain|ho|hoon|hun|tha|thi|the|hoga|hogi|hogay|hoge)\b/i,
    /\b(karo|kardo|karna|karein|kare|karta|karti|karte|dekho|dikhao|batao|btao|bhejo|bhej|dekhna)\b/i,
    /\b(acha|theek|thik|shukriya|shukria|zabardast|bhai|sahib|janab|hazir|ji|jee|haan|nahi|nhi|mat)\b/i,
    /\b(hazri|chutti|chuttiyan|kaam|parhai|dakhla|paisa|paise|mahina|mahine|pichlay|pichle|agle|aaj|kal|parso)\b/i,
    /\b(salam|assalam|walekum|walaikum|aoa|kholo|khul|le jao|chalo|bata|bataen|bhool|bhul)\b/i,
    /\b(mein|me|se|say|ko|ka|ki|ke|kay|par|pe|aur|or|bhi|tak|wala|wali|wale|gy|gaya|gaye)\b/i
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
      else if (/password|passowrd|reset|login/i.test(text)) lastTopic = 'password';
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
  // 1. PASSWORD RESET / FORGOT PASSWORD / ACCOUNT RECOVERY INTENT
  // ─────────────────────────────────────────────────────────────
  const isPasswordQuery = /pass(word|owrd|wrd)|bhool|bhul|reset|forgot|recover|change pass|login nahi|id bhool|credentials/i.test(query) &&
    /pass(word|owrd|wrd)|bhool|bhul|reset|forgot|recover|change|kya karun|kia karo|kese|kaise|account/i.test(query);

  if (isPasswordQuery) {
    if (lang === 'urdu_script') {
      content = `اگر آپ اپنا **اسٹوڈنٹ پورٹل یا اکاؤنٹ پاس ورڈ بھول گئے ہیں**، تو درج ذیل آسان مراحل پر عمل کریں:\n\n` +
        `1️⃣ **Forgot Password لنک پر جائیں:** لاگ ان پیج پر **"Forgot Password?"** کے آپشن پر کلک کریں۔\n` +
        `2️⃣ **رجسٹرڈ ای میل یا یوزر نیم درج کریں:** اپنا رجسٹرڈ ای میل ایڈریس یا داخلہ نمبر (Admission No) درج کر کے **"Send OTP"** پر کلک کریں۔\n` +
        `3️⃣ **OTP کوڈ حاصل کریں:** آپ کے ای میل پر 6 ہندسوں کا تصدیقی کوڈ (OTP) موصول ہوگا۔\n` +
        `4️⃣ **نیا پاس ورڈ سیٹ کریں:** موصولہ OTP درج کریں اور اپنا نیا پاس ورڈ منتخب کر لیں۔\n\n` +
        `💡 *نوٹ: اگر آپ کا ای میل ایڈریس سسٹم میں رجسٹر نہیں ہے تو اپنے اسکول ایڈمنسٹریٹر یا کلاس انچارج سے رابطہ کریں، وہ فوری طور پر آپ کا پاس ورڈ ری سیٹ کر دیں گے۔*`;
    } else if (lang === 'roman_urdu') {
      content = `Agar aap apna **Student Portal / Dashboard password bhool gaye hain**, toh yeh aasan tareeqa follow karein:\n\n` +
        `1️⃣ **Forgot Password:** Login page par **"Forgot Password?"** par click karein ya neechay diye gaye button ko dabayein.\n` +
        `2️⃣ **Email / Username Enter Karein:** Apna registered email address ya Admission Number enter karke **"Send OTP"** par click karein.\n` +
        `3️⃣ **OTP Check Karein:** Aapke email inbox (ya Spam folder) mein 6-digit ka verification code aayega.\n` +
        `4️⃣ **New Password Banayein:** OTP enter karein aur apna naya strong password set kar lein.\n\n` +
        `💡 *Tip: Agar aapke paas email ka access nahi hai, toh school admin ya class in-charge se direct contact karein, woh 1 minute mein aapka password reset kardenge.*`;
    } else {
      content = `If you have **forgotten your Student Portal password**, please follow these simple steps to recover your account:\n\n` +
        `1️⃣ **Go to Forgot Password:** Click the **"Forgot Password?"** link on the login screen or use the direct action button below.\n` +
        `2️⃣ **Enter Email / Username:** Provide your registered school email address or Admission Number and click **"Send OTP"**.\n` +
        `3️⃣ **Check Verification Code:** A 6-digit one-time passcode (OTP) will be sent to your registered email.\n` +
        `4️⃣ **Create New Password:** Enter the OTP and choose your new password.\n\n` +
        `💡 *Note: If you do not have access to your registered email, please contact your School Administration to reset your password directly.*`;
    }

    navAction = { route: '/forgot-password', label: 'Forgot Password Page' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. COURTESY / GRATITUDE / CLOSINGS
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
  // 3. GREETINGS & SMALL TALK
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
  // 4. CAPABILITY / IDENTITY / HELP REQUESTS
  // ─────────────────────────────────────────────────────────────
  if (/(who are you|what can you do|tum kya kar sakte ho|tum kon ho|ap kon ho|kya kar sakty ho|what is stoofi ai|help me|meri madad karo|guide me)/i.test(query)) {
    if (lang === 'urdu_script') {
      content = `میں **Stoofi AI** ہوں، آپ کا ذہین اسکول اسسٹنٹ۔ میں آپ کی **حاضری**، **ہوم ورک اسائنمنٹس**، **فیس واؤچرز**، **امتحانی نمبرات** اور پورٹل کے استعمال میں مکمل رہنمائی فراہم کرتا ہوں۔ آپ اردو یا انگلش میں کچھ بھی پوچھ سکتے ہیں۔`;
    } else if (lang === 'roman_urdu') {
      content = `Main **Stoofi AI** hoon, aapka smart school assistant! 🤖\n\nMain aapki **attendance (hazri)**, **homework assignments**, **fees invoices & balance dues**, **exam marks & results**, **labs & timetable**, aur **password recovery** mein direct madad kar sakta hoon. Aap jo bhi poochna chahein, pooch saktay hain!`;
    } else {
      content = `I am **Stoofi AI**, your school management and academic assistant. I can check your **attendance percentage**, **homework assignments**, **fee dues**, **examination marks**, and provide step-by-step guidance for any Stoofi ERP feature.`;
    }
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. ATTENDANCE INTENTS (Live Data Query)
  // ─────────────────────────────────────────────────────────────
  const isAttendanceQuery = /attendance|hazri|present|absent|late|half day|chutti|chuttiyan|kitne din aya|kitny din aya/i.test(query) ||
    (lastTopic === 'attendance' && /(last month|pichlay mahine|pichle month|this month|is mahine|last week|pichlay hafte|this week|is hafte|yesterday|kal|today|aaj|absent|kitny|percentage|rate)/i.test(query));

  if (isAttendanceQuery) {
    try {
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

      if (res && res.type === 'student_attendance') {
        const s = res.summary || {};
        if (lang === 'urdu_script') {
          content = `آپ کی کل حاضری **${s.attendanceRate || '100%'}** ہے (${s.present || 0} دن حاضر، ${s.absent || 0} دن غیر حاضر، ${s.late || 0} دن لیٹ)۔`;
        } else if (lang === 'roman_urdu') {
          content = `Aapki overall attendance rate **${s.attendanceRate || '100%'}** hai (${s.present || 0} Present, ${s.absent || 0} Absent, ${s.late || 0} Late).`;
        } else {
          content = `Your overall attendance is **${s.attendanceRate || '100%'}** (${s.present || 0} Present, ${s.absent || 0} Absent, ${s.late || 0} Late).`;
        }
        navAction = { route: '/dashboard/student/attendance', label: 'Attendance Records' };
        return { content, navAction };
      }

      if (res && res.type === 'admin_attendance_overview') {
        if (lang === 'roman_urdu') {
          content = `Aaj school mein total **${res.todayCount || 0}** attendance records hain: **${res.presentCount || 0} Present** aur **${res.absentCount || 0} Absent**.`;
        } else {
          content = `Today's attendance summary: **${res.presentCount || 0} Present**, **${res.absentCount || 0} Absent** out of **${res.todayCount || 0}** records.`;
        }
        navAction = { route: '/dashboard/students/attendance', label: 'Attendance Management' };
        return { content, navAction };
      }
    } catch (e) {
      console.warn('Attendance query fallback error:', e);
    }

    content = lang === 'roman_urdu'
      ? `Aap apna attendance record check karne ke liye neechay diye gaye button par click karein.`
      : `You can view your complete attendance breakdown using the link below.`;
    navAction = { route: role === 'Student' ? '/dashboard/student/attendance' : '/dashboard/students/attendance', label: 'Attendance Page' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. HOMEWORK INTENTS (Live Data Query)
  // ─────────────────────────────────────────────────────────────
  const isHomeworkQuery = /homework|assignment|kaam|task|submit|submission/i.test(query) ||
    (lastTopic === 'homework' && /(pending|complete|completed|maths|science|english|urdu|physics|chemistry|biology|computer|islamiat|deadline|due|kab tak)/i.test(query));

  if (isHomeworkQuery) {
    try {
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
          content = lang === 'roman_urdu'
            ? `Aapka is waqt koi pending homework nahi hai! Sab assignments complete hain. 🎉`
            : `You currently have 0 pending homework assignments. All caught up! 🎉`;
        } else {
          const count = res.homeworks.length;
          content = lang === 'roman_urdu'
            ? `Aapke **${count} homework assignments** hain:\n\n`
            : `You have **${count} homework assignment(s)**:\n\n`;
          res.homeworks.slice(0, 4).forEach((hw, idx) => {
            content += `• **${hw.subject}**: ${hw.description || 'Assignment'} (Submission: ${hw.submissionDate || 'N/A'})\n`;
          });
        }
        navAction = { route: '/dashboard/student/homework', label: 'My Homework' };
        return { content, navAction };
      }
    } catch (e) {
      console.warn('Homework query fallback error:', e);
    }

    content = lang === 'roman_urdu'
      ? `Aap apna homework dekhne aur submit karne ke liye niche button par click karein.`
      : `You can view and submit your homework assignments using the link below.`;
    navAction = { route: role === 'Student' ? '/dashboard/student/homework' : '/dashboard/academic/homework', label: 'Homework Page' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. FEES & INVOICE INTENTS
  // ─────────────────────────────────────────────────────────────
  if (/fee|fees|invoice|dues|balance|challan|voucher|payment|paise|baki|kitne paise|arrears/i.test(query)) {
    try {
      const res = await executeTool('get_my_fees', {}, user);
      if (res && (role === 'Student' || role === 'Parent')) {
        const s = res.summary || {};
        if (lang === 'roman_urdu') {
          content = `Aapki fee details yeh hain:\n- Total Billed: **${s.totalBilled || 'PKR 0'}**\n- Total Paid: **${s.totalPaid || 'PKR 0'}**\n- Outstanding Balance: **${s.outstandingBalance || 'PKR 0'}**`;
        } else {
          content = `Your tuition fee status:\n- Total Billed: **${s.totalBilled || 'PKR 0'}**\n- Total Paid: **${s.totalPaid || 'PKR 0'}**\n- Outstanding Balance: **${s.outstandingBalance || 'PKR 0'}**`;
        }
        navAction = { route: '/dashboard/student/fees', label: 'Fee Invoices' };
        return { content, navAction };
      }
    } catch (e) {
      console.warn('Fees query fallback error:', e);
    }

    content = lang === 'roman_urdu'
      ? `Aap apni fee invoices, payment history aur bank vouchers check karne ke liye Fee portal open karein.`
      : `You can view your fee invoices, receipts, and payment history below.`;
    navAction = { route: role === 'Student' ? '/dashboard/student/fees' : '/dashboard/fees', label: 'Fees Portal' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 8. EXAM MARKS & RESULTS INTENTS
  // ─────────────────────────────────────────────────────────────
  if (/mark|marks|result|exam|grade|gpa|number|paper|imtihan|date sheet/i.test(query)) {
    try {
      const res = await executeTool('get_my_marks', {}, user);
      if (res && res.records && res.records.length > 0) {
        content = lang === 'roman_urdu'
          ? `Aapke exam marks records:\n` + res.records.slice(0, 5).map(m => `• Marks: **${m.marks}/${m.totalMarks}** (Grade: ${m.grade || 'N/A'}, GPA: ${m.gpa || 'N/A'})`).join('\n')
          : `Your examination records:\n` + res.records.slice(0, 5).map(m => `• Marks: **${m.marks}/${m.totalMarks}** (Grade: ${m.grade || 'N/A'})`).join('\n');
        navAction = { route: '/dashboard/student', label: 'Exam Results' };
        return { content, navAction };
      }
    } catch (e) {
      console.warn('Marks query fallback error:', e);
    }

    content = lang === 'roman_urdu'
      ? `Aap apne examination marks, grades aur report cards check karne ke liye results portal open karein.`
      : `You can view your examination marks, report cards, and grades using the link below.`;
    navAction = { route: role === 'Student' ? '/dashboard/student' : '/dashboard/exam/marks-register', label: 'Results Section' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 9. LABS & PRACTICAL SESSIONS INTENT
  // ─────────────────────────────────────────────────────────────
  if (/lab|labs|practical|laboratory|equipment|consumables|experiment|science lab|computer lab|physics lab|chemistry lab|biology lab/i.test(query)) {
    if (lang === 'roman_urdu') {
      content = `🔬 **Laboratories Management System:**\n\nStoofi ERP mein campus labs, practical schedules, equipment assets, consumables aur safety audits ka mukammal record mojood hai. Aap labs ka schedule aur experiments check kar saktay hain.`;
    } else {
      content = `🔬 **Laboratories Management System:**\n\nAccess real-time laboratory schedules, equipment inventory, consumables tracking, and practical sessions across campus.`;
    }
    navAction = { route: '/dashboard/labs', label: 'Open Labs Center' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 10. TIMETABLE / CLASS ROUTINE INTENT
  // ─────────────────────────────────────────────────────────────
  if (/routine|timetable|schedule|period|class timing|class routine|lecture|when is class/i.test(query)) {
    if (lang === 'roman_urdu') {
      content = `📅 **Class Routine & Schedule:**\n\nAapki class ka daily timetable, teacher periods, aur break timings check karne ke liye Routine page open karein.`;
    } else {
      content = `📅 **Class Routine & Timetable:**\n\nView your daily class periods, subject slots, teacher assignments, and classroom schedule below.`;
    }
    navAction = { route: '/dashboard/academics/routine', label: 'Class Routine' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 11. PROFILE & PERSONAL DETAILS INTENT
  // ─────────────────────────────────────────────────────────────
  if (/my profile|my account|my details|mera account|mera data|meri information|father name|admission no|roll no|class|section/i.test(query)) {
    try {
      const res = await executeTool('get_my_profile', {}, user);
      const u = res.user;
      if (lang === 'roman_urdu') {
        content = `👤 **Profile Information:**\n\n- **Name:** ${u.name}\n- **Role:** ${u.role}\n- **Email:** ${u.email}\n- **Institution:** ${u.schoolName}\n`;
        if (u.academicDetails?.className) {
          content += `- **Class & Section:** ${u.academicDetails.className} (${u.academicDetails.section || 'A'})\n- **Roll No:** ${u.academicDetails.rollNo || 'N/A'}\n- **Admission No:** ${u.academicDetails.admissionNo || 'N/A'}\n`;
        }
      } else {
        content = `👤 **Profile Details:**\n\n- **Name:** ${u.name}\n- **Role:** ${u.role}\n- **Email:** ${u.email}\n- **Institution:** ${u.schoolName}\n`;
        if (u.academicDetails?.className) {
          content += `- **Class:** ${u.academicDetails.className} (${u.academicDetails.section || 'A'})\n- **Roll No:** ${u.academicDetails.rollNo || 'N/A'}\n`;
        }
      }
      navAction = { route: '/dashboard/profile', label: 'My Profile' };
      return { content, navAction };
    } catch (e) {
      console.warn('Profile query fallback error:', e);
    }

    content = lang === 'roman_urdu'
      ? `Aap apni profile details dekhne aur update karne ke liye profile page open karein.`
      : `You can view and edit your profile information using the link below.`;
    navAction = { route: '/dashboard/profile', label: 'My Profile' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 12. LIBRARY INTENT
  // ─────────────────────────────────────────────────────────────
  if (/library|book|books|kitab|issue book|return book|borrow/i.test(query)) {
    content = lang === 'roman_urdu'
      ? `📚 **Library Management:**\n\nAap library catalogue se books search kar saktay hain, apni issued books ka status aur due dates check kar saktay hain.`
      : `📚 **Library Management:**\n\nBrowse library catalog, search available books, check your borrowed items, and view return due dates.`;
    navAction = { route: '/dashboard/library', label: 'Library Catalog' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 13. COMPLAINTS & HELPDESK INTENT
  // ─────────────────────────────────────────────────────────────
  if (/complaint|shikayat|issue report|feedback|helpdesk|problem/i.test(query)) {
    content = lang === 'roman_urdu'
      ? `📝 **Complaint & Helpdesk:**\n\nAgar aapko kisi bhi mamlay mein shikayat darj karwani hai ya admin se contact karna hai, toh aap Complaint form submit kar saktay hain.`
      : `📝 **Complaints & Grievance Desk:**\n\nYou can submit an inquiry or report an issue directly to the school administration using the complaint form.`;
    navAction = { route: '/dashboard/admin/complaint', label: 'Submit Complaint' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 14. LEAVE APPLICATION INTENT
  // ─────────────────────────────────────────────────────────────
  if (/leave|chutti|darkhwast|sick leave|casual leave|apply leave/i.test(query)) {
    content = lang === 'roman_urdu'
      ? `🏖️ **Leave Application:**\n\nChutti ki darkhwast (Leave Application) submit karne ke liye dates aur reason select karke submit karein.`
      : `🏖️ **Leave Application:**\n\nSubmit your leave request with date range and reason for administration approval.`;
    navAction = { route: '/dashboard/hr/leave', label: 'Leave Portal' };
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 15. NAVIGATION INTENTS (Safe 1-click Page Jumps)
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
      try {
        const res = await executeTool('navigate_to_page', { target: item.target }, user);
        content = lang === 'roman_urdu'
          ? `Ji bilkul! Main aapko **${res.label}** section par le chal raha hoon.`
          : `Opening **${res.label}** for you.`;
        navAction = { route: res.route, label: res.label };
        return { content, navAction };
      } catch (e) {
        console.warn('Navigation fallback error:', e);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 16. BASIC MATH CALCULATIONS
  // ─────────────────────────────────────────────────────────────
  const mathMatch = query.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/xX])\s*(\d+(?:\.\d+)?)/);
  if (mathMatch) {
    const n1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const n2 = parseFloat(mathMatch[3]);
    let result = 0;
    if (op === '+') result = n1 + n2;
    else if (op === '-') result = n1 - n2;
    else if (op === '*' || op.toLowerCase() === 'x') result = n1 * n2;
    else if (op === '/') result = n2 !== 0 ? (n1 / n2) : 'Undefined (cannot divide by zero)';

    content = lang === 'roman_urdu'
      ? `**${n1} ${op} ${n2}** ka answer **${result}** hai.`
      : `The result of **${n1} ${op} ${n2}** is **${result}**.`;
    return { content, navAction };
  }

  // ─────────────────────────────────────────────────────────────
  // 17. DIRECT GENERAL CONVERSATIONAL RESPONSE
  // ─────────────────────────────────────────────────────────────
  if (lang === 'urdu_script') {
    content = `میں آپ کے سوال کو سمجھ رہا ہوں۔ Stoofi پورٹل پر اپنی **حاضری**، **ہوم ورک**، **فیس واؤچرز**، **امتحانی نمبرات**، یا **پاس ورڈ ری سیٹ** کے بارے میں براہ راست پوچھیں، میں فوری معلومات فراہم کروں گا!`;
  } else if (lang === 'roman_urdu') {
    content = `Main aapka sawaal samajh gaya hoon. Stoofi portal par apni **attendance**, **homework**, **fees vouchers**, **exam marks**, **password reset**, ya kisi bhi page ke baare mein direct poochiye, main foran exact details bataoonga!`;
  } else {
    content = `I understand your query. You can ask me directly about your **attendance**, **homework assignments**, **fee invoices**, **examination marks**, **password recovery**, or navigation assistance.`;
  }

  navAction = { route: role === 'Student' ? '/dashboard/student' : '/dashboard', label: 'Dashboard' };
  return { content, navAction };
}

module.exports = {
  generateIntelligentFallbackResponse,
  detectLanguage
};
