'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  DollarSign,
  Search,
  CheckCircle2,
  Printer,
  ArrowLeft,
  Calendar,
  FileText,
  AlertCircle,
  Building,
  User,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

function CollectFeeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillAdmission = searchParams.get('admissionNo') || '';
  const prefillInvoiceId = searchParams.get('invoiceId') || '';

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    feeType: 'Tuition Fee',
    totalFee: 5000,
    previousBalance: 0,
    discount: 0,
    fine: 0,
    paidAmount: '',
    paymentMethod: 'Cash',
    paymentDate: new Date().toISOString().slice(0, 10),
    transactionRef: '',
    remarks: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch students for selector
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const res = await api.get('/student?limit=500');
        const list = res?.data || res?.students || [];
        setStudents(Array.isArray(list) ? list : []);

        // If prefilled admission number
        if (prefillAdmission && Array.isArray(list)) {
          const match = list.find(s =>
            (s.admissionNo && s.admissionNo.toLowerCase() === prefillAdmission.toLowerCase()) ||
            (s.rollNo && s.rollNo.toLowerCase() === prefillAdmission.toLowerCase())
          );
          if (match) {
            handleSelectStudent(match);
          }
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [prefillAdmission]);

  // If invoiceId passed, fetch invoice details to prefill fee
  useEffect(() => {
    if (prefillInvoiceId) {
      const fetchInvoice = async () => {
        try {
          const res = await api.get(`/fees-invoice?limit=1&search=${prefillInvoiceId}`);
          if (res?.success && res?.data?.length > 0) {
            const inv = res.data[0];
            setFormData(prev => ({
              ...prev,
              feeType: inv.feeType || 'Tuition Fee',
              totalFee: Number(inv.amount) || 5000,
              previousBalance: Number(inv.balance) || 0,
              paidAmount: Number(inv.balance) || Number(inv.amount) || ''
            }));
          }
        } catch (_) {}
      };
      fetchInvoice();
    }
  }, [prefillInvoiceId]);

  const handleSelectStudent = (st) => {
    setSelectedStudent(st);
    const stName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Student';
    const baseTuition = Number(st.monthlyFee || st.tuitionFee || st.fee) || 5000;
    
    setFormData(prev => ({
      ...prev,
      totalFee: baseTuition,
      paidAmount: baseTuition
    }));
  };

  const numTotal = Number(formData.totalFee) || 0;
  const numPrev = Number(formData.previousBalance) || 0;
  const numFine = Number(formData.fine) || 0;
  const numDisc = Number(formData.discount) || 0;
  const numPaid = Number(formData.paidAmount) || 0;

  const grossPayable = numTotal + numPrev + numFine - numDisc;
  const remainingBalance = Math.max(0, grossPayable - numPaid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedStudent) {
      setErrorMsg('Please select a student first.');
      return;
    }
    if (numPaid <= 0) {
      setErrorMsg('Please enter a valid amount paid greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      const studentName = `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim() || selectedStudent.name || 'Student';
      const admissionNo = selectedStudent.admissionNo || selectedStudent.rollNo || '';

      const payload = {
        studentId: selectedStudent._id,
        studentName,
        admissionNo,
        className: selectedStudent.class || selectedStudent.className || 'General',
        section: selectedStudent.section || 'A',
        feeType: formData.feeType,
        amount: numTotal,
        fine: numFine,
        discount: numDisc,
        paidAmount: numPaid,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        transactionRef: formData.transactionRef,
        remarks: formData.remarks,
        invoiceId: prefillInvoiceId || null
      };

      const res = await api.post('/accountant/fees/collect', payload);
      if (res?.success) {
        setReceiptData(res.receipt);
      } else {
        setErrorMsg(res?.message || 'Failed to record fee payment.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment processing failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredStudents = students.filter(s => {
    const fullName = `${s.firstName || ''} ${s.lastName || ''} ${s.name || ''}`.toLowerCase();
    const adm = (s.admissionNo || s.rollNo || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return fullName.includes(q) || adm.includes(q);
  }).slice(0, 8);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/accountant/fees')}
            className="h-10 w-10 p-0 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Collect Student Fee
            </h1>
            <p className="text-sm text-zinc-500">Record cash, bank, or online payment & generate official receipt.</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Main Collection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Selector */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-500" />
                Select Student
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {loadingStudents ? (
                <div className="py-6 text-center text-xs text-zinc-400">Loading student directory...</div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {filteredStudents.map((st) => {
                    const fullName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Student';
                    const isSelected = selectedStudent?._id === st._id;
                    return (
                      <button
                        key={st._id}
                        type="button"
                        onClick={() => handleSelectStudent(st)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                          isSelected
                            ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 font-bold'
                            : 'bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border-transparent text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="font-bold truncate">{fullName}</div>
                        <div className={`text-[11px] ${isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}`}>
                          ID: {st.admissionNo || st.rollNo || 'N/A'} • Class: {st.class || 'N/A'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedStudent && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                  <div className="font-extrabold text-emerald-800 dark:text-emerald-300">Selected Profile:</div>
                  <div className="text-zinc-700 dark:text-zinc-300">
                    <strong>{selectedStudent.name || `${selectedStudent.firstName} ${selectedStudent.lastName}`}</strong>
                  </div>
                  <div className="text-zinc-500">Class: {selectedStudent.class || 'N/A'} • Roll: {selectedStudent.rollNo || 'N/A'}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Columns: Payment Form */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Fee Breakdown & Payment Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Fee Type</label>
                    <select
                      value={formData.feeType}
                      onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    >
                      <option value="Tuition Fee">Tuition Fee</option>
                      <option value="Admission Fee">Admission Fee</option>
                      <option value="Exam Fee">Exam Fee</option>
                      <option value="Transport Fee">Transport Fee</option>
                      <option value="Laboratory Fee">Laboratory Fee</option>
                      <option value="Annual Charges">Annual Charges</option>
                      <option value="Other Fee">Other Fee</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    >
                      <option value="Cash">Cash Counter</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="Easypaisa">Easypaisa</option>
                      <option value="Online Payment">Online / Card</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 block mb-1">Standard Fee (PKR)</label>
                    <input
                      type="number"
                      value={formData.totalFee}
                      onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-500 block mb-1">Arrears / Balance</label>
                    <input
                      type="number"
                      value={formData.previousBalance}
                      onChange={(e) => setFormData({ ...formData, previousBalance: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-500 block mb-1">Late Fine (+)</label>
                    <input
                      type="number"
                      value={formData.fine}
                      onChange={(e) => setFormData({ ...formData, fine: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold text-rose-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-500 block mb-1">Discount / Waiver (-)</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold text-emerald-600"
                    />
                  </div>
                </div>

                {/* Net Calculation Bar */}
                <div className="p-4 rounded-2xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div>
                    <span className="text-xs uppercase font-extrabold opacity-70 tracking-wider">Total Gross Payable</span>
                    <div className="text-2xl font-black">Rs. {grossPayable.toLocaleString()}</div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center gap-3">
                    <div>
                      <span className="text-xs font-bold block mb-1 text-emerald-400 dark:text-emerald-700">Amount Received (PKR)*</span>
                      <input
                        type="number"
                        required
                        value={formData.paidAmount}
                        onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                        placeholder="Enter paid amount"
                        className="px-3 py-1.5 rounded-xl text-base font-black bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 border border-emerald-500 w-44"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold px-2 text-zinc-500">
                  <span>Balance after payment:</span>
                  <span className={remainingBalance > 0 ? 'text-rose-600 font-extrabold text-sm' : 'text-emerald-600'}>
                    Rs. {remainingBalance.toLocaleString()} {remainingBalance === 0 ? '(Fully Paid)' : '(Pending)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Transaction Ref / Cheque No.</label>
                    <input
                      type="text"
                      placeholder="e.g. TRX-98231 or Bank Slip ID"
                      value={formData.transactionRef}
                      onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Remarks / Note</label>
                  <textarea
                    rows={2}
                    placeholder="Optional collection remarks..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard/accountant/fees')}
                    className="rounded-xl font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-6"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Confirm & Issue Receipt
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-zinc-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-4 print:p-0 print:border-none print:shadow-none">
            {/* Header / Logo */}
            <div className="text-center border-b border-zinc-200 pb-4">
              <div className="text-xl font-black tracking-tight uppercase">Stoofi School & College ERP</div>
              <p className="text-xs text-zinc-500">Official Student Fee Receipt</p>
              <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                Receipt #{receiptData.receiptNo}
              </div>
            </div>

            {/* Receipt Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-zinc-200 pb-3">
              <div>
                <span className="text-zinc-500 block">Student Name:</span>
                <span className="font-extrabold text-sm">{receiptData.studentName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Admission / Roll:</span>
                <span className="font-extrabold text-sm">{receiptData.admissionNo || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Class & Section:</span>
                <span className="font-bold">{receiptData.className} ({receiptData.section || 'All'})</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Payment Date:</span>
                <span className="font-bold">{new Date(receiptData.paymentDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Payment Mode:</span>
                <span className="font-bold">{receiptData.paymentMethod}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Reference:</span>
                <span className="font-bold">{receiptData.transactionRef || 'Cash Desk'}</span>
              </div>
            </div>

            {/* Financial Rows */}
            <div className="space-y-1.5 text-xs border-b border-zinc-200 pb-3">
              <div className="flex justify-between py-1">
                <span>Fee Particulars ({receiptData.feeType}):</span>
                <span className="font-bold">Rs. {receiptData.amount.toLocaleString()}</span>
              </div>
              {receiptData.fine > 0 && (
                <div className="flex justify-between py-1 text-rose-600">
                  <span>Late Surcharge / Fine:</span>
                  <span className="font-bold">+ Rs. {receiptData.fine}</span>
                </div>
              )}
              {receiptData.discount > 0 && (
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Authorized Discount:</span>
                  <span className="font-bold">- Rs. {receiptData.discount}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-zinc-300 font-black text-sm text-emerald-700 bg-emerald-50 px-2 rounded-lg">
                <span>Amount Paid:</span>
                <span>Rs. {receiptData.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-zinc-600">
                <span>Remaining Outstanding Balance:</span>
                <span>Rs. {receiptData.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 text-center italic">
              This is a system generated receipt verified by the Stoofi Accounts Department.
            </div>

            {/* Action Buttons (Hidden when printing) */}
            <div className="flex justify-end gap-2 pt-2 print:hidden">
              <Button
                variant="outline"
                onClick={() => {
                  setReceiptData(null);
                  router.push('/dashboard/accountant/fees');
                }}
                className="rounded-xl font-bold"
              >
                Close & Finish
              </Button>
              <Button
                onClick={handlePrintReceipt}
                className="rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CollectFeePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Loading payment module...</div>}>
      <CollectFeeInner />
    </Suspense>
  );
}
