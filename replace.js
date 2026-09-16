const fs = require('fs');
let content = fs.readFileSync('client/components/DashboardUI.jsx', 'utf8');

// Replace Students Card
content = content.replace(
  '{/* Students Card */}\r\n          <div className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs">',
  '{/* Students Card */}\r\n          <div onClick={() => router.push(\'/dashboard/students\')} className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs cursor-pointer">'
);

// Replace Attendance Card
content = content.replace(
  '{/* Attendance Card */}\r\n          <div className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs">',
  '{/* Attendance Card */}\r\n          <div onClick={() => router.push(\'/dashboard/students/attendance\')} className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs cursor-pointer">'
);

// Replace Fees Card
content = content.replace(
  '{/* Fees Collection Card */}\r\n          <div className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs">',
  '{/* Fees Collection Card */}\r\n          <div onClick={() => router.push(\'/dashboard/fees/collection\')} className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs cursor-pointer">'
);

fs.writeFileSync('client/components/DashboardUI.jsx', content);
