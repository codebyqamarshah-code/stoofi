'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Users,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function PendingSalariesPage() {
  const router = useRouter();
  const [pendingStaff, setPendingStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, payrollRes] = await Promise.allSettled([
        api.get('/staff?limit=200'),
        api.get(`/payroll?month=${selectedMonth}`)
      ]);

      const allStaff = (staffRes.status === 'fulfilled' && staffRes.value?.data) ? staffRes.value.data : [];
      const paidPayrolls = (payrollRes.status === 'fulfilled' && payrollRes.value?.data) ? payrollRes.value.data : [];

      const paidIds = new Set(paidPayrolls.map(p => p.staffId));

      const pending = allStaff.filter(s => {
        const empId = s.staffNo || s.employeeId || s._id.toString();
        return !paidIds.has(empId) && !paidIds.has(s._id.toString());
      });

      setPendingStaff(pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const filtered = pendingStaff.filter(s => {
    const q = search.toLowerCase();
    const name = `${s.firstName || ''} ${s.lastName || ''} ${s.name || ''}`.toLowerCase();
    const id = (s.staffNo || s.employeeId || '').toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  const totalPendingLiability = filtered.reduce((sum, s) => sum + (Number(s.basicSalary || s.salary) || 35000), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Pending Salary Disbursements
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Month: {selectedMonth}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Staff and faculty members awaiting monthly compensation disbursement.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
          />
          <Button
            onClick={fetchData}
            variant="outline"
            className="h-10 w-10 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-2xl border-amber-200 dark:border-amber-950 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-amber-800 dark:text-amber-400 tracking-wider">
                Pending Salary Obligation
              </p>
              <h3 className="text-3xl font-black text-amber-900 dark:text-amber-300 mt-1">
                Rs. {totalPendingLiability.toLocaleString()}
              </h3>
              <p className="text-xs text-amber-700/80 mt-0.5">Estimated gross liability for {selectedMonth}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                Unpaid Staff Members
              </p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                {filtered.length}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Faculty & administrative personnel</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Staff Name</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Basic Salary</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Loading pending salaries...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-emerald-600 font-medium">
                      All staff salaries for {selectedMonth} have been successfully processed!
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Staff Member';
                    const empId = s.staffNo || s.employeeId || s._id.slice(-6).toUpperCase();
                    const basic = Number(s.basicSalary || s.salary) || 35000;

                    return (
                      <tr key={s._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {empId}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                          {fullName}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 text-xs">
                          {s.designation || 'Staff'}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 text-xs">
                          {s.department || 'Administration'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-zinc-900 dark:text-zinc-100">
                          Rs. {basic.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            onClick={() => router.push(`/dashboard/accountant/payroll/process?staffId=${s._id}&empId=${empId}&name=${encodeURIComponent(fullName)}&salary=${basic}`)}
                            size="sm"
                            className="h-8 px-3 rounded-lg text-xs font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                          >
                            Pay Salary
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
