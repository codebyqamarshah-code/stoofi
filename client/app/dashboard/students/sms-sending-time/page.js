'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Clock, Trash2 } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SMSSendingTimePage() {
  const [time, setTime] = useState('');
  const [status, setStatus] = useState('Active');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/sms-sending-time');
      if (res.success) setRecords(res.data);
    } catch (e) {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!time) return;
    try {
      setLoading(true);
      await api.post('/sms-sending-time', { time, status });
      setTime('');
      fetchRecords();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete('/sms-sending-time/' + id);
      fetchRecords();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">SMS Sending Time</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Student Info</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-600">SMS Sending Time</span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
          CRON COMMAND
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Time Setup</h2>
            </div>
            <form className="p-6 space-y-6" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Start Time <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Input 
                    type="time" 
                    value={time} 
                    onChange={e => setTime(e.target.value)} 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-600 pr-10" 
                    required 
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Status <span className="text-rose-500">*</span></Label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)} 
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <Button disabled={loading} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold w-full">
                {loading ? 'SAVING...' : 'SAVE TIME SETUP'}
              </Button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Time Setup List</h2>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input placeholder="SEARCH" className="pl-9 h-9 bg-zinc-900 border-zinc-800 text-xs focus-visible:ring-zinc-600" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Time</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {records.length === 0 ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-zinc-500">No Data Available In Table</td></tr>
                  ) : (
                    records.map(r => (
                      <tr key={r._id} className="hover:bg-zinc-900/50">
                        <td className="px-4 py-3 text-zinc-300">{r.time}</td>
                        <td className="px-4 py-3 text-zinc-300">{r.status}</td>
                        <td className="px-4 py-3 text-right">
                          <Button onClick={() => handleDelete(r._id)} variant="ghost" size="sm" className="h-8 text-rose-500 hover:bg-rose-500/10">
                            <Trash2 className="h-4 w-4 mr-2" /> DELETE
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
