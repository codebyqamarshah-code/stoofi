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
  Beaker, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  PackagePlus,
  Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function ConsumablesStockPage() {
  const [consumables, setConsumables] = useState([
    { id: 'CON-01', name: 'Hydrochloric Acid (HCl 1M Solution)', code: 'CHM-HCL-01', category: 'Chemical Reagents', lab: 'Chemistry Lab', unit: 'Liters', inStock: 1.2, reorderLevel: 5.0, unitCost: '$12.50/L', supplier: 'Sigma Chemical Corp', lastRestocked: '2026-02-10', status: 'Critical' },
    { id: 'CON-02', name: 'Nitrile Examination Gloves (Size M, Box of 100)', code: 'BIO-GLV-02', category: 'Safety & PPE', lab: 'Biology Lab', unit: 'Boxes', inStock: 2, reorderLevel: 10, unitCost: '$8.00/Box', supplier: 'MedGuard Supplies', lastRestocked: '2026-01-15', status: 'Low Stock' },
    { id: 'CON-03', name: 'Standard Copper Connecting Wires (100m Spool)', code: 'PHY-WIR-03', category: 'Electrical Wires', lab: 'Physics Lab', unit: 'Spools', inStock: 8, reorderLevel: 3, unitCost: '$18.00/Spool', supplier: 'ElectroTech Wholesalers', lastRestocked: '2026-03-01', status: 'In Stock' },
    { id: 'CON-04', name: 'Borosilicate Glass Test Tubes (15x150mm)', code: 'CHM-TT-04', category: 'Glassware Consumable', lab: 'Chemistry Lab', unit: 'Pieces', inStock: 12, reorderLevel: 50, unitCost: '$0.85/Pc', supplier: 'Pyrex Educational Lab', lastRestocked: '2026-01-20', status: 'Critical' },
    { id: 'CON-05', name: 'CAT6 RJ45 Network Patch Cables (2-meter)', code: 'IT-CAT6-05', category: 'Network Cables', lab: 'Computer Lab 1', unit: 'Pieces', inStock: 4, reorderLevel: 20, unitCost: '$3.50/Pc', supplier: 'IT Hub Cables', lastRestocked: '2026-02-28', status: 'Low Stock' },
    { id: 'CON-06', name: 'HP LaserJet Black Printer Toner (85A)', code: 'IT-TNR-06', category: 'Printer Cartridges', lab: 'Computer Lab 2', unit: 'Cartridges', inStock: 5, reorderLevel: 2, unitCost: '$45.00/Cartridge', supplier: 'HP Official Distributor', lastRestocked: '2026-03-15', status: 'In Stock' },
    { id: 'CON-07', name: 'Litmus Paper Strips (Blue & Red Vials)', code: 'CHM-LTM-07', category: 'Chemical Reagents', lab: 'Chemistry Lab', unit: 'Vials (100 strips)', inStock: 25, reorderLevel: 10, unitCost: '$4.20/Vial', supplier: 'EduChem Labs', lastRestocked: '2026-03-05', status: 'In Stock' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState(null);
  const [stockActionType, setStockActionType] = useState('add'); // 'add' (receive) or 'issue' (use)
  const [stockQtyInput, setStockQtyInput] = useState(1);
  const [stockNotes, setStockNotes] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [labFilter, setLabFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Chemical Reagents',
    lab: 'Chemistry Lab',
    unit: 'Pieces',
    inStock: 10,
    reorderLevel: 5,
    unitCost: '',
    supplier: ''
  });

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!formData.name) return alert('Item name is required');

    const status = Number(formData.inStock) <= Number(formData.reorderLevel) * 0.4 
      ? 'Critical' 
      : Number(formData.inStock) <= Number(formData.reorderLevel) 
      ? 'Low Stock' 
      : 'In Stock';

    setConsumables([
      ...consumables,
      {
        id: `CON-${String(consumables.length + 1).padStart(2, '0')}`,
        ...formData,
        inStock: Number(formData.inStock),
        reorderLevel: Number(formData.reorderLevel),
        status,
        lastRestocked: new Date().toISOString().split('T')[0]
      }
    ]);
    setShowAddModal(false);
  };

  const handleOpenStockModal = (item, type) => {
    setSelectedItemForStock(item);
    setStockActionType(type);
    setStockQtyInput(1);
    setStockNotes('');
    setShowStockModal(true);
  };

  const handleApplyStockTransaction = (e) => {
    e.preventDefault();
    if (!selectedItemForStock) return;

    const qty = Number(stockQtyInput);
    let newStock = selectedItemForStock.inStock;

    if (stockActionType === 'add') {
      newStock += qty;
    } else {
      if (qty > newStock) {
        alert('Cannot issue more than available stock!');
        return;
      }
      newStock -= qty;
    }

    const newStatus = newStock <= selectedItemForStock.reorderLevel * 0.4 
      ? 'Critical' 
      : newStock <= selectedItemForStock.reorderLevel 
      ? 'Low Stock' 
      : 'In Stock';

    setConsumables(consumables.map(c => 
      c.id === selectedItemForStock.id 
        ? { ...c, inStock: newStock, status: newStatus, lastRestocked: stockActionType === 'add' ? new Date().toISOString().split('T')[0] : c.lastRestocked }
        : c
    ));

    setShowStockModal(false);
  };

  const filtered = consumables.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLab = labFilter === 'All' || c.lab === labFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesLab && matchesStatus;
  });

  const exportData = filtered.map(c => ({
    'Item Code': c.code,
    'Consumable Name': c.name,
    'Category': c.category,
    'Lab': c.lab,
    'Remaining Stock': `${c.inStock} ${c.unit}`,
    'Reorder Level': `${c.reorderLevel} ${c.unit}`,
    'Status': c.status,
    'Supplier': c.supplier,
    'Unit Cost': c.unitCost
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Consumables & Chemical Stock</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage recurring supplies: reagents, glassware, gloves, patch cables, and printer toner</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAddModal(true)} className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold h-9 px-4 rounded-xl shadow-xs">
            <Plus className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Add New Consumable
          </Button>
        </div>
      </div>

      {/* Stock Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Consumables</span>
            <div className="text-2xl font-black text-zinc-950 mt-1">{consumables.length} SKUs</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <Boxes className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Low Stock Items</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {consumables.filter(c => c.status === 'Low Stock').length} Items
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Critical / Reorder Alert</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {consumables.filter(c => c.status === 'Critical').length} Items
            </div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            <Beaker className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Filters */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search consumable name, code..." 
                className="pl-9 w-full sm:w-[230px] bg-white border-zinc-300 text-zinc-950 text-xs font-medium h-9"
              />
            </div>

            <select 
              value={labFilter}
              onChange={e => setLabFilter(e.target.value)}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-bold focus-visible:ring-zinc-400"
            >
              <option value="All">All Labs</option>
              <option value="Chemistry Lab">Chemistry Lab</option>
              <option value="Biology Lab">Biology Lab</option>
              <option value="Physics Lab">Physics Lab</option>
              <option value="Computer Lab 1">Computer Lab 1</option>
            </select>

            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-zinc-300 bg-white px-2.5 text-xs text-zinc-950 font-bold focus-visible:ring-zinc-400"
            >
              <option value="All">All Stock Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-xs">
            <button onClick={() => exportToCSV(exportData, 'Consumables_Inventory')} className="p-2 hover:bg-zinc-100 text-zinc-700 border-r border-zinc-200" title="CSV">
              <FileText className="h-4 w-4" />
            </button>
            <button onClick={() => exportToExcel(exportData, 'Consumables_Inventory')} className="p-2 hover:bg-zinc-100 text-zinc-700 border-r border-zinc-200" title="Excel">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={() => printData('Consumables Stock Report', exportData)} className="p-2 hover:bg-zinc-100 text-zinc-700" title="Print">
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">Item Name & Code</th>
                <th className="px-4 py-3.5">Lab / Category</th>
                <th className="px-4 py-3.5 text-center">Current Stock</th>
                <th className="px-4 py-3.5 text-center">Min Alert Level</th>
                <th className="px-4 py-3.5">Stock Status</th>
                <th className="px-4 py-3.5 text-right">Stock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                      <Beaker className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      {item.name}
                    </div>
                    <div className="text-xs font-mono text-zinc-500 mt-0.5">{item.code} • Supplier: {item.supplier}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-bold text-zinc-900">{item.lab}</div>
                    <div className="text-[11px] text-zinc-500">{item.category}</div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="text-sm font-black text-zinc-950">
                      {item.inStock} <span className="text-xs font-semibold text-zinc-500">{item.unit}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs text-zinc-600 font-bold">
                    {item.reorderLevel} {item.unit}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      item.status === 'In Stock'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : item.status === 'Low Stock'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button 
                        onClick={() => handleOpenStockModal(item, 'add')} 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs font-bold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 border-emerald-200"
                        title="Receive & Add Stock"
                      >
                        <ArrowDownLeft className="h-3 w-3 mr-1" /> Add Stock
                      </Button>
                      <Button 
                        onClick={() => handleOpenStockModal(item, 'issue')} 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs font-bold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 border-indigo-200"
                        title="Issue to Lab / Practical"
                      >
                        <ArrowUpRight className="h-3 w-3 mr-1" /> Issue
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Consumable */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-zinc-950">Add Consumable Supply</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-900"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-zinc-800 uppercase">Item Name <span className="text-rose-500">*</span></Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Sodium Hydroxide Pellets" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Item Code</Label>
                  <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="CHM-NAOH-01" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Category</Label>
                  <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Chemical Reagents" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Target Lab</Label>
                  <select value={formData.lab} onChange={e => setFormData({ ...formData, lab: e.target.value })} className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 font-medium">
                    <option value="Chemistry Lab">Chemistry Lab</option>
                    <option value="Biology Lab">Biology Lab</option>
                    <option value="Physics Lab">Physics Lab</option>
                    <option value="Computer Lab 1">Computer Lab 1</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Unit of Measure</Label>
                  <Input value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="Liters, Boxes, Pieces, Grams" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Initial Stock</Label>
                  <Input type="number" value={formData.inStock} onChange={e => setFormData({ ...formData, inStock: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Min Reorder Level</Label>
                  <Input type="number" value={formData.reorderLevel} onChange={e => setFormData({ ...formData, reorderLevel: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Supplier</Label>
                  <Input value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} placeholder="Supplier Name" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-zinc-800 uppercase">Unit Cost</Label>
                  <Input value={formData.unitCost} onChange={e => setFormData({ ...formData, unitCost: e.target.value })} placeholder="$15.00/kg" />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                <Button type="button" onClick={() => setShowAddModal(false)} variant="outline">Cancel</Button>
                <Button type="submit" className="bg-zinc-950 text-white font-bold">Save Consumable</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Stock In / Issue Modal */}
      {showStockModal && selectedItemForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                {stockActionType === 'add' ? (
                  <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-indigo-600" />
                )}
                <h3 className="text-base font-bold text-zinc-950">
                  {stockActionType === 'add' ? 'Add / Receive Stock' : 'Issue to Lab / Practical'}
                </h3>
              </div>
              <button onClick={() => setShowStockModal(false)} className="text-zinc-400 hover:text-zinc-900"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleApplyStockTransaction} className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-zinc-950 text-sm">{selectedItemForStock.name}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  Current Stock: <strong className="text-zinc-950">{selectedItemForStock.inStock} {selectedItemForStock.unit}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-zinc-800 uppercase">
                  {stockActionType === 'add' ? 'Quantity to Add' : 'Quantity to Issue'} ({selectedItemForStock.unit}) <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  min="0.1" 
                  value={stockQtyInput} 
                  onChange={e => setStockQtyInput(e.target.value)} 
                  required 
                  className="font-bold text-base"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-zinc-800 uppercase">Reason / Practical Reference / Invoice #</Label>
                <textarea 
                  value={stockNotes} 
                  onChange={e => setStockNotes(e.target.value)} 
                  placeholder={stockActionType === 'add' ? 'e.g. PO #8821 received from Sigma' : 'e.g. Physics Practical #05 Ohm\'s Law session'}
                  rows={2} 
                  className="w-full rounded-md border border-zinc-300 bg-white p-2 text-xs resize-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                <Button type="button" onClick={() => setShowStockModal(false)} variant="outline">Cancel</Button>
                <Button 
                  type="submit" 
                  className={stockActionType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' : 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold'}
                >
                  {stockActionType === 'add' ? 'CONFIRM STOCK IN' : 'CONFIRM ISSUE'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
