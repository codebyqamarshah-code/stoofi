'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { ChevronRight, Search, Download, Printer, FileText, MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function EnrollHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ course: '', student: '', paidAmount: '', instructor: '', details: '', paymentMethod: 'Cash' });
  useEffect(() => { fetchRecords(); }, []);
  const fetchRecords = async () => { try { const res = await api.get('/lms-enroll-history'); if(res.success) setLogs(res.data); } catch(e){} };

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/lms-enroll-history', { ...formData, purchaseDate: new Date().toISOString(), freeCourse: formData.paidAmount === '0' ? 'Yes' : 'No' });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ course: '', student: '', paidAmount: '', instructor: '', details: '', paymentMethod: 'Cash' });
        fetchRecords();
      }
    } catch(e) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-950">Course Enroll Logs</h1>
        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Course Enroll Logs</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-950">Select Criteria</h2>
          <Button onClick={() => setIsModalOpen(true)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-semibold h-9 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> NEW ENROLL
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Class</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Class</option>
              <option value="1">Class 1</option>
              <option value="2">Class 2</option>
              <option value="3">Class 3</option>
              <option value="4">Class 4</option>
              <option value="5">Class 5</option>
              <option value="6">Class 6</option>
              <option value="7">Class 7</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">O-Levels</option>
              <option value="12">A-Levels</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Section</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Section</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Course</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Course</option>
              <option value="c1">Full Stack Web Development</option>
              <option value="c2">Python for Data Analysis</option>
              <option value="c3">Cambridge O-Level Physics</option>
              <option value="c4">Mathematics Olympiad Prep</option>
              <option value="c5">English Creative Writing</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-700 uppercase font-bold">Select Teacher</Label>
            <select className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-200 bg-white dark:bg-white px-3 py-2 text-zinc-950 text-sm text-zinc-600 dark:text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600">
              <option value="">Select Teacher</option>
              <option value="1">John Doe (Senior Mathematics)</option>
              <option value="2">Sarah Connor (Physics HOD)</option>
              <option value="3">Michael Scott (Management Studies)</option>
              <option value="4">Jessica Pearson (Computer Science)</option>
              <option value="5">Alex Morgan (English Literature)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-950 font-semibold">
            <Search className="h-4 w-4 mr-2" /> SEARCH
          </Button>
        </div>
      </div>

      {/* Enroll Logs Table */}
      <div className="bg-white dark:bg-white border border-zinc-200 dark:border-zinc-200 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-950">Enroll Logs</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input placeholder="SEARCH" className="pl-9 w-[180px] bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 focus-visible:ring-zinc-600 text-xs font-semibold uppercase" />
            </div>
            <TableExportToolbar />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-600 dark:text-zinc-700 uppercase font-bold bg-white dark:bg-zinc-50 border-b border-zinc-200 dark:border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Paid Amount</th>
                <th className="px-4 py-3 font-semibold">Instructor</th>
                <th className="px-4 py-3 font-semibold">Details</th>
                <th className="px-4 py-3 font-semibold">Payment Method</th>
                <th className="px-4 py-3 font-semibold">Purchase Date</th>
                <th className="px-4 py-3 font-semibold">Free Course</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((l, i) => (
                <tr key={i} className="border-b border-zinc-200 dark:border-zinc-200/50 hover:bg-zinc-50 dark:hover:bg-zinc-50">
                  <td className="px-4 py-4 text-zinc-950">{l.course}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.student}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.paidAmount}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.instructor}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.details}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.paymentMethod}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.purchaseDate}</td>
                  <td className="px-4 py-4 text-zinc-950">{l.freeCourse}</td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div>Showing 0 to 0 of 0 entries</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-200 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-200 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-100" disabled><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* New Enroll Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-200 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-950 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Enroll
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Course Name *</Label>
              <Input required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-950 mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Student Name *</Label>
              <Input required value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})} className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-950 mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Instructor Name *</Label>
              <Input required value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-950 mt-1" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Paid Amount *</Label>
              <Input type="number" required value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} className="bg-white dark:bg-white border-zinc-200 dark:border-zinc-200 text-zinc-900 dark:text-zinc-950 mt-1" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-zinc-200 text-zinc-950">Cancel</Button>
              <Button type="submit" className="bg-white text-black hover:bg-zinc-200">Enroll Student</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}