'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Search,
  DollarSign,
  Plus,
  RefreshCw,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const DEFAULT_CATEGORIES = [
  { name: 'Electricity', icon: '⚡', desc: 'WAPDA campus bills, backup generator diesel & electrical fittings' },
  { name: 'Water', icon: '💧', desc: 'Water supply, filtration plants, plumbing maintenance & sanitation' },
  { name: 'Internet', icon: '🌐', desc: 'Fiber optic internet connections, campus Wi-Fi, routers' },
  { name: 'Stationery', icon: '📝', desc: 'Classroom markers, registers, examination answer booklets, paper' },
  { name: 'Maintenance', icon: '🔧', desc: 'Civil repairs, paint, air conditioner servicing, electrical repairs' },
  { name: 'Transportation', icon: '🚌', desc: 'School van fuel, bus maintenance, driver allowances, route toll' },
  { name: 'Cleaning', icon: '🧹', desc: 'Janitorial supplies, detergents, campus sanitization supplies' },
  { name: 'Furniture', icon: '🪑', desc: 'Student desks, teacher chairs, podiums, whiteboard installations' },
  { name: 'Laboratory', icon: '🔬', desc: 'Science apparatus, chemistry reagents, biology models, microscopes' },
  { name: 'Events', icon: '🎉', desc: 'Annual sports day, prize distributions, seminars, student welcome' },
  { name: 'Other', icon: '📦', desc: 'Miscellaneous and unplanned operating expenses' }
];

export default function ExpenseCategoriesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/expense');
        if (res?.success && Array.isArray(res.data)) {
          setExpenses(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Compute spend per category from live records
  const categoryStats = DEFAULT_CATEGORIES.map(cat => {
    const matched = expenses.filter(e =>
      e.categoryName && e.categoryName.toLowerCase().includes(cat.name.toLowerCase())
    );
    const total = matched.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return {
      ...cat,
      count: matched.length,
      totalAmount: total
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Expense Categories
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Institutional expenditure heads and operational budget breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => router.push('/dashboard/accountant/expenses/add')}
            className="h-10 px-4 rounded-xl font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Expense in Category
          </Button>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categoryStats.map((cat) => (
          <Card key={cat.name} className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-zinc-400 transition-colors">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg">
                  {cat.icon}
                </div>
                <span className="text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  {cat.count} vouchers
                </span>
              </div>
              <CardTitle className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 mt-3">
                {cat.name}
              </CardTitle>
              <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{cat.desc}</p>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Total Disbursed</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                    Rs. {cat.totalAmount.toLocaleString()}
                  </span>
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/accountant/expenses?category=${cat.name}`)}
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-xs font-bold"
                >
                  View
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
