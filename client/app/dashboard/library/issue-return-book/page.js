'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  BookMarked, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  User, 
  Calendar 
} from 'lucide-react';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';

export default function IssueReturnBookPage() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);

  // Default dates: today and +14 days
  const defaultIssueDate = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({ 
    bookId: '', 
    memberId: '', 
    issueDate: defaultIssueDate, 
    dueDate: defaultDueDate 
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookId || !formData.memberId) {
      alert('Please select both a Book and a Member.');
      return;
    }

    const selectedBook = books.find(b => b._id === formData.bookId);
    if (selectedBook && Number(selectedBook.quantity) <= 0) {
      if (!confirm('This book shows 0 available stock in catalog. Issue anyway?')) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await api.post('/issue-book', formData);
      if (res?.success !== false) {
        setFormData({ 
          bookId: '', 
          memberId: '', 
          issueDate: new Date().toISOString().split('T')[0], 
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        });
        fetchAll();
      } else {
        alert(res?.message || 'Failed to issue book');
      }
    } catch (e) { 
      alert(e.message || 'Error issuing book'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleReturn = async (id) => {
    if (!confirm('Confirm return of this book?')) return;
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
  const getMemberName = (id) => members.find(m => m._id === id)?.name || 'Member';
  const getMemberType = (id) => members.find(m => m._id === id)?.memberType || 'Member';

  const todayStr = new Date().toISOString().split('T')[0];

  // Options for SearchableSelect
  const bookOptions = useMemo(() => {
    return [
      { value: '', label: 'Select Book *' },
      ...books.map(b => ({
        value: b._id,
        label: `${b.title} ${b.author ? `by ${b.author}` : ''} (Copies: ${b.quantity || 0})`
      }))
    ];
  }, [books]);

  const memberOptions = useMemo(() => {
    return [
      { value: '', label: 'Select Member *' },
      ...members.map(m => ({
        value: m._id,
        label: `${m.name} (${m.memberType || 'Student'}${m.phone ? ` - ${m.phone}` : ''})`
      }))
    ];
  }, [members]);

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
    { key: 'memberName', label: 'Member Name' },
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
    const stLabel = isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Issued';

    return {
      bookTitle: getBookTitle(i.bookId),
      memberName: getMemberName(i.memberId),
      memberType: getMemberType(i.memberId),
      issueDate: i.issueDate ? new Date(i.issueDate).toLocaleDateString('en-GB') : '—',
      dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-GB') : '—',
      returnDate: i.returnDate ? new Date(i.returnDate).toLocaleDateString('en-GB') : '—',
      status: stLabel
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-[#084A86]" />
            Issue & Return Counter
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Check out books to students and staff, set return deadlines, and process returns.
          </p>
        </div>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/library" className="hover:text-zinc-600 transition-colors">Library</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Issue / Return</span>
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
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Currently Borrowed</div>
            <div className="text-2xl font-black text-[#084A86] mt-1">{stats.active}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Successfully Returned</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.returned}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Overdue Checkouts</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.overdue}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Issue Book */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-visible">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-[#084A86]" />
                Issue Book to Member
              </h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Select Book <span className="text-rose-500">*</span></Label>
                <SearchableSelect
                  options={bookOptions}
                  value={formData.bookId}
                  onChange={e => setFormData({ ...formData, bookId: e.target.value })}
                  placeholder="Select Book *"
                  name="bookId"
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">Select Member <span className="text-rose-500">*</span></Label>
                <SearchableSelect
                  options={memberOptions}
                  value={formData.memberId}
                  onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                  placeholder="Select Member *"
                  name="memberId"
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Issue Date</Label>
                  <Input 
                    type="date" 
                    value={formData.issueDate} 
                    onChange={e => setFormData({ ...formData, issueDate: e.target.value })} 
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">Due Date</Label>
                  <Input 
                    type="date" 
                    value={formData.dueDate} 
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })} 
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  style={{ backgroundColor: '#084A86' }}
                  className="w-full hover:opacity-95 text-white font-bold h-10 rounded-xl shadow-xs cursor-pointer"
                >
                  {submitting ? 'Issuing...' : 'Issue Book to Member'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Table: Active Issues */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div className="flex items-center gap-2">
                {/* Status Tabs */}
                <div className="flex items-center bg-white border border-zinc-200 rounded-xl p-0.5 text-xs font-semibold">
                  {['ALL', 'ISSUED', 'OVERDUE', 'RETURNED'].map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      style={statusFilter === st ? { backgroundColor: '#084A86', color: '#ffffff' } : {}}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        statusFilter === st ? 'font-bold shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-44">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input 
                    placeholder="Search title/member..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="pl-8 h-8 text-xs bg-white border-zinc-200 rounded-xl" 
                  />
                </div>

                <TableExportToolbar
                  data={exportData}
                  columns={exportColumns}
                  filename="Library_Issues_Ledger"
                />
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3">Book Title</th>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          Loading issues...
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-zinc-500">
                        No circulation records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(i => {
                      const isReturned = (i.status || '').toLowerCase() === 'returned';
                      const due = i.dueDate ? i.dueDate.split('T')[0] : '';
                      const isOverdue = !isReturned && due && due < todayStr;

                      return (
                        <tr key={i._id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold text-zinc-950">
                            {getBookTitle(i.bookId)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-zinc-900">{getMemberName(i.memberId)}</div>
                            <div className="text-[11px] text-zinc-400 capitalize">{getMemberType(i.memberId)}</div>
                          </td>
                          <td className="px-4 py-3 text-zinc-600 text-xs">
                            {i.issueDate ? new Date(i.issueDate).toLocaleDateString('en-GB') : '—'}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold">
                            <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-zinc-800'}>
                              {i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-GB') : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isReturned
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isOverdue
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-blue-100 text-[#084A86] border border-blue-200'
                            }`}>
                              {isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Issued'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {!isReturned ? (
                              <Button 
                                onClick={() => handleReturn(i._id)} 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2.5 text-xs font-semibold border-zinc-200 text-[#084A86] hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Return Book
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

            <div className="p-3 border-t border-zinc-200 text-xs text-zinc-500 bg-zinc-50/30">
              Showing {filtered.length} circulation records
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
