'use client';

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
        <h1 className="text-2xl font-bold text-white">Issue / Return Book</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span><ChevronRight className="h-4 w-4 mx-1" /><span>Library</span><ChevronRight className="h-4 w-4 mx-1" /><span className="text-emerald-500">Issue/Return Book</span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800"><h2 className="text-lg font-semibold text-white">Issue Book</h2></div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Book <span className="text-rose-500">*</span></Label>
                <select value={formData.bookId} onChange={e => setFormData({...formData, bookId: e.target.value})} className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select Book</option>
                  {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Member <span className="text-rose-500">*</span></Label>
                <select value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})} className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select Member</option>
                  {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Issue Date</Label>
                <Input type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500 [color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Due Date</Label>
                <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500 [color-scheme:dark]" />
              </div>
              <Button disabled={submitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {submitting ? 'ISSUING...' : 'ISSUE BOOK'}
              </Button>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Issued Books</h2>
              <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-emerald-500" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Book</th><th className="px-4 py-3">Member</th><th className="px-4 py-3">Issue Date</th><th className="px-4 py-3">Due Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="7" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  : filtered.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 text-emerald-500">+{idx+1}</td>
                      <td className="px-4 py-3 text-zinc-300">{getBookTitle(item.bookId)}</td>
                      <td className="px-4 py-3 text-zinc-400">{getMemberName(item.memberId)}</td>
                      <td className="px-4 py-3 text-zinc-400">{item.issueDate ? item.issueDate.substring(0,10) : '-'}</td>
                      <td className="px-4 py-3 text-zinc-400">{item.dueDate ? item.dueDate.substring(0,10) : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'returned' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-amber-900/30 text-amber-400'}`}>{item.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.status !== 'returned' && (
                          <Button onClick={() => handleReturn(item._id)} variant="ghost" size="sm" className="h-8 text-emerald-500 hover:bg-emerald-500/10 mr-1">RETURN</Button>
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
