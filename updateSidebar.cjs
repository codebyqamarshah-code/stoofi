const fs = require('fs');
const file = 'c:/Users/QAMAR SHAH/Desktop/stoofi/client/lib/sidebarConfig.js';
let content = fs.readFileSync(file, 'utf8');

const newTeacherMenu = 
export const TEACHER_MENU_STRUCTURE = [
  {
    id: 'grp-dashboard-teacher',
    groupTitle: 'DASHBOARD',
    visible: true,
    items: [
      { id: 'item-dash-teacher', name: 'Dashboard', href: '/dashboard/teacher', iconName: 'LayoutDashboard', visible: true },
    ]
  },
  {
    id: 'grp-administration-teacher',
    groupTitle: 'ADMINISTRATION',
    visible: true,
    items: [
      {
        id: 'item-academics-teacher',
        name: 'Academics',
        iconName: 'GraduationCap',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-acad-class', name: 'Class', href: '/dashboard/academics/class', visible: true },
          { id: 'sub-acad-section', name: 'Section', href: '/dashboard/academics/section', visible: true },
          { id: 'sub-acad-subjects', name: 'Subjects', href: '/dashboard/academics/subjects', visible: true },
          { id: 'sub-acad-routine', name: 'Class Routine', href: '/dashboard/academics/routine', visible: true },
        ]
      },
      {
        id: 'item-study-mat-teacher',
        name: 'Study Material',
        iconName: 'FolderOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-study-upload', name: 'Upload Content', href: '/dashboard/study/upload', visible: true },
          { id: 'sub-study-assignment', name: 'Assignment', href: '/dashboard/study/assignment', visible: true },
          { id: 'sub-study-syllabus', name: 'Syllabus', href: '/dashboard/study/syllabus', visible: true },
          { id: 'sub-study-downloads', name: 'Other Downloads', href: '/dashboard/study/downloads', visible: true },
        ]
      },
      {
        id: 'item-lesson-plan-teacher',
        name: 'Lesson Plan',
        iconName: 'BookMarked',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-lesson-item', name: 'Lesson', href: '/dashboard/lesson-plan/lesson', visible: true },
          { id: 'sub-lesson-topic', name: 'Topic', href: '/dashboard/lesson-plan/topic', visible: true },
          { id: 'sub-lesson-plan-item', name: 'Lesson Plan', href: '/dashboard/lesson-plan/plan', visible: true },
        ]
      }
    ]
  },
  {
    id: 'grp-student-teacher',
    groupTitle: 'STUDENT',
    visible: true,
    items: [
      {
        id: 'item-student-info-teacher',
        name: 'Student Info',
        iconName: 'Users',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-student-list', name: 'Student List', href: '/dashboard/students/list', visible: true },
          { id: 'sub-student-attendance', name: 'Student Attendance', href: '/dashboard/students/attendance', visible: true },
        ]
      },
      {
        id: 'item-homework-teacher',
        name: 'HomeWork',
        iconName: 'BookOpen',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-hw-add', name: 'Add Homework', href: '/dashboard/homework/add', visible: true },
          { id: 'sub-hw-eval', name: 'Evaluation', href: '/dashboard/homework/evaluation', visible: true },
        ]
      },
      { id: 'item-transport-teacher', name: 'Transport', href: '/dashboard/transport', iconName: 'School', visible: true },
      { id: 'item-dormitory-teacher', name: 'Dormitory', href: '/dashboard/dormitory', iconName: 'Building', visible: true },
    ]
  },
  {
    id: 'grp-exam-teacher',
    groupTitle: 'EXAM',
    visible: true,
    items: [
      {
        id: 'item-exam-teacher',
        name: 'Examination',
        iconName: 'FileText',
        hasSubmenu: true,
        visible: true,
        subItems: [
          { id: 'sub-exam-list', name: 'Exam List', href: '/dashboard/examination/list', visible: true },
          { id: 'sub-exam-marks', name: 'Marks Register', href: '/dashboard/examination/marks', visible: true },
          { id: 'sub-exam-grades', name: 'Marks Grade', href: '/dashboard/examination/grades', visible: true },
        ]
      }
    ]
  },
  {
    id: 'grp-hr-teacher',
    groupTitle: 'HR',
    visible: true,
    items: [
      { id: 'item-teacher-eval', name: 'Teacher Evaluation', href: '/dashboard/hr/teacher-evaluation', iconName: 'Award', visible: true },
    ]
  },
  {
    id: 'grp-utilities-teacher',
    groupTitle: 'UTILITIES',
    visible: true,
    items: [
      { id: 'item-communicate-teacher', name: 'Communicate', href: '/dashboard/utilities/communicate', iconName: 'MessageSquare', visible: true },
    ]
  },
  {
    id: 'grp-module-teacher',
    groupTitle: 'MODULE',
    visible: true,
    items: [
      { id: 'item-virtual-class-teacher', name: 'Virtual Class', href: '/dashboard/module/virtual-class', iconName: 'Monitor', visible: true, badge: 'Action' },
    ]
  }
];

export const STORAGE_KEY = 'stoofi_custom_sidebar_v5';;

content = content.replace("export const STORAGE_KEY = 'stoofi_custom_sidebar_v5';", newTeacherMenu);

const oldGetStored = export function getStoredSidebar(role = 'Super Admin') {
  if (typeof window === 'undefined') return DEFAULT_MENU_STRUCTURE;
  try {
    const raw = localStorage.getItem(\\_\\);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse sidebar data:', e);
  }
  return DEFAULT_MENU_STRUCTURE;
};

const newGetStored = export function getStoredSidebar(role = 'Super Admin') {
  if (typeof window === 'undefined') {
    return role === 'Teacher' ? TEACHER_MENU_STRUCTURE : DEFAULT_MENU_STRUCTURE;
  }
  try {
    const raw = localStorage.getItem(\\_\\);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse sidebar data:', e);
  }
  return role === 'Teacher' ? TEACHER_MENU_STRUCTURE : DEFAULT_MENU_STRUCTURE;
};

content = content.replace(oldGetStored, newGetStored);

const oldResetStored = export function resetStoredSidebar(role = 'Super Admin') {
  if (typeof window === 'undefined') return DEFAULT_MENU_STRUCTURE;
  try {
    localStorage.removeItem(\\_\\);
    window.dispatchEvent(new CustomEvent('stoofi_sidebar_updated', { detail: { role, menuData: DEFAULT_MENU_STRUCTURE } }));
  } catch (e) {
    console.error('Failed to reset sidebar data:', e);
  }
  return DEFAULT_MENU_STRUCTURE;
};

const newResetStored = export function resetStoredSidebar(role = 'Super Admin') {
  if (typeof window === 'undefined') {
    return role === 'Teacher' ? TEACHER_MENU_STRUCTURE : DEFAULT_MENU_STRUCTURE;
  }
  try {
    localStorage.removeItem(\\_\\);
    const defaultMenu = role === 'Teacher' ? TEACHER_MENU_STRUCTURE : DEFAULT_MENU_STRUCTURE;
    window.dispatchEvent(new CustomEvent('stoofi_sidebar_updated', { detail: { role, menuData: defaultMenu } }));
    return defaultMenu;
  } catch (e) {
    console.error('Failed to reset sidebar data:', e);
    return role === 'Teacher' ? TEACHER_MENU_STRUCTURE : DEFAULT_MENU_STRUCTURE;
  }
};

content = content.replace(oldResetStored, newResetStored);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated sidebarConfig.js via Node.js');
