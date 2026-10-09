'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { useState } from 'react';
import { 
  ChevronRight, 
  Search, 
  Copy, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  Columns, 
  ChevronDown,
  Trash2,
  Plus,
  GripVertical
} from 'lucide-react';

const INITIAL_DONORS = [
  { id: 1, name: 'Tariq Mehmood', amount: '$5,000', purpose: 'Computer Lab Equipment', email: 'tariq.m@gmail.com', phone: '+92 301 5551234' },
  { id: 2, name: 'Ayesha Khan Foundation', amount: '$10,000', purpose: 'Scholarship Fund for Girls', email: 'ayesha.fdn@org.pk', phone: '+92 321 4447890' }
];

export default function DonorPage() {
  const [donors, setDonors] = useState(INITIAL_DONORS);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleAdd = () => {
    if (!name || !amount) return alert('Please enter Donor Name and Amount');
    const newDonor = {
      id: Date.now(),
      name,
      amount: amount.startsWith('$') ? amount : `$${amount}`,
      purpose: purpose || 'General Education Support',
      email: email || 'donor@charity.org',
      phone: phone || '+92 300 0000000'
    };
    setDonors(prev => [...prev, newDonor]);
    setName('');
    setAmount('');
    setPurpose('');
    setEmail('');
    setPhone('');
  };

  const handleDelete = (id) => {
    setDonors(prev => prev.filter(d => d.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = donors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.purpose.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">Donor</span>
      </div>

      <h1 className="text-xl font-bold text-zinc-950">Donor</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-950">Add Donor</h2>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">DONOR NAME *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">DONATION AMOUNT ($) *</label>
            <input
              type="number"
              placeholder="5000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">PURPOSE / PROJECT</label>
            <input
              type="text"
              placeholder="e.g. Library Books"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">PHONE NUMBER</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold text-sm py-2 rounded flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> ADD DONOR
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-950">Donor List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-200 rounded px-2 py-1">
                <Search className="w-3 h-3 text-zinc-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH"
                  className="bg-transparent text-xs text-zinc-950 outline-none w-28"
                />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ SL</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Donor Name</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Amount</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Purpose</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Email</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 text-sm">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id} className="border-b border-zinc-200/50 hover:bg-zinc-100">
                      <td className="py-3 px-3 text-zinc-700">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab" />
                          <span className="text-zinc-600 font-medium">{idx + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-200 font-medium">{item.name}</td>
                      <td className="py-3 px-3 text-zinc-500 font-semibold">{item.amount}</td>
                      <td className="py-3 px-3 text-zinc-950">{item.purpose}</td>
                      <td className="py-3 px-3 text-zinc-700 text-xs">{item.email}</td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                            className="border border-zinc-600 text-zinc-950 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500 cursor-pointer"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === item.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-white border border-zinc-200 shadow-xs rounded-lg shadow-xl z-20 py-1">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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