'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Filter,
  Printer,
  Calendar,
  Eye,
  RefreshCw,
  Building,
  User,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function SalarySlipsPage() {
  const router = useRouter();
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedSlip, setSelectedSlip] = useState(null);

  const fetchSlips = async () => {
    try {
      setLoading(true);
      let query = '';
      if (selectedMonth !== 'ALL') query = `?month=${selectedMonth}`;
      const res = await api.get(`/payroll${query}`);
      if (res?.success && Array.isArray(res.data)) {
        setSlips(res.data);
      } else {
        setSlips([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
  }, [selectedMonth]);

  const filteredSlips = slips.filter(s => {
    const q = search.toLowerCase();
    const name = (s.staffName || '').toLowerCase();
    const id = (s.staffId || '').toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Staff Salary Slips
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Search, preview and reprint monthly institutional salary pay slips.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => router.push('/dashboard/accountant/payroll/process')}
            className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
          >
            <DollarSign className="w-4 h-4 mr-1.5" />
            Process New Salary
          </Button>
          <Button
            onClick={fetchSlips}
            variant="outline"
            className="h-10 w-10 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search slip by staff name, employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slips Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Staff Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Disbursement Method</th>
                  <th className="py-3 px-4 text-right">Net Salary</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Loading salary slips...
                    </td>
                  </tr>
                ) : filteredSlips.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-zinc-400">
                      No salary slips found on record.
                    </td>
                  </tr>
                ) : (
                  filteredSlips.map((s) => (
                    <tr key={s._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {s.staffId || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                        {s.staffName || 'Staff Member'}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 font-medium text-xs">
                        {s.role}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-zinc-500">
                        {s.month}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-600">
                        {s.paymentMethod || 'Bank Transfer'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        Rs. {(Number(s.netSalary ?? s.amount) || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {s.status || 'Paid'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          onClick={() => setSelectedSlip(s)}
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs font-bold"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Slip
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Salary Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-zinc-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-4 print:p-0 print:border-none print:shadow-none">
            <div className="text-center border-b border-zinc-200 pb-4">
              <div className="text-xl font-black uppercase">Stoofi School & College ERP</div>
              <p className="text-xs text-zinc-500">Official Monthly Salary Pay Slip</p>
              <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                Slip #{selectedSlip.staffId}-{selectedSlip.month}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-b border-zinc-200 pb-3">
              <div>
                <span className="text-zinc-500 block">Employee:</span>
                <span className="font-extrabold text-sm">{selectedSlip.staffName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Staff / Employee ID:</span>
                <span className="font-bold">{selectedSlip.staffId}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Designation / Role:</span>
                <span className="font-bold">{selectedSlip.role}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Salary Month:</span>
                <span className="font-bold">{selectedSlip.month}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Disbursed Via:</span>
                <span className="font-bold">{selectedSlip.paymentMethod}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Payment Date:</span>
                <span className="font-bold">{new Date(selectedSlip.paymentDate || selectedSlip.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-b border-zinc-200 pb-3">
              <div className="flex justify-between py-1">
                <span>Basic Pay:</span>
                <span className="font-bold">Rs. {(Number(selectedSlip.basicSalary) || 0).toLocaleString()}</span>
              </div>
              {selectedSlip.allowances > 0 && (
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Allowances:</span>
                  <span className="font-bold">+ Rs. {(Number(selectedSlip.allowances) || 0).toLocaleString()}</span>
                </div>
              )}
              {selectedSlip.bonus > 0 && (
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Bonus:</span>
                  <span className="font-bold">+ Rs. {(Number(selectedSlip.bonus) || 0).toLocaleString()}</span>
                </div>
              )}
              {selectedSlip.deductions > 0 && (
                <div className="flex justify-between py-1 text-rose-600">
                  <span>Deductions:</span>
                  <span className="font-bold">- Rs. {(Number(selectedSlip.deductions) || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-zinc-300 font-black text-base text-emerald-700 bg-emerald-50 px-2 rounded-lg">
                <span>Net Salary Disbursed:</span>
                <span>Rs. {(Number(selectedSlip.netSalary ?? selectedSlip.amount) || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 text-center italic">
              Verified by Accounts Department • Stoofi School Management System
            </div>

            <div className="flex justify-end gap-2 pt-2 print:hidden">
              <Button
                variant="outline"
                onClick={() => setSelectedSlip(null)}
                className="rounded-xl font-bold"
              >
                Close
              </Button>
              <Button
                onClick={handlePrint}
                className="rounded-xl font-bold bg-zinc-950 text-white"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Pay Slip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
