const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/student/page.js', 'utf8');

const statCardsReplacement = `  const statCards = [
    { label: 'TOTAL SUBJECT', value: studentDetails?.subjects?.length || user?.subjects?.length || '0', icon: BookOpen, href: '/dashboard/student/subjects' },
    { label: 'TOTAL EXAM', value: studentDetails?.exams?.length || '0', icon: Award, href: '/dashboard/student/examinations/schedule' },
    { label: 'TOTAL ONLINE EXAM', value: studentDetails?.onlineExams?.length || '0', icon: Monitor, href: '/dashboard/student/online-exam/active' },
    { label: 'TOTAL TEACHERS', value: studentDetails?.teachers?.length || '0', icon: Users, href: '/dashboard/student/teachers' },
    { label: 'TOTAL ISSUED BOOK', value: studentDetails?.issuedBooks?.length || '0', icon: BookText, href: '/dashboard/student/library/issued-books' },
    { label: 'PENDING HOMEWORK', value: studentDetails?.pendingHomeworks?.length || '0', icon: ListTodo, href: '/dashboard/student/homework/list' },
    { label: 'ATTENDANCE THIS MONTH', value: studentDetails?.attendanceCount || '0', icon: CalendarDays, href: '/dashboard/student/attendance' },
    { label: 'TOTAL DUE FEES', value: '$' + (studentDetails?.dueFees || '0'), icon: DollarSign, href: '/dashboard/student/fees/invoice' },
    { label: 'BEHAVIOUR POINTS', value: studentDetails?.behaviourPoints || '0', icon: Star, href: '/dashboard/student' },
  ];`;

content = content.replace(
  /  const statCards = \[[\s\S]*?\];/,
  "  const [studentDetails, setStudentDetails] = useState(null);\n\n" + statCardsReplacement
);

// We still need to remove the popup markup
content = content.replace(
  /\{\/\* Event Popup Modal \*\/\}[\s\S]*?\{\/\* ✨✨ TOP HEADER BANNER \(zinc\/white theme\) ✨✨ \*\/\}/,
  "{/* ✨✨ TOP HEADER BANNER (zinc/white theme) ✨✨ */}"
);

fs.writeFileSync('client/app/dashboard/student/page.js', content);
