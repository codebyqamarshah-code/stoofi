'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Printer, Receipt, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { sortClassesAcademic } from '@/lib/academicUtils';
import { formatDateDMY } from '@/lib/utils';
import ThreeCopyFeeSlipModal, { formatBillingMonthLabel } from '@/components/fees/ThreeCopyFeeSlipModal';
import api from '@/services/api';

const DEFAULT_CLASSES = [
  'BS Psychology',
  'BS RIT',
  'DPT',
  'FSC Dental',
  'FSC NURSING',
  'FSC OTT'
];

export default function FeesInvoiceBulkPrintPage() {
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolSetting, setSchoolSetting] = useState(null);
  const [activeSlip, setActiveSlip] = useState(null);

  const currentYM = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    api.get('/class').then(r => {
      if (r?.success && Array.isArray(r.data) && r.data.length > 0) {
        setClasses(r.data.map(c => c.name));
      }
    }).catch(() => {});

    api.get('/setting').then(r => {
      if (r?.success && r.data) setSchoolSetting(r.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClass) {
      api.get(`/student?className=${encodeURIComponent(selectedClass)}`).then(r => {
        if (r?.success && Array.isArray(r.data)) {
          setStudents(r.data);
        }
      }).catch(() => setStudents([]));
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const handleGenerateInvoices = async () => {
    setLoading(true);
    try {
      let targetStudents = students;
      if (selectedStudentId) {
        targetStudents = students.filter(s => s._id === selectedStudentId);
      }
      if (targetStudents.length === 0) {
        const allRes = await api.get('/student').catch(() => null);
        if (allRes?.success && Array.isArray(allRes.data)) {
          targetStudents = allRes.data;
        }
      }

      const feeItems = [
        { head: 'Monthly Tuition Fee', amount: 12000 },
        { head: 'Laboratory & Practical Charges', amount: 1500 },
        { head: 'Library & Sports Fund', amount: 500 },
        { head: 'Examination Assessment Fee', amount: 1000 }
      ];
      const total = feeItems.reduce((s, it) => s + it.amount, 0);

      const generated = targetStudents.map((st, i) => ({
        challanNo: `${31400 + i + 1}`,
        invoiceNo: `CH-${31400 + i + 1}`,
        billingMonth: currentYM,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        student: `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student',
        studentName: `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student',
        fatherName: st.fatherName || '—',
        admissionNo: st.admissionNo || 'N/A',
        rollNo: st.rollNo || '1',
        className: `${st.className || selectedClass || 'FSC'} (${st.section || selectedSection || 'A'})`,
        section: st.section || selectedSection || 'A',
        feeType: 'Monthly Tuition Fee',
        feeItems,
        amount: total,
        waiver: 0,
        fine: 0,
        paid: 0,
        balance: total,
        status: 'Unpaid',
        paymentMethod: 'Cash / Bank'
      }));

      setInvoices(generated);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-[#084A86]" />
            Fees Challan &amp; 3-Copy Slip Bulk Generator
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Generate official Pak Royal College 3-Copy Fee Challans (Student Copy, Bank Copy, College Copy)
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Bulk Print</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Fees Challan Bulk Print</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-5 print:hidden shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-950 uppercase tracking-wider">Select Criteria</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Class</Label>
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)} 
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#084A86]"
            >
              <option value="">All Classes</option>
              {sortClassesAcademic(classes).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Section</Label>
            <select 
              value={selectedSection} 
              onChange={e => setSelectedSection(e.target.value)} 
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#084A86]"
            >
              <option value="">All Sections</option>
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Student (Optional)</Label>
            <select 
              value={selectedStudentId} 
              onChange={e => setSelectedStudentId(e.target.value)} 
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#084A86]"
            >
              <option value="">All Enrolled Students</option>
              {students.map(st => (
                <option key={st._id} value={st._id}>
                  {st.firstName} {st.lastName} (Roll: {st.rollNo || st.admissionNo})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <Button onClick={handleGenerateInvoices} disabled={loading} style={{ backgroundColor: '#084A86' }} className="hover:opacity-95 text-white font-semibold flex items-center gap-2 px-6 cursor-pointer">
            <Search className="h-4 w-4" /> {loading ? 'GENERATING...' : 'GENERATE FEE CHALLANS'}
          </Button>
          {invoices.length > 0 && (
            <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 px-6 cursor-pointer">
              <Printer className="h-4 w-4" /> PRINT ALL ({invoices.length})
            </Button>
          )}
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invoices.map((inv, idx) => (
              <div key={idx} className="bg-white text-zinc-900 rounded-xl p-5 border border-zinc-300 shadow-md font-sans text-xs space-y-4">
                {/* Header */}
                <div className="border-b-2 border-zinc-900 pb-3 flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <img src="/pak-royal-badge.png" alt="Pak Royal College" className="h-11 w-11 object-contain" />
                    <div>
                      <h3 className="text-sm font-black text-[#084A86] uppercase">PAK ROYAL COLLEGE</h3>
                      <p className="text-[10px] text-zinc-600 font-semibold">{formatBillingMonthLabel(inv.billingMonth)} Fee Challan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-zinc-100 border border-zinc-300 text-zinc-950 font-bold text-[10px] rounded uppercase">
                      Challan #{inv.challanNo}
                    </span>
                    <div className="mt-1.5 print:hidden">
                      <Button
                        size="sm"
                        onClick={() => setActiveSlip(inv)}
                        style={{ backgroundColor: '#084A86' }}
                        className="h-7 px-2.5 text-[11px] font-bold text-white rounded-lg inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="h-3 w-3" /> 3-Copy Slip / PDF
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Student Details */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-200 text-[11px]">
                  <div><span className="text-zinc-600 font-bold">Student:</span> <strong className="text-zinc-950">{inv.studentName}</strong></div>
                  <div><span className="text-zinc-600 font-bold">Adm / Roll:</span> <strong className="text-zinc-950">{inv.admissionNo} / {inv.rollNo}</strong></div>
                  <div><span className="text-zinc-600 font-bold">Father:</span> <strong className="text-zinc-950">{inv.fatherName}</strong></div>
                  <div><span className="text-zinc-600 font-bold">Class:</span> <strong className="text-zinc-950">{inv.className}</strong></div>
                  <div><span className="text-zinc-600 font-bold">Issue Date:</span> <span className="text-zinc-800">{formatDateDMY(inv.date)}</span></div>
                  <div><span className="text-rose-600 font-bold">Due Date:</span> <strong className="text-rose-600">{formatDateDMY(inv.dueDate)}</strong></div>
                </div>

                {/* Table */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-300 text-zinc-700 font-bold uppercase text-[10px]">
                      <th className="py-1">Head</th>
                      <th className="py-1 text-right">Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {inv.feeItems.map((it, i) => (
                      <tr key={i}>
                        <td className="py-1.5 text-zinc-800">{it.head}</td>
                        <td className="py-1.5 text-right font-mono font-semibold text-zinc-900">Rs. {it.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-900 font-bold text-zinc-950 text-xs bg-zinc-100">
                      <td className="py-2 px-1">Total Receivable</td>
                      <td className="py-2 px-1 text-right font-mono text-[#084A86]">Rs. {inv.amount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      <ThreeCopyFeeSlipModal
        isOpen={!!activeSlip}
        onClose={() => setActiveSlip(null)}
        slipData={activeSlip}
        schoolSetting={schoolSetting}
      />
    </div>
  );
}
