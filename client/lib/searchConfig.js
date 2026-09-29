// lib/searchConfig.js
// Role-aware search index — each role only sees its own allowed routes

export const SEARCH_INDEX = {
  'Super Admin': [
    { keywords: ['dashboard', 'home', 'overview'], route: '/dashboard', label: 'Dashboard' },
    { keywords: ['students', 'student', 'manage students', 'admission'], route: '/dashboard/students', label: 'Manage Students' },
    { keywords: ['add student', 'new student', 'enroll'], route: '/dashboard/students/add', label: 'Add Student' },
    { keywords: ['teachers', 'teacher', 'staff', 'manage teachers'], route: '/dashboard/teachers', label: 'Manage Teachers' },
    { keywords: ['classes', 'class', 'manage classes'], route: '/dashboard/classes', label: 'Manage Classes' },
    { keywords: ['sections', 'section'], route: '/dashboard/sections', label: 'Manage Sections' },
    { keywords: ['homework', 'assignment', 'add homework'], route: '/dashboard/homework/add', label: 'Add Homework' },
    { keywords: ['homework list', 'homeworks'], route: '/dashboard/homework/list', label: 'Homework List' },
    { keywords: ['attendance', 'student attendance'], route: '/dashboard/students/attendance', label: 'Student Attendance' },
    { keywords: ['fees', 'fee', 'payment', 'invoice'], route: '/dashboard/fees', label: 'Fees Management' },
    { keywords: ['notice', 'notice board'], route: '/dashboard/utilities/communicate/notice-board', label: 'Notice Board' },
    { keywords: ['event', 'events', 'celebration'], route: '/dashboard/utilities/communicate/event', label: 'Events' },
    { keywords: ['settings', 'general settings'], route: '/dashboard/settings/general', label: 'Settings' },
    { keywords: ['notifications', 'alerts'], route: '/dashboard/notifications', label: 'Notifications' },
    { keywords: ['exams', 'exam', 'examination'], route: '/dashboard/examination/exam-schedule', label: 'Exam Schedule' },
    { keywords: ['profile'], route: '/dashboard/profile', label: 'My Profile' },
    { keywords: ['reports', 'analytics'], route: '/dashboard/reports', label: 'Reports' },
    { keywords: ['transport', 'vehicle', 'bus'], route: '/dashboard/transport/vehicle', label: 'Transport' },
    { keywords: ['library', 'books'], route: '/dashboard/library/books', label: 'Library' },
  ],
  'Admin': [
    { keywords: ['dashboard', 'home', 'overview'], route: '/dashboard', label: 'Dashboard' },
    { keywords: ['students', 'student', 'manage students', 'admission'], route: '/dashboard/students', label: 'Manage Students' },
    { keywords: ['add student', 'new student', 'enroll'], route: '/dashboard/students/add', label: 'Add Student' },
    { keywords: ['teachers', 'teacher', 'staff'], route: '/dashboard/teachers', label: 'Manage Teachers' },
    { keywords: ['classes', 'class'], route: '/dashboard/classes', label: 'Manage Classes' },
    { keywords: ['sections', 'section'], route: '/dashboard/sections', label: 'Manage Sections' },
    { keywords: ['homework', 'assignment', 'add homework'], route: '/dashboard/homework/add', label: 'Add Homework' },
    { keywords: ['homework list', 'homeworks'], route: '/dashboard/homework/list', label: 'Homework List' },
    { keywords: ['attendance', 'student attendance'], route: '/dashboard/students/attendance', label: 'Student Attendance' },
    { keywords: ['fees', 'fee', 'payment'], route: '/dashboard/fees', label: 'Fees' },
    { keywords: ['notice', 'notice board'], route: '/dashboard/utilities/communicate/notice-board', label: 'Notice Board' },
    { keywords: ['event', 'events'], route: '/dashboard/utilities/communicate/event', label: 'Events' },
    { keywords: ['notifications', 'alerts'], route: '/dashboard/notifications', label: 'Notifications' },
    { keywords: ['exams', 'exam'], route: '/dashboard/examination/exam-schedule', label: 'Exam Schedule' },
    { keywords: ['profile'], route: '/dashboard/profile', label: 'My Profile' },
    { keywords: ['transport', 'vehicle', 'bus'], route: '/dashboard/transport/vehicle', label: 'Transport' },
    { keywords: ['library', 'books'], route: '/dashboard/library/books', label: 'Library' },
    { keywords: ['settings'], route: '/dashboard/settings/general', label: 'Settings' },
  ],
  'Teacher': [
    { keywords: ['dashboard', 'home', 'overview'], route: '/dashboard', label: 'Dashboard' },
    { keywords: ['homework', 'assignment', 'add homework', 'create homework'], route: '/dashboard/homework/add', label: 'Add Homework' },
    { keywords: ['homework list', 'homeworks', 'my homework'], route: '/dashboard/homework/list', label: 'Homework List' },
    { keywords: ['attendance', 'mark attendance', 'student attendance'], route: '/dashboard/students/attendance', label: 'Mark Attendance' },
    { keywords: ['students', 'student', 'my students', 'class students'], route: '/dashboard/students', label: 'My Students' },
    { keywords: ['classes', 'class', 'my classes'], route: '/dashboard/classes', label: 'My Classes' },
    { keywords: ['notice', 'notice board', 'notices'], route: '/dashboard/utilities/communicate/notice-board', label: 'Notice Board' },
    { keywords: ['event', 'events'], route: '/dashboard/utilities/communicate/event', label: 'Events' },
    { keywords: ['notifications', 'alerts'], route: '/dashboard/notifications', label: 'Notifications' },
    { keywords: ['exams', 'exam', 'examination', 'schedule'], route: '/dashboard/examination/exam-schedule', label: 'Exam Schedule' },
    { keywords: ['profile'], route: '/dashboard/profile', label: 'My Profile' },
    { keywords: ['marks', 'result', 'grades', 'marks register'], route: '/dashboard/examination/marks-register', label: 'Marks Register' },
    { keywords: ['timetable', 'time table', 'schedule'], route: '/dashboard/student/timetable', label: 'Timetable' },
  ],
  'Student': [
    { keywords: ['dashboard', 'home', 'overview', 'student dashboard'], route: '/dashboard/student', label: 'Student Dashboard' },
    { keywords: ['homework', 'assignment', 'my homework', 'tasks'], route: '/dashboard/student/homework', label: 'My Homework' },
    { keywords: ['attendance', 'my attendance', 'present', 'absent'], route: '/dashboard/student/attendance', label: 'My Attendance' },
    { keywords: ['timetable', 'time table', 'class schedule', 'periods'], route: '/dashboard/student/timetable', label: 'Timetable' },
    { keywords: ['result', 'marks', 'grades', 'report card', 'marks sheet'], route: '/dashboard/student/examinations/result', label: 'My Results' },
    { keywords: ['exam', 'examination', 'exam schedule', 'test'], route: '/dashboard/student/examinations/schedule', label: 'Exam Schedule' },
    { keywords: ['fees', 'fee', 'payment', 'my fees'], route: '/dashboard/student/fees', label: 'My Fees' },
    { keywords: ['notice', 'notice board', 'notices', 'announcements'], route: '/dashboard/utilities/communicate/notice-board', label: 'Notice Board' },
    { keywords: ['events', 'event', 'celebrations'], route: '/dashboard/utilities/communicate/event', label: 'Events' },
    { keywords: ['study material', 'material', 'syllabus', 'notes', 'download'], route: '/dashboard/student/study-material/syllabus', label: 'Study Material' },
    { keywords: ['library', 'books', 'book list'], route: '/dashboard/student/library/books', label: 'Library' },
    { keywords: ['profile', 'my profile'], route: '/dashboard/profile', label: 'My Profile' },
    { keywords: ['leave', 'apply leave', 'leave application'], route: '/dashboard/student/leave/apply', label: 'Apply Leave' },
    { keywords: ['notifications', 'alerts', 'my notifications'], route: '/dashboard/notifications', label: 'Notifications' },
    { keywords: ['subjects', 'my subjects'], route: '/dashboard/student/subjects', label: 'My Subjects' },
    { keywords: ['online exam', 'quiz', 'online test'], route: '/dashboard/student/online-exam/active', label: 'Online Exam' },
  ],
};

/**
 * Search within role-allowed routes only.
 * Returns matching route entries sorted by relevance.
 */
export function searchRoutes(query, role) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const index = SEARCH_INDEX[role] || SEARCH_INDEX['Student'];

  const results = [];
  for (const entry of index) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (kw === q) { score = 100; break; }
      if (kw.startsWith(q) || q.startsWith(kw)) { score = Math.max(score, 80); }
      if (kw.includes(q) || q.includes(kw)) { score = Math.max(score, 60); }
      // Partial word match
      const kwWords = kw.split(' ');
      const qWords = q.split(' ');
      for (const qw of qWords) {
        if (qw.length >= 3 && kwWords.some(k => k.includes(qw) || qw.includes(k))) {
          score = Math.max(score, 40);
        }
      }
    }
    if (score > 0) results.push({ ...entry, score });
  }

  return results.sort((a, b) => b.score - a.score);
}
