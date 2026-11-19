'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgePercent,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  User,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function FeeDiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Student list for select
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    studentId: '',
    studentName: '',
    originalFee: 5000,
    discountAmount: 1000,
    reason: ''
  });

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accountant/fees/discounts');
      if (res?.success && Array.isArray(res.data)) {
        setDiscounts(res.data);
      } else {
        setDiscounts([]);
      }
    } catch (err) {
      console.error('Failed to load discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();

    // Fetch students list
    const fetchStudents = async () => {
      try {
        const res = await api.get('/student?limit=100');
        const list = res?.data || res?.students || [];
        setStudents(Array.isArray(list) ? list : []);
      } catch (_) {}
    };
    fetchStudents();
  }, []);

  const handleStudentSelect = (e) => {
    const sId = e.target.value;
    const st = students.find(s => s._id === sId);
    if (st) {
      const name = `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Student';
      const fee = Number(st.monthlyFee || st.tuitionFee || st.fee) || 5000;
      setForm({
        ...form,
        studentId: st._id,
        studentName: name,
        originalFee: fee
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentName) {
      alert('Please select or specify student name');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/accountant/fees/discounts', form);
      if (res?.success) {
        setShowModal(false);
        setForm({
          studentId: '',
          studentName: '',
          originalFee: 5000,
          discountAmount: 1000,
          reason: ''
        });
        fetchDiscounts();
      } else {
        alert(res?.message || 'Discount application failed');
      }
    } catch (err) {
      alert(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const exceedsLimit = Number(form.discountAmount) > 5000;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Fee Discounts & Concessions
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage scholarship waivers and financial aid with role-based approval limits (Rs. 5,000 threshold).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setShowModal(true)}
            className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Apply Concession / Discount
          </Button>
          <Button
            onClick={fetchDiscounts}
            variant="outline"
            className="h-10 w-10 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Info Notice about Accountant Limit */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Accountant Permission Policy:</span> Discounts up to <strong>Rs. 5,000</strong> are authorized directly by the Accountant. Discounts exceeding this limit are submitted to the Administrative Director for authorization.
        </div>
      </div>

      {/* Discounts Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between">
            <span>Discounts Ledger ({discounts.length})</span>
            <span className="text-xs font-normal text-zinc-500">Live MongoDB records</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Reason / Particulars</th>
                  <th className="py-3 px-4 text-right">Original Fee</th>
                  <th className="py-3 px-4 text-right">Discount</th>
                  <th className="py-3 px-4 text-right">Payable Fee</th>
                  <th className="py-3 px-4 text-center">Approval Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Loading discounts...
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-zinc-400">
                      No discounts recorded yet. Click "Apply Concession" to add one.
                    </td>
                  </tr>
                ) : (
                  discounts.map((d) => (
                    <tr key={d._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {d.studentName || 'Student'}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
                        {d.reason || 'Scholarship waiver'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-zinc-600 dark:text-zinc-400">
                        Rs. {(Number(d.originalFee) || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        - Rs. {(Number(d.discountAmount) || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-zinc-900 dark:text-zinc-100">
                        Rs. {(Number(d.finalFee) || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            d.approvalStatus === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : d.approvalStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {d.approvalStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-zinc-500">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Discount Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-zinc-950 dark:text-zinc-50">Apply Fee Concession</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Select Student</label>
                <select
                  onChange={handleStudentSelect}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
                  <option value="">-- Choose student --</option>
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name || `${st.firstName} ${st.lastName}`} ({st.class || 'Class'}) - ID: {st.admissionNo || st.rollNo}
                    </option>
                  ))}
                </select>
              </div>

              {!form.studentId && (
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Or Enter Student Name</label>
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={form.studentName}
                    onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Standard Tuition Fee</label>
                  <input
                    type="number"
                    value={form.originalFee}
                    onChange={(e) => setForm({ ...form, originalFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Discount Amount (PKR)</label>
                  <input
                    type="number"
                    value={form.discountAmount}
                    onChange={(e) => setForm({ ...form, discountAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-black text-emerald-600"
                  />
                </div>
              </div>

              {exceedsLimit && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-xs text-amber-900 dark:text-amber-300">
                  ⚠️ <strong>Notice:</strong> Discount exceeds Rs. 5,000 threshold. Will be queued for <strong>Admin Approval</strong> before applying.
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Reason for Concession</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Merit scholarship, sibling concession, orphan aid..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                >
                  {submitting ? 'Submitting...' : 'Apply Concession'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
