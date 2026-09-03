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
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span><ChevronRight className="w-3 h-3" />
        <span>System Settings</span><ChevronRight className="w-3 h-3" />
        <span className="text-emerald-400">Base Setup</span>
      </div>
      <h1 className="text-xl font-bold text-white mb-6">Base Setup</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Add Base Setup</h2>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">BASE GROUP *</label>
            <select value={baseGroup} onChange={e => setBaseGroup(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Base Group *</option>
              {BASE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">NAME *</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button onClick={handleSave} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2 rounded">
            ✓ SAVE BASE SETUP
          </button>
        </div>

        {/* List */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Base Setup List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-700 rounded px-2 py-1">
                <Search className="w-3 h-3 text-zinc-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH" className="bg-transparent text-xs text-zinc-300 outline-none w-28" />
              </div>
              <div className="flex gap-1">
                {[Copy, FileSpreadsheet, FileText, Printer, Download, Columns].map((Icon, i) => (
                  <button key={i} className="p-1 text-zinc-400 hover:text-emerald-400"><Icon className="w-4 h-4" /></button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Base Type</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Label</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(group => (
                  <>
                    <tr key={group.group} className="bg-zinc-800/60 cursor-pointer" onClick={() => toggleGroup(group.group)}>
                      <td colSpan={2} className="py-3 px-3 text-zinc-200 font-medium">{group.group}</td>
                      <td className="py-3 px-3">
                        <input type="checkbox" className="w-4 h-4 accent-emerald-500" />
                      </td>
                    </tr>
                    {group.expanded && group.items.map(item => (
                      <tr key={item} className="border-b border-zinc-800/50">
                        <td className="py-2 px-3"></td>
                        <td className="py-2 px-3 text-zinc-300">{item}</td>
                        <td className="py-2 px-3">
                          <button className="border border-zinc-600 text-zinc-300 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-emerald-500 hover:text-emerald-400">
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-zinc-400">
            <span>Showing 1 to 1 of 1 entries</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">←</button>
              <button className="px-2 py-1 bg-emerald-600 text-white rounded">1</button>
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
