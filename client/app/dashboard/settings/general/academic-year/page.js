'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Search, Check, Trash2, Calendar, 
  CheckCircle2, Plus, AlertCircle 
} from 'lucide-react';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateDMY } from '@/lib/utils';
import api from '@/services/api';

export default function AcademicYearPage() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    year: '',
    title: '',
    start: '',
    end: ''
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/setting');
      if (res?.success && res.data) {
        const list = res.data.academicYears || [];
        setYears(list);
      }
    } catch (err) {
      console.error('Failed to load academic years:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.year || !formData.title || !formData.start || !formData.end) {
      return alert('Please fill in all required fields marked with *');
    }

    try {
      setSaving(true);
      const newEntry = {
        ...formData,
        active: years.length === 0
      };
      const updated = [...years, newEntry];

      const res = await api.put('/setting', {
        academicYears: updated,
        ...(newEntry.active ? { academicYear: newEntry.year } : {})
      });

      if (res?.success) {
        setFormData({ year: '', title: '', start: '', end: '' });
        setYears(res.data.academicYears || updated);
      } else {
        alert(res?.message || 'Failed to save academic year');
      }
    } catch (err) {
      console.error('Create error:', err);
      alert('Error saving academic year');
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (targetYear) => {
    try {
      setSaving(true);
      const updated = years.map(y => ({
        ...y,
        active: y.year === targetYear
      }));

      const res = await api.put('/setting', {
        academicYears: updated,
        academicYear: targetYear
      });

      if (res?.success) {
        setYears(res.data.academicYears || updated);
      }
    } catch (err) {
      console.error('Set active error:', err);
      alert('Failed to set active academic year');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (targetYear) => {
    if (!confirm(`Delete academic year ${targetYear}?`)) return;

    try {
      setSaving(true);
      const updated = years.filter(y => y.year !== targetYear);
      const res = await api.put('/setting', { academicYears: updated });
      if (res?.success) {
        setYears(res.data.academicYears || updated);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete academic year');
    } finally {
      setSaving(false);
    }
  };

  const filteredYears = years.filter(y => 
    (y.year || '').toLowerCase().includes(search.toLowerCase()) ||
    (y.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const exportColumns = [
    { key: 'year', label: 'Academic Year' },
    { key: 'title', label: 'Session Title' },
    { key: 'start', label: 'Starting Date' },
    { key: 'end', label: 'Ending Date' },
    { key: 'status', label: 'Status' }
  ];

  const exportData = filteredYears.map(y => ({
    year: y.year,
    title: y.title,
    start: formatDateDMY(y.start),
    end: formatDateDMY(y.end),
    status: y.active ? 'Active Session' : 'Inactive'
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#084A86]" />
            Academic Year Settings
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Configure academic sessions, session dates, and active default year</p>
        </div>
        <div className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
          <Link href="/dashboard" className="hover:text-[#084A86] transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span>System Settings</span>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-[#084A86] font-bold">Academic Year</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Academic Year Form */}
        <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">Add Academic Year</h2>
          </div>
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <div>
              <Label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">Year *</Label>
              <Input
                required
                type="text"
                placeholder="e.g. 2026-2027"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="bg-white border-zinc-300 text-sm"
              />
            </div>
            <div>
              <Label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">Year Title *</Label>
              <Input
                required
                type="text"
                placeholder="e.g. Session 2026-27"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white border-zinc-300 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">Starting Date *</Label>
                <Input
                  required
                  type="date"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  className="bg-white border-zinc-300 text-sm"
                />
              </div>
              <div>
                <Label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">Ending Date *</Label>
                <Input
                  required
                  type="date"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  className="bg-white border-zinc-300 text-sm"
                />
              </div>
            </div>

            <Button
              disabled={saving}
              type="submit"
              className="w-full bg-[#084A86] hover:bg-[#073b6b] text-white text-xs font-bold uppercase tracking-wider py-2.5 shadow-xs"
            >
              {saving ? 'Saving...' : 'SAVE ACADEMIC YEAR'}
            </Button>
          </form>
        </div>

        {/* Academic Year List */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">Academic Year List</h2>
            <span className="text-xs bg-zinc-200/70 text-zinc-600 px-2 py-0.5 rounded-full font-medium">{years.length} Sessions</span>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search year..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white border-zinc-300 text-sm"
                />
              </div>
              <TableExportToolbar
                columns={exportColumns}
                data={exportData}
                filename="academic_years"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-900">
                <thead className="bg-zinc-50 text-zinc-700 text-xs font-bold uppercase border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Starting Date</th>
                    <th className="px-4 py-3">Ending Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-zinc-500">
                        Loading academic sessions...
                      </td>
                    </tr>
                  ) : filteredYears.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-zinc-500">
                        No academic years configured.
                      </td>
                    </tr>
                  ) : (
                    filteredYears.map(y => (
                      <tr key={y.year} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-zinc-950">{y.year}</td>
                        <td className="px-4 py-3 text-zinc-800">{y.title}</td>
                        <td className="px-4 py-3 text-zinc-600 text-xs">{formatDateDMY(y.start)}</td>
                        <td className="px-4 py-3 text-zinc-600 text-xs">{formatDateDMY(y.end)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {y.active ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <Check className="h-3 w-3" /> Active
                              </span>
                            ) : (
                              <Button
                                disabled={saving}
                                onClick={() => handleSetActive(y.year)}
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                              >
                                Set as Active
                              </Button>
                            )}
                            <Button
                              disabled={saving}
                              onClick={() => handleDelete(y.year)}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-50"
                              title="Delete Year"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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