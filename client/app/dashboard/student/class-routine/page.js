'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  CalendarDays, 
  Clock, 
  BookOpen, 
  User, 
  Building, 
  FlaskConical, 
  Search, 
  Printer, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  RefreshCw, 
  Sparkles, 
  Video, 
  Bell, 
  Layers, 
  ChevronDown, 
  Check, 
  ArrowRight,
  ExternalLink,
  Laptop,
  GraduationCap,
  CalendarCheck,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { routineService } from '@/services/routineService';
import api from '@/services/api';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_SCHEDULES = {
  Monday: [
    { period: 1, startTime: '08:30 AM', endTime: '09:20 AM', subject: 'Mathematics', code: 'MATH-101', teacher: 'Dr. Tariq Mahmood', room: 'Room 204', isLab: false, labName: '', topic: 'Quadratic Equations & Roots', status: 'Scheduled' },
    { period: 2, startTime: '09:25 AM', endTime: '10:15 AM', subject: 'Physics', code: 'PHY-102', teacher: 'Engr. Bilal Raza', room: 'Physics Lab A', isLab: true, labName: 'Physics Lab A', topic: 'Ohm’s Law & Resistance Verification', status: 'Scheduled' },
    { period: 3, startTime: '10:20 AM', endTime: '11:10 AM', subject: 'English Language', code: 'ENG-101', teacher: 'Ms. Ayesha Siddiqa', room: 'Room 204', isLab: false, labName: '', topic: 'Formal Essay Writing & Syntax', status: 'Scheduled' },
    { period: 'BREAK', startTime: '11:10 AM', endTime: '11:45 AM', subject: 'Recess & Lunch Break', code: 'BREAK', teacher: 'Campus Grounds', room: 'Cafeteria', isBreak: true },
    { period: 4, startTime: '11:45 AM', endTime: '12:35 PM', subject: 'Computer Science', code: 'CS-201', teacher: 'Mr. Hamza Ali', room: 'Computer Lab 2', isLab: true, labName: 'Computer Lab 2', topic: 'Python Loops & Array Operations', status: 'Scheduled', virtualLink: 'https://meet.google.com/stoofi-cs-live' },
    { period: 5, startTime: '12:40 PM', endTime: '01:30 PM', subject: 'Chemistry', code: 'CHEM-101', teacher: 'Dr. Sarah Khan', room: 'Chemistry Lab B', isLab: true, labName: 'Chemistry Lab B', topic: 'Acid-Base Titration Methods', status: 'Scheduled' },
    { period: 6, startTime: '01:35 PM', endTime: '02:20 PM', subject: 'Pakistan Studies', code: 'PST-101', teacher: 'Mr. Usman Ghani', room: 'Room 204', isLab: false, labName: '', topic: 'Ideology of Pakistan & Constitutional History', status: 'Scheduled' }
  ],
  Tuesday: [
    { period: 1, startTime: '08:30 AM', endTime: '09:20 AM', subject: 'Biology', code: 'BIO-101', teacher: 'Dr. Nida Fatima', room: 'Biology Lab 1', isLab: true, labName: 'Biology Lab 1', topic: 'Cell Division: Mitosis & Meiosis Slides', status: 'Scheduled' },
    { period: 2, startTime: '09:25 AM', endTime: '10:15 AM', subject: 'Mathematics', code: 'MATH-101', teacher: 'Dr. Tariq Mahmood', room: 'Room 204', isLab: false, labName: '', topic: 'Matrices & Determinants (Cramer Rule)', status: 'Scheduled' },
    { period: 3, startTime: '10:20 AM', endTime: '11:10 AM', subject: 'Chemistry', code: 'CHEM-101', teacher: 'Dr. Sarah Khan', room: 'Room 204', isLab: false, labName: '', topic: 'Chemical Bonding & Hybridization', status: 'Scheduled' },
    { period: 'BREAK', startTime: '11:10 AM', endTime: '11:45 AM', subject: 'Recess & Lunch Break', code: 'BREAK', teacher: 'Campus Grounds', room: 'Cafeteria', isBreak: true },
    { period: 4, startTime: '11:45 AM', endTime: '12:35 PM', subject: 'Physics', code: 'PHY-102', teacher: 'Engr. Bilal Raza', room: 'Room 204', isLab: false, labName: '', topic: 'Electromagnetic Induction & Faraday Law', status: 'Scheduled' },
    { period: 5, startTime: '12:40 PM', endTime: '01:30 PM', subject: 'Urdu Literature', code: 'URD-101', teacher: 'Prof. Rashid Minhas', room: 'Room 204', isLab: false, labName: '', topic: 'Ghazal Analysis & Grammatical Structure', status: 'Scheduled' },
    { period: 6, startTime: '01:35 PM', endTime: '02:20 PM', subject: 'Physical Education / Sports', code: 'PED-101', teacher: 'Coach Zeeshan', room: 'Sports Complex', isLab: false, labName: '', topic: 'Athletics & Team Fitness Drills', status: 'Scheduled' }
  ],
  Wednesday: [
    { period: 1, startTime: '08:30 AM', endTime: '09:20 AM', subject: 'Computer Science', code: 'CS-201', teacher: 'Mr. Hamza Ali', room: 'Computer Lab 2', isLab: true, labName: 'Computer Lab 2', topic: 'Data Structures: Stacks and Queues', status: 'Scheduled', virtualLink: 'https://meet.google.com/stoofi-cs-live' },
    { period: 2, startTime: '09:25 AM', endTime: '10:15 AM', subject: 'English Literature', code: 'ENG-102', teacher: 'Ms. Ayesha Siddiqa', room: 'Room 204', isLab: false, labName: '', topic: 'Shakespearean Poetry & Contextual Drama', status: 'Scheduled' },
    { period: 3, startTime: '10:20 AM', endTime: '11:10 AM', subject: 'Mathematics', code: 'MATH-101', teacher: 'Dr. Tariq Mahmood', room: 'Room 204', isLab: false, labName: '', topic: 'Trigonometric Identities & Graphs', status: 'Scheduled' },
    { period: 'BREAK', startTime: '11:10 AM', endTime: '11:45 AM', subject: 'Recess & Lunch Break', code: 'BREAK', teacher: 'Campus Grounds', room: 'Cafeteria', isBreak: true },
    { period: 4, startTime: '11:45 AM', endTime: '12:35 PM', subject: 'Physics', code: 'PHY-102', teacher: 'Engr. Bilal Raza', room: 'Physics Lab A', isLab: true, labName: 'Physics Lab A', topic: 'Focal Length of Convex Lens Verification', status: 'Scheduled' },
    { period: 5, startTime: '12:40 PM', endTime: '01:30 PM', subject: 'Islamic Studies / Ethics', code: 'ISL-101', teacher: 'Qari Muhammad Aslam', room: 'Room 204', isLab: false, labName: '', topic: 'Quranic Surah Reflection & Ethics in Society', status: 'Scheduled' },
    { period: 6, startTime: '01:35 PM', endTime: '02:20 PM', subject: 'Library & Research Hour', code: 'LIB-101', teacher: 'Chief Librarian', room: 'Central Library', isLab: false, labName: '', topic: 'Independent Reading & Reference Works', status: 'Scheduled' }
  ],
  Thursday: [
    { period: 1, startTime: '08:30 AM', endTime: '09:20 AM', subject: 'Chemistry', code: 'CHEM-101', teacher: 'Dr. Sarah Khan', room: 'Chemistry Lab B', isLab: true, labName: 'Chemistry Lab B', topic: 'Salt Analysis & Gas Evolution Tests', status: 'Scheduled' },
    { period: 2, startTime: '09:25 AM', endTime: '10:15 AM', subject: 'Biology', code: 'BIO-101', teacher: 'Dr. Nida Fatima', room: 'Room 204', isLab: false, labName: '', topic: 'Human Circulatory & Respiratory Systems', status: 'Scheduled' },
    { period: 3, startTime: '10:20 AM', endTime: '11:10 AM', subject: 'Physics', code: 'PHY-102', teacher: 'Engr. Bilal Raza', room: 'Room 204', isLab: false, labName: '', topic: 'Work, Energy & Power Principles', status: 'Scheduled' },
    { period: 'BREAK', startTime: '11:10 AM', endTime: '11:45 AM', subject: 'Recess & Lunch Break', code: 'BREAK', teacher: 'Campus Grounds', room: 'Cafeteria', isBreak: true },
    { period: 4, startTime: '11:45 AM', endTime: '12:35 PM', subject: 'Mathematics', code: 'MATH-101', teacher: 'Dr. Tariq Mahmood', room: 'Room 204', isLab: false, labName: '', topic: 'Coordinate Geometry & Straight Line Slopes', status: 'Scheduled' },
    { period: 5, startTime: '12:40 PM', endTime: '01:30 PM', subject: 'English Writing & Debate', code: 'ENG-103', teacher: 'Ms. Ayesha Siddiqa', room: 'Auditorium', isLab: false, labName: '', topic: 'Parliamentary Style Class Debate', status: 'Scheduled' },
    { period: 6, startTime: '01:35 PM', endTime: '02:20 PM', subject: 'Artificial Intelligence & Robotics', code: 'AI-101', teacher: 'Mr. Hamza Ali', room: 'Innovation Lab', isLab: true, labName: 'Innovation Lab', topic: 'Hands-on Arduino & Sensor Interfacing', status: 'Scheduled' }
  ],
  Friday: [
    { period: 1, startTime: '08:30 AM', endTime: '09:15 AM', subject: 'Mathematics', code: 'MATH-101', teacher: 'Dr. Tariq Mahmood', room: 'Room 204', isLab: false, labName: '', topic: 'Weekly Revision & Problem Solving Workshop', status: 'Scheduled' },
    { period: 2, startTime: '09:20 AM', endTime: '10:05 AM', subject: 'Computer Programming', code: 'CS-201', teacher: 'Mr. Hamza Ali', room: 'Computer Lab 2', isLab: true, labName: 'Computer Lab 2', topic: 'Hands-on Coding Quiz & Debugging', status: 'Scheduled', virtualLink: 'https://meet.google.com/stoofi-cs-live' },
    { period: 3, startTime: '10:10 AM', endTime: '10:55 AM', subject: 'Islamic Studies / Moral Ethics', code: 'ISL-101', teacher: 'Qari Muhammad Aslam', room: 'Room 204', isLab: false, labName: '', topic: 'Friday Sermon Theme & Character Development', status: 'Scheduled' },
    { period: 4, startTime: '11:00 AM', endTime: '12:00 PM', subject: 'Science Practical Review', code: 'SCI-REV', teacher: 'Dr. Sarah & Engr. Bilal', room: 'Science Lab Complex', isLab: true, labName: 'Science Lab Complex', topic: 'Lab Notebook Verification & Viva Preparation', status: 'Scheduled' }
  ],
  Saturday: [
    { period: 1, startTime: '09:00 AM', endTime: '10:00 AM', subject: 'Extra-Curricular Club Activity', code: 'CLUB-01', teacher: 'Club Incharge', room: 'Multi-Purpose Hall', isLab: false, labName: '', topic: 'Robotics, Drama & Model UN Session', status: 'Scheduled' },
    { period: 2, startTime: '10:05 AM', endTime: '11:15 AM', subject: 'Remedial & Mentorship Session', code: 'MENTOR-01', teacher: 'Department Advisors', room: 'Academic Wing', isLab: false, labName: '', topic: 'One-on-One Concept Clearing & Study Plan', status: 'Scheduled' },
    { period: 3, startTime: '11:20 AM', endTime: '12:30 PM', subject: 'Sports & Friendly League', code: 'SPORTS-01', teacher: 'Physical Director', room: 'Main Stadium', isLab: false, labName: '', topic: 'Inter-House Basketball & Cricket Matches', status: 'Scheduled' }
  ]
};

export default function StudentClassRoutinePage() {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [activeDay, setActiveDay] = useState('Today');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'matrix'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLabOnly, setFilterLabOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [routinesData, setRoutinesData] = useState({});
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [todayDayName, setTodayDayName] = useState('Monday');

  // Compute today's day of week
  useEffect(() => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    // If Sunday, show Monday as default active day
    setTodayDayName(currentDay === 'Sunday' ? 'Monday' : currentDay);
    if (activeDay === 'Today') {
      setActiveDay(currentDay === 'Sunday' ? 'Monday' : currentDay);
    }

    // Time ticker for "Happening Now"
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Class & Section based on user or defaults
  useEffect(() => {
    const userClass = user?.className || (user?.referenceId?.className) || 'Class 10';
    const userSection = user?.section || (user?.referenceId?.section) || 'Section A';
    setSelectedClass(userClass);
    setSelectedSection(userSection);

    // Fetch classes and sections list
    const fetchDropdowns = async () => {
      try {
        const [cRes, sRes] = await Promise.allSettled([
          api.get('/class'),
          api.get('/section')
        ]);
        if (cRes.status === 'fulfilled' && cRes.value?.data && Array.isArray(cRes.value.data)) {
          setClassList(cRes.value.data.map(c => c.name || c.className));
        } else {
          setClassList(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels', 'BS Computer Science', 'FSc Pre-Engineering', 'FSc Pre-Medical']);
        }

        if (sRes.status === 'fulfilled' && sRes.value?.data && Array.isArray(sRes.value.data)) {
          setSectionList(sRes.value.data.map(s => s.name || s.sectionName));
        } else {
          setSectionList(['Section A', 'Section B', 'Section C', 'Section D']);
        }
      } catch (_) {
        setClassList(['Class 9', 'Class 10', 'O-Levels', 'A-Levels', 'FSc Pre-Engineering', 'FSc Pre-Medical']);
        setSectionList(['Section A', 'Section B', 'Section C']);
      }
    };
    fetchDropdowns();
  }, [user]);

  // Load routines when class or section changes
  useEffect(() => {
    if (!selectedClass) return;

    const loadRoutines = async () => {
      setIsLoading(true);
      try {
        const res = await routineService.getRoutines({
          className: selectedClass,
          sectionName: selectedSection
        });

        if (Array.isArray(res) && res.length > 0) {
          // Group database routines by day
          const grouped = {};
          DAYS_OF_WEEK.forEach(day => { grouped[day] = []; });
          res.forEach(item => {
            if (item.day && grouped[item.day]) {
              grouped[item.day].push({
                id: item._id || item.id,
                period: grouped[item.day].length + 1,
                startTime: item.startTime,
                endTime: item.endTime,
                subject: item.subject,
                code: item.code || `${(item.subject || 'SUB').substring(0, 3).toUpperCase()}-101`,
                teacher: item.teacher || 'Assigned Instructor',
                room: item.room || 'Classroom',
                isLab: Boolean(item.isLab || item.labName),
                labName: item.labName || '',
                topic: item.topic || 'Curriculum Syllabus Lesson',
                status: item.status || 'Scheduled',
                notes: item.notes || ''
              });
            }
          });
          setRoutinesData(grouped);
        } else {
          // Fallback to structured realistic default schedules
          setRoutinesData(DEFAULT_SCHEDULES);
        }
      } catch (err) {
        console.warn('Using offline default routine schedule:', err);
        setRoutinesData(DEFAULT_SCHEDULES);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutines();
  }, [selectedClass, selectedSection]);

  // Calculate ongoing / upcoming status
  const getPeriodLiveStatus = (startTimeStr, endTimeStr, dayName) => {
    if (dayName !== todayDayName) return 'Scheduled';

    const parseTime = (tStr) => {
      if (!tStr) return null;
      try {
        const [time, modifier] = tStr.trim().split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d;
      } catch (_) {
        return null;
      }
    };

    const now = new Date();
    const start = parseTime(startTimeStr);
    const end = parseTime(endTimeStr);

    if (start && end) {
      if (now >= start && now <= end) return 'Ongoing';
      if (now > end) return 'Completed';
      if (now < start) return 'Upcoming';
    }
    return 'Scheduled';
  };

  // Get active day periods
  const currentDayPeriods = useMemo(() => {
    if (activeDay === 'All') {
      let combined = [];
      DAYS_OF_WEEK.forEach(day => {
        const list = routinesData[day] || [];
        list.forEach(p => combined.push({ ...p, day }));
      });
      return combined;
    }
    return (routinesData[activeDay] || []).map(p => ({ ...p, day: activeDay }));
  }, [routinesData, activeDay]);

  // Filtered periods
  const filteredPeriods = useMemo(() => {
    return currentDayPeriods.filter(item => {
      if (filterLabOnly && !item.isLab) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (item.subject || '').toLowerCase().includes(q) ||
        (item.teacher || '').toLowerCase().includes(q) ||
        (item.room || '').toLowerCase().includes(q) ||
        (item.labName || '').toLowerCase().includes(q) ||
        (item.topic || '').toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q)
      );
    });
  }, [currentDayPeriods, filterLabOnly, searchQuery]);

  // Statistics for today
  const stats = useMemo(() => {
    const todayList = routinesData[todayDayName] || [];
    const totalPeriods = todayList.filter(p => !p.isBreak).length;
    const labSessions = todayList.filter(p => p.isLab).length;

    // Check ongoing class right now
    const currentClass = todayList.find(p => !p.isBreak && getPeriodLiveStatus(p.startTime, p.endTime, todayDayName) === 'Ongoing');
    const nextClass = todayList.find(p => !p.isBreak && getPeriodLiveStatus(p.startTime, p.endTime, todayDayName) === 'Upcoming');

    // Total weekly hours
    let totalWeeklyCount = 0;
    DAYS_OF_WEEK.forEach(d => {
      totalWeeklyCount += (routinesData[d] || []).filter(p => !p.isBreak).length;
    });

    return {
      totalPeriods,
      labSessions,
      currentClass,
      nextClass,
      totalWeeklyCount
    };
  }, [routinesData, todayDayName]);

  // Export handlers
  const handleExportCSV = () => {
    const rows = filteredPeriods.map(p => ({
      Day: p.day,
      Period: p.isBreak ? 'Recess' : `Period ${p.period}`,
      Time: `${p.startTime} - ${p.endTime}`,
      Subject: p.subject,
      Teacher: p.teacher,
      Room: p.room,
      Type: p.isLab ? `Laboratory (${p.labName})` : 'Lecture',
      Topic: p.topic || 'Syllabus'
    }));
    exportToCSV(rows, `Class_Routine_${selectedClass}_${selectedSection}`);
  };

  const handleExportExcel = () => {
    const rows = filteredPeriods.map(p => ({
      Day: p.day,
      Period: p.isBreak ? 'Recess' : `Period ${p.period}`,
      Time: `${p.startTime} - ${p.endTime}`,
      Subject: p.subject,
      Teacher: p.teacher,
      Room: p.room,
      Type: p.isLab ? `Laboratory (${p.labName})` : 'Lecture',
      Topic: p.topic || 'Syllabus'
    }));
    exportToExcel(rows, `Class_Routine_${selectedClass}_${selectedSection}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ── Breadcrumb & Top Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-900">
              Student Class Routine & Timetable
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F8F1] text-[#009966] border border-[#A7E6C8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#009966] animate-pulse"></span>
              Live Academic Schedule
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Period-wise daily schedule, subject teachers, laboratory sessions, and classroom allocations.
          </p>
        </div>

        {/* Breadcrumb Trail */}
        <div className="flex items-center text-xs text-zinc-500 shrink-0">
          <Link href="/dashboard" className="hover:text-zinc-800 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/student" className="hover:text-zinc-800 transition-colors">Student</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-900 font-semibold">Class Routine</span>
        </div>
      </div>

      {/* ── Enrolled Student Context & Class Selector ─────────────────────────── */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#E8F8F1] border border-[#A7E6C8] text-[#009966] flex items-center justify-center shrink-0">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-zinc-900">
                  {selectedClass} ({selectedSection})
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                  Session 2026-2027
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Today is <span className="font-semibold text-zinc-800">{todayDayName}</span> • Standard timetable effective for current term
              </p>
            </div>
          </div>

          {/* Quick Selectors & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-500 hidden sm:inline">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 rounded-xl border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-900 focus:border-[#084A86] focus:outline-none focus:ring-1 focus:ring-sky-100 shadow-sm"
              >
                {classList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Section Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-500 hidden sm:inline">Section:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="h-9 rounded-xl border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-900 focus:border-[#084A86] focus:outline-none focus:ring-1 focus:ring-sky-100 shadow-sm"
              >
                {sectionList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-9 rounded-xl border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-semibold gap-1.5 text-xs shadow-sm"
            >
              <Printer className="h-3.5 w-3.5 text-zinc-600" />
              <span>Print Routine</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="h-9 rounded-xl border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 font-semibold gap-1.5 text-xs shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-zinc-600" />
              <span className="hidden sm:inline">Export Excel</span>
            </Button>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Today's Classes</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-zinc-950">{stats.totalPeriods}</span>
              <span className="text-xs text-zinc-500">Periods</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Ongoing / Next Up</span>
            <div className="mt-1 flex items-center gap-1.5 truncate">
              {stats.currentClass ? (
                <span className="text-xs font-bold text-[#009966] truncate flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#009966] animate-pulse"></span>
                  {stats.currentClass.subject} ({stats.currentClass.room})
                </span>
              ) : stats.nextClass ? (
                <span className="text-xs font-medium text-sky-700 truncate">
                  Next: {stats.nextClass.subject} ({stats.nextClass.startTime})
                </span>
              ) : (
                <span className="text-xs text-zinc-400">Classes finished for today</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Practical Labs Today</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-zinc-950">{stats.labSessions}</span>
              <span className="text-xs text-zinc-500">Lab Slots</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">Weekly Scheduled</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-zinc-950">{stats.totalWeeklyCount}</span>
              <span className="text-xs text-zinc-500">Total Periods</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Day Tabs & Controls Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Day Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full custom-scrollbar">
          {DAYS_OF_WEEK.map((day) => {
            const isDayToday = day === todayDayName;
            const isSelected = activeDay === day;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#009966] text-white shadow-sm shadow-[#009966]/20'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <span>{day}</span>
                {isDayToday && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${isSelected ? 'bg-white/25 text-white' : 'bg-[#E8F8F1] text-[#009966]'}`}>
                    Today
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => setActiveDay('All')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeDay === 'All'
                ? 'bg-[#084A86] text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            All Week
          </button>
        </div>

        {/* View Mode & Filter Bar */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {/* Search Box */}
          <div className="relative w-44 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search subject, teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#084A86] focus:ring-1 focus:ring-sky-100"
            />
          </div>

          {/* Lab filter toggle */}
          <button
            onClick={() => setFilterLabOnly(!filterLabOnly)}
            className={`h-8 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterLabOnly
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Labs</span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl border border-zinc-300 bg-zinc-100 p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Weekly Grid
            </button>
          </div>
        </div>
      </div>

      {/* ── Content View ─────────────────────────────────────────────────────── */}
      {viewMode === 'cards' ? (
        /* ── Cards / Timeline View ── */
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-20 text-center rounded-2xl border border-zinc-200 bg-white">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#084A86] mb-3" />
              <p className="text-sm font-semibold text-zinc-700">Loading class routine timetable...</p>
            </div>
          ) : filteredPeriods.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-300 bg-white p-6">
              <CalendarCheck className="h-10 w-10 mx-auto text-zinc-400 mb-2" />
              <h3 className="text-sm font-bold text-zinc-900">No classes found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No scheduled periods matching your filter for {activeDay}. Check another day or clear the search criteria.
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            filteredPeriods.map((period, idx) => {
              if (period.isBreak) {
                return (
                  <div
                    key={`break-${idx}`}
                    className="flex items-center justify-between rounded-xl border border-dashed border-zinc-300 bg-amber-50/50 px-5 py-3 text-amber-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold tracking-wider uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                        Break
                      </span>
                      <span className="text-sm font-bold text-zinc-800">{period.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-800">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{period.startTime} - {period.endTime}</span>
                    </div>
                  </div>
                );
              }

              const liveStatus = getPeriodLiveStatus(period.startTime, period.endTime, period.day);
              const isOngoing = liveStatus === 'Ongoing';

              return (
                <div
                  key={period.id || idx}
                  className={`group relative rounded-2xl border bg-white p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-md ${
                    isOngoing
                      ? 'border-[#009966] ring-2 ring-[#009966]/20 bg-emerald-50/20'
                      : 'border-zinc-200/90 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left: Period Number, Time & Subject Info */}
                    <div className="flex items-start gap-4">
                      {/* Period Badge */}
                      <div
                        className={`h-12 w-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold border transition-colors ${
                          isOngoing
                            ? 'bg-[#009966] text-white border-[#009966]'
                            : period.isLab
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-semibold leading-none">Period</span>
                        <span className="text-base leading-tight mt-0.5">{period.period}</span>
                      </div>

                      {/* Subject Details */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-zinc-950 group-hover:text-[#084A86] transition-colors">
                            {period.subject}
                          </h3>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                            {period.code}
                          </span>

                          {period.isLab && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              <FlaskConical className="h-3 w-3" />
                              Practical Lab
                            </span>
                          )}

                          {activeDay === 'All' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                              {period.day}
                            </span>
                          )}

                          {isOngoing && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F8F1] text-[#009966] border border-[#A7E6C8]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#009966] animate-pulse"></span>
                              Happening Now
                            </span>
                          )}
                        </div>

                        {/* Topic / Description */}
                        {period.topic && (
                          <p className="text-xs text-zinc-600 mt-1 line-clamp-1">
                            <span className="font-semibold text-zinc-700">Topic:</span> {period.topic}
                          </p>
                        )}

                        {/* Meta Tags: Teacher, Room, Time */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-zinc-500">
                          <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
                            <User className="h-3.5 w-3.5 text-zinc-500" />
                            <span>{period.teacher}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-zinc-700">
                            <Building className="h-3.5 w-3.5 text-zinc-500" />
                            <span>{period.isLab && period.labName ? period.labName : period.room}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-zinc-700">
                            <Clock className="h-3.5 w-3.5 text-zinc-500" />
                            <span>{period.startTime} - {period.endTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {period.virtualLink ? (
                        <a
                          href={period.virtualLink}
                          target="_blank"
                          rel="noreferrer"
                          className="h-9 px-3.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Join Live Class</span>
                        </a>
                      ) : (
                        <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
                          On-Campus
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ── Weekly Matrix Grid View ── */
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80">
                  <th className="p-3.5 font-bold text-zinc-900 w-28 uppercase tracking-wider text-[11px]">
                    Day
                  </th>
                  <th className="p-3.5 font-bold text-zinc-700 text-center">Period 1<br/><span className="font-normal text-[10px] text-zinc-400">08:30 - 09:20</span></th>
                  <th className="p-3.5 font-bold text-zinc-700 text-center">Period 2<br/><span className="font-normal text-[10px] text-zinc-400">09:25 - 10:15</span></th>
                  <th className="p-3.5 font-bold text-zinc-700 text-center">Period 3<br/><span className="font-normal text-[10px] text-zinc-400">10:20 - 11:10</span></th>
                  <th className="p-2 font-bold text-amber-800 bg-amber-50/60 text-center text-[10px] w-16">RECESS<br/><span className="font-normal text-[9px] text-amber-600">35m</span></th>
                  <th className="p-3.5 font-bold text-zinc-700 text-center">Period 4<br/><span className="font-normal text-[10px] text-zinc-400">11:45 - 12:35</span></th>
                  <th className="p-3.5 font-bold text-zinc-700 text-center">Period 5<br/><span className="font-normal text-[10px] text-zinc-400">12:40 - 01:30</span></th>
                  <th className="p-3.5 font-bold text-zinc-700 text-center">Period 6<br/><span className="font-normal text-[10px] text-zinc-400">01:35 - 02:20</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {DAYS_OF_WEEK.map((day) => {
                  const dayList = (routinesData[day] || []).filter(p => !p.isBreak);
                  const isDayToday = day === todayDayName;

                  return (
                    <tr
                      key={day}
                      className={`hover:bg-zinc-50/80 transition-colors ${
                        isDayToday ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="p-3.5 font-bold text-zinc-900 border-r border-zinc-200 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{day}</span>
                          {isDayToday && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#009966]"></span>
                          )}
                        </div>
                      </td>

                      {[0, 1, 2].map((slotIdx) => {
                        const item = dayList[slotIdx];
                        return (
                          <td key={slotIdx} className="p-2.5 border-r border-zinc-200 text-center align-top min-w-[130px]">
                            {item ? (
                              <div className={`p-2 rounded-xl text-left border ${item.isLab ? 'bg-amber-50/60 border-amber-200' : 'bg-zinc-50 border-zinc-200'}`}>
                                <p className="font-bold text-zinc-900 truncate">{item.subject}</p>
                                <p className="text-[11px] text-zinc-600 truncate mt-0.5">{item.teacher}</p>
                                <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                                  <span>{item.room}</span>
                                  {item.isLab && <span className="font-bold text-amber-700 uppercase">Lab</span>}
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-300 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Recess Column */}
                      <td className="p-2 bg-amber-50/40 border-r border-zinc-200 text-center text-[10px] font-semibold text-amber-800">
                        Break
                      </td>

                      {[3, 4, 5].map((slotIdx) => {
                        const item = dayList[slotIdx];
                        return (
                          <td key={slotIdx} className="p-2.5 border-r border-zinc-200 text-center align-top min-w-[130px]">
                            {item ? (
                              <div className={`p-2 rounded-xl text-left border ${item.isLab ? 'bg-amber-50/60 border-amber-200' : 'bg-zinc-50 border-zinc-200'}`}>
                                <p className="font-bold text-zinc-900 truncate">{item.subject}</p>
                                <p className="text-[11px] text-zinc-600 truncate mt-0.5">{item.teacher}</p>
                                <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                                  <span>{item.room}</span>
                                  {item.isLab && <span className="font-bold text-amber-700 uppercase">Lab</span>}
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-300 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Admin Management Link Note ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#009966] shrink-0" />
          <span>
            Looking to update class schedules, teacher assignments, or room bookings?
          </span>
        </div>
        <Link
          href="/dashboard/academics/routine"
          className="text-[#084A86] hover:underline font-semibold flex items-center gap-1 shrink-0"
        >
          <span>Manage Academic Timetable</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
