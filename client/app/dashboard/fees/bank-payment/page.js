'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  RotateCcw, 
  Building, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Trash2, 
  X, 
  ExternalLink,
  FileText
} from 'lucide-react';
import { sortClassesAcademic, normalizeClassName } from '@/lib/academicUtils';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';

export default function BankPaymentPage() {
  const [formData, setFormData] = useState({ dateRange: '', class: '', section: '', status: '' });
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [searchTable, setSearchTable] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Payment Form State
  const [addForm, setAddForm] = useState({
    studentName: '',
    admissionNo: '',
    className: '',
    section: '',
    amount: '',
    transactionId: '',
    bankName: 'Meezan Bank Ltd',
    date: new Date().toISOString().split('T')[0],
    note: '',
    file: '',
    status: 'Pending'
  });

  const fetchLookups = async () => {
    try {
      const [clsRes, secRes, stuRes] = await Promise.all([
        api.get('/class').catch(() => null),
        api.get('/section').catch(() => null),
        api.get('/student?limit=1000').catch(() => null)
      ]);
      if (clsRes?.success && Array.isArray(clsRes.data)) setClasses(clsRes.data);
      if (secRes?.success && Array.isArray(secRes.data)) setSections(secRes.data);
      if (stuRes?.success && Array.isArray(stuRes.data)) setStudents(stuRes.data);
    } catch (_) {}
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (formData.class) params.class = formData.class;
      if (formData.section) params.section = formData.section;
      if (formData.status) params.status = formData.status;

      const res = await api.get('/bank-payment', { params });
      if (res?.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
      }
    } catch (e) {
      console.error('Error fetching bank payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookups();
    handleSearch();
  }, []);

  const handleReset = () => {
    setFormData({ dateRange: '', class: '', section: '', status: '' });
  };

  // Student selection in Add Payment form
  const handleStudentSelect = (val) => {
    const stuName = val?.target ? val.target.value : val;
    const found = students.find(s => 
      `${s.firstName || ''} ${s.lastName || ''}`.trim() === stuName || 
      s.admissionNo === stuName
    );
    if (found) {
      setAddForm(prev => ({
        ...prev,
        studentName: `${found.firstName || ''} ${found.lastName || ''}`.trim(),
        admissionNo: found.admissionNo || '',
        className: found.className || '',
        section: found.section || 'A'
      }));
    } else {
      setAddForm(prev => ({ ...prev, studentName: stuName }));
    }
  };

  // Submit new bank payment
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!addForm.studentName || !addForm.amount) {
      return alert('Student name and payment amount are required');
    }
    try {
      setActionLoading(true);
      const res = await api.post('/bank-payment', {
        ...addForm,
        amount: Number(addForm.amount)
      });
      if (res?.success) {
        setIsAddOpen(false);
        setAddForm({
          studentName: '',
          admissionNo: '',
          className: '',
          section: '',
          amount: '',
          transactionId: '',
          bankName: 'Meezan Bank Ltd',
          date: new Date().toISOString().split('T')[0],
          note: '',
          file: '',
          status: 'Pending'
        });
        handleSearch();
      }
    } catch (err) {
      alert(err.message || 'Failed to save bank payment');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Status (Approve or Reject)
  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/bank-payment/${id}`, { status: newStatus });
      if (res?.success) {
        // If approved, update invoice record if student exists
        if (newStatus === 'Approved' && selectedPayment) {
          const adm = selectedPayment.admissionNo;
          if (adm) {
            // Find invoice and record payment
            const invList = await api.get('/fees-invoice', { params: { search: adm } }).catch(() => null);
            if (invList?.success && Array.isArray(invList.data) && invList.data.length > 0) {
              const inv = invList.data[0];
              const newPaid = (Number(inv.paid) || 0) + (Number(selectedPayment.amount) || 0);
              const newBal = Math.max(0, (Number(inv.amount) || 0) - newPaid);
              await api.put(`/fees-invoice/${inv._id}`, {
                paid: newPaid,
                balance: newBal,
                status: newBal <= 0 ? 'Paid' : 'Partial'
              }).catch(() => {});
            }
          }
        }

        setIsViewOpen(false);
        setSelectedPayment(null);
        handleSearch();
      }
    } catch (err) {
      alert(err.message || 'Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bank payment record?')) return;
    try {
      const res = await api.delete(`/bank-payment/${id}`);
      if (res?.success) {
        if (isViewOpen) setIsViewOpen(false);
        handleSearch();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  // Derived sections based on selected class
  const availableSections = useMemo(() => {
    if (formData.class) {
      const selectedClassObj = classes.find(c => 
        c.name === formData.class || 
        normalizeClassName(c.name) === normalizeClassName(formData.class)
      );
      if (selectedClassObj?.sections && Array.isArray(selectedClassObj.sections) && selectedClassObj.sections.length > 0) {
        return [
          { value: '', label: 'All Sections' },
          ...selectedClassObj.sections.map(s => {
            const raw = typeof s === 'string' ? s : (s.name || '');
            const clean = raw.replace(/^section\s+/i, '');
            return { value: raw, label: `Section ${clean}` };
          })
        ];
      }
    }

    const allSecSet = new Set();
    (sections || []).forEach(s => {
      const name = typeof s === 'string' ? s : (s.name || '');
      if (name) allSecSet.add(name);
    });
    (classes || []).forEach(c => {
      (c.sections || []).forEach(s => {
        if (s) allSecSet.add(s);
      });
    });
    if (allSecSet.size === 0) ['A', 'B', 'C', 'D'].forEach(s => allSecSet.add(s));

    return [
      { value: '', label: 'All Sections' },
      ...Array.from(allSecSet).sort().map(s => {
        const clean = String(s).replace(/^section\s+/i, '');
        return { value: s, label: `Section ${clean}` };
      })
    ];
  }, [formData.class, classes, sections]);

  const classOptions = useMemo(() => {
    return [
      { value: '', label: 'All Classes' },
      ...sortClassesAcademic(classes.map(c => ({ value: c.name, label: c.name })))
    ];
  }, [classes]);

  const filteredRecords = useMemo(() => {
    if (!searchTable.trim()) return records;
    const q = searchTable.toLowerCase().trim();
    return records.filter(r => 
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.admissionNo || '').toLowerCase().includes(q) ||
      (r.transactionId || '').toLowerCase().includes(q) ||
      (r.bankName || '').toLowerCase().includes(q) ||
      (r.note || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q)
    );
  }, [records, searchTable]);

  // Summary counts
  const stats = useMemo(() => {
    const total = records.length;
    const pending = records.filter(r => r.status === 'Pending').length;
    const approved = records.filter(r => r.status === 'Approved').length;
    const approvedAmount = records
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    return { total, pending, approved, approvedAmount };
  }, [records]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Bank Payment Verification</h1>
          <p className="text-xs text-zinc-500 mt-1">Review, approve, and verify student bank deposits & digital payments.</p>
        </div>
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/fees" className="hover:text-zinc-900 transition-colors">Fees</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Bank Payment</span>
        </div>
      </div>

      {/* 3 Quick KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pending Approvals</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</div>
            <div className="text-[11px] text-zinc-400">Needs staff confirmation</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Approved Payments</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.approved}</div>
            <div className="text-[11px] text-zinc-400">Successfully verified</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Verified</span>
            <div className="text-2xl font-black text-[#084A86] mt-1">
              PKR {stats.approvedAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-zinc-400">Deposited into school account</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#084A86] flex items-center justify-center">
            <Building className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Criteria Filter Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-visible">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Select Criteria</h2>
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="bg-[#084A86] hover:bg-[#063968] text-white text-xs font-bold h-8 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> ADD PAYMENT SLIP
          </Button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Class</Label>
            <SearchableSelect
              options={classOptions}
              value={formData.class}
              onChange={e => {
                const newClass = e?.target ? e.target.value : e;
                setFormData(prev => ({ ...prev, class: newClass, section: '' }));
              }}
              placeholder="All Classes"
              name="class"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Section</Label>
            <SearchableSelect
              options={availableSections}
              value={formData.section}
              onChange={e => {
                const newSec = e?.target ? e.target.value : e;
                setFormData(prev => ({ ...prev, section: newSec }));
              }}
              placeholder="All Sections"
              name="section"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Status</Label>
            <SearchableSelect
              options={[
                { value: '', label: 'All Status' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Rejected', label: 'Rejected' }
              ]}
              value={formData.status}
              onChange={e => {
                const newSt = e?.target ? e.target.value : e;
                setFormData(prev => ({ ...prev, status: newSt }));
              }}
              placeholder="All Status"
              name="status"
            />
          </div>

          <div className="md:col-span-3 flex items-center justify-end gap-2.5 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset} 
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-bold h-9 px-4"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> RESET
            </Button>
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-[#084A86] hover:bg-[#063968] text-white text-xs font-bold flex items-center gap-1.5 h-9 px-5 rounded-xl shadow-xs"
            >
              <Search className="h-3.5 w-3.5" /> {loading ? 'SEARCHING...' : 'SEARCH'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table: Bank Payment List */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Bank Payment List</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#084A86] border border-blue-200">
              {filteredRecords.length} Records
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                placeholder="Search txn, student..." 
                value={searchTable}
                onChange={e => setSearchTable(e.target.value)}
                className="pl-8 h-8 bg-white border-zinc-300 text-zinc-950 text-xs rounded-xl focus-visible:ring-[#084A86]" 
              />
            </div>
            <TableExportToolbar />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Transaction #</th>
                <th className="px-4 py-3">Bank Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Slip Proof</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-zinc-500 font-medium">
                    No Bank Payment Records Found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-950 text-sm">{item.studentName || '—'}</div>
                      <div className="text-[11px] text-zinc-500">
                        {item.className ? `${item.className} (${item.section || 'A'})` : ''} &bull; Adm: {item.admissionNo || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] font-semibold text-zinc-800">
                      {item.transactionId || 'TXN-' + Math.floor(100000 + Math.random() * 900000)}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700 font-medium">
                      {item.bankName || 'Meezan Bank Ltd'}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {item.date ? new Date(item.date).toLocaleDateString() : new Date().toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-zinc-950 text-sm">
                      PKR {Number(item.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.file ? (
                        <a 
                          href={item.file} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#084A86] hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" /> View Slip
                        </a>
                      ) : (
                        <span className="text-zinc-400">Bank Slip</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <Button 
                        onClick={() => { setSelectedPayment(item); setIsViewOpen(true); }}
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-[11px] px-2.5 rounded-lg border-zinc-200 text-zinc-800 font-semibold"
                      >
                        <Eye className="h-3 w-3 mr-1" /> View & Verify
                      </Button>
                      <Button 
                        onClick={() => handleDelete(item._id)}
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-[11px] px-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View & Verify Modal */}
      {isViewOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <Building className="h-4 w-4 text-[#084A86]" /> Bank Payment Verification
              </h3>
              <button onClick={() => setIsViewOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Student Name:</span>
                  <span className="font-bold text-zinc-950">{selectedPayment.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Admission No:</span>
                  <span className="font-mono font-bold text-zinc-900">{selectedPayment.admissionNo || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Class / Section:</span>
                  <span className="font-medium text-zinc-900">{selectedPayment.className} ({selectedPayment.section || 'A'})</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-2">
                  <span className="text-zinc-500 font-medium">Paid Amount:</span>
                  <span className="text-base font-black text-emerald-600">PKR {Number(selectedPayment.amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Transaction #:</span>
                  <span className="font-mono font-semibold text-zinc-800">{selectedPayment.transactionId || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Bank Name:</span>
                  <span className="font-semibold text-zinc-800">{selectedPayment.bankName || 'Meezan Bank Ltd'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Current Status:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedPayment.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    selectedPayment.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedPayment.status || 'Pending'}
                  </span>
                </div>
              </div>

              {selectedPayment.note && (
                <div className="text-zinc-600 italic">
                  Note: &quot;{selectedPayment.note}&quot;
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsViewOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Close
                </Button>
                {selectedPayment.status !== 'Rejected' && (
                  <Button 
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedPayment._id, 'Rejected')}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-9 px-4"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject Payment
                  </Button>
                )}
                {selectedPayment.status !== 'Approved' && (
                  <Button 
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedPayment._id, 'Approved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-9 px-5 shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve & Credit Fee
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Slip Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Record Bank Payment Slip</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSavePayment} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Select Student <span className="text-rose-500">*</span>
                </Label>
                <SearchableSelect 
                  name="student"
                  value={addForm.studentName}
                  onChange={handleStudentSelect}
                  placeholder="Choose student..."
                  options={students.map(s => ({
                    label: `${s.firstName || ''} ${s.lastName || ''} (${s.className || ''} - ${s.admissionNo || ''})`.trim(),
                    value: `${s.firstName || ''} ${s.lastName || ''}`.trim()
                  }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Amount (PKR) <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    type="number"
                    value={addForm.amount}
                    onChange={e => setAddForm({ ...addForm, amount: e.target.value })}
                    placeholder="e.g. 15000"
                    className="bg-white border-zinc-300 text-zinc-950 rounded-xl text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Bank Name
                  </Label>
                  <Input 
                    value={addForm.bankName}
                    onChange={e => setAddForm({ ...addForm, bankName: e.target.value })}
                    placeholder="Meezan Bank Ltd"
                    className="bg-white border-zinc-300 text-zinc-950 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Transaction ID / Ref #
                  </Label>
                  <Input 
                    value={addForm.transactionId}
                    onChange={e => setAddForm({ ...addForm, transactionId: e.target.value })}
                    placeholder="e.g. TXN-948123"
                    className="bg-white border-zinc-300 text-zinc-950 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    Deposit Date
                  </Label>
                  <Input 
                    type="date"
                    value={addForm.date}
                    onChange={e => setAddForm({ ...addForm, date: e.target.value })}
                    className="bg-white border-zinc-300 text-zinc-950 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Note / Comments
                </Label>
                <Input 
                  value={addForm.note}
                  onChange={e => setAddForm({ ...addForm, note: e.target.value })}
                  placeholder="Deposited via bank branch / mobile app"
                  className="bg-white border-zinc-300 text-zinc-950 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={actionLoading}
                  className="bg-[#084A86] hover:bg-[#063968] text-white text-xs font-bold h-9 rounded-xl px-5"
                >
                  {actionLoading ? 'Saving...' : 'Save Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
