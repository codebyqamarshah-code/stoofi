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
  ArrowLeftRight,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  Layers,
  Users,
  Building,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function IssueReturnPage() {
  const [records, setRecords] = useState([
    {
      id: 'ISS-001',
      equipmentName: 'Precision Vernier Caliper (Mitutoyo 150mm)',
      assetCode: 'VC-014',
      labName: 'Advanced Physics Lab (A-204)',
      borrowerType: 'Student',
      borrowerName: 'Hamza Tariq',
      borrowerId: 'BSCS-2023-042',
      department: 'Department of Computer Science',
      issueDate: '2026-10-10',
      dueDate: '2026-10-12',
      returnDate: '2026-10-12',
      quantity: 1,
      conditionAtIssue: 'Good',
      conditionAtReturn: 'Good (Intact)',
      fineAmount: 0,
      issuedBy: 'Kashif Ali (Lab Tech)',
      receivedBy: 'Kashif Ali (Lab Tech)',
      status: 'Returned',
      remarks: 'Returned in proper case without any damage.'
    },
    {
      id: 'ISS-002',
      equipmentName: 'Digital Storage Oscilloscope 100MHz (Tektronix)',
      assetCode: 'DSO-003',
      labName: 'Advanced Physics Lab (A-204)',
      borrowerType: 'Faculty',
      borrowerName: 'Engr. Haris Mehmood',
      borrowerId: 'FAC-EMP-108',
      department: 'Robotics & Mechatronics',
      issueDate: '2026-10-08',
      dueDate: '2026-10-15',
      returnDate: '-',
      quantity: 1,
      conditionAtIssue: 'Excellent',
      conditionAtReturn: 'Pending Return',
      fineAmount: 0,
      issuedBy: 'Kashif Ali (Lab Tech)',
      receivedBy: '-',
      status: 'Active',
      remarks: 'Issued for FYP hardware waveform verification.'
    },
    {
      id: 'ISS-003',
      equipmentName: 'Arduino Mega 2560 Sensor Kit',
      assetCode: 'ARD-088',
      labName: 'Robotics, IoT & Embedded Systems Lab (R-105)',
      borrowerType: 'Student',
      borrowerName: 'Ayesha Nadeem',
      borrowerId: 'BSR-2022-019',
      department: 'Robotics & Mechatronics',
      issueDate: '2026-09-28',
      dueDate: '2026-10-05',
      returnDate: '-',
      quantity: 1,
      conditionAtIssue: 'Brand New',
      conditionAtReturn: 'Overdue',
      fineAmount: 350,
      issuedBy: 'Usman Ghani',
      receivedBy: '-',
      status: 'Overdue',
      remarks: 'Student contacted; promised return by tomorrow.'
    },
    {
      id: 'ISS-004',
      equipmentName: 'Digital Multimeter (Fluke 87V)',
      assetCode: 'MM-022',
      labName: 'Robotics, IoT & Embedded Systems Lab (R-105)',
      borrowerType: 'Student',
      borrowerName: 'Zubair Ahmed',
      borrowerId: 'FSC-2025-104',
      department: 'Pre-Engineering',
      issueDate: '2026-10-01',
      dueDate: '2026-10-03',
      returnDate: '2026-10-04',
      quantity: 1,
      conditionAtIssue: 'Good',
      conditionAtReturn: 'Probe wire cracked',
      fineAmount: 200,
      issuedBy: 'Usman Ghani',
      receivedBy: 'Usman Ghani',
      status: 'Returned with Fine',
      remarks: 'Black probe wire tip damaged. Late fine + replacement cable fee paid.'
    },
    {
      id: 'ISS-005',
      equipmentName: 'Compound Binocular Microscope (Olympus CX23)',
      assetCode: 'MIC-006',
      labName: 'Molecular Biology & Genetics Lab (B-102)',
      borrowerType: 'Student',
      borrowerName: 'Fatima Noor',
      borrowerId: 'MED-2024-081',
      department: 'Pre-Medical',
      issueDate: '2026-10-11',
      dueDate: '2026-10-13',
      returnDate: '-',
      quantity: 1,
      conditionAtIssue: 'Good',
      conditionAtReturn: 'Pending Return',
      fineAmount: 0,
      issuedBy: 'Noman Bashir',
      receivedBy: '-',
      status: 'Active',
      remarks: 'Issued for onion root cell cytology assignment.'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedBorrowerType, setSelectedBorrowerType] = useState('All');

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [viewingRecord, setViewingRecord] = useState(null);
  const [returningRecord, setReturningRecord] = useState(null);

  const [issueFormData, setIssueFormData] = useState({
    equipmentName: '',
    assetCode: '',
    labName: 'Advanced Physics Lab (A-204)',
    borrowerType: 'Student',
    borrowerName: '',
    borrowerId: '',
    department: 'Computer Science',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: 1,
    conditionAtIssue: 'Good',
    issuedBy: 'Lab Technician',
    remarks: ''
  });

  const [returnFormData, setReturnFormData] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    conditionAtReturn: 'Good (Intact)',
    fineAmount: 0,
    receivedBy: 'Lab Technician',
    status: 'Returned',
    remarks: ''
  });

  const filteredRecords = records.filter(item => {
    const matchesSearch =
      item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.borrowerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || item.status.includes(selectedStatus);
    const matchesBorrowerType = selectedBorrowerType === 'All' || item.borrowerType === selectedBorrowerType;

    return matchesSearch && matchesStatus && matchesBorrowerType;
  });

  const handleOpenIssueModal = () => {
    setIssueFormData({
      equipmentName: '',
      assetCode: '',
      labName: 'Advanced Physics Lab (A-204)',
      borrowerType: 'Student',
      borrowerName: '',
      borrowerId: '',
      department: 'Computer Science',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: 1,
      conditionAtIssue: 'Good',
      issuedBy: 'Lab Technician',
      remarks: ''
    });
    setIsIssueModalOpen(true);
  };

  const handleSaveIssue = (e) => {
    e.preventDefault();
    const newId = `ISS-${String(records.length + 1).padStart(3, '0')}`;
    const newRecord = {
      ...issueFormData,
      id: newId,
      returnDate: '-',
      conditionAtReturn: 'Pending Return',
      fineAmount: 0,
      receivedBy: '-',
      status: 'Active'
    };
    setRecords([newRecord, ...records]);
    setIsIssueModalOpen(false);
  };

  const handleOpenReturnModal = (record) => {
    setReturningRecord(record);
    setReturnFormData({
      returnDate: new Date().toISOString().split('T')[0],
      conditionAtReturn: 'Good (Intact)',
      fineAmount: 0,
      receivedBy: 'Lab Technician',
      status: 'Returned',
      remarks: 'Returned in good condition.'
    });
    setIsReturnModalOpen(true);
  };

  const handleSaveReturn = (e) => {
    e.preventDefault();
    if (!returningRecord) return;

    setRecords(records.map(r => {
      if (r.id === returningRecord.id) {
        const finalStatus = Number(returnFormData.fineAmount) > 0 ? 'Returned with Fine' : 'Returned';
        return {
          ...r,
          returnDate: returnFormData.returnDate,
          conditionAtReturn: returnFormData.conditionAtReturn,
          fineAmount: Number(returnFormData.fineAmount),
          receivedBy: returnFormData.receivedBy,
          status: finalStatus,
          remarks: `${r.remarks ? r.remarks + ' | ' : ''}${returnFormData.remarks}`
        };
      }
      return r;
    }));

    setIsReturnModalOpen(false);
    setReturningRecord(null);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this issue record?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const exportHeaders = ['Slip ID', 'Equipment Name', 'Asset Code', 'Lab', 'Borrower Type', 'Borrower Name', 'Borrower ID', 'Dept', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine Amount'];
  const exportData = filteredRecords.map(r => [
    r.id,
    r.equipmentName,
    r.assetCode,
    r.labName,
    r.borrowerType,
    r.borrowerName,
    r.borrowerId,
    r.department,
    r.issueDate,
    r.dueDate,
    r.returnDate,
    r.status,
    `PKR ${r.fineAmount}`
  ]);

  const activeIssuedCount = records.filter(r => r.status === 'Active').length;
  const overdueCount = records.filter(r => r.status === 'Overdue').length;
  const returnedCount = records.filter(r => r.status.includes('Returned')).length;
  const totalFines = records.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-zinc-600">
          <Link href="/dashboard" className="hover:text-emerald-700 font-medium">Dashboard</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <Link href="/dashboard/labs" className="hover:text-emerald-700 font-medium">Labs</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Equipment Issue & Return</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Circulation Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Equipment Issue & Return Log</h1>
          <p className="text-emerald-200/90 text-sm mt-1">
            Check-out laboratory apparatus and assets to students and faculty with condition logging and return tracking
          </p>
        </div>
        <Button
          onClick={handleOpenIssueModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-2 font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Issue Equipment Slip
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Currently Issued</div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">{activeIssuedCount}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">With students & faculty</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Overdue Items</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</div>
            <div className="text-[11px] text-red-600 font-medium mt-1">Due date passed</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Returned Safely</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{returnedCount}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">In stock & verified</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase">Damage / Late Fines</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">PKR {totalFines}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">Collected / Billed</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
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
              placeholder="Search slip ID, asset name, asset code, borrower..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <select
            value={selectedBorrowerType}
            onChange={(e) => setSelectedBorrowerType(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-700"
          >
            <option value="All">All Borrowers</option>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Lab Assistant">Lab Assistant</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-zinc-200 rounded-lg px-3 py-2 bg-white text-zinc-700"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active (Issued)</option>
            <option value="Overdue">Overdue</option>
            <option value="Returned">Returned</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => exportToCSV('Lab_Issue_Return_Log', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button
            onClick={() => exportToExcel('Lab_Issue_Return_Log', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <FileText className="w-3.5 h-3.5" /> Excel
          </Button>
          <Button
            onClick={() => printData('Lab Equipment Issue & Return Slips', exportHeaders, exportData)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-200 flex items-center gap-1.5 text-zinc-700"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Slip #</th>
                <th className="py-3 px-4">Equipment & Asset ID</th>
                <th className="py-3 px-4">Issued To</th>
                <th className="py-3 px-4">Lab Location</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-zinc-500 text-xs">
                    No issue or return records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-900 whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">{r.equipmentName}</div>
                      <div className="text-[11px] text-emerald-700 font-mono font-medium">Asset ID: {r.assetCode} (Qty: {r.quantity})</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">{r.borrowerName}</div>
                      <div className="text-[11px] text-zinc-500">{r.borrowerType} • {r.borrowerId}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-700 whitespace-nowrap">
                      {r.labName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-600">
                      {r.issueDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-semibold ${r.status === 'Overdue' ? 'text-red-600' : 'text-zinc-700'}`}>
                        {r.dueDate}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                        r.status === 'Overdue' ? 'bg-red-100 text-red-800 animate-pulse' :
                        r.status === 'Returned with Fine' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => { setViewingRecord(r); setIsViewModalOpen(true); }}
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {(r.status === 'Active' || r.status === 'Overdue') && (
                          <Button
                            onClick={() => handleOpenReturnModal(r)}
                            size="sm"
                            className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Return
                          </Button>
                        )}

                        <Button
                          onClick={() => handleDelete(r.id)}
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

      {/* Issue Slip Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Issue Laboratory Equipment</h2>
                  <p className="text-xs text-zinc-500">Record check-out slip to student or faculty member</p>
                </div>
              </div>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIssue} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Equipment Name</Label>
                  <Input
                    value={issueFormData.equipmentName}
                    onChange={(e) => setIssueFormData({ ...issueFormData, equipmentName: e.target.value })}
                    placeholder="e.g. Precision Vernier Caliper"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Asset Code / Inventory ID</Label>
                  <Input
                    value={issueFormData.assetCode}
                    onChange={(e) => setIssueFormData({ ...issueFormData, assetCode: e.target.value })}
                    placeholder="e.g. VC-014 or DSO-003"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Laboratory</Label>
                  <select
                    value={issueFormData.labName}
                    onChange={(e) => setIssueFormData({ ...issueFormData, labName: e.target.value })}
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
                  <Label className="text-xs font-semibold text-zinc-700">Borrower Type</Label>
                  <select
                    value={issueFormData.borrowerType}
                    onChange={(e) => setIssueFormData({ ...issueFormData, borrowerType: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Lab Assistant">Lab Assistant</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Borrower Full Name</Label>
                  <Input
                    value={issueFormData.borrowerName}
                    onChange={(e) => setIssueFormData({ ...issueFormData, borrowerName: e.target.value })}
                    placeholder="e.g. Hamza Tariq"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Roll No / Employee ID</Label>
                  <Input
                    value={issueFormData.borrowerId}
                    onChange={(e) => setIssueFormData({ ...issueFormData, borrowerId: e.target.value })}
                    placeholder="e.g. BSCS-2023-042"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Department / Class</Label>
                  <Input
                    value={issueFormData.department}
                    onChange={(e) => setIssueFormData({ ...issueFormData, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Quantity</Label>
                  <Input
                    type="number"
                    value={issueFormData.quantity}
                    onChange={(e) => setIssueFormData({ ...issueFormData, quantity: parseInt(e.target.value) || 1 })}
                    className="text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Issue Date</Label>
                  <Input
                    type="date"
                    value={issueFormData.issueDate}
                    onChange={(e) => setIssueFormData({ ...issueFormData, issueDate: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Expected Due Date</Label>
                  <Input
                    type="date"
                    value={issueFormData.dueDate}
                    onChange={(e) => setIssueFormData({ ...issueFormData, dueDate: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Condition at Issue</Label>
                  <select
                    value={issueFormData.conditionAtIssue}
                    onChange={(e) => setIssueFormData({ ...issueFormData, conditionAtIssue: e.target.value })}
                    className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-zinc-700">Issued By (Staff)</Label>
                  <Input
                    value={issueFormData.issuedBy}
                    onChange={(e) => setIssueFormData({ ...issueFormData, issuedBy: e.target.value })}
                    placeholder="e.g. Kashif Ali"
                    className="text-xs mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-zinc-700">Purpose / Remarks</Label>
                  <Input
                    value={issueFormData.remarks}
                    onChange={(e) => setIssueFormData({ ...issueFormData, remarks: e.target.value })}
                    placeholder="e.g. For final year project hardware experimentation"
                    className="text-xs mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                >
                  Generate Issue Slip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {isReturnModalOpen && returningRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Receive Returned Item</h3>
                  <p className="text-xs text-zinc-500">Slip #{returningRecord.id} • {returningRecord.equipmentName}</p>
                </div>
              </div>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReturn} className="space-y-4">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs space-y-1 text-zinc-700">
                <div>Borrower: <strong>{returningRecord.borrowerName} ({returningRecord.borrowerId})</strong></div>
                <div>Asset Code: <strong>{returningRecord.assetCode}</strong></div>
                <div>Issued on: <strong>{returningRecord.issueDate}</strong> | Due Date: <strong>{returningRecord.dueDate}</strong></div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Return Date</Label>
                <Input
                  type="date"
                  value={returnFormData.returnDate}
                  onChange={(e) => setReturnFormData({ ...returnFormData, returnDate: e.target.value })}
                  className="text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Condition at Return</Label>
                <select
                  value={returnFormData.conditionAtReturn}
                  onChange={(e) => setReturnFormData({ ...returnFormData, conditionAtReturn: e.target.value })}
                  className="w-full mt-1 border border-zinc-300 rounded-lg p-2 text-xs"
                >
                  <option value="Good (Intact)">Good (Intact - No Damage)</option>
                  <option value="Minor Scratches">Minor Scratches (Acceptable)</option>
                  <option value="Damaged / Broken Parts">Damaged / Broken Parts (Charge Fine)</option>
                  <option value="Lost / Unreturned">Lost / Not Returned (Replacement Required)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Late / Damage Fine (PKR)</Label>
                <Input
                  type="number"
                  value={returnFormData.fineAmount}
                  onChange={(e) => setReturnFormData({ ...returnFormData, fineAmount: e.target.value })}
                  placeholder="0"
                  className="text-xs mt-1 font-semibold text-amber-600"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Received By (Staff)</Label>
                <Input
                  value={returnFormData.receivedBy}
                  onChange={(e) => setReturnFormData({ ...returnFormData, receivedBy: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-zinc-700">Return Notes & Verification Remarks</Label>
                <Input
                  value={returnFormData.remarks}
                  onChange={(e) => setReturnFormData({ ...returnFormData, remarks: e.target.value })}
                  placeholder="e.g. Tested working, safely placed back on shelf"
                  className="text-xs mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
                <Button type="button" variant="outline" onClick={() => setIsReturnModalOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium">
                  Confirm Return & Restock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {viewingRecord.id}
                </span>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">{viewingRecord.equipmentName}</h3>
                  <p className="text-xs text-zinc-500">Asset Code: {viewingRecord.assetCode}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-zinc-500 block">Borrower:</span>
                  <span className="font-bold text-zinc-900">{viewingRecord.borrowerName}</span>
                  <span className="text-zinc-500 text-[11px] block">{viewingRecord.borrowerType} ({viewingRecord.borrowerId})</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Department:</span>
                  <span className="font-semibold text-zinc-900">{viewingRecord.department}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Issue Date:</span>
                  <span className="font-medium text-zinc-800">{viewingRecord.issueDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Due Date:</span>
                  <span className="font-medium text-zinc-800">{viewingRecord.dueDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Return Date:</span>
                  <span className="font-medium text-zinc-800">{viewingRecord.returnDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Fine Incurred:</span>
                  <span className="font-bold text-amber-600">PKR {viewingRecord.fineAmount}</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block">Condition History:</span>
                <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-100 mt-1">
                  Issued: <strong>{viewingRecord.conditionAtIssue}</strong> → Returned: <strong>{viewingRecord.conditionAtReturn}</strong>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block">Staff in Charge:</span>
                <div className="text-zinc-800 font-medium">Issued by: {viewingRecord.issuedBy} | Received by: {viewingRecord.receivedBy}</div>
              </div>

              <div>
                <span className="text-zinc-500 block">Remarks & Logs:</span>
                <p className="text-zinc-800 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 mt-1">
                  {viewingRecord.remarks || 'No additional remarks'}
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
