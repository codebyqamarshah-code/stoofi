'use client';

import { useState, useEffect } from 'react';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { fetchCmsSection, mutateCmsSection } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  Search,
  Trash2,
  Edit3,
  Plus,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';

export default function DonorPage() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCmsSection('donor', []);
      setDonors(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setPurpose('');
    setEmail('');
    setPhone('');
  };

  const handleSave = async () => {
    if (!name.trim() || !amount.trim()) return alert('Please enter Donor Name and Amount');
    const formattedAmount = amount.trim().startsWith('$') || amount.trim().startsWith('PKR') ? amount.trim() : `$${amount.trim()}`;
    const payload = {
      id: editingId || `donor-${Date.now()}`,
      name: name.trim(),
      amount: formattedAmount,
      purpose: purpose.trim() || 'General Education Support',
      email: email.trim() || '—',
      phone: phone.trim() || '—'
    };
    const res = await mutateCmsSection('donor', editingId ? 'updateItem' : 'addItem', {
      id: editingId,
      item: payload
    });
    if (res.success) {
      setDonors(Array.isArray(res.data) ? res.data : []);
      showToast(editingId ? 'Donor updated!' : 'Donor recorded!');
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setAmount(String(item.amount || '').replace(/^\$/, ''));
    setPurpose(item.purpose || '');
    setEmail(item.email === '—' ? '' : item.email || '');
    setPhone(item.phone === '—' ? '' : item.phone || '');
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('donor', 'deleteItem', { id });
    if (res.success) {
      setDonors(Array.isArray(res.data) ? res.data : []);
      showToast('Donor deleted.');
    }
  };

  const filtered = donors.filter(
    (d) =>
      (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.purpose || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">Donor</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-[#009966]" /> Endowment & Scholarship Donors
          </h1>
        </div>
        {toast && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              {editingId ? 'Edit Donor' : 'Add Donor'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-bold text-rose-600 hover:underline">
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">DONOR NAME *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Al-Khidmat Education Trust"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">DONATION AMOUNT *</label>
            <input
              type="text"
              placeholder="e.g. $5,000 or PKR 500,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">PURPOSE / PROJECT</label>
            <input
              type="text"
              placeholder="e.g. STEM Lab & Merit Scholarships"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="donor@org.com"
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#009966]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">PHONE</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 0000000"
                className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#009966]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-[#009966] hover:bg-[#008055] text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {editingId ? 'UPDATE DONOR' : 'ADD DONOR'}
          </button>
        </div>

        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Donor List ({filtered.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search donors..."
                  className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-32"
                />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">SL</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Donor Name</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Amount</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Purpose</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Contact</th>
                  <th className="text-right py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500 text-sm">
                      Loading donors...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500 text-sm">
                      No donors recorded yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-4 text-zinc-950 font-bold">{idx + 1}</td>
                      <td className="py-3 px-4 text-zinc-950 font-bold">{item.name}</td>
                      <td className="py-3 px-4 text-emerald-700 font-black">{item.amount}</td>
                      <td className="py-3 px-4 text-zinc-900 font-medium">{item.purpose}</td>
                      <td className="py-3 px-4 text-zinc-700 text-xs">
                        <div>{item.email}</div>
                        <div className="text-zinc-500">{item.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
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
    </div>
  );
}
