const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/student/page.js', 'utf8');

const targetStatCards = `  const statCards = [
    { label: 'TOTAL SUBJECT', value: user?.subjects?.length || '0', icon: BookOpen, href: '/dashboard/student/subjects' },
    { label: 'TOTAL EXAM', value: '0', icon: Award, href: '/dashboard/student/examinations/schedule' },
    { label: 'TOTAL ONLINE EXAM', value: '0', icon: Monitor, href: '/dashboard/student/online-exam/active' },
    { label: 'TOTAL TEACHERS', value: '0', icon: Users, href: '/dashboard/student/teachers' },
    { label: 'TOTAL ISSUED BOOK', value: '0', icon: BookMarked, href: '/dashboard/student/library/book-issue' },
    { label: 'PENDING HOMEWORK', value: '0', icon: ListTodo, href: '/dashboard/student/homework' },
    { label: 'ATTENDANCE THIS MONTH', value: '0', icon: CalendarCheck, href: '/dashboard/student/attendance' },
    { label: 'TOTAL DUE FEES', value: '$0', icon: DollarSign, href: '/dashboard/student/fees' },
    { label: 'BEHAVIOUR POINTS', value: '0', icon: Star, href: '/dashboard/student' },
  ];`;

const replacementStatCards = `  const [studentDetails, setStudentDetails] = useState(null);

  const statCards = [
    { label: 'TOTAL SUBJECT', value: studentDetails?.subjects?.length || user?.subjects?.length || '0', icon: BookOpen, href: '/dashboard/student/subjects' },
    { label: 'TOTAL EXAM', value: studentDetails?.exams?.length || '0', icon: Award, href: '/dashboard/student/examinations/schedule' },
    { label: 'TOTAL ONLINE EXAM', value: studentDetails?.onlineExams?.length || '0', icon: Monitor, href: '/dashboard/student/online-exam/active' },
    { label: 'TOTAL TEACHERS', value: studentDetails?.teachers?.length || '0', icon: Users, href: '/dashboard/student/teachers' },
    { label: 'TOTAL ISSUED BOOK', value: studentDetails?.issuedBooks?.length || '0', icon: BookMarked, href: '/dashboard/student/library/book-issue' },
    { label: 'PENDING HOMEWORK', value: studentDetails?.pendingHomeworks?.length || '0', icon: ListTodo, href: '/dashboard/student/homework' },
    { label: 'ATTENDANCE THIS MONTH', value: studentDetails?.attendanceCount || '0', icon: CalendarCheck, href: '/dashboard/student/attendance' },
    { label: 'TOTAL DUE FEES', value: '$' + (studentDetails?.dueFees || '0'), icon: DollarSign, href: '/dashboard/student/fees' },
    { label: 'BEHAVIOUR POINTS', value: studentDetails?.behaviourPoints || '0', icon: Star, href: '/dashboard/student' },
  ];`;

content = content.replace(targetStatCards, replacementStatCards);

content = content.replace(
  "setAdmissionNo(d.data.admissionNo || 'N/A');",
  "setAdmissionNo(d.data.admissionNo || 'N/A');\n          setStudentDetails(d.data);"
);

// Wipe out dummy events array
const targetEvents = `  // Dummy dynamic events coming from Admin (Simulated)
  const [events, setEvents] = useState([
    { date: 15, title: 'Math Test', type: 'exam', color: 'bg-rose-600' },
    { date: 22, title: 'Sports Day Notice', type: 'notice', color: 'bg-indigo-600' }
  ]);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [latestEvent, setLatestEvent] = useState(null);`;

const replacementEvents = `  const [events, setEvents] = useState([]);`;
content = content.replace(targetEvents, replacementEvents);

// Wipe out the timer
const targetTimer = `    // 2. Show popup after 3 seconds for the latest event
    if (events.length > 0) {
      const timer = setTimeout(() => {
        setLatestEvent(events[0]); // Pick first as latest
        setShowEventPopup(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [events]);`;
const replacementTimer = `  }, [events]);`;
content = content.replace(targetTimer, replacementTimer);

// Remove the JSX Modal Popup
content = content.replace(
  /\{\/\* Event Popup Modal \*\/\}[\s\S]*?\{\/\* ✨✨ TOP HEADER BANNER \(zinc\/white theme\) ✨✨ \*\/\}/,
  "{/* ✨✨ TOP HEADER BANNER (zinc/white theme) ✨✨ */}"
);

fs.writeFileSync('client/app/dashboard/student/page.js', content);
