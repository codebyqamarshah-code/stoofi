'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Users,
  Search,
  Filter,
  DollarSign,
  Printer,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Banknote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function StaffSalaryRecordsPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, payrollRes] = await Promise.allSettled([
        api.get('/staff?limit=200'),
        api.get('/payroll')
      ]);

      if (staffRes.status === 'fulfilled' && staffRes.value?.data) {
        setStaffList(staffRes.value.data);
      }
      if (payrollRes.status === 'fulfilled' && payrollRes.value?.data) {
        setPayrolls(payrollRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load salary records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const filteredStaff = staffList.filter(s => {
    const q = search.toLowerCase();
    const name = `${s.firstName || ''} ${s.lastName || ''} ${s.name || ''}`.toLowerCase();
    const id = (s.staffNo || s.employeeId || '').toLowerCase();
    const des = (s.designation || '').toLowerCase();
    return name.includes(q) || id.includes(q) || des.includes(q);
  });

  const totalPayrollBudget = staffList.reduce((acc, s) => acc + (Number(s.basicSalary || s.salary) || 35000), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Staff Salary Records
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Payroll Department
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Faculty and institutional staff compensation directory, basic pay scales, and disbursement status.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => router.push('/dashboard/accountant/payroll/process')}
            className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
          >
            <Banknote className="w-4 h-4 mr-1.5" />
            Process Salary Payment
          </Button>
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                Total Registered Staff
              </p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                {staffList.length}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Faculty, admin & accounts personnel</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                Monthly Payroll Obligation
              </p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                Rs. {totalPayrollBudget.toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Base salary commitment</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-extrabold text-emerald-600 tracking-wider">
                Disbursements Processed
              </p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">
                {payrolls.length}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Verified salary slips on record</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search staff by name, employee ID, designation, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Staff Name</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Basic Salary</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                      Loading staff salary records...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-zinc-400">
                      No staff records found in database.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((s) => {
                    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Staff Member';
                    const empId = s.staffNo || s.employeeId || s._id.slice(-6).toUpperCase();
                    const basic = Number(s.basicSalary || s.salary) || 35000;

                    // Check if already paid for current month
                    const isPaidThisMonth = payrolls.some(p =>
                      (p.staffId === empId || p.staffId === s._id.toString()) &&
                      p.month === selectedMonth
                    );

                    return (
                      <tr key={s._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {empId}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">{fullName}</div>
                          <div className="text-xs text-zinc-400">{s.email || s.phone || 'Active Personnel'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                          {s.designation || 'Staff'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-zinc-500">
                          {s.department || 'Administration'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-zinc-900 dark:text-zinc-100">
                          Rs. {basic.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                              isPaidThisMonth
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {isPaidThisMonth ? 'Disbursed' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            onClick={() => router.push(`/dashboard/accountant/payroll/process?staffId=${s._id}&empId=${empId}&name=${encodeURIComponent(fullName)}&salary=${basic}`)}
                            size="sm"
                            className="h-8 px-3 rounded-lg text-xs font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
                          >
                            Process Pay
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
