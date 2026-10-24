'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Layers, 
  Award, 
  Building2, 
  Calendar, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  BookOpen,
  DollarSign,
  FileCheck
} from 'lucide-react';
import academicApi from '@/lib/academicApi';

export default function AcademicProgramsPage() {
  const [activeTab, setActiveTab] = useState('offerings');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Data collections
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [affiliations, setAffiliations] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [batches, setBatches] = useState([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'offering' | 'program' | 'category' | 'affiliation' | 'batch'
  const [editingItem, setEditingItem] = useState(null);

  // Form data for modals
  const [offeringForm, setOfferingForm] = useState({
    programId: '',
    campusId: '',
    affiliationId: '',
    sessionId: '',
    curriculumVersion: 'Standard 2026 v1.0',
    seatCapacity: 60,
    admissionStartDate: '',
    admissionEndDate: '',
    status: 'Approved',
    feePlan: {
      admissionFee: 5000,
      tuitionFeePerTerm: 25000,
      registrationFee: 3000,
      labPracticalFee: 2000,
      examFee: 2000,
      libraryFee: 1000,
      totalEstimate: 38000,
      installmentsAllowed: true,
      installmentsCount: 2
    }
  });

  const [programForm, setProgramForm] = useState({
    name: '',
    code: '',
    qualificationName: '',
    category: '',
    department: 'Academics',
    description: '',
    academicPattern: 'Annual',
    defaultDuration: '2 Years',
    totalStages: 2,
    stageType: 'Part',
    status: 'Active'
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    code: '',
    description: '',
    applicableStageType: 'Semester',
    displayOrder: 1,
    status: 'Active'
  });

  const [affiliationForm, setAffiliationForm] = useState({
    name: '',
    code: '',
    type: 'Technical Board',
    approvalReference: '',
    validityFrom: '',
    validityTo: '',
    authorizationStatus: 'Approved',
    contactPerson: '',
    contactPhone: '',
    contactEmail: ''
  });

  const [batchForm, setBatchForm] = useState({
    name: '',
    code: '',
    offeringId: '',
    shift: 'Morning',
    capacity: 60,
    coordinatorName: '',
    roomNumber: '',
    sections: 'A, B'
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [catRes, progRes, affRes, campRes, sessRes, offRes, batchRes] = await Promise.allSettled([
        academicApi.getCategories(),
        academicApi.getPrograms(),
        academicApi.getAffiliations(),
        academicApi.getCampuses(),
        academicApi.getSessions(),
        academicApi.getOfferings(),
        academicApi.getBatches()
      ]);

      if (catRes.status === 'fulfilled' && catRes.value?.data) setCategories(catRes.value.data);
      if (progRes.status === 'fulfilled' && progRes.value?.data) setPrograms(progRes.value.data);
      if (affRes.status === 'fulfilled' && affRes.value?.data) setAffiliations(affRes.value.data);
      if (campRes.status === 'fulfilled' && campRes.value?.data) setCampuses(campRes.value.data);
      if (sessRes.status === 'fulfilled' && sessRes.value?.data) setSessions(sessRes.value.data);
      if (offRes.status === 'fulfilled' && offRes.value?.data) setOfferings(offRes.value.data);
      if (batchRes.status === 'fulfilled' && batchRes.value?.data) setBatches(batchRes.value.data);
    } catch (err) {
      console.error('Error loading academic data:', err);
      setMessage({ type: 'error', text: 'Failed to load academic data. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // ── Modals Handlers ────────────────────────────────────────────────────────
  const openOfferingModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setOfferingForm({
        programId: item.programId?._id || item.programId || '',
        campusId: item.campusId?._id || item.campusId || '',
        affiliationId: item.affiliationId?._id || item.affiliationId || '',
        sessionId: item.sessionId?._id || item.sessionId || '',
        curriculumVersion: item.curriculumVersion || 'Standard 2026 v1.0',
        seatCapacity: item.seatCapacity || 60,
        admissionStartDate: item.admissionStartDate || '',
        admissionEndDate: item.admissionEndDate || '',
        status: item.status || 'Approved',
        feePlan: item.feePlan || {
          admissionFee: 5000,
          tuitionFeePerTerm: 25000,
          registrationFee: 3000,
          labPracticalFee: 2000,
          examFee: 2000,
          libraryFee: 1000,
          totalEstimate: 38000,
          installmentsAllowed: true,
          installmentsCount: 2
        }
      });
    } else {
      setEditingItem(null);
      setOfferingForm({
        programId: programs[0]?._id || '',
        campusId: campuses[0]?._id || '',
        affiliationId: affiliations[0]?._id || '',
        sessionId: sessions.find(s => s.isCurrent)?._id || sessions[0]?._id || '',
        curriculumVersion: 'Standard 2026 v1.0',
        seatCapacity: 60,
        admissionStartDate: '',
        admissionEndDate: '',
        status: 'Approved',
        feePlan: {
          admissionFee: 5000,
          tuitionFeePerTerm: 25000,
          registrationFee: 3000,
          labPracticalFee: 2000,
          examFee: 2000,
          libraryFee: 1000,
          totalEstimate: 38000,
          installmentsAllowed: true,
          installmentsCount: 2
        }
      });
    }
    setModalType('offering');
  };

  const handleSaveOffering = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const total = Number(offeringForm.feePlan.admissionFee || 0) +
        Number(offeringForm.feePlan.tuitionFeePerTerm || 0) +
        Number(offeringForm.feePlan.registrationFee || 0) +
        Number(offeringForm.feePlan.labPracticalFee || 0) +
        Number(offeringForm.feePlan.examFee || 0) +
        Number(offeringForm.feePlan.libraryFee || 0);

      const payload = {
        ...offeringForm,
        feePlan: {
          ...offeringForm.feePlan,
          totalEstimate: total
        }
      };

      if (editingItem) {
        await academicApi.updateOffering(editingItem._id, payload);
        showMsg('success', 'Program Offering updated successfully!');
      } else {
        await academicApi.createOffering(payload);
        showMsg('success', 'New Program Offering created successfully!');
      }
      setModalType(null);
      loadAllData();
    } catch (err) {
      showMsg('error', err?.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOffering = async (id, title) => {
    if (!confirm(`Are you sure you want to delete offering "${title}"?`)) return;
    try {
      setActionLoading(true);
      await academicApi.deleteOffering(id);
      showMsg('success', 'Offering deleted successfully.');
      loadAllData();
    } catch (err) {
      showMsg('error', err?.response?.data?.message || err.message || 'Delete failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Program Modal
  const openProgramModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setProgramForm({
        name: item.name || '',
        code: item.code || '',
        qualificationName: item.qualificationName || '',
        category: item.category?._id || item.category || '',
        department: item.department || 'Academics',
        description: item.description || '',
        academicPattern: item.academicPattern || 'Annual',
        defaultDuration: item.defaultDuration || '2 Years',
        totalStages: item.totalStages || 2,
        stageType: item.stageType || 'Part',
        status: item.status || 'Active'
      });
    } else {
      setEditingItem(null);
      setProgramForm({
        name: '',
        code: '',
        qualificationName: '',
        category: categories[0]?._id || '',
        department: 'Academics',
        description: '',
        academicPattern: 'Annual',
        defaultDuration: '2 Years',
        totalStages: 2,
        stageType: 'Part',
        status: 'Active'
      });
    }
    setModalType('program');
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingItem) {
        await academicApi.updateProgram(editingItem._id, programForm);
        showMsg('success', 'Program updated successfully!');
      } else {
        await academicApi.createProgram(programForm);
        showMsg('success', 'New Program created successfully!');
      }
      setModalType(null);
      loadAllData();
    } catch (err) {
      showMsg('error', err?.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Category Modal
  const openCategoryModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setCategoryForm({
        name: item.name || '',
        code: item.code || '',
        description: item.description || '',
        applicableStageType: item.applicableStageType || 'Semester',
        displayOrder: item.displayOrder || 1,
        status: item.status || 'Active'
      });
    } else {
      setEditingItem(null);
      setCategoryForm({
        name: '',
        code: '',
        description: '',
        applicableStageType: 'Semester',
        displayOrder: categories.length + 1,
        status: 'Active'
      });
    }
    setModalType('category');
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingItem) {
        await academicApi.updateCategory(editingItem._id, categoryForm);
        showMsg('success', 'Category updated successfully!');
      } else {
        await academicApi.createCategory(categoryForm);
        showMsg('success', 'New Category added successfully!');
      }
      setModalType(null);
      loadAllData();
    } catch (err) {
      showMsg('error', err?.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Affiliation Modal
  const openAffiliationModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setAffiliationForm({
        name: item.name || '',
        code: item.code || '',
        type: item.type || 'Technical Board',
        approvalReference: item.approvalReference || '',
        validityFrom: item.validityFrom || '',
        validityTo: item.validityTo || '',
        authorizationStatus: item.authorizationStatus || 'Approved',
        contactPerson: item.contactPerson || '',
        contactPhone: item.contactPhone || '',
        contactEmail: item.contactEmail || ''
      });
    } else {
      setEditingItem(null);
      setAffiliationForm({
        name: '',
        code: '',
        type: 'Technical Board',
        approvalReference: '',
        validityFrom: '',
        validityTo: '',
        authorizationStatus: 'Approved',
        contactPerson: '',
        contactPhone: '',
        contactEmail: ''
      });
    }
    setModalType('affiliation');
  };

  const handleSaveAffiliation = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingItem) {
        await academicApi.updateAffiliation(editingItem._id, affiliationForm);
        showMsg('success', 'Affiliation updated successfully!');
      } else {
        await academicApi.createAffiliation(affiliationForm);
        showMsg('success', 'New Affiliation registered successfully!');
      }
      setModalType(null);
      loadAllData();
    } catch (err) {
      showMsg('error', err?.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Offerings
  const filteredOfferings = offerings.filter(o => {
    const matchesSearch = !searchQuery || 
      (o.programName && o.programName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.programCode && o.programCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.affiliationName && o.affiliationName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === 'ALL' || o.categoryId?._id === filterCategory || o.categoryId === filterCategory;
    return matchesSearch && matchesCat;
  });

  const totalSeats = offerings.reduce((acc, o) => acc + (o.seatCapacity || 0), 0);
  const totalEnrolled = offerings.reduce((acc, o) => acc + (o.enrolledCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <GraduationCap className="h-7 w-7 text-[#084A86]" />
            Academic Programs & Offerings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">
            Configure Academic Hierarchy: Categories, Degrees, Affiliations, Offerings, Batches & Admission Rules.
          </p>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-zinc-500 font-semibold gap-1.5">
          <Link href="/dashboard" className="hover:text-zinc-800 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-[#084A86] font-bold">Academics</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-zinc-950 font-bold">Programs & Offerings</span>
        </div>
      </div>

      {/* Alert banner if any */}
      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-xs font-semibold text-sm ${
          message.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'error' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-zinc-500 hover:text-zinc-900 text-xs">✕</button>
        </div>
      )}

      {/* Top Live Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Offerings</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{offerings.length}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Approved for admission</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#084A86] flex items-center justify-center font-bold">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Degrees & Programs</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{programs.length}</p>
            <p className="text-[11px] text-zinc-600 font-semibold mt-0.5">{categories.length} Academic Categories</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Awarding Bodies</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{affiliations.length}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">PBTE, BISE, PU, PCP</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Seat Capacity</p>
            <p className="text-2xl font-black text-zinc-950 mt-1">{totalEnrolled} / {totalSeats}</p>
            <p className="text-[11px] text-zinc-600 font-semibold mt-0.5">Across all campuses</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-1.5 flex flex-wrap gap-1.5">
        {[
          { id: 'offerings', label: 'Program Offerings', icon: Layers, count: offerings.length },
          { id: 'programs', label: 'Programs & Degrees', icon: BookOpen, count: programs.length },
          { id: 'categories', label: 'Academic Categories', icon: GraduationCap, count: categories.length },
          { id: 'affiliations', label: 'Affiliations & Awarding Bodies', icon: Award, count: affiliations.length },
          { id: 'batches', label: 'Batches & Shifts', icon: Users, count: batches.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-800'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Program Offerings */}
      {activeTab === 'offerings' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[240px]">
                <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search offering or board..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm text-zinc-950 font-medium focus:outline-none focus:ring-2 focus:ring-[#084A86]"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold focus:outline-none focus:ring-2 focus:ring-[#084A86]"
              >
                <option value="ALL">All Academic Categories</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadAllData}
                disabled={loading}
                className="p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => openOfferingModal()}
                className="bg-[#084A86] hover:bg-[#073d6e] text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create Program Offering</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-zinc-200 text-center">
              <Loader2 className="h-8 w-8 text-[#084A86] animate-spin mx-auto" />
              <p className="text-zinc-600 text-sm font-bold mt-2">Loading program offerings...</p>
            </div>
          ) : filteredOfferings.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-zinc-200 text-center">
              <Layers className="h-12 w-12 text-zinc-300 mx-auto" />
              <h3 className="text-base font-bold text-zinc-950 mt-2">No Program Offerings Found</h3>
              <p className="text-xs text-zinc-500 mt-1">Create an offering to connect programs to sessions, fees, and seat capacity.</p>
              <button
                onClick={() => openOfferingModal()}
                className="mt-4 bg-[#084A86] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Create First Offering
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOfferings.map(off => {
                const percent = Math.min(100, Math.round(((off.enrolledCount || 0) / (off.seatCapacity || 60)) * 100));
                return (
                  <div 
                    key={off._id}
                    className="bg-white rounded-2xl border border-zinc-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#084A86] border border-blue-100">
                          {off.categoryName || 'Program'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          off.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {off.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-950 mt-2.5 line-clamp-1" title={off.title}>
                        {off.programName}
                      </h3>
                      <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                        Code: <span className="font-bold text-zinc-900">{off.programCode}</span> · {off.duration} ({off.academicPattern})
                      </p>

                      <div className="mt-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-zinc-700 font-medium">
                          <span className="text-zinc-500">Awarding Body:</span>
                          <span className="font-bold text-zinc-950 text-right line-clamp-1">{off.affiliationName}</span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-700 font-medium">
                          <span className="text-zinc-500">Session & Campus:</span>
                          <span className="font-bold text-zinc-950">{off.sessionName} · Main Campus</span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-700 font-medium">
                          <span className="text-zinc-500">Est. Total Fee:</span>
                          <span className="font-black text-emerald-700">Rs. {Number(off.feePlan?.totalEstimate || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="mt-4 pt-3 border-t border-zinc-100">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-zinc-500">Seat Capacity</span>
                          <span className="text-zinc-950">{off.enrolledCount || 0} / {off.seatCapacity || 60} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              percent >= 90 ? 'bg-rose-500' : percent >= 60 ? 'bg-amber-500' : 'bg-[#084A86]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-4 mt-3 border-t border-zinc-100">
                      <button
                        onClick={() => openOfferingModal(off)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOffering(off._id, off.title)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Programs & Degrees */}
      {activeTab === 'programs' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-950">Academic Programs List</h3>
            <button
              onClick={() => openProgramModal()}
              className="bg-[#084A86] hover:bg-[#073d6e] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Program
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Program Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Duration & Pattern</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {programs.map(p => (
                  <tr key={p._id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-zinc-950">
                      {p.name}
                      {p.qualificationName && (
                        <p className="text-[11px] font-medium text-zinc-500 mt-0.5">{p.qualificationName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#084A86]">{p.code}</td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-800">{p.categoryName || p.category?.name || '—'}</td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-800">{p.defaultDuration} · {p.academicPattern} ({p.totalStages} {p.stageType}s)</td>
                    <td className="px-4 py-3.5 font-medium text-zinc-600">{p.department}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => openProgramModal(p)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-700"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Academic Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-950">Academic Categories</h3>
            <button
              onClick={() => openCategoryModal()}
              className="bg-[#084A86] hover:bg-[#073d6e] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Category Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Stage Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {categories.map(c => (
                  <tr key={c._id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-zinc-950">{c.name}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#084A86]">{c.code}</td>
                    <td className="px-4 py-3.5 text-zinc-600 max-w-xs">{c.description || '—'}</td>
                    <td className="px-4 py-3.5 font-bold text-zinc-800">{c.applicableStageType}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => openCategoryModal(c)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-700"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Affiliations & Awarding Bodies */}
      {activeTab === 'affiliations' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-950">Affiliations & Awarding Bodies</h3>
            <button
              onClick={() => openAffiliationModal()}
              className="bg-[#084A86] hover:bg-[#073d6e] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Affiliation
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Awarding Body / Board</th>
                  <th className="px-4 py-3">Code & Type</th>
                  <th className="px-4 py-3">Approval Reference</th>
                  <th className="px-4 py-3">Validity Dates</th>
                  <th className="px-4 py-3">Authorization</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {affiliations.map(a => (
                  <tr key={a._id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-zinc-950">{a.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-[#084A86]">{a.code}</span>
                      <p className="text-[11px] font-semibold text-zinc-500">{a.type}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-700">{a.approvalReference || '—'}</td>
                    <td className="px-4 py-3.5 font-medium text-zinc-600">
                      {a.validityFrom && a.validityTo ? `${a.validityFrom} to ${a.validityTo}` : 'Active / Permanent'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        a.authorizationStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {a.authorizationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => openAffiliationModal(a)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-700"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Batches & Shifts */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-950">Batches & Sections</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Batch Name</th>
                  <th className="px-4 py-3">Shift</th>
                  <th className="px-4 py-3">Enrolled / Capacity</th>
                  <th className="px-4 py-3">Sections</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {batches.map(b => (
                  <tr key={b._id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-zinc-950">{b.name}</td>
                    <td className="px-4 py-3.5 font-bold text-blue-700">{b.shift}</td>
                    <td className="px-4 py-3.5 font-bold text-zinc-900">{b.currentEnrolled || 0} / {b.capacity || 60}</td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-700">
                      {Array.isArray(b.sections) ? b.sections.join(', ') : 'A'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: CREATE / EDIT PROGRAM OFFERING
      ────────────────────────────────────────────────────────────────────────────── */}
      {modalType === 'offering' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-zinc-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <h3 className="text-base font-bold text-zinc-950">
                {editingItem ? 'Edit Program Offering' : 'Create Program Offering'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-zinc-400 hover:text-zinc-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveOffering} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">Select Program *</label>
                <select
                  value={offeringForm.programId}
                  onChange={e => setOfferingForm(prev => ({ ...prev, programId: e.target.value }))}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold focus:ring-2 focus:ring-[#084A86]"
                >
                  <option value="">-- Choose Program --</option>
                  {programs.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Affiliation / Awarding Body *</label>
                  <select
                    value={offeringForm.affiliationId}
                    onChange={e => setOfferingForm(prev => ({ ...prev, affiliationId: e.target.value }))}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold focus:ring-2 focus:ring-[#084A86]"
                  >
                    <option value="">-- Choose Affiliation --</option>
                    {affiliations.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({a.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Academic Session *</label>
                  <select
                    value={offeringForm.sessionId}
                    onChange={e => setOfferingForm(prev => ({ ...prev, sessionId: e.target.value }))}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold focus:ring-2 focus:ring-[#084A86]"
                  >
                    <option value="">-- Choose Session --</option>
                    {sessions.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.year}) {s.isCurrent ? '★ Current' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Campus</label>
                  <select
                    value={offeringForm.campusId}
                    onChange={e => setOfferingForm(prev => ({ ...prev, campusId: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold focus:ring-2 focus:ring-[#084A86]"
                  >
                    {campuses.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Seat Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={offeringForm.seatCapacity}
                    onChange={e => setOfferingForm(prev => ({ ...prev, seatCapacity: parseInt(e.target.value, 10) || 60 }))}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold focus:ring-2 focus:ring-[#084A86]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Curriculum Version</label>
                  <input
                    type="text"
                    value={offeringForm.curriculumVersion}
                    onChange={e => setOfferingForm(prev => ({ ...prev, curriculumVersion: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold focus:ring-2 focus:ring-[#084A86]"
                  />
                </div>
              </div>

              {/* Fee Plan Configuration */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-700" />
                  Fee Structure & Plan (Rs.)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">Admission Fee</label>
                    <input
                      type="number"
                      value={offeringForm.feePlan.admissionFee}
                      onChange={e => setOfferingForm(prev => ({
                        ...prev,
                        feePlan: { ...prev.feePlan, admissionFee: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-bold text-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">Tuition Fee / Term</label>
                    <input
                      type="number"
                      value={offeringForm.feePlan.tuitionFeePerTerm}
                      onChange={e => setOfferingForm(prev => ({
                        ...prev,
                        feePlan: { ...prev.feePlan, tuitionFeePerTerm: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-bold text-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">Registration Fee</label>
                    <input
                      type="number"
                      value={offeringForm.feePlan.registrationFee}
                      onChange={e => setOfferingForm(prev => ({
                        ...prev,
                        feePlan: { ...prev.feePlan, registrationFee: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-bold text-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">Lab / Practical Fee</label>
                    <input
                      type="number"
                      value={offeringForm.feePlan.labPracticalFee}
                      onChange={e => setOfferingForm(prev => ({
                        ...prev,
                        feePlan: { ...prev.feePlan, labPracticalFee: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-bold text-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">Exam Fee</label>
                    <input
                      type="number"
                      value={offeringForm.feePlan.examFee}
                      onChange={e => setOfferingForm(prev => ({
                        ...prev,
                        feePlan: { ...prev.feePlan, examFee: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-bold text-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">Library Fee</label>
                    <input
                      type="number"
                      value={offeringForm.feePlan.libraryFee}
                      onChange={e => setOfferingForm(prev => ({
                        ...prev,
                        feePlan: { ...prev.feePlan, libraryFee: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-bold text-zinc-950"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-600">Calculated Total Estimate:</span>
                  <span className="text-sm font-black text-emerald-800">
                    Rs. {(
                      Number(offeringForm.feePlan.admissionFee || 0) +
                      Number(offeringForm.feePlan.tuitionFeePerTerm || 0) +
                      Number(offeringForm.feePlan.registrationFee || 0) +
                      Number(offeringForm.feePlan.labPracticalFee || 0) +
                      Number(offeringForm.feePlan.examFee || 0) +
                      Number(offeringForm.feePlan.libraryFee || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#084A86] hover:bg-[#073d6e] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Offering'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: CREATE / EDIT PROGRAM
      ────────────────────────────────────────────────────────────────────────────── */}
      {modalType === 'program' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <h3 className="text-base font-bold text-zinc-950">
                {editingItem ? 'Edit Program' : 'Add New Program'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-zinc-400 hover:text-zinc-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveProgram} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">Academic Category *</label>
                <select
                  value={programForm.category}
                  onChange={e => setProgramForm(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold focus:ring-2 focus:ring-[#084A86]"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">Program Name *</label>
                <input
                  type="text"
                  placeholder="e.g. F.Sc Operation Theater Technology"
                  value={programForm.name}
                  onChange={e => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Program Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. FSC-OTT"
                    value={programForm.code}
                    onChange={e => setProgramForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Default Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Years / 4 Years"
                    value={programForm.defaultDuration}
                    onChange={e => setProgramForm(prev => ({ ...prev, defaultDuration: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Academic Pattern</label>
                  <select
                    value={programForm.academicPattern}
                    onChange={e => setProgramForm(prev => ({ ...prev, academicPattern: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-950"
                  >
                    <option value="Annual">Annual (Parts)</option>
                    <option value="Semester">Semester (Semesters)</option>
                    <option value="Modular">Modular (Modules)</option>
                    <option value="Term">Term Based</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Total Stages</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={programForm.totalStages}
                    onChange={e => setProgramForm(prev => ({ ...prev, totalStages: parseInt(e.target.value, 10) || 2 }))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-950"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#084A86] hover:bg-[#073d6e] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: CREATE / EDIT CATEGORY
      ────────────────────────────────────────────────────────────────────────────── */}
      {modalType === 'category' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <h3 className="text-base font-bold text-zinc-950">
                {editingItem ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-zinc-400 hover:text-zinc-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. BS / Undergraduate"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Category Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. BS"
                    value={categoryForm.code}
                    onChange={e => setCategoryForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Default Stage</label>
                  <select
                    value={categoryForm.applicableStageType}
                    onChange={e => setCategoryForm(prev => ({ ...prev, applicableStageType: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-950"
                  >
                    <option value="Semester">Semester</option>
                    <option value="Part">Part (Annual)</option>
                    <option value="Module">Module</option>
                    <option value="Term">Term</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={categoryForm.description}
                  onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2 rounded-xl text-xs text-zinc-950 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#084A86] hover:bg-[#073d6e] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: CREATE / EDIT AFFILIATION
      ────────────────────────────────────────────────────────────────────────────── */}
      {modalType === 'affiliation' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <h3 className="text-base font-bold text-zinc-950">
                {editingItem ? 'Edit Affiliation' : 'Register Awarding Body'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-zinc-400 hover:text-zinc-900 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveAffiliation} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">Awarding Body / University / Board *</label>
                <input
                  type="text"
                  placeholder="e.g. Punjab Board of Technical Education"
                  value={affiliationForm.name}
                  onChange={e => setAffiliationForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-950 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. PBTE"
                    value={affiliationForm.code}
                    onChange={e => setAffiliationForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Organization Type</label>
                  <select
                    value={affiliationForm.type}
                    onChange={e => setAffiliationForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-950"
                  >
                    <option value="Technical Board">Technical Board</option>
                    <option value="Board of Intermediate & Secondary Education">BISE Board</option>
                    <option value="University">University</option>
                    <option value="Council">Council</option>
                    <option value="Vocational Agency">Vocational Agency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Approval Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. PBTE/REG/2024/7712"
                    value={affiliationForm.approvalReference}
                    onChange={e => setAffiliationForm(prev => ({ ...prev, approvalReference: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Authorization Status</label>
                  <select
                    value={affiliationForm.authorizationStatus}
                    onChange={e => setAffiliationForm(prev => ({ ...prev, authorizationStatus: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-950"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending Renewal">Pending Renewal</option>
                    <option value="Conditional">Conditional</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#084A86] hover:bg-[#073d6e] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Register Affiliation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
