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
  RotateCcw,
  User,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FEE_TYPES = [
  'Tuition Fee 2026',
  'Admission & Registration Fee',
  'Annual Charges',
  'Monthly Tuition Fee',
  'Mid-Term Exam Fee',
  'Final Exam Fee',
  'School Bus Transport',
  'Laboratory & Computer Fee',
  'Sports & Activity Fund'
];

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Online Payment', 'JazzCash', 'EasyPaisa', 'Cheque'];

export default function FeesCollectionPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectLoading, setCollectLoading] = useState(false);
  const [schoolSetting, setSchoolSetting] = useState(null);

  // Criteria Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Collection Form State
  const [formData, setFormData] = useState({
    student: '',
    admissionNo: '',
    className: '',
    feeType: 'Monthly Tuition Fee',
    amount: 15000,
    waiver: 0,
    fine: 0,
    paid: 15000,
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    note: 'Fee collected successfully'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stuRes, clsRes, secRes, invRes, setRes] = await Promise.all([
        api.get('/student?limit=1000').catch(() => null),
        api.get('/class').catch(() => null),
        api.get('/section').catch(() => null),
        api.get('/fees-invoice?limit=100').catch(() => null),
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

  // Filter students based on search criteria
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = !selectedClass || 
        String(s.className || '').toLowerCase() === String(selectedClass).toLowerCase() ||
        String(s.className || '').toLowerCase() === `class ${String(selectedClass).toLowerCase()}`;
      
      const matchSection = !selectedSection || 
        String(s.section || '').toLowerCase() === String(selectedSection).toLowerCase();
      
      const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
      const adm = String(s.admissionNo || '').toLowerCase();
      const roll = String(s.rollNo || '').toLowerCase();
      const q = searchStudent.toLowerCase().trim();

      const matchQuery = !q || fullName.includes(q) || adm.includes(q) || roll.includes(q);

      return matchClass && matchSection && matchQuery;
    });
  }, [students, selectedClass, selectedSection, searchStudent]);

  // Open Quick Fee Collection Modal for a Student
  const handleOpenCollect = (student) => {
    setActiveStudent(student);
    const stuFullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
    const clsName = `${student.className || ''} (${student.section || 'A'})`;
    
    // Find existing unpaid/partial invoice if any
    const existingInv = invoices.find(inv => 
      (inv.admissionNo && inv.admissionNo === student.admissionNo) || 
      (inv.student && inv.student.toLowerCase() === stuFullName.toLowerCase())
    );

    const baseAmount = existingInv ? (Number(existingInv.amount) || 15000) : 15000;
    const dueAmount = existingInv ? (Number(existingInv.balance) || baseAmount) : baseAmount;

    setFormData({
      student: stuFullName,
      admissionNo: student.admissionNo || 'ADM-' + Math.floor(1000 + Math.random() * 9000),
      className: clsName,
      feeType: existingInv?.feeType || 'Monthly Tuition Fee',
      amount: baseAmount,
      waiver: 0,
      fine: 0,
      paid: dueAmount,
      paymentMethod: 'Cash',
      date: new Date().toISOString().split('T')[0],
      note: 'Official fee collection'
    });

    setIsCollectModalOpen(true);
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
    if (computedBalance <= 0) return 'Paid';
    if (Number(formData.paid) > 0) return 'Partial';
    return 'Unpaid';
  }, [computedBalance, formData.paid]);

  // Submit Fee Collection
  const handleSubmitCollection = async (e) => {
    e.preventDefault();
    if (Number(formData.paid) <= 0 && Number(formData.amount) > 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    try {
      setCollectLoading(true);
      const payload = {
        student: formData.student,
        admissionNo: formData.admissionNo,
        className: formData.className,
        feeType: formData.feeType,
        amount: Number(formData.amount),
        waiver: Number(formData.waiver) || 0,
        fine: Number(formData.fine) || 0,
        paid: Number(formData.paid) || 0,
        balance: computedBalance,
        status: computedStatus,
        paymentMethod: formData.paymentMethod,
        date: formData.date,
        note: formData.note
      };

      const res = await api.post('/fees-invoice', payload);
      const createdRecord = res?.data || { ...payload, _id: 'INV-' + Date.now(), createdAt: new Date() };

      setInvoices(prev => [createdRecord, ...prev]);
      setIsCollectModalOpen(false);

      // Instantly open receipt voucher
      setActiveReceipt(createdRecord);
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error('Error recording fee payment:', err);
      alert('Failed to record fee payment. Please try again.');
    } finally {
      setCollectLoading(false);
    }
  };

  // View Receipt Modal
  const handleViewReceipt = (inv) => {
    setActiveReceipt(inv);
    setIsReceiptModalOpen(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Filter Recent Collections History
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = statusFilter === 'ALL' || inv.status?.toUpperCase() === statusFilter.toUpperCase();
      const q = historySearch.toLowerCase().trim();
      const matchSearch = !q || 
        String(inv.student || '').toLowerCase().includes(q) ||
        String(inv.admissionNo || '').toLowerCase().includes(q) ||
        String(inv.feeType || '').toLowerCase().includes(q) ||
        String(inv.paymentMethod || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [invoices, statusFilter, historySearch]);

  const currencySymbol = schoolSetting?.currencySymbol || 'PKR ';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-emerald-600" />
            Fees Collection & Cashier Desk
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Search student accounts, receive cash/online fee payments, and generate official vouchers & receipts.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Fees</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-semibold text-zinc-900">Collection</span>
        </div>
      </div>

      {/* Criteria Selection Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Search className="h-4 w-4 text-emerald-600" />
            Select Criteria to Collect Fee
          </h2>
          <span className="text-xs text-zinc-500 font-medium">
            Showing {filteredStudents.length} Students
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Class</Label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c._id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Section</Label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="">All Sections</option>
              {sections.map(s => (
                <option key={s._id || s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Search by Student / Admission / Roll No</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Type student name, admission number, roll no..."
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
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

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => { setSelectedClass(''); setSelectedSection(''); setSearchStudent(''); }}
            className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-bold rounded-xl"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Filters
          </Button>
        </div>
      </div>

      {/* Student List & Direct Collection Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs print:hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
          <div>
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              Student Fee Directory & Quick Collection
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Click &quot;Collect Fee&quot; to receive fee payment and generate print receipts.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 uppercase bg-zinc-100/70 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">Admission No</th>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Class & Section</th>
                <th className="px-4 py-3.5">Father Name</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                      Loading student records...
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                    No students found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student';
                  return (
                    <tr key={s._id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-zinc-900">{s.admissionNo || '—'}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {s.firstName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900">{fullName}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">Roll: {s.rollNo || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-800">
                        <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-semibold">
                          Class {s.className || '10'} ({s.section || 'A'})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700">{s.fatherName || '—'}</td>
                      <td className="px-4 py-3.5 text-zinc-700">{s.phone || s.fatherPhone || '—'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          onClick={() => handleOpenCollect(s)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Collect Fee
                        </Button>
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
              Recent Collection History & Invoices
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">List of all collected payments, receipts, and outstanding dues.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Search history..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="pl-8 h-9 text-xs bg-white border-zinc-200 text-zinc-900 w-44 rounded-xl"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 text-xs rounded-xl border border-zinc-200 bg-white px-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
            </select>

            <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-3">
              <Button 
                onClick={() => exportToCSV(filteredInvoices, 'Fee_Collections')}
                variant="outline" size="icon" className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100" title="Export CSV"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button 
                onClick={() => exportToExcel(filteredInvoices, 'Fee_Collections', 'Collections')}
                variant="outline" size="icon" className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100" title="Export Excel"
              >
                <FileText className="h-3.5 w-3.5" />
              </Button>
              <Button 
                onClick={() => exportToPDF(filteredInvoices, 'Fee_Collections', 'Fee Collections Report')}
                variant="outline" size="icon" className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-700 hover:bg-zinc-100" title="Export PDF"
              >
                <Printer className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 uppercase bg-zinc-100/70 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">Invoice / Receipt</th>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Fee Type</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5">Paid Amount</th>
                <th className="px-4 py-3.5">Balance</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-zinc-500">
                    No fee collection records found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => (
                  <tr key={inv._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-900 font-mono text-xs">
                        #{inv._id?.slice(-6)?.toUpperCase() || `INV-${1000 + idx}`}
                      </div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {inv.date ? new Date(inv.date).toLocaleDateString() : 'Today'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-900">{inv.student || 'Student'}</div>
                      <div className="text-[11px] text-zinc-500">{inv.admissionNo} • {inv.className}</div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-800 font-semibold">{inv.feeType || 'Tuition Fee'}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-xs font-semibold border border-zinc-200">
                        {inv.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">
                      {currencySymbol}{(Number(inv.paid) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-rose-600">
                      {currencySymbol}{(Number(inv.balance) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        (inv.status || 'Paid').toLowerCase() === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : (inv.status || '').toLowerCase() === 'partial'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {(inv.status || 'Paid').toLowerCase() === 'paid' && <CheckCircle2 className="h-3 w-3" />}
                        {(inv.status || '').toLowerCase() === 'partial' && <Clock className="h-3 w-3" />}
                        {(inv.status || '').toLowerCase() === 'unpaid' && <AlertCircle className="h-3 w-3" />}
                        {inv.status || 'Paid'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        onClick={() => handleViewReceipt(inv)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-semibold border-zinc-200 text-zinc-800 hover:bg-zinc-100 rounded-xl inline-flex items-center gap-1 cursor-pointer"
                        title="View and Print Official Voucher"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Voucher
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fee Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:hidden">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  Receive Fee Payment
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Collect payment and generate instant official receipt</p>
              </div>
              <button 
                onClick={() => setIsCollectModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCollection} className="p-6 space-y-4">
              {/* Student Summary Card */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-800 font-bold uppercase">Student Details</div>
                  <div className="text-sm font-bold text-zinc-950 mt-0.5">{formData.student}</div>
                  <div className="text-xs text-zinc-600 font-medium">Adm: {formData.admissionNo} • {formData.className}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Calculated Status</div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${
                    computedStatus === 'Paid' ? 'bg-emerald-600 text-white' : computedStatus === 'Partial' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {computedStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Fee Type <span className="text-rose-500">*</span></Label>
                  <select
                    value={formData.feeType}
                    onChange={e => setFormData({ ...formData, feeType: e.target.value })}
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  >
                    {FEE_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Payment Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-sm font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Total Fee Amount ({currencySymbol})</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-sm font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Amount Paying Now ({currencySymbol}) <span className="text-rose-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.paid}
                    onChange={e => setFormData({ ...formData, paid: e.target.value })}
                    className="bg-emerald-50/50 border-emerald-300 text-emerald-900 rounded-xl text-sm font-extrabold focus-visible:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Discount / Waiver ({currencySymbol})</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.waiver}
                    onChange={e => setFormData({ ...formData, waiver: e.target.value })}
                    className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Late Fee / Fine ({currencySymbol})</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.fine}
                    onChange={e => setFormData({ ...formData, fine: e.target.value })}
                    className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Payment Method</Label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Remaining Balance</Label>
                  <div className="h-10 px-3 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center text-sm font-bold text-rose-600">
                    {currencySymbol}{computedBalance.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Payment Note / Reference</Label>
                  <Input
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                    placeholder="e.g. Paid in full via Cash counter #1"
                    className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="border-zinc-200 text-zinc-700 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={collectLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {collectLoading ? 'Processing...' : 'Confirm & Collect Fee'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Voucher / Receipt Modal */}
      {isReceiptModalOpen && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between print:hidden bg-zinc-50/50 rounded-t-2xl">
              <span className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-600" /> Official Fee Voucher
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handlePrintReceipt}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Voucher
                </Button>
                <button 
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Content */}
            <div className="p-8 space-y-6 text-zinc-900 bg-white">
              <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">
                    {schoolSetting?.schoolName || 'STOOFI GRAMMAR SCHOOL'}
                  </h2>
                  <p className="text-xs text-zinc-600 mt-0.5 font-medium">
                    {schoolSetting?.address || 'Main Campus, Boulevard Avenue, Sector G-10'}
                  </p>
                  <p className="text-xs text-zinc-600 font-mono">
                    Phone: {schoolSetting?.phone || '+92 300 1234567'} | Email: {schoolSetting?.email || 'accounts@stoofi.edu'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-md bg-zinc-950 text-white font-extrabold text-xs uppercase tracking-wider inline-block">
                    FEE VOUCHER
                  </span>
                  <div className="text-xs font-bold text-zinc-900 font-mono mt-2">
                    VOUCHER #: {activeReceipt._id?.slice(-8)?.toUpperCase() || 'VCH-88219'}
                  </div>
                  <div className="text-xs text-zinc-600 font-medium">
                    Date: {activeReceipt.date ? new Date(activeReceipt.date).toLocaleDateString() : new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Student Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                <div>
                  <span className="text-zinc-500 font-bold uppercase text-[10px]">Student Name</span>
                  <div className="text-sm font-extrabold text-zinc-950">{activeReceipt.student}</div>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold uppercase text-[10px]">Admission / Reg No</span>
                  <div className="text-sm font-extrabold text-zinc-950 font-mono">{activeReceipt.admissionNo || 'ADM-2026'}</div>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold uppercase text-[10px]">Class & Section</span>
                  <div className="font-bold text-zinc-900">{activeReceipt.className}</div>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold uppercase text-[10px]">Payment Method</span>
                  <div className="font-bold text-zinc-900">{activeReceipt.paymentMethod || 'Cash'}</div>
                </div>
              </div>

              {/* Ledger Table */}
              <table className="w-full text-xs border border-zinc-200">
                <thead className="bg-zinc-100 text-zinc-800 font-bold border-b border-zinc-200 uppercase">
                  <tr>
                    <th className="p-2.5 text-left">Description / Particulars</th>
                    <th className="p-2.5 text-right">Amount ({currencySymbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium">
                  <tr>
                    <td className="p-2.5 font-bold text-zinc-900">{activeReceipt.feeType || 'Tuition Fee'}</td>
                    <td className="p-2.5 text-right font-mono">{(Number(activeReceipt.amount) || 0).toLocaleString()}</td>
                  </tr>
                  {(Number(activeReceipt.fine) > 0) && (
                    <tr>
                      <td className="p-2.5 text-rose-700">Late Payment Surcharge / Fine</td>
                      <td className="p-2.5 text-right font-mono text-rose-700">+{(Number(activeReceipt.fine)).toLocaleString()}</td>
                    </tr>
                  )}
                  {(Number(activeReceipt.waiver) > 0) && (
                    <tr>
                      <td className="p-2.5 text-emerald-700">Scholarship / Concession / Discount</td>
                      <td className="p-2.5 text-right font-mono text-emerald-700">-{(Number(activeReceipt.waiver)).toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="bg-emerald-50/70 font-extrabold border-t-2 border-zinc-300">
                    <td className="p-2.5 text-emerald-950 uppercase">Total Amount Received</td>
                    <td className="p-2.5 text-right font-mono text-emerald-950 text-sm">
                      {currencySymbol}{(Number(activeReceipt.paid) || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-zinc-50 font-bold">
                    <td className="p-2.5 text-zinc-700 uppercase">Outstanding Balance</td>
                    <td className="p-2.5 text-right font-mono text-rose-600">
                      {currencySymbol}{(Number(activeReceipt.balance) || 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Note */}
              {activeReceipt.note && (
                <div className="text-[11px] text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  <span className="font-bold">Note:</span> {activeReceipt.note}
                </div>
              )}

              {/* Signatures */}
              <div className="pt-10 flex items-center justify-between text-xs text-zinc-600 border-t border-zinc-200">
                <div className="text-center">
                  <div className="w-36 border-b border-zinc-400 mb-1" />
                  <span className="font-semibold">Depositor Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-zinc-400 mb-1" />
                  <span className="font-semibold">Authorized Cashier / Accountant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
