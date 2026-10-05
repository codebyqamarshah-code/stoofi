// lib/routeProtection.js
// Centralised route-access logic.
// Call isRouteAllowed(role, pathname) in layout.js before rendering any protected page.

// Routes that are forbidden for Teacher
const TEACHER_BLOCKED = [
  '/dashboard/settings',
  '/dashboard/setup',
  '/dashboard/users',
  '/dashboard/fees',
  '/dashboard/payroll',
  '/dashboard/staff',
  '/dashboard/expense',
  '/dashboard/income',
  '/dashboard/chart-of-account',
  '/dashboard/bank-account',
  '/dashboard/roles',
  '/dashboard/admin',
];

// Routes that are allowed for Student (prefix-match)
const STUDENT_ALLOWED = [
  '/dashboard/student',            // all /dashboard/student/* routes
  '/dashboard/profile',
  '/dashboard/notifications',
  '/dashboard/utilities/communicate/notice-board',
  '/dashboard/utilities/communicate/event',
];

// Routes that are allowed for Teacher (prefix-match)
const TEACHER_ALLOWED = [
  '/dashboard/profile',
  '/dashboard/teacher',
  '/dashboard/homework',
  '/dashboard/students',
  '/dashboard/classes',
  '/dashboard/sections',
  '/dashboard/examination',
  '/dashboard/notifications',
  '/dashboard/utilities',
  '/dashboard/transport',
  '/dashboard/library',
  '/dashboard/leave',
  '/dashboard/student/timetable',
  '/dashboard/marks-register',
];

/**
 * Returns true if the given role may access the given pathname.
 */
export function isRouteAllowed(role, pathname) {
  if (!role || !pathname) return false;

  // Super Admin: unrestricted
  if (role === 'Super Admin') return true;

  // Admin: almost everything except super-admin-only paths
  if (role === 'Admin') {
    const adminBlocked = ['/dashboard/settings/super-admin'];
    return !adminBlocked.some(b => pathname.startsWith(b));
  }

  // Teacher
  if (role === 'Teacher') {
    // Exact root
    if (pathname === '/dashboard' || pathname === '/dashboard/') return true;
    // Block restricted paths first
    if (TEACHER_BLOCKED.some(b => pathname.startsWith(b))) return false;
    // Then allow
    if (TEACHER_ALLOWED.some(a => pathname.startsWith(a))) return true;
    return false;
  }

  // Student
  if (role === 'Student') {
    if (pathname === '/dashboard' || pathname === '/dashboard/') return true;
    if (STUDENT_ALLOWED.some(a => pathname.startsWith(a))) return true;
    return false;
  }

  // Accountant, Receptionist, Parent, Staff, and custom roles: allow dashboard access
  return pathname.startsWith('/dashboard');
}
