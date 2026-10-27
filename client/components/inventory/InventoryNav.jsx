'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Tag, 
  Warehouse, 
  Truck, 
  Package, 
  PackagePlus, 
  FileText, 
  DollarSign, 
  PackageMinus 
} from 'lucide-react';

const inventoryNavItems = [
  { name: 'Overview', href: '/dashboard/accounts/inventory', icon: LayoutDashboard },
  { name: 'Item Category', href: '/dashboard/accounts/inventory/item-category', icon: Tag },
  { name: 'Item Stores', href: '/dashboard/accounts/inventory/item-store', icon: Warehouse },
  { name: 'Suppliers', href: '/dashboard/accounts/inventory/supplier', icon: Truck },
  { name: 'Item List', href: '/dashboard/accounts/inventory/item-list', icon: Package },
  { name: 'Receive Items', href: '/dashboard/accounts/inventory/item-receive', icon: PackagePlus, badge: 'GRN' },
  { name: 'Receive List', href: '/dashboard/accounts/inventory/item-receive-list', icon: FileText },
  { name: 'Item Sell', href: '/dashboard/accounts/inventory/item-sell', icon: DollarSign },
  { name: 'Item Issue', href: '/dashboard/accounts/inventory/item-issue', icon: PackageMinus },
];

export default function InventoryNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-1.5 shadow-xs overflow-x-auto">
      <nav className="flex space-x-1 min-w-max" aria-label="Inventory navigation">
        {inventoryNavItems.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-[#009966] text-white shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
              <span>{tab.name}</span>
              {tab.badge && (
                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-[#009966] border border-emerald-200'
                }`}>
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
