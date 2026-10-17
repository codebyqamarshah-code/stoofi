'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  BookMarked, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  User, 
  Download, 
  Printer 
} from 'lucide-react';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AllIssuedBooksPage() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [iRes, bRes, mRes] = await Promise.all([
        api.get('/issue-book').catch(() => null),
        api.get('/book').catch(() => null),
        api.get('/library-member').catch(() => null)
      ]);
      if (iRes?.success && Array.isArray(iRes.data)) setIssues(iRes.data);
      if (bRes?.success && Array.isArray(bRes.data)) setBooks(bRes.data);
      if (mRes?.success && Array.isArray(mRes.data)) setMembers(mRes.data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchAll(); 
  }, []);

  const handleReturn = async (id) => {
    if (!confirm('Mark this issued book as returned?')) return;
    try {
      const res = await api.put(`/issue-book/${id}`, { 
        status: 'returned', 
        returnDate: new Date().toISOString().split('T')[0] 
      });
      if (res?.success !== false) fetchAll();
      else alert(res?.message || 'Failed to return book');
    } catch (e) { 
      alert(e.message || 'Error returning book'); 
    }
  };

  const getBookTitle = (id) => books.find(b => b._id === id)?.title || 'Book';
  const getBookNo = (id) => books.find(b => b._id === id)?.bookNo || '—';
  const getMemberName = (id) => members.find(m => m._id === id)?.name || 'Member';
  const getMemberType = (id) => members.find(m => m._id === id)?.memberType || 'Member';

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    return issues.filter(i => {
      const isReturned = (i.status || '').toLowerCase() === 'returned';
      const due = i.dueDate ? i.dueDate.split('T')[0] : '';
      const isOverdue = !isReturned && due && due < todayStr;

      let matchStatus = true;
      if (statusFilter === 'ISSUED') matchStatus = !isReturned;
      else if (statusFilter === 'RETURNED') matchStatus = isReturned;
      else if (statusFilter === 'OVERDUE') matchStatus = isOverdue;

      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        getBookTitle(i.bookId).toLowerCase().includes(q) ||
        getBookNo(i.bookId).toLowerCase().includes(q) ||
        getMemberName(i.memberId).toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [issues, statusFilter, search, books, members, todayStr]);

  // KPIs
  const stats = useMemo(() => {
    const total = issues.length;
    const active = issues.filter(i => (i.status || '').toLowerCase() !== 'returned').length;
    const returned = issues.filter(i => (i.status || '').toLowerCase() === 'returned').length;
    const overdue = issues.filter(i => {
      const isRet = (i.status || '').toLowerCase() === 'returned';
      const due = i.dueDate ? i.dueDate.split('T')[0] : '';
      return !isRet && due && due < todayStr;
    }).length;

    return { total, active, returned, overdue };
  }, [issues, todayStr]);

  // Export configs
  const exportColumns = [
    { key: 'bookTitle', label: 'Book Title' },
    { key: 'bookNo', label: 'Book No' },
    { key: 'memberName', label: 'Borrower Member' },
    { key: 'memberType', label: 'Member Type' },
    { key: 'issueDate', label: 'Issue Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'returnDate', label: 'Return Date' },
    { key: 'status', label: 'Status' }
  ];

  const exportData = filtered.map(i => {
    const isReturned = (i.status || '').toLowerCase() === 'returned';
    const due = i.dueDate ? i.dueDate.split('T')[0] : '';
    const isOverdue = !isReturned && due && due < todayStr;

    return {
      bookTitle: getBookTitle(i.bookId),
      bookNo: getBookNo(i.bookId),
      memberName: getMemberName(i.memberId),
      memberType: getMemberType(i.memberId),
      issueDate: i.issueDate ? new Date(i.issueDate).toLocaleDateString() : '—',
      dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString() : '—',
      returnDate: i.returnDate ? new Date(i.returnDate).toLocaleDateString() : '—',
      status: isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Issued'
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <Clock className="h-6 w-6 text-[#084A86]" />
            All Issued Books & Circulation History
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Complete log of all book checkouts, due dates, and return records</p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/library" className="hover:text-zinc-600 transition-colors">Library</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Issued Books</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Checkouts</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.total}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Active Borrowed</div>
            <div className="text-2xl font-black text-[#084A86] mt-1">{stats.active}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Overdue Returns</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.overdue}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Returned Books</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.returned}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        {/* Actions Bar */}
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center bg-white border border-zinc-200 rounded-xl p-1 text-xs font-semibold">
              {['ALL', 'ISSUED', 'OVERDUE', 'RETURNED'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={statusFilter === st ? { backgroundColor: '#084A86', color: '#ffffff' } : {}}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === st ? 'shadow-xs font-bold' : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <Link href="/dashboard/library/issue-return-book">
              <Button 
                style={{ backgroundColor: '#084A86' }}
                className="hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                Issue New Book
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input 
                placeholder="Search title, member, book no..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-9 h-9 bg-white border-zinc-200 text-zinc-950 text-xs rounded-xl focus-visible:ring-[#084A86]" 
              />
            </div>

            <TableExportToolbar
              data={exportData}
              columns={exportColumns}
              filename="All_Issued_Books_Ledger"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3.5 font-bold w-12">#</th>
                <th className="px-4 py-3.5 font-bold">Book Title</th>
                <th className="px-4 py-3.5 font-bold">Book No</th>
                <th className="px-4 py-3.5 font-bold">Borrower Member</th>
                <th className="px-4 py-3.5 font-bold">Issue Date</th>
                <th className="px-4 py-3.5 font-bold">Due Date</th>
                <th className="px-4 py-3.5 font-bold">Return Date</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                      Loading circulation history...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    No issued book records found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((i, idx) => {
                  const isReturned = (i.status || '').toLowerCase() === 'returned';
                  const due = i.dueDate ? i.dueDate.split('T')[0] : '';
                  const isOverdue = !isReturned && due && due < todayStr;

                  return (
                    <tr key={i._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-zinc-500 text-xs">#{idx + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-zinc-950">
                        {getBookTitle(i.bookId)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-zinc-700">
                        {getBookNo(i.bookId)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-zinc-900">{getMemberName(i.memberId)}</div>
                        <div className="text-[11px] text-zinc-400 capitalize">{getMemberType(i.memberId)}</div>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 text-xs">
                        {i.issueDate ? new Date(i.issueDate).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-zinc-800'}>
                          {i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-GB') : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 text-xs">
                        {i.returnDate ? new Date(i.returnDate).toLocaleDateString('en-GB') : '—'}
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
                            onClick={() => handleReturn(i._id)} 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2.5 text-xs font-semibold border-zinc-200 text-[#084A86] hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Return
                          </Button>
                        ) : (
                          <span className="text-xs text-zinc-400 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-500 bg-zinc-50/30">
          <div>Showing <span className="font-bold text-zinc-900">{filtered.length}</span> records</div>
          <Link href="/dashboard/library/book-list" className="text-[#084A86] font-bold hover:underline">
            Go to Book Catalog &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
