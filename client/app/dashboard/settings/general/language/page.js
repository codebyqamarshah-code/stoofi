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
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-4">
        <span>Dashboard</span><ChevronRight className="w-3.5 h-3.5" />
        <span>System Settings</span><ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Language Setup</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Language Setup</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-4 h-fit">
          <h2 className="text-sm font-bold text-zinc-950">Add Language</h2>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1.5">NAME *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. French" className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1.5">CODE *</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. fr" className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1.5">NATIVE *</label>
            <input value={native} onChange={e => setNative(e.target.value)} placeholder="e.g. Français" className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1.5">TEXT ALIGNMENT *</label>
            <select value={alignment} onChange={e => setAlignment(e.target.value)} className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600">
              <option value="LTL">Left-to-Right (LTR)</option>
              <option value="RTL">Right-to-Left (RTL)</option>
            </select>
          </div>
          <button onClick={handleSave} disabled={loading} className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer">
            ✓ SAVE LANGUAGE
          </button>
        </div>

        {/* Language List */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-zinc-950">Language List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-300 rounded-lg px-2.5 py-1 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH..." className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-28 placeholder-zinc-400" />
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
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">SL</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">Name</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">Code</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">Native</th>
                  <th className="text-left py-2.5 px-3 text-zinc-700 font-bold text-xs">Text Alignment</th>
                  <th className="text-right py-2.5 px-3 text-zinc-700 font-bold text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-900">
                {filtered.map(lang => (
                  <tr key={lang.sl} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-3 text-zinc-600 font-semibold">{lang.sl}</td>
                    <td className="py-3 px-3 font-bold text-zinc-950">{lang.name}</td>
                    <td className="py-3 px-3 text-zinc-700 font-mono text-xs">{lang.code}</td>
                    <td className="py-3 px-3 text-zinc-800 font-medium">{lang.native}</td>
                    <td className="py-3 px-3 text-zinc-700">{lang.alignment}</td>
                    <td className="py-3 px-3 text-right">
                      <button className="border border-zinc-300 text-zinc-800 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-zinc-100 transition-colors ml-auto cursor-pointer">
                        SELECT <ChevronDown className="w-3 h-3 text-zinc-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs font-semibold text-zinc-600">
            <span>Showing {filtered.length} entries</span>
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
