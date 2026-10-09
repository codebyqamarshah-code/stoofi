// lib/searchConfig.js
// Universal Role-Aware Search Index with dynamic menu indexing & rich bilingual synonyms

import { DEFAULT_MENU_STRUCTURE, TEACHER_MENU_STRUCTURE, STUDENT_MENU_STRUCTURE } from './sidebarConfig.js';

// Rich keyword synonyms and aliases for deep search matching
const SYNONYMS_MAP = {
  // Academics
  '/dashboard/academics/optional-subject': ['optional subject', 'optional', 'elective', 'subject', 'mazmoon', 'ikhtiari', 'course'],
  '/dashboard/academics/section': ['section', 'sections', 'class section', 'division', 'group'],
  '/dashboard/academics/class': ['class', 'classes', 'grade', 'standard', 'jamaat'],
  '/dashboard/academics/subjects': ['subjects', 'subject list', 'courses', 'mazameen', 'curriculum'],
  '/dashboard/academics/assign-class-teacher': ['assign class teacher', 'class teacher', 'incharge', 'teacher allocation'],
  '/dashboard/academics/assign-subject': ['assign subject', 'teacher subject', 'subject allocation'],
  '/dashboard/academics/classroom': ['class room', 'classroom', 'rooms', 'hall', 'kamra'],
  '/dashboard/academics/routine': ['class routine', 'routine', 'time table', 'timetable', 'schedule', 'periods'],

  // Administration
  '/dashboard/admin/admission-query': ['admission query', 'admission enquiry', 'new admission', 'inquiry', 'dakhla enquiry', 'lead'],
  '/dashboard/admin/visitor-book': ['visitor book', 'visitors', 'guest', 'guest list', 'mehmaan', 'visiting'],
  '/dashboard/admin/complaint': ['complaint', 'complaints', 'feedback', 'grievance', 'issue', 'shikayat'],
  '/dashboard/admin/postal-receive': ['postal receive', 'receive post', 'inward mail', 'dak', 'courier receive'],
  '/dashboard/admin/postal-dispatch': ['postal dispatch', 'dispatch', 'outward mail', 'dak dispatch', 'send post'],
  '/dashboard/admin/phone-call-log': ['phone call log', 'call log', 'telephone', 'phone calls', 'call history'],
  '/dashboard/admin/id-card': ['id card', 'identity card', 'student id card', 'staff id card', 'shanakhti card'],
  '/dashboard/admin/certificate': ['certificate', 'cert', 'sanad', 'achievement certificate'],
  '/dashboard/admin/generate-certificate': ['generate certificate', 'issue certificate', 'print certificate', 'create cert'],
  '/dashboard/admin/generate-id-card': ['generate id card', 'print id card', 'create id card'],
  '/dashboard/admin/setup': ['admin setup', 'setup', 'admin settings', 'purpose', 'complaint type', 'source'],

  // Labs
  '/dashboard/labs': ['labs', 'lab', 'laboratory', 'science lab', 'computer lab', 'physics lab', 'chemistry lab', 'biology lab', 'lab overview'],
  '/dashboard/labs/categories': ['lab categories', 'lab category', 'types of lab'],
  '/dashboard/labs/manage': ['manage labs', 'lab list', 'all labs', 'add lab'],
  '/dashboard/labs/equipment': ['lab equipment', 'equipment & assets', 'apparatus', 'instruments', 'tools', 'machines', 'assets'],
  '/dashboard/labs/consumables': ['consumables', 'chemicals', 'reagents', 'lab supplies', 'glassware'],
  '/dashboard/labs/schedule': ['lab schedule', 'lab timetable', 'lab slot', 'lab booking', 'booking'],
  '/dashboard/labs/practicals': ['practicals', 'experiments', 'lab practicals', 'lab test', 'lab assignment'],
  '/dashboard/labs/issue-return': ['issue return', 'equipment issue', 'return equipment', 'borrow equipment'],
  '/dashboard/labs/maintenance': ['lab maintenance', 'repair', 'servicing', 'calibration', 'equipment repair'],
  '/dashboard/labs/safety': ['safety & incidents', 'lab safety', 'hazard', 'safety protocol', 'incident report', 'first aid'],
  '/dashboard/labs/reports': ['lab reports', 'lab analytics', 'equipment report', 'usage report'],
  '/dashboard/labs/settings': ['lab settings', 'laboratory configuration'],

  // Students
  '/dashboard/students': ['students', 'student list', 'all students', 'manage students', 'talib ilm', 'pupils', 'directory'],
  '/dashboard/students/add': ['add student', 'new student', 'enroll student', 'admission form', 'noya student', 'dakhla form'],
  '/dashboard/students/category': ['student category', 'category', 'student categories'],
  '/dashboard/students/multi-class': ['multi class student', 'multiple classes'],
  '/dashboard/students/delete-record': ['delete student record', 'remove student', 'delete student', 'trash'],
  '/dashboard/students/unassigned': ['unassigned student', 'unassigned'],
  '/dashboard/students/attendance': ['student attendance', 'attendance', 'hazri', 'mark attendance', 'daily attendance', 'present', 'absent'],
  '/dashboard/students/groups': ['student group', 'student groups', 'clubs', 'houses'],
  '/dashboard/students/promote': ['student promote', 'promote student', 'class upgrade', 'pass student', 'session promotion'],
  '/dashboard/students/disabled': ['disabled students', 'inactive students', 'deactivated students', 'left students'],
  '/dashboard/students/subject-attendance': ['subject wise attendance', 'period attendance', 'subject attendance'],
  '/dashboard/students/export': ['student export', 'export student', 'download student list', 'excel export'],
  '/dashboard/students/sms-sending-time': ['sms sending time', 'attendance sms time', 'sms schedule'],

  // Fees
  '/dashboard/fees/collection': ['fees collection', 'collect fees', 'fee payment', 'pay fee', 'receive fees', 'fees', 'fee', 'paisa'],
  '/dashboard/fees/group': ['fees group', 'fee group', 'fee package'],
  '/dashboard/fees/type': ['fees type', 'fee heads', 'tuition fee', 'admission fee', 'exam fee'],
  '/dashboard/fees/invoice': ['fees invoice', 'invoice', 'challan', 'fee voucher', 'bill', 'receipt'],
  '/dashboard/fees/bank-payment': ['bank payment', 'bank deposit', 'slip payment', 'bank transfer fee'],
  '/dashboard/fees/carry-forward': ['fees carry forward', 'previous balance', 'arrears', 'due balance'],

  // Homework
  '/dashboard/homework/add': ['add homework', 'create homework', 'assign homework', 'new homework', 'ghar ka kaam'],
  '/dashboard/homework/list': ['homework list', 'homework', 'all homework', 'assignments', 'home work'],
  '/dashboard/homework/report': ['homework report', 'homework evaluation', 'submission report'],

  // Study Material
  '/dashboard/study/upload': ['upload content', 'upload material', 'upload notes', 'study upload'],
  '/dashboard/study/assignment': ['assignment', 'study assignment', 'coursework'],
  '/dashboard/study/syllabus': ['syllabus', 'curriculum', 'course syllabus', 'nisab'],
  '/dashboard/study/downloads': ['other downloads', 'downloads', 'materials', 'notes download'],

  // Lesson Plan
  '/dashboard/lesson-plan/lesson': ['lesson', 'lessons', 'sabaq', 'chapter'],
  '/dashboard/lesson-plan/topic': ['topic', 'topics', 'unwan'],
  '/dashboard/lesson-plan/topic-overview': ['topic overview', 'topics list'],
  '/dashboard/lesson-plan/plan': ['lesson plan', 'create lesson plan', 'teaching plan'],
  '/dashboard/lesson-plan/overview': ['lesson plan overview', 'lesson progress'],

  // Examination
  '/dashboard/examination/exam-type': ['exam type', 'term', 'midterm', 'final exam', 'annual exam', 'test type'],
  '/dashboard/examination/exam-setup': ['exam setup', 'setup examination', 'create exam'],
  '/dashboard/examination/exam-schedule': ['exam schedule', 'datesheet', 'date sheet', 'exam timetable', 'imtihan schedule'],
  '/dashboard/examination/exam-attendance': ['exam attendance', 'attendance sheet for exam'],
  '/dashboard/examination/marks-register': ['marks register', 'enter marks', 'result entry', 'grade book', 'number entry'],
  '/dashboard/examination/marks-grade': ['marks grade', 'grading system', 'gpa', 'grades', 'a grade'],
  '/dashboard/examination/send-marks-by-sms': ['send marks by sms', 'sms result', 'result sms'],
  '/dashboard/examination/marksheet-report': ['marksheet report', 'marksheet', 'result card', 'report card', 'sanad'],

  // Online Exam
  '/dashboard/online-exam': ['online exam', 'computer based test', 'cbt', 'quiz exam'],
  '/dashboard/online-exam/question-group': ['question group', 'mcq group'],
  '/dashboard/online-exam/question-bank': ['question bank', 'mcqs', 'questions pool', 'test questions'],

  // Human Resource
  '/dashboard/hr/designation': ['designation', 'designations', 'job titles', 'post', 'rank'],
  '/dashboard/hr/department': ['department', 'departments', 'academic dept', 'admin dept', 'shoba'],
  '/dashboard/hr/add-staff': ['add staff', 'add teacher', 'new employee', 'hire staff', 'new teacher'],
  '/dashboard/hr/staff-directory': ['staff directory', 'staff list', 'teachers', 'all teachers', 'employees', 'ustad'],
  '/dashboard/hr/staff-attendance': ['staff attendance', 'teacher attendance', 'employee attendance', 'staff hazri'],
  '/dashboard/hr/payroll': ['payroll', 'salary', 'pay salary', 'tankhwah', 'staff salary', 'payslip'],

  // Leave
  '/dashboard/leave/apply': ['apply leave', 'leave application', 'leave request', 'chutti application', 'sick leave'],
  '/dashboard/leave/approve': ['approve leave request', 'approve leave', 'leave approvals', 'leave management'],
  '/dashboard/leave/pending': ['pending leave request', 'pending leaves', 'leave inbox'],
  '/dashboard/leave/define': ['leave define', 'leave quota', 'annual leave limit'],
  '/dashboard/leave/type': ['leave type', 'types of leaves', 'medical leave', 'casual leave'],

  // Utilities & Communication
  '/dashboard/utilities/chat/chat-box': ['chat', 'stoofi ai', 'chat box', 'ai bot', 'ai assistant', 'messages', 'talk to ai'],
  '/dashboard/utilities/communicate/notice-board': ['notice board', 'notices', 'announcements', 'elan', 'circular', 'notice list'],
  '/dashboard/utilities/communicate/send-email-sms': ['send email sms', 'send sms', 'send email', 'broadcast message', 'bulk sms'],
  '/dashboard/utilities/communicate/email-sms-log': ['email sms log', 'sms history', 'sent log', 'message history'],
  '/dashboard/utilities/communicate/event': ['events', 'event', 'calendar events', 'upcoming events', 'celebration', 'taqreeb'],
  '/dashboard/utilities/communicate/calendar': ['calendar', 'academic calendar', 'date calendar', 'school calendar'],
  '/dashboard/utilities/communicate/email-template': ['email template', 'templates'],
  '/dashboard/utilities/communicate/sms-template': ['sms template', 'message templates'],
  '/dashboard/utilities/style/background-settings': ['background settings', 'theme bg', 'wallpaper'],
  '/dashboard/utilities/style/color-theme': ['color theme', 'theme colors', 'palette', 'dark light theme'],

  // Settings
  '/dashboard/settings/billing': ['subscription', 'billing', 'plan', 'safepay', 'pricing', 'invoices', 'receipts', 'student quota', 'payment history', 'upgrade plan'],
  '/dashboard/settings/general': ['settings', 'general settings', 'system settings', 'school configuration'],
  '/dashboard/settings/general/holiday': ['holiday', 'holidays', 'school holidays', 'chutti list', 'vacations'],
  '/dashboard/settings/general/weekend': ['weekend', 'weekend setup', 'sunday holiday', 'saturday'],
  '/dashboard/settings/general/backup': ['backup', 'database backup', 'data export', 'system backup'],
  '/dashboard/settings/general/language-settings': ['language settings', 'language', 'urdu', 'english', 'arabic'],
  '/dashboard/settings/super-admin': ['super admin settings', 'system config', 'school owner settings'],
  '/dashboard/sidebar-manager': ['sidebar manager', 'customize sidebar', 'menu settings', 'reorder menu'],

  // Library & Transport & Dormitory
  '/dashboard/library/books': ['library', 'books', 'book list', 'library catalog', 'kitabein'],
  '/dashboard/library/add-book': ['add book', 'new book', 'library entry'],
  '/dashboard/library/issue-return-book': ['issue return book', 'borrow book', 'return book'],
  '/dashboard/transport/routes': ['transport routes', 'bus routes', 'stops'],
  '/dashboard/transport/vehicle': ['transport vehicle', 'vehicles', 'buses', 'vans', 'drivers', 'transport'],
  '/dashboard/transport/assign-vehicle': ['assign vehicle', 'vehicle allocation'],
  '/dashboard/dormitory': ['dormitory', 'hostel', 'hostel list', 'boarding'],
  '/dashboard/dormitory/dormitory-rooms': ['dormitory rooms', 'hostel rooms', 'room allocation'],

  // LMS
  '/dashboard/lms/courses': ['lms', 'courses', 'all courses', 'online learning', 'elearning', 'training'],
  '/dashboard/lms/add-course': ['add course', 'create course', 'new course'],

  // Student Portal
  '/dashboard/student': ['student dashboard', 'home', 'my portal', 'student overview'],
  '/dashboard/student/profile': ['my profile', 'student profile', 'profile details', 'my info'],
  '/dashboard/student/homework': ['my homework', 'student homework', 'pending homework'],
  '/dashboard/student/attendance': ['my attendance', 'student attendance record', 'attendance percentage'],
  '/dashboard/student/timetable': ['timetable', 'my timetable', 'student schedule', 'class timing'],
  '/dashboard/student/fees': ['my fees', 'fee vouchers', 'student fee payment', 'fee dues'],
  '/dashboard/student/examinations/result': ['my results', 'student marks', 'report card', 'exam result'],
  '/dashboard/student/examinations/schedule': ['exam schedule', 'datesheet', 'my exams'],
  '/dashboard/student/study-material/syllabus': ['syllabus', 'my syllabus', 'course material'],
  '/dashboard/student/study-material/assignment': ['assignments', 'submit assignment'],
  '/dashboard/student/leave/apply': ['apply leave', 'request leave', 'student leave application'],
  '/dashboard/student/online-exam/active': ['active exams', 'online test', 'take quiz'],
  '/dashboard/student/virtual-class/virtual-class': ['virtual class', 'online class', 'join live class', 'zoom class', 'google meet'],
};

/**
 * Build dynamic search index from menu structures with full metadata
 */
function buildMenuIndex(menuStructure, role = 'Super Admin') {
  const list = [];
  const visitedRoutes = new Set();

  // 1. Traverse sidebar groups & subitems
  if (Array.isArray(menuStructure)) {
    for (const group of menuStructure) {
      if (group.visible === false) continue;
      const groupTitle = group.groupTitle || '';

      for (const item of (group.items || [])) {
        if (item.visible === false) continue;

        if (item.hasSubmenu && Array.isArray(item.subItems)) {
          for (const sub of item.subItems) {
            if (sub.visible === false || !sub.href) continue;
            if (visitedRoutes.has(sub.href)) continue;
            visitedRoutes.add(sub.href);

            const syns = SYNONYMS_MAP[sub.href] || [];
            const keywords = Array.from(new Set([
              sub.name.toLowerCase(),
              item.name.toLowerCase(),
              groupTitle.toLowerCase(),
              ...sub.name.toLowerCase().split(' '),
              ...item.name.toLowerCase().split(' '),
              ...syns
            ]));

            list.push({
              label: sub.name,
              route: sub.href,
              category: `${item.name}`,
              groupTitle,
              iconName: sub.iconName || item.iconName || 'LayoutDashboard',
              iconImg: sub.iconImg || item.iconImg || null,
              badge: sub.badge || item.badge || null,
              keywords
            });
          }
        } else if (item.href) {
          if (visitedRoutes.has(item.href)) continue;
          visitedRoutes.add(item.href);

          const syns = SYNONYMS_MAP[item.href] || [];
          const keywords = Array.from(new Set([
            item.name.toLowerCase(),
            groupTitle.toLowerCase(),
            ...item.name.toLowerCase().split(' '),
            ...syns
          ]));

          list.push({
            label: item.name,
            route: item.href,
            category: groupTitle || 'General',
            groupTitle,
            iconName: item.iconName || 'LayoutDashboard',
            iconImg: item.iconImg || null,
            badge: item.badge || null,
            keywords
          });
        }
      }
    }
  }

  // 2. Add common direct accessible pages not in main sidebar if not already present
  const commonPages = [
    { label: 'My Profile', route: '/dashboard/profile', category: 'Account', iconName: 'User', keywords: ['profile', 'my profile', 'account', 'user profile', 'avatar', 'password'] },
    { label: 'Notifications', route: '/dashboard/notifications', category: 'Account', iconName: 'Bell', keywords: ['notifications', 'alerts', 'notices', 'bell', 'updates'] },
  ];

  if (role === 'Super Admin') {
    commonPages.push({
      label: 'Super Admin Settings',
      route: '/dashboard/settings/super-admin',
      category: 'Settings',
      iconName: 'Settings',
      keywords: ['super admin settings', 'system configuration', 'master settings']
    });
  }

  for (const cp of commonPages) {
    if (!visitedRoutes.has(cp.route)) {
      visitedRoutes.add(cp.route);
      list.push({
        ...cp,
        groupTitle: 'General',
        keywords: [...cp.keywords, ...(SYNONYMS_MAP[cp.route] || [])]
      });
    }
  }

  return list;
}

// Pre-build role search indexes
export const SEARCH_INDEX = {
  'Super Admin': buildMenuIndex(DEFAULT_MENU_STRUCTURE, 'Super Admin'),
  'Admin': buildMenuIndex(DEFAULT_MENU_STRUCTURE, 'Admin'),
  'Teacher': buildMenuIndex(TEACHER_MENU_STRUCTURE, 'Teacher'),
  'Student': buildMenuIndex(STUDENT_MENU_STRUCTURE, 'Student'),
};

/**
 * Intelligent fuzzy and prefix search for routes with rich ranking
 * @param {string} query - Search term
 * @param {string} role - User role
 * @param {number} limit - Maximum number of suggestions to return (default 8)
 * @returns {Array} List of matching route objects sorted by relevance
 */
export function searchRoutes(query, role = 'Super Admin', limit = 8) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const qWords = q.split(/\s+/).filter(Boolean);

  const index = SEARCH_INDEX[role] || SEARCH_INDEX['Admin'] || SEARCH_INDEX['Super Admin'] || SEARCH_INDEX['Student'] || [];
  const results = [];

  for (const entry of index) {
    let score = 0;
    const labelLower = entry.label.toLowerCase();
    const categoryLower = (entry.category || '').toLowerCase();
    const routeLower = entry.route.toLowerCase();

    // 1. Exact Label Match
    if (labelLower === q) {
      score += 200;
    }
    // 2. Label Starts With Query
    else if (labelLower.startsWith(q)) {
      score += 120;
    }
    // 3. Any Word in Label Starts With Query
    else if (labelLower.split(' ').some(w => w.startsWith(q))) {
      score += 95;
    }
    // 4. Label Contains Query Substring
    else if (labelLower.includes(q)) {
      score += 75;
    }

    // 5. Keyword Matches
    for (const kw of (entry.keywords || [])) {
      if (kw === q) {
        score = Math.max(score, 110);
      } else if (kw.startsWith(q)) {
        score = Math.max(score, 85);
      } else if (kw.includes(q)) {
        score = Math.max(score, 65);
      }
    }

    // 6. Category / Group Matches
    if (categoryLower.includes(q)) {
      score += 40;
    }

    // 7. Route URL Segment Matches
    if (routeLower.includes(q)) {
      score += 30;
    }

    // 8. Multi-token Query Match (e.g., "opt subj" -> "Optional Subject")
    if (qWords.length > 1) {
      let matchedTokens = 0;
      for (const qw of qWords) {
        if (labelLower.includes(qw) || (entry.keywords || []).some(k => k.includes(qw))) {
          matchedTokens++;
        }
      }
      if (matchedTokens === qWords.length) {
        score += 80;
      } else if (matchedTokens > 0) {
        score += matchedTokens * 20;
      }
    }

    if (score > 0) {
      results.push({ ...entry, score });
    }
  }

  // Deduplicate and Sort
  const uniqueMap = new Map();
  for (const r of results) {
    if (!uniqueMap.has(r.route) || uniqueMap.get(r.route).score < r.score) {
      uniqueMap.set(r.route, r);
    }
  }

  const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.label.localeCompare(b.label);
  });

  return sorted.slice(0, limit);
}
