'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Printer, FileText, User, CheckSquare, Square, DollarSign, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = ['2024','2025','2026','2027'];

const SAMPLE_STAFF_PAYROLL = [
  {
    _id: 'staff-1',
    name: 'Mudassir Bajwa',
    role: 'Teacher',
    designation: 'Senior Physics Lecturer',
    department: 'Academics',
    basicSalary: 65000,
    allowances: 10000,
    deductions: 2500,
    netSalary: 72500,
    bankAccount: 'PK36MEZN000123456789'
  },
  {
    _id: 'staff-2',
    name: 'Fatima Zahra',
    role: 'Teacher',
    designation: 'Head of Mathematics',
    department: 'Academics',
    basicSalary: 75000,
    allowances: 12000,
    deductions: 3000,
    netSalary: 84000,
    bankAccount: 'PK36HABB000987654321'
  },
  {
    _id: 'staff-3',
    name: 'Muhammad Ali',
    role: 'Staff',
    designation: 'Senior Accountant / Bursar',
    department: 'Accounts & Finance',
    basicSalary: 55000,
    allowances: 8000,
    deductions: 2000,
    netSalary: 61000,
    bankAccount: 'PK36UBL000456789123'
  },
  {
    _id: 'staff-4',
    name: 'Dr. Bilal Siddiqui',
    role: 'Teacher',
    designation: 'Senior Chemistry Faculty',
    department: 'Academics',
    basicSalary: 70000,
    allowances: 11000,
    deductions: 2800,
    netSalary: 78200,
    bankAccount: 'PK36BAHL000321654987'
  }
];

export default function PayrollBulkPrintPage() {
  const [role, setRole] = useState('');
  const [month, setMonth] = useState('September');
  const [year, setYear] = useState('2026');
  const [records, setRecords] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolSetting, setSchoolSetting] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    executeSearch();
  }, [role, month, year]);

  const fetchInitialData = async () => {
    try {
      const res = await api.get('/setting').catch(() => null);
      if (res?.success && res.data) setSchoolSetting(res.data);
    } catch (err) {}
  };

  const executeSearch = async () => {
    setLoading(true);
    try {
      const url = role ? `/staff?role=${encodeURIComponent(role)}&limit=1000` : '/staff?limit=1000';
      const res = await api.get(url).catch(() => null);
      let list = [];
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        list = res.data.map(st => {
          const basic = st.basicSalary || 50000;
          const allow = 8000;
          const ded = 2000;
          return {
            _id: st._id,
            name: `${st.firstName || ''} ${st.lastName || ''}`.trim() || st.name || 'Staff Member',
            role: st.role || 'Teacher',
            designation: st.designation || 'Staff',
            department: st.department || 'General',
            basicSalary: basic,
            allowances: allow,
            deductions: ded,
            netSalary: basic + allow - ded,
            bankAccount: st.bankAccount || 'PK36BANK0001234567'
          };
        });
      } else if (res?.success && Array.isArray(res.data) && res.data.length === 0) {
        list = [];
      } else {
        list = role 
          ? SAMPLE_STAFF_PAYROLL.filter(s => s.role.toLowerCase() === role.toLowerCase())
          : SAMPLE_STAFF_PAYROLL;
      }

      setRecords(list);
      setSelectedIds(list.map(r => r._id));
    } catch (err) {
      const fallback = role 
        ? SAMPLE_STAFF_PAYROLL.filter(s => s.role.toLowerCase() === role.toLowerCase())
        : SAMPLE_STAFF_PAYROLL;
      setRecords(fallback);
      setSelectedIds(fallback.map(r => r._id));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r._id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedRecords = records.filter(r => selectedIds.includes(r._id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" />
            Payroll Bulk Print & Salary Slips
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Generate and bulk-print monthly salary slips, pay vouchers, and staff payroll records.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Bulk Print</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Payroll</span>
        </div>
      </div>

      {/* Criteria */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-5 shadow-sm print:hidden">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-950 uppercase tracking-wider">Select Criteria</h2>
        </div>
        <form onSubmit={handleSearchSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Role</Label>
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Staff & Teachers</option>
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Month</Label>
              <select 
                value={month} 
                onChange={e => setMonth(e.target.value)} 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Year</Label>
              <select 
                value={year} 
                onChange={e => setYear(e.target.value)} 
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10 shadow-md flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" /> 
                {loading ? 'SEARCHING...' : 'SEARCH PAYROLL'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-zinc-200 shadow-xs rounded-xl p-4 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={toggleSelectAll} 
            className="flex items-center gap-2 text-sm font-medium text-zinc-950 hover:text-zinc-950 cursor-pointer"
          >
            {selectedIds.length === records.length && records.length > 0 ? (
              <CheckSquare className="h-5 w-5 text-emerald-400" />
            ) : (
              <Square className="h-5 w-5 text-zinc-600" />
            )}
            Select All ({records.length})
          </button>
          <span className="text-xs text-zinc-600">|</span>
          <span className="text-sm text-zinc-400">
            Selected for Printing: <strong className="text-zinc-950 font-bold">{selectedIds.length}</strong>
          </span>
        </div>

        <Button 
          onClick={handlePrint} 
          disabled={selectedRecords.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md flex items-center gap-2 px-6"
        >
          <Printer className="h-4 w-4" />
          PRINT SALARY SLIPS ({selectedIds.length})
        </Button>
      </div>

      {/* Salary Slips Render Grid */}
      {records.length === 0 ? (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-12 text-center text-zinc-500">
          <User className="h-12 w-12 mx-auto mb-3 text-zinc-700" />
          <p className="text-base font-semibold text-zinc-950">No staff payroll records found</p>
          <p className="text-sm text-zinc-500 mt-1">Please add staff members in the HR Directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {records.map((staff, idx) => {
            const isSelected = selectedIds.includes(staff._id);
            const schoolName = schoolSetting?.schoolName || 'Stoofi Public School & College';

            return (
              <div 
                key={staff._id || idx}
                onClick={() => toggleSelect(staff._id)}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-emerald-500 rounded-xl' : 'opacity-50 hover:opacity-80'
                } ${!isSelected ? 'print:hidden' : ''}`}
              >
                {/* Payslip Document Box */}
                <div className="bg-white text-zinc-900 rounded-xl p-6 border border-zinc-300 shadow-xl font-sans text-xs space-y-4">
                  {/* Header */}
                  <div className="border-b-2 border-zinc-900 pb-3 flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 uppercase">{schoolName}</h3>
                      <p className="text-[11px] text-zinc-600">{schoolSetting?.address || 'Main Campus, Lahore'}</p>
                      <p className="text-[10px] text-zinc-500">Phone: {schoolSetting?.phone || '+92 300 0000000'}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 bg-emerald-800 text-white font-bold text-[10px] rounded uppercase">SALARY PAYSLIP</span>
                      <p className="font-semibold text-zinc-800 mt-1 text-[11px]">{month} {year}</p>
                    </div>
                  </div>

                  {/* Staff Info */}
                  <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 rounded border border-zinc-200 text-[11px]">
                    <div><span className="text-zinc-950 font-bold">Employee:</span> <strong className="text-zinc-900">{staff.name}</strong></div>
                    <div><span className="text-zinc-950 font-bold">Role:</span> <strong className="text-zinc-900">{staff.role}</strong></div>
                    <div><span className="text-zinc-950 font-bold">Designation:</span> <strong className="text-zinc-900">{staff.designation}</strong></div>
                    <div><span className="text-zinc-950 font-bold">Department:</span> <strong className="text-zinc-900">{staff.department}</strong></div>
                    <div className="col-span-2 truncate"><span className="text-zinc-950 font-bold">Bank Account:</span> <span className="font-mono text-zinc-800">{staff.bankAccount}</span></div>
                  </div>

                  {/* Earnings & Deductions Breakdown */}
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-300 text-zinc-600 font-bold uppercase text-[10px]">
                        <th className="py-1">Description</th>
                        <th className="py-1 text-right">Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      <tr>
                        <td className="py-1.5 text-zinc-800">Basic Salary</td>
                        <td className="py-1.5 text-right font-mono text-zinc-900">PKR {staff.basicSalary.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-emerald-700 font-medium">(+) Medical & Special Allowances</td>
                        <td className="py-1.5 text-right font-mono text-emerald-700 font-medium">PKR {staff.allowances.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-rose-700 font-medium">(-) Tax & Provident Fund Deductions</td>
                        <td className="py-1.5 text-right font-mono text-rose-700 font-medium">- PKR {staff.deductions.toLocaleString()}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-zinc-900 font-bold text-zinc-900 text-sm">
                        <td className="py-2">Net Disbursed Salary</td>
                        <td className="py-2 text-right font-mono text-emerald-700">PKR {staff.netSalary.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Signatures */}
                  <div className="pt-6 border-t border-zinc-200 flex justify-between items-end text-[10px] text-zinc-500">
                    <span className="border-t border-zinc-400 pt-1 font-semibold text-zinc-800">Employee Signature</span>
                    <span className="border-t border-zinc-400 pt-1 font-semibold text-zinc-800">Finance Director / Principal</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
