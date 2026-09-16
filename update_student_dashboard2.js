const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/student/page.js', 'utf8');

content = content.replace(
  /const \[admissionNo, setAdmissionNo\] = useState\(user\?.admissionNo \|\| 'Loading\.\.\.'\);/,
  "const [admissionNo, setAdmissionNo] = useState(user?.admissionNo || 'Loading...');\n  const [studentDetails, setStudentDetails] = useState(null);"
);

content = content.replace(
  /setAdmissionNo\(d\.data\.admissionNo \|\| 'N\/A'\);/,
  "setAdmissionNo(d.data.admissionNo || 'N/A');\n          setStudentDetails(d.data);"
);

const oldStatCards = `  const statCards = [
    { label: 'TOTAL SUBJECT', value: user?.subjects?.length || '0', icon: BookOpen, href: '/dashboard/student/subjects' },
    { label: 'TOTAL EXAM', value: '0', icon: Award, href: '/dashboard/student/examinations/schedule' },
    { label: 'TOTAL ONLINE EXAM', value: '0', icon: Monitor, href: '/dashboard/student/online-exam/active' },
    { label: 'TOTAL TEACHERS', value: '0', icon: Users, href: '/dashboard/student/teachers' },
    { label: 'TOTAL ISSUED BOOK', value: '0', icon: BookText, href: '/dashboard/student/library/issued-books' },
    { label: 'PENDING HOMEWORK', value: '0', icon: ListTodo, href: '/dashboard/student/homework/list' },
    { label: 'ATTENDANCE THIS MONTH', value: '0', icon: CalendarDays, href: '/dashboard/student/attendance' },
    { label: 'TOTAL DUE FEES', value: '$0', icon: DollarSign, href: '/dashboard/student/fees/invoice' },
    { label: 'BEHAVIOUR POINTS', value: '0', icon: Star, href: '/dashboard/student' },
  ];`;

const newStatCards = `  const statCards = [
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

content = content.replace(oldStatCards, newStatCards);

content = content.replace(
  /  \/\/ Dummy dynamic events coming from Admin \(Simulated\)[\s\S]*?const \[latestEvent, setLatestEvent\] = useState\(null\);/,
  "  const [events, setEvents] = useState([]);"
);

content = content.replace(
  /      \/\/ 2\. Show popup after 3 seconds for the latest event[\s\S]*?\}, \[events\]\);/,
  ""
);

content = content.replace(
  /      \{\/\* Event Popup Modal \*\/\}[\s\S]*?\{\/\* ✨✨ TOP HEADER BANNER \(zinc\/white theme\) ✨✨ \*\/\}/,
  "      {/* ✨✨ TOP HEADER BANNER (zinc/white theme) ✨✨ */}"
);

fs.writeFileSync('client/app/dashboard/student/page.js', content);
