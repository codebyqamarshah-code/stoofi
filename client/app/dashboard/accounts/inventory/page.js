'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Package, 
  Warehouse, 
  Truck, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  ArrowRight, 
  ListPlus, 
  PackageCheck, 
  PackageMinus, 
  DollarSign, 
  Layers, 
  Tag, 
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_INVENTORY_STATS = {
  totalItems: 248,
  totalStores: 4,
  suppliers: 18,
  lowStockCount: 7
};

const DEMO_LOW_STOCK = [
  { id: 'ls-1', code: 'ITM-SCI-014', name: 'Microscope Glass Slides (Box of 50)', category: 'Science Lab Equipment', store: 'Science Lab Store', inStock: 3, minLevel: 15, unit: 'Box' },
  { id: 'ls-2', code: 'ITM-STA-002', name: 'A4 Printing Paper 80GSM (Ream)', category: 'Stationery & Printing', store: 'Main Admin Store', inStock: 8, minLevel: 40, unit: 'Ream' },
  { id: 'ls-3', code: 'ITM-SPT-009', name: 'Cricket Tape Balls (Pack of 6)', category: 'Sports Equipment', store: 'Sports Gymnasium Store', inStock: 2, minLevel: 10, unit: 'Pack' },
  { id: 'ls-4', code: 'ITM-MED-005', name: 'First Aid Antiseptic Bandages', category: 'Medical & First Aid', store: 'Campus Health Clinic', inStock: 5, minLevel: 25, unit: 'Box' },
  { id: 'ls-5', code: 'ITM-CLN-022', name: 'Floor Disinfectant Phenyl 5L', category: 'Janitorial Supplies', store: 'Main Admin Store', inStock: 2, minLevel: 8, unit: 'Can' },
];

export default function InventoryDashboardPage() {
  const [stats, setStats] = useState(DEMO_INVENTORY_STATS);
  const [lowStock, setLowStock] = useState(DEMO_LOW_STOCK);

  const inventoryModules = [
    { label: 'Item Category', href: '/dashboard/accounts/inventory/item-category', icon: Tag, desc: 'Classify inventory heads & groups' },
    { label: 'Item Stores / Warehouses', href: '/dashboard/accounts/inventory/item-store', icon: Warehouse, desc: 'Manage campus stock storage rooms' },
    { label: 'Suppliers & Vendors', href: '/dashboard/accounts/inventory/supplier', icon: Truck, desc: 'Vendor directory & purchase records' },
    { label: 'Item Master List', href: '/dashboard/accounts/inventory/item-list', icon: Package, desc: 'All items with real-time stock levels' },
    { label: 'Receive Items (GRN)', href: '/dashboard/accounts/inventory/item-receive', icon: PackageCheck, desc: 'Generate Goods Received Note from vendor' },
    { label: 'GRN History Log', href: '/dashboard/accounts/inventory/item-receive-list', icon: FileText, desc: 'Audit past incoming shipments' },
    { label: 'Issue Items (Requisition)', href: '/dashboard/accounts/inventory/item-issue', icon: PackageMinus, desc: 'Issue items to staff or departments' },
    { label: 'Item Sell / Disposal', href: '/dashboard/accounts/inventory/item-sell', icon: DollarSign, desc: 'Sell uniform, books or dispose scrap' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#084A86]/10 text-[#084A86]">
              <Package className="h-6 w-6" />
            </span>
            Inventory &amp; Store Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Procurement, stock tracking, requisitions, and vendor management • Pak Royal College Sharaqpur
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span>Accounts</span>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-[#084A86] font-bold">Inventory</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Total Catalog Items</span>
            <div className="text-xl font-black text-zinc-950 mt-0.5">{stats.totalItems} Items</div>
            <span className="text-[10px] text-zinc-500">Across 8 main categories</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#084A86] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Campus Stores</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{stats.totalStores} Warehouses</div>
            <span className="text-[10px] text-zinc-500">Lab, Sports, Admin &amp; General</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Registered Suppliers</span>
            <div className="text-xl font-black text-purple-700 mt-0.5">{stats.suppliers} Vendors</div>
            <span className="text-[10px] text-zinc-500">Active procurement contracts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Low Stock Alert</span>
            <div className="text-xl font-black text-rose-600 mt-0.5">{stats.lowStockCount} Items</div>
            <span className="text-[10px] text-rose-600 font-bold">Reorder threshold reached</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Operations Navigation Grid */}
      <div>
        <h2 className="text-xs font-black text-zinc-800 uppercase tracking-wider mb-3">Inventory Operations &amp; Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {inventoryModules.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs hover:border-[#084A86]/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#084A86]/10 text-[#084A86] flex items-center justify-center group-hover:bg-[#084A86] group-hover:text-white transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#084A86] group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <h3 className="font-extrabold text-sm text-zinc-950 group-hover:text-[#084A86] transition-colors">{item.label}</h3>
                <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Low Stock Warning Alert Table */}
      <div className="bg-white border border-rose-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-rose-100 bg-rose-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="text-xs font-black text-rose-950 uppercase tracking-wider">Low Stock Reorder Alerts</h2>
          </div>
          <Link href="/dashboard/accounts/inventory/item-receive">
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
              + Generate Purchase GRN
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-zinc-200 font-black uppercase text-zinc-600 tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Item Code</th>
                <th className="p-3">Item Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Store Location</th>
                <th className="p-3 text-center">Current In-Stock</th>
                <th className="p-3 text-center">Safety Minimum</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {lowStock.map((item) => (
                <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="p-3 font-mono font-bold text-zinc-700">{item.code}</td>
                  <td className="p-3 font-extrabold text-zinc-950">{item.name}</td>
                  <td className="p-3 text-zinc-600 font-medium">{item.category}</td>
                  <td className="p-3 font-bold text-zinc-800">{item.store}</td>
                  <td className="p-3 text-center">
                    <span className="font-mono font-black text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full text-xs">
                      {item.inStock} {item.unit}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-zinc-500">
                    {item.minLevel} {item.unit}
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/dashboard/accounts/inventory/item-receive?item=${encodeURIComponent(item.name)}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs font-bold text-[#084A86] border-sky-300 hover:bg-sky-50">
                        Order Stock
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
