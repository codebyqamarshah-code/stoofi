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
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HeartPulse,
  Flame,
  Activity,
  X,
  Eye,
  PhoneCall,
  Sparkles,
  Building,
  Users,
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function SafetyIncidentsPage() {
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' or 'compliance' or 'emergency'

  const [incidents, setIncidents] = useState([
    {
      id: 'INC-001',
      date: '2026-10-09',
      time: '11:45 AM',
      labName: 'Organic & Inorganic Chemistry Lab (C-101)',
      personInvolved: 'Zainab Bibi (Student - FSC-2025-088)',
      personType: 'Student',
      incidentType: 'Chemical Splash / Skin Contact',
      severity: 'Moderate',
      description: 'Minor splash of dilute 1M Hydrochloric acid on forearm while transferring from reagent bottle without gloves.',
      treatment: 'Immediate irrigation with copious cool water for 15 minutes at eyewash/drench station. Calamine lotion and soothing dressing applied by campus nurse.',
      rootCause: 'Student did not wear mandatory nitrile gloves provided on lab bench.',
      correctiveAction: 'Refreshed PPE enforcement briefing before every chemistry lab session. Gloves verified at lab entry.',
      safetyOfficer: 'Prof. Saima Tariq & Dr. Farooq Khan',
      status: 'Resolved & Closed'
    },
    {
      id: 'INC-002',
      date: '2026-10-03',
      time: '02:30 PM',
      labName: 'Advanced Physics Lab (A-204)',
      personInvolved: 'Ahmed Bilal (Student - FSC-2024-112)',
      personType: 'Student',
      incidentType: 'Glassware Cut',
      severity: 'Minor',
      description: 'Capillary tube cracked while inserting into rubber bung during surface tension experiment.',
      treatment: 'First aid antiseptic applied, sterile pressure bandage placed. No stitches required.',
      rootCause: 'Excessive force applied without lubricating tube with glycerin.',
      correctiveAction: 'Added glycerin dispenser and demonstration on proper tube handling.',
      safetyOfficer: 'Kashif Ali (Lab Tech)',
      status: 'Resolved & Closed'
    },
    {
      id: 'INC-003',
      date: '2026-10-11',
      time: '10:15 AM',
      labName: 'Robotics, IoT & Embedded Systems Lab (R-105)',
      personInvolved: 'Saad Malik (Student - BSR-2023-014)',
      personType: 'Student',
      incidentType: 'Thermal Burn / Soldering Iron',
      severity: 'Minor',
      description: 'Accidental finger touch to soldering iron tip left on workstation edge.',
      treatment: 'Held under cold water for 10 minutes, silver sulfadiazine burn ointment applied.',
      rootCause: 'Soldering iron was not placed in spring safety holder while hot.',
      correctiveAction: 'Fixed iron stands bolted to benches to prevent knocking over.',
      safetyOfficer: 'Usman Ghani',
      status: 'Resolved & Closed'
    }
  ]);

  const [complianceChecks, setComplianceChecks] = useState([
    { id: 'SEC-1', item: 'Fire Extinguishers (CO2 & Dry Chemical)', lab: 'All Labs (6 Labs)', lastChecked: '2026-10-01', nextDue: '2026-11-01', status: 'Compliant', notes: 'All pressure gauges in green zone.' },
    { id: 'SEC-2', item: 'Emergency Eye Wash & Drench Shower', lab: 'Chemistry Lab & Bio Lab', lastChecked: '2026-10-05', nextDue: '2026-11-05', status: 'Compliant', notes: 'Water pressure and flow tested.' },
    { id: 'SEC-3', item: 'First Aid Kit Replenishment', lab: 'All Labs', lastChecked: '2026-10-08', nextDue: '2026-10-22', status: 'Needs Attention', notes: 'Burnol and sterile bandages low in Physics Lab.' },
    { id: 'SEC-4', item: 'Fume Hood Ventilation & Filter Status', lab: 'Chemistry Lab (C-101)', lastChecked: '2026-10-05', nextDue: '2026-11-05', status: 'Compliant', notes: 'Blower fan serviced, airflow 100 CFM.' },
    { id: 'SEC-5', item: 'Chemical Waste Neutralization & Disposal', lab: 'Chemistry & Biology Labs', lastChecked: '2026-10-02', nextDue: '2026-10-16', status: 'Compliant', notes: 'Hazardous waste carboys collected by licensed vendor.' },
    { id: 'SEC-6', item: 'Electrical Earthing & Residual Current Breakers (RCBO)', lab: 'Computer Labs & Robotics Lab', lastChecked: '2026-09-25', nextDue: '2026-10-25', status: 'Compliant', notes: 'Tripping sensitivity calibrated to 30mA.' }
  ]);

  const emergencyContacts = [
    { title: 'Campus Health Clinic / Medical Emergency', number: '+92 (051) 900-1122', ext: 'Ext: 112', contactPerson: 'Dr. Shahida (Chief Medical Officer)' },
    { title: 'Campus Fire & Safety Office', number: '+92 (051) 900-1199', ext: 'Ext: 119', contactPerson: 'Capt. Rashid (Safety Director)' },
    { title: 'Chief Lab Superintendent', number: '+92 300 8594021', ext: 'Ext: 304', contactPerson: 'Dr. Farooq Khan' },
    { title: 'Campus Security Control Room', number: '+92 (051) 900-1000', ext: 'Ext: 100', contactPerson: '24/7 Security Desk' }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [viewingIncident, setViewingIncident] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    labName: 'Organic & Inorganic Chemistry Lab (C-101)',
    personInvolved: '',
    personType: 'Student',
    incidentType: 'Chemical Splash / Skin Contact',
    severity: 'Minor',
    description: '',
    treatment: '',
    rootCause: '',
    correctiveAction: '',
    safetyOfficer: '',
    status: 'Reported'
  });

  const filteredIncidents = incidents.filter(item => {
    const matchesSearch =
      item.personInvolved.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === 'All' || item.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  const handleOpenAddModal = () => {
    setEditingIncident(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      labName: 'Organic & Inorganic Chemistry Lab (C-101)',
      personInvolved: '',
      personType: 'Student',
      incidentType: 'Chemical Splash / Skin Contact',
      severity: 'Minor',
      description: '',
      treatment: '',
      rootCause: '',
      correctiveAction: '',
      safetyOfficer: 'Lab Head',
      status: 'Reported'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (inc) => {
    setEditingIncident(inc);
    setFormData({ ...inc });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingIncident) {
      setIncidents(incidents.map(i => i.id === editingIncident.id ? { ...formData, id: editingIncident.id } : i));
    } else {
      const newId = `INC-${String(incidents.length + 1).padStart(3, '0')}`;
      setIncidents([ { ...formData, id: newId }, ...incidents ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this incident report?')) {
      setIncidents(incidents.filter(i => i.id !== id));
    }
  };

  const exportHeaders = ['Incident #', 'Date & Time', 'Lab', 'Person Involved', 'Type', 'Severity', 'Description', 'Treatment', 'Root Cause', 'Preventive Action', 'Status'];
  const exportData = filteredIncidents.map(i => [
    i.id,
    `${i.date} ${i.time}`,
    i.labName,
    i.personInvolved,
    i.incidentType,
    i.severity,
    i.description,
    i.treatment,
    i.rootCause,
    i.correctiveAction,
    i.status
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-zinc-600">
          <Link href="/dashboard" className="hover:text-emerald-700 font-medium">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <Link href="/dashboard/labs" className="hover:text-emerald-700 font-medium">Labs</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Safety & Incidents</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>OHS & Lab Biosafety Compliance</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Lab Safety, Audits & Incident Logs</h1>
          <p className="text-emerald-200/90 text-sm mt-1">
            Document accidents, first-aid interventions, root-cause analyses and safety equipment inspections
          </p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-2 font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Report Safety Incident
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'incidents'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Incident & Accident Log ({incidents.length})
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'compliance'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Safety Equipment Audits ({complianceChecks.length})
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'emergency'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          Emergency Protocol & SOS Contacts
        </button>
      </div>

      {/* Tab 1: Incident Logs */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-zinc-500 uppercase">Total Logged Incidents</div>
                <div className="text-2xl font-bold text-zinc-900 mt-1">{incidents.length}</div>
                <div className="text-[11px] text-zinc-500 font-medium mt-1">This semester</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-zinc-500 uppercase">Minor / Moderate</div>
                <div className="text-2xl font-bold text-amber-600 mt-1">{incidents.length}</div>
                <div className="text-[11px] text-amber-600 font-medium mt-1">First-aid treated</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-zinc-500 uppercase">Severe Accidents</div>
                <div className="text-2xl font-bold text-emerald-700 mt-1">0</div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">Zero major injuries</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-zinc-500 uppercase">Days Since Last Incident</div>
                <div className="text-2xl font-bold text-emerald-800 mt-1">12 Days</div>
                <div className="text-[11px] text-emerald-800 font-medium mt-1">Safe operations</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search incident #, person, lab, or cause..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="text-xs border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-700"
              >
                <option value="All">All Severities</option>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => exportToCSV('Lab_Safety_Incidents', exportHeaders, exportData)}
                variant="outline"
                size="sm"
                className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
              <Button
                onClick={() => exportToExcel('Lab_Safety_Incidents', exportHeaders, exportData)}
                variant="outline"
                size="sm"
                className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
              >
                <FileText className="w-3.5 h-3.5" /> Excel
              </Button>
              <Button
                onClick={() => printData('Lab Safety Incident Logs', exportHeaders, exportData)}
                variant="outline"
                size="sm"
                className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </Button>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Incident #</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Laboratory</th>
                    <th className="py-3 px-4">Involved Individual</th>
                    <th className="py-3 px-4">Incident Category</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredIncidents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-zinc-500 text-xs">
                        No incident reports recorded matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredIncidents.map((i) => (
                      <tr key={i.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-zinc-900 whitespace-nowrap">
                          {i.id}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-zinc-900">{i.date}</div>
                          <div className="text-[11px] text-zinc-500">{i.time}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-800">
                          {i.labName}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-zinc-900">{i.personInvolved}</div>
                          <div className="text-[11px] text-zinc-500">{i.personType}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-zinc-800">
                          {i.incidentType}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            i.severity === 'Severe' ? 'bg-red-100 text-red-800' :
                            i.severity === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {i.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-emerald-700">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200">
                            {i.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={() => { setViewingIncident(i); setIsViewModalOpen(true); }}
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleOpenEditModal(i)}
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(i.id)}
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
        </div>
      )}

      {/* Tab 2: Compliance Checks */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceChecks.map((check) => (
              <div key={check.id} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-bold text-xs">
                    {check.id}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    check.status === 'Compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {check.status}
                  </span>
                </div>

                <h3 className="font-bold text-zinc-900 text-sm">{check.item}</h3>
                <div className="text-xs text-zinc-500 font-medium">{check.lab}</div>

                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-600">
                  {check.notes}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                  <span>Last: {check.lastChecked}</span>
                  <span className="font-semibold text-emerald-700">Next: {check.nextDue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Emergency SOS Contacts */}
      {activeTab === 'emergency' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-zinc-900 text-sm">{contact.title}</h3>
                <div className="text-base font-extrabold text-red-600">{contact.number}</div>
                <div className="text-xs text-zinc-600">{contact.contactPerson} ({contact.ext})</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">
                    {editingIncident ? 'Edit Safety Incident' : 'Report Safety Incident / Accident'}
                  </h2>
                  <p className="text-xs text-zinc-500">Record event description, medical response and root cause prevention</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Date of Incident</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Time</Label>
                  <Input
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 11:45 AM"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Laboratory Location</Label>
                  <select
                    value={formData.labName}
                    onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                    required
                  >
                    <option value="Organic & Inorganic Chemistry Lab (C-101)">Organic & Inorganic Chemistry Lab (C-101)</option>
                    <option value="Advanced Physics Lab (A-204)">Advanced Physics Lab (A-204)</option>
                    <option value="Molecular Biology & Genetics Lab (B-102)">Molecular Biology & Genetics Lab (B-102)</option>
                    <option value="Software Engineering & AI Lab 1 (IT-302)">Software Engineering & AI Lab 1 (IT-302)</option>
                    <option value="Robotics, IoT & Embedded Systems Lab (R-105)">Robotics, IoT & Embedded Systems Lab (R-105)</option>
                    <option value="Digital Language & Phonetics Lab (L-201)">Digital Language & Phonetics Lab (L-201)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Individual Type</Label>
                  <select
                    value={formData.personType}
                    onChange={(e) => setFormData({ ...formData, personType: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                    <option value="Visitor">Visitor</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Person Name & Roll / Emp ID</Label>
                  <Input
                    value={formData.personInvolved}
                    onChange={(e) => setFormData({ ...formData, personInvolved: e.target.value })}
                    placeholder="e.g. Zainab Bibi (FSC-2025-088)"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Incident Category</Label>
                  <select
                    value={formData.incidentType}
                    onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                  >
                    <option value="Chemical Splash / Skin Contact">Chemical Splash / Skin Contact</option>
                    <option value="Glassware Cut">Glassware Cut</option>
                    <option value="Thermal Burn / Soldering Iron">Thermal Burn / Soldering Iron</option>
                    <option value="Electrical Shock / Spark">Electrical Shock / Spark</option>
                    <option value="Toxic Inhalation / Fumes">Toxic Inhalation / Fumes</option>
                    <option value="Slip / Fall">Slip / Fall</option>
                    <option value="Equipment Breakage">Equipment Breakage</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Severity Level</Label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs font-bold"
                  >
                    <option value="Minor">Minor (First aid on spot)</option>
                    <option value="Moderate">Moderate (Clinic visit needed)</option>
                    <option value="Severe">Severe (Emergency hospital)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Safety Officer / In-charge</Label>
                  <Input
                    value={formData.safetyOfficer}
                    onChange={(e) => setFormData({ ...formData, safetyOfficer: e.target.value })}
                    placeholder="e.g. Prof. Saima Tariq"
                    className="text-xs mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Incident Event Description</Label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what happened, equipment involved, sequence of events..."
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">First Aid & Medical Treatment Administered</Label>
                  <textarea
                    rows={2}
                    value={formData.treatment}
                    onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                    placeholder="e.g. Eye wash station used for 15 mins, sterile dressing applied..."
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Root Cause & Corrective / Preventive Action</Label>
                  <textarea
                    rows={2}
                    value={formData.correctiveAction}
                    onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
                    placeholder="Action taken to ensure this hazard does not occur again..."
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
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
                  {editingIncident ? 'Update Record' : 'Submit Incident Report'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-bold text-xs">
                  {viewingIncident.id}
                </span>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">{viewingIncident.incidentType}</h3>
                  <p className="text-xs text-zinc-500">{viewingIncident.date} at {viewingIncident.time}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-zinc-500 block">Person Involved:</span>
                  <span className="font-bold text-zinc-900">{viewingIncident.personInvolved}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Severity:</span>
                  <span className="font-bold text-red-600">{viewingIncident.severity}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Lab Location:</span>
                  <span className="font-medium text-zinc-900">{viewingIncident.labName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Investigated By:</span>
                  <span className="font-medium text-zinc-900">{viewingIncident.safetyOfficer}</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block font-bold uppercase tracking-wider mb-1">Event Description:</span>
                <p className="text-zinc-800 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                  {viewingIncident.description}
                </p>
              </div>

              <div>
                <span className="text-zinc-500 block font-bold uppercase tracking-wider mb-1">Medical Response & First Aid:</span>
                <p className="text-zinc-800 bg-red-50/50 p-2.5 rounded-lg border border-red-100 text-red-900">
                  {viewingIncident.treatment}
                </p>
              </div>

              <div>
                <span className="text-zinc-500 block font-bold uppercase tracking-wider mb-1">Root Cause & Preventive Action:</span>
                <p className="text-zinc-800 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  {viewingIncident.correctiveAction || viewingIncident.rootCause}
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
