'use client';

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function AddMemberPage() {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', memberType: 'student', membershipExpiry: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchMembers = async () => {
    try {
      const res = await api.get('/library-member');
      if (res.success) setMembers(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Name is required');
    try {
      setSubmitting(true);
      const res = await api.post('/library-member', formData);
      if (res.success) { setFormData({ name: '', phone: '', email: '', address: '', memberType: 'student', membershipExpiry: '' }); fetchMembers(); }
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this member?')) return;
    try { const res = await api.delete(`/library-member/${id}`); if (res.success) fetchMembers(); } catch (e) { alert(e.message); }
  };

  const filtered = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Add Member</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link><ChevronRight className="h-4 w-4 mx-1" /><span>Library</span><ChevronRight className="h-4 w-4 mx-1" /><span className="text-zinc-600">Add Member</span>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800"><h2 className="text-lg font-semibold text-white">Add Library Member</h2></div>
            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              {[['name','Full Name',true],['phone','Phone'],['email','Email'],['address','Address']].map(([field, label, req]) => (
                <div key={field} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-zinc-400 uppercase">{label} {req && <span className="text-rose-500">*</span>}</Label>
                  <Input value={formData[field]} onChange={e => setFormData({...formData, [field]: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600" />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Member Type</Label>
                <select value={formData.memberType} onChange={e => setFormData({...formData, memberType: e.target.value})} className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-600">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Membership Expiry</Label>
                <Input type="date" value={formData.membershipExpiry} onChange={e => setFormData({...formData, membershipExpiry: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-600 [color-scheme:dark]" />
              </div>
              <Button disabled={submitting} type="submit" className="w-full bg-zinc-800 hover:bg-zinc-800 text-white font-semibold">
                {submitting ? 'SAVING...' : 'SAVE MEMBER'}
              </Button>
            </form>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Member List</h2>
              <div className="relative w-48"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" /><Input placeholder="SEARCH" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-zinc-600" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr><th className="px-4 py-3">SL</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan="6" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  : filtered.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-3 text-zinc-600">+{idx+1}</td>
                      <td className="px-4 py-3 text-zinc-300">{item.name}</td>
                      <td className="px-4 py-3 text-zinc-400">{item.phone}</td>
                      <td className="px-4 py-3 text-zinc-400 capitalize">{item.memberType}</td>
                      <td className="px-4 py-3 text-zinc-400">{item.membershipExpiry ? item.membershipExpiry.substring(0,10) : '-'}</td>
                      <td className="px-4 py-3 text-right"><Button onClick={() => handleDelete(item._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10">DELETE</Button></td>
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
