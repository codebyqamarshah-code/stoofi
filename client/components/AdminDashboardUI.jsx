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

export default function AdminDashboardUI({ user }) {
  const router = useRouter();
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
      if (res && res.success) {
        let liveStats = res?.data?.stats;
        
        // If local DB has students, compute live student count dynamically
        try {
          const raw = localStorage.getItem('mockDB_student');
          if (raw) {
            const list = JSON.parse(raw);
            if (list.length > 0) {
              const male = list.filter(s => s.gender?.toLowerCase() === 'male').length;
              const female = list.filter(s => s.gender?.toLowerCase() === 'female').length;
              const total = list.length;
              liveStats = {
                ...(liveStats || {}),
                students: {
                  total,
                  male,
                  female,
                  malePercent: total > 0 ? Math.round((male / total) * 100) : 50,
                  femalePercent: total > 0 ? Math.round((female / total) * 100) : 50
                }
              };
            }
          }
        } catch (_) {}

        setDashboardData(prev => ({
          ...prev,
          ...(res?.data || {}),
          stats: liveStats || res?.data?.stats || prev.stats,
          charts: res?.data?.charts || prev.charts
        }));
        
        let localSaved = [];
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('dashboard_notices');
            if (raw) localSaved = JSON.parse(raw);
          } catch (_) {}
        }
        
        const serverNotices = Array.isArray(res.data?.notices) ? res.data.notices : [];
        if (serverNotices.length > 0) {
          // Merge unique by title & id
          const combined = [...serverNotices];
          localSaved.forEach(localItem => {
            if (!combined.some(s => s._id === localItem._id || s.title === localItem.title)) {
              combined.push(localItem);
            }
          });
          setNoticesList(combined);
          if (typeof window !== 'undefined') {
            localStorage.setItem('dashboard_notices', JSON.stringify(combined));
          }
        } else if (localSaved.length > 0) {
          setNoticesList(localSaved);
        }
        
        // Merge Todos with local persisted storage
        let localTodos = [];
        if (typeof window !== 'undefined') {
          try {
            const rawTodos = localStorage.getItem('dashboard_todos');
            if (rawTodos) localTodos = JSON.parse(rawTodos);
          } catch (_) {}
        }

        const serverTodos = Array.isArray(res.data?.todos) ? res.data.todos : [];
        if (serverTodos.length > 0) {
          const combinedTodos = [...serverTodos];
          localTodos.forEach(lt => {
            if (!combinedTodos.some(st => st._id === lt._id || st.title === lt.title)) {
              combinedTodos.push(lt);
            }
          });
          setTodos(combinedTodos);
          if (typeof window !== 'undefined') {
            localStorage.setItem('dashboard_todos', JSON.stringify(combinedTodos));
          }
        } else if (localTodos.length > 0) {
          setTodos(localTodos);
        }
      }
    } catch (err) {
      console.log('Error fetching stats:', err);
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('dashboard_notices');
          if (raw) setNoticesList(JSON.parse(raw));
          const rawTodos = localStorage.getItem('dashboard_todos');
          if (rawTodos) setTodos(JSON.parse(rawTodos));
        } catch (_) {}
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dashboard_notices');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNoticesList(parsed);
          }
        }
        const rawTodos = localStorage.getItem('dashboard_todos');
        if (rawTodos) {
          const parsedTodos = JSON.parse(rawTodos);
          if (Array.isArray(parsedTodos) && parsedTodos.length > 0) {
            setTodos(parsedTodos);
          }
        }
      } catch (_) {}
    }
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
      title: notice.title || '',
      description: notice.description || '',
      audience: notice.audience || 'All',
      date: notice.date ? new Date(notice.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim()) {
      alert('Please enter a Notice Title.');
      return;
    }

    const titleText = noticeForm.title.trim();
    const audienceVal = noticeForm.audience || 'All';
    const dateVal = noticeForm.date || new Date().toISOString().split('T')[0];
    const descVal = noticeForm.description || '';

    if (editingNotice) {
      const updatedNotice = {
        ...editingNotice,
        title: titleText,
        description: descVal,
        audience: audienceVal,
        date: dateVal,
        updatedAt: new Date().toISOString()
      };
      
      const updatedList = noticesList.map(n => n._id === editingNotice._id ? updatedNotice : n);
      setNoticesList(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashboard_notices', JSON.stringify(updatedList));
      }
      setIsNoticeModalOpen(false);
      setEditingNotice(null);

      try {
        await api.put(`/dashboard/notices/${editingNotice._id}`, {
          title: titleText,
          description: descVal,
          audience: audienceVal,
          date: dateVal
        });
      } catch (err) {
        console.warn('API notice update fallback applied:', err);
      }
    } else {
      const tempId = 'notice_' + Date.now();
      const newNotice = {
        _id: tempId,
        title: titleText,
        description: descVal,
        audience: audienceVal,
        date: dateVal,
        published: true,
        createdAt: new Date().toISOString()
      };

      const updatedList = [newNotice, ...noticesList];
      setNoticesList(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashboard_notices', JSON.stringify(updatedList));
      }
      setIsNoticeModalOpen(false);

      try {
        const res = await api.post('/dashboard/notices', {
          title: titleText,
          description: descVal,
          audience: audienceVal,
          date: dateVal
        });
        if (res && res.data && res.data._id) {
          const finalSynced = updatedList.map(n => n._id === tempId ? res.data : n);
          setNoticesList(finalSynced);
          if (typeof window !== 'undefined') {
            localStorage.setItem('dashboard_notices', JSON.stringify(finalSynced));
          }
        }
      } catch (err) {
        console.warn('API notice create fallback applied:', err);
      }
    }

    setNoticeForm({
      title: '',
      description: '',
      audience: 'All',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteNotice = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this notice?')) return;

    const updatedList = noticesList.filter(n => n._id !== id);
    setNoticesList(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_notices', JSON.stringify(updatedList));
    }
    if (selectedNotice && selectedNotice._id === id) {
      setIsViewNoticeModalOpen(false);
      setSelectedNotice(null);
    }

    try {
      await api.delete(`/dashboard/notices/${id}`);
    } catch (err) {
      console.warn('Notice deleted locally');
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

    const taskTitle = newTodoText.trim();
    const tempId = 'todo_' + Date.now();
    const newTodoObj = {
      _id: tempId,
      title: taskTitle,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedTodos = [newTodoObj, ...todos];
    setTodos(updatedTodos);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_todos', JSON.stringify(updatedTodos));
    }

    setNewTodoText('');
    setIsAddingTodo(false);

    try {
      const res = await api.post('/dashboard/todos', { title: taskTitle });
      if (res && res.data && res.data._id) {
        const synced = updatedTodos.map(t => t._id === tempId ? res.data : t);
        setTodos(synced);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dashboard_todos', JSON.stringify(synced));
        }
      }
    } catch (err) {
      console.warn('Todo saved locally:', err);
    }
  };

  const handleToggleTodo = async (id) => {
    const updated = todos.map(t => t._id === id ? { ...t, completed: !t.completed } : t);
    setTodos(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_todos', JSON.stringify(updated));
    }

    try {
      await api.put(`/dashboard/todos/${id}`);
    } catch (err) {
      console.warn('Todo toggled locally');
    }
  };

  const handleDeleteTodo = async (id) => {
    const updated = todos.filter(t => t._id !== id);
    setTodos(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_todos', JSON.stringify(updated));
    }

    try {
      await api.delete(`/dashboard/todos/${id}`);
    } catch (err) {
      console.warn('Todo deleted locally');
    }
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

  const studentPieData = dashboardData?.stats?.students?.total > 0
    ? [
        { name: 'Male', value: dashboardData?.stats?.students?.male || 0, color: '#10b981' },
        { name: 'Female', value: dashboardData?.stats?.students?.female || 0, color: '#34d399' }
      ]
    : [{ name: 'No Students', value: 1, color: '#d1fae5' }];

  const formattedToday = currentDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP GREETING & PERFORMANCE BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-zinc-100/60 via-zinc-100/30 to-zinc-100/70 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/40 p-6 border border-zinc-300/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-200/40 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/60 dark:bg-emerald-500/10 border border-zinc-400 dark:border-emerald-500/20 text-xs font-bold text-zinc-950 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5 text-zinc-950" />
              {greeting}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Admin Dashboard
              </h1>
              <span className="bg-zinc-950 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-full tracking-wider shadow-xs">
                ADMIN
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-950 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-950 dark:text-emerald-400">
                <GraduationCap className="h-4 w-4" /> Stoofi Pro
              </span>
              <span className="flex items-center gap-1.5 font-medium text-zinc-950/80 dark:text-zinc-400">
                <CalendarDays className="h-4 w-4 text-zinc-950 dark:text-zinc-400" /> {formattedToday}
              </span>
            </div>
          </div>

          {/* Real Weather Widget for Lahore */}
          <div className="bg-white dark:bg-zinc-950/80 border border-zinc-300/80 dark:border-zinc-800 rounded-2xl p-3.5 flex items-center gap-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-950"></span>
              </span>
              <span className="text-[9px] font-bold text-zinc-950 uppercase tracking-wider">LIVE</span>
            </div>
            
            <div className="flex items-center gap-3 border-r border-zinc-200 dark:border-zinc-800 pr-4 mt-1">
              <CloudSun className="h-8 w-8 text-zinc-950 dark:text-emerald-400" />
              <div>
                <div className="text-[11px] font-bold text-zinc-950 dark:text-emerald-400 flex items-center gap-1">
                  <span>{weather.city}</span>
                </div>
                <div className="text-xl font-extrabold text-zinc-950 dark:text-white flex items-baseline gap-1.5">
                  {weather.temp}°C 
                  <span className="text-[11px] font-semibold text-zinc-950 dark:text-zinc-400">
                    {weather.condition}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-center text-[10px]">
              {weather.hourly.map((h, idx) => (
                <div key={idx} className="px-1">
                  <div className="text-zinc-950/80 dark:text-zinc-400 font-semibold">{h.time}</div>
                  <div className="font-extrabold text-zinc-950 dark:text-zinc-200 mt-0.5">{h.temp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Banner Mini Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* Students Card */}
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-300/80 dark:border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs">
            <div>
              <div className="text-xs uppercase font-extrabold text-zinc-950 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                STUDENTS <ChevronRight className="h-3.5 w-3.5 text-zinc-950 dark:text-emerald-400" />
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-zinc-950 dark:text-zinc-300 flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-zinc-950" />
                  MALE: <span className="font-extrabold text-zinc-950 dark:text-white">{dashboardData?.stats?.students?.male} ({dashboardData?.stats?.students?.malePercent}%)</span>
                </div>
                <div className="text-xs text-zinc-950 dark:text-zinc-300 flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-[#00bb7f]" />
                  FEMALE: <span className="font-extrabold text-zinc-950 dark:text-white">{dashboardData?.stats?.students?.female} ({dashboardData?.stats?.students?.femalePercent}%)</span>
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
                        <Cell key={`cell-${index}`} fill={entry.color || '#d1fae5'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span className="absolute text-sm font-extrabold text-zinc-950 dark:text-white">{dashboardData?.stats?.students?.total}</span>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-300/80 dark:border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs">
            <div>
              <div className="text-xs uppercase font-extrabold text-zinc-950 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                TODAY'S ATTENDANCE <ChevronRight className="h-3.5 w-3.5 text-zinc-950 dark:text-emerald-400" />
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-zinc-950 dark:text-zinc-300 flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-zinc-950" />
                  STUDENTS: <span className="font-extrabold text-zinc-950 dark:text-white">{(dashboardData?.stats?.attendance?.studentsPresent ?? 0)} / {(dashboardData?.stats?.attendance?.studentsTotal ?? 0)}</span>
                </div>
                <div className="text-xs text-zinc-950 dark:text-zinc-300 flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-[#00bb7f]" />
                  STAFF: <span className="font-extrabold text-zinc-950 dark:text-white">{(dashboardData?.stats?.attendance?.staffPresent ?? 0)} / {(dashboardData?.stats?.attendance?.staffTotal ?? 0)}</span>
                </div>
              </div>
            </div>
            <div className="h-14 w-14 rounded-full border-4 border-zinc-300 dark:border-zinc-800 flex items-center justify-center">
              <span className="text-xs font-bold text-zinc-950 dark:text-emerald-400">{(dashboardData?.stats?.attendance?.studentAttPercent ?? 0)}%</span>
            </div>
          </div>

          {/* Fees Collection Card */}
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-300/80 dark:border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs">
            <div>
              <div className="text-xs uppercase font-extrabold text-zinc-950 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                FEES COLLECTION <ChevronRight className="h-3.5 w-3.5 text-zinc-950 dark:text-emerald-400" />
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-zinc-950 dark:text-zinc-300 flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-zinc-950" />
                  COLLECTED: <span className="font-extrabold text-zinc-950 dark:text-white">${(dashboardData?.stats?.fees?.collectedFees?.toLocaleString?.() || '0')} ({(dashboardData?.stats?.fees?.collectionPercentage ?? 0)}%)</span>
                </div>
                <div className="text-xs text-zinc-950 dark:text-zinc-300 flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-[#00bb7f]" />
                  TOTAL FEES: <span className="font-extrabold text-zinc-950 dark:text-white">${(dashboardData?.stats?.fees?.totalFees?.toLocaleString?.() || '0')}</span>
                </div>
              </div>
            </div>
            <div className="h-14 w-14 rounded-full border-4 border-zinc-300 dark:border-zinc-800 flex items-center justify-center">
              <span className="text-xs font-bold text-zinc-950 dark:text-emerald-400">{(dashboardData?.stats?.fees?.collectionPercentage ?? 0)}%</span>
            </div>
          </div>
        </div>

        {/* 5 REAL WORKING QUICK ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3 mt-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/60">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border border-zinc-300/90 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-xs font-bold text-zinc-950 dark:text-zinc-300 hover:bg-zinc-100 hover:border-zinc-950 hover:text-zinc-800 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 cursor-pointer shadow-xs"
            onClick={() => router.push('/dashboard/students/add')}
          >
            <UserPlus className="h-3.5 w-3.5 text-zinc-950 dark:text-emerald-400" /> Student Admission
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border border-zinc-300/90 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-xs font-bold text-zinc-950 dark:text-zinc-300 hover:bg-zinc-100 hover:border-zinc-950 hover:text-zinc-800 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 cursor-pointer shadow-xs"
            onClick={() => router.push('/dashboard/fees/invoice')}
          >
            <CreditCard className="h-3.5 w-3.5 text-zinc-950 dark:text-emerald-400" /> Collect Fees
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border border-zinc-300/90 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-xs font-bold text-zinc-950 dark:text-zinc-300 hover:bg-zinc-100 hover:border-zinc-950 hover:text-zinc-800 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 cursor-pointer shadow-xs"
            onClick={() => router.push('/dashboard/students/attendance')}
          >
            <CheckSquare className="h-3.5 w-3.5 text-zinc-950 dark:text-emerald-400" /> Attendance
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border border-zinc-300/90 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-xs font-bold text-zinc-950 dark:text-zinc-300 hover:bg-zinc-100 hover:border-zinc-950 hover:text-zinc-800 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 cursor-pointer shadow-xs"
            onClick={handleOpenCreateNotice}
          >
            <Bell className="h-3.5 w-3.5 text-zinc-950 dark:text-emerald-400" /> Add Notice
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border border-zinc-300/90 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-xs font-bold text-zinc-950 dark:text-zinc-300 hover:bg-zinc-100 hover:border-zinc-950 hover:text-zinc-800 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 cursor-pointer shadow-xs"
            onClick={() => setIsExpenseModalOpen(true)}
          >
            <Receipt className="h-3.5 w-3.5 text-zinc-950 dark:text-emerald-400" /> Add Expense
          </Button>
        </div>
      </div>

      {/* 2. 4 TOTAL STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 p-5 hover:border-zinc-950/60 transition-all cursor-pointer shadow-xs rounded-2xl"
          onClick={() => router.push('/dashboard/students')}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-emerald-500/10 border border-zinc-300/80 dark:border-emerald-500/20 flex items-center justify-center text-zinc-950 dark:text-emerald-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 dark:text-white">{dashboardData?.stats?.students?.total}</div>
              <div className="text-xs uppercase font-extrabold text-zinc-950 dark:text-zinc-400 tracking-wider">TOTAL STUDENTS</div>
            </div>
          </div>
        </Card>

        <Card 
          className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 p-5 hover:border-zinc-950/60 transition-all cursor-pointer shadow-xs rounded-2xl"
          onClick={() => router.push('/dashboard/hr/staff-directory')}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-emerald-500/10 border border-zinc-300/80 dark:border-emerald-500/20 flex items-center justify-center text-zinc-950 dark:text-emerald-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 dark:text-white">{(dashboardData?.stats?.teachers ?? 0)}</div>
              <div className="text-xs uppercase font-extrabold text-zinc-950 dark:text-zinc-400 tracking-wider">TOTAL TEACHERS</div>
            </div>
          </div>
        </Card>

        {/* Parents Card */}
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 p-5 hover:border-zinc-950/60 transition-all shadow-xs rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-emerald-500/10 border border-zinc-300/80 dark:border-emerald-500/20 flex items-center justify-center text-zinc-950 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 dark:text-white">{(dashboardData?.stats?.parents ?? 0)}</div>
              <div className="text-xs uppercase font-extrabold text-zinc-950 dark:text-zinc-400 tracking-wider">TOTAL PARENTS</div>
            </div>
          </div>
        </Card>

        <Card 
          className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 p-5 hover:border-zinc-950/60 transition-all cursor-pointer shadow-xs rounded-2xl"
          onClick={() => router.push('/dashboard/hr/staff-directory')}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-emerald-500/10 border border-zinc-300/80 dark:border-emerald-500/20 flex items-center justify-center text-zinc-950 dark:text-emerald-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-zinc-950 dark:text-white">{(dashboardData?.stats?.staffs ?? 0)}</div>
              <div className="text-xs uppercase font-extrabold text-zinc-950 dark:text-zinc-400 tracking-wider">TOTAL STAFFS</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. 2 FINANCIAL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: Monthly Breakdown */}
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-zinc-950" />
              <CardTitle className="text-sm font-bold text-zinc-950 dark:text-zinc-200">
                Income and Expenses for {monthNames[month]} {year}
              </CardTitle>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-zinc-950 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-zinc-950" /> Income
              </div>
              <div className="flex items-center gap-1.5 text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Expense
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-100/40 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] uppercase font-extrabold text-zinc-950 dark:text-zinc-400">TOTAL INCOME</div>
                <div className="text-sm font-black text-zinc-950 dark:text-emerald-400 mt-0.5">${(dashboardData?.stats?.fees?.totalIncome?.toLocaleString?.() || '0')}</div>
              </div>
              <div className="bg-zinc-100/40 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] uppercase font-extrabold text-zinc-950 dark:text-zinc-400">TOTAL EXPENSES</div>
                <div className="text-sm font-black text-rose-500 mt-0.5">${(dashboardData?.stats?.fees?.totalExpenses?.toLocaleString?.() || '0')}</div>
              </div>
              <div className="bg-zinc-100/40 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] uppercase font-extrabold text-zinc-950 dark:text-zinc-400">TOTAL PROFIT</div>
                <div className="text-sm font-black text-zinc-950 dark:text-emerald-400 mt-0.5">${(dashboardData?.stats?.fees?.totalProfit?.toLocaleString?.() || '0')}</div>
              </div>
            </div>

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData?.charts?.monthly || []} barGap={4}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#009966" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#007a52" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" opacity={0.8} vertical={false} />
                  <XAxis dataKey="day" stroke="#009966" fontSize={11} tickLine={false} axisLine={{ stroke: '#d1fae5' }} />
                  <YAxis stroke="#009966" fontSize={11} tickLine={false} axisLine={{ stroke: '#d1fae5' }} />
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#d1fae5', 
                      borderRadius: '8px', 
                      fontSize: '12px',
                      color: '#009966',
                      boxShadow: '0 4px 15px -2px rgba(0, 153, 102, 0.15)'
                    }}
                    labelStyle={{ color: '#009966', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="income" fill="url(#incomeGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" fill="url(#expenseGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Chart: Yearly Trajectory */}
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-zinc-950" />
              <CardTitle className="text-sm font-bold text-zinc-950 dark:text-zinc-200">
                Income and Expenses for {year}
              </CardTitle>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-zinc-950 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-zinc-950" /> Income
              </div>
              <div className="flex items-center gap-1.5 text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Expense
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-100/40 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] uppercase font-extrabold text-zinc-950 dark:text-zinc-400">TOTAL INCOME</div>
                <div className="text-sm font-black text-zinc-950 dark:text-emerald-400 mt-0.5">${(dashboardData?.stats?.fees?.totalIncome?.toLocaleString?.() || '0')}</div>
              </div>
              <div className="bg-zinc-100/40 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] uppercase font-extrabold text-zinc-950 dark:text-zinc-400">TOTAL EXPENSES</div>
                <div className="text-sm font-black text-rose-500 mt-0.5">${(dashboardData?.stats?.fees?.totalExpenses?.toLocaleString?.() || '0')}</div>
              </div>
              <div className="bg-zinc-100/40 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] uppercase font-extrabold text-zinc-950 dark:text-zinc-400">TOTAL REVENUE</div>
                <div className="text-sm font-black text-zinc-950 dark:text-emerald-400 mt-0.5">${(dashboardData?.stats?.fees?.totalIncome?.toLocaleString?.() || '0')}</div>
              </div>
            </div>

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.charts?.yearly || []}>
                  <defs>
                    <linearGradient id="areaIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#009966" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#009966" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="areaExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" opacity={0.8} vertical={false} />
                  <XAxis dataKey="month" stroke="#009966" fontSize={11} tickLine={false} axisLine={{ stroke: '#d1fae5' }} />
                  <YAxis stroke="#009966" fontSize={11} tickLine={false} axisLine={{ stroke: '#d1fae5' }} />
                  <Tooltip 
                    cursor={{ stroke: '#009966', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#d1fae5', 
                      borderRadius: '8px', 
                      fontSize: '12px',
                      color: '#009966',
                      boxShadow: '0 4px 15px -2px rgba(0, 153, 102, 0.15)'
                    }}
                    labelStyle={{ color: '#009966', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#009966" strokeWidth={2} fill="url(#areaIncome)" />
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
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-zinc-600" />
              <CardTitle className="text-sm font-semibold text-zinc-950 dark:text-zinc-200 font-bold">Notice Board</CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <Button 
                size="sm" 
                onClick={handleOpenCreateNotice}
                className="h-7 px-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-md flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Notice
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={fetchDashboardStats} 
                className="h-7 w-7 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-zinc-800 max-h-[360px] overflow-y-auto custom-scrollbar">
            {noticesList.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center">
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
                  <div key={notice._id} className="p-4 flex items-center justify-between hover:bg-white dark:bg-zinc-950/60 transition-colors group">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleViewNotice(notice)}>
                      <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-emerald-500/10 border border-zinc-300 dark:border-emerald-500/20 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-zinc-800 dark:text-emerald-400 leading-none">{dayNum}</span>
                        <span className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase leading-none mt-0.5">{monthStr}</span>
                      </div>
                      <div className="flex-1 pr-2">
                        <h4 className="text-sm font-medium text-zinc-950 dark:text-zinc-200 font-bold group-hover:text-zinc-800 dark:text-emerald-400 transition-colors line-clamp-1">
                          {notice.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          <span>{dateFull}</span>
                          <span className="text-zinc-600/80 font-medium text-[10px] uppercase">{notice.audience || 'All'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleViewNotice(notice)}
                        className="h-7 w-7 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-emerald-400 hover:bg-zinc-100 dark:bg-zinc-900"
                        title="View Notice"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleOpenEditNotice(notice)}
                        className="h-7 w-7 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-emerald-400 hover:bg-zinc-100 dark:bg-zinc-900"
                        title="Edit Notice"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={(e) => handleDeleteNotice(notice._id, e)}
                        className="h-7 w-7 text-zinc-600 dark:text-zinc-400 hover:text-rose-400 hover:bg-zinc-100 dark:bg-zinc-900"
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
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-zinc-600" />
              <CardTitle className="text-sm font-semibold text-zinc-950 dark:text-zinc-200 font-bold">Upcoming Events & Holidays</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[340px] text-center p-6">
            <div className="h-12 w-12 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 mb-3">
              <CalendarDays className="h-6 w-6" />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">No upcoming events or holidays scheduled.</p>
          </CardContent>
        </Card>
      </div>

      {/* 5. CALENDAR & TO DO LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* School Calendar */}
        <Card className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {monthNames[month]} {year}
              </h3>
              <div className="flex items-center gap-1 ml-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handlePrevMonth}
                  className="h-7 w-7 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleToday}
                  className="h-7 px-2.5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-800 dark:text-emerald-400"
                >
                  Today
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleNextMonth}
                  className="h-7 w-7 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-white dark:bg-zinc-950 p-1 border border-zinc-200 dark:border-zinc-800 text-xs">
                {['Month', 'Week', 'Day', 'List'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCalendarView(mode.toLowerCase())}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      calendarView === mode.toLowerCase()
                        ? 'bg-zinc-800 text-zinc-900 dark:text-white shadow'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-200 font-bold'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase pb-2 border-b border-zinc-200 dark:border-zinc-800">
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
                      ? 'bg-zinc-800/30 border-zinc-600 text-zinc-950 dark:text-zinc-200 font-bold font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : item.isToday
                      ? 'bg-emerald-950/40 border-zinc-600/60 text-zinc-950 dark:text-zinc-200 font-bold font-bold'
                      : item.isCurrentMonth
                      ? 'bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900'
                      : 'bg-white dark:bg-zinc-950/20 border-transparent text-zinc-700 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{item.day}</span>
                    {item.isToday && (
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real Interactive To Do List */}
        <Card className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-zinc-600" />
              <CardTitle className="text-sm font-semibold text-zinc-950 dark:text-zinc-200 font-bold">To Do List</CardTitle>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsAddingTodo(!isAddingTodo)}
              className="h-7 w-7 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-emerald-400 hover:bg-white dark:bg-zinc-950"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                <span>{completedCount}/{totalTodoCount} Completed</span>
                <span className="font-bold text-zinc-600">{todoPercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-white dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div 
                  className="h-full bg-zinc-600 transition-all duration-300" 
                  style={{ width: `${todoPercentage}%` }}
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex rounded-lg bg-white dark:bg-zinc-950 p-1 border border-zinc-200 dark:border-zinc-800 mt-4 text-xs">
                <button
                  onClick={() => setTodoTab('all')}
                  className={`flex-1 py-1 rounded-md font-semibold text-center uppercase tracking-wider transition-colors ${
                    todoTab === 'all'
                      ? 'bg-zinc-800 text-zinc-900 dark:text-white shadow'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-200 font-bold'
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setTodoTab('incomplete')}
                  className={`flex-1 py-1 rounded-md font-semibold text-center uppercase tracking-wider transition-colors ${
                    todoTab === 'incomplete'
                      ? 'bg-zinc-800 text-zinc-900 dark:text-white shadow'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-200 font-bold'
                  }`}
                >
                  INCOMPLETE
                </button>
                <button
                  onClick={() => setTodoTab('completed')}
                  className={`flex-1 py-1 rounded-md font-semibold text-center uppercase tracking-wider transition-colors ${
                    todoTab === 'completed'
                      ? 'bg-zinc-800 text-zinc-900 dark:text-white shadow'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:text-zinc-200 font-bold'
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
                    className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-950 dark:text-zinc-200 font-bold placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  />
                  <Button size="sm" type="submit" className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs h-8 px-3">
                    Add
                  </Button>
                </form>
              )}
            </div>

            {/* Todo Items */}
            <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1 flex-1">
              {filteredTodos.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 text-xs text-zinc-500 dark:text-zinc-400">
                  No tasks found in this tab
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <div
                    key={todo._id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:border-zinc-700 transition-colors group"
                  >
                    <div 
                      onClick={() => handleToggleTodo(todo._id)}
                      className="flex items-center gap-2.5 flex-1 cursor-pointer"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-zinc-600 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-zinc-500 dark:text-zinc-400 shrink-0 group-hover:text-zinc-600 transition-colors" />
                      )}
                      <span className={`text-xs ${todo.completed ? 'line-through text-zinc-500 dark:text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
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
        <DialogContent className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-zinc-600" />
              Quick Student Admission
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdmissionSubmit} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Usman"
                  value={admissionForm.firstName}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, firstName: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali"
                  value={admissionForm.lastName}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, lastName: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Gender</label>
                <select
                  value={admissionForm.gender}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, gender: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={admissionForm.dateOfBirth}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, dateOfBirth: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+92 300 0000000"
                value={admissionForm.contactNumber}
                onChange={(e) => setAdmissionForm({ ...admissionForm, contactNumber: e.target.value })}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAdmissionModalOpen(false)} className="text-zinc-600 dark:text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold">Save Student</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: COLLECT FEES */}
      <Dialog open={isFeeModalOpen} onOpenChange={setIsFeeModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-600" />
              Quick Fee Collection
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFeeSubmit} className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Student Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ali Hassan"
                value={feeForm.studentName}
                onChange={(e) => setFeeForm({ ...feeForm, studentName: e.target.value })}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Amount ($) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500"
                  value={feeForm.amount}
                  onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Payment Method</label>
                <select
                  value={feeForm.paymentMethod}
                  onChange={(e) => setFeeForm({ ...feeForm, paymentMethod: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online">Online</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Note / Description</label>
              <input
                type="text"
                value={feeForm.note}
                onChange={(e) => setFeeForm({ ...feeForm, note: e.target.value })}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsFeeModalOpen(false)} className="text-zinc-600 dark:text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold">Record Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: MARK ATTENDANCE */}
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-zinc-600" />
              Quick Mark Attendance
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAttendanceSubmit} className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Target Role</label>
              <select
                value={attendanceForm.userType}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, userType: e.target.value })}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
              >
                <option value="Student">Students</option>
                <option value="Staff">Staff</option>
                <option value="Teacher">Teachers</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Present Count</label>
                <input
                  type="number"
                  min="1"
                  value={attendanceForm.count}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, count: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Status</label>
                <select
                  value={attendanceForm.status}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAttendanceModalOpen(false)} className="text-zinc-600 dark:text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold">Submit Attendance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: ADD EXPENSE */}
      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-rose-500" />
              Quick Add Expense
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit} className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Expense Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Science Lab Equipment"
                value={expenseForm.title}
                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Amount ($) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 450"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:outline-none"
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
              <Button type="button" variant="ghost" onClick={() => setIsExpenseModalOpen(false)} className="text-zinc-600 dark:text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-zinc-900 dark:text-white">Save Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: ADD / EDIT NOTICE */}
      <Dialog open={isNoticeModalOpen} onOpenChange={setIsNoticeModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs text-zinc-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-zinc-600" />
              {editingNotice ? 'Edit Notice' : 'Publish New Notice'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNotice} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">Notice Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Annual Sports Gala 2026"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">Target Audience</label>
                <select
                  value={noticeForm.audience}
                  onChange={(e) => setNoticeForm({ ...noticeForm, audience: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                >
                  <option value="All">All Audiences</option>
                  <option value="Students">Students Only</option>
                  <option value="Teachers">Teachers Only</option>
                  <option value="Parents">Parents Only</option>
                  <option value="Staff">Staff Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">Publish Date</label>
                <input
                  type="date"
                  value={noticeForm.date}
                  onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">Notice Content / Description</label>
              <textarea
                rows={4}
                placeholder="Enter complete notice details, instructions, or timetable..."
                value={noticeForm.description}
                onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600 resize-none"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsNoticeModalOpen(false)} className="text-zinc-600 dark:text-zinc-400">Cancel</Button>
              <Button type="submit" className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold flex items-center gap-1.5">
                <Send className="h-4 w-4" />
                {editingNotice ? 'Update Notice' : 'Publish Notice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: VIEW NOTICE DETAILS */}
      <Dialog open={isViewNoticeModalOpen} onOpenChange={setIsViewNoticeModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800 shadow-xs text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-800 dark:text-emerald-400 flex items-center gap-2">
              <Bell className="h-4 w-4 text-zinc-600" />
              Notice Details
            </DialogTitle>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4 py-2">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug">
                  {selectedNotice.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                  <span className="bg-emerald-950/60 border border-zinc-900/60 text-zinc-800 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                    {selectedNotice.audience || 'All'}
                  </span>
                  <span>{new Date(selectedNotice.date || selectedNotice.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-zinc-950/80 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed min-h-[100px] whitespace-pre-wrap">
                {selectedNotice.description || 'No additional description provided.'}
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setIsViewNoticeModalOpen(false)} className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-950 dark:text-zinc-200 font-bold text-xs">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer Branding */}
      <div className="text-center text-xs text-zinc-600 pt-8 pb-4 border-t border-zinc-900">
        Copyright ├é┬⌐ {year} All rights reserved | This application is made with Stoofi ERP
      </div>
    </div>
  );
}


