'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FlaskConical,
  Beaker,
  Cpu,
  Box,
  Boxes,
  Calendar,
  Clock,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { formatDateDMY } from '@/lib/utils';
import labService from '@/services/labService';

const ASSET_TYPES = [
  'Chemical / Reagent',
  'Lab Apparatus / Instrument',
  'Glassware & Plasticware',
  'Medical / Dental / Nursing Asset',
  'Computer & IT Hardware',
  'Safety & General Asset'
];

const DEFAULT_CATEGORIES = [
  'Chemical Reagents & Acids',
  'Organic Solvents & Indicators',
  'Biological Stains & Culture Media',
  'Diagnostic & Medical Kits',
  'Microscopes & Optical Instruments',
  'Measuring & Analytical Instruments',
  'Laboratory Glassware',
  'Dental & OTT Instruments',
  'Physiotherapy & Nursing Models',
  'Computer Workstations & Peripherals',
  'Lab Furniture & Fixtures',
  'Fire & Safety Equipment'
];

const DEFAULT_LABS = [
  'Chemistry Lab',
  'Physics Lab',
  'Biology & Microbiology Lab',
  'FSC Nursing Skill Lab',
  'FSC Dental Lab',
  'FSC OTT (Operation Theatre) Lab',
  'BS RIT (Radiology) Lab',
  'DPT Physiotherapy Lab',
  'BS Psychology Lab',
  'Computer & IT Lab'
];

const UNITS = [
  'Units',
  'Bottles',
  'Liters (L)',
  'Milliliters (ml)',
  'Grams (g)',
  'Kilograms (kg)',
  'Boxes',
  'Packs',
  'Sets',
  'Pieces'
];

const COMMON_LAB_ITEMS = [
  'Hydrochloric Acid (HCl 37%)',
  'Sulfuric Acid (H2SO4 98%)',
  'Nitric Acid (HNO3)',
  'Ethanol Absolute (99.8%)',
  'Sodium Hydroxide Pellets (NaOH)',
  'Benedict’s Qualitative Reagent',
  'Gram Staining Kit',
  'Hydrogen Peroxide (H2O2)',
  'Distilled Water (Deionized)',
  'pH Buffer Solution (pH 4.0 / 7.0)',
  'Binocular Compound Microscope',
  'Digital Centrifuge Machine',
  'UV-Vis Spectrophotometer',
  'Autoclave Steam Sterilizer',
  'Digital Analytical Balance',
  'Pyrex Borosilicate Beaker Set',
  'Volumetric & Conical Flasks',
  'Graduated Pipettes & Burettes',
  'Dental Phantom Head Unit',
  'Human Anatomical Skeleton Model',
  'Digital Blood Pressure Monitor',
  'Fire Extinguisher (CO2 / Dry Powder)'
];

export function getExpiryStatus(expiryDateStr) {
  if (!expiryDateStr || String(expiryDateStr).trim() === '' || expiryDateStr === '—') {
    return {
      code: 'NONE',
      label: 'No Expiry',
      subText: 'Permanent Asset',
      daysLeft: null
    };
  }

  let parsedDate = null;
  const s = String(expiryDateStr).trim();
  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    parsedDate = new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]));
  } else {
    parsedDate = new Date(s);
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return {
      code: 'NONE',
      label: 'No Expiry',
      subText: 'Permanent Asset',
      daysLeft: null
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(parsedDate);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      code: 'EXPIRED',
      label: 'EXPIRED',
      subText: `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago`,
      daysLeft
    };
  }
  if (daysLeft === 0) {
    return {
      code: 'EXPIRED',
      label: 'EXPIRES TODAY',
      subText: 'Action required today',
      daysLeft: 0
    };
  }
  if (daysLeft <= 30) {
    return {
      code: 'EXPIRING_SOON',
      label: 'EXPIRING SOON',
      subText: `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`,
      daysLeft
    };
  }

  return {
    code: 'VALID',
    label: 'VALID / SAFE',
    subText: `${daysLeft} days remaining`,
    daysLeft
  };
}

export default function LabAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [labsList, setLabsList] = useState(DEFAULT_LABS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState('ALL'); // ALL | CHEMICAL | EQUIPMENT | EXPIRING_SOON | EXPIRED
  const [searchTerm, setSearchTerm] = useState('');
  const [labFilter, setLabFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    name: '',
    code: '',
    assetType: 'Chemical / Reagent',
    category: 'Chemical Reagents & Acids',
    lab: 'Chemistry Lab',
    brand: '',
    batchNo: '',
    quantity: 10,
    availableQty: 10,
    unit: 'Bottles',
    purchaseDate: new Date().toISOString().split('T')[0],
    manufactureDate: '',
    expiryDate: '',
    purchaseCost: '',
    supplier: '',
    storageLocation: '',
    condition: 'Good',
    status: 'Available',
    remarks: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadAllAssets = async () => {
    setLoading(true);
    try {
      const [equipData, labsData] = await Promise.all([
        labService.getEquipment().catch(() => []),
        labService.getLabs().catch(() => [])
      ]);

      if (Array.isArray(equipData)) {
        setAssets(equipData);
      }

      if (Array.isArray(labsData) && labsData.length > 0) {
        const dynamicNames = labsData.map((l) => l.name).filter(Boolean);
        setLabsList(Array.from(new Set([...dynamicNames, ...DEFAULT_LABS])));
      }
    } catch (err) {
      console.error('Error loading lab assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAssets();
  }, []);

  // Open Add Modal
  const handleOpenAdd = (defaultType = 'Chemical / Reagent') => {
    const isChem = defaultType.toLowerCase().includes('chemical');
    setFormData({
      ...initialForm,
      assetType: defaultType,
      category: isChem ? 'Chemical Reagents & Acids' : 'Microscopes & Optical Instruments',
      unit: isChem ? 'Bottles' : 'Units',
      code: `AST-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setIsEditing(false);
    setEditId(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setFormData({
      name: item.name || '',
      code: item.code || '',
      assetType:
        item.assetType ||
        ((item.category || '').toLowerCase().includes('chemical')
          ? 'Chemical / Reagent'
          : 'Lab Apparatus / Instrument'),
      category: item.category || 'Chemical Reagents & Acids',
      lab: item.lab || 'Chemistry Lab',
      brand: item.brand || item.model || '',
      batchNo: item.batchNo || item.serialNumber || '',
      quantity: Number(item.quantity) || 1,
      availableQty:
        item.availableQty !== undefined ? Number(item.availableQty) : Number(item.quantity) || 1,
      unit: item.unit || 'Units',
      purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0],
      manufactureDate: item.manufactureDate || '',
      expiryDate: item.expiryDate || item.warrantyExpiry || '',
      purchaseCost: item.purchaseCost || '',
      supplier: item.supplier || '',
      storageLocation: item.storageLocation || '',
      condition: item.condition || 'Good',
      status: item.status || 'Available',
      remarks: item.remarks || ''
    });
    setIsEditing(true);
    setEditId(item._id || item.id);
    setShowModal(true);
  };

  // Save Asset / Chemical
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter the Asset or Chemical Name.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity) || 1,
        availableQty:
          formData.availableQty !== ''
            ? Number(formData.availableQty)
            : Number(formData.quantity) || 1,
        purchaseCost: Number(formData.purchaseCost) || 0,
        warrantyExpiry: formData.expiryDate || '',
        serialNumber: formData.batchNo || '',
        isComputer: String(formData.assetType).toLowerCase().includes('computer')
      };

      if (isEditing && editId) {
        payload._id = editId;
        payload.id = editId;
      }

      const saved = await labService.saveEquipment(payload);
      if (saved) {
        if (isEditing) {
          setAssets((prev) =>
            prev.map((item) => (item._id === editId || item.id === editId ? saved : item))
          );
        } else {
          setAssets((prev) => [saved, ...prev]);
        }
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save lab asset:', err);
      alert('Failed to save asset. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Asset
  const handleDelete = async (item) => {
    const id = item._id || item.id;
    if (!confirm(`Are you sure you want to delete "${item.name}" from Lab Assets?`)) return;
    try {
      await labService.deleteEquipment(id);
      setAssets((prev) => prev.filter((a) => a._id !== id && a.id !== id));
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  // Compute Summary KPIs
  const summaryStats = useMemo(() => {
    let totalItems = assets.length;
    let totalUnits = 0;
    let totalValue = 0;
    let chemicalsCount = 0;
    let equipmentCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;

    assets.forEach((item) => {
      const qty = Number(item.quantity) || 1;
      const cost = Number(item.purchaseCost) || 0;
      totalUnits += qty;
      totalValue += qty * cost;

      const isChem =
        String(item.assetType || '').toLowerCase().includes('chemical') ||
        String(item.category || '').toLowerCase().includes('chemical') ||
        String(item.category || '').toLowerCase().includes('reagent') ||
        String(item.category || '').toLowerCase().includes('acid');

      if (isChem) {
        chemicalsCount++;
      } else {
        equipmentCount++;
      }

      const expInfo = getExpiryStatus(item.expiryDate || item.warrantyExpiry);
      if (expInfo.code === 'EXPIRED') expiredCount++;
      else if (expInfo.code === 'EXPIRING_SOON') expiringSoonCount++;
    });

    return {
      totalItems,
      totalUnits,
      totalValue,
      chemicalsCount,
      equipmentCount,
      expiringSoonCount,
      expiredCount
    };
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        String(item.name || '').toLowerCase().includes(q) ||
        String(item.code || '').toLowerCase().includes(q) ||
        String(item.category || '').toLowerCase().includes(q) ||
        String(item.lab || '').toLowerCase().includes(q) ||
        String(item.brand || '').toLowerCase().includes(q) ||
        String(item.batchNo || item.serialNumber || '').toLowerCase().includes(q) ||
        String(item.supplier || '').toLowerCase().includes(q);

      const matchLab = labFilter === 'All' || item.lab === labFilter;
      const matchCondition = conditionFilter === 'All' || item.condition === conditionFilter;

      if (!matchSearch || !matchLab || !matchCondition) return false;

      const isChem =
        String(item.assetType || '').toLowerCase().includes('chemical') ||
        String(item.category || '').toLowerCase().includes('chemical') ||
        String(item.category || '').toLowerCase().includes('reagent') ||
        String(item.category || '').toLowerCase().includes('acid');

      const expInfo = getExpiryStatus(item.expiryDate || item.warrantyExpiry);

      if (activeTab === 'CHEMICAL') return isChem;
      if (activeTab === 'EQUIPMENT') return !isChem;
      if (activeTab === 'EXPIRING_SOON') return expInfo.code === 'EXPIRING_SOON';
      if (activeTab === 'EXPIRED') return expInfo.code === 'EXPIRED';

      return true;
    });
  }, [assets, searchTerm, labFilter, conditionFilter, activeTab]);

  // Export columns & data
  const exportColumns = [
    { key: 'code', label: 'Asset / Batch Code' },
    { key: 'name', label: 'Asset / Chemical Name' },
    { key: 'assetType', label: 'Type' },
    { key: 'category', label: 'Category' },
    { key: 'lab', label: 'Assigned Lab' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'purchaseDate', label: 'Purchase Date' },
    { key: 'expiryDate', label: 'Expiry Date' },
    { key: 'expiryStatus', label: 'Expiry Status' },
    { key: 'condition', label: 'Condition' },
    { key: 'storageLocation', label: 'Storage Location' },
    { key: 'totalValue', label: 'Total Value (Rs.)' }
  ];

  const exportData = filteredAssets.map((item) => {
    const expRaw = item.expiryDate || item.warrantyExpiry || '';
    const expInfo = getExpiryStatus(expRaw);
    const qty = Number(item.quantity) || 1;
    const cost = Number(item.purchaseCost) || 0;
    return {
      code: item.code || '—',
      name: item.name || '—',
      assetType: item.assetType || 'Lab Asset',
      category: item.category || 'General',
      lab: item.lab || 'General Lab',
      quantity: `${qty} ${item.unit || 'Units'}`,
      purchaseDate: formatDateDMY(item.purchaseDate),
      expiryDate: expRaw ? formatDateDMY(expRaw) : 'No Expiry',
      expiryStatus: expInfo.label,
      condition: item.condition || 'Good',
      storageLocation: item.storageLocation || '—',
      totalValue: qty * cost
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
            <Link href="/dashboard" className="hover:text-zinc-900">
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/dashboard/labs" className="hover:text-zinc-900">
              Labs
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-bold text-zinc-950">Lab Assets &amp; Chemical Expiry</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2.5">
            <FlaskConical className="h-7 w-7 text-emerald-600" />
            Lab Assets, Apparatus &amp; Chemical Expiry Tracker
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage all laboratory assets, instruments, glassware, and chemicals with live expiry alerts and stock tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={loadAllAssets}
            disabled={loading}
            className="h-9 px-3 text-xs border-zinc-300 text-zinc-800 font-bold rounded-xl cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => handleOpenAdd('Chemical / Reagent')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-4 rounded-xl shadow-xs cursor-pointer"
          >
            <Beaker className="h-3.5 w-3.5 mr-1.5" />
            + Add Chemical / Expirable Item
          </Button>

          <Button
            onClick={() => handleOpenAdd('Lab Apparatus / Instrument')}
            style={{ backgroundColor: '#084A86' }}
            className="hover:opacity-95 text-white text-xs font-bold h-9 px-4 rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            + Add Lab Asset / Equipment
          </Button>
        </div>
      </div>

      {/* 5 Live Summary & Expiry Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          onClick={() => setActiveTab('ALL')}
          className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === 'ALL' ? 'border-[#084A86] ring-2 ring-[#084A86]/15' : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Total Lab Assets
            </span>
            <div className="text-2xl font-black text-zinc-950 mt-1">
              {summaryStats.totalItems} Items
            </div>
            <div className="text-[11px] font-bold text-[#084A86] mt-0.5">
              Value: Rs. {summaryStats.totalValue.toLocaleString()}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#084A86]">
            <Boxes className="h-5 w-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('CHEMICAL')}
          className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === 'CHEMICAL' ? 'border-emerald-600 ring-2 ring-emerald-600/15' : 'border-zinc-200 hover:border-emerald-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Chemicals &amp; Reagents
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {summaryStats.chemicalsCount}
            </div>
            <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
              With expiry tracking
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Beaker className="h-5 w-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('EQUIPMENT')}
          className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === 'EQUIPMENT' ? 'border-purple-600 ring-2 ring-purple-600/15' : 'border-zinc-200 hover:border-purple-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Apparatus &amp; Instruments
            </span>
            <div className="text-2xl font-black text-purple-700 mt-1">
              {summaryStats.equipmentCount}
            </div>
            <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
              Machines, models &amp; glassware
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Cpu className="h-5 w-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('EXPIRING_SOON')}
          className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === 'EXPIRING_SOON' ? 'border-amber-500 ring-2 ring-amber-500/15' : 'border-zinc-200 hover:border-amber-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Expiring Soon (≤ 30d)
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {summaryStats.expiringSoonCount}
            </div>
            <div className="text-[11px] font-semibold text-amber-700 mt-0.5">
              Needs replacement soon
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('EXPIRED')}
          className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === 'EXPIRED' ? 'border-rose-600 ring-2 ring-rose-600/15' : 'border-zinc-200 hover:border-rose-300'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Expired Chemicals/Items
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {summaryStats.expiredCount}
            </div>
            <div className="text-[11px] font-bold text-rose-600 mt-0.5">
              {summaryStats.expiredCount > 0 ? 'Dispose / Replace Now!' : '0 Expired Items'}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-2">
        {[
          { id: 'ALL', label: 'All Lab Assets & Chemicals', count: summaryStats.totalItems },
          { id: 'CHEMICAL', label: 'Chemicals & Reagents', count: summaryStats.chemicalsCount },
          { id: 'EQUIPMENT', label: 'Apparatus & Equipment', count: summaryStats.equipmentCount },
          { id: 'EXPIRING_SOON', label: '⚠️ Expiring Soon', count: summaryStats.expiringSoonCount },
          { id: 'EXPIRED', label: '🚨 Expired Items', count: summaryStats.expiredCount }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? tab.id === 'EXPIRED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : tab.id === 'EXPIRING_SOON'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-[#084A86] text-white shadow-xs'
                : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === tab.id ? 'bg-black/20 text-white' : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Assets Table Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chemical, asset, batch, lab..."
                className="pl-9 w-full sm:w-64 bg-white border-zinc-300 text-zinc-950 text-xs font-medium h-9 rounded-xl"
              />
            </div>

            <select
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="h-9 rounded-xl border border-zinc-300 bg-white px-3 text-xs text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              <option value="All">All Laboratories</option>
              {labsList.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="h-9 rounded-xl border border-zinc-300 bg-white px-3 text-xs text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#084A86]"
            >
              <option value="All">All Conditions</option>
              <option value="Good">Good / Active</option>
              <option value="Fair">Fair</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Damaged">Damaged / Disposed</option>
            </select>
          </div>

          <TableExportToolbar
            data={exportData}
            columns={exportColumns}
            filename="Lab_Assets_And_Chemical_Expiry_Report"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100/80 text-zinc-700 uppercase font-bold border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3.5">Code / Batch</th>
                <th className="px-4 py-3.5">Asset / Chemical Name</th>
                <th className="px-4 py-3.5">Laboratory</th>
                <th className="px-4 py-3.5">Qty &amp; Unit</th>
                <th className="px-4 py-3.5">Purchase Date</th>
                <th className="px-4 py-3.5">Expiry Date &amp; Alert</th>
                <th className="px-4 py-3.5">Condition</th>
                <th className="px-4 py-3.5">Value (Rs.)</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                      Loading lab assets and chemical inventory...
                    </div>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FlaskConical className="h-8 w-8 text-zinc-300" />
                      <p className="text-sm font-bold text-zinc-700">
                        No lab assets or chemicals found.
                      </p>
                      <p className="text-xs text-zinc-500">
                        Click &quot;+ Add Chemical / Expirable Item&quot; or &quot;+ Add Lab Asset / Equipment&quot; above to add items.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((item, idx) => {
                  const expRaw = item.expiryDate || item.warrantyExpiry || '';
                  const expInfo = getExpiryStatus(expRaw);
                  const qty = Number(item.quantity) || 1;
                  const unit = item.unit || 'Units';
                  const totalVal = qty * (Number(item.purchaseCost) || 0);

                  return (
                    <tr
                      key={item._id || item.id || idx}
                      className={`transition-colors ${
                        expInfo.code === 'EXPIRED'
                          ? 'bg-rose-50/40 hover:bg-rose-50/70'
                          : expInfo.code === 'EXPIRING_SOON'
                          ? 'bg-amber-50/30 hover:bg-amber-50/60'
                          : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-zinc-900">
                        <div>{item.code || `AST-${1001 + idx}`}</div>
                        {(item.batchNo || item.serialNumber) && (
                          <div className="text-[10px] text-zinc-500">
                            Batch: {item.batchNo || item.serialNumber}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-zinc-950 text-sm">{item.name}</div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 bg-zinc-100 border border-zinc-200 rounded text-[10px] font-semibold text-zinc-700">
                            {item.category || 'General'}
                          </span>
                          {item.storageLocation && (
                            <span className="text-[10px] text-zinc-500">
                              • Shelf: {item.storageLocation}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#084A86] border border-blue-100 font-bold text-[11px]">
                          {item.lab || 'General Lab'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-zinc-900">
                        {qty} <span className="text-zinc-500 font-semibold">{unit}</span>
                      </td>

                      <td className="px-4 py-3.5 text-zinc-700">
                        {item.purchaseDate ? formatDateDMY(item.purchaseDate) : '—'}
                      </td>

                      {/* Expiry Date & Status Badge */}
                      <td className="px-4 py-3.5">
                        {expInfo.code === 'EXPIRED' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertCircle className="h-3 w-3 text-rose-600" />
                              {expInfo.label}
                            </span>
                            <div className="text-[11px] font-bold text-rose-700 mt-0.5">
                              Exp: {formatDateDMY(expRaw)} ({expInfo.subText})
                            </div>
                          </div>
                        ) : expInfo.code === 'EXPIRING_SOON' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                              {expInfo.label}
                            </span>
                            <div className="text-[11px] font-bold text-amber-700 mt-0.5">
                              Exp: {formatDateDMY(expRaw)} ({expInfo.subText})
                            </div>
                          </div>
                        ) : expInfo.code === 'VALID' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              VALID
                            </span>
                            <div className="text-[11px] font-semibold text-zinc-700 mt-0.5">
                              Exp: {formatDateDMY(expRaw)} ({expInfo.subText})
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-400 font-semibold">
                            No Expiry (Permanent)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.condition === 'Good'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.condition === 'Fair'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {item.condition || 'Good'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-zinc-900">
                        Rs. {totalVal.toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingItem(item)}
                            className="p-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-[#084A86] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Asset / Expiry"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Asset"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Lab Asset & Chemical Expiry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {isEditing
                      ? 'Edit Lab Asset / Chemical Details'
                      : 'Add New Lab Asset or Chemical (With Expiry)'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Enter asset details, laboratory assignment, stock quantity, and expiry date (for chemicals/reagents).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-200/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Asset / Chemical Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    list="common-lab-items-list"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Hydrochloric Acid (HCl), Microscope, Beaker..."
                    className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl font-semibold"
                    required
                  />
                  <datalist id="common-lab-items-list">
                    {COMMON_LAB_ITEMS.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Asset / Batch Code
                  </Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="AST-1001"
                    className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Item Type <span className="text-rose-500">*</span>
                  </Label>
                  <select
                    value={formData.assetType}
                    onChange={(e) => {
                      const t = e.target.value;
                      const isChem = t.toLowerCase().includes('chemical');
                      setFormData({
                        ...formData,
                        assetType: t,
                        unit: isChem ? 'Bottles' : formData.unit
                      });
                    }}
                    className="w-full h-10 rounded-xl border border-zinc-300 bg-white px-3 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {ASSET_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Category
                  </Label>
                  <Input
                    list="lab-asset-categories"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Select or type category"
                    className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl"
                  />
                  <datalist id="lab-asset-categories">
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Assigned Laboratory <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    list="pak-royal-labs-list"
                    value={formData.lab}
                    onChange={(e) => setFormData({ ...formData, lab: e.target.value })}
                    placeholder="Select or type Lab Name"
                    className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl font-semibold"
                    required
                  />
                  <datalist id="pak-royal-labs-list">
                    {labsList.map((l) => (
                      <option key={l} value={l} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Quantity, Unit, Cost, Condition */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Quantity <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: e.target.value,
                        availableQty: e.target.value
                      })
                    }
                    className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Unit
                  </Label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full h-10 rounded-xl border border-zinc-300 bg-white px-3 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Unit Cost (Rs.)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.purchaseCost}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                    placeholder="e.g. 2500"
                    className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Condition
                  </Label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full h-10 rounded-xl border border-zinc-300 bg-white px-3 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              {/* Dates Box: Purchase Date, Manufacture Date, EXPIRY DATE */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-amber-900 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    Purchase &amp; Chemical / Reagent Expiry Dates (dd/mm/yyyy)
                  </span>
                  {formData.expiryDate && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, expiryDate: '' })}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Clear Expiry Date
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 uppercase">
                      Purchase / Received Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700 uppercase">
                      Mfg / Opened Date (Optional)
                    </Label>
                    <Input
                      type="date"
                      value={formData.manufactureDate}
                      onChange={(e) =>
                        setFormData({ ...formData, manufactureDate: e.target.value })
                      }
                      className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-extrabold text-rose-700 uppercase">
                      Expiry Date (Chemical / Warranty)
                    </Label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="bg-white border-rose-300 text-zinc-950 text-xs h-10 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Batch, Storage Shelf, Supplier, Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Batch / Lot / Serial No.
                  </Label>
                  <Input
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="e.g. LOT-2026-88A"
                    className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Storage Location (Rack / Cabinet)
                  </Label>
                  <Input
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    placeholder="e.g. Acid Cabinet #2, Shelf B"
                    className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700 uppercase">
                    Brand / Supplier
                  </Label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="e.g. Merck / Sigma / Scientific Store"
                    className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">
                  Safety Notes / Remarks (Optional)
                </Label>
                <Input
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Store below 25°C away from direct sunlight; corrosive reagent"
                  className="bg-white border-zinc-300 text-zinc-950 text-xs h-10 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="border-zinc-300 text-zinc-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl cursor-pointer"
                >
                  {saving ? 'Saving...' : isEditing ? 'Update Lab Asset' : 'Save Lab Asset'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Asset Details Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                  {viewingItem.code || 'ASSET'}
                </span>
                <h3 className="text-lg font-bold text-zinc-950 mt-1">{viewingItem.name}</h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div>
                <span className="text-zinc-500 font-semibold block">Laboratory</span>
                <strong className="text-zinc-950">{viewingItem.lab || '—'}</strong>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">Category</span>
                <strong className="text-zinc-950">{viewingItem.category || '—'}</strong>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">Quantity</span>
                <strong className="text-zinc-950">
                  {viewingItem.quantity || 1} {viewingItem.unit || 'Units'}
                </strong>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">Unit Cost / Value</span>
                <strong className="text-zinc-950">
                  Rs. {(Number(viewingItem.purchaseCost) || 0).toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">Purchase Date</span>
                <strong className="text-zinc-950">
                  {formatDateDMY(viewingItem.purchaseDate)}
                </strong>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">Expiry Date</span>
                <strong className="text-rose-700">
                  {viewingItem.expiryDate || viewingItem.warrantyExpiry
                    ? formatDateDMY(viewingItem.expiryDate || viewingItem.warrantyExpiry)
                    : 'No Expiry'}
                </strong>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">Storage Location</span>
                <strong className="text-zinc-950">{viewingItem.storageLocation || '—'}</strong>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold block">Supplier / Brand</span>
                <strong className="text-zinc-950">{viewingItem.supplier || viewingItem.brand || '—'}</strong>
              </div>
            </div>

            {viewingItem.remarks && (
              <div className="text-xs text-zinc-700 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                <strong>Notes / Safety Remarks:</strong> {viewingItem.remarks}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setViewingItem(null)}
                className="rounded-xl text-xs cursor-pointer"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  const it = viewingItem;
                  setViewingItem(null);
                  handleOpenEdit(it);
                }}
                style={{ backgroundColor: '#084A86' }}
                className="text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Edit Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
