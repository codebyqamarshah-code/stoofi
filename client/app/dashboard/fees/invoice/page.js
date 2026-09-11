'use client';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, Plus, Edit, Trash2, Printer, Download, FileText, CheckCircle2, AlertCircle, Clock, X, Eye } from 'lucide-react';
import api from '@/services/api';
import { mockFeesInvoices, mockStudents } from '@/services/mockData';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FEE_TYPES = [
  'Tuition Fee 2026',
  'Admission & Registration Fee',
  'Mid-Term Exam Fee',
  'Final Exam Fee',
  'School Bus Transport',
  'Hostel Accommodation',
  'Laboratory & Computer Fee',
  'Sports & Activity Fund'
];

export default function FeesInvoicePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Students list for auto-fill in Invoice Builder
  const [studentsList, setStudentsList] = useState([]);

  // Modal states
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    student: '',
    admissionNo: '',
    className: 'Class 10 (A)',
    feeType: 'Tuition Fee 2026',
    amount: 15000,
    waiver: 0,
    fine: 0,
    paid: 15000,
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Students
      let localStudents = [];
      try {
        const raw = localStorage.getItem('mockDB_student');
        if (raw) localStudents = JSON.parse(raw);
      } catch (_) {}
      const allStudents = localStudents.length > 0 ? localStudents : mockStudents;
      setStudentsList(allStudents);

      // 2. Fetch Invoices
      const res = await api.get('/fees-invoice').catch(() => null);
      let list = [];
      if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res)) list = res;

      let localInvoices = [];
      try {
        const raw = localStorage.getItem('mockDB_fees-invoice');
        if (raw) localInvoices = JSON.parse(raw);
      } catch (_) {}

      let finalList = [];
      if (list.length > 0) {
        finalList = list;
      } else if (localInvoices.length > 0) {
        finalList = localInvoices;
      } else {
        finalList = mockFeesInvoices;
        try {
          localStorage.setItem('mockDB_fees-invoice', JSON.stringify(mockFeesInvoices));
        } catch (_) {}
      }

      setRecords(finalList);
    } catch (e) {
      console.error('Invoice fetch error:', e);
      setRecords(mockFeesInvoices);
    } finally {
      setLoading(false);
    }
  };

  // Open Builder for creating a new invoice
  const handleOpenCreate = () => {
    setEditingInvoice(null);
    const firstStudent = studentsList[0];
    setFormData({
      student: firstStudent ? `${firstStudent.firstName} ${firstStudent.lastName}` : 'Muhammad Ali',
      admissionNo: firstStudent?.admissionNo || 'ADM-2026-001',
      className: firstStudent ? `${firstStudent.className} (${firstStudent.section})` : 'Class 10 (A)',
      feeType: 'Tuition Fee 2026',
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

  // When a student is chosen from dropdown, auto-fill class & admission no
  const handleStudentSelect = (e) => {
    const stuName = e.target.value;
    const found = studentsList.find(s => `${s.firstName} ${s.lastName}` === stuName || s.student === stuName);
    if (found) {
      setFormData(prev => ({
        ...prev,
        student: stuName,
        admissionNo: found.admissionNo || prev.admissionNo,
        className: `${found.className || ''} (${found.section || ''})`
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
    if (computedBalance <= 0) return 'PAID';
    if (Number(formData.paid) > 0) return 'PARTIAL';
    return 'UNPAID';
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
      invoiceNo: editingInvoice?.invoiceNo || ('INV-2026-' + String(records.length + 1).padStart(3, '0')),
      _id: editingInvoice?._id || ('inv_' + Date.now())
    };

    let updatedList = [];
    if (editingInvoice) {
      updatedList = records.map(r => r._id === editingInvoice._id ? payload : r);
    } else {
      updatedList = [payload, ...records];
    }

    // 1. Instant Live State Update
    setRecords(updatedList);

    // 2. Local Storage Persistence
    try {
      localStorage.setItem('mockDB_fees-invoice', JSON.stringify(updatedList));
    } catch (_) {}

    setIsBuilderOpen(false);

    // 3. API Call
    try {
      if (editingInvoice) {
        await api.put(`/fees-invoice/${editingInvoice._id}`, payload);
      } else {
        await api.post('/fees-invoice', payload);
      }
    } catch (err) {
      console.warn('API save note:', err.message);
    }

    alert(editingInvoice ? 'Invoice updated successfully!' : 'Invoice created successfully!');
  };

  // Delete Invoice
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      const filtered = records.filter(r => r._id !== id);
      setRecords(filtered);
      try {
        localStorage.setItem('mockDB_fees-invoice', JSON.stringify(filtered));
      } catch (_) {}
      try {
        await api.delete(`/fees-invoice/${id}`);
      } catch (err) {
        console.warn('API delete note:', err.message);
      }
    }
  };

  // View / Print Receipt
  const handleOpenReceipt = (inv) => {
    setSelectedReceipt(inv);
    setIsReceiptOpen(true);
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = search === '' ||
        r.student?.toLowerCase().includes(search.toLowerCase()) ||
        r.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
        r.admissionNo?.toLowerCase().includes(search.toLowerCase()) ||
        r.className?.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  // Overall Financial Stats
  const stats = useMemo(() => {
    const totalInvoices = records.length;
    const totalAmount = records.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const totalPaid = records.reduce((acc, r) => acc + (Number(r.paid) || 0), 0);
    const totalBalance = records.reduce((acc, r) => acc + (Number(r.balance) || 0), 0);
    return { totalInvoices, totalAmount, totalPaid, totalBalance };
  }, [records]);

  // Export dataset
  const exportData = filteredRecords.map(r => ({
    'Invoice No': r.invoiceNo || '-',
    'Student Name': r.student,
    'Admission No': r.admissionNo || '-',
    'Class': r.className || '-',
    'Fee Type': r.feeType || '-',
    'Amount': r.amount,
    'Waiver': r.waiver,
    'Fine': r.fine,
    'Paid': r.paid,
    'Balance': r.balance,
    'Status': r.status,
    'Date': r.date
  }));

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Fees Invoice Manager</h1>
          <p className="text-xs text-zinc-400 mt-1">Generate, track, edit, and print official student fee vouchers</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Fees</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-600 font-semibold">Fees Invoice</span>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Invoices</div>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.totalInvoices}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Amount</div>
            <div className="text-2xl font-extrabold text-white mt-1">${stats.totalAmount.toLocaleString()}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-zinc-600/10 border border-zinc-600/20 flex items-center justify-center text-zinc-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Collected Fees</div>
            <div className="text-2xl font-extrabold text-zinc-500 mt-1">${stats.totalPaid.toLocaleString()}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-zinc-600/10 border border-zinc-600/20 flex items-center justify-center text-zinc-500">
            <Download className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Pending Balance</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">${stats.totalBalance.toLocaleString()}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-xs">
        {/* Actions Bar */}
        <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={handleOpenCreate} 
              className="bg-zinc-800 hover:bg-zinc-800 text-white font-bold flex items-center gap-2 shadow-xs text-xs px-4 h-9"
            >
              <Plus className="h-4 w-4" /> CREATE INVOICE
            </Button>

            {/* Status Filter Tabs */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-semibold">
              {['ALL', 'PAID', 'PARTIAL', 'UNPAID'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === st 
                      ? 'bg-zinc-800 text-white shadow-xs' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60 flex items-center">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search student or invoice..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-zinc-600 text-white rounded-lg" 
              />
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button onClick={() => exportToCSV(exportData, 'Fees_Invoices')} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300" title="Export CSV">
                <Download className="h-4 w-4" />
              </Button>
              <Button onClick={() => exportToExcel(exportData, 'Fees_Invoices')} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-500" title="Export Excel">
                <FileText className="h-4 w-4" />
              </Button>
              <Button onClick={() => printData('Fees Invoices Report', exportData)} variant="outline" size="icon" className="h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-rose-400" title="Print List">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">SL</th>
                <th className="px-4 py-3 font-semibold">Invoice No</th>
                <th className="px-4 py-3 font-semibold">Student & Class</th>
                <th className="px-4 py-3 font-semibold">Fee Type</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Waiver</th>
                <th className="px-4 py-3 font-semibold">Fine</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center text-zinc-500">Loading invoices...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center text-zinc-500">
                    No Invoices Available. Click &quot;Create Invoice&quot; to issue a new voucher.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={r._id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 text-zinc-500 font-medium text-xs">#{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-200 text-xs tracking-wider">{r.invoiceNo || `INV-${100 + i}`}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{r.student}</div>
                      <div className="text-[11px] text-zinc-400">{r.className || '-'} &bull; {r.admissionNo || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-xs">
                      <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[11px] text-zinc-300">
                        {r.feeType || 'Tuition Fee'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">${Number(r.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">${Number(r.waiver || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">${Number(r.fine || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-500 font-bold">${Number(r.paid || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${Number(r.balance || 0) > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                        ${Number(r.balance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider border ${
                        r.status === 'PAID' 
                          ? 'bg-zinc-600/10 text-zinc-500 border-zinc-600/30' 
                          : r.status === 'PARTIAL' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {r.status || 'UNPAID'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{r.date || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          onClick={() => handleOpenReceipt(r)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10" 
                          title="View / Print Receipt Voucher"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleOpenEdit(r)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-400 hover:bg-zinc-600/10" 
                          title="Edit Invoice"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(r._id)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" 
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
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing 1 to {filteredRecords.length} of {filteredRecords.length} invoices</div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-400 font-medium">Stoofi ERP Automated Billing Engine</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: INVOICE BUILDER (CREATE / EDIT)                 */}
      {/* ========================================================= */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-zinc-600" />
                  {editingInvoice ? 'Edit Fees Invoice' : 'Fees Invoice Builder'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Fill details below to generate an official fee voucher</p>
              </div>
              <button 
                onClick={() => setIsBuilderOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              {/* Student & Class Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Select Student *</label>
                  <select
                    value={formData.student}
                    onChange={handleStudentSelect}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-zinc-600 focus:outline-none"
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
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Class & Section</label>
                  <Input 
                    value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                    placeholder="e.g. Class 10 (A)"
                    className="bg-zinc-900 border-zinc-800 text-xs h-9 text-white focus-visible:ring-zinc-600"
                  />
                </div>
              </div>

              {/* Admission No & Fee Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Admission / Roll No</label>
                  <Input 
                    value={formData.admissionNo}
                    onChange={e => setFormData({ ...formData, admissionNo: e.target.value })}
                    placeholder="e.g. ADM-2026-001"
                    className="bg-zinc-900 border-zinc-800 text-xs h-9 text-white focus-visible:ring-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Fee Category / Group *</label>
                  <select
                    value={formData.feeType}
                    onChange={e => setFormData({ ...formData, feeType: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-zinc-600 focus:outline-none"
                  >
                    {FEE_TYPES.map(ft => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Financial Breakdown ($)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Total Fee ($)</label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-xs h-8 text-white focus-visible:ring-zinc-600 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Waiver / Disc ($)</label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.waiver}
                      onChange={e => setFormData({ ...formData, waiver: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-xs h-8 text-white focus-visible:ring-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Late Fine ($)</label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.fine}
                      onChange={e => setFormData({ ...formData, fine: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-xs h-8 text-white focus-visible:ring-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">Amount Paid ($)</label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.paid}
                      onChange={e => setFormData({ ...formData, paid: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-xs h-8 text-zinc-500 focus-visible:ring-zinc-600 font-bold"
                    />
                  </div>
                </div>

                {/* Auto Calculated Summary Banner */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Status:</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      computedStatus === 'PAID' ? 'bg-zinc-600/20 text-zinc-500' :
                      computedStatus === 'PARTIAL' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {computedStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Remaining Balance:</span>
                    <span className="font-extrabold text-rose-400 text-sm">${computedBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method, Date, Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-zinc-600 focus:outline-none"
                  >
                    <option value="Cash">Cash Counter</option>
                    <option value="Online Bank Transfer">Online Bank Transfer</option>
                    <option value="Cheque / Pay Order">Cheque / Pay Order</option>
                    <option value="Debit / Credit Card">Debit / Credit Card</option>
                    <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Issue / Due Date</label>
                  <Input 
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-xs h-9 text-white focus-visible:ring-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Notes / Description (Optional)</label>
                <Input 
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="e.g. Paid in cash at accounts counter"
                  className="bg-zinc-900 border-zinc-800 text-xs h-9 text-white focus-visible:ring-zinc-600"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsBuilderOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-zinc-800 hover:bg-zinc-800 text-white font-bold px-5"
                >
                  {editingInvoice ? 'Update Invoice' : 'Save & Issue Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PRINTABLE OFFICIAL FEE RECEIPT VOUCHER          */}
      {/* ========================================================= */}
      {isReceiptOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-zinc-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header / Brand */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-3">
                <img src="/stoofi light.png" alt="Stoofi PRO" className="h-9 w-auto object-contain" />
                <div>
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight">STOOFI SCHOOL ERP</h3>
                  <p className="text-[10px] text-zinc-500">Official Student Fees Receipt Voucher</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-zinc-700">{selectedReceipt.invoiceNo || 'INV-2026-001'}</div>
                <div className="text-[11px] text-zinc-500">{selectedReceipt.date || '2026-09-07'}</div>
              </div>
            </div>

            {/* Student Meta Details */}
            <div className="grid grid-cols-2 gap-3 py-4 border-b border-zinc-200 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Student Name</span>
                <span className="font-bold text-zinc-900 text-sm">{selectedReceipt.student}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Admission / Roll No</span>
                <span className="font-semibold text-zinc-800">{selectedReceipt.admissionNo || 'ADM-2026-001'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Class / Section</span>
                <span className="font-semibold text-zinc-800">{selectedReceipt.className || 'Class 10 (A)'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Payment Status</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedReceipt.status === 'PAID' ? 'bg-zinc-200 text-zinc-900' :
                  selectedReceipt.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedReceipt.status}
                </span>
              </div>
            </div>

            {/* Fee Items Table */}
            <div className="py-4 border-b border-zinc-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 uppercase text-[10px]">
                    <th className="text-left py-1.5 font-bold">Particulars / Description</th>
                    <th className="text-right py-1.5 font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="py-2 font-medium">{selectedReceipt.feeType || 'Tuition Fee 2026'}</td>
                    <td className="py-2 text-right font-bold">${Number(selectedReceipt.amount || 0).toLocaleString()}</td>
                  </tr>
                  {Number(selectedReceipt.waiver || 0) > 0 && (
                    <tr className="text-zinc-800">
                      <td className="py-1.5">Fee Waiver / Concession</td>
                      <td className="py-1.5 text-right">-${Number(selectedReceipt.waiver).toLocaleString()}</td>
                    </tr>
                  )}
                  {Number(selectedReceipt.fine || 0) > 0 && (
                    <tr className="text-rose-700">
                      <td className="py-1.5">Late Fee Fine</td>
                      <td className="py-1.5 text-right">+${Number(selectedReceipt.fine).toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="mt-3 pt-3 border-t border-zinc-200 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Net Payable:</span>
                  <span className="font-bold text-zinc-900">${(Number(selectedReceipt.amount || 0) - Number(selectedReceipt.waiver || 0) + Number(selectedReceipt.fine || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-800 font-bold">
                  <span>Amount Paid:</span>
                  <span>${Number(selectedReceipt.paid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold pt-1 border-t border-dashed border-zinc-200">
                  <span>Remaining Balance:</span>
                  <span>${Number(selectedReceipt.balance || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer / Signatures */}
            <div className="pt-6 pb-2 grid grid-cols-2 gap-8 text-[11px] text-zinc-500">
              <div className="text-center pt-8 border-t border-zinc-300">
                Authorized Cashier / Stamp
              </div>
              <div className="text-center pt-8 border-t border-zinc-300">
                Parent / Guardian Signature
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsReceiptOpen(false)}
                className="text-xs h-9 text-zinc-700 border-zinc-300"
              >
                Close
              </Button>
              <Button 
                onClick={() => window.print()}
                className="bg-zinc-800 hover:bg-zinc-800 text-white font-bold text-xs h-9 flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

