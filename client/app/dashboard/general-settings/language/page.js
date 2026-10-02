'use client';
import { useState } from 'react';
import { ChevronRight, Search, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, ChevronDown } from 'lucide-react';
import api from '@/services/api';

const LANGUAGES = [
  { sl: 1, name: 'Afrikaans', code: 'af', native: 'Afrikaans', alignment: 'LTL' },
  { sl: 2, name: 'Amharic', code: 'am', native: 'አማርኛ', alignment: 'LTL' },
  { sl: 3, name: 'Arabic', code: 'ar', native: 'العربية', alignment: 'RTL' },
  { sl: 4, name: 'Aymara', code: 'ay', native: 'Aymar', alignment: 'LTL' },
  { sl: 5, name: 'Azerbaijani', code: 'az', native: 'Azərbaycanca / آذربايجان', alignment: 'LTL' },
  { sl: 6, name: 'Belarusian', code: 'be', native: 'Беларуская', alignment: 'LTL' },
  { sl: 7, name: 'Bulgarian', code: 'bg', native: 'Български', alignment: 'LTL' },
  { sl: 8, name: 'Bislama', code: 'bi', native: 'Bislama', alignment: 'LTL' },
  { sl: 9, name: 'Bengali', code: 'bn', native: 'বাংলা', alignment: 'LTL' },
  { sl: 10, name: 'Bosnian', code: 'bs', native: 'Bosanski', alignment: 'LTL' },
];

export default function LanguagePage() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [native, setNative] = useState('');
  const [alignment, setAlignment] = useState('LTL');
  const [search, setSearch] = useState('');
  const [languages, setLanguages] = useState(LANGUAGES);
  const [loading, setLoading] = useState(false);

  const filtered = languages.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!name || !code || !native) return alert('Please fill all required fields');
    setLoading(true);
    try {
      await api.post('/language', { name, code, native, alignment });
      setLanguages(prev => [...prev, { sl: prev.length + 1, name, code, native, alignment }]);
      setName(''); setCode(''); setNative(''); setAlignment('LTL');
    } catch {
      setLanguages(prev => [...prev, { sl: prev.length + 1, name, code, native, alignment }]);
      setName(''); setCode(''); setNative(''); setAlignment('LTL');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span><ChevronRight className="w-3 h-3" />
        <span>System Settings</span><ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">Language</span>
      </div>
      <h1 className="text-xl font-bold text-zinc-950 mb-6">Language</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-950">Add Language</h2>
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">NAME *</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">CODE *</label>
            <input value={code} onChange={e => setCode(e.target.value)} className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">NATIVE *</label>
            <input value={native} onChange={e => setNative(e.target.value)} className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">TEXT ALIGNMENT *</label>
            <select value={alignment} onChange={e => setAlignment(e.target.value)} className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600">
              <option value="LTL">LTL</option>
              <option value="RTL">RTL</option>
            </select>
          </div>
          <button onClick={handleSave} disabled={loading} className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold text-sm py-2 rounded">
            ✓ SAVE LANGUAGE
          </button>
        </div>

        {/* Language List */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-950">Language List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-200 rounded px-2 py-1">
                <Search className="w-3 h-3 text-zinc-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH" className="bg-transparent text-xs text-zinc-950 outline-none w-28" />
              </div>
              <div className="flex gap-1">
                {[Copy, FileSpreadsheet, FileText, Printer, Download, Columns].map((Icon, i) => (
                  <button key={i} className="p-1 text-zinc-400 hover:text-zinc-500"><Icon className="w-4 h-4" /></button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ SL</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Name</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Code</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Native</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Text Alignment</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lang => (
                  <tr key={lang.sl} className="border-b border-zinc-200/50 hover:bg-zinc-100">
                    <td className="py-2 px-3 text-zinc-600 font-medium">{lang.sl}</td>
                    <td className="py-2 px-3 text-zinc-200">{lang.name}</td>
                    <td className="py-2 px-3 text-zinc-700">{lang.code}</td>
                    <td className="py-2 px-3 text-zinc-950">{lang.native}</td>
                    <td className="py-2 px-3 text-zinc-950">{lang.alignment}</td>
                    <td className="py-2 px-3">
                      <button className="border border-zinc-600 text-zinc-950 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500">
                        SELECT <ChevronDown className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-zinc-400">
            <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">←</button>
              <button className="px-2 py-1 bg-zinc-800 text-zinc-950 rounded">1</button>
              <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
