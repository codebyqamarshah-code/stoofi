const fs = require('fs');
let content = fs.readFileSync('client/lib/searchConfig.js', 'utf8');

const replacement = `
  'Super Admin': [
    { keywords: ['dashboard', 'home', 'overview'], route: '/dashboard', label: 'Dashboard' },
    { keywords: ['students', 'student', 'manage students', 'admission'], route: '/dashboard/students', label: 'Manage Students' },
    { keywords: ['add student', 'new student', 'enroll'], route: '/dashboard/students/add', label: 'Add Student' },
    { keywords: ['teachers', 'teacher', 'staff'], route: '/dashboard/teachers', label: 'Manage Teachers' },
    { keywords: ['classes', 'class'], route: '/dashboard/classes', label: 'Manage Classes' },
    { keywords: ['sections', 'section'], route: '/dashboard/sections', label: 'Manage Sections' },
    { keywords: ['fees', 'fee', 'payment'], route: '/dashboard/fees', label: 'Fees' },
    { keywords: ['notice', 'notice board'], route: '/dashboard/utilities/communicate/notice-board', label: 'Notice Board' },
    { keywords: ['event', 'events'], route: '/dashboard/utilities/communicate/event', label: 'Events' },
    { keywords: ['notifications', 'alerts'], route: '/dashboard/notifications', label: 'Notifications' },
    { keywords: ['settings', 'super admin settings'], route: '/dashboard/settings/super-admin', label: 'Super Admin Settings' },
    { keywords: ['general settings'], route: '/dashboard/settings/general', label: 'General Settings' },
    { keywords: ['admin setup'], route: '/dashboard/admin/setup', label: 'Admin Setup' },
    { keywords: ['users', 'roles', 'manage users'], route: '/dashboard/users', label: 'Manage Users' },
  ],
  'Admin': [`;

content = content.replace("  'Admin': [", replacement);

content = content.replace(
  "const index = SEARCH_INDEX[role] || SEARCH_INDEX['Student'];",
  "const index = SEARCH_INDEX[role] || SEARCH_INDEX['Admin'] || SEARCH_INDEX['Super Admin'] || SEARCH_INDEX['Student'];"
);

fs.writeFileSync('client/lib/searchConfig.js', content);
console.log('Search config updated for Super Admin');
