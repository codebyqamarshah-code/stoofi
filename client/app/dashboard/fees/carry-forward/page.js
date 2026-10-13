'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  DollarSign, 
  Save, 
  CheckSquare, 
  Square,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { sortClassesAcademic, normalizeClassName } from '@/lib/academicUtils';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import TableExportToolbar from '@/components/ui/TableExportToolbar';

export default function FeesCarryForwardPage() {
  const [formData, setFormData] = useState({ class: '', section: '', search: '' });
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Map of studentId -> carryForwardAmount
  const [carryAmounts, setCarryAmounts] = useState({});
  // Set of selected student IDs
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    api.get('/class').then(r => r?.success && Array.isArray(r.data) && setClasses(r.data)).catch(() => {});
    api.get('/section').then(r => r?.success && Array.isArray(r.data) && setSections(r.data)).catch(() => {});
    // Initial fetch to load students
    fetchCarryForwardData();
  }, []);

  const fetchCarryForwardData = async (cls = '', sec = '', search = '') => {
    try {
      setLoading(true);
      const params = {};
      if (cls) params.class = cls;
      if (sec) params.section = sec;
      if (search) params.search = search;

      const res = await api.get('/fees/carry-forward', { params });
      if (res?.success && Array.isArray(res.data)) {
        setStudents(res.data);
        // Pre-populate carry forward amounts and select students with dues
        const amounts = {};
        const selected = new Set();
        res.data.forEach(st => {
          amounts[st._id] = st.carryForwardAmount || st.previousBalance || 0;
          if ((st.previousBalance || 0) > 0) {
            selected.add(st._id);
          }
        });
        setCarryAmounts(amounts);
        setSelectedIds(selected);
      }
    } catch (err) {
      console.error('Error fetching carry forward data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setHasSearched(true);
    fetchCarryForwardData(formData.class, formData.section, formData.search);
  };

  const handleReset = () => {
    setFormData({ class: '', section: '', search: '' });
    setHasSearched(false);
    fetchCarryForwardData('', '', '');
  };

  const classOptions = useMemo(() => {
    return [
      { value: '', label: 'All Classes' },
      ...sortClassesAcademic(classes.map(c => ({ value: c.name, label: c.name })))
    ];
  }, [classes]);

  const availableSections = useMemo(() => {
    if (formData.class) {
      const selectedClassObj = classes.find(c => 
        c.name === formData.class || 
        normalizeClassName(c.name) === normalizeClassName(formData.class)
      );
      if (selectedClassObj?.sections && Array.isArray(selectedClassObj.sections) && selectedClassObj.sections.length > 0) {
        return [
          { value: '', label: 'All Sections' },
          ...selectedClassObj.sections.map(s => {
            const raw = typeof s === 'string' ? s : (s.name || '');
            const clean = raw.replace(/^section\s+/i, '');
            return { value: raw, label: `Section ${clean}` };
          })
        ];
      }
    }

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

    return [
      { value: '', label: 'All Sections' },
      ...Array.from(allSecSet).sort().map(s => {
        const clean = String(s).replace(/^section\s+/i, '');
        return { value: s, label: `Section ${clean}` };
      })
    ];
  }, [formData.class, classes, sections]);

  // Select / Deselect All
  const handleToggleSelectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map(s => s._id)));
    }
  };

  // Toggle single student
  const handleToggleStudent = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Update single student amount
  const handleAmountChange = (id, val) => {
    const num = Math.max(0, Number(val) || 0);
    setCarryAmounts(prev => ({ ...prev, [id]: num }));
  };

  // Submit Carry Forward batch
  const handleSubmitBatch = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one student to carry forward fees.');
      return;
    }

    const selectedStudents = students.filter(s => selectedIds.has(s._id));
    const items = selectedStudents.map(s => ({
      studentId: s._id,
      admissionNo: s.admissionNo,
      studentName: s.studentName,
      className: s.className,
      section: s.section,
      carryForwardAmount: carryAmounts[s._id] !== undefined ? carryAmounts[s._id] : (s.carryForwardAmount || 0)
    }));

    try {
      setIsSubmitting(true);
      const res = await api.post('/fees/carry-forward', { items });
      if (res?.success) {
        setActionMessage({
          type: 'success',
          text: `Successfully carried forward fees for ${items.length} students to new session!`
        });
        setTimeout(() => setActionMessage(null), 5000);
        // Refresh list
        fetchCarryForwardData(formData.class, formData.section, formData.search);
      } else {
        alert(res?.message || 'Failed to apply carry forward.');
      }
    } catch (err) {
      console.error('Carry forward save failed:', err);
      alert('Failed to save carry forward. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply single student carry forward
  const handleSaveSingle = async (st) => {
    const amount = carryAmounts[st._id] !== undefined ? carryAmounts[st._id] : (st.carryForwardAmount || 0);
    const item = {
      studentId: st._id,
      admissionNo: st.admissionNo,
      studentName: st.studentName,
      className: st.className,
      section: st.section,
      carryForwardAmount: amount
    };

    try {
      const res = await api.post('/fees/carry-forward', { items: [item] });
      if (res?.success) {
        setActionMessage({
          type: 'success',
          text: `Updated carry forward for ${st.studentName} (PKR ${amount.toLocaleString()})`
        });
        setTimeout(() => setActionMessage(null), 4000);
        fetchCarryForwardData(formData.class, formData.section, formData.search);
      }
    } catch (err) {
      alert('Failed to update student carry forward.');
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = students.length;
    const withArrears = students.filter(s => (s.previousBalance || 0) > 0).length;
    const totalArrears = students.reduce((acc, s) => acc + (Number(s.previousBalance) || 0), 0);
    const selectedCount = selectedIds.size;
    const selectedAmount = students
      .filter(s => selectedIds.has(s._id))
      .reduce((acc, s) => acc + (Number(carryAmounts[s._id] || 0)), 0);

    return { total, withArrears, totalArrears, selectedCount, selectedAmount };
  }, [students, selectedIds, carryAmounts]);

  // Export formatting
  const exportColumns = [
    { key: 'admissionNo', label: 'Admission No' },
    { key: 'rollNo', label: 'Roll No' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'fatherName', label: 'Father Name' },
    { key: 'classInfo', label: 'Class & Section' },
    { key: 'previousBalance', label: 'Previous Dues (PKR)' },
    { key: 'carryForwardAmount', label: 'Carry Forward Amount (PKR)' },
    { key: 'status', label: 'Status' }
  ];

  const exportData = students.map(s => ({
    admissionNo: s.admissionNo || '—',
    rollNo: s.rollNo || '—',
    studentName: s.studentName,
    fatherName: s.fatherName || '—',
    classInfo: `${s.className || '—'} (${s.section || '—'})`,
    previousBalance: s.previousBalance || 0,
    carryForwardAmount: carryAmounts[s._id] !== undefined ? carryAmounts[s._id] : (s.carryForwardAmount || 0),
    status: s.status || 'Cleared'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <ArrowRight className="h-6 w-6 text-[#084A86]" />
            Fees Carry Forward
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Roll over unpaid student dues, fee arrears, and remaining balances into the upcoming academic session.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <Link href="/dashboard/fees" className="hover:text-zinc-600 transition-colors">Fees</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Carry Forward</span>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Students</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.total}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Students with Arrears</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.withArrears}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Pending Dues</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">PKR {stats.totalArrears.toLocaleString()}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Selected to Forward</div>
            <div className="text-2xl font-black text-[#084A86] mt-1">
              PKR {stats.selectedAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">{stats.selectedCount} students selected</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FileCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Select Criteria Filter Box */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-visible">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
            <Search className="h-4 w-4 text-[#084A86]" />
            Select Criteria to Roll Over Fees
          </h2>
          <span className="text-xs text-zinc-500 font-medium">Session Arrears Transfer</span>
        </div>

        <form onSubmit={handleSearch} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Select Class</Label>
            <SearchableSelect
              options={classOptions}
              value={formData.class}
              onChange={e => {
                const newClass = e.target.value;
                setFormData(prev => ({ ...prev, class: newClass, section: '' }));
              }}
              placeholder="All Classes"
              name="class"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Select Section</Label>
            <SearchableSelect
              options={availableSections}
              value={formData.section}
              onChange={e => setFormData({ ...formData, section: e.target.value })}
              placeholder="All Sections"
              name="section"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 uppercase">Student Name or Admission No</Label>
            <Input
              value={formData.search}
              onChange={e => setFormData({ ...formData, search: e.target.value })}
              placeholder="Filter by name / admission no..."
              className="h-10 rounded-xl border-zinc-200 text-sm bg-white"
            />
          </div>

          <div className="md:col-span-3 flex justify-end gap-3 pt-2 border-t border-zinc-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset} 
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> RESET
            </Button>
            <Button 
              type="submit" 
              style={{ backgroundColor: '#084A86' }}
              className="hover:opacity-95 text-white font-semibold flex items-center gap-2 h-10 px-6 rounded-xl cursor-pointer"
            >
              <Search className="h-4 w-4" /> FILTER STUDENTS
            </Button>
          </div>
        </form>
      </div>

      {/* Main Carry Forward Table Card */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        {/* Table Top Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white shadow-xs cursor-pointer"
            >
              {selectedIds.size > 0 && selectedIds.size === students.length ? (
                <CheckSquare className="h-4 w-4 text-[#084A86]" />
              ) : (
                <Square className="h-4 w-4 text-zinc-400" />
              )}
              <span>{selectedIds.size === students.length ? 'Deselect All' : 'Select All'} ({selectedIds.size}/{students.length})</span>
            </button>
            <span className="text-xs text-zinc-500">
              Check students whose dues you wish to forward to the new session.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <TableExportToolbar
              data={exportData}
              columns={exportColumns}
              filename="Fees_Carry_Forward_Report"
            />
            <Button
              onClick={handleSubmitBatch}
              disabled={isSubmitting || selectedIds.size === 0}
              style={{ backgroundColor: '#084A86' }}
              className="hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Applying...' : `Apply Carry Forward (${selectedIds.size})`}
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">Select</th>
                <th className="px-4 py-3.5">Admission No</th>
                <th className="px-4 py-3.5">Roll No</th>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Class & Section</th>
                <th className="px-4 py-3.5">Father Name</th>
                <th className="px-4 py-3.5">Previous Balance</th>
                <th className="px-4 py-3.5">Carry Forward Amount (PKR)</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                      Loading student fee balances...
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-zinc-500">
                    No student records found matching the search criteria.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const isSelected = selectedIds.has(s._id);
                  const amount = carryAmounts[s._id] !== undefined ? carryAmounts[s._id] : (s.carryForwardAmount || 0);
                  const hasArrears = (s.previousBalance || 0) > 0;

                  return (
                    <tr 
                      key={s._id} 
                      className={`hover:bg-zinc-50/80 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleStudent(s._id)}
                          className="h-4 w-4 rounded border-zinc-300 text-[#084A86] focus:ring-[#084A86] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-bold text-zinc-900 font-mono text-xs">
                        {s.admissionNo || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 font-mono text-xs">
                        {s.rollNo || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-zinc-900">{s.studentName}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800">
                          {s.className || '—'} ({s.section || '—'})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 text-xs">
                        {s.fatherName || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`font-bold ${hasArrears ? 'text-rose-600' : 'text-zinc-500'}`}>
                          PKR {(s.previousBalance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 max-w-[160px]">
                          <span className="text-xs text-zinc-400 font-bold">PKR</span>
                          <Input
                            type="number"
                            min="0"
                            value={amount}
                            onChange={e => handleAmountChange(s._id, e.target.value)}
                            className="h-8 text-xs font-bold text-zinc-900 bg-white border-zinc-200 rounded-lg focus-visible:ring-[#084A86]"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          hasArrears
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {hasArrears ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                          {s.status || (hasArrears ? 'Pending Arrears' : 'Cleared')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          onClick={() => handleSaveSingle(s)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs font-semibold border-zinc-200 text-[#084A86] hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                          title="Save Carry Forward for this student"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 gap-2 bg-zinc-50/30">
          <div>
            Showing <span className="font-bold text-zinc-900">{students.length}</span> students &bull; <span className="font-bold text-rose-600">{stats.withArrears}</span> with pending balance
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-600 font-semibold">Selected for Carry Forward:</span>
            <span className="font-bold text-[#084A86]">
              {selectedIds.size} students (PKR {stats.selectedAmount.toLocaleString()})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
