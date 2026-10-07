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
  FlaskConical, 
  Plus, 
  Building, 
  Clock, 
  ShieldAlert, 
  Users, 
  Eye, 
  X,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function ManageLabsPage() {
  const [labs, setLabs] = useState([
    {
      id: 'LAB-001',
      name: 'Advanced Physics & Mechanics Lab',
      code: 'PHY-LAB-01',
      category: 'Physics & Mechanics',
      campus: 'Main Campus',
      building: 'Science Block A',
      floor: '2nd Floor',
      roomNumber: 'A-204',
      capacity: 35,
      inCharge: 'Dr. Farooq Khan (Associate Prof)',
      assistant: 'Kashif Ali (Senior Lab Technician)',
      status: 'Active',
      description: 'Equipped with optics benches, mechanics kits, oscilloscopes, and precision measurement meters.',
      safetyInstructions: 'Safety goggles mandatory during laser & high voltage experiments. Do not touch exposed terminals.',
      facilities: 'Projector, Fume Exhaust, Stabilized 220V AC/DC Power Supplies, First Aid Kit, Fire Extinguisher',
      openingTime: '08:30 AM',
      closingTime: '04:30 PM'
    },
    {
      id: 'LAB-002',
      name: 'Software Engineering & AI Lab 1',
      code: 'CS-LAB-01',
      category: 'Computer Science & IT',
      campus: 'Main Campus',
      building: 'IT & Engineering Complex',
      floor: '3rd Floor',
      roomNumber: 'IT-302',
      capacity: 40,
      inCharge: 'Mr. Ali Raza (Assistant Prof)',
      assistant: 'Waqas Mehmood (Network Admin)',
      status: 'Active',
      description: 'High-performance core i7 workstations with GPU acceleration, dual gigabit ethernet, and UPS backup.',
      safetyInstructions: 'No food or drinks allowed near PC stations. Keep server rack locked.',
      facilities: '40x Core i7 PCs, Smart Interactive Board, High-speed Fiber Internet, 10kVA Online UPS',
      openingTime: '08:00 AM',
      closingTime: '06:00 PM'
    },
    {
      id: 'LAB-003',
      name: 'Organic & Analytical Chemistry Lab',
      code: 'CHEM-LAB-01',
      category: 'Chemistry & Reagents',
      campus: 'Main Campus',
      building: 'Science Block B',
      floor: 'Ground Floor',
      roomNumber: 'B-012',
      capacity: 30,
      inCharge: 'Mrs. Sadia Tariq (Head of Chemistry)',
      assistant: 'Imran Ashraf (Chemical Custodian)',
      status: 'Active',
      description: 'Equipped with chemical reagent lockers, automated fume hoods, and titration stations.',
      safetyInstructions: 'Full lab coat, nitrile gloves and safety goggles required. In case of spill, notify assistant immediately.',
      facilities: 'Emergency Eyewash Station, Chemical Fume Hood, Reagent Safe Lockers, Acid Wash Sink',
      openingTime: '09:00 AM',
      closingTime: '03:30 PM'
    },
    {
      id: 'LAB-004',
      name: 'Robotics & Embedded IoT Lab',
      code: 'ROB-LAB-01',
      category: 'Robotics, IoT & Embedded Systems',
      campus: 'City Campus',
      building: 'Innovation Hub',
      floor: '1st Floor',
      roomNumber: 'IH-105',
      capacity: 25,
      inCharge: 'Engr. Bilal Ahmed',
      assistant: 'Zubair Shah (Electronics Tech)',
      status: 'Maintenance',
      description: 'Arduino, Raspberry Pi, 3D printing, soldering stations, and automation testbeds.',
      safetyInstructions: 'Ensure soldering irons are turned off after usage. Wear ESD wrist strap.',
      facilities: '2x 3D Printers, Soldering Exhaust, Oscilloscopes, Function Generators, Tool Kits',
      openingTime: '08:30 AM',
      closingTime: '05:00 PM'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [viewingLab, setViewingLab] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [campusFilter, setCampusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const initialForm = {
    name: '',
    code: '',
    category: 'Computer Science & IT',
    campus: 'Main Campus',
    building: '',
    floor: '',
    roomNumber: '',
    capacity: 30,
    inCharge: '',
    assistant: '',
    status: 'Active',
    description: '',
    safetyInstructions: '',
    facilities: '',
    openingTime: '08:30 AM',
    closingTime: '04:30 PM'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (lab) => {
    setFormData({ ...lab });
    setIsEditing(true);
    setEditId(lab.id);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Lab Name is required');
      return;
    }

    if (isEditing) {
      setLabs(labs.map(l => l.id === editId ? { ...l, ...formData } : l));
    } else {
      setLabs([
        ...labs,
        {
          id: `LAB-${String(labs.length + 1).padStart(3, '0')}`,
          ...formData,
          code: formData.code || `LAB-${Math.floor(100 + Math.random() * 900)}`
        }
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to remove this laboratory?')) return;
    setLabs(labs.filter(l => l.id !== id));
  };

  const filtered = labs.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.inCharge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = campusFilter === 'All' || l.campus === campusFilter;
    const matchesCategory = categoryFilter === 'All' || l.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesCampus && matchesCategory && matchesStatus;
  });

  const exportData = filtered.map(l => ({
    'Lab Code': l.code,
    'Lab Name': l.name,
    'Category': l.category,
    'Campus': l.campus,
    'Building/Floor': `${l.building}, ${l.floor} (Room ${l.roomNumber})`,
    'Capacity': `${l.capacity} Students`,
    'In-charge': l.inCharge,
    'Assistant': l.assistant,
    'Operating Hours': `${l.openingTime} - ${l.closingTime}`,
    'Status': l.status
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Manage Laboratories</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Register, configure and manage campus lab locations, facilities and personnel</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenAdd} className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold h-9 px-4 rounded-xl shadow-xs">
            <Plus className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Register New Lab
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Filter Bar */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search lab name, code, in-charge..." 
                className="pl-9 w-full sm:w-[220px] bg-white border-zinc-300 text-zinc-950 text-xs font-medium h-9"
              />
            </div>

            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-bold focus-visible:ring-zinc-400"
            >
              <option value="All">All Categories</option>
              <option value="Computer Science & IT">Computer Science & IT</option>
              <option value="Physics & Mechanics">Physics & Mechanics</option>
              <option value="Chemistry & Reagents">Chemistry & Reagents</option>
              <option value="Biology & Life Sciences">Biology & Life Sciences</option>
              <option value="Robotics, IoT & Embedded Systems">Robotics & IoT</option>
            </select>

            <select 
              value={campusFilter}
              onChange={e => setCampusFilter(e.target.value)}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-bold focus-visible:ring-zinc-400"
            >
              <option value="All">All Campuses</option>
              <option value="Main Campus">Main Campus</option>
              <option value="City Campus">City Campus</option>
            </select>

            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-bold focus-visible:ring-zinc-400"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-xs">
            <button onClick={() => exportToCSV(exportData, 'Labs_Directory')} className="p-2 hover:bg-zinc-100 text-zinc-700 border-r border-zinc-200" title="CSV">
              <FileText className="h-4 w-4" />
            </button>
            <button onClick={() => exportToExcel(exportData, 'Labs_Directory')} className="p-2 hover:bg-zinc-100 text-zinc-700 border-r border-zinc-200" title="Excel">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={() => printData('Laboratories Directory', exportData)} className="p-2 hover:bg-zinc-100 text-zinc-700" title="Print">
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Labs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">Lab Info & Code</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Location & Room</th>
                <th className="px-4 py-3.5">Capacity</th>
                <th className="px-4 py-3.5">In-charge & Tech</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((lab) => (
                <tr key={lab.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                      <FlaskConical className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      {lab.name}
                    </div>
                    <div className="text-xs font-mono text-zinc-600 mt-0.5">{lab.code}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {lab.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-bold text-zinc-900">{lab.building} • {lab.floor}</div>
                    <div className="text-[11px] text-zinc-500 font-medium">Room: {lab.roomNumber} ({lab.campus})</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-800">
                      <Users className="h-3.5 w-3.5 text-zinc-500" /> {lab.capacity} Seats
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-bold text-zinc-900">{lab.inCharge}</div>
                    <div className="text-[11px] text-zinc-500">Tech: {lab.assistant || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      lab.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : lab.status === 'Maintenance'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}>
                      {lab.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button onClick={() => setViewingLab(lab)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100" title="View Full Details">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button onClick={() => handleOpenEdit(lab)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100" title="Edit Lab">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button onClick={() => handleDelete(lab.id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add / Edit Lab Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-zinc-950">{isEditing ? 'Edit Laboratory' : 'Register New Laboratory'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-900 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Lab Name <span className="text-rose-500">*</span></Label>
                  <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Physics Mechanics Lab" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Lab Code</Label>
                  <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. PHY-LAB-01" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Category</Label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium">
                    <option value="Computer Science & IT">Computer Science & IT</option>
                    <option value="Physics & Mechanics">Physics & Mechanics</option>
                    <option value="Chemistry & Reagents">Chemistry & Reagents</option>
                    <option value="Biology & Life Sciences">Biology & Life Sciences</option>
                    <option value="Robotics, IoT & Embedded Systems">Robotics & IoT</option>
                    <option value="Language & Multimedia Lab">Language Lab</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Campus</Label>
                  <select value={formData.campus} onChange={e => setFormData({ ...formData, campus: e.target.value })} className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium">
                    <option value="Main Campus">Main Campus</option>
                    <option value="City Campus">City Campus</option>
                    <option value="North Campus">North Campus</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Status</Label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium">
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Building / Block</Label>
                  <Input value={formData.building} onChange={e => setFormData({ ...formData, building: e.target.value })} placeholder="Block A" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Floor</Label>
                  <Input value={formData.floor} onChange={e => setFormData({ ...formData, floor: e.target.value })} placeholder="2nd Floor" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Room Number</Label>
                  <Input value={formData.roomNumber} onChange={e => setFormData({ ...formData, roomNumber: e.target.value })} placeholder="A-204" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Capacity (Seats)</Label>
                  <Input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} placeholder="30" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Lab In-charge / Supervisor</Label>
                  <Input value={formData.inCharge} onChange={e => setFormData({ ...formData, inCharge: e.target.value })} placeholder="Dr. Farooq Khan" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Assistant / Technician</Label>
                  <Input value={formData.assistant} onChange={e => setFormData({ ...formData, assistant: e.target.value })} placeholder="Kashif Ali" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Opening Time</Label>
                  <Input value={formData.openingTime} onChange={e => setFormData({ ...formData, openingTime: e.target.value })} placeholder="08:30 AM" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Closing Time</Label>
                  <Input value={formData.closingTime} onChange={e => setFormData({ ...formData, closingTime: e.target.value })} placeholder="04:30 PM" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase">Available Facilities / Resources</Label>
                <Input value={formData.facilities} onChange={e => setFormData({ ...formData, facilities: e.target.value })} placeholder="Projector, Fume Hood, 40 Workstations, Stabilized AC/DC" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase">Safety Instructions & Emergency Protocols</Label>
                <textarea value={formData.safetyInstructions} onChange={e => setFormData({ ...formData, safetyInstructions: e.target.value })} rows={2} placeholder="Mandatory goggles, chemical spill protocols, emergency exit doors..." className="w-full rounded-md border border-zinc-300 bg-white p-2.5 text-xs text-zinc-950 font-medium resize-none" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase">Description & Scope</Label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="Brief summary of lab purpose and curriculum equipment..." className="w-full rounded-md border border-zinc-300 bg-white p-2.5 text-xs text-zinc-950 font-medium resize-none" />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="border-zinc-300 font-bold">Cancel</Button>
                <Button type="submit" className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6">{isEditing ? 'UPDATE LAB' : 'SAVE LAB'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Lab Detail Modal */}
      {viewingLab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">{viewingLab.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono">{viewingLab.code} • {viewingLab.category}</p>
                </div>
              </div>
              <button onClick={() => setViewingLab(null)} className="text-zinc-400 hover:text-zinc-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Campus</span>
                <span className="font-bold text-zinc-950">{viewingLab.campus}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Location</span>
                <span className="font-bold text-zinc-950">{viewingLab.building}, {viewingLab.floor}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Room & Capacity</span>
                <span className="font-bold text-zinc-950">{viewingLab.roomNumber} ({viewingLab.capacity} Seats)</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">In-charge</span>
                <span className="font-bold text-zinc-950">{viewingLab.inCharge}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Assistant / Tech</span>
                <span className="font-bold text-zinc-950">{viewingLab.assistant || 'N/A'}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Operational Hours</span>
                <span className="font-bold text-zinc-950">{viewingLab.openingTime} - {viewingLab.closingTime}</span>
              </div>
            </div>

            {viewingLab.facilities && (
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl text-xs">
                <span className="font-bold text-emerald-950 block mb-1">Available Facilities & Utilities:</span>
                <p className="text-emerald-800 leading-relaxed font-medium">{viewingLab.facilities}</p>
              </div>
            )}

            {viewingLab.safetyInstructions && (
              <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-xl text-xs">
                <span className="font-bold text-rose-950 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="h-4 w-4 text-rose-600" /> Safety Instructions:
                </span>
                <p className="text-rose-800 leading-relaxed font-medium">{viewingLab.safetyInstructions}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setViewingLab(null)} className="bg-zinc-950 text-white font-bold px-5 text-xs">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
