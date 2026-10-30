'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Phone, 
  CreditCard, 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  RefreshCw, 
  FileSpreadsheet, 
  Printer, 
  Copy, 
  ChevronRight, 
  ExternalLink,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Building2,
  UserCheck
} from 'lucide-react';
import api from '@/services/api';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function ParentsDirectoryPage() {
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parents');
      if (res?.success && Array.isArray(res.data)) {
        setParents(res.data);
        if (Array.isArray(res.classes)) {
          setClasses(res.classes);
        }
      }
    } catch (err) {
      console.error('Error fetching parents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  // Filtered Parents
  const filteredParents = useMemo(() => {
    return parents.filter(p => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || (
        p.parentName?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q) ||
        p.cnic?.toLowerCase().includes(q) ||
        p.occupation?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.children?.some(c => 
          c.studentName?.toLowerCase().includes(q) ||
          c.admissionNo?.toLowerCase().includes(q) ||
          c.rollNo?.toLowerCase().includes(q) ||
          c.className?.toLowerCase().includes(q)
        )
      );

      const matchesClass = selectedClass === 'ALL' || (
        p.children?.some(c => c.className?.toLowerCase() === selectedClass.toLowerCase())
      );

      return matchesSearch && matchesClass;
    });
  }, [parents, searchQuery, selectedClass]);

  // Statistics
  const multiChildCount = useMemo(() => {
    return parents.filter(p => p.children && p.children.length > 1).length;
  }, [parents]);

  const totalChildrenCovered = useMemo(() => {
    return parents.reduce((sum, p) => sum + (p.children?.length || 0), 0);
  }, [parents]);

  const handleCopyPhone = (phone, id) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Data Handler
  const prepareExportData = () => {
    return filteredParents.map((p, idx) => ({
      'Sr #': idx + 1,
      'Parent Name': p.parentName,
      'Relation': p.relation,
      'Father Name': p.fatherName || '—',
      'Mother Name': p.motherName || '—',
      'Phone Number': p.phone || '—',
      'CNIC': p.cnic || '—',
      'Occupation': p.occupation || '—',
      'Address': p.address || '—',
      'Enrolled Children': (p.children || []).map(c => `${c.studentName} (${c.admissionNo} - ${c.className})`).join(', ')
    }));
  };

  const handleExportCSV = () => {
    exportToCSV(prepareExportData(), 'Parents_Directory_Pak_Royal_College');
  };

  const handleExportExcel = () => {
    exportToExcel(prepareExportData(), 'Parents_Directory_Pak_Royal_College');
  };

  const handlePrint = () => {
    printData(prepareExportData(), 'Parents & Guardians Official Directory');
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <Users className="h-7 w-7 text-[#084A86]" />
            Parents & Guardians Directory
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">
            Complete records of student parents, guardians, contact numbers, CNICs, and family relationships.
          </p>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-zinc-500 font-semibold gap-1.5">
          <Link href="/dashboard" className="hover:text-zinc-800 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-[#084A86] font-bold">Parents Directory</span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Parents</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{loading ? '—' : parents.length}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Active family units</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#084A86] flex items-center justify-center font-bold">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Children Linked</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{loading ? '—' : totalChildrenCovered}</p>
            <p className="text-[11px] text-zinc-600 font-semibold mt-0.5">Enrolled students</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Multi-Child Families</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{loading ? '—' : multiChildCount}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Siblings enrolled</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <HeartHandshake className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Academic Classes</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{loading ? '—' : (classes.length || 'All')}</p>
            <p className="text-[11px] text-zinc-600 font-semibold mt-0.5">College programs</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Building2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[260px] sm:min-w-[320px] flex-1">
            <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search parent name, phone, CNIC, child name, roll #..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold focus:outline-none focus:ring-2 focus:ring-[#084A86]"
          >
            <option value="ALL">All Academic Classes</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchParents}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Copy className="h-4 w-4 text-blue-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-[#084A86] hover:bg-[#073d6e] text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Print List"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Parents Directory Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-950">Registered Parents & Families</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-[#084A86] border border-blue-100">
              {filteredParents.length} {filteredParents.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-zinc-500 hover:text-zinc-900 font-semibold underline cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-3 border-[#084A86] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-bold text-zinc-700">Loading parents directory...</p>
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="h-12 w-12 text-zinc-300 mx-auto" />
            <h4 className="text-base font-bold text-zinc-950 mt-3">No Parents Found</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedClass !== 'ALL'
                ? 'No parent records matched your search or class criteria. Try adjusting your filters.'
                : 'No parent records currently exist in the database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Sr #</th>
                  <th className="px-4 py-3">Parent / Guardian</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">CNIC</th>
                  <th className="px-4 py-3">Occupation</th>
                  <th className="px-4 py-3">Associated Child / Student</th>
                  <th className="px-4 py-3">Address & City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredParents.map((parent, idx) => (
                  <tr key={parent.id || idx} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-zinc-500 font-mono text-xs font-bold">
                      {idx + 1}
                    </td>

                    {/* Parent Name & Relation */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-950 text-sm">{parent.parentName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {parent.relation}
                        </span>
                      </div>
                      {parent.motherName && parent.motherName !== parent.parentName && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                          Mother: <span className="text-zinc-700 font-semibold">{parent.motherName}</span>
                        </p>
                      )}
                    </td>

                    {/* Contact Number */}
                    <td className="px-4 py-3.5">
                      {parent.phone ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${parent.phone}`}
                            className="font-mono font-bold text-[#084A86] hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {parent.phone}
                          </a>
                          <button
                            onClick={() => handleCopyPhone(parent.phone, parent.id)}
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
                            title="Copy Phone"
                          >
                            {copiedId === parent.id ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-400 font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* CNIC */}
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-zinc-800">
                      {parent.cnic}
                    </td>

                    {/* Occupation */}
                    <td className="px-4 py-3.5 font-medium text-zinc-700">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span>{parent.occupation}</span>
                      </div>
                    </td>

                    {/* Associated Child(ren) */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        {parent.children?.map((child) => (
                          <div 
                            key={child.studentId}
                            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-blue-50/60 rounded-xl border border-blue-100"
                          >
                            <Link
                              href={`/dashboard/students/${child.studentId}`}
                              className="font-bold text-xs text-[#084A86] hover:underline flex items-center gap-1"
                            >
                              <GraduationCap className="h-3.5 w-3.5" />
                              {child.studentName}
                            </Link>
                            <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                              ({child.admissionNo})
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-white text-zinc-800 border border-zinc-200">
                              {child.className} · {child.section}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Address & City */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex items-start gap-1.5 text-xs text-zinc-600 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2" title={parent.address}>
                          {parent.address}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
