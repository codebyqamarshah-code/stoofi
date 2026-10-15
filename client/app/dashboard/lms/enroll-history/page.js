'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { ChevronRight, Search, Plus, BookOpen, User, CheckCircle2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DEFAULT_LOGS = [
  { _id: 'e1', course: 'Complete Secondary Physics 2026', student: 'Muhammad Rayyan', paidAmount: '3500', instructor: 'Mudassir Bajwa', details: 'Paid in Full', paymentMethod: 'Card', purchaseDate: '2026-09-20', freeCourse: 'No' },
  { _id: 'e2', course: 'Higher Algebra & Trigonometry Mastery', student: 'Zoya Fatima', paidAmount: '4000', instructor: 'Fatima Zahra', details: 'Full Enrollment', paymentMethod: 'JazzCash', purchaseDate: '2026-09-21', freeCourse: 'No' },
  { _id: 'e3', course: 'Organic & Inorganic Chemistry Essentials', student: 'Bilal Hassan', paidAmount: '3200', instructor: 'Dr. Bilal Siddiqui', details: 'Challan verified', paymentMethod: 'Bank Challan', purchaseDate: '2026-09-23', freeCourse: 'No' },
  { _id: 'e4', course: 'Modern Web Development & Python Basics', student: 'Ayesha Noor', paidAmount: '0', instructor: 'Ms. Rabia Noor', details: 'Scholarship / Free Access', paymentMethod: 'Free Access', purchaseDate: '2026-09-24', freeCourse: 'Yes' },
];

export default function EnrollHistoryPage() {
  const [logs, setLogs] = useState(DEFAULT_LOGS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ course: '', student: '', paidAmount: '', instructor: '', details: '', paymentMethod: 'Cash' });

  useEffect(() => { 
    fetchRecords(); 
  }, []);

  const fetchRecords = async () => { 
    try { 
      const res = await api.get('/lms-enroll-history').catch(() => null); 
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setLogs(res.data); 
      }
    } catch(e){} 
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        _id: 'e_' + Date.now(),
        purchaseDate: new Date().toISOString().substring(0, 10), 
        freeCourse: formData.paidAmount === '0' || !formData.paidAmount ? 'Yes' : 'No' 
      };
      await api.post('/lms-enroll-history', payload).catch(() => null);
      setLogs(prev => [payload, ...prev]);
      setIsModalOpen(false);
      setFormData({ course: '', student: '', paidAmount: '', instructor: '', details: '', paymentMethod: 'Cash' });
    } catch(e) {}
  };

  const filtered = logs.filter(l => 
    (l.student || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.course || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.instructor || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#084A86]" />
            Course Enrollment Logs
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Student enrollment status, payment method, and course access verification</p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Enroll Logs</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search student, course, instructor..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9.5 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-[#084A86]"
          />
        </div>

        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="h-9.5 bg-[#084A86] hover:bg-[#073b6b] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs px-4"
        >
          <Plus className="h-4 w-4" />
          NEW ENROLLMENT
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950">Enrollment Register</h2>
          <span className="text-xs bg-zinc-200/70 text-zinc-700 px-2.5 py-0.5 rounded-full font-bold">
            {filtered.length} Enrollments
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-100/70 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3 font-semibold">Course Enrolled</th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">Instructor</th>
                <th className="px-4 py-3 font-semibold text-right">Fee Paid</th>
                <th className="px-4 py-3 font-semibold">Payment Mode</th>
                <th className="px-4 py-3 font-semibold">Enrolled Date</th>
                <th className="px-4 py-3 font-semibold text-center">Free Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center text-zinc-500 font-medium">No enrollment logs found.</td></tr>
              ) : (
                filtered.map((l, i) => (
                  <tr key={l._id || i} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center text-xs text-zinc-400 font-medium">{i + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-xs text-[#084A86] max-w-[220px] truncate">{l.course}</td>
                    <td className="px-4 py-3.5 font-bold text-zinc-950">{l.student}</td>
                    <td className="px-4 py-3.5 text-xs text-zinc-700">{l.instructor}</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-xs text-zinc-900">
                      {Number(l.paidAmount) > 0 ? `Rs. ${Number(l.paidAmount).toLocaleString()}` : 'Free'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-zinc-600 font-medium">{l.paymentMethod}</td>
                    <td className="px-4 py-3.5 text-xs text-zinc-500">{l.purchaseDate}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        l.freeCourse === 'Yes' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {l.freeCourse === 'Yes' ? 'Free Course' : 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Enroll Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border border-zinc-200 text-zinc-950 sm:max-w-md shadow-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#084A86]" />
              Manual Student Enrollment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-zinc-700 uppercase">Course Name *</Label>
              <Input required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} placeholder="e.g. Complete Secondary Physics 2026" className="bg-white border-zinc-300 text-zinc-950 mt-1 focus-visible:ring-[#084A86]" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-zinc-700 uppercase">Student Name *</Label>
              <Input required value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})} placeholder="e.g. Ali Hassan" className="bg-white border-zinc-300 text-zinc-950 mt-1 focus-visible:ring-[#084A86]" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-zinc-700 uppercase">Instructor Name</Label>
              <Input value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} placeholder="e.g. Mudassir Bajwa" className="bg-white border-zinc-300 text-zinc-950 mt-1 focus-visible:ring-[#084A86]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-zinc-700 uppercase">Paid Fee (Rs.)</Label>
                <Input type="number" value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} placeholder="3500" className="bg-white border-zinc-300 text-zinc-950 mt-1 focus-visible:ring-[#084A86]" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-zinc-700 uppercase">Payment Method</Label>
                <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="h-9 w-full rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 mt-1 focus:ring-2 focus:ring-[#084A86]">
                  <option value="Cash">Cash at Counter</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Challan">Bank Challan</option>
                  <option value="JazzCash">JazzCash / EasyPaisa</option>
                  <option value="Free Access">Free Scholarship</option>
                </select>
              </div>
            </div>
            <div className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-xs border-zinc-300">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#084A86] hover:bg-[#073b6b] text-white text-xs font-bold px-5">
                Save Enrollment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}