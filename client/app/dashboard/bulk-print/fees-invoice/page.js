'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Printer, Receipt, Search, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

const DEFAULT_CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels', 'A-Levels'
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
        // Fetch all students if none loaded
        const allRes = await api.get('/student').catch(() => null);
        if (allRes?.success && Array.isArray(allRes.data)) {
          targetStudents = allRes.data;
        }
      }

      const generated = targetStudents.map((st, i) => ({
        invoiceNo: `INV-2026-${(1000 + i + 1)}`,
        date: new Date().toLocaleDateString('en-GB'),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
        studentName: `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student',
        admissionNo: st.admissionNo || 'N/A',
        rollNo: st.rollNo || '1',
        className: st.className || selectedClass || 'Class 10',
        section: st.section || selectedSection || 'A',
        items: [
          { name: 'Monthly Tuition Fee', amount: 3500 },
          { name: 'Computer & Lab Charges', amount: 500 },
          { name: 'Library & Sports Fund', amount: 300 },
          { name: 'Exam Assessment Fee', amount: 700 }
        ],
        total: 5000
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Receipt className="h-6 w-6 text-indigo-400" />
            Fees Invoice Bulk Print
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Generate official monthly fee challans and invoices ready for printing</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Bulk Print</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-500">Fees Invoice Bulk Print</span>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 print:hidden shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Select Criteria</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Class</Label>
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)} 
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Section</Label>
            <select 
              value={selectedSection} 
              onChange={e => setSelectedSection(e.target.value)} 
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="">All Sections</option>
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-400 uppercase">Student (Optional)</Label>
            <select 
              value={selectedStudentId} 
              onChange={e => setSelectedStudentId(e.target.value)} 
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
          <Button onClick={handleGenerateInvoices} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 px-6">
            <Search className="h-4 w-4" /> {loading ? 'GENERATING...' : 'GENERATE INVOICES'}
          </Button>
          {invoices.length > 0 && (
            <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 px-6">
              <Printer className="h-4 w-4" /> PRINT ALL ({invoices.length})
            </Button>
          )}
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {invoices.map((inv, idx) => (
              <div key={idx} className="bg-white text-zinc-900 rounded-xl p-6 border border-zinc-300 shadow-xl font-sans text-xs space-y-4">
                {/* Header */}
                <div className="border-b-2 border-zinc-900 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-900 uppercase">{schoolSetting?.schoolName || 'Stoofi Public School'}</h3>
                    <p className="text-[11px] text-zinc-600">{schoolSetting?.address || 'Main Campus, Lahore'}</p>
                    <p className="text-[10px] text-zinc-500">Phone: {schoolSetting?.phone || '+92 300 0000000'}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-zinc-900 text-white font-bold text-[10px] rounded uppercase">STUDENT FEE CHALLAN</span>
                    <p className="font-mono font-bold text-zinc-800 mt-1">{inv.invoiceNo}</p>
                  </div>
                </div>

                {/* Student Details */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-2.5 rounded border border-zinc-200 text-[11px]">
                  <div><span className="text-zinc-500">Student:</span> <strong className="text-zinc-900">{inv.studentName}</strong></div>
                  <div><span className="text-zinc-500">Adm No:</span> <strong className="text-zinc-900">{inv.admissionNo}</strong></div>
                  <div><span className="text-zinc-500">Class:</span> <strong className="text-zinc-900">{inv.className} ({inv.section})</strong></div>
                  <div><span className="text-zinc-500">Roll No:</span> <strong className="text-zinc-900">{inv.rollNo}</strong></div>
                  <div><span className="text-zinc-500">Issue Date:</span> <span className="text-zinc-800">{inv.date}</span></div>
                  <div><span className="text-zinc-500 font-semibold text-rose-600">Due Date:</span> <strong className="text-rose-600">{inv.dueDate}</strong></div>
                </div>

                {/* Table */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-300 text-zinc-600 font-bold uppercase text-[10px]">
                      <th className="py-1">Fee Description</th>
                      <th className="py-1 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {inv.items.map((it, i) => (
                      <tr key={i}>
                        <td className="py-1.5 text-zinc-800">{it.name}</td>
                        <td className="py-1.5 text-right font-mono font-semibold text-zinc-900">PKR {it.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-900 font-bold text-zinc-900 text-sm">
                      <td className="py-2">Total Payable Amount</td>
                      <td className="py-2 text-right font-mono text-indigo-700">PKR {inv.total.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Footer Signatures */}
                <div className="pt-4 border-t border-zinc-200 flex justify-between items-end text-[10px] text-zinc-500">
                  <span>Authorized Bank Copy / Student Copy</span>
                  <span className="border-t border-zinc-400 pt-1 font-semibold text-zinc-800">Accounts Officer Signature</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
