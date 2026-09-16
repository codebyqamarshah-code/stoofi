const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/student/page.js', 'utf8');

const oldCards = `  const statCards = [
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

const newCards = `  const [studentDetails, setStudentDetails] = useState(null);

  const statCards = [
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

content = content.replace(oldCards, newCards);

content = content.replace(
  "setAdmissionNo(d.data.admissionNo || 'N/A');",
  "setAdmissionNo(d.data.admissionNo || 'N/A');\n          setStudentDetails(d.data);"
);

const oldEvents = `  // Dummy dynamic events coming from Admin (Simulated)
  const [events, setEvents] = useState([
    { date: 15, title: 'Math Test', type: 'exam', color: 'bg-rose-600' },
    { date: 22, title: 'Sports Day Notice', type: 'notice', color: 'bg-indigo-600' }
  ]);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);`;

const newEvents = `  const [events, setEvents] = useState([]);`;
content = content.replace(oldEvents, newEvents);

const oldTimer = `    // 2. Show popup after 3 seconds for the latest event
    if (events.length > 0) {
      const timer = setTimeout(() => {
        setLatestEvent(events[0]); // Pick first as latest
        setShowEventPopup(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [events]);`;
const newTimer = `  }, [events]);`;
content = content.replace(oldTimer, newTimer);

// Remove the event popup JSX using regex carefully targeting the specific block
content = content.replace(
  /\{\/\* Event Popup Modal \*\/\}[\s\S]*?\{\/\* ✨✨ TOP HEADER BANNER \(zinc\/white theme\) ✨✨ \*\/\}/,
  "{/* ✨✨ TOP HEADER BANNER (zinc/white theme) ✨✨ */}"
);

fs.writeFileSync('client/app/dashboard/student/page.js', content);
