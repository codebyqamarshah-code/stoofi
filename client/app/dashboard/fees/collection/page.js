'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Search,
  DollarSign,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Eye,
  Plus,
  Trash2,
  RotateCcw,
  User,
  CreditCard,
  Calendar,
  Users
} from 'lucide-react';
import { sortClassesAcademic, normalizeClassName } from '@/lib/academicUtils';
import { formatDateDMY } from '@/lib/utils';
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThreeCopyFeeSlipModal, { formatBillingMonthLabel } from '@/components/fees/ThreeCopyFeeSlipModal';

const FEE_TYPES = [
  'Monthly Tuition Fee',
  'Admission Processing Fee',
  'Tuition Fee 2026',
  'Admission & Registration Fee',
  'Annual Charges',
  'Mid-Term Exam Fee',
  'Final Exam Fee',
  'Laboratory & Computer Fee',
  'Library & Sports Fund',
  'College Bus Transport'
];

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Online Payment', 'JazzCash', 'EasyPaisa', 'Cheque'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getCurrentBillingMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getInvoiceBillingMonth(inv) {
  if (inv?.billingMonth && /^\d{4}-\d{2}$/.test(inv.billingMonth)) {
    return inv.billingMonth;
  }
  const rawDate = inv?.date || inv?.createdAt;
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
    } catch (_) {}
  }
  return '';
}

function buildMonthOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const options = [];
  for (let y = currentYear - 1; y <= currentYear + 1; y++) {
    for (let m = 0; m < 12; m++) {
      const val = `${y}-${String(m + 1).padStart(2, '0')}`;
      options.push({
        value: val,
        label: `${MONTH_NAMES[m]} ${y}`
      });
    }
  }
  return options;
}

export default function FeesCollectionPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectLoading, setCollectLoading] = useState(false);
  const [schoolSetting, setSchoolSetting] = useState(null);

  // Active Billing Month (Auto-resets to current calendar month when a new month starts)
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentBillingMonth());
  const monthOptions = useMemo(() => buildMonthOptions(), []);

  // Criteria Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [studentFeeFilter, setStudentFeeFilter] = useState('ALL'); // ALL | PAID | UNPAID | PARTIAL

  // History Filters
  const [historySearch, setHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Collection Form State (with itemized feeItems for 3-Copy Slip)
  const [formData, setFormData] = useState({
    studentId: '',
    student: '',
    fatherName: '',
    rollNo: '',
    admissionNo: '',
    className: '',
    section: '',
    billingMonth: getCurrentBillingMonth(),
    challanNo: '',
    feeType: 'Monthly Tuition Fee',
    feeItems: [
      { head: 'Monthly Tuition Fee', amount: 15000 }
    ],
    amount: 15000,
    waiver: 0,
    fine: 0,
    paid: 15000,
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    note: 'Monthly fee collected'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stuRes, clsRes, secRes, invRes, setRes] = await Promise.all([
        api.get('/student?limit=2000').catch(() => null),
        api.get('/class').catch(() => null),
        api.get('/section').catch(() => null),
        api.get('/fees-invoice?limit=2000').catch(() => null),
        api.get('/setting').catch(() => null)
      ]);

      if (stuRes?.success && Array.isArray(stuRes.data)) {
        setStudents(stuRes.data);
      }
      if (clsRes?.success && Array.isArray(clsRes.data)) {
        setClasses(clsRes.data);
      }
      if (secRes?.success && Array.isArray(secRes.data)) {
        setSections(secRes.data);
      }
      if (invRes?.success && Array.isArray(invRes.data)) {
        setInvoices(invRes.data);
      }
      if (setRes?.success && setRes.data) {
        setSchoolSetting(setRes.data);
      }
    } catch (e) {
      console.error('Fees collection fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Automatically check if calendar month rolled over while page is open
  useEffect(() => {
    const timer = setInterval(() => {
      const currentYM = getCurrentBillingMonth();
      setSelectedMonth((prev) => (prev !== currentYM ? currentYM : prev));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Match invoices to each student for the selectedMonth
  const studentMonthlyMap = useMemo(() => {
    const map = new Map();

    students.forEach((s) => {
      const stuFullName = `${s.firstName || ''} ${s.lastName || ''}`.trim().toLowerCase();
      const stuAdm = String(s.admissionNo || '').trim().toLowerCase();

      const monthInvoices = invoices.filter((inv) => {
        const invMonth = getInvoiceBillingMonth(inv);
        if (invMonth !== selectedMonth) return false;

        if (inv.studentId && String(inv.studentId) === String(s._id)) return true;
        if (stuAdm && inv.admissionNo && String(inv.admissionNo).trim().toLowerCase() === stuAdm) return true;
        if (stuFullName && inv.student && String(inv.student).trim().toLowerCase() === stuFullName) return true;
        return false;
      });

      if (monthInvoices.length === 0) {
        const defaultFee = Number(s.monthlyFee) || 15000;
        map.set(s._id, {
          status: 'UNPAID',
          paid: 0,
          amount: defaultFee,
          balance: defaultFee,
          waiver: 0,
          fine: 0,
          latestInvoice: null
        });
      } else {
        const latest = monthInvoices[0];
        const totalAmount = Number(latest.amount) || 15000;
        const totalWaiver = Number(latest.waiver) || 0;
        const totalFine = Number(latest.fine) || 0;
        const totalPaid = Number(latest.paid) || 0;
        const netPayable = Math.max(0, totalAmount - totalWaiver + totalFine);
        const balance =
          latest.balance !== undefined
            ? Number(latest.balance) || 0
            : Math.max(0, netPayable - totalPaid);

        let status = 'UNPAID';
        const rawStatus = String(latest.status || '').toUpperCase();
        if ((totalPaid > 0 && balance <= 0) || rawStatus === 'PAID') {
          status = 'PAID';
        } else if (totalPaid > 0 || rawStatus === 'PARTIAL') {
          status = 'PARTIAL';
        }

        map.set(s._id, {
          status,
          paid: totalPaid,
          amount: totalAmount,
          balance,
          waiver: totalWaiver,
          fine: totalFine,
          latestInvoice: latest
        });
      }
    });

    return map;
  }, [students, invoices, selectedMonth]);

  // Filter students based on Class, Section, Search, and Monthly Fee Status
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass =
        !selectedClass ||
        String(s.className || '').toLowerCase() === String(selectedClass).toLowerCase() ||
        String(s.className || '').toLowerCase() === `class ${String(selectedClass).toLowerCase()}`;

      const matchSection =
        !selectedSection ||
        String(s.section || '').toLowerCase() === String(selectedSection).toLowerCase();

      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      const father = String(s.fatherName || '').toLowerCase();
      const adm = String(s.admissionNo || '').toLowerCase();
      const roll = String(s.rollNo || '').toLowerCase();
      const q = searchStudent.toLowerCase().trim();

      const matchQuery =
        !q || fullName.includes(q) || father.includes(q) || adm.includes(q) || roll.includes(q);

      if (!matchClass || !matchSection || !matchQuery) return false;

      if (studentFeeFilter !== 'ALL') {
        const mInfo = studentMonthlyMap.get(s._id);
        const st = mInfo?.status || 'UNPAID';
        if (st !== studentFeeFilter) return false;
      }

      return true;
    });
  }, [students, selectedClass, selectedSection, searchStudent, studentFeeFilter, studentMonthlyMap]);

  // Monthly Summary KPI Stats (automatically resets to 0 on new month!)
  const monthlyStats = useMemo(() => {
    let paidCount = 0;
    let unpaidCount = 0;
    let partialCount = 0;
    let totalCollectedThisMonth = 0;
    let totalPendingThisMonth = 0;

    students.forEach((s) => {
      const matchClass =
        !selectedClass ||
        String(s.className || '').toLowerCase() === String(selectedClass).toLowerCase() ||
        String(s.className || '').toLowerCase() === `class ${String(selectedClass).toLowerCase()}`;
      const matchSection =
        !selectedSection ||
        String(s.section || '').toLowerCase() === String(selectedSection).toLowerCase();
      if (!matchClass || !matchSection) return;

      const info = studentMonthlyMap.get(s._id);
      if (!info || info.status === 'UNPAID') {
        unpaidCount++;
        totalPendingThisMonth += Number(info?.balance ?? 15000);
      } else if (info.status === 'PAID') {
        paidCount++;
        totalCollectedThisMonth += Number(info.paid || 0);
      } else if (info.status === 'PARTIAL') {
        partialCount++;
        totalCollectedThisMonth += Number(info.paid || 0);
        totalPendingThisMonth += Number(info.balance || 0);
      }
    });

    return {
      totalStudents: paidCount + unpaidCount + partialCount,
      paidCount,
      unpaidCount,
      partialCount,
      totalCollectedThisMonth,
      totalPendingThisMonth
    };
  }, [students, selectedClass, selectedSection, studentMonthlyMap]);

  // Dynamic class options sorted academically
  const classOptions = useMemo(() => {
    return [
      { value: '', label: 'All Classes' },
      ...sortClassesAcademic(classes.map((c) => ({ value: c.name, label: c.name })))
    ];
  }, [classes]);

  // Dynamic available sections based on selected class
  const availableSections = useMemo(() => {
    if (selectedClass) {
      const selectedClassObj = classes.find(
        (c) =>
          c.name === selectedClass ||
          normalizeClassName(c.name) === normalizeClassName(selectedClass)
      );
      if (
        selectedClassObj?.sections &&
        Array.isArray(selectedClassObj.sections) &&
        selectedClassObj.sections.length > 0
      ) {
        return [
          { value: '', label: 'All Sections' },
          ...selectedClassObj.sections.map((s) => {
            const raw = typeof s === 'string' ? s : s.name || '';
            const clean = raw.replace(/^section\s+/i, '');
            return { value: raw, label: `Section ${clean}` };
          })
        ];
      }
    }

    const allSecSet = new Set();
    (sections || []).forEach((s) => {
      const name = typeof s === 'string' ? s : s.name || '';
      if (name) allSecSet.add(name);
    });
    (classes || []).forEach((c) => {
      (c.sections || []).forEach((s) => {
        if (s) allSecSet.add(s);
      });
    });
    if (allSecSet.size === 0) {
      ['A', 'B', 'C', 'D'].forEach((s) => allSecSet.add(s));
    }

    return [
      { value: '', label: 'All Sections' },
      ...Array.from(allSecSet)
        .sort()
        .map((s) => {
          const clean = String(s).replace(/^section\s+/i, '');
          return { value: s, label: `Section ${clean}` };
        })
    ];
  }, [selectedClass, classes, sections]);

  // Open Collect Fee Modal for a Student
  const handleOpenCollect = (student) => {
    setActiveStudent(student);
    const stuFullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
    const clsName = `${student.className || ''} (${student.section || 'A'})`;
    const mInfo = studentMonthlyMap.get(student._id);
    const existingInv = mInfo?.latestInvoice;

    const existingItems =
      Array.isArray(existingInv?.feeItems) && existingInv.feeItems.length > 0
        ? existingInv.feeItems
        : [
            {
              head: existingInv?.feeType || 'Monthly Tuition Fee',
              amount: existingInv ? Number(existingInv.amount) || 15000 : 15000
            }
          ];

    const baseAmount = existingItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const waiver = existingInv ? Number(existingInv.waiver) || 0 : 0;
    const fine = existingInv ? Number(existingInv.fine) || 0 : 0;
    const netPayable = Math.max(0, baseAmount - waiver + fine);

    setFormData({
      studentId: student._id,
      student: stuFullName,
      fatherName: student.fatherName || '—',
      rollNo: student.rollNo || '',
      admissionNo: student.admissionNo || 'ADM-' + Math.floor(1000 + Math.random() * 9000),
      className: clsName,
      section: student.section || 'A',
      billingMonth: selectedMonth,
      challanNo: existingInv?.challanNo || String(Math.floor(10000 + Math.random() * 90000)),
      feeType: existingItems[0]?.head || 'Monthly Tuition Fee',
      feeItems: existingItems,
      amount: baseAmount,
      waiver,
      fine,
      paid: netPayable,
      paymentMethod: existingInv?.paymentMethod || 'Cash',
      date: new Date().toISOString().split('T')[0],
      dueDate:
        existingInv?.dueDate
          ? new Date(existingInv.dueDate).toISOString().split('T')[0]
          : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      note: existingInv?.note || `Fee collected for ${formatBillingMonthLabel(selectedMonth)}`
    });

    setIsCollectModalOpen(true);
  };

  // Directly Open 3-Copy Fee Challan Slip for any Student (Paid or Unpaid)
  const handleOpenStudentChallan = (student) => {
    const stuFullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
    const clsName = `${student.className || ''} (${student.section || 'A'})`;
    const mInfo = studentMonthlyMap.get(student._id);
    const existingInv = mInfo?.latestInvoice;

    if (existingInv) {
      setActiveReceipt({
        ...existingInv,
        student: existingInv.student || stuFullName,
        fatherName: existingInv.fatherName || student.fatherName || '—',
        rollNo: existingInv.rollNo || student.rollNo || '',
        admissionNo: existingInv.admissionNo || student.admissionNo || 'N/A',
        className: existingInv.className || clsName,
        billingMonth: existingInv.billingMonth || selectedMonth
      });
    } else {
      const defaultFee = Number(student.monthlyFee) || 15000;
      setActiveReceipt({
        challanNo: String(Math.floor(10000 + Math.random() * 90000)),
        billingMonth: selectedMonth,
        student: stuFullName,
        fatherName: student.fatherName || '—',
        rollNo: student.rollNo || '',
        admissionNo: student.admissionNo || 'N/A',
        className: clsName,
        feeType: 'Monthly Tuition Fee',
        feeItems: [{ head: 'Monthly Tuition Fee', amount: defaultFee }],
        amount: defaultFee,
        waiver: 0,
        fine: 0,
        paid: 0,
        balance: defaultFee,
        status: 'Unpaid',
        paymentMethod: 'Cash / Bank',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    setIsReceiptModalOpen(true);
  };

  // Update Fee Items in Collect Modal
  const handleFeeItemChange = (index, field, val) => {
    const updated = formData.feeItems.map((item, idx) =>
      idx === index ? { ...item, [field]: field === 'amount' ? Number(val) || 0 : val } : item
    );
    const totalAmt = updated.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const net = Math.max(0, totalAmt - (Number(formData.waiver) || 0) + (Number(formData.fine) || 0));
    setFormData((prev) => ({
      ...prev,
      feeItems: updated,
      feeType: updated[0]?.head || prev.feeType,
      amount: totalAmt,
      paid: net
    }));
  };

  const handleAddFeeItem = () => {
    const updated = [...formData.feeItems, { head: 'Examination / Lab Charges', amount: 1000 }];
    const totalAmt = updated.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const net = Math.max(0, totalAmt - (Number(formData.waiver) || 0) + (Number(formData.fine) || 0));
    setFormData((prev) => ({
      ...prev,
      feeItems: updated,
      amount: totalAmt,
      paid: net
    }));
  };

  const handleRemoveFeeItem = (index) => {
    if (formData.feeItems.length <= 1) return;
    const updated = formData.feeItems.filter((_, idx) => idx !== index);
    const totalAmt = updated.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const net = Math.max(0, totalAmt - (Number(formData.waiver) || 0) + (Number(formData.fine) || 0));
    setFormData((prev) => ({
      ...prev,
      feeItems: updated,
      feeType: updated[0]?.head || prev.feeType,
      amount: totalAmt,
      paid: net
    }));
  };

  // Balance & Status Calculation
  const computedBalance = useMemo(() => {
    const amt = Number(formData.amount) || 0;
    const wav = Number(formData.waiver) || 0;
    const fn = Number(formData.fine) || 0;
    const pd = Number(formData.paid) || 0;
    const bal = amt - wav + fn - pd;
    return bal < 0 ? 0 : bal;
  }, [formData.amount, formData.waiver, formData.fine, formData.paid]);

  const computedStatus = useMemo(() => {
    if (computedBalance <= 0 && Number(formData.paid) > 0) return 'Paid';
    if (Number(formData.paid) > 0) return 'Partial';
    return 'Unpaid';
  }, [computedBalance, formData.paid]);

  // Submit Fee Collection
  const handleSubmitCollection = async (e) => {
    e.preventDefault();
    if (Number(formData.amount) <= 0) {
      alert('Please enter a valid fee amount.');
      return;
    }

    try {
      setCollectLoading(true);
      const payload = {
        studentId: formData.studentId || undefined,
        student: formData.student,
        fatherName: formData.fatherName,
        rollNo: formData.rollNo,
        admissionNo: formData.admissionNo,
        className: formData.className,
        section: formData.section,
        billingMonth: formData.billingMonth || selectedMonth,
        challanNo: formData.challanNo || String(Math.floor(10000 + Math.random() * 90000)),
        feeType: formData.feeItems?.[0]?.head || formData.feeType,
        feeItems: formData.feeItems,
        amount: Number(formData.amount),
        waiver: Number(formData.waiver) || 0,
        fine: Number(formData.fine) || 0,
        paid: Number(formData.paid) || 0,
        balance: computedBalance,
        status: computedStatus,
        paymentMethod: formData.paymentMethod,
        date: formData.date,
        dueDate: formData.dueDate,
        note: formData.note,
        upsertMonthly: true
      };

      const res = await api.post('/fees-invoice', payload);
      const createdRecord = res?.data || {
        ...payload,
        _id: 'INV-' + Date.now(),
        createdAt: new Date()
      };

      setInvoices((prev) => {
        const filtered = prev.filter(
          (inv) =>
            !(
              inv._id === createdRecord._id ||
              (inv.admissionNo === createdRecord.admissionNo &&
                getInvoiceBillingMonth(inv) === createdRecord.billingMonth)
            )
        );
        return [createdRecord, ...filtered];
      });

      setIsCollectModalOpen(false);

      // Instantly open 3-Copy Fee Challan Slip Modal
      setActiveReceipt(createdRecord);
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error('Error recording fee payment:', err);
      alert('Failed to record fee payment. Please try again.');
    } finally {
      setCollectLoading(false);
    }
  };

  // View 3-Copy Receipt Modal from History
  const handleViewReceipt = (inv) => {
    const matchedStu = students.find(
      (s) =>
        (inv.studentId && String(s._id) === String(inv.studentId)) ||
        (inv.admissionNo && s.admissionNo === inv.admissionNo)
    );
    setActiveReceipt({
      ...inv,
      fatherName: inv.fatherName || matchedStu?.fatherName || '—',
      rollNo: inv.rollNo || matchedStu?.rollNo || '',
      billingMonth: getInvoiceBillingMonth(inv) || selectedMonth
    });
    setIsReceiptModalOpen(true);
  };

  // Filter Recent Collections History (for selectedMonth or All)
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invMonth = getInvoiceBillingMonth(inv);
      const matchMonth = !selectedMonth || invMonth === selectedMonth;
      const matchStatus =
        statusFilter === 'ALL' || inv.status?.toUpperCase() === statusFilter.toUpperCase();
      const q = historySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        String(inv.student || '').toLowerCase().includes(q) ||
        String(inv.admissionNo || '').toLowerCase().includes(q) ||
        String(inv.challanNo || '').toLowerCase().includes(q) ||
        String(inv.feeType || '').toLowerCase().includes(q) ||
        String(inv.paymentMethod || '').toLowerCase().includes(q);
      return matchMonth && matchStatus && matchSearch;
    });
  }, [invoices, selectedMonth, statusFilter, historySearch]);

  const currencySymbol = 'Rs. ';

  // Export configs for students directory
  const studentExportColumns = [
    { key: 'admissionNo', label: 'Admission No' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'fatherName', label: 'Father Name' },
    { key: 'classInfo', label: 'Class & Section' },
    { key: 'billingMonth', label: 'Billing Month' },
    { key: 'monthStatus', label: 'Fee Status' },
    { key: 'paidAmount', label: 'Paid (Rs.)' },
    { key: 'balanceAmount', label: 'Due Balance (Rs.)' }
  ];

  const studentExportData = filteredStudents.map((s) => {
    const mInfo = studentMonthlyMap.get(s._id);
    return {
      admissionNo: s.admissionNo || '—',
      studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
      fatherName: s.fatherName || '—',
      classInfo: `${s.className || 'Class'} (${s.section || 'A'})`,
      billingMonth: formatBillingMonthLabel(selectedMonth),
      monthStatus: mInfo?.status || 'UNPAID',
      paidAmount: mInfo?.paid || 0,
      balanceAmount: mInfo?.balance ?? 15000
    };
  });

  // Export configs for invoice collections
  const invoiceExportColumns = [
    { key: 'challanNo', label: 'Challan No' },
    { key: 'date', label: 'Date' },
    { key: 'billingMonth', label: 'Month' },
    { key: 'student', label: 'Student Name' },
    { key: 'admissionNo', label: 'Admission No' },
    { key: 'className', label: 'Class & Section' },
    { key: 'feeType', label: 'Fee Type' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'paid', label: 'Paid Amount (Rs.)' },
    { key: 'balance', label: 'Balance (Rs.)' },
    { key: 'status', label: 'Status' }
  ];

  const invoiceExportData = filteredInvoices.map((inv, idx) => ({
    challanNo: inv.challanNo || inv._id?.slice(-6)?.toUpperCase() || `CH-${1000 + idx}`,
    date: formatDateDMY(inv.date),
    billingMonth: formatBillingMonthLabel(getInvoiceBillingMonth(inv) || selectedMonth),
    student: inv.student || 'Student',
    admissionNo: inv.admissionNo || '—',
    className: inv.className || '—',
    feeType: inv.feeType || 'Tuition Fee',
    paymentMethod: inv.paymentMethod || 'Cash',
    paid: Number(inv.paid) || 0,
    balance: Number(inv.balance) || 0,
    status: inv.status || 'Paid'
  }));

  return (
    <div className="space-y-6">
      {/* Top Header & Billing Month Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-emerald-600" />
            Monthly Fees Collection &amp; Challan Desk
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Track monthly student Paid / Unpaid fee status (auto-resets each new month) and print or download 3-Copy Pak Royal College Fee Slips.
          </p>
        </div>

        {/* Active Billing Month Picker */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 shadow-xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#084A86]" />
            <span className="text-xs font-bold uppercase text-zinc-600">Billing Month:</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-9 rounded-xl border border-zinc-300 bg-zinc-50 px-3 text-xs font-extrabold text-[#084A86] focus:outline-none focus:ring-2 focus:ring-[#084A86] cursor-pointer"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {selectedMonth !== getCurrentBillingMonth() && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSelectedMonth(getCurrentBillingMonth())}
              className="h-8 text-xs font-bold border-zinc-200 text-zinc-700 rounded-xl cursor-pointer"
            >
              Current Month
            </Button>
          )}
        </div>
      </div>

      {/* 4 Live Monthly KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div
          onClick={() => setStudentFeeFilter('ALL')}
          className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            studentFeeFilter === 'ALL' ? 'border-[#084A86] ring-2 ring-[#084A86]/15' : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Total Students ({formatBillingMonthLabel(selectedMonth)})
            </span>
            <div className="text-2xl font-black text-zinc-950 mt-1">
              {monthlyStats.totalStudents}
            </div>
            <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">
              Click to view all students
            </div>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div
          onClick={() => setStudentFeeFilter('PAID')}
          className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            studentFeeFilter === 'PAID' ? 'border-emerald-600 ring-2 ring-emerald-600/15' : 'border-zinc-200 hover:border-emerald-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Fee Paid ({formatBillingMonthLabel(selectedMonth)})
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {monthlyStats.paidCount} Students
            </div>
            <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
              Collected: Rs. {monthlyStats.totalCollectedThisMonth.toLocaleString()}
            </div>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div
          onClick={() => setStudentFeeFilter('UNPAID')}
          className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            studentFeeFilter === 'UNPAID' ? 'border-rose-600 ring-2 ring-rose-600/15' : 'border-zinc-200 hover:border-rose-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Fee Unpaid ({formatBillingMonthLabel(selectedMonth)})
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {monthlyStats.unpaidCount} Students
            </div>
            <div className="text-[11px] font-bold text-rose-600 mt-0.5">
              Pending: Rs. {monthlyStats.totalPendingThisMonth.toLocaleString()}
            </div>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div
          onClick={() => setStudentFeeFilter('PARTIAL')}
          className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            studentFeeFilter === 'PARTIAL' ? 'border-amber-500 ring-2 ring-amber-500/15' : 'border-zinc-200 hover:border-amber-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Partial Paid ({formatBillingMonthLabel(selectedMonth)})
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {monthlyStats.partialCount} Students
            </div>
            <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">
              Remaining balance due
            </div>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Criteria Selection Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Search className="h-4 w-4 text-emerald-600" />
            Filter Students by Class, Section &amp; Monthly Fee Status
          </h2>

          {/* Paid / Unpaid Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
            {[
              { key: 'ALL', label: `All (${monthlyStats.totalStudents})` },
              { key: 'PAID', label: `✓ Paid (${monthlyStats.paidCount})` },
              { key: 'UNPAID', label: `✗ Unpaid (${monthlyStats.unpaidCount})` },
              { key: 'PARTIAL', label: `Partial (${monthlyStats.partialCount})` }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStudentFeeFilter(tab.key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  studentFeeFilter === tab.key
                    ? tab.key === 'PAID'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : tab.key === 'UNPAID'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : tab.key === 'PARTIAL'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-[#084A86] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Class</Label>
            <SearchableSelect
              options={classOptions}
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection('');
              }}
              placeholder="All Classes"
              name="class"
              className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer shadow-xs hover:border-zinc-400"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Section</Label>
            <SearchableSelect
              options={availableSections}
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              placeholder="All Sections"
              name="section"
              className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer shadow-xs hover:border-zinc-400"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-zinc-700 uppercase">
              Search by Student / Father / Admission / Roll No
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Type student name, father name, admission number, roll no..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="pl-9 h-10 bg-white border-zinc-200 text-zinc-900 text-sm focus-visible:ring-emerald-500 rounded-xl"
              />
              {searchStudent && (
                <button
                  onClick={() => setSearchStudent('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-500 font-semibold">
            Showing <strong>{filteredStudents.length}</strong> students for{' '}
            <strong className="text-[#084A86]">{formatBillingMonthLabel(selectedMonth)}</strong>
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedClass('');
              setSelectedSection('');
              setSearchStudent('');
              setStudentFeeFilter('ALL');
            }}
            className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-bold rounded-xl cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Filters
          </Button>
        </div>
      </div>

      {/* Student Fee Directory & Monthly Status Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs print:hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
          <div>
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              Student Fee Status Directory — {formatBillingMonthLabel(selectedMonth)}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live Paid / Unpaid status for {formatBillingMonthLabel(selectedMonth)}. Click &quot;Collect Fee&quot; to receive payment or &quot;3-Copy Slip&quot; to print/download challan.
            </p>
          </div>
          <TableExportToolbar
            data={studentExportData}
            columns={studentExportColumns}
            filename={`Student_Fee_Status_${selectedMonth}`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 uppercase bg-zinc-100/70 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">Admission No</th>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Class &amp; Section</th>
                <th className="px-4 py-3.5">Father Name</th>
                <th className="px-4 py-3.5">
                  Status ({formatBillingMonthLabel(selectedMonth)})
                </th>
                <th className="px-4 py-3.5">Paid Amount</th>
                <th className="px-4 py-3.5">Remaining Due</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                      Loading student fee records...
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-zinc-500">
                    No students found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student';
                  const mInfo = studentMonthlyMap.get(s._id) || {
                    status: 'UNPAID',
                    paid: 0,
                    balance: 15000,
                    latestInvoice: null
                  };
                  const isPaid = mInfo.status === 'PAID';
                  const isPartial = mInfo.status === 'PARTIAL';

                  return (
                    <tr
                      key={s._id}
                      className={`transition-colors ${
                        isPaid
                          ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                          : isPartial
                          ? 'bg-amber-50/20 hover:bg-amber-50/40'
                          : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <td className="px-4 py-3.5 font-bold text-zinc-900 font-mono text-xs">
                        {s.admissionNo || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                              isPaid
                                ? 'bg-emerald-600 text-white'
                                : isPartial
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.firstName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900">{fullName}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">
                              Roll: {s.rollNo || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-800">
                        <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-semibold">
                          {s.className || 'Class'} ({s.section || 'A'})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700">{s.fatherName || '—'}</td>

                      {/* Monthly Paid / Unpaid Badge */}
                      <td className="px-4 py-3.5">
                        {isPaid ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              FEE PAID
                            </span>
                            {mInfo.latestInvoice?.date && (
                              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                Paid on {formatDateDMY(mInfo.latestInvoice.date)}
                              </div>
                            )}
                          </div>
                        ) : isPartial ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              PARTIAL PAID
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                              UNPAID
                            </span>
                            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                              Not paid this month
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Paid Amount This Month */}
                      <td className="px-4 py-3.5 font-extrabold text-emerald-700 font-mono text-xs">
                        Rs. {(mInfo.paid || 0).toLocaleString()}
                      </td>

                      {/* Remaining Due Balance This Month */}
                      <td className="px-4 py-3.5 font-extrabold font-mono text-xs">
                        <span className={mInfo.balance > 0 ? 'text-rose-600' : 'text-zinc-400'}>
                          Rs. {(mInfo.balance || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Actions: Collect Fee + 3-Copy Slip */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleOpenStudentChallan(s)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs font-bold border-zinc-300 text-[#084A86] hover:bg-blue-50 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                            title="Generate, Print or Download 3-Copy Fee Slip"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            3-Copy Slip
                          </Button>

                          <Button
                            onClick={() => handleOpenCollect(s)}
                            size="sm"
                            className={`font-bold text-xs h-8 px-3.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer ${
                              isPaid
                                ? 'bg-zinc-800 hover:bg-zinc-900 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <DollarSign className="h-3.5 w-3.5" />
                            {isPaid ? 'Edit / Receipt' : 'Collect Fee'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Collections History & Ledger */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs print:hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <div>
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Collected Fee Slips &amp; Challan Ledger ({formatBillingMonthLabel(selectedMonth)})
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              View, print, or download 3-Copy Fee Challan Slips (Student Copy, Bank Copy, College Copy).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Search history..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="pl-8 h-9 text-xs bg-white border-zinc-200 text-zinc-900 w-44 rounded-xl"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 text-xs rounded-xl border border-zinc-200 bg-white px-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
            </select>

            <TableExportToolbar
              data={invoiceExportData}
              columns={invoiceExportColumns}
              filename={`Fee_Collections_${selectedMonth}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 uppercase bg-zinc-100/70 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">Challan / Date</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Month</th>
                <th className="px-4 py-3.5">Fee Head</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5">Paid Amount</th>
                <th className="px-4 py-3.5">Balance</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">3-Copy Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-zinc-500">
                    No fee collection records found for {formatBillingMonthLabel(selectedMonth)}.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => (
                  <tr key={inv._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-900 font-mono text-xs">
                        #{inv.challanNo || inv._id?.slice(-6)?.toUpperCase() || `314${idx}`}
                      </div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDateDMY(inv.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-900">{inv.student || 'Student'}</div>
                      <div className="text-[11px] text-zinc-500">
                        {inv.admissionNo} &bull; {inv.className}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold text-[#084A86]">
                      {formatBillingMonthLabel(getInvoiceBillingMonth(inv) || selectedMonth)}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-800 font-semibold">
                      {inv.feeType || 'Monthly Tuition Fee'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-xs font-semibold border border-zinc-200">
                        {inv.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700 font-mono">
                      {currencySymbol}
                      {(Number(inv.paid) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-rose-600 font-mono">
                      {currencySymbol}
                      {(Number(inv.balance) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          (inv.status || 'Paid').toLowerCase() === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : (inv.status || '').toLowerCase() === 'partial'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {(inv.status || 'Paid').toLowerCase() === 'paid' && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {(inv.status || '').toLowerCase() === 'partial' && (
                          <Clock className="h-3 w-3" />
                        )}
                        {(inv.status || '').toLowerCase() === 'unpaid' && (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {inv.status || 'Paid'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        onClick={() => handleViewReceipt(inv)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-bold border-zinc-300 text-[#084A86] hover:bg-blue-50 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                        title="Open 3-Copy Fee Challan Slip (Print / Download)"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        3-Copy Slip
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fee & Itemized Challan Builder Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:hidden">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <img
                  src="/pak-royal-badge.png"
                  alt="Pak Royal College"
                  className="h-9 w-9 object-contain"
                />
                <div>
                  <h3 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                    Collect Monthly Fee &amp; Generate 3-Copy Slip
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Billing Month: <strong className="text-[#084A86]">{formatBillingMonthLabel(formData.billingMonth)}</strong> &bull; Challan #{formData.challanNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCollectModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCollection} className="p-6 space-y-4">
              {/* Student Summary Card */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-800 font-bold uppercase">
                    Student Information
                  </div>
                  <div className="text-sm font-bold text-zinc-950 mt-0.5">
                    {formData.student}{' '}
                    <span className="text-xs font-normal text-zinc-600">
                      (S/D of {formData.fatherName})
                    </span>
                  </div>
                  <div className="text-xs text-zinc-600 font-medium">
                    Adm: {formData.admissionNo} &bull; {formData.className}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">
                    Month Status
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${
                      computedStatus === 'Paid'
                        ? 'bg-emerald-600 text-white'
                        : computedStatus === 'Partial'
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {computedStatus}
                  </span>
                </div>
              </div>

              {/* Itemized Fee Heads Section (Appears on the 3-Copy Slip) */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-extrabold text-zinc-800 uppercase">
                    Fee Particulars / Heads (Printed on 3-Copy Slip)
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddFeeItem}
                    className="h-7 px-2.5 text-xs font-bold border-zinc-300 text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Fee Head
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.feeItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-7">
                        <input
                          type="text"
                          list="pak-royal-fee-heads"
                          value={item.head}
                          onChange={(e) => handleFeeItemChange(idx, 'head', e.target.value)}
                          placeholder="e.g. Monthly Tuition Fee"
                          className="w-full h-9 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          min="0"
                          value={item.amount}
                          onChange={(e) => handleFeeItemChange(idx, 'amount', e.target.value)}
                          placeholder="Amount (Rs.)"
                          className="h-9 bg-white border-zinc-300 text-zinc-900 rounded-lg text-xs font-bold"
                          required
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {formData.feeItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFeeItem(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Head"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <datalist id="pak-royal-fee-heads">
                    {FEE_TYPES.map((f) => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Billing Month
                  </Label>
                  <select
                    value={formData.billingMonth}
                    onChange={(e) => setFormData({ ...formData, billingMonth: e.target.value })}
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {monthOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Payment / Issue Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-sm font-medium h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Due Date (On Slip)
                  </Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-sm font-medium h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Total Fee Amount ({currencySymbol})
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-zinc-100 border-zinc-200 text-zinc-900 rounded-xl text-sm font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Amount Paying Now ({currencySymbol}) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.paid}
                    onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                    className="bg-emerald-50/50 border-emerald-300 text-emerald-900 rounded-xl text-sm font-extrabold focus-visible:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Late Fee / Fine ({currencySymbol})
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.fine}
                    onChange={(e) => {
                      const fn = Number(e.target.value) || 0;
                      const net = Math.max(0, (Number(formData.amount) || 0) + fn);
                      setFormData({ ...formData, fine: e.target.value, paid: net });
                    }}
                    className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Payment Method
                  </Label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Remaining Balance
                  </Label>
                  <div className="h-10 px-3 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center text-sm font-bold text-rose-600">
                    {currencySymbol}
                    {computedBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="border-zinc-200 text-zinc-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={collectLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {collectLoading ? 'Saving...' : 'Save Fee & Open 3-Copy Slip'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official 3-Copy Fee Challan / Slip Modal (1. Student Copy, 2. Bank Copy, 3. College Copy) */}
      <ThreeCopyFeeSlipModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        slipData={activeReceipt}
        schoolSetting={schoolSetting}
      />
    </div>
  );
}
