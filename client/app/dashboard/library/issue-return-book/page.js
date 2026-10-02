'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function IssueReturnBookPage() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ bookId: '', memberId: '', issueDate: '', dueDate: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const [iRes, bRes, mRes] = await Promise.all([api.get('/issue-book'), api.get('/book'), api.get('/library-member')]);
      if (iRes.success) setIssues(iRes.data);
      if (bRes.success) setBooks(bRes.data);
      if (mRes.success) setMembers(mRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookId || !formData.memberId) return alert('Book and Member are required');
    try {
      setSubmitting(true);
      const res = await api.post('/issue-book', formData);
      if (res.success) { setFormData({ bookId: '', memberId: '', issueDate: '', dueDate: '' }); fetchAll(); }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleReturn = async (id) => {
    try {
      const res = await api.put(`/issue-book/${id}`, { status: 'returned', returnDate: new Date() });
      if (res.success) fetchAll();
    } catch (e) { alert(e.message); }
  };

  const getBookTitle = (id) => books.find(b => b._id === id)?.title || '-';
  const getMemberName = (id) => members.find(m => m._id === id)?.name || '-';

  const filtered = issues.filter(i =>
    getBookTitle(i.bookId).toLowerCase().includes(search.toLowerCase()) ||
    getMemberName(i.memberId).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Issue / Return Book</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><span>Library</span><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-950 font-bold">Issue/Return Book</span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl">
            <div className="p-4 border-b border-zinc-200"><h2 className="text-lg font-semibold text-zinc-950">Issue Book</h2></div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Book <span className="text-rose-500">*</span></Label>
                <select value={formData.bookId} onChange={e => setFormData({...formData, bookId: e.target.value})} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-600">
                  <option value="">Select Book</option>
                  {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Member <span className="text-rose-500">*</span></Label>
                <select value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})} className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-600">
                  <option value="">Select Member</option>
                  {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Issue Date</Label>
                <Input type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600 [color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Due Date</Label>
                <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="bg-white border-zinc-300 text-zinc-950 text-zinc-950 focus-visible:ring-zinc-600 [color-scheme:dark]" />
              </div>
              <Button disabled={submitting} type="submit" className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold">
                {submitting ? 'ISSUING...' : 'ISSUE BOOK'}
              </Button>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-xl">
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-zinc-950">Issued Books</h2>
              <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-zinc-600" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
                  <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Book</th><th className="px-4 py-3">Member</th><th className="px-4 py-3">Issue Date</th><th className="px-4 py-3">Due Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  : filtered.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-600">+{idx+1}</td>
                      <td className="px-4 py-3 text-zinc-950">{getBookTitle(item.bookId)}</td>
                      <td className="px-4 py-3 text-zinc-700">{getMemberName(item.memberId)}</td>
                      <td className="px-4 py-3 text-zinc-700">{item.issueDate ? item.issueDate.substring(0,10) : '-'}</td>
                      <td className="px-4 py-3 text-zinc-700">{item.dueDate ? item.dueDate.substring(0,10) : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'returned' ? 'bg-zinc-100 text-zinc-500' : 'bg-amber-900/30 text-amber-400'}`}>{item.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.status !== 'returned' && (
                          <Button onClick={() => handleReturn(item._id)} variant="ghost" size="sm" className="h-8 text-zinc-600 hover:bg-zinc-600/10 mr-1">RETURN</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
