'use client';

import { useState, useEffect } from 'react';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { fetchCmsSection, mutateCmsSection } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  Search,
  Trash2,
  Mail,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';

export default function ContactMessagePage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCmsSection('contactMessage', []);
      setMessages(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Resolved' ? 'Pending' : 'Resolved';
    const res = await mutateCmsSection('contactMessage', 'updateItem', {
      id: item.id,
      item: { ...item, status: nextStatus }
    });
    if (res.success) {
      setMessages(Array.isArray(res.data) ? res.data : []);
      showToast(`Inquiry marked as ${nextStatus}`);
    }
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('contactMessage', 'deleteItem', { id });
    if (res.success) {
      setMessages(Array.isArray(res.data) ? res.data : []);
      showToast('Message deleted.');
    }
  };

  const filtered = messages.filter(
    (m) =>
      (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.subject || '').toLowerCase().includes(search.toLowerCase())
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
            <span className="text-zinc-950 font-bold">Contact Message</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#009966]" /> Website Contact Messages & Inquiries
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Inquiries submitted from the public Home Page contact section appear here in real time.
          </p>
        </div>
        {toast && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
          </span>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Contact Messages ({filtered.length})
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inquiries..."
                className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-36"
              />
            </div>
            <TableExportToolbar />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Sender</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Subject</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Message</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Status</th>
                <th className="text-right py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                    Loading contact messages...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                    No contact inquiries received yet. Visitors can submit inquiries from the Home Page Contact section.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-zinc-50/80">
                    <td className="py-3 px-4">
                      <div className="text-zinc-950 font-bold">{item.name}</div>
                      <div className="text-xs text-zinc-600">{item.email}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-950 font-semibold">{item.subject}</td>
                    <td className="py-3 px-4 text-zinc-700 max-w-xs truncate">{item.message}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer ${
                          item.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status || 'Pending'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedMessage(item)}
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                          title="Delete"
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

      {/* View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-base font-black text-zinc-950">Inquiry Details</h3>
              <button onClick={() => setSelectedMessage(null)} className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-zinc-600 font-bold">From:</span>{' '}
                <span className="text-zinc-950 font-bold">{selectedMessage.name}</span> ({selectedMessage.email})
              </p>
              <p>
                <span className="text-zinc-600 font-bold">Subject:</span>{' '}
                <span className="text-zinc-950 font-bold">{selectedMessage.subject}</span>
              </p>
              <div className="mt-3 p-4 bg-zinc-50 rounded-xl text-zinc-900 font-medium leading-relaxed border border-zinc-200">
                {selectedMessage.message}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Inquiry')}`}
                className="bg-[#009966] hover:bg-[#008055] text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Reply via Email
              </a>
              <button
                onClick={() => setSelectedMessage(null)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
