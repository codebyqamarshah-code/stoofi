'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight, 
  Check, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_CURRENCIES = [
  { id: 'curr-1', name: 'Pakistani Rupee', code: 'PKR', symbol: 'Rs', type: 'fiat', position: 'Left', space: 'Yes', decimal: 0, active: true },
  { id: 'curr-2', name: 'US Dollar', code: 'USD', symbol: '$', type: 'fiat', position: 'Left', space: 'Yes', decimal: 2, active: false },
  { id: 'curr-3', name: 'Euro', code: 'EUR', symbol: '€', type: 'fiat', position: 'Right', space: 'No', decimal: 2, active: false },
  { id: 'curr-4', name: 'British Pound', code: 'GBP', symbol: '£', type: 'fiat', position: 'Left', space: 'Yes', decimal: 2, active: false },
  { id: 'curr-5', name: 'Saudi Riyal', code: 'SAR', symbol: 'ر.س', type: 'fiat', position: 'Right', space: 'Yes', decimal: 2, active: false },
  { id: 'curr-6', name: 'UAE Dirham', code: 'AED', symbol: 'د.إ', type: 'fiat', position: 'Right', space: 'Yes', decimal: 2, active: false },
];

const emptyForm = {
  name: '',
  code: '',
  symbol: '',
  type: 'fiat',
  position: 'Left',
  space: 'Yes',
  decimal: 2,
  active: false
};

export default function ManageCurrency() {
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [toast, setToast] = useState(null);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stoofi_currencies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCurrencies(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const saveToStorage = (updated) => {
    setCurrencies(updated);
    try {
      localStorage.setItem('stoofi_currencies', JSON.stringify(updated));
    } catch (e) {}
  };

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      code: c.code,
      symbol: c.symbol,
      type: c.type || 'fiat',
      position: c.position || 'Left',
      space: c.space || 'Yes',
      decimal: c.decimal ?? 2,
      active: !!c.active
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter Currency Name.', true);
      return;
    }
    if (!formData.code.trim()) {
      showToast('Please enter Currency Code (e.g. PKR, USD).', true);
      return;
    }
    if (!formData.symbol.trim()) {
      showToast('Please enter Currency Symbol (e.g. Rs, $).', true);
      return;
    }

    let updatedList = [...currencies];

    if (editingId) {
      updatedList = updatedList.map(c => {
        if (c.id === editingId) {
          return {
            ...c,
            ...formData,
            code: formData.code.toUpperCase().trim(),
            decimal: Number(formData.decimal) || 0
          };
        }
        // If editing currency is set to active, unset others
        if (formData.active) {
          return { ...c, active: false };
        }
        return c;
      });
      showToast('Currency updated successfully!');
    } else {
      const newCurrency = {
        id: `curr-${Date.now()}`,
        ...formData,
        code: formData.code.toUpperCase().trim(),
        decimal: Number(formData.decimal) || 0
      };
      if (formData.active) {
        updatedList = updatedList.map(c => ({ ...c, active: false }));
      }
      updatedList.push(newCurrency);
      showToast('Currency added successfully!');
    }

    saveToStorage(updatedList);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this currency?')) {
      const updated = currencies.filter(c => c.id !== id);
      saveToStorage(updated);
      showToast('Currency removed.');
    }
  };

  const handleSetActive = (id) => {
    const updated = currencies.map(c => ({
      ...c,
      active: c.id === id
    }));
    saveToStorage(updated);
    showToast('Default active currency updated!');
  };

  const filteredCurrencies = currencies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
          toast.isError ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {toast.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>General Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Manage Currency</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Manage Currency</h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">Configure institutional currency, formatting position, and decimal digits.</p>
        </div>
      </div>
      
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#084A86]" />
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">Currency List ({filteredCurrencies.length})</h2>
          </div>
          <button 
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#084A86] hover:bg-[#063866] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            ADD CURRENCY
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
             <TableExportToolbar />
             <div>
                <input 
                  type="text" 
                  placeholder="Search currency..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" 
                />
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 text-zinc-700 font-bold border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3">SL</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Currency Position</th>
                  <th className="px-4 py-3">Space</th>
                  <th className="px-4 py-3">Decimal Digit</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-900">
                {filteredCurrencies.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-xs text-zinc-400 font-medium">
                      No currencies found. Click "ADD CURRENCY" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredCurrencies.map((currency, index) => (
                    <tr key={currency.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-zinc-700">{index + 1}</td>
                      <td className="px-4 py-3 text-zinc-950 font-bold flex items-center gap-2">
                        {currency.name}
                        {currency.active && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                            ACTIVE DEFAULT
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-zinc-800">{currency.code}</td>
                      <td className="px-4 py-3 text-zinc-900 font-bold font-mono">{currency.symbol}</td>
                      <td className="px-4 py-3 text-zinc-700 capitalize">{currency.type}</td>
                      <td className="px-4 py-3 text-zinc-700">{currency.position}</td>
                      <td className="px-4 py-3 text-zinc-700">{currency.space}</td>
                      <td className="px-4 py-3 text-zinc-700">{currency.decimal}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!currency.active && (
                            <button
                              type="button"
                              onClick={() => handleSetActive(currency.id)}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded cursor-pointer transition-colors"
                              title="Set as Default Active Currency"
                            >
                              Set Active
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(currency)}
                            className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded cursor-pointer"
                            title="Edit Currency"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(currency.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete Currency"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add / Edit Currency Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#084A86]" />
                <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                  {editingId ? 'Edit Currency' : 'Add New Currency'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">
                    Currency Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g. Pakistani Rupee, US Dollar" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white border-zinc-300 text-zinc-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">
                    Currency Code <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g. PKR, USD, EUR" 
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    maxLength={5}
                    className="bg-white border-zinc-300 text-zinc-950 font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">
                    Symbol <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g. Rs, $, €" 
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    required
                    maxLength={5}
                    className="bg-white border-zinc-300 text-zinc-950 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Currency Type</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    <option value="fiat">Fiat Currency</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Currency Position</Label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    <option value="Left">Left (e.g. Rs 500)</option>
                    <option value="Right">Right (e.g. 500 €)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Space Between Symbol</Label>
                  <select
                    value={formData.space}
                    onChange={(e) => setFormData({ ...formData, space: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    <option value="Yes">Yes (Space)</option>
                    <option value="No">No Space</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-800 uppercase">Decimal Digits</Label>
                  <select
                    value={formData.decimal}
                    onChange={(e) => setFormData({ ...formData, decimal: Number(e.target.value) })}
                    className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                  >
                    <option value={0}>0 (e.g. Rs 500)</option>
                    <option value={1}>1 (e.g. Rs 500.0)</option>
                    <option value={2}>2 (e.g. Rs 500.00)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">Set as Default Active Currency</span>
                      <span className="text-[11px] text-zinc-500 block">Uses this currency for student fees, invoicing, and reports across the ERP.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-end gap-2.5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  className="border-zinc-300 text-zinc-700 font-bold text-xs"
                >
                  CANCEL
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#084A86] hover:bg-[#063866] text-white font-bold text-xs px-5 shadow-xs"
                >
                  {editingId ? 'UPDATE CURRENCY' : 'SAVE CURRENCY'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
