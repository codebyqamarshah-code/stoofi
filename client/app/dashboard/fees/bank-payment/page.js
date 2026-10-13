'use client';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, RotateCcw } from 'lucide-react';
import { sortClassesAcademic, normalizeClassName } from '@/lib/academicUtils';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';

export default function BankPaymentPage() {
  const [formData, setFormData] = useState({ dateRange: '', class: '', section: '', status: '' });
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [records, setRecords] = useState([]);
  const [searchTable, setSearchTable] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/class').then(r => r?.success && Array.isArray(r.data) && setClasses(r.data)).catch(()=>{});
    api.get('/section').then(r => r?.success && Array.isArray(r.data) && setSections(r.data)).catch(()=>{});
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (formData.class) params.class = formData.class;
      if (formData.section) params.section = formData.section;
      if (formData.status) params.status = formData.status;
      if (formData.dateRange) params.dateRange = formData.dateRange;

      const res = await api.get('/bank-payment', { params });
      if (res?.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
      }
    } catch(e) {
      console.error('Error fetching bank payments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ dateRange: '', class: '', section: '', status: '' });
  };

  // Derive available sections dynamically
  const availableSections = useMemo(() => {
    if (formData.class) {
      const selectedClassObj = classes.find(c => 
        c.name === formData.class || 
        normalizeClassName(c.name) === normalizeClassName(formData.class)
      );
      if (selectedClassObj?.sections && Array.isArray(selectedClassObj.sections) && selectedClassObj.sections.length > 0) {
        return selectedClassObj.sections.map(s => {
          const raw = typeof s === 'string' ? s : (s.name || '');
          const clean = raw.replace(/^section\s+/i, '');
          return { value: raw, label: `Section ${clean}` };
        });
      }
    }

    // If no class is selected or class has no specific sections, show all system sections
    const allSecSet = new Set();
    (sections || []).forEach(s => {
      const name = typeof s === 'string' ? s : (s.name || '');
      if (name) allSecSet.add(name);
    });
    (classes || []).forEach(c => {
      (c.sections || []).forEach(s => {
        if (s) allSecSet.add(s);
      });
    });
    if (allSecSet.size === 0) {
      ['A', 'B', 'C', 'D'].forEach(s => allSecSet.add(s));
    }

    return Array.from(allSecSet).sort().map(s => {
      const clean = String(s).replace(/^section\s+/i, '');
      return { value: s, label: `Section ${clean}` };
    });
  }, [formData.class, classes, sections]);

  // Sorted academic classes
  const classOptions = useMemo(() => {
    return sortClassesAcademic(classes.map(c => ({ value: c.name, label: c.name })));
  }, [classes]);

  const filteredRecords = useMemo(() => {
    if (!searchTable.trim()) return records;
    const q = searchTable.toLowerCase().trim();
    return records.filter(r => 
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.admissionNo || '').toLowerCase().includes(q) ||
      (r.note || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q)
    );
  }, [records, searchTable]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Bank Payment</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Fees Collection</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Bank Payment</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-visible">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-950">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Date Range</Label>
            <Input 
              value={formData.dateRange} 
              onChange={e => setFormData({ ...formData, dateRange: e.target.value })} 
              placeholder="08/25/2026 - 09/01/2026" 
              className="bg-white border-zinc-200 text-zinc-950 h-10 rounded-xl" 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Class</Label>
            <SearchableSelect
              options={classOptions}
              value={formData.class}
              onChange={e => {
                const newClass = e.target.value;
                setFormData(prev => ({ ...prev, class: newClass, section: '' }));
              }}
              placeholder="Select Class"
              name="class"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Section</Label>
            <SearchableSelect
              options={availableSections}
              value={formData.section}
              onChange={e => setFormData({ ...formData, section: e.target.value })}
              placeholder="Select Section"
              name="section"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Status</Label>
            <SearchableSelect
              options={[
                { value: '', label: 'All Status' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Rejected', label: 'Rejected' }
              ]}
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              placeholder="Select Status"
              name="status"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400"
            />
          </div>

          <div className="md:col-span-4 flex items-center justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset} 
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> RESET
            </Button>
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 h-10 px-6 rounded-xl cursor-pointer"
            >
              <Search className="h-4 w-4" /> {loading ? 'SEARCHING...' : 'SEARCH'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col mt-6">
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-950">Bank Payment List</h2>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="SEARCH" 
              value={searchTable}
              onChange={e => setSearchTable(e.target.value)}
              className="pl-9 h-9 bg-white border-zinc-300 text-zinc-950 text-xs focus-visible:ring-zinc-600 rounded-lg" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">View Transaction</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Note</th>
                <th className="px-4 py-3 font-semibold">File</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-zinc-500">
                    No Data Available In Table
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-bold text-zinc-900">{item.studentName || item.student || '—'}</td>
                    <td className="px-4 py-3 text-zinc-600">{item.transactionId || item.txnId || '—'}</td>
                    <td className="px-4 py-3 text-zinc-600">{item.date || '—'}</td>
                    <td className="px-4 py-3 font-bold text-zinc-900">PKR {Number(item.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-zinc-600">{item.note || '—'}</td>
                    <td className="px-4 py-3 text-zinc-600">{item.file ? <a href={item.file} target="_blank" rel="noreferrer" className="text-indigo-600 underline">View</a> : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg">View</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
