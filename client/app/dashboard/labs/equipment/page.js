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
  Cpu, 
  Plus, 
  Monitor, 
  Laptop, 
  HardDrive, 
  Wrench, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  FlaskConical,
  Layers,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';
import labService from '@/services/labService';

export default function EquipmentAssetsPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'science', 'computer'

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const data = await labService.getEquipment();
      if (Array.isArray(data)) setEquipmentList(data);
    } catch (err) {
      console.error('Error loading equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [labFilter, setLabFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const initialForm = {
    name: '',
    code: '',
    category: 'Physics & Mechanics',
    lab: 'Physics Lab (Block A)',
    brand: '',
    model: '',
    serialNumber: '',
    quantity: 1,
    availableQty: 1,
    purchaseDate: '2026-01-01',
    purchaseCost: '',
    supplier: '',
    warrantyExpiry: '',
    condition: 'Good',
    status: 'Available',
    maintenanceDate: '',
    nextMaintenanceDate: '',
    remarks: '',
    isComputer: false,
    compSpecs: {
      compNumber: '',
      cpu: 'Intel Core i7',
      ram: '16 GB',
      storage: '512 GB SSD',
      os: 'Windows 11 Pro',
      ipAddress: '',
      macAddress: '',
      monitor: '24" FHD',
      keyboardMouse: 'Standard USB Set',
      ups: 'APC 650VA',
      software: 'VS Code, Python, MS Office',
      internetStatus: 'Connected',
      systemCondition: 'Good'
    }
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({ ...item });
    setIsEditing(true);
    setEditId(item.id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Equipment Name is required');
      return;
    }

    try {
      const payload = isEditing ? { ...formData, id: editId, _id: editId } : formData;
      const saved = await labService.saveEquipment(payload);
      if (saved) {
        if (isEditing) {
          setEquipmentList(equipmentList.map(item => (item._id === editId || item.id === editId) ? saved : item));
        } else {
          setEquipmentList([saved, ...equipmentList]);
        }
      }
    } catch (err) {
      console.error('Failed to save equipment:', err);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await labService.deleteEquipment(id);
      setEquipmentList(equipmentList.filter(item => item._id !== id && item.id !== id));
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  const filtered = equipmentList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLab = labFilter === 'All' || item.lab === labFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'computer' && item.isComputer) || 
                       (activeTab === 'science' && !item.isComputer);
    return matchesSearch && matchesLab && matchesStatus && matchesTab;
  });

  const exportData = filtered.map(item => ({
    'Asset ID': item.code,
    'Equipment Name': item.name,
    'Category': item.category,
    'Lab': item.lab,
    'Brand & Model': `${item.brand} ${item.model}`,
    'Total Qty': item.quantity,
    'Available Qty': item.availableQty,
    'Condition': item.condition,
    'Status': item.status,
    'Supplier': item.supplier || '-',
    'Warranty Expiry': item.warrantyExpiry || '-'
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Equipment & Asset Inventory</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Track laboratory equipment, apparatus, computers, maintenance cycles and warranties</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenAdd} className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold h-9 px-4 rounded-xl shadow-xs">
            <Plus className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Register Equipment / Asset
          </Button>
        </div>
      </div>

      {/* Tab Filter & Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        {[
          { id: 'all', label: 'All Equipment & Assets', count: equipmentList.length, icon: Layers },
          { id: 'science', label: 'Science Apparatus & Instruments', count: equipmentList.filter(e => !e.isComputer).length, icon: FlaskConical },
          { id: 'computer', label: 'Computer Workstations & IT Hardware', count: equipmentList.filter(e => e.isComputer).length, icon: Monitor },
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {tab.label}
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-700'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Filters */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search equipment, code, brand..." 
                className="pl-9 w-full sm:w-[230px] bg-white border-zinc-300 text-zinc-950 text-xs font-medium h-9"
              />
            </div>

            <select 
              value={labFilter}
              onChange={e => setLabFilter(e.target.value)}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-bold focus-visible:ring-zinc-400"
            >
              <option value="All">All Labs</option>
              <option value="Physics Lab (Block A)">Physics Lab</option>
              <option value="Software Engineering & AI Lab 1">Computer Lab 1</option>
              <option value="Organic & Analytical Chemistry Lab">Chemistry Lab</option>
              <option value="Robotics & Embedded IoT Lab">Robotics Lab</option>
            </select>

            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-bold focus-visible:ring-zinc-400"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>

          <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-xs">
            <button onClick={() => exportToCSV(exportData, 'Equipment_Inventory')} className="p-2 hover:bg-zinc-100 text-zinc-700 border-r border-zinc-200" title="CSV">
              <FileText className="h-4 w-4" />
            </button>
            <button onClick={() => exportToExcel(exportData, 'Equipment_Inventory')} className="p-2 hover:bg-zinc-100 text-zinc-700 border-r border-zinc-200" title="Excel">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={() => printData('Equipment Inventory List', exportData)} className="p-2 hover:bg-zinc-100 text-zinc-700" title="Print">
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">Asset Code & Name</th>
                <th className="px-4 py-3.5">Lab Location</th>
                <th className="px-4 py-3.5">Brand / Model</th>
                <th className="px-4 py-3.5 text-center">Total / Avail Qty</th>
                <th className="px-4 py-3.5">Condition</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                      <p className="text-xs font-semibold text-zinc-600">Loading equipment inventory...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <Cpu className="w-10 h-10 text-zinc-300 mb-2" />
                      <p className="font-bold text-sm text-zinc-800">No equipment found</p>
                      <p className="text-xs text-zinc-500 mt-1">Click &quot;Register Equipment&quot; above to add laboratory assets.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                      {item.isComputer ? (
                        <Monitor className="h-4 w-4 text-blue-600 shrink-0" />
                      ) : (
                        <Cpu className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                      {item.name}
                    </div>
                    <div className="text-xs font-mono text-zinc-600 mt-0.5">{item.code}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-bold text-zinc-900">{item.lab}</div>
                    <div className="text-[11px] text-zinc-500">{item.category}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-bold text-zinc-900">{item.brand} {item.model}</div>
                    <div className="text-[11px] font-mono text-zinc-500">SN: {item.serialNumber || '-'}</div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="text-xs font-black text-zinc-950">
                      <span className="text-emerald-700">{item.availableQty}</span> / {item.quantity}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      item.status === 'Available'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : item.status === 'Under Maintenance'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button onClick={() => setViewingItem(item)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100" title="View Details">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button onClick={() => handleOpenEdit(item)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100" title="Edit Asset">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button onClick={() => handleDelete(item.id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50" title="Delete">
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

      {/* Modal 1: Add / Edit Equipment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-zinc-950">{isEditing ? 'Edit Asset' : 'Register Equipment / Asset'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-900 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-900">
                  <input 
                    type="checkbox" 
                    checked={formData.isComputer} 
                    onChange={e => setFormData({ ...formData, isComputer: e.target.checked })} 
                    className="w-4 h-4 rounded text-zinc-900"
                  />
                  This is a Computer / Workstation Asset (Enable IT Specs tracking)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Equipment / Asset Name <span className="text-rose-500">*</span></Label>
                  <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Vernier Caliper, PC Workstation" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Asset Code / Tag</Label>
                  <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. PHY-VC-001" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Target Lab</Label>
                  <select value={formData.lab} onChange={e => setFormData({ ...formData, lab: e.target.value })} className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium">
                    <option value="Physics Lab (Block A)">Physics Lab</option>
                    <option value="Software Engineering & AI Lab 1">Computer Lab 1</option>
                    <option value="Organic & Analytical Chemistry Lab">Chemistry Lab</option>
                    <option value="Robotics & Embedded IoT Lab">Robotics Lab</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Category</Label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium">
                    <option value="Physics & Mechanics">Physics & Mechanics</option>
                    <option value="Computer Science & IT">Computer Science & IT</option>
                    <option value="Chemistry & Reagents">Chemistry & Reagents</option>
                    <option value="Biology & Life Sciences">Biology & Life Sciences</option>
                    <option value="Robotics, IoT & Embedded Systems">Robotics & IoT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Brand / Manufacturer</Label>
                  <Input value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="Dell, Fluke, Mitutoyo" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Model</Label>
                  <Input value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} placeholder="OptiPlex 7090, 530-104" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Serial Number</Label>
                  <Input value={formData.serialNumber} onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} placeholder="SN-998231" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Total Quantity</Label>
                  <Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Available Quantity</Label>
                  <Input type="number" value={formData.availableQty} onChange={e => setFormData({ ...formData, availableQty: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Condition</Label>
                  <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium">
                    <option value="Good">Good / Calibrated</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Status</Label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium">
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>

              {/* Specialized Computer Lab Specifications Form */}
              {formData.isComputer && (
                <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-xl space-y-4">
                  <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Monitor className="h-4 w-4 text-blue-600" /> Computer & Network Hardware Specifications
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-blue-900 uppercase">PC / Station No.</Label>
                      <Input value={formData.compSpecs?.compNumber || ''} onChange={e => setFormData({ ...formData, compSpecs: { ...formData.compSpecs, compNumber: e.target.value } })} placeholder="PC-01" className="bg-white text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-blue-900 uppercase">Processor / CPU</Label>
                      <Input value={formData.compSpecs?.cpu || ''} onChange={e => setFormData({ ...formData, compSpecs: { ...formData.compSpecs, cpu: e.target.value } })} placeholder="Intel Core i7-11700" className="bg-white text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-blue-900 uppercase">RAM Memory</Label>
                      <Input value={formData.compSpecs?.ram || ''} onChange={e => setFormData({ ...formData, compSpecs: { ...formData.compSpecs, ram: e.target.value } })} placeholder="32 GB DDR4" className="bg-white text-xs h-9" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-blue-900 uppercase">Storage (SSD/HDD)</Label>
                      <Input value={formData.compSpecs?.storage || ''} onChange={e => setFormData({ ...formData, compSpecs: { ...formData.compSpecs, storage: e.target.value } })} placeholder="1TB NVMe SSD" className="bg-white text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-blue-900 uppercase">Operating System</Label>
                      <Input value={formData.compSpecs?.os || ''} onChange={e => setFormData({ ...formData, compSpecs: { ...formData.compSpecs, os: e.target.value } })} placeholder="Ubuntu / Windows 11" className="bg-white text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-blue-900 uppercase">Static IP Address</Label>
                      <Input value={formData.compSpecs?.ipAddress || ''} onChange={e => setFormData({ ...formData, compSpecs: { ...formData.compSpecs, ipAddress: e.target.value } })} placeholder="192.168.10.101" className="bg-white text-xs h-9" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-blue-900 uppercase">Monitor Specs</Label>
                      <Input value={formData.compSpecs?.monitor || ''} onChange={e => setFormData({ ...formData, compSpecs: { ...formData.compSpecs, monitor: e.target.value } })} placeholder="Dell 24 inch FHD" className="bg-white text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-blue-900 uppercase">Keyboard / Mouse / UPS</Label>
                      <Input value={formData.compSpecs?.keyboardMouse || ''} onChange={e => setFormData({ ...formData, compSpecs: { ...formData.compSpecs, keyboardMouse: e.target.value } })} placeholder="Dell Wireless, APC 650VA" className="bg-white text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold text-blue-900 uppercase">Installed Software Suites</Label>
                      <Input value={formData.compSpecs?.software || ''} onChange={e => setFormData({ ...formData, compSpecs: { ...formData.compSpecs, software: e.target.value } })} placeholder="VS Code, Python, MySQL" className="bg-white text-xs h-9" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Supplier</Label>
                  <Input value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} placeholder="Vendor Name" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Warranty Expiry</Label>
                  <Input type="date" value={formData.warrantyExpiry} onChange={e => setFormData({ ...formData, warrantyExpiry: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Next Calibration / Maintenance</Label>
                  <Input type="date" value={formData.nextMaintenanceDate} onChange={e => setFormData({ ...formData, nextMaintenanceDate: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase">Remarks / Storage Location Notes</Label>
                <textarea value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} rows={2} placeholder="Rack #, cabinet position or specific notes..." className="w-full rounded-md border border-zinc-300 bg-white p-2.5 text-xs text-zinc-950 font-medium resize-none" />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="border-zinc-300 font-bold">Cancel</Button>
                <Button type="submit" className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-6">{isEditing ? 'UPDATE ASSET' : 'REGISTER ASSET'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Asset Detail */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                  {viewingItem.isComputer ? <Monitor className="h-6 w-6 text-blue-600" /> : <Cpu className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">{viewingItem.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono">{viewingItem.code} • {viewingItem.category}</p>
                </div>
              </div>
              <button onClick={() => setViewingItem(null)} className="text-zinc-400 hover:text-zinc-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Lab Location</span>
                <span className="font-bold text-zinc-950">{viewingItem.lab}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Brand & Model</span>
                <span className="font-bold text-zinc-950">{viewingItem.brand} {viewingItem.model}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total / Avail</span>
                <span className="font-bold text-zinc-950">{viewingItem.availableQty} / {viewingItem.quantity} Units</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Condition</span>
                <span className="font-bold text-zinc-950">{viewingItem.condition}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Status</span>
                <span className="font-bold text-zinc-950">{viewingItem.status}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Next Maintenance</span>
                <span className="font-bold text-zinc-950">{viewingItem.nextMaintenanceDate || 'N/A'}</span>
              </div>
            </div>

            {viewingItem.isComputer && viewingItem.compSpecs && (
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-2">
                <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Monitor className="h-4 w-4 text-blue-600" /> Workstation Detailed Specifications:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-blue-900">
                  <div><strong>CPU:</strong> {viewingItem.compSpecs.cpu}</div>
                  <div><strong>RAM:</strong> {viewingItem.compSpecs.ram}</div>
                  <div><strong>Storage:</strong> {viewingItem.compSpecs.storage}</div>
                  <div><strong>OS:</strong> {viewingItem.compSpecs.os}</div>
                  <div><strong>IP:</strong> {viewingItem.compSpecs.ipAddress}</div>
                  <div><strong>Monitor:</strong> {viewingItem.compSpecs.monitor}</div>
                </div>
                <div className="text-[11px] text-blue-950 pt-1 border-t border-blue-200">
                  <strong>Installed Software:</strong> {viewingItem.compSpecs.software}
                </div>
              </div>
            )}

            {viewingItem.remarks && (
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
                <span className="font-bold text-zinc-900 block mb-1">Remarks & Storage Notes:</span>
                <p className="text-zinc-700">{viewingItem.remarks}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setViewingItem(null)} className="bg-zinc-950 text-white font-bold px-5 text-xs">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
