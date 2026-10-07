'use client';

import Link from 'next/link';
import React, { useState } from 'react';
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
  Kanban,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function MaintenancePage() {
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-101',
      equipmentName: 'Dell Precision 3660 Workstation #14',
      assetCode: 'CS-PC-014',
      labName: 'Software Engineering & AI Lab 1 (IT-302)',
      category: 'Hardware & Power',
      description: 'System powers off randomly after 15 minutes of GPU workload. Suspected faulty PSU or overheating.',
      priority: 'High',
      reportedBy: 'Mr. Ali Raza (Faculty)',
      reportedDate: '2026-10-10',
      assignedTo: 'Tariq Mehmood (Hardware Tech)',
      status: 'In Progress',
      estimatedCost: 12000,
      actualCost: 11500,
      downtime: '2 Days',
      nextMaintenanceDate: '2027-04-10',
      resolutionNotes: 'Replaced thermal paste on Intel Core i7 and swapped 500W PSU.'
    },
    {
      id: 'TKT-102',
      equipmentName: 'Digital Storage Oscilloscope 100MHz',
      assetCode: 'DSO-002',
      labName: 'Advanced Physics Lab (A-204)',
      category: 'Calibration & Testing',
      description: 'Channel 2 has voltage drift of +0.8V. Requires precision potentiometer calibration.',
      priority: 'Medium',
      reportedBy: 'Kashif Ali (Lab Tech)',
      reportedDate: '2026-10-08',
      assignedTo: 'Apex Calibration Services (Vendor)',
      status: 'Under Review',
      estimatedCost: 8000,
      actualCost: 0,
      downtime: '4 Days',
      nextMaintenanceDate: '2027-01-15',
      resolutionNotes: 'Awaiting vendor technician visit scheduled for Thursday.'
    },
    {
      id: 'TKT-103',
      equipmentName: 'Split Air Conditioner (2 Ton Inverter)',
      assetCode: 'FAC-AC-02',
      labName: 'Software Engineering & AI Lab 1 (IT-302)',
      category: 'Facility & Electrical',
      description: 'Cooling gas leaked. Server room / lab temperature reaching 31°C causing thermal throttling.',
      priority: 'Critical',
      reportedBy: 'Kashif Ali (Lab Tech)',
      reportedDate: '2026-10-11',
      assignedTo: 'Campus HVAC Team',
      status: 'Reported',
      estimatedCost: 15000,
      actualCost: 0,
      downtime: '1 Day',
      nextMaintenanceDate: '2026-11-15',
      resolutionNotes: 'Emergency work order submitted to Estate Office.'
    },
    {
      id: 'TKT-104',
      equipmentName: 'Fume Hood Exhaust Blower System',
      assetCode: 'CHEM-FH-01',
      labName: 'Organic & Inorganic Chemistry Lab (C-101)',
      category: 'Safety & Ventilation',
      description: 'Exhaust fan belt snapped. Toxic chemical vapors not venting outside building properly.',
      priority: 'Critical',
      reportedBy: 'Prof. Saima Tariq',
      reportedDate: '2026-10-05',
      assignedTo: 'Zahid Mechanicals',
      status: 'Repaired',
      estimatedCost: 6500,
      actualCost: 6200,
      downtime: '3 Days',
      nextMaintenanceDate: '2027-03-01',
      resolutionNotes: 'Installed new heavy-duty fan belt and greased motor bearings. Airflow tested 100 CFM.'
    },
    {
      id: 'TKT-105',
      equipmentName: 'Compound Binocular Microscope #04',
      assetCode: 'MIC-004',
      labName: 'Molecular Biology & Genetics Lab (B-102)',
      category: 'Optical & Mechanical',
      description: 'Fine focus knob slipping. Coarse adjustment loose.',
      priority: 'Low',
      reportedBy: 'Dr. Ayesha Siddiqa',
      reportedDate: '2026-10-02',
      assignedTo: 'Noman Bashir (Lab Assistant)',
      status: 'Closed',
      estimatedCost: 2000,
      actualCost: 1800,
      downtime: '1 Day',
      nextMaintenanceDate: '2027-04-01',
      resolutionNotes: 'Tightened internal rack-and-pinion tension ring and lubricated gears.'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [editingTicket, setEditingTicket] = useState(null);
  const [updatingTicket, setUpdatingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);

  const [formData, setFormData] = useState({
    equipmentName: '',
    assetCode: '',
    labName: 'Software Engineering & AI Lab 1 (IT-302)',
    category: 'Hardware & Power',
    description: '',
    priority: 'Medium',
    reportedBy: '',
    reportedDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    status: 'Reported',
    estimatedCost: 0,
    actualCost: 0,
    downtime: '0 Days',
    nextMaintenanceDate: '',
    resolutionNotes: ''
  });

  const [statusUpdateData, setStatusUpdateData] = useState({
    status: 'In Progress',
    assignedTo: '',
    actualCost: 0,
    resolutionNotes: ''
  });

  const pipelineStages = ['Reported', 'Under Review', 'In Progress', 'Repaired', 'Closed'];

  const filteredTickets = tickets.filter(item => {
    const matchesSearch =
      item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = selectedPriority === 'All' || item.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingTicket(null);
    setFormData({
      equipmentName: '',
      assetCode: '',
      labName: 'Software Engineering & AI Lab 1 (IT-302)',
      category: 'Hardware & Power',
      description: '',
      priority: 'Medium',
      reportedBy: '',
      reportedDate: new Date().toISOString().split('T')[0],
      assignedTo: 'Unassigned',
      status: 'Reported',
      estimatedCost: 0,
      actualCost: 0,
      downtime: '0 Days',
      nextMaintenanceDate: '',
      resolutionNotes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ticket) => {
    setEditingTicket(ticket);
    setFormData({ ...ticket });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingTicket) {
      setTickets(tickets.map(t => t.id === editingTicket.id ? { ...formData, id: editingTicket.id } : t));
    } else {
      const newId = `TKT-${100 + tickets.length + 1}`;
      setTickets([...tickets, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
  };

  const handleOpenUpdateStatus = (ticket) => {
    setUpdatingTicket(ticket);
    setStatusUpdateData({
      status: ticket.status,
      assignedTo: ticket.assignedTo || '',
      actualCost: ticket.actualCost || 0,
      resolutionNotes: ticket.resolutionNotes || ''
    });
    setIsUpdateStatusModalOpen(true);
  };

  const handleSaveStatusUpdate = (e) => {
    e.preventDefault();
    if (!updatingTicket) return;
    setTickets(tickets.map(t => {
      if (t.id === updatingTicket.id) {
        return {
          ...t,
          status: statusUpdateData.status,
          assignedTo: statusUpdateData.assignedTo,
          actualCost: Number(statusUpdateData.actualCost),
          resolutionNotes: statusUpdateData.resolutionNotes
        };
      }
      return t;
    }));
    setIsUpdateStatusModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this maintenance ticket?')) {
      setTickets(tickets.filter(t => t.id !== id));
    }
  };

  const exportHeaders = ['Ticket #', 'Equipment', 'Asset Code', 'Lab', 'Category', 'Priority', 'Reported By', 'Date', 'Assigned To', 'Status', 'Cost (PKR)', 'Resolution'];
  const exportData = filteredTickets.map(t => [
    t.id,
    t.equipmentName,
    t.assetCode,
    t.labName,
    t.category,
    t.priority,
    t.reportedBy,
    t.reportedDate,
    t.assignedTo,
    t.status,
    t.actualCost || t.estimatedCost,
    t.resolutionNotes
  ]);

  const openTicketsCount = tickets.filter(t => t.status !== 'Closed').length;
  const criticalCount = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Closed').length;
  const totalRepairSpend = tickets.reduce((acc, curr) => acc + (curr.actualCost || 0), 0);
  const repairedCount = tickets.filter(t => t.status === 'Repaired' || t.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-zinc-600">
          <Link href="/dashboard" className="hover:text-emerald-700 font-medium">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <Link href="/dashboard/labs" className="hover:text-emerald-700 font-medium">Labs</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Maintenance & Complaints</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4" />
            <span>Service & Repairs Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Maintenance & Complaints Pipeline</h1>
          <p className="text-emerald-200/90 text-sm mt-1">
            Log equipment faults, assign technicians, track repair costs and schedule preventive calibrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs flex items-center gap-1.5"
          >
            {viewMode === 'list' ? <Kanban className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            {viewMode === 'list' ? 'Kanban Pipeline' : 'Table View'}
          </Button>
          <Button
            onClick={handleOpenAddModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Log New Ticket
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Active Open Tickets</div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">{openTicketsCount}</div>
            <div className="text-[11px] text-zinc-500 font-medium mt-1">Pending resolution</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Critical Priority</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{criticalCount}</div>
            <div className="text-[11px] text-red-600 font-medium mt-1">Immediate action needed</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Total Repair Spend</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">PKR {totalRepairSpend.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">This academic year</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Repaired / Closed</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">{repairedCount}</div>
            <div className="text-[11px] text-emerald-800 font-medium mt-1">Restored to service</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search ticket #, equipment, asset ID, lab or technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-700"
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
            className="text-xs border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-700"
          >
            <option value="All">All Stages</option>
            {pipelineStages.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => exportToCSV('Lab_Maintenance_Tickets', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button
            onClick={() => exportToExcel('Lab_Maintenance_Tickets', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <FileText className="w-3.5 h-3.5" /> Excel
          </Button>
          <Button
            onClick={() => printData('Lab Maintenance & Repairs Register', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Kanban or Table View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {pipelineStages.map(stage => {
            const stageTickets = filteredTickets.filter(t => t.status === stage);
            return (
              <div key={stage} className="bg-zinc-100/70 p-3 rounded-2xl border border-zinc-200 flex flex-col min-w-[240px]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200 text-xs font-bold text-zinc-700 uppercase">
                  <span>{stage}</span>
                  <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[10px]">
                    {stageTickets.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {stageTickets.length === 0 ? (
                    <div className="text-center py-6 text-zinc-400 text-xs italic">
                      No tickets in {stage}
                    </div>
                  ) : (
                    stageTickets.map(t => (
                      <div key={t.id} className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-sm space-y-2 hover:border-emerald-300 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-900">{t.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            t.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            t.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                            t.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-zinc-100 text-zinc-700'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        <h4 className="font-semibold text-zinc-900 text-xs leading-tight">{t.equipmentName}</h4>
                        <div className="text-[11px] text-emerald-700 font-mono">{t.assetCode}</div>
                        <p className="text-[11px] text-zinc-600 line-clamp-2">{t.description}</p>

                        <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center justify-between">
                          <span>Tech: <strong className="text-zinc-700">{t.assignedTo}</strong></span>
                          <Button
                            onClick={() => handleOpenUpdateStatus(t)}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1.5 text-[10px] text-emerald-600 font-semibold"
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
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Equipment & Asset ID</th>
                  <th className="py-3 px-4">Laboratory</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assigned Technician</th>
                  <th className="py-3 px-4">Reported Date</th>
                  <th className="py-3 px-4">Repair Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-zinc-500 text-xs">
                      No maintenance tickets found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-900 whitespace-nowrap">
                        {t.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900">{t.equipmentName}</div>
                        <div className="text-[11px] text-emerald-700 font-mono">{t.assetCode} ({t.category})</div>
                      </td>
                      <td className="py-3 px-4 text-zinc-700">
                        {t.labName}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          t.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          t.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-zinc-100 text-zinc-700'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-zinc-800">
                        {t.assignedTo}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-600">
                        {t.reportedDate}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold text-zinc-900">
                        PKR {(t.actualCost || t.estimatedCost).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === 'Reported' ? 'bg-zinc-100 text-zinc-700' :
                          t.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                          t.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                          t.status === 'Repaired' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-zinc-200 text-zinc-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => { setViewingTicket(t); setIsViewModalOpen(true); }}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleOpenUpdateStatus(t)}
                            size="sm"
                            className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          >
                            Update
                          </Button>
                          <Button
                            onClick={() => handleOpenEditModal(t)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(t.id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
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

      {/* Log Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {editingTicket ? 'Edit Maintenance Ticket' : 'Log Maintenance & Fault Ticket'}
                  </h2>
                  <p className="text-xs text-zinc-500">Report broken hardware, electrical issues or routine servicing</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Equipment / Facility Name</Label>
                  <Input
                    value={formData.equipmentName}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    placeholder="e.g. Dell Precision 3660 Workstation"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Asset Code / Inventory Tag</Label>
                  <Input
                    value={formData.assetCode}
                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                    placeholder="e.g. CS-PC-014 or DSO-002"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Laboratory</Label>
                  <select
                    value={formData.labName}
                    onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                    required
                  >
                    <option value="Advanced Physics Lab (A-204)">Advanced Physics Lab (A-204)</option>
                    <option value="Software Engineering & AI Lab 1 (IT-302)">Software Engineering & AI Lab 1 (IT-302)</option>
                    <option value="Organic & Inorganic Chemistry Lab (C-101)">Organic & Inorganic Chemistry Lab (C-101)</option>
                    <option value="Molecular Biology & Genetics Lab (B-102)">Molecular Biology & Genetics Lab (B-102)</option>
                    <option value="Robotics, IoT & Embedded Systems Lab (R-105)">Robotics, IoT & Embedded Systems Lab (R-105)</option>
                    <option value="Digital Language & Phonetics Lab (L-201)">Digital Language & Phonetics Lab (L-201)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Issue Category</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                  >
                    <option value="Hardware & Power">Hardware & Power</option>
                    <option value="Calibration & Testing">Calibration & Testing</option>
                    <option value="Optical & Mechanical">Optical & Mechanical</option>
                    <option value="Facility & Electrical">Facility & Electrical</option>
                    <option value="Safety & Ventilation">Safety & Ventilation</option>
                    <option value="Software & OS">Software & OS</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Urgency / Priority</Label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-bold"
                  >
                    <option value="Critical">Critical (Lab Stalled)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Reported By</Label>
                  <Input
                    value={formData.reportedBy}
                    onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                    placeholder="e.g. Mr. Ali Raza (Faculty)"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Assigned Technician / Vendor</Label>
                  <Input
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="e.g. Tariq Mehmood (Hardware Tech)"
                    className="text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Current Pipeline Stage</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-medium"
                  >
                    {pipelineStages.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Estimated Repair Cost (PKR)</Label>
                  <Input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseInt(e.target.value) || 0 })}
                    className="text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Next Scheduled Calibration</Label>
                  <Input
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                    className="text-xs mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Detailed Complaint / Fault Description</Label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe symptoms, error codes, strange noises or physical damages..."
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                >
                  {editingTicket ? 'Update Ticket' : 'Create Service Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fast Update Status Modal */}
      {isUpdateStatusModalOpen && updatingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  {updatingTicket.id}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Update Ticket Status</h3>
                  <p className="text-xs text-zinc-500">{updatingTicket.equipmentName}</p>
                </div>
              </div>
              <button onClick={() => setIsUpdateStatusModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="space-y-3 text-xs">
              <div>
                <Label className="text-xs font-semibold text-zinc-700">Pipeline Status</Label>
                <select
                  value={statusUpdateData.status}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                  className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-bold"
                >
                  {pipelineStages.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Assigned Technician</Label>
                <Input
                  value={statusUpdateData.assignedTo}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, assignedTo: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Actual Repair / Incurred Cost (PKR)</Label>
                <Input
                  type="number"
                  value={statusUpdateData.actualCost}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, actualCost: e.target.value })}
                  className="text-xs mt-1 font-semibold text-emerald-700"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Technician Resolution Notes</Label>
                <textarea
                  rows={2}
                  value={statusUpdateData.resolutionNotes}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, resolutionNotes: e.target.value })}
                  placeholder="Details of parts replaced, calibration readings..."
                  className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
                <Button type="button" variant="outline" onClick={() => setIsUpdateStatusModalOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium">
                  Save Progress
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Ticket Details Modal */}
      {isViewModalOpen && viewingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {viewingTicket.id}
                </span>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">{viewingTicket.equipmentName}</h3>
                  <p className="text-xs text-zinc-500">Asset Code: {viewingTicket.assetCode}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-zinc-500 block">Laboratory:</span>
                  <span className="font-bold text-zinc-900">{viewingTicket.labName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Priority:</span>
                  <span className="font-bold text-red-600">{viewingTicket.priority}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Reported By:</span>
                  <span className="font-medium text-zinc-900">{viewingTicket.reportedBy}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Assigned Tech:</span>
                  <span className="font-medium text-zinc-900">{viewingTicket.assignedTo}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Repair Cost:</span>
                  <span className="font-bold text-emerald-700">PKR {(viewingTicket.actualCost || viewingTicket.estimatedCost).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Current Status:</span>
                  <span className="font-semibold text-emerald-700">{viewingTicket.status}</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block">Fault Description:</span>
                <p className="text-zinc-800 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 mt-1">
                  {viewingTicket.description}
                </p>
              </div>

              <div>
                <span className="text-zinc-500 block">Technician Resolution Log:</span>
                <p className="text-zinc-800 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 mt-1">
                  {viewingTicket.resolutionNotes || 'In progress / No resolution notes recorded yet.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-200">
              <Button onClick={() => setIsViewModalOpen(false)} size="sm" className="bg-zinc-900 text-white text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
