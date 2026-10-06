'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Search, 
  Printer, 
  CreditCard, 
  User, 
  Users,
  CheckSquare, 
  Square, 
  Building, 
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  QrCode,
  Sparkles,
  Layers,
  X,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { sortClassesAcademic } from '@/lib/academicUtils';
import api from '@/services/api';

const THEME_CONFIGS = {
  'stoofi-emerald': {
    headerBg: 'bg-emerald-800 text-white',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accentBorder: 'border-emerald-700',
    accentText: 'text-emerald-700',
    accentRing: 'ring-emerald-500'
  },
  'classic-navy': {
    headerBg: 'bg-sky-950 text-white',
    badgeBg: 'bg-sky-50 text-sky-900 border-sky-200',
    accentBorder: 'border-sky-900',
    accentText: 'text-sky-900',
    accentRing: 'ring-sky-600'
  },
  'royal-purple': {
    headerBg: 'bg-indigo-950 text-white',
    badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    accentBorder: 'border-indigo-800',
    accentText: 'text-indigo-900',
    accentRing: 'ring-indigo-600'
  },
  'modern-slate': {
    headerBg: 'bg-zinc-950 text-white',
    badgeBg: 'bg-zinc-100 text-zinc-900 border-zinc-200',
    accentBorder: 'border-zinc-800',
    accentText: 'text-zinc-900',
    accentRing: 'ring-zinc-600'
  }
};

export default function BulkPrintIdCardPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [role, setRole] = useState('Student');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolSetting, setSchoolSetting] = useState(null);

  // Layout & View Options
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [previewCard, setPreviewCard] = useState(null);

  // Active Template Settings
  const activeTemplate = useMemo(() => {
    if (selectedTemplateId) {
      const found = templates.find(t => t._id === selectedTemplateId);
      if (found) return found;
    }
    // Default fallback structure
    return {
      title: `${role} Standard ID Card`,
      role: role,
      cardLayout: 'vertical',
      themeStyle: 'stoofi-emerald',
      headerText: 'OFFICIAL IDENTITY CARD',
      footerText: 'Authorized Principal Signature',
      showPhoto: true,
      showAdmissionNo: true,
      showRollNo: true,
      showClass: true,
      showSection: true,
      showFatherName: true,
      showPhone: true,
      showBloodGroup: true,
      showDob: true,
      showDesignation: true,
      showDepartment: true,
      showQrBarcode: true
    };
  }, [templates, selectedTemplateId, role]);

  // Initial Fetch
  useEffect(() => {
    fetchMetadata();
  }, []);

  // When role changes, auto-select matching template and refresh records
  useEffect(() => {
    const matchingTemplate = templates.find(t => t.role === role && t.status === 'Active');
    if (matchingTemplate) {
      setSelectedTemplateId(matchingTemplate._id);
    }
    executeSearch(role, classFilter, sectionFilter);
  }, [role, templates]);

  const fetchMetadata = async () => {
    try {
      const [tplRes, clsRes, secRes, setRes] = await Promise.all([
        api.get('/id-card?status=Active').catch(() => null),
        api.get('/class').catch(() => null),
        api.get('/section').catch(() => null),
        api.get('/setting').catch(() => null)
      ]);

      if (tplRes?.success && Array.isArray(tplRes.data)) {
        setTemplates(tplRes.data);
        const defaultTpl = tplRes.data.find(t => t.role === 'Student') || tplRes.data[0];
        if (defaultTpl) setSelectedTemplateId(defaultTpl._id);
      }

      if (clsRes?.success && Array.isArray(clsRes.data)) {
        setClasses(sortClassesAcademic(clsRes.data.map(c => c.name || c)));
      }

      if (secRes?.success && Array.isArray(secRes.data)) {
        setSections(secRes.data.map(s => s.name || s));
      }

      if (setRes?.success && setRes.data) {
        setSchoolSetting(setRes.data);
      }
    } catch (err) {
      console.error('Error loading metadata for ID cards:', err);
    }
  };

  const executeSearch = async (selectedRole = role, selectedClass = classFilter, selectedSection = sectionFilter) => {
    setLoading(true);
    try {
      let list = [];
      if (selectedRole === 'Student') {
        const params = new URLSearchParams({ limit: '1000' });
        if (selectedClass) params.append('className', selectedClass);
        if (selectedSection) params.append('section', selectedSection);

        const res = await api.get(`/student?${params.toString()}`).catch(() => null);
        if (res?.success && Array.isArray(res.data)) {
          list = res.data;
        }
      } else {
        const params = new URLSearchParams({ limit: '1000' });
        if (selectedRole === 'Teacher') params.append('role', 'Teacher');

        const res = await api.get(`/staff?${params.toString()}`).catch(() => null);
        if (res?.success && Array.isArray(res.data)) {
          list = res.data;
        }
      }

      setRecords(list);
      setSelectedIds(list.map(r => r._id));
    } catch (error) {
      console.error('Error fetching records for ID cards:', error);
      setRecords([]);
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(role, classFilter, sectionFilter);
  };

  const handleResetFilters = () => {
    setClassFilter('');
    setSectionFilter('');
    setSearchQuery('');
    executeSearch(role, '', '');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r._id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered records by live search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const query = searchQuery.toLowerCase().trim();
    return records.filter(r => {
      const name = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
      const adm = String(r.admissionNo || r.staffNo || '').toLowerCase();
      const roll = String(r.rollNo || '').toLowerCase();
      const phone = String(r.phone || r.mobile || '').toLowerCase();
      const cls = String(r.className || r.department || '').toLowerCase();
      return name.includes(query) || adm.includes(query) || roll.includes(query) || phone.includes(query) || cls.includes(query);
    });
  }, [records, searchQuery]);

  const selectedRecords = filteredRecords.filter(r => selectedIds.includes(r._id));
  const theme = THEME_CONFIGS[activeTemplate.themeStyle] || THEME_CONFIGS['stoofi-emerald'];
  const schoolName = schoolSetting?.schoolName || 'Stoofi Public School & College';
  const schoolAddress = schoolSetting?.address || schoolSetting?.city || 'Main Campus, Pakistan';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            Generate & Print ID Cards
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Search, customize template layout, and batch-print official identity cards for students and faculty.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/id-card">
            <Button variant="outline" className="border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold h-9 flex items-center gap-1.5 shadow-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
              Manage Templates ({templates.length})
            </Button>
          </Link>
          <div className="hidden md:flex items-center text-xs text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span>Admin</span>
            <ChevronRight className="h-3.5 w-3.5 mx-1" />
            <span className="text-zinc-900 font-semibold">Generate ID Cards</span>
          </div>
        </div>
      </div>

      {/* Criteria & Search Filters */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-5 print:hidden">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Search Criteria & Template Selection</h2>
          </div>
          <span className="text-xs text-zinc-400">Real-time MongoDB database connection</span>
        </div>

        <form onSubmit={handleSearchSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Role Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700">Target Role <span className="text-rose-500">*</span></Label>
              <SearchableSelect
                name="role"
                value={role} 
                onChange={e => setRole(e.target.value)} 
                options={[
                  { value: 'Student', label: 'Student' },
                  { value: 'Teacher', label: 'Teacher' },
                  { value: 'Staff', label: 'Staff / Faculty' }
                ]}
              />
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700">ID Card Template</Label>
              <SearchableSelect
                name="selectedTemplateId"
                value={selectedTemplateId} 
                onChange={e => setSelectedTemplateId(e.target.value)} 
                options={[
                  ...templates.filter(t => t.role === role).map(t => ({ value: t._id, label: `${t.title} (${t.cardLayout})` })),
                  ...(templates.filter(t => t.role === role).length === 0 ? [{ value: '', label: `Default ${role} Template` }] : [])
                ]}
                placeholder={`Select ${role} Template`}
              />
            </div>

            {/* Class Filter (For Student) */}
            {role === 'Student' ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">Class</Label>
                <SearchableSelect
                  name="classFilter"
                  value={classFilter} 
                  onChange={e => setClassFilter(e.target.value)}
                  options={[{ value: '', label: 'All Classes' }, ...classes.map(c => ({ value: c, label: c }))]}
                  placeholder="All Classes"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">Department</Label>
                <Input 
                  placeholder="e.g. Science, Admin..."
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {/* Section Filter (For Student) */}
            {role === 'Student' ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">Section</Label>
                <SearchableSelect
                  name="sectionFilter"
                  value={sectionFilter} 
                  onChange={e => setSectionFilter(e.target.value)} 
                  options={[{ value: '', label: 'All Sections' }, ...sections.map(s => ({ value: s, label: s }))]}
                  placeholder="All Sections"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">Keyword Search</Label>
                <Input 
                  placeholder="Search name or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 text-xs shadow-xs flex items-center justify-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" /> 
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="h-9 px-3 text-xs border-zinc-200 hover:bg-zinc-100 text-zinc-600"
                title="Reset Filters"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Action Bar & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-zinc-200 shadow-xs rounded-xl p-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <button 
            type="button" 
            onClick={toggleSelectAll} 
            className="flex items-center gap-2 text-xs font-semibold text-zinc-800 hover:text-zinc-950 cursor-pointer"
          >
            {selectedIds.length === filteredRecords.length && filteredRecords.length > 0 ? (
              <CheckSquare className="h-4 w-4 text-emerald-600" />
            ) : (
              <Square className="h-4 w-4 text-zinc-400" />
            )}
            Select All ({filteredRecords.length})
          </button>
          <span className="text-zinc-300">|</span>
          <span className="text-xs text-zinc-600">
            Selected for Printing: <strong className="text-emerald-700 font-bold">{selectedIds.length}</strong> of {filteredRecords.length}
          </span>
          <span className="text-zinc-300">|</span>
          <span className="text-xs text-zinc-500">
            Template: <strong className="text-zinc-800 font-semibold">{activeTemplate.title}</strong> ({activeTemplate.cardLayout})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Badge Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === 'table' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              List View
            </button>
          </div>

          <Button 
            onClick={handlePrint} 
            disabled={selectedRecords.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 shadow-xs flex items-center gap-1.5 px-4"
          >
            <Printer className="h-4 w-4" />
            Print Selected ({selectedIds.length})
          </Button>
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-16 text-center print:hidden">
          <RefreshCw className="h-8 w-8 mx-auto mb-3 text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-zinc-800">Fetching {role} records from MongoDB...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl p-16 text-center text-zinc-500 print:hidden">
          <User className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <p className="text-base font-bold text-zinc-800">No {role} records found</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            No active {role.toLowerCase()} records match your current filter criteria in the database. Add records in the Student or Staff directory to generate cards.
          </p>
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
            className="mt-4 border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <button type="button" onClick={toggleSelectAll}>
                      {selectedIds.length === filteredRecords.length && filteredRecords.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Square className="h-4 w-4 text-zinc-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Photo & Name</th>
                  <th className="py-3 px-4">{role === 'Student' ? 'Adm No / Roll No' : 'Staff ID / Role'}</th>
                  <th className="py-3 px-4">{role === 'Student' ? 'Class & Section' : 'Department'}</th>
                  <th className="py-3 px-4">{role === 'Student' ? 'Father Name' : 'Designation'}</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRecords.map(rec => {
                  const isSelected = selectedIds.includes(rec._id);
                  const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'N/A';
                  const photo = rec.photo || rec.studentPhoto || rec.staffPhoto;
                  const phone = rec.phone || rec.mobile || rec.guardianPhone || '—';

                  return (
                    <tr 
                      key={rec._id} 
                      onClick={() => toggleSelect(rec._id)}
                      className={`hover:bg-zinc-50/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => toggleSelect(rec._id)}>
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Square className="h-4 w-4 text-zinc-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-900 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
                          {photo ? (
                            <img src={photo.startsWith('http') || photo.startsWith('data:') ? photo : `http://localhost:5000/${photo}`} alt={name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs text-zinc-600">{name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{name}</p>
                          <p className="text-[10px] text-zinc-400">{rec.gender || 'Regular'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-700">
                        {role === 'Student' ? (
                          <div>
                            <span className="font-bold text-zinc-900">{rec.admissionNo || '—'}</span>
                            {rec.rollNo && <span className="text-[10px] text-zinc-400 ml-1.5">(Roll: {rec.rollNo})</span>}
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-zinc-900">{rec.staffNo || rec.admissionNo || '—'}</span>
                            <span className="text-[10px] text-zinc-400 ml-1.5">({rec.role || 'Faculty'})</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-700">
                        {role === 'Student' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-800">
                            {rec.className || '—'} {rec.section ? `(${rec.section})` : ''}
                          </span>
                        ) : (
                          <span>{rec.department || 'Academics'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-700">
                        {role === 'Student' ? (rec.fatherName || '—') : (rec.designation || 'Faculty Member')}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 font-mono text-[11px]">
                        {phone}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPreviewCard(rec)}
                          className="h-7 text-xs text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50 px-2"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Badge Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecords.map(rec => {
            const isSelected = selectedIds.includes(rec._id);
            const name = `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || rec.name || 'Cardholder Name';
            const photo = rec.photo || rec.studentPhoto || rec.staffPhoto;
            const phone = rec.phone || rec.mobile || rec.guardianPhone || schoolSetting?.phone || '—';

            return (
              <div 
                key={rec._id} 
                onClick={() => toggleSelect(rec._id)}
                className={`relative cursor-pointer transition-all duration-200 group ${
                  isSelected ? `ring-2 ${theme.accentRing} rounded-2xl shadow-lg scale-[1.01]` : 'opacity-65 hover:opacity-95 hover:shadow-md'
                } ${!isSelected ? 'print:hidden' : ''}`}
              >
                {/* Floating Select Badge */}
                <div className="absolute top-2.5 right-2.5 z-10 print:hidden">
                  {isSelected ? (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Selected
                    </span>
                  ) : (
                    <span className="bg-zinc-900/70 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Click to Select
                    </span>
                  )}
                </div>

                {/* Single Quick Preview Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewCard(rec);
                  }}
                  className="absolute bottom-2.5 right-2.5 z-10 print:hidden bg-white/90 hover:bg-white text-zinc-700 hover:text-emerald-700 text-[10px] font-semibold px-2 py-1 rounded-md shadow-xs border border-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" /> Inspect
                </button>

                {/* ID Card Graphic Container */}
                {activeTemplate.cardLayout === 'horizontal' ? (
                  /* Horizontal ID Card Badge */
                  <div className="bg-white text-zinc-900 rounded-xl overflow-hidden shadow-xs border border-zinc-300 w-full h-[240px] flex flex-col justify-between select-none">
                    {/* Header */}
                    <div className={`${theme.headerBg} px-3 py-2 flex items-center justify-between border-b ${theme.accentBorder}`}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-white/10 flex items-center justify-center font-bold text-xs uppercase text-white">
                          SP
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs leading-tight uppercase tracking-tight text-white">{schoolName}</h3>
                          <p className="text-[9px] text-white/75 truncate">{activeTemplate.headerText || 'Official Identity Card'}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                        {role}
                      </span>
                    </div>

                    {/* Horizontal Body */}
                    <div className="p-3 flex items-center gap-3.5 flex-1 bg-white">
                      {/* Photo */}
                      {activeTemplate.showPhoto && (
                        <div className="w-20 h-24 rounded-lg border-2 border-zinc-200 overflow-hidden bg-zinc-50 shadow-inner shrink-0 flex items-center justify-center">
                          {photo ? (
                            <img src={photo.startsWith('http') || photo.startsWith('data:') ? photo : `http://localhost:5000/${photo}`} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold text-zinc-400">{name.charAt(0)}</span>
                          )}
                        </div>
                      )}

                      {/* Info Columns */}
                      <div className="flex-1 min-w-0 text-[11px] space-y-1">
                        <h4 className="font-extrabold text-sm text-zinc-950 truncate">{name}</h4>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-zinc-600">
                          {role === 'Student' ? (
                            <>
                              {activeTemplate.showAdmissionNo && <div><span className="text-zinc-400 font-medium">Adm No:</span> <strong className="text-zinc-900">{rec.admissionNo || '—'}</strong></div>}
                              {activeTemplate.showRollNo && <div><span className="text-zinc-400 font-medium">Roll No:</span> <strong className="text-zinc-900">{rec.rollNo || '—'}</strong></div>}
                              {activeTemplate.showClass && <div><span className="text-zinc-400 font-medium">Class:</span> <strong className="text-zinc-900">{rec.className || '—'}</strong></div>}
                              {activeTemplate.showSection && <div><span className="text-zinc-400 font-medium">Section:</span> <strong className="text-zinc-900">{rec.section || '—'}</strong></div>}
                              {activeTemplate.showFatherName && <div className="col-span-2 truncate"><span className="text-zinc-400 font-medium">Father:</span> <strong className="text-zinc-900">{rec.fatherName || '—'}</strong></div>}
                            </>
                          ) : (
                            <>
                              {activeTemplate.showAdmissionNo && <div><span className="text-zinc-400 font-medium">Staff ID:</span> <strong className="text-zinc-900">{rec.staffNo || rec.admissionNo || '—'}</strong></div>}
                              {activeTemplate.showDesignation && <div className="truncate"><span className="text-zinc-400 font-medium">Desig:</span> <strong className="text-zinc-900">{rec.designation || 'Faculty'}</strong></div>}
                              {activeTemplate.showDepartment && <div className="col-span-2 truncate"><span className="text-zinc-400 font-medium">Dept:</span> <strong className="text-zinc-900">{rec.department || 'Academics'}</strong></div>}
                            </>
                          )}
                          {activeTemplate.showPhone && <div className="col-span-2 truncate"><span className="text-zinc-400 font-medium">Phone:</span> <strong className="text-zinc-900">{phone}</strong></div>}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-zinc-50 px-3 py-1.5 text-[9px] text-zinc-500 flex justify-between items-center border-t border-zinc-200">
                      <span className="truncate">{schoolAddress}</span>
                      <span className="font-bold text-zinc-700 shrink-0">{activeTemplate.footerText || 'Principal Sign'}</span>
                    </div>
                  </div>
                ) : (
                  /* Vertical ID Card Badge (Standard) */
                  <div className="bg-white text-zinc-900 rounded-2xl overflow-hidden shadow-xs border border-zinc-300 w-full max-w-[320px] mx-auto h-[460px] flex flex-col justify-between select-none">
                    {/* Header */}
                    <div className={`${theme.headerBg} p-3.5 text-center relative border-b ${theme.accentBorder}`}>
                      <div className="text-[9px] uppercase font-extrabold tracking-widest text-white/80">{activeTemplate.headerText || 'OFFICIAL IDENTITY CARD'}</div>
                      <h3 className="font-extrabold text-sm leading-tight mt-0.5 truncate text-white">{schoolName}</h3>
                      <p className="text-[9px] text-white/70 truncate">{schoolAddress}</p>
                    </div>

                    {/* Body */}
                    <div className="p-3.5 flex flex-col items-center text-center flex-1 bg-white">
                      {/* Photo Avatar */}
                      {activeTemplate.showPhoto && (
                        <div className="w-20 h-20 rounded-full border-2 border-zinc-200 overflow-hidden bg-zinc-50 shadow-sm mb-2.5 flex items-center justify-center shrink-0">
                          {photo ? (
                            <img src={photo.startsWith('http') || photo.startsWith('data:') ? photo : `http://localhost:5000/${photo}`} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-2xl font-extrabold text-zinc-600 uppercase">{name.charAt(0)}</div>
                          )}
                        </div>
                      )}

                      <h4 className="font-extrabold text-base text-zinc-950 leading-tight truncate max-w-[240px]">{name}</h4>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase border ${theme.badgeBg}`}>
                        {role}
                      </span>

                      {/* Details Box */}
                      <div className="w-full mt-3 space-y-1 text-[11px] text-left bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                        {role === 'Student' ? (
                          <>
                            {activeTemplate.showAdmissionNo && (
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Adm No:</span><span className="font-bold text-zinc-900">{rec.admissionNo || '—'}</span></div>
                            )}
                            {activeTemplate.showClass && (
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Class / Sec:</span><span className="font-bold text-zinc-900">{rec.className || '—'} {rec.section ? `(${rec.section})` : ''}</span></div>
                            )}
                            {activeTemplate.showRollNo && (
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Roll No:</span><span className="font-bold text-zinc-900">{rec.rollNo || '—'}</span></div>
                            )}
                            {activeTemplate.showFatherName && (
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Father:</span><span className="font-bold text-zinc-900 truncate max-w-[130px]">{rec.fatherName || '—'}</span></div>
                            )}
                            {activeTemplate.showBloodGroup && rec.bloodGroup && (
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Blood Group:</span><span className="font-bold text-rose-600">{rec.bloodGroup}</span></div>
                            )}
                          </>
                        ) : (
                          <>
                            {activeTemplate.showAdmissionNo && (
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Staff ID:</span><span className="font-bold text-zinc-900">{rec.staffNo || rec.admissionNo || '—'}</span></div>
                            )}
                            {activeTemplate.showDesignation && (
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Designation:</span><span className="font-bold text-zinc-900">{rec.designation || 'Faculty'}</span></div>
                            )}
                            {activeTemplate.showDepartment && (
                              <div className="flex justify-between"><span className="text-zinc-500 font-medium">Department:</span><span className="font-bold text-zinc-900">{rec.department || 'Academics'}</span></div>
                            )}
                          </>
                        )}
                        {activeTemplate.showPhone && (
                          <div className="flex justify-between"><span className="text-zinc-500 font-medium">Phone:</span><span className="font-bold text-zinc-900 font-mono text-[10px]">{phone}</span></div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-zinc-50 px-3.5 py-2 text-[10px] text-zinc-500 flex justify-between items-center border-t border-zinc-200">
                      <div className="flex items-center gap-1 font-mono text-[9px]">
                        {activeTemplate.showQrBarcode && <QrCode className="h-4 w-4 text-zinc-700" />}
                        <span>VALID ID</span>
                      </div>
                      <span className="font-bold text-zinc-800 text-[9px]">{activeTemplate.footerText || 'Principal Signature'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Single Inspection / Preview Modal */}
      {previewCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-zinc-900">ID Card Preview — {previewCard.firstName} {previewCard.lastName}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewCard(null)} 
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center bg-zinc-100/60 overflow-y-auto">
              {/* Render High Res Card */}
              <div className="bg-white text-zinc-900 rounded-2xl overflow-hidden shadow-xl border border-zinc-300 w-full max-w-[340px] h-[480px] flex flex-col justify-between">
                <div className={`${theme.headerBg} p-4 text-center relative border-b ${theme.accentBorder}`}>
                  <div className="text-[10px] uppercase font-extrabold tracking-widest text-white/80">{activeTemplate.headerText || 'OFFICIAL IDENTITY CARD'}</div>
                  <h3 className="font-extrabold text-base leading-tight mt-0.5 truncate text-white">{schoolName}</h3>
                  <p className="text-[10px] text-white/70 truncate">{schoolAddress}</p>
                </div>

                <div className="p-4 flex flex-col items-center text-center flex-1 bg-white">
                  {activeTemplate.showPhoto && (
                    <div className="w-24 h-24 rounded-full border-2 border-zinc-200 overflow-hidden bg-zinc-50 shadow-md mb-3 flex items-center justify-center">
                      {(previewCard.photo || previewCard.studentPhoto || previewCard.staffPhoto) ? (
                        <img 
                          src={(previewCard.photo || previewCard.studentPhoto || previewCard.staffPhoto).startsWith('http') || (previewCard.photo || previewCard.studentPhoto || previewCard.staffPhoto).startsWith('data:') 
                            ? (previewCard.photo || previewCard.studentPhoto || previewCard.staffPhoto) 
                            : `http://localhost:5000/${previewCard.photo || previewCard.studentPhoto || previewCard.staffPhoto}`} 
                          alt="ID Photo" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="text-3xl font-extrabold text-zinc-600 uppercase">{previewCard.firstName?.charAt(0) || 'U'}</div>
                      )}
                    </div>
                  )}

                  <h4 className="font-extrabold text-lg text-zinc-950 leading-tight">{previewCard.firstName} {previewCard.lastName}</h4>
                  <span className={`inline-block mt-1 px-3 py-0.5 text-xs font-extrabold rounded-full uppercase border ${theme.badgeBg}`}>
                    {role}
                  </span>

                  <div className="w-full mt-4 space-y-1.5 text-xs text-left bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                    {role === 'Student' ? (
                      <>
                        <div className="flex justify-between"><span className="text-zinc-500 font-medium">Admission No:</span><span className="font-bold text-zinc-900">{previewCard.admissionNo || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500 font-medium">Class & Section:</span><span className="font-bold text-zinc-900">{previewCard.className || '—'} {previewCard.section ? `(${previewCard.section})` : ''}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500 font-medium">Roll Number:</span><span className="font-bold text-zinc-900">{previewCard.rollNo || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500 font-medium">Father Name:</span><span className="font-bold text-zinc-900 truncate max-w-[150px]">{previewCard.fatherName || '—'}</span></div>
                        {previewCard.bloodGroup && (
                          <div className="flex justify-between"><span className="text-zinc-500 font-medium">Blood Group:</span><span className="font-bold text-rose-600">{previewCard.bloodGroup}</span></div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between"><span className="text-zinc-500 font-medium">Staff ID:</span><span className="font-bold text-zinc-900">{previewCard.staffNo || previewCard.admissionNo || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500 font-medium">Designation:</span><span className="font-bold text-zinc-900">{previewCard.designation || 'Faculty'}</span></div>
                        <div className="flex justify-between"><span className="text-zinc-500 font-medium">Department:</span><span className="font-bold text-zinc-900">{previewCard.department || 'Academics'}</span></div>
                      </>
                    )}
                    <div className="flex justify-between"><span className="text-zinc-500 font-medium">Emergency:</span><span className="font-bold text-zinc-900 font-mono text-[11px]">{previewCard.phone || previewCard.mobile || previewCard.guardianPhone || '—'}</span></div>
                  </div>
                </div>

                <div className="bg-zinc-50 px-4 py-2.5 text-[10px] text-zinc-500 flex justify-between items-center border-t border-zinc-200">
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <QrCode className="h-4 w-4 text-zinc-700" />
                    <span>STO-ID-{previewCard._id?.substring(previewCard._id.length - 6).toUpperCase()}</span>
                  </div>
                  <span className="font-bold text-zinc-800">{activeTemplate.footerText || 'Principal Signature'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 flex items-center justify-end gap-2 bg-white">
              <Button 
                variant="outline" 
                onClick={() => setPreviewCard(null)}
                className="h-9 text-xs border-zinc-200 text-zinc-700"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setSelectedIds([previewCard._id]);
                  setTimeout(() => window.print(), 200);
                }}
                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Print Single Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print-Only Optimization Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, aside, header, footer, .sidebar, .navbar, .print\\:hidden {
            display: none !important;
          }
          .grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
            page-break-inside: avoid;
          }
          .rounded-2xl, .rounded-xl {
            border-radius: 8px !important;
            box-shadow: none !important;
            border: 1px solid #d4d4d8 !important;
          }
        }
      `}</style>
    </div>
  );
}
