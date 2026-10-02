'use client';
import { useState } from 'react';
import { ChevronRight, Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, ChevronDown } from 'lucide-react';
import api from '@/services/api';

const BASE_GROUPS = ['Gender', 'Religion', 'Blood Group', 'Category', 'Caste', 'Marital Status'];

const INITIAL_DATA = [
  { group: 'Gender', items: ['Male', 'Female', 'Others'], expanded: true },
  { group: 'Religion', items: [], expanded: false },
  { group: 'Blood Group', items: [], expanded: false },
];

export default function BaseSetupPage() {
  const [baseGroup, setBaseGroup] = useState('');
  const [name, setName] = useState('');
  const [data, setData] = useState(INITIAL_DATA);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleGroup = (group) => {
    setData(prev => prev.map(d => d.group === group ? { ...d, expanded: !d.expanded } : d));
  };

  const handleSave = async () => {
    if (!baseGroup || !name) return alert('Please fill all required fields');
    setLoading(true);
    try {
      await api.post('/base-setup', { group: baseGroup, name });
    } catch {}
    setData(prev => {
      const existing = prev.find(d => d.group === baseGroup);
      if (existing) {
        return prev.map(d => d.group === baseGroup ? { ...d, items: [...d.items, name] } : d);
      }
      return [...prev, { group: baseGroup, items: [name], expanded: true }];
    });
    setName('');
    setLoading(false);
  };

  const filtered = data.filter(d => d.group.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-4">
        <span>Dashboard</span><ChevronRight className="w-3.5 h-3.5" />
        <span>System Settings</span><ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Base Setup</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Base Setup</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4 h-fit">
          <h2 className="text-sm font-bold text-zinc-950">Add Base Setup</h2>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1.5">BASE GROUP *</label>
            <select value={baseGroup} onChange={e => setBaseGroup(e.target.value)} className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600">
              <option value="">Select Base Group *</option>
              {BASE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1.5">NAME *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Male" className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2.5 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
          </div>
          <button onClick={handleSave} disabled={loading} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer">
            ✓ SAVE BASE SETUP
          </button>
        </div>

        {/* List */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-zinc-950">Base Setup List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-300 rounded-lg px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH..." className="bg-transparent text-xs text-zinc-900 font-medium outline-none w-28 placeholder-zinc-400" />
              </div>
              <div className="flex gap-1">
                {[Copy, FileSpreadsheet, FileText, Printer, Download, Columns].map((Icon, i) => (
                  <button key={i} className="p-1.5 border border-zinc-300 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 transition-colors cursor-pointer"><Icon className="w-3.5 h-3.5" /></button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">Base Type</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">Label</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filtered.map(group => (
                  <tbody key={group.group} className="divide-y divide-zinc-200">
                    <tr className="bg-zinc-100/70 hover:bg-zinc-100 cursor-pointer transition-colors" onClick={() => toggleGroup(group.group)}>
                      <td colSpan={2} className="py-2.5 px-3 text-zinc-950 font-bold text-xs uppercase tracking-wider">{group.group}</td>
                      <td className="py-2.5 px-3">
                        <input type="checkbox" className="w-4 h-4 accent-zinc-900 rounded" />
                      </td>
                    </tr>
                    {group.expanded && group.items.map(item => (
                      <tr key={item} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-2 px-3"></td>
                        <td className="py-2 px-3 text-zinc-900 font-medium text-xs">{item}</td>
                        <td className="py-2 px-3">
                          <button className="border border-zinc-300 text-zinc-800 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-zinc-100 transition-colors cursor-pointer">
                            SELECT <ChevronDown className="w-3 h-3 text-zinc-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs font-semibold text-zinc-600">
            <span>Showing entries</span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 border border-zinc-300 rounded-lg hover:bg-zinc-100 cursor-pointer">←</button>
              <button className="px-2.5 py-1 bg-white text-zinc-950 rounded-lg cursor-default">1</button>
              <button className="px-2.5 py-1 border border-zinc-300 rounded-lg hover:bg-zinc-100 cursor-pointer">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
