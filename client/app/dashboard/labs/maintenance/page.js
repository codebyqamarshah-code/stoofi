'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  Download,
  Printer,
  FileText,
  Trash2,
  Edit,
  Plus,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Eye,
  Layers,
  Sparkles,
  Building,
  DollarSign,
  Calendar,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  RefreshCw,
  Cpu,
  Droplets,
  Zap,
  Armchair,
  Fan,
  ShieldAlert,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';
import labService from '@/services/labService';

export const CAMPUS_LOCATIONS = [
  'Medical Lab Technology (MLT) Lab',
  'Pharmacy Technician Practical Lab',
  'Nursing Skills & Anatomy Lab',
  'Computer & Digital IT Lab',
  'Biochemistry & Science Lab',
  'Main Academic Block A (Classrooms & Lecture Halls)',
  'Main Academic Block B (Admin & Faculty Block)',
  'College Library & Reading Hall',
  'Campus Water Filtration & Solar Power Facility',
  'Campus Cafeteria & Student Facilities',
  'College Buses & Transport Yard'
];

export const MAINTENANCE_CATEGORIES = [
  'Laboratory Instruments & Medical Equipment',
  'Electrical & Power Backup (Solar / Generator)',
  'Plumbing & Clean Water Filtration',
  'Classroom Furniture & Desks',
  'Computer & IT Lab Hardware',
  'Building Civil Works & Painting',
  'HVAC & Air Conditioning',
  'Campus Vehicles & Transport Support',
  'Fire & Safety Equipment'
];

export const WORK_ORDER_STATUSES = [
  'Reported',
  'Under Inspection',
  'In Repair',
  'Completed',
  'Closed'
];

export default function MaintenancePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMaintenance = async () => {
    setLoading(true);
    try {
      const data = await labService.getMaintenance();
      if (Array.isArray(data)) setRequests(data);
    } catch (err) {
      console.error('Error loading maintenance requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenance();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [editingRequest, setEditingRequest] = useState(null);
  const [updatingRequest, setUpdatingRequest] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);

  const [formData, setFormData] = useState({
    equipmentName: '',
    assetCode: '',
    labName: CAMPUS_LOCATIONS[0],
    category: MAINTENANCE_CATEGORIES[0],
    description: '',
    priority: 'Medium',
    reportedBy: '',
    reportedDate: new Date().toISOString().split('T')[0],
    assignedTo: 'Campus Electrician / Handyman',
    status: 'Reported',
    estimatedCost: 0,
    actualCost: 0,
    downtime: '0 Days',
    nextMaintenanceDate: '',
    resolutionNotes: ''
  });

  const [statusUpdateData, setStatusUpdateData] = useState({
    status: 'In Repair',
    assignedTo: '',
    actualCost: 0,
    resolutionNotes: ''
  });

  const filteredRequests = requests.filter(item => {
    const q = searchTerm.toLowerCase();
    const idStr = String(item.id || item.requestId || item._id || '').toLowerCase();
    const nameStr = String(item.equipmentName || '').toLowerCase();
    const assetStr = String(item.assetCode || '').toLowerCase();
    const locStr = String(item.labName || '').toLowerCase();
    const descStr = String(item.description || '').toLowerCase();
    const techStr = String(item.assignedTo || '').toLowerCase();

    const matchesSearch =
      nameStr.includes(q) ||
      assetStr.includes(q) ||
      idStr.includes(q) ||
      locStr.includes(q) ||
      descStr.includes(q) ||
      techStr.includes(q);

    const matchesLocation = selectedLocation === 'All' || item.labName === selectedLocation;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || item.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesLocation && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingRequest(null);
    setFormData({
      equipmentName: '',
      assetCode: '',
      labName: CAMPUS_LOCATIONS[0],
      category: MAINTENANCE_CATEGORIES[0],
      description: '',
      priority: 'Medium',
      reportedBy: '',
      reportedDate: new Date().toISOString().split('T')[0],
      assignedTo: 'In-house Technician',
      status: 'Reported',
      estimatedCost: 0,
      actualCost: 0,
      downtime: '0 Days',
      nextMaintenanceDate: '',
      resolutionNotes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (reqItem) => {
    setEditingRequest(reqItem);
    setFormData({ ...reqItem });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = editingRequest ? { ...formData, id: editingRequest.id, _id: editingRequest._id || editingRequest.id } : formData;
      const saved = await labService.saveMaintenance(payload);
      if (saved) {
        if (editingRequest) {
          setRequests(requests.map(t => (t.id === editingRequest.id || t._id === editingRequest._id) ? saved : t));
        } else {
          setRequests([saved, ...requests]);
        }
      }
    } catch (err) {
      console.error('Failed to save maintenance request:', err);
    }
    setIsModalOpen(false);
  };

  const handleOpenUpdateStatus = (reqItem) => {
    setUpdatingRequest(reqItem);
    setStatusUpdateData({
      status: reqItem.status || 'In Repair',
      assignedTo: reqItem.assignedTo || '',
      actualCost: reqItem.actualCost || reqItem.costIncurred || 0,
      resolutionNotes: reqItem.resolutionNotes || ''
    });
    setIsUpdateStatusModalOpen(true);
  };

  const handleSaveStatusUpdate = async (e) => {
    e.preventDefault();
    if (!updatingRequest) return;
    try {
      const updated = {
        ...updatingRequest,
        status: statusUpdateData.status,
        assignedTo: statusUpdateData.assignedTo,
        actualCost: Number(statusUpdateData.actualCost),
        costIncurred: Number(statusUpdateData.actualCost),
        resolutionNotes: statusUpdateData.resolutionNotes
      };
      const saved = await labService.saveMaintenance(updated);
      setRequests(requests.map(t => (t.id === updatingRequest.id || t._id === updatingRequest._id) ? (saved || updated) : t));
    } catch (err) {
      console.error('Failed to update maintenance status:', err);
    }
    setIsUpdateStatusModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to remove this maintenance record?')) {
      try {
        await labService.deleteMaintenance(id);
        setRequests(requests.filter(t => t.id !== id && t._id !== id));
      } catch (err) {
        console.error('Failed to delete maintenance record:', err);
      }
    }
  };

  const exportHeaders = ['Request #', 'Equipment / Facility', 'Asset Code', 'Campus Location / Lab', 'Category', 'Priority', 'Reported By', 'Date', 'Assigned Tech/Vendor', 'Status', 'Cost (PKR)', 'Resolution Log'];
  const exportData = filteredRequests.map(t => [
    t.id || t.requestId || t._id,
    t.equipmentName,
    t.assetCode,
    t.labName,
    t.category,
    t.priority,
    t.reportedBy,
    t.reportedDate,
    t.assignedTo,
    t.status,
    t.actualCost || t.costIncurred || t.estimatedCost,
    t.resolutionNotes
  ]);

  const openCount = requests.filter(t => t.status !== 'Closed' && t.status !== 'Completed').length;
  const criticalCount = requests.filter(t => t.priority === 'Critical' && t.status !== 'Closed').length;
  const totalRepairSpend = requests.reduce((acc, curr) => acc + (curr.actualCost || curr.costIncurred || 0), 0);
  const repairedCount = requests.filter(t => t.status === 'Completed' || t.status === 'Closed' || t.status === 'Repaired').length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-zinc-600">
          <Link href="/dashboard" className="hover:text-emerald-700 font-medium">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <Link href="/dashboard/labs" className="hover:text-emerald-700 font-medium">Campus & Labs</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Maintenance & Repairs</span>
        </div>
      </div>

      {/* Modern Campus Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Building className="w-4 h-4" />
            <span>Pak Royal College — Facility & Equipment Desk</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Campus, School & Laboratory Maintenance
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Record and monitor school infrastructure repairs, science & medical lab instrument servicing, electrical systems, plumbing, furniture, and routine facility works.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs flex items-center gap-1.5 cursor-pointer h-9"
          >
            {viewMode === 'list' ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            {viewMode === 'list' ? 'Status Overview' : 'Register Table'}
          </Button>
          <Button
            onClick={handleOpenAddModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs flex items-center gap-1.5 font-bold text-xs cursor-pointer h-9 px-4"
          >
            <Plus className="w-4 h-4" />
            New Maintenance Request
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Active Open Works</div>
            <div className="text-2xl font-black text-zinc-900 mt-1">{openCount}</div>
            <div className="text-[11px] text-zinc-500 font-medium mt-0.5">Pending repair or inspection</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Urgent / Critical</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{criticalCount}</div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5">Immediate attention needed</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Repair & Spares Spend</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">PKR {totalRepairSpend.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Actual expense recorded</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Restored & Operational</div>
            <div className="text-2xl font-black text-emerald-800 mt-1">{repairedCount}</div>
            <div className="text-[11px] text-emerald-800 font-medium mt-0.5">Fully operational assets</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search request #, equipment, location, or technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-zinc-50 border-zinc-200"
            />
          </div>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white text-zinc-700 h-9 font-medium"
          >
            <option value="All">All Campus Locations</option>
            {CAMPUS_LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white text-zinc-700 h-9 font-medium"
          >
            <option value="All">All Categories</option>
            {MAINTENANCE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white text-zinc-700 h-9 font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5 bg-white text-zinc-700 h-9 font-medium"
          >
            <option value="All">All Statuses</option>
            {WORK_ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => exportToCSV('College_Maintenance_Register', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700 cursor-pointer h-8"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button
            onClick={() => exportToExcel('College_Maintenance_Register', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700 cursor-pointer h-8"
          >
            <FileText className="w-3.5 h-3.5" /> Excel
          </Button>
          <Button
            onClick={() => printData('Pak Royal College - Maintenance & Repairs Register', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700 cursor-pointer h-8"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Main View: Status Overview Cards OR Full Register Table */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-zinc-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
          <p className="text-sm font-semibold text-zinc-800">Loading Maintenance Register...</p>
          <p className="text-xs text-zinc-500 mt-1">Fetching live campus repair records from database</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {WORK_ORDER_STATUSES.map(stage => {
            const stageRequests = filteredRequests.filter(t => t.status === stage);
            return (
              <div key={stage} className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  <span>{stage}</span>
                  <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-800 flex items-center justify-center text-[10px] font-bold">
                    {stageRequests.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {stageRequests.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400 text-xs italic">
                      No works under {stage}
                    </div>
                  ) : (
                    stageRequests.map(t => (
                      <div key={t.id || t._id} className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs space-y-2 hover:border-emerald-400 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
                            {t.id || t.requestId || t._id?.slice(-6)?.toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            t.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                            t.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                            t.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-zinc-100 text-zinc-700'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        <h4 className="font-bold text-zinc-900 text-xs leading-snug">{t.equipmentName}</h4>
                        <div className="text-[11px] text-emerald-700 font-medium">{t.labName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{t.assetCode} • {t.category}</div>
                        <p className="text-[11px] text-zinc-600 line-clamp-2">{t.description}</p>

                        <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center justify-between">
                          <span className="truncate max-w-[130px]">By: <strong className="text-zinc-700">{t.assignedTo}</strong></span>
                          <Button
                            onClick={() => handleOpenUpdateStatus(t)}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1.5 text-[10px] text-emerald-600 font-bold hover:bg-emerald-50 cursor-pointer"
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Equipment / Facility Item</th>
                  <th className="py-3 px-4">Campus Location / Lab</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assigned Handyman / Tech</th>
                  <th className="py-3 px-4">Reported Date</th>
                  <th className="py-3 px-4">Repair Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-zinc-500">
                      <Wrench className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="font-bold text-xs text-zinc-700">No maintenance requests found</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Click &quot;New Maintenance Request&quot; above to log an issue or breakdown.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((t) => (
                    <tr key={t.id || t._id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                        {t.id || t.requestId || t._id?.slice(-6)?.toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-950">{t.equipmentName}</div>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          {t.assetCode && <span className="font-mono">{t.assetCode} • </span>}
                          {t.category}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-800 font-medium">
                        {t.labName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.priority === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          t.priority === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          t.priority === 'Medium' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-900">
                        {t.assignedTo || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600">
                        {t.reportedDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900">
                        PKR {((t.actualCost !== undefined && t.actualCost > 0) ? t.actualCost : (t.costIncurred || t.estimatedCost || 0)).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === 'Reported' ? 'bg-zinc-100 text-zinc-700 border border-zinc-200' :
                          t.status === 'Under Inspection' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          t.status === 'In Repair' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          t.status === 'Completed' || t.status === 'Repaired' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-zinc-200 text-zinc-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => { setViewingRequest(t); setIsViewModalOpen(true); }}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleOpenUpdateStatus(t)}
                            size="sm"
                            className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                          >
                            Update
                          </Button>
                          <Button
                            onClick={() => handleOpenEditModal(t)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(t.id || t._id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* Log / Edit Maintenance Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {editingRequest ? 'Edit Maintenance Request' : 'Log Maintenance & Repair Work'}
                  </h2>
                  <p className="text-xs text-zinc-500">Record broken fixtures, equipment breakdown, electrical, plumbing or routine servicing</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-zinc-800">Equipment / Facility Item *</Label>
                  <Input
                    value={formData.equipmentName}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    placeholder="e.g. Binocular Microscope CX23 or Classroom Fan"
                    className="text-xs mt-1 h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-800">Asset Code / Inventory Tag</Label>
                  <Input
                    value={formData.assetCode}
                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                    placeholder="e.g. MLT-MIC-004 or FUR-DSK-018"
                    className="text-xs mt-1 h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-800">Campus Location / Laboratory *</Label>
                  <select
                    value={formData.labName}
                    onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs h-9 bg-white"
                    required
                  >
                    {CAMPUS_LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-800">Maintenance Category *</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs h-9 bg-white"
                    required
                  >
                    {MAINTENANCE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-800">Urgency / Priority *</Label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs h-9 bg-white font-bold"
                  >
                    <option value="Critical">Critical (Immediate Service Required)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-800">Reported By (Staff / Faculty Name) *</Label>
                  <Input
                    value={formData.reportedBy}
                    onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                    placeholder="e.g. Dr. Tariq (MLT Faculty) or Admin Office"
                    className="text-xs mt-1 h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-800">Assigned Technician / Vendor</Label>
                  <Input
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="e.g. Electrician Rashid or Authorized Tech"
                    className="text-xs mt-1 h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-800">Work Status *</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs h-9 bg-white font-medium"
                  >
                    {WORK_ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-800">Estimated Cost (PKR)</Label>
                  <Input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseInt(e.target.value) || 0 })}
                    className="text-xs mt-1 h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-800">Next Scheduled Service / Inspection</Label>
                  <Input
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                    className="text-xs mt-1 h-9"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-bold text-zinc-800">Issue / Fault Description *</Label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe symptoms, broken parts, gas leakage, electrical spark, focus fault..."
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2.5 text-xs bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs cursor-pointer h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer h-9 px-5 shadow-xs"
                >
                  {editingRequest ? 'Update Record' : 'Save Maintenance Record'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress & Cost Modal */}
      {isUpdateStatusModalOpen && updatingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
                  {updatingRequest.id || updatingRequest.requestId || 'WORK ORDER'}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-sm">{updatingRequest.equipmentName}</h3>
                  <p className="text-[11px] text-zinc-500">{updatingRequest.labName}</p>
                </div>
              </div>
              <button onClick={() => setIsUpdateStatusModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="space-y-3.5 text-xs">
              <div>
                <Label className="text-xs font-bold text-zinc-800">Current Work Status *</Label>
                <select
                  value={statusUpdateData.status}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                  className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-bold h-9 bg-white"
                >
                  {WORK_ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-800">Assigned Technician / Handyman</Label>
                <Input
                  value={statusUpdateData.assignedTo}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, assignedTo: e.target.value })}
                  className="text-xs mt-1 h-9"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-800">Actual Incurred Cost / Parts Cost (PKR)</Label>
                <Input
                  type="number"
                  value={statusUpdateData.actualCost}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, actualCost: e.target.value })}
                  className="text-xs mt-1 h-9 font-bold text-emerald-700"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-zinc-800">Technician Resolution Notes / Action Taken</Label>
                <textarea
                  rows={3}
                  value={statusUpdateData.resolutionNotes}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, resolutionNotes: e.target.value })}
                  placeholder="Details of parts replaced, calibration readings, new filter installed, polish done..."
                  className="w-full mt-1 border border-zinc-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
                <Button type="button" variant="outline" onClick={() => setIsUpdateStatusModalOpen(false)} className="text-xs cursor-pointer h-9 px-4">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer h-9 px-5">
                  Save Progress
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Maintenance Details Modal */}
      {isViewModalOpen && viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
                  {viewingRequest.id || viewingRequest.requestId || 'MR'}
                </span>
                <div>
                  <h3 className="font-bold text-zinc-950 text-sm">{viewingRequest.equipmentName}</h3>
                  <p className="text-[11px] text-zinc-500">Asset Tag: {viewingRequest.assetCode || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Campus Location:</span>
                  <span className="font-bold text-zinc-900">{viewingRequest.labName}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Category:</span>
                  <span className="font-medium text-zinc-800">{viewingRequest.category}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Priority:</span>
                  <span className="font-bold text-rose-600">{viewingRequest.priority}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Reported By:</span>
                  <span className="font-medium text-zinc-900">{viewingRequest.reportedBy}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Assigned Handyman / Tech:</span>
                  <span className="font-semibold text-zinc-900">{viewingRequest.assignedTo}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Work Status:</span>
                  <span className="font-bold text-emerald-700">{viewingRequest.status}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Reported Date:</span>
                  <span className="font-medium text-zinc-900">{viewingRequest.reportedDate}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Actual Expense:</span>
                  <span className="font-bold text-emerald-700">
                    PKR {((viewingRequest.actualCost !== undefined && viewingRequest.actualCost > 0) ? viewingRequest.actualCost : (viewingRequest.costIncurred || viewingRequest.estimatedCost || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-600 font-bold block mb-1">Issue / Fault Description:</span>
                <p className="text-zinc-900 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                  {viewingRequest.description}
                </p>
              </div>

              <div>
                <span className="text-zinc-600 font-bold block mb-1">Technician Resolution Log & Action Taken:</span>
                <p className="text-zinc-900 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                  {viewingRequest.resolutionNotes || 'Repair in progress / No final resolution notes recorded yet.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-200">
              <Button onClick={() => setIsViewModalOpen(false)} size="sm" className="bg-zinc-950 text-white text-xs font-bold cursor-pointer px-4">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
