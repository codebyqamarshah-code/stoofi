'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, ChevronRight, KeyRound, Lock, DollarSign, Users, 
  Settings, CheckCircle2, XCircle, ArrowRight, Shield 
} from 'lucide-react';

const MODULES_MATRIX = [
  { module: 'Human Resource (HR)', superAdmin: true, admin: true, teacher: false, accountant: false, student: false },
  { module: 'Leave Management', superAdmin: true, admin: true, teacher: true, accountant: true, student: false },
  { module: 'Examinations & Marks', superAdmin: true, admin: true, teacher: true, accountant: false, student: true },
  { module: 'Fees & Invoicing', superAdmin: true, admin: true, teacher: false, accountant: true, student: true },
  { module: 'LMS & Courses', superAdmin: true, admin: true, teacher: true, accountant: false, student: true },
  { module: 'Teacher Evaluation', superAdmin: true, admin: true, teacher: false, accountant: false, student: false },
  { module: 'Bulk Print Station', superAdmin: true, admin: true, teacher: false, accountant: true, student: false },
  { module: 'System Master Settings', superAdmin: true, admin: false, teacher: false, accountant: false, student: false },
];

export default function RolesOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#084A86]" />
            Role & Permission Center
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Configure system roles, access control levels, and department security policies
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
          <span className="text-zinc-950 font-bold">Role & Permission</span>
        </div>
      </div>

      {/* Quick Action Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link 
          href="/dashboard/roles/role"
          className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#084A86] flex items-center justify-center mb-4">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-zinc-950 text-base group-hover:text-[#084A86] transition-colors">
              Manage System Roles
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Create and manage custom roles (e.g. Vice Principal, Lab Attendant) and assign granular permissions.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-[#084A86]">
            <span>Configure Roles</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link 
          href="/dashboard/roles/login-permission"
          className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-zinc-950 text-base group-hover:text-[#084A86] transition-colors">
              Login Permissions
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Instantly toggle user access and portal login rights for staff, teachers, and students.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-[#084A86]">
            <span>Manage Access</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link 
          href="/dashboard/roles/due-fees-permission"
          className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-zinc-950 text-base group-hover:text-[#084A86] transition-colors">
              Due Fees Login Lock
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Restrict student portal access when outstanding fee dues exceed institutional credit policies.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-[#084A86]">
            <span>Fee Restrictions</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">Active Role Permission Matrix</h2>
            <p className="text-xs text-zinc-500 mt-0.5">High-level summary of authorized module access across all user roles</p>
          </div>
          <Link 
            href="/dashboard/roles/role"
            className="px-3.5 py-1.5 bg-[#084A86] hover:bg-[#073b6b] text-white text-xs font-bold rounded-lg shadow-xs"
          >
            Edit Permissions
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-100/70 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">System Module</th>
                <th className="px-4 py-3 text-center">Super Admin</th>
                <th className="px-4 py-3 text-center">Admin</th>
                <th className="px-4 py-3 text-center">Teacher</th>
                <th className="px-4 py-3 text-center">Accountant</th>
                <th className="px-4 py-3 text-center">Student / Parent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {MODULES_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-zinc-900 text-xs">
                    {row.module}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {row.admin ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-zinc-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {row.teacher ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-zinc-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {row.accountant ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-zinc-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {row.student ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-zinc-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
