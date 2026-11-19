'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Banknote,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Printer,
  Calendar,
  Users,
  Building,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

function ProcessSalaryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prefillStaffId = searchParams.get('staffId') || '';
  const prefillEmpId = searchParams.get('empId') || '';
  const prefillName = searchParams.get('name') || '';
  const prefillSalary = searchParams.get('salary') || '35000';

  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedSlip, setGeneratedSlip] = useState(null);

  const [formData, setFormData] = useState({
    staffId: prefillEmpId || prefillStaffId,
    staffName: prefillName,
    role: 'Teacher',
    month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    year: String(new Date().getFullYear()),
    basicSalary: Number(prefillSalary) || 35000,
    allowances: 0,
    deductions: 0,
    bonus: 0,
    paymentMethod: 'Bank Transfer',
    paymentDate: new Date().toISOString().slice(0, 10),
    remarks: ''
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const res = await api.get('/staff?limit=200');
        const list = res?.data || [];
        setStaffList(list);

        if (prefillStaffId || prefillEmpId) {
          const match = list.find(s =>
            s._id === prefillStaffId ||
            s.staffNo === prefillEmpId ||
            s.employeeId === prefillEmpId
          );
          if (match) {
            handleSelectStaff(match);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [prefillStaffId, prefillEmpId]);

  const handleSelectStaff = (st) => {
    setSelectedStaff(st);
    const fullName = `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Staff Member';
    const empId = st.staffNo || st.employeeId || st._id.slice(-6).toUpperCase();
    const basic = Number(st.basicSalary || st.salary) || 35000;

    setFormData(prev => ({
      ...prev,
      staffId: empId,
      staffName: fullName,
      role: st.role || 'Teacher',
      basicSalary: basic
    }));
  };

  const basic = Number(formData.basicSalary) || 0;
  const allowances = Number(formData.allowances) || 0;
  const bonus = Number(formData.bonus) || 0;
  const deductions = Number(formData.deductions) || 0;

  const netPayable = Math.max(0, (basic + allowances + bonus) - deductions);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.staffName) {
      setErrorMsg('Please select a staff member first');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        netSalary: netPayable,
        amount: netPayable,
        status: 'Paid'
      };

      const res = await api.post('/payroll', payload);
      if (res?.success) {
        setGeneratedSlip({
          slipNo: `SLIP-${Date.now().toString().slice(-6)}`,
          ...payload
        });
      } else {
        setErrorMsg(res?.message || 'Failed to process salary payment');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while processing payroll');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/accountant/payroll')}
          className="h-10 w-10 p-0 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Process Staff Salary
          </h1>
          <p className="text-sm text-zinc-500">Calculate net payable, allowances, deductions and disburse salary slip.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardHeader className="p-5 border-b border-zinc-200 dark:border-zinc-800">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Banknote className="w-5 h-5 text-emerald-600" />
            Payroll Disbursement Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Select Staff Member *
                </label>
                <select
                  onChange={(e) => {
                    const st = staffList.find(s => s._id === e.target.value);
                    if (st) handleSelectStaff(st);
                  }}
                  value={selectedStaff?._id || ''}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-medium"
                >
                  <option value="">-- Choose employee --</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.firstName} {st.lastName} ({st.designation || 'Staff'}) - ID: {st.staffNo || st.employeeId || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Salary Month & Year *
                </label>
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value, year: e.target.value.split('-')[0] })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Basic Pay (PKR)</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Allowances (+)</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Bonus (+)</label>
                <input
                  type="number"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 block mb-1">Deductions (-)</label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold text-rose-600"
                />
              </div>
            </div>

            {/* Net Salary Summary */}
            <div className="p-4 rounded-2xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold opacity-70 tracking-wider">Net Payable Compensation</span>
                <div className="text-3xl font-black">Rs. {netPayable.toLocaleString()}</div>
              </div>
              <div className="text-right text-xs opacity-80">
                Staff: {formData.staffName || 'None selected'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-medium"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Disbursement Date</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Remarks / Note</label>
              <textarea
                rows={2}
                placeholder="Disbursement notes..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/accountant/payroll')}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-6"
              >
                {submitting ? 'Disbursing...' : 'Disburse & Print Slip'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Salary Slip Modal */}
      {generatedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-zinc-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-4 print:p-0 print:border-none print:shadow-none">
            <div className="text-center border-b border-zinc-200 pb-4">
              <div className="text-xl font-black uppercase">Stoofi School & College ERP</div>
              <p className="text-xs text-zinc-500">Official Monthly Salary Pay Slip</p>
              <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                Slip #{generatedSlip.slipNo}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-b border-zinc-200 pb-3">
              <div>
                <span className="text-zinc-500 block">Employee:</span>
                <span className="font-extrabold text-sm">{generatedSlip.staffName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Staff / Employee ID:</span>
                <span className="font-bold">{generatedSlip.staffId}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Designation / Role:</span>
                <span className="font-bold">{generatedSlip.role}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Salary Month:</span>
                <span className="font-bold">{generatedSlip.month}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Disbursed Via:</span>
                <span className="font-bold">{generatedSlip.paymentMethod}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Payment Date:</span>
                <span className="font-bold">{new Date(generatedSlip.paymentDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-b border-zinc-200 pb-3">
              <div className="flex justify-between py-1">
                <span>Basic Pay:</span>
                <span className="font-bold">Rs. {Number(generatedSlip.basicSalary).toLocaleString()}</span>
              </div>
              {generatedSlip.allowances > 0 && (
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Allowances:</span>
                  <span className="font-bold">+ Rs. {Number(generatedSlip.allowances).toLocaleString()}</span>
                </div>
              )}
              {generatedSlip.bonus > 0 && (
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Bonus:</span>
                  <span className="font-bold">+ Rs. {Number(generatedSlip.bonus).toLocaleString()}</span>
                </div>
              )}
              {generatedSlip.deductions > 0 && (
                <div className="flex justify-between py-1 text-rose-600">
                  <span>Deductions / Tax:</span>
                  <span className="font-bold">- Rs. {Number(generatedSlip.deductions).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-zinc-300 font-black text-base text-emerald-700 bg-emerald-50 px-2 rounded-lg">
                <span>Net Salary Disbursed:</span>
                <span>Rs. {Number(generatedSlip.netSalary).toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 text-center italic">
              Verified by Accounts Department • Stoofi School Management System
            </div>

            <div className="flex justify-end gap-2 pt-2 print:hidden">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedSlip(null);
                  router.push('/dashboard/accountant/payroll');
                }}
                className="rounded-xl font-bold"
              >
                Close & Return
              </Button>
              <Button
                onClick={handlePrint}
                className="rounded-xl font-bold bg-zinc-950 text-white"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Salary Slip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProcessSalaryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Loading payroll engine...</div>}>
      <ProcessSalaryInner />
    </Suspense>
  );
}
