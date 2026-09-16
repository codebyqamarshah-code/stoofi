const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/student/page.js', 'utf8');

// Strip out the Dummy Event Popup
content = content.replace(
  /const \[events, setEvents\] = useState\(\[[\s\S]*?\]\);/,
  "const [events, setEvents] = useState([]);"
);
content = content.replace(
  /const \[showEventPopup, setShowEventPopup\] = useState\(false\);/,
  ""
);
content = content.replace(
  /const \[latestEvent, setLatestEvent\] = useState\(null\);/,
  ""
);
content = content.replace(
  /\/\/ 2\. Show popup after 3 seconds for the latest event[\s\S]*?}, \[events\]\);/,
  ""
);

content = content.replace(
  /\{\/\* Event Popup Modal \*\/\}[\s\S]*?\{\/\* ✨✨ TOP HEADER BANNER \(zinc\/white theme\) ✨✨ \*\/\}/,
  "{/* ✨✨ TOP HEADER BANNER (zinc/white theme) ✨✨ */}"
);

// Instead of hardcoding subjects to user?.subjects?.length || '0', 
// let's create a state for student details and update stat cards dynamically!
const studentState = `  const [studentDetails, setStudentDetails] = useState(null);`;
content = content.replace(
  /const \[admissionNo, setAdmissionNo\] = useState\(user\?.admissionNo \|\| 'Loading\.\.\.'\);/,
  "const [admissionNo, setAdmissionNo] = useState(user?.admissionNo || 'Loading...');\n" + studentState
);

const fetchStudentDetails = `      .then(d => {
        if (d.success && d.data) {
          setAdmissionNo(d.data.admissionNo || 'N/A');
          setStudentDetails(d.data);
        } else {`;
content = content.replace(
  /      \.then\(d => \{\n        if \(d\.success && d\.data\) \{\n          setAdmissionNo\(d\.data\.admissionNo \|\| 'N\/A'\);\n        \} else \{/,
  fetchStudentDetails
);

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
  statCardsReplacement
);


fs.writeFileSync('client/app/dashboard/student/page.js', content);
