'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Filter,
  X
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, printData } from '@/lib/exportUtils';
import { formatDateDMY } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

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
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);

  const classes = ['All Classes', 'BS Psychology', 'BS RIT', 'DPT', 'FSC Dental', 'FSC NURSING', 'FSC OTT'];
  const statusList = ['All', 'Approved', 'Pending', 'Rejected'];

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student');
      if (res?.success && Array.isArray(res.data)) {
        const mapped = res.data.map((s, idx) => ({
          id: s._id || idx,
          appNo: s.admissionNo || `REG-${idx + 1}`,
          studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Student',
          classVal: s.className || 'FSC OTT',
          section: s.section || 'A',
          fatherName: s.fatherName || '—',
          mobile: s.phone || s.fatherPhone || '—',
          appliedDate: formatDateDMY(s.createdAt || s.admissionDate || s.joiningDate),
          paymentStatus: 'Paid',
          applicationStatus: s.status === 'Active' ? 'Approved' : (s.status || 'Pending'),
          gender: s.gender || '—',
          dob: formatDateDMY(s.dob),
          cnic: s.cnic || '—',
          address: s.currentAddress || s.address || '—'
        }));
        setApplicants(mapped);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.error('Error fetching registered students:', err);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const handleApprove = async (id) => {
    try {
      await api.put(`/student/${id}`, { status: 'Active' });
      setApplicants(applicants.map(a => a.id === id ? { ...a, applicationStatus: 'Approved' } : a));
    } catch (_) {
      setApplicants(applicants.map(a => a.id === id ? { ...a, applicationStatus: 'Approved' } : a));
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/student/${id}`, { status: 'Inactive' });
      setApplicants(applicants.map(a => a.id === id ? { ...a, applicationStatus: 'Rejected' } : a));
    } catch (_) {
      setApplicants(applicants.map(a => a.id === id ? { ...a, applicationStatus: 'Rejected' } : a));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this registration record?')) {
      try {
        await api.delete(`/student/${id}`);
        setApplicants(applicants.filter(a => a.id !== id));
        if (selectedApplicant?.id === id) setSelectedApplicant(null);
      } catch (_) {
        setApplicants(applicants.filter(a => a.id !== id));
      }
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
          <h1 className="text-2xl font-bold tracking-tight text-[#0c3559]">
            Registration Student List
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Browse and verify registered student applicants and admission queries.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <span className="text-zinc-500">Module</span>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <span className="text-zinc-700 font-semibold">Registration</span>
        </div>
      </div>

      {/* Select Criteria Filter Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-bold text-[#0c3559] uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" /> Filter Criteria
        </h2>
        <form onSubmit={handleSearchCriteria} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Academic Year</label>
            <select
              value={criteria.academicYear}
              onChange={(e) => setCriteria({ ...criteria, academicYear: e.target.value })}
              className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-800 focus:outline-none"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Class</label>
            <select
              value={criteria.classVal}
              onChange={(e) => setCriteria({ ...criteria, classVal: e.target.value })}
              className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-800 focus:outline-none"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">Application Status</label>
            <select
              value={criteria.status}
              onChange={(e) => setCriteria({ ...criteria, status: e.target.value })}
              className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-800 focus:outline-none"
            >
              {statusList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </form>
      </div>

      {/* Main Applicants Table Card */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0c3559]">Registered Student Applicants ({filteredApplicants.length})</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Live student records from the database</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input 
                type="text"
                placeholder="SEARCH"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8.5 pr-3 h-8.5 text-xs bg-white border border-zinc-200 rounded-lg uppercase tracking-wider text-zinc-700"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-[#0c3559] uppercase font-bold bg-[#f8fafc] border-b border-zinc-100">
              <tr>
                <th className="px-4 py-3 font-bold w-12">SL</th>
                <th className="px-4 py-3 font-bold">APP / ADM NO</th>
                <th className="px-4 py-3 font-bold">NAME</th>
                <th className="px-4 py-3 font-bold">CLASS</th>
                <th className="px-4 py-3 font-bold">FATHER NAME</th>
                <th className="px-4 py-3 font-bold">CONTACT</th>
                <th className="px-4 py-3 font-bold">JOINING DATE</th>
                <th className="px-4 py-3 font-bold">STATUS</th>
                <th className="px-4 py-3 font-bold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center text-zinc-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                      <span>Loading registered students...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center text-sm font-medium text-zinc-400">
                    No Data Available In Table
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-zinc-600 font-semibold">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#0c3559]">{item.appNo}</td>
                    <td className="px-4 py-3.5 font-bold text-zinc-900">{item.studentName}</td>
                    <td className="px-4 py-3.5 text-zinc-700 font-medium">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                        {item.classVal} {item.section ? `(${item.section})` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700">{item.fatherName}</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-600">{item.mobile}</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-600">{item.appliedDate}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.applicationStatus === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : item.applicationStatus === 'Rejected'
                          ? 'bg-rose-50 text-rose-800 border border-rose-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {item.applicationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedApplicant(item)}
                          className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-[11px] font-medium inline-flex items-center gap-1 transition"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>
                        {item.applicationStatus !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition"
                            title="Approve"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded transition"
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
      </div>

      {/* Applicant View Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 text-zinc-950 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-[#0c3559]">Student Registration Record</h3>
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Admission / App No:</span>
                <span className="font-mono font-bold text-[#0c3559]">{selectedApplicant.appNo}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Student Name:</span>
                <span className="font-bold text-zinc-900">{selectedApplicant.studentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Class & Section:</span>
                <span className="font-semibold text-zinc-800">{selectedApplicant.classVal} ({selectedApplicant.section})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Father Name:</span>
                <span className="font-semibold text-zinc-800">{selectedApplicant.fatherName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Phone / Mobile:</span>
                <span className="font-mono text-zinc-800">{selectedApplicant.mobile}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">CNIC / B-Form:</span>
                <span className="font-mono text-zinc-800">{selectedApplicant.cnic}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Date of Birth:</span>
                <span className="font-mono text-zinc-800">{selectedApplicant.dob}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500 font-semibold">Registration Date:</span>
                <span className="font-mono text-zinc-800">{selectedApplicant.appliedDate}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-100 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedApplicant(null)}
                className="text-xs h-9 rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
