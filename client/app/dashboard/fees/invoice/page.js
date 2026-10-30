'use client';

import { formatDateDMY } from '@/lib/utils';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  Eye,
  DollarSign
} from 'lucide-react';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThreeCopyFeeSlipModal from '@/components/fees/ThreeCopyFeeSlipModal';
import StudentAvatar from '@/components/student/StudentAvatar';

const DEFAULT_FEE_TYPES = [
  'Monthly Tuition Fee',
  'Semester Tuition Fee',
  'Annual Tuition Fee',
  'Transport Fee',
  'Admission & Registration Fee',
  'Tuition Fee 2026',
  'Annual Charges',
  'Mid-Term Exam Fee',
  'Final Exam Fee',
  'Laboratory & Computer Fee',
  'Sports & Activity Fund',
  'Diploma / Certificate Course Fee'
];

export default function FeesInvoicePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dynamic students and fee types
  const [studentsList, setStudentsList] = useState([]);
  const [availableFeeTypes, setAvailableFeeTypes] = useState(DEFAULT_FEE_TYPES);

  // Modal states
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    student: '',
    admissionNo: '',
    className: '',
    feeType: 'Tuition Fee 2026',
    amount: 15000,
    waiver: 0,
    fine: 0,
    paid: 15000,
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, stuRes, typesRes] = await Promise.all([
        api.get('/fees-invoice', { params: { page, limit: 10, search, status: statusFilter } }),
        api.get('/student?limit=1000').catch(() => null),
        api.get('/fees/type').catch(() => null)
      ]);
      
      if (stuRes?.success && Array.isArray(stuRes.data)) {
        setStudentsList(stuRes.data);
      }

      if (typesRes?.success && Array.isArray(typesRes.data) && typesRes.data.length > 0) {
        const customTypes = typesRes.data.map(t => t.name).filter(Boolean);
        const combined = Array.from(new Set([...customTypes, ...DEFAULT_FEE_TYPES]));
        setAvailableFeeTypes(combined);
      }

      if (invRes?.success) {
        setRecords(invRes.data || []);
        if (invRes.pagination) {
          setTotalPages(invRes.pagination.totalPages || 1);
          setTotalRecords(invRes.pagination.total || 0);
        }
      }
    } catch (e) {
      console.error('Invoice fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  // Search Submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchData();
  };

  // Open Builder for creating a new invoice
  const handleOpenCreate = () => {
    setEditingInvoice(null);
    const firstStudent = studentsList[0];
    setFormData({
      student: firstStudent ? `${firstStudent.firstName} ${firstStudent.lastName}` : '',
      admissionNo: firstStudent?.admissionNo || 'ADM-2026-001',
      className: firstStudent ? `${firstStudent.className} (${firstStudent.section || 'A'})` : 'Class 10 (A)',
      feeType: availableFeeTypes[0] || 'Tuition Fee 2026',
      amount: 15000,
      waiver: 0,
      fine: 0,
      paid: 15000,
      paymentMethod: 'Cash',
      date: new Date().toISOString().split('T')[0],
      note: 'Regular semester academic fee'
    });
    setIsBuilderOpen(true);
  };

  // Open Builder for editing an invoice
  const handleOpenEdit = (inv) => {
    setEditingInvoice(inv);
    setFormData({
      student: inv.student || '',
      admissionNo: inv.admissionNo || '',
      className: inv.className || '',
      feeType: inv.feeType || 'Tuition Fee 2026',
      amount: Number(inv.amount) || 0,
      waiver: Number(inv.waiver) || 0,
      fine: Number(inv.fine) || 0,
      paid: Number(inv.paid) || 0,
      paymentMethod: inv.paymentMethod || 'Cash',
      date: inv.date || new Date().toISOString().split('T')[0],
      note: inv.note || ''
    });
    setIsBuilderOpen(true);
  };

  // When a student is chosen from dropdown, auto-fill class & admission no and fee
  const handleStudentSelect = (e) => {
    const stuName = e.target.value;
    const found = studentsList.find(s => `${s.firstName} ${s.lastName}` === stuName || s.student === stuName);
    if (found) {
      const studentFee = Number(found.feeNetPayable) || 
        ((Number(found.feeTuition) || (found.feeCriteria === 'Semester' ? 75000 : (found.feeCriteria === 'Annual' ? 120000 : 8000))) + (Number(found.feeTransport) || 0));
      setFormData(prev => ({
        ...prev,
        student: stuName,
        admissionNo: found.admissionNo || prev.admissionNo,
        className: `${found.className || ''} (${found.section || ''})`,
        amount: studentFee,
        paid: studentFee
      }));
    } else {
      setFormData(prev => ({ ...prev, student: stuName }));
    }
  };

  // Calculate Balance & Status dynamically
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

  // Save / Update Invoice
  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!formData.student.trim()) {
      alert('Please select or enter student name.');
      return;
    }
    if (Number(formData.amount) <= 0) {
      alert('Amount must be greater than 0.');
      return;
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      waiver: Number(formData.waiver),
      fine: Number(formData.fine),
      paid: Number(formData.paid),
      balance: computedBalance,
      status: computedStatus,
      invoiceNo: editingInvoice?.invoiceNo || ('INV-2026-' + String(totalRecords + 1).padStart(3, '0')),
    };

    setIsBuilderOpen(false);

    try {
      if (editingInvoice) {
        await api.put(`/fees-invoice/${editingInvoice._id}`, payload);
        alert('Invoice updated successfully!');
      } else {
        await api.post('/fees-invoice', payload);
        alert('Invoice created successfully!');
      }
      fetchData();
    } catch (err) {
      console.error('API save failed:', err.message);
      alert('Failed to save invoice.');
    }
  };

  // Delete Invoice
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/fees-invoice/${id}`);
        fetchData();
      } catch (err) {
        console.error('API delete failed:', err.message);
        alert('Failed to delete invoice.');
      }
    }
  };

  // View / Print Receipt
  const handleOpenReceipt = (inv) => {
    setSelectedReceipt(inv);
    setIsReceiptOpen(true);
  };

  // Overall Financial Stats
  const stats = useMemo(() => {
    const totalInvoices = totalRecords || records.length;
    const totalAmount = records.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const totalPaid = records.reduce((acc, r) => acc + (Number(r.paid) || 0), 0);
    const totalBalance = records.reduce((acc, r) => acc + (Number(r.balance) || 0), 0);
    return { totalInvoices, totalAmount, totalPaid, totalBalance };
  }, [records, totalRecords]);

  // Export formatting
  const exportColumns = [
    { key: 'invoiceNo', label: 'Invoice No' },
    { key: 'student', label: 'Student Name' },
    { key: 'admissionNo', label: 'Admission No' },
    { key: 'className', label: 'Class & Section' },
    { key: 'feeType', label: 'Fee Type' },
    { key: 'amount', label: 'Amount (Rs.)' },
    { key: 'waiver', label: 'Waiver (Rs.)' },
    { key: 'fine', label: 'Fine (Rs.)' },
    { key: 'paid', label: 'Paid (Rs.)' },
    { key: 'balance', label: 'Balance (Rs.)' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date' }
  ];

  const exportData = records.map(r => ({
    invoiceNo: r.invoiceNo || '—',
    student: r.student || '—',
    admissionNo: r.admissionNo || '—',
    className: r.className || '—',
    feeType: r.feeType || '—',
    amount: r.amount || 0,
    waiver: r.waiver || 0,
    fine: r.fine || 0,
    paid: r.paid || 0,
    balance: r.balance || 0,
    status: r.status || 'Unpaid',
    date: r.date || '—'
  }));

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#084A86]" />
            Fees Invoice Manager
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Generate, track, edit, and print official student fee vouchers</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/fees" className="hover:text-zinc-600 transition-colors">Fees</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Fees Invoice</span>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Invoices</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.totalInvoices}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Invoiced</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">Rs. {stats.totalAmount.toLocaleString()}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Collected Fees</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">Rs. {stats.totalPaid.toLocaleString()}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Download className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Pending Balance</div>
            <div className="text-2xl font-black text-rose-600 mt-1">Rs. {stats.totalBalance.toLocaleString()}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        {/* Actions Bar */}
        <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/50">
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={handleOpenCreate} 
              style={{ backgroundColor: '#084A86' }}
              className="hover:opacity-95 text-white font-bold flex items-center gap-2 shadow-xs text-xs px-4 h-9 rounded-xl cursor-pointer"
            >
              <Plus className="h-4 w-4" /> CREATE INVOICE
            </Button>

            {/* Status Filter Tabs */}
            <div className="flex items-center bg-white border border-zinc-200 shadow-xs rounded-xl p-1 text-xs font-semibold">
              {['ALL', 'PAID', 'PARTIAL', 'UNPAID'].map(st => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setPage(1); }}
                  style={statusFilter === st ? { backgroundColor: '#084A86', color: '#ffffff' } : {}}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === st 
                      ? 'shadow-xs font-bold' 
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-60 flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                placeholder="Search student or invoice..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-9 h-9 bg-white border-zinc-200 text-zinc-950 text-xs rounded-xl focus-visible:ring-[#084A86]" 
              />
            </form>

            {/* Export Toolbar */}
            <TableExportToolbar
              data={exportData}
              columns={exportColumns}
              filename="Fees_Invoices_Report"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3.5 font-bold">SL</th>
                <th className="px-4 py-3.5 font-bold">Invoice No</th>
                <th className="px-4 py-3.5 font-bold">Student & Class</th>
                <th className="px-4 py-3.5 font-bold">Fee Type</th>
                <th className="px-4 py-3.5 font-bold">Amount (Rs.)</th>
                <th className="px-4 py-3.5 font-bold">Waiver</th>
                <th className="px-4 py-3.5 font-bold">Fine</th>
                <th className="px-4 py-3.5 font-bold">Paid</th>
                <th className="px-4 py-3.5 font-bold">Balance</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 font-bold">Date</th>
                <th className="px-4 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                      Loading fee invoices...
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-12 text-center text-zinc-500">
                    No Invoices Available. Click &quot;Create Invoice&quot; to issue a new voucher.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={r._id || i} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3.5 text-zinc-500 font-medium text-xs">#{(page - 1) * 10 + i + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-zinc-900 font-mono text-xs tracking-wider">
                      {r.invoiceNo || `INV-${100 + i}`}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {(() => {
                          const matched = studentsList.find(
                            st =>
                              (r.studentId && String(st._id) === String(r.studentId)) ||
                              (r.admissionNo && String(st.admissionNo).trim().toLowerCase() === String(r.admissionNo).trim().toLowerCase())
                          );
                          return (
                            <StudentAvatar
                              photo={matched?.studentPhoto || matched?.photo || r.photo}
                              firstName={r.student}
                              size="sm"
                            />
                          );
                        })()}
                        <div>
                          <div className="font-bold text-zinc-950">{r.student}</div>
                          <div className="text-[11px] text-zinc-500">{r.className || '-'} &bull; {r.admissionNo || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md text-[11px] font-semibold text-zinc-800">
                        {r.feeType || 'Tuition Fee'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-zinc-950">Rs. {Number(r.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-zinc-600 text-xs">Rs. {Number(r.waiver || 0).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-zinc-600 text-xs">Rs. {Number(r.fine || 0).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-emerald-700 font-bold">Rs. {Number(r.paid || 0).toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <span className={`font-bold ${Number(r.balance || 0) > 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                        Rs. {Number(r.balance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full tracking-wider border ${
                        (r.status || '').toUpperCase() === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : (r.status || '').toUpperCase() === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800 border-amber-200' 
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {r.status || 'UNPAID'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 text-xs font-medium">{formatDateDMY(r.date)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          onClick={() => handleOpenReceipt(r)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#084A86] hover:bg-blue-50 rounded-lg cursor-pointer" 
                          title="View / Print Receipt Voucher"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleOpenEdit(r)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg cursor-pointer" 
                          title="Edit Invoice"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(r._id)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer" 
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-zinc-200 flex flex-wrap items-center justify-between text-xs text-zinc-500 bg-zinc-50/30">
          <div>Showing {totalRecords === 0 ? 0 : (page - 1) * 10 + 1} to {Math.min(page * 10, totalRecords)} of {totalRecords} invoices</div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 transition-colors cursor-pointer font-medium"
            >
              Previous
            </button>
            <div className="text-zinc-800 font-bold px-2">Page {page} of {totalPages}</div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 transition-colors cursor-pointer font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: INVOICE BUILDER (CREATE / EDIT)                 */}
      {/* ========================================================= */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full p-6 text-zinc-950 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#084A86]" />
                  {editingInvoice ? 'Edit Fees Invoice' : 'Fees Invoice Builder'}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Fill details below to generate an official fee voucher</p>
              </div>
              <button 
                onClick={() => setIsBuilderOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              {/* Student & Class Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5 uppercase">Select Student *</label>
                  <select
                    value={formData.student}
                    onChange={handleStudentSelect}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-950 focus:border-[#084A86] focus:outline-none font-medium"
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {studentsList.map((s, idx) => (
                      <option key={s._id || idx} value={`${s.firstName} ${s.lastName}`}>
                        {s.firstName} {s.lastName} ({s.className || 'Class'} - {s.admissionNo || 'ID'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5 uppercase">Class & Section</label>
                  <Input 
                    value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                    placeholder="e.g. Class 10 (A)"
                    className="bg-white border-zinc-200 text-zinc-950 text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Admission No & Fee Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5 uppercase">Admission / Roll No</label>
                  <Input 
                    value={formData.admissionNo}
                    onChange={e => setFormData({ ...formData, admissionNo: e.target.value })}
                    placeholder="e.g. ADM-2026-001"
                    className="bg-white border-zinc-200 text-zinc-950 text-xs h-10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5 uppercase">Fee Category / Group *</label>
                  <select
                    value={formData.feeType}
                    onChange={e => setFormData({ ...formData, feeType: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-950 focus:border-[#084A86] focus:outline-none font-medium"
                  >
                    {availableFeeTypes.map(ft => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Financial Breakdown (Rs.)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Total Fee (Rs.)</label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-white border-zinc-200 text-xs h-9 text-zinc-950 rounded-lg font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Waiver / Disc (Rs.)</label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.waiver}
                      onChange={e => setFormData({ ...formData, waiver: e.target.value })}
                      className="bg-white border-zinc-200 text-xs h-9 text-zinc-950 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Late Fine (Rs.)</label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.fine}
                      onChange={e => setFormData({ ...formData, fine: e.target.value })}
                      className="bg-white border-zinc-200 text-xs h-9 text-zinc-950 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Amount Paid (Rs.)</label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.paid}
                      onChange={e => setFormData({ ...formData, paid: e.target.value })}
                      className="bg-white border-zinc-200 text-xs h-9 text-emerald-700 rounded-lg font-bold"
                    />
                  </div>
                </div>

                {/* Auto Calculated Summary Banner */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-semibold">Status:</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      computedStatus.toUpperCase() === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      computedStatus.toUpperCase() === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {computedStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-semibold">Remaining Balance:</span>
                    <span className="font-black text-rose-600 text-sm">Rs. {computedBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method, Date, Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5 uppercase">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-950 focus:border-[#084A86] focus:outline-none font-medium"
                  >
                    <option value="Cash">Cash Counter</option>
                    <option value="Online Bank Transfer">Online Bank Transfer</option>
                    <option value="Cheque / Pay Order">Cheque / Pay Order</option>
                    <option value="Debit / Credit Card">Debit / Credit Card</option>
                    <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5 uppercase">Issue / Due Date</label>
                  <Input 
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="bg-white border-zinc-200 text-zinc-950 text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5 uppercase">Notes / Description (Optional)</label>
                <Input 
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="e.g. Paid in cash at accounts counter"
                  className="bg-white border-zinc-200 text-zinc-950 text-xs h-10 rounded-xl"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsBuilderOpen(false)}
                  className="text-zinc-600 hover:text-zinc-950"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  style={{ backgroundColor: '#084A86' }}
                  className="hover:opacity-95 text-white font-bold px-5 h-10 rounded-xl cursor-pointer"
                >
                  {editingInvoice ? 'Update Invoice' : 'Save & Issue Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PRINTABLE 3-COPY OFFICIAL FEE CHALLAN SLIP       */}
      {/* ========================================================= */}
      <ThreeCopyFeeSlipModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        slipData={selectedReceipt}
      />
    </div>
  );
}
