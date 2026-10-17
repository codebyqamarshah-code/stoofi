'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  BookOpen, 
  Plus, 
  Users, 
  Bookmark, 
  Layers, 
  Tag, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  BookMarked,
  RotateCcw,
  Library
} from 'lucide-react';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';

export default function LibraryDashboardHub() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, mRes, iRes, cRes] = await Promise.all([
        api.get('/book').catch(() => null),
        api.get('/library-member').catch(() => null),
        api.get('/issue-book').catch(() => null),
        api.get('/book-category').catch(() => null)
      ]);

      if (bRes?.success && Array.isArray(bRes.data)) setBooks(bRes.data);
      if (mRes?.success && Array.isArray(mRes.data)) setMembers(mRes.data);
      if (iRes?.success && Array.isArray(iRes.data)) setIssues(iRes.data);
      if (cRes?.success && Array.isArray(cRes.data)) setCategories(cRes.data);
    } catch (err) {
      console.error('Error fetching library overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Stats
  const stats = useMemo(() => {
    const totalBooks = books.reduce((acc, b) => acc + (Number(b.quantity) || 1), 0);
    const totalMembers = members.length;
    const activeIssues = issues.filter(i => (i.status || '').toLowerCase() !== 'returned').length;
    const overdueIssues = issues.filter(i => {
      const isReturned = (i.status || '').toLowerCase() === 'returned';
      const due = i.dueDate ? i.dueDate.split('T')[0] : '';
      return !isReturned && due && due < todayStr;
    }).length;

    return { totalBooks, catalogTitles: books.length, totalMembers, activeIssues, overdueIssues };
  }, [books, members, issues, todayStr]);

  const getBookTitle = (id) => books.find(b => b._id === id)?.title || 'Book';
  const getMemberName = (id) => members.find(m => m._id === id)?.name || 'Member';

  // Export configs
  const exportColumns = [
    { key: 'bookTitle', label: 'Book Title' },
    { key: 'memberName', label: 'Member Name' },
    { key: 'issueDate', label: 'Issue Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'status', label: 'Status' }
  ];

  const exportData = issues.map(i => ({
    bookTitle: getBookTitle(i.bookId),
    memberName: getMemberName(i.memberId),
    issueDate: i.issueDate ? new Date(i.issueDate).toLocaleDateString('en-GB') : '—',
    dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-GB') : '—',
    status: (i.status || '').toLowerCase() === 'returned' ? 'Returned' : 'Issued'
  }));

  const handleQuickReturn = async (id) => {
    try {
      const res = await api.put(`/issue-book/${id}`, { status: 'returned', returnDate: new Date() });
      if (res?.success) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to return book.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <Library className="h-6 w-6 text-[#084A86]" />
            Library Management Hub
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage school book catalog, issue and return circulation, student/teacher memberships, and overdue tracking.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Library Hub</span>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Catalog Volumes</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.totalBooks}</div>
            <div className="text-[11px] text-zinc-400 font-medium">{stats.catalogTitles} unique titles</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Registered Members</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.totalMembers}</div>
            <div className="text-[11px] text-zinc-400 font-medium">Students & Staff</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Currently Issued</div>
            <div className="text-2xl font-black text-[#084A86] mt-1">{stats.activeIssues}</div>
            <div className="text-[11px] text-zinc-400 font-medium">Active circulation</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookMarked className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Overdue / Delayed</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.overdueIssues}</div>
            <div className="text-[11px] text-zinc-400 font-medium">Pending return</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link 
          href="/dashboard/library/book-list" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#084A86] flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-[#084A86] transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Book Directory & Catalog</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Explore library collection, rack placements, ISBN numbers, publishers, and available copies.
            </p>
          </div>
          <span className="text-xs font-bold text-[#084A86] mt-4 flex items-center gap-1">
            Browse Catalog &rarr;
          </span>
        </Link>

        <Link 
          href="/dashboard/library/issue-return-book" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookMarked className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-emerald-700 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Issue & Return Counter</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Issue books to members with automatic stock management, due date alerts, and quick book return handling.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
            Open Desk &rarr;
          </span>
        </Link>

        <Link 
          href="/dashboard/library/all-issued-books" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-purple-700 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Circulation History & Ledger</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Complete audit log of all issued books, overdue penalties, return dates, and borrower member history.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 mt-4 flex items-center gap-1">
            View History &rarr;
          </span>
        </Link>

        <Link 
          href="/dashboard/library/add-book" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-amber-700 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Add New Book</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Register new volumes, editions, authors, shelf racks, and stock quantity into the library.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 mt-4 flex items-center gap-1">
            Register Book &rarr;
          </span>
        </Link>

        <Link 
          href="/dashboard/library/book-categories" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Tag className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-rose-700 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Book Categories</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Organize books by categories (e.g. Science, Fiction, Reference, Islamic Studies, Literature).
            </p>
          </div>
          <span className="text-xs font-bold text-rose-700 mt-4 flex items-center gap-1">
            Manage Categories &rarr;
          </span>
        </Link>

        <Link 
          href="/dashboard/library/add-member" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-teal-700 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Library Members</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Enroll students and faculty members with membership cards and maximum borrowing privileges.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-700 mt-4 flex items-center gap-1">
            Manage Members &rarr;
          </span>
        </Link>
      </div>

      {/* Recent Circulation Ledger */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <div>
            <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-[#084A86]" />
              Recent Book Issues & Circulation
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Live activity of books currently borrowed or recently returned</p>
          </div>

          <div className="flex items-center gap-2">
            <TableExportToolbar
              data={exportData}
              columns={exportColumns}
              filename="Library_Circulation_Report"
            />
            <Link href="/dashboard/library/issue-return-book">
              <Button 
                size="sm"
                style={{ backgroundColor: '#084A86' }}
                className="hover:opacity-95 text-white font-bold text-xs h-8 px-3 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Issue Book
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3.5">SL</th>
                <th className="px-4 py-3.5">Book Title</th>
                <th className="px-4 py-3.5">Borrower Member</th>
                <th className="px-4 py-3.5">Issue Date</th>
                <th className="px-4 py-3.5">Due Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                      Loading circulation records...
                    </div>
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-zinc-500">
                    No books currently issued. Visit &quot;Issue & Return Counter&quot; to borrow books.
                  </td>
                </tr>
              ) : (
                issues.slice(0, 10).map((i, idx) => {
                  const isReturned = (i.status || '').toLowerCase() === 'returned';
                  const due = i.dueDate ? i.dueDate.split('T')[0] : '';
                  const isOverdue = !isReturned && due && due < todayStr;

                  return (
                    <tr key={i._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-zinc-500 text-xs">#{idx + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-zinc-950">
                        {getBookTitle(i.bookId)}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-800 font-semibold">
                        {getMemberName(i.memberId)}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 text-xs">
                        {i.issueDate ? new Date(i.issueDate).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-zinc-800'}>
                          {i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-GB') : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isReturned
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-blue-100 text-[#084A86] border border-blue-200'
                        }`}>
                          {isReturned ? <CheckCircle2 className="h-3 w-3" /> : isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Issued'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {!isReturned ? (
                          <Button
                            onClick={() => handleQuickReturn(i._id)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs font-semibold border-zinc-200 text-[#084A86] hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Return
                          </Button>
                        ) : (
                          <span className="text-xs text-zinc-400 font-semibold">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {issues.length > 10 && (
          <div className="p-4 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-500 bg-zinc-50/30">
            <span>Showing recent 10 issues of {issues.length}</span>
            <Link href="/dashboard/library/all-issued-books" className="text-[#084A86] font-bold hover:underline">
              View All Issued Books &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
