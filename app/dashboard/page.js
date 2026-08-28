'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Briefcase, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Bell, 
  ChevronRight, 
  Plus, 
  Eye, 
  Edit,
  Trash2,
  CloudSun, 
  CheckCircle2, 
  Circle,
  ChevronLeft,
  CalendarDays,
  Sparkles,
  RefreshCw,
  Send,
  DollarSign,
  UserPlus,
  CreditCard,
  Receipt,
  CheckSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [todoTab, setTodoTab] = useState('all');
  const [calendarView, setCalendarView] = useState('month');
  
  // Real-time Date & Greeting State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [greeting, setGreeting] = useState('GOOD AFTERNOON');
  
  // Calendar Navigation State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Live Weather State for Lahore, Pakistan
  const [weather, setWeather] = useState({
    city: 'Lahore, Pakistan',
    temp: 36,
    condition: 'Clear Sky',
    hourly: [
      { time: 'NOW', temp: '36°' },
      { time: '14:00', temp: '36°' },
      { time: '15:00', temp: '36°' },
      { time: '16:00', temp: '36°' },
    ],
    loading: false
  });

  // Live Backend Stats & Data State (Clean initial 0s until loaded from MongoDB)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      students: { total: 0, male: 0, female: 0, malePercent: 0, femalePercent: 0 },
      teachers: 0,
      parents: 0,
      staffs: 0,
      attendance: { studentsPresent: 0, studentsTotal: 0, staffPresent: 0, staffTotal: 0, studentAttPercent: 0, staffAttPercent: 0 },
      fees: {
        totalIncome: 0,
        totalExpenses: 0,
        totalProfit: 0,
        totalFees: 0,
        collectedFees: 0,
        collectionPercentage: 0
      }
    },
    charts: {
      monthly: [
        { day: '01', income: 0, expense: 0 },
        { day: '05', income: 0, expense: 0 },
        { day: '10', income: 0, expense: 0 },
        { day: '15', income: 0, expense: 0 },
        { day: '20', income: 0, expense: 0 },
        { day: '25', income: 0, expense: 0 },
        { day: '30', income: 0, expense: 0 },
      ],
      yearly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => ({ month: m, income: 0, expense: 0 }))
    },
    notices: []
  });

  // Notice Board CRUD States
  const [noticesList, setNoticesList] = useState([]);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isViewNoticeModalOpen, setIsViewNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    description: '',
    audience: 'All',
    date: new Date().toISOString().split('T')[0]
  });

  // Quick Action Modal States
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [admissionForm, setAdmissionForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '2012-01-01',
    contactNumber: '',
    email: ''
  });

  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [feeForm, setFeeForm] = useState({
    studentName: '',
    amount: '',
    paymentMethod: 'Cash',
    note: 'Monthly Tuition Fee'
  });

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    userType: 'Student',
    count: '1',
    status: 'Present'
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'Utilities',
    paymentMethod: 'Cash',
    description: ''
  });

  // Interactive ToDos State
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  // 1. Calculate Real Dynamic Greeting & Live Clock
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      setCurrentDate(now);
      const hours = now.getHours();
      if (hours >= 5 && hours < 12) setGreeting('GOOD MORNING');
      else if (hours >= 12 && hours < 17) setGreeting('GOOD AFTERNOON');
      else if (hours >= 17 && hours < 21) setGreeting('GOOD EVENING');
      else setGreeting('GOOD NIGHT');
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Real Weather for Lahore from Open-Meteo
  useEffect(() => {
    const fetchLahoreWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=31.5204&longitude=74.3587&current=temperature_2m,weather_code&hourly=temperature_2m&timezone=Asia%2FKarachi');
        if (res.ok) {
          const data = await res.json();
          const currentTemp = Math.round(data.current?.temperature_2m ?? 36);
          const weatherCode = data.current?.weather_code ?? 0;

          let conditionText = 'Clear Sky';
          if (weatherCode === 1 || weatherCode === 2) conditionText = 'Mainly Clear';
          else if (weatherCode === 3) conditionText = 'Overcast';
          else if (weatherCode >= 45 && weatherCode <= 48) conditionText = 'Hazy';
          else if (weatherCode >= 51 && weatherCode <= 67) conditionText = 'Rainy';
          else if (weatherCode >= 80) conditionText = 'Showers';

          const currentHour = new Date().getHours();
          const hourlyTemps = data.hourly?.temperature_2m || [];
          const nextHours = [
            { time: 'NOW', temp: `${currentTemp}°` },
            { time: `${(currentHour + 1) % 24}:00`, temp: `${Math.round(hourlyTemps[(currentHour + 1) % 24] || currentTemp)}°` },
            { time: `${(currentHour + 2) % 24}:00`, temp: `${Math.round(hourlyTemps[(currentHour + 2) % 24] || currentTemp)}°` },
            { time: `${(currentHour + 3) % 24}:00`, temp: `${Math.round(hourlyTemps[(currentHour + 3) % 24] || currentTemp)}°` },
          ];

          setWeather({
            city: 'Lahore, Pakistan',
            temp: currentTemp,
            condition: conditionText,
            hourly: nextHours,
            loading: false
          });
        }
      } catch (err) {
        console.error('Weather error:', err);
      }
    };

    fetchLahoreWeather();
    // Live update weather every 5 minutes
    const weatherInterval = setInterval(fetchLahoreWeather, 5 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);

  // 3. Fetch Real Stats & Notices from Backend API
  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.success) {
        setDashboardData(res.data);
        if (res.data.notices) setNoticesList(res.data.notices);
        if (res.data.todos) setTodos(res.data.todos);
      }
    } catch (err) {
      console.log('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // 4. QUICK ACTION SUBMISSION HANDLERS
  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/dashboard/admission', admissionForm);
      if (res.success) {
        setIsAdmissionModalOpen(false);
        setAdmissionForm({ firstName: '', lastName: '', gender: 'Male', dateOfBirth: '2012-01-01', contactNumber: '', email: '' });
        fetchDashboardStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/dashboard/collect-fee', feeForm);
      if (res.success) {
        setIsFeeModalOpen(false);
        setFeeForm({ studentName: '', amount: '', paymentMethod: 'Cash', note: 'Monthly Tuition Fee' });
        fetchDashboardStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/dashboard/attendance', attendanceForm);
      if (res.success) {
        setIsAttendanceModalOpen(false);
        fetchDashboardStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/dashboard/expense', expenseForm);
      if (res.success) {
        setIsExpenseModalOpen(false);
        setExpenseForm({ title: '', amount: '', category: 'Utilities', paymentMethod: 'Cash', description: '' });
        fetchDashboardStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. NOTICE BOARD ACTIONS
  const handleOpenCreateNotice = () => {
    setEditingNotice(null);
    setNoticeForm({
      title: '',
      description: '',
      audience: 'All',
      date: new Date().toISOString().split('T')[0]
    });
    setIsNoticeModalOpen(true);
  };

  const handleOpenEditNotice = (notice) => {
    setEditingNotice(notice);
    setNoticeForm({
      title: notice.title,
      description: notice.description || '',
      audience: notice.audience || 'All',
      date: notice.date ? new Date(notice.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim()) return;

    try {
      if (editingNotice) {
        const res = await api.put(`/dashboard/notices/${editingNotice._id}`, noticeForm);
        if (res.success) {
          setNoticesList(noticesList.map(n => n._id === editingNotice._id ? res.data : n));
        }
      } else {
        const res = await api.post('/dashboard/notices', noticeForm);
        if (res.success) {
          setNoticesList([res.data, ...noticesList]);
        }
      }
      setIsNoticeModalOpen(false);
      fetchDashboardStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotice = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this notice?')) return;
    try {
      await api.delete(`/dashboard/notices/${id}`);
      setNoticesList(noticesList.filter(n => n._id !== id));
      fetchDashboardStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewNotice = (notice) => {
    setSelectedNotice(notice);
    setIsViewNoticeModalOpen(true);
  };

  // 6. TO-DO ACTIONS
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    try {
      const res = await api.post('/dashboard/todos', { title: newTodoText.trim() });
      if (res.success) {
        setTodos([res.data, ...todos]);
      }
    } catch {
      setTodos([{ _id: Date.now().toString(), title: newTodoText.trim(), completed: false }, ...todos]);
    }
    setNewTodoText('');
    setIsAddingTodo(false);
  };

  const handleToggleTodo = async (id) => {
    try {
      await api.put(`/dashboard/todos/${id}`);
    } catch {}
    setTodos(todos.map(t => t._id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = async (id) => {
    try {
      await api.delete(`/dashboard/todos/${id}`);
    } catch {}
    setTodos(todos.filter(t => t._id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalTodoCount = todos.length;
  const todoPercentage = totalTodoCount > 0 ? Math.round((completedCount / totalTodoCount) * 100) : 0;
  
  const filteredTodos = todos.filter(t => {
    if (todoTab === 'completed') return t.completed;
    if (todoTab === 'incomplete') return !t.completed;
    return true;
  });

  // 7. Dynamic Calendar Generation Logic
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarGrid = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarGrid.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const isToday = d.toDateString() === currentDate.toDateString();
    const isSelected = d.toDateString() === selectedDate.toDateString();
    calendarGrid.push({
      day: i,
      isCurrentMonth: true,
      isToday,
      isSelected,
      date: d
    });
  }

  const remaining = 35 - calendarGrid.length;
  const totalSlots = remaining < 0 ? 42 - calendarGrid.length : remaining;
  for (let i = 1; i <= totalSlots; i++) {
    calendarGrid.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  const handlePrevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCalendarDate(today);
    setSelectedDate(today);
  };

  const studentPieData = dashboardData.stats.students.total > 0
    ? [
        { name: 'Male', value: dashboardData.stats.students.male || 0, color: '#10b981' },
        { name: 'Female', value: dashboardData.stats.students.female || 0, color: '#34d399' }
      ]
    : [{ name: 'No Students', value: 1, color: '#27272a' }];

  const formattedToday = currentDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP GREETING & PERFORMANCE BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 p-6 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              {greeting}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {user?.username || 'Super Admin'}
              </h1>
              <span className="bg-emerald-600 text-zinc-950 font-bold text-xs uppercase px-2.5 py-1 rounded-full tracking-wider">
                {user?.role || 'SUPER ADMIN'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <GraduationCap className="h-4 w-4" /> eSkooly Pro
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-zinc-500" /> {formattedToday}
              </span>
            </div>
          </div>

          {/* Real Weather Widget for Lahore */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-6 shadow-inner relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">LIVE</span>
            </div>
            
            <div className="flex items-center gap-3 border-r border-zinc-800 pr-4 mt-1">
              <CloudSun className="h-8 w-8 text-emerald-400 animate-pulse" />
              <div>
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span>{weather.city}</span>
                </div>
                <div className="text-xl font-bold text-white flex items-baseline gap-1.5">
                  {weather.temp}°C 
                  <span className="text-[11px] font-medium text-zinc-400">
                    {weather.condition}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-center text-[10px] text-zinc-400">
              {weather.hourly.map((h, idx) => (
                <div key={idx} className="px-1">
                  <div className="text-zinc-500 font-medium">{h.time}</div>
                  <div className="font-bold text-zinc-200 mt-0.5">{h.temp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Banner Mini Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* Students Card */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500/30 transition-colors">
            <div>
              <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                STUDENTS <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-zinc-300 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  MALE: <span className="font-semibold text-white">{dashboardData.stats.students.male} ({dashboardData.stats.students.malePercent}%)</span>
                </div>
                <div className="text-xs text-zinc-300 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  FEMALE: <span className="font-semibold text-white">{dashboardData.stats.students.female} ({dashboardData.stats.students.femalePercent}%)</span>
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentPieData}
                      innerRadius={20}
                      outerRadius={28}
                      dataKey="value"
                      stroke="none"
                    >
                      {studentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span className="absolute text-sm font-bold text-white">{dashboardData.stats.students.total}</span>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500/30 transition-colors">
            <div>
              <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                TODAY'S ATTENDANCE <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-zinc-300 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dashboardData.stats.attendance.studentAttPercent > 0 ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                  STUDENTS: <span className="font-semibold text-white">{dashboardData.stats.attendance.studentsPresent} / {dashboardData.stats.attendance.studentsTotal}</span>
                </div>
                <div className="text-xs text-zinc-300 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-zinc-600" />
                  STAFF: <span className="font-semibold text-white">{dashboardData.stats.attendance.staffPresent} / {dashboardData.stats.attendance.staffTotal}</span>
                </div>
              </div>
            </div>
            <div className={`h-14 w-14 rounded-full border-4 flex items-center justify-center ${
              dashboardData.stats.attendance.studentAttPercent > 0 
                ? 'border-emerald-500 border-t-zinc-800' 
                : 'border-zinc-800'
            }`}>
              <span className={`text-xs font-bold ${
                dashboardData.stats.attendance.studentAttPercent > 0 
                  ? 'text-emerald-400' 
                  : 'text-zinc-500'
              }`}>{dashboardData.stats.attendance.studentAttPercent}%</span>
            </div>
          </div>

          {/* Fees Collection Card */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500/30 transition-colors">
            <div>
              <div className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                FEES COLLECTION <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-zinc-300 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dashboardData.stats.fees.collectionPercentage > 0 ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                  COLLECTED: <span className={`font-semibold ${dashboardData.stats.fees.collectedFees > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>${dashboardData.stats.fees.collectedFees.toLocaleString()} ({dashboardData.stats.fees.collectionPercentage}%)</span>
                </div>
                <div className="text-xs text-zinc-300 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-zinc-600" />
                  TOTAL FEES: <span className="font-semibold text-white">${dashboardData.stats.fees.totalFees.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className={`h-14 w-14 rounded-full border-4 flex items-center justify-center ${
              dashboardData.stats.fees.collectionPercentage > 0 
                ? 'border-emerald-500 border-t-zinc-800' 
                : 'border-zinc-800'
            }`}>
              <span className={`text-xs font-bold ${
                dashboardData.stats.fees.collectionPercentage > 0 
                  ? 'text-emerald-400' 
                  : 'text-zinc-500'
              }`}>{dashboardData.stats.fees.collectionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* 5 REAL WORKING QUICK ACTION BUTTONS (RESTORED AS REQUESTED) */}
        {/* 5 REAL WORKING QUICK ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3 mt-4 pt-6 border-t border-zinc-800/60">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-zinc-700 bg-zinc-950/50 text-xs font-semibold text-zinc-300 hover:bg-emerald-950/50 hover:text-emerald-400 hover:border-emerald-500/30 cursor-pointer"
            onClick={() => router.push('/dashboard/students/add')}
          >
            <UserPlus className="h-3.5 w-3.5 text-emerald-500" /> Student Admission
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-zinc-700 bg-zinc-950/50 text-xs font-semibold text-zinc-300 hover:bg-emerald-950/50 hover:text-emerald-400 hover:border-emerald-500/30 cursor-pointer"
            onClick={() => router.push('/dashboard/fees/invoice')}
          >
            <CreditCard className="h-3.5 w-3.5 text-emerald-500" /> Collect Fees
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-zinc-700 bg-zinc-950/50 text-xs font-semibold text-zinc-300 hover:bg-emerald-950/50 hover:text-emerald-400 hover:border-emerald-500/30 cursor-pointer"
            onClick={() => router.push('/dashboard/students/attendance')}
          >
            <CheckSquare className="h-3.5 w-3.5 text-emerald-500" /> Attendance
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-zinc-700 bg-zinc-950/50 text-xs font-semibold text-zinc-300 hover:bg-emerald-950/50 hover:text-emerald-400 hover:border-emerald-500/30 cursor-pointer"
            onClick={() => router.push('/dashboard/utilities/communicate')}
          >
            <Bell className="h-3.5 w-3.5 text-emerald-500" /> Add Notice
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-zinc-700 bg-zinc-950/50 text-xs font-semibold text-zinc-300 hover:bg-emerald-950/50 hover:text-emerald-400 hover:border-emerald-500/30 cursor-pointer"
            onClick={() => router.push('/dashboard/accounts/accounts')}
          >
            <Receipt className="h-3.5 w-3.5 text-emerald-500" /> Add Expense
          </Button>
        </div>
      </div>

      {/* 2. 4 TOTAL STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="bg-zinc-900 border-zinc-800 p-5 hover:border-emerald-500/40 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard/students')}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{dashboardData.stats.students.total}</div>
              <div className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">TOTAL STUDENTS</div>
            </div>
          </div>
        </Card>

        <Card 
          className="bg-zinc-900 border-zinc-800 p-5 hover:border-emerald-500/40 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard/hr/staff-directory')}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{dashboardData.stats.teachers}</div>
              <div className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">TOTAL TEACHERS</div>
            </div>
          </div>
        </Card>

        {/* Parents Card - Intentionally left without a link as requested */}
        <Card className="bg-zinc-900 border-zinc-800 p-5 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{dashboardData.stats.parents}</div>
              <div className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">TOTAL PARENTS</div>
            </div>
          </div>
        </Card>

        <Card 
          className="bg-zinc-900 border-zinc-800 p-5 hover:border-emerald-500/40 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard/hr/staff-directory')}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{dashboardData.stats.staffs}</div>
              <div className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">TOTAL STAFFS</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. 2 FINANCIAL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: Monthly Breakdown */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold text-zinc-200">
                Income and Expenses for {monthNames[month]} {year}
              </CardTitle>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Expense
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-400">TOTAL INCOME</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">${dashboardData.stats.fees.totalIncome.toLocaleString()}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-400">TOTAL EXPENSES</div>
                <div className="text-sm font-bold text-rose-400 mt-0.5">${dashboardData.stats.fees.totalExpenses.toLocaleString()}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-400">TOTAL PROFIT</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">${dashboardData.stats.fees.totalProfit.toLocaleString()}</div>
              </div>
            </div>

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.charts.monthly} barGap={4}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} vertical={false} />
                  <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272a' }} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272a' }} />
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ 
                      backgroundColor: '#09090b', 
                      borderColor: '#27272a', 
                      borderRadius: '8px', 
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)'
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Bar dataKey="income" fill="url(#incomeGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" fill="url(#expenseGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Chart: Yearly Trajectory */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold text-zinc-200">
                Income and Expenses for {year}
              </CardTitle>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Expense
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-400">TOTAL INCOME</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">${dashboardData.stats.fees.totalIncome.toLocaleString()}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-400">TOTAL EXPENSES</div>
                <div className="text-sm font-bold text-rose-400 mt-0.5">${dashboardData.stats.fees.totalExpenses.toLocaleString()}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-400">TOTAL REVENUE</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">${dashboardData.stats.fees.totalIncome.toLocaleString()}</div>
              </div>
            </div>

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.charts.yearly}>
                  <defs>
                    <linearGradient id="areaIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="areaExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} vertical={false} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272a' }} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={{ stroke: '#27272a' }} />
                  <Tooltip 
                    cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      backgroundColor: '#09090b', 
                      borderColor: '#27272a', 
                      borderRadius: '8px', 
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)'
                    }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#areaIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#areaExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. NOTICE BOARD & UPCOMING EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notice Board */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold text-zinc-200">Notice Board</CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <Button 
                size="sm" 
                onClick={handleOpenCreateNotice}
                className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-md flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Notice
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={fetchDashboardStats} 
                className="h-7 w-7 text-zinc-400 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-zinc-800 max-h-[360px] overflow-y-auto custom-scrollbar">
            {noticesList.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center">
                <Bell className="h-8 w-8 text-zinc-700 mb-2" />
                No notices published yet in MongoDB. Click &quot;Add Notice&quot; to publish one.
              </div>
            ) : (
              noticesList.map((notice) => {
                const noticeDate = new Date(notice.date || notice.createdAt || Date.now());
                const dayNum = noticeDate.getDate();
                const monthStr = noticeDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                const dateFull = noticeDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                return (
                  <div key={notice._id} className="p-4 flex items-center justify-between hover:bg-zinc-950/60 transition-colors group">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleViewNotice(notice)}>
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-emerald-400 leading-none">{dayNum}</span>
                        <span className="text-[9px] font-semibold text-zinc-400 uppercase leading-none mt-0.5">{monthStr}</span>
                      </div>
                      <div className="flex-1 pr-2">
                        <h4 className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {notice.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          <span>{dateFull}</span>
                          <span>•</span>
                          <span className="text-emerald-500/80 font-medium text-[10px] uppercase">{notice.audience || 'All'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleViewNotice(notice)}
                        className="h-7 w-7 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900"
                        title="View Notice"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleOpenEditNotice(notice)}
                        className="h-7 w-7 text-zinc-400 hover:text-blue-400 hover:bg-zinc-900"
                        title="Edit Notice"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={(e) => handleDeleteNotice(notice._id, e)}
                        className="h-7 w-7 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900"
                        title="Delete Notice"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events & Holidays */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold text-zinc-200">Upcoming Events & Holidays</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[340px] text-center p-6">
            <div className="h-12 w-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-3">
              <CalendarDays className="h-6 w-6" />
            </div>
            <p className="text-xs text-zinc-500">No upcoming events or holidays scheduled.</p>
          </CardContent>
        </Card>
      </div>

      {/* 5. CALENDAR & TO DO LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* School Calendar */}
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {monthNames[month]} {year}
              </h3>
              <div className="flex items-center gap-1 ml-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handlePrevMonth}
                  className="h-7 w-7 border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleToday}
                  className="h-7 px-2.5 border-zinc-800 bg-zinc-950 text-xs text-zinc-300 hover:text-emerald-400"
                >
                  Today
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleNextMonth}
                  className="h-7 w-7 border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-xs">
                {['Month', 'Week', 'Day', 'List'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCalendarView(mode.toLowerCase())}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      calendarView === mode.toLowerCase()
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-500 uppercase pb-2 border-b border-zinc-800">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>
            <div className="grid grid-cols-7 gap-1 pt-2">
              {calendarGrid.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => item.isCurrentMonth && setSelectedDate(item.date)}
                  className={`min-h-[58px] p-2 rounded-lg border flex flex-col justify-between cursor-pointer transition-all ${
                    item.isSelected
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : item.isToday
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400 font-bold'
                      : item.isCurrentMonth
                      ? 'bg-zinc-950/60 border-zinc-800/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                      : 'bg-zinc-950/20 border-transparent text-zinc-700 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{item.day}</span>
                    {item.isToday && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real Interactive To Do List */}
        <Card className="bg-zinc-900 border-zinc-800 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold text-zinc-200">To Do List</CardTitle>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsAddingTodo(!isAddingTodo)}
              className="h-7 w-7 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-950"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>{completedCount}/{totalTodoCount} Completed</span>
                <span className="font-bold text-emerald-500">{todoPercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${todoPercentage}%` }}
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 mt-4 text-xs">
                <button
                  onClick={() => setTodoTab('all')}
                  className={`flex-1 py-1 rounded-md font-semibold text-center uppercase tracking-wider transition-colors ${
                    todoTab === 'all'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setTodoTab('incomplete')}
                  className={`flex-1 py-1 rounded-md font-semibold text-center uppercase tracking-wider transition-colors ${
                    todoTab === 'incomplete'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  INCOMPLETE
                </button>
                <button
                  onClick={() => setTodoTab('completed')}
                  className={`flex-1 py-1 rounded-md font-semibold text-center uppercase tracking-wider transition-colors ${
                    todoTab === 'completed'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  COMPLETED
                </button>
              </div>

              {/* Add Todo Input */}
              {isAddingTodo && (
                <form onSubmit={handleAddTodo} className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter new task..."
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    autoFocus
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                  <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3">
                    Add
                  </Button>
                </form>
              )}
            </div>

            {/* Todo Items */}
            <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1 flex-1">
              {filteredTodos.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 text-xs text-zinc-500">
                  No tasks found in this tab
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <div
                    key={todo._id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-colors group"
                  >
                    <div 
                      onClick={() => handleToggleTodo(todo._id)}
                      className="flex items-center gap-2.5 flex-1 cursor-pointer"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-zinc-500 shrink-0 group-hover:text-emerald-500 transition-colors" />
                      )}
                      <span className={`text-xs ${todo.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                        {todo.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTodo(todo._id)}
                      className="text-zinc-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL 1: STUDENT ADMISSION */}
      <Dialog open={isAdmissionModalOpen} onOpenChange={setIsAdmissionModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-500" />
              Quick Student Admission
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdmissionSubmit} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Usman"
                  value={admissionForm.firstName}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, firstName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali"
                  value={admissionForm.lastName}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, lastName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Gender</label>
                <select
                  value={admissionForm.gender}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, gender: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={admissionForm.dateOfBirth}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, dateOfBirth: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+92 300 0000000"
                value={admissionForm.contactNumber}
                onChange={(e) => setAdmissionForm({ ...admissionForm, contactNumber: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAdmissionModalOpen(false)} className="text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Student</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: COLLECT FEES */}
      <Dialog open={isFeeModalOpen} onOpenChange={setIsFeeModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              Quick Fee Collection
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFeeSubmit} className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Student Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ali Hassan"
                value={feeForm.studentName}
                onChange={(e) => setFeeForm({ ...feeForm, studentName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Amount ($) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500"
                  value={feeForm.amount}
                  onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Payment Method</label>
                <select
                  value={feeForm.paymentMethod}
                  onChange={(e) => setFeeForm({ ...feeForm, paymentMethod: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online">Online</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Note / Description</label>
              <input
                type="text"
                value={feeForm.note}
                onChange={(e) => setFeeForm({ ...feeForm, note: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsFeeModalOpen(false)} className="text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Record Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: MARK ATTENDANCE */}
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-500" />
              Quick Mark Attendance
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAttendanceSubmit} className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Target Role</label>
              <select
                value={attendanceForm.userType}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, userType: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Student">Students</option>
                <option value="Staff">Staff</option>
                <option value="Teacher">Teachers</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Present Count</label>
                <input
                  type="number"
                  min="1"
                  value={attendanceForm.count}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, count: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Status</label>
                <select
                  value={attendanceForm.status}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAttendanceModalOpen(false)} className="text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit Attendance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: ADD EXPENSE */}
      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-rose-500" />
              Quick Add Expense
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit} className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Expense Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Science Lab Equipment"
                value={expenseForm.title}
                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Amount ($) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 450"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Utilities">Utilities</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Events">Events</option>
                </select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsExpenseModalOpen(false)} className="text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">Save Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: ADD / EDIT NOTICE */}
      <Dialog open={isNoticeModalOpen} onOpenChange={setIsNoticeModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-500" />
              {editingNotice ? 'Edit Notice' : 'Publish New Notice'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNotice} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Notice Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Annual Sports Gala 2026"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Target Audience</label>
                <select
                  value={noticeForm.audience}
                  onChange={(e) => setNoticeForm({ ...noticeForm, audience: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Audiences</option>
                  <option value="Students">Students Only</option>
                  <option value="Teachers">Teachers Only</option>
                  <option value="Parents">Parents Only</option>
                  <option value="Staff">Staff Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Publish Date</label>
                <input
                  type="date"
                  value={noticeForm.date}
                  onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Notice Content / Description</label>
              <textarea
                rows={4}
                placeholder="Enter complete notice details, instructions, or timetable..."
                value={noticeForm.description}
                onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsNoticeModalOpen(false)} className="text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5">
                <Send className="h-4 w-4" />
                {editingNotice ? 'Update Notice' : 'Publish Notice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: VIEW NOTICE DETAILS */}
      <Dialog open={isViewNoticeModalOpen} onOpenChange={setIsViewNoticeModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-500" />
              Notice Details
            </DialogTitle>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4 py-2">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-lg font-bold text-white leading-snug">
                  {selectedNotice.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2">
                  <span className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                    {selectedNotice.audience || 'All'}
                  </span>
                  <span>•</span>
                  <span>{new Date(selectedNotice.date || selectedNotice.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="bg-zinc-950/80 p-4 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed min-h-[100px] whitespace-pre-wrap">
                {selectedNotice.description || 'No additional description provided.'}
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setIsViewNoticeModalOpen(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer Branding */}
      <div className="text-center text-xs text-zinc-600 pt-8 pb-4 border-t border-zinc-900">
        Copyright © {year} All rights reserved | This application is made with eSkooly ERP
      </div>
    </div>
  );
}
