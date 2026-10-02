'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

export default function AllIssuedBooksPage() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [iRes, bRes, mRes] = await Promise.all([api.get('/issue-book'), api.get('/book'), api.get('/library-member')]);
        if (iRes.success) setIssues(iRes.data);
        if (bRes.success) setBooks(bRes.data);
        if (mRes.success) setMembers(mRes.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const getBookTitle = (id) => books.find(b => b._id === id)?.title || '-';
  const getMemberName = (id) => members.find(m => m._id === id)?.name || '-';

  const filtered = issues.filter(i =>
    getBookTitle(i.bookId).toLowerCase().includes(search.toLowerCase()) ||
    getMemberName(i.memberId).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">All Issued Books</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><span>Library</span><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-950 font-bold">All Issued Books</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-950">All Issued Book List</h2>
          <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-zinc-600" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">SL</th>
                <th className="px-4 py-3">Book Title</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Return Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Fine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan="8" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
              : filtered.map((item, idx) => (
                <tr key={item._id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-600">+{idx+1}</td>
                  <td className="px-4 py-3 text-zinc-950">{getBookTitle(item.bookId)}</td>
                  <td className="px-4 py-3 text-zinc-700">{getMemberName(item.memberId)}</td>
                  <td className="px-4 py-3 text-zinc-700">{item.issueDate ? item.issueDate.substring(0,10) : '-'}</td>
                  <td className="px-4 py-3 text-zinc-700">{item.dueDate ? item.dueDate.substring(0,10) : '-'}</td>
                  <td className="px-4 py-3 text-zinc-700">{item.returnDate ? item.returnDate.substring(0,10) : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'returned' ? 'bg-zinc-100 text-zinc-500' : 'bg-amber-900/30 text-amber-400'}`}>{item.status}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{item.fine > 0 ? `$${item.fine}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
