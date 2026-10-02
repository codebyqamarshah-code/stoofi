'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Copy, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  UserCheck, 
  UserX, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';

export default function RegistrationStudentListPage() {
  const [criteria, setCriteria] = useState({
    academicYear: '2026',
    classVal: 'All Classes',
    status: 'All'
  });

  const [activeFilter, setActiveFilter] = useState({
    classVal: 'All Classes',
    status: 'All'
  });

  const [search, setSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const classes = ['All Classes', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  const statusList = ['All', 'Pending', 'Approved', 'Rejected'];

  const [applicants, setApplicants] = useState([]);

  const handleSearchCriteria = (e) => {
    e.preventDefault();
    setActiveFilter({
      classVal: criteria.classVal,
      status: criteria.status
    });
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter(item => {
      const matchClass = activeFilter.classVal === 'All Classes' || item.classVal === activeFilter.classVal;
      const matchStatus = activeFilter.status === 'All' || item.applicationStatus === activeFilter.status;
      const matchSearch = !search ||
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        item.appNo.toLowerCase().includes(search.toLowerCase()) ||
        item.fatherName.toLowerCase().includes(search.toLowerCase()) ||
        item.mobile.includes(search);
      return matchClass && matchStatus && matchSearch;
    });
  }, [applicants, activeFilter, search]);

  const handleApprove = (id) => {
    setApplicants(applicants.map(a => a.id === id ? { ...a, applicationStatus: 'Approved' } : a));
  };

  const handleReject = (id) => {
    setApplicants(applicants.map(a => a.id === id ? { ...a, applicationStatus: 'Rejected' } : a));
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this registration record?')) {
      setApplicants(applicants.filter(a => a.id !== id));
      if (selectedApplicant?.id === id) setSelectedApplicant(null);
    }
  };

  const handleCopy = () => {
    const text = filteredApplicants.map(r => `${r.appNo} | ${r.studentName} | ${r.classVal} | ${r.fatherName} | ${r.mobile} | ${r.appliedDate} | ${r.paymentStatus} | ${r.applicationStatus}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Applicant records copied to clipboard!');
  };

  const handleExportCSV = () => {
    exportToCSV(filteredApplicants, 'Registration_Student_List');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredApplicants, 'Registration_Student_List');
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredApplicants,
      ['appNo', 'studentName', 'classVal', 'fatherName', 'mobile', 'appliedDate', 'paymentStatus', 'applicationStatus'],
      'Online Registration Applicants',
      'Registration_Student_List'
    );
  };

  const handlePrint = () => {
    printData(
      filteredApplicants,
      ['appNo', 'studentName', 'classVal', 'fatherName', 'mobile', 'appliedDate', 'paymentStatus', 'applicationStatus'],
      'Online Registration Applicants'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-900">
            Registration Student List
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-600 mt-1">
            Review and manage prospective student admissions submitted via the online portal.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-600">
          <Link href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/dashboard/module/registration" className="hover:text-zinc-800 dark:hover:text-zinc-950 transition-colors">
            Registration
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-800 dark:text-zinc-900 font-medium">Student List</span>
        </div>
      </div>

      {/* Select Criteria Card */}
      <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider mb-5">
          Select Criteria
        </h2>
        <form onSubmit={handleSearchCriteria}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                Academic Year <span className="text-rose-500">*</span>
              </label>
              <select
                value={criteria.academicYear}
                onChange={(e) => setCriteria({ ...criteria, academicYear: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
              >
                <option value="2026">2026 - 2027</option>
                <option value="2025">2025 - 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={criteria.classVal}
                onChange={(e) => setCriteria({ ...criteria, classVal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={criteria.status}
                onChange={(e) => setCriteria({ ...criteria, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-600/20 focus:border-zinc-600 outline-none transition-colors"
              >
                {statusList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Applicant List Table Card */}
      <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-200">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-900 uppercase tracking-wider">
              Applicant Student List
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-300 dark:border-zinc-200">
              {filteredApplicants.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="SEARCH"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-900 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-200">
              <button
                onClick={handleCopy}
                title="Copy Table"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleExportExcel}
                title="Export Excel"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleExportCSV}
                title="Export CSV"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleExportPDF}
                title="Export PDF"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handlePrint}
                title="Print"
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-700 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-200">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-zinc-900 font-bold dark:text-zinc-600 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-50/50 border-b border-zinc-200 dark:border-zinc-200">
              <tr>
                <th className="px-3.5 py-3">SL</th>
                <th className="px-3.5 py-3">App No</th>
                <th className="px-3.5 py-3">Student Name</th>
                <th className="px-3.5 py-3">Class</th>
                <th className="px-3.5 py-3">Father Name</th>
                <th className="px-3.5 py-3">Mobile</th>
                <th className="px-3.5 py-3">Applied Date</th>
                <th className="px-3.5 py-3">Payment</th>
                <th className="px-3.5 py-3">Status</th>
                <th className="px-3.5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-100">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-zinc-500">
                    No Data Available In Table
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-100/40 transition-colors"
                  >
                    <td className="px-3.5 py-3 font-medium text-zinc-900 dark:text-zinc-800">
                      {index + 1}
                    </td>
                    <td className="px-3.5 py-3 font-mono font-bold text-zinc-800 dark:text-zinc-900">
                      {item.appNo}
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-zinc-900 dark:text-zinc-900">
                      {item.studentName}
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-700">
                        {item.classVal}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-zinc-700 dark:text-zinc-700">
                      {item.fatherName}
                    </td>
                    <td className="px-3.5 py-3 font-mono text-zinc-600 dark:text-zinc-600 whitespace-nowrap">
                      {item.mobile}
                    </td>
                    <td className="px-3.5 py-3 text-zinc-600 dark:text-zinc-600 whitespace-nowrap">
                      {item.appliedDate}
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.paymentStatus === 'Paid'
                          ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-100 dark:text-zinc-900'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}>
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.applicationStatus === 'Approved'
                          ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-100 dark:text-zinc-900'
                          : item.applicationStatus === 'Rejected'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}>
                        {item.applicationStatus}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedApplicant(item)}
                          className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-800 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                          title="View Application Details"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                        {item.applicationStatus !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-800 rounded transition-colors"
                            title="Approve Applicant"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {item.applicationStatus !== 'Rejected' && (
                          <button
                            onClick={() => handleReject(item.id)}
                            className="p-1 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-600 rounded transition-colors"
                            title="Reject Applicant"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-2 text-xs text-zinc-500">
          <div>
            Showing {filteredApplicants.length > 0 ? 1 : 0} to {filteredApplicants.length} of {applicants.length} entries
          </div>
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              disabled
              className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed"
            >
              &lt;
            </button>
            <button
              className="px-2.5 py-1 rounded border border-zinc-600 bg-zinc-100 dark:bg-zinc-100 text-zinc-800 dark:text-zinc-900 font-semibold"
            >
              1
            </button>
            <button
              disabled
              className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-50 border border-zinc-200 dark:border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-200 pb-3">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-900">Applicant Profile</h3>
                <span className="text-xs font-mono text-zinc-800">{selectedApplicant.appNo}</span>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-950 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Full Name:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-900">{selectedApplicant.studentName}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Applying For Class:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-900">{selectedApplicant.classVal}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Father / Guardian:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-900">{selectedApplicant.fatherName}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Contact Phone:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-900">{selectedApplicant.mobile}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Date of Birth / Gender:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-900">{selectedApplicant.dob} ({selectedApplicant.gender})</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Previous Institution:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-900">{selectedApplicant.previousSchool}</span>
                </div>
                <div className="col-span-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-white border border-zinc-200 dark:border-zinc-200">
                  <span className="text-zinc-500 block">Residential Address:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-900">{selectedApplicant.address}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-200">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleApprove(selectedApplicant.id);
                    setSelectedApplicant({ ...selectedApplicant, applicationStatus: 'Approved' });
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-100 text-zinc-950 rounded-lg text-xs font-semibold"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedApplicant.id);
                    setSelectedApplicant({ ...selectedApplicant, applicationStatus: 'Rejected' });
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                >
                  Reject
                </button>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-950 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
